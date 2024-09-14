const express = require("express");
const bcrypt = require("bcrypt");
const pg = require("pg");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(
  cors({
    origin: "http://localhost:3000", // Allow your frontend domain
    credentials: true, // Allow cookies to be sent
  })
);

const port = process.env.PORT || 4000;

const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

app.use(express.json());
app.use(cookieParser());

// Registration
app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, phonenumber, email, password } = req.body;
    const existingEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ message: "Email is already in use." });
    }
    const existingPhonenumber = await pool.query(
      "SELECT * FROM users WHERE phonenumber = $1",
      [phonenumber]
    );

    if (existingPhonenumber.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Phone number is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (firstname,lastname,phonenumber, email, password) VALUES ($1, $2, $3,$4,$5) RETURNING *",
      [firstname, lastname, phonenumber, email, hashedPassword]
    );
    const user = result.rows[0];

    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(`Server Error ${error.message}`);
  }
});

//login
const generateAccessToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
    expiresIn: "1h", // Short-lived access token
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.REFRESH_SECRET_KEY, {
    expiresIn: "7d", // Long-lived refresh token
  });
};

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store the refresh token securely in the database
    await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      user.id,
    ]);

    // Send refresh token in HTTP-only cookie and access token in response
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Protects against XSS
      secure: process.env.NODE_ENV === "production", // Use only over HTTPS in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).send(`Server Error ${error.message}`);
  }
});
// Refresh token route
app.post("/token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      decoded.userId,
    ]);

    const user = result.rows[0];
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

function verifyToken(req, res, next) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Token verfication failed", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
}
app.get("/userinfo", verifyToken, (req, res) => {
  res.json({ user: req.user });
});
app.listen(port, () => console.log(`Server is running on port ${port}`));
