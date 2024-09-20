const express = require("express");
const bcrypt = require("bcrypt");
const pg = require("pg");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const crypto = require("crypto"); // For generating tokens
const nodemailer = require("nodemailer");

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

const transporter = nodemailer.createTransport({
  service: "outlook", // You can use other services like "hotmail", "yahoo", etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allows self-signed certificates
  },
});
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists in the database
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString("hex");

    // Token expiry time (1 hour from now)
    const expiryTime = Date.now() + 3600000;

    // Store token and expiry in the database
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [token, expiryTime, email]
    );

    // Create the password reset link
    const resetLink = `http://localhost:3000/pages/resetPassForm?token=${token}`;
    console.log(token);
    // Set up the email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: "Password Reset Request", // Subject line
      html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="${resetLink}">link</a> to reset your password</p>
      `, // html body
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error(`Error sending email: ${error}`);
      }
      console.log(`Email sent: ${info.response}`);
    });

    return res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(`Server Error: ${error.message}`);
  }
});
app.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Check if token exists and is not expired
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > $2",
      [token, Date.now()]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear the reset token
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Server Error: ", error.message);
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

app.get("/userinfo", verifyToken, (req, res) => {
  res.json({ user: req.user });
});
app.listen(port, () => console.log(`Server is running on port ${port}`));
