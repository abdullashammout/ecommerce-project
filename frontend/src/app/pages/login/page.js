// src/components/Login/Login.js
"use client";

import React, { useEffect, useState } from "react";
import TextField from "../../../components/TextField/TextField";
import Button from "../../../components/Button/Button";
import styles from "../../styles/login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
const jwt_decode = require("jwt-decode");

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const validateToken = async () => {
      const isValid = await checkTokenExpiry();
      if (!isValid) {
        router.push("/pages/login");
      }
    };
    validateToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Allow sending cookies
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("Login response:", data); // Log the entire response

      if (res.ok) {
        console.log("Token received:", data.accessToken); // Debugging statement

        const decodedToken = jwt_decode.jwtDecode(data.accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token has expired, force re-login
          router.push("/pages/login");
        } else {
          sessionStorage.setItem("token", data.accessToken);
          router.push("/pages/home");
        }
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error("Error logging in", error);
    }
  };
  const checkTokenExpiry = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return false;

    const decoded = jwt_decode.jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      // Token is expired, request a new access token using the refresh token
      try {
        const res = await fetch("http://localhost:4000/token", {
          method: "POST",
          credentials: "include", // Important to include cookies
        });
        const data = await res.json();

        if (res.ok) {
          sessionStorage.setItem("token", data.accessToken);
          return true; // Token refreshed successfully
        } else {
          router.push("/pages/login"); // Redirect to login if refresh failed
        }
      } catch (error) {
        console.error("Token refresh error", error);
        router.push("/pages/login");
      }
    } else {
      return true; // Token is still valid
    }
  };

  return (
    <div className={styles.loginContainer}>
      <header className={styles.loginHeader}>
        <img src="/logo.png" alt="MySooq Logo" className={styles.logo} />
        <h1>Welcome to BII Shop</h1>
        <p>Your favorite place to shop online.</p>
      </header>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
        />
        <Button type="submit">Login</Button>
      </form>
      <a href="#" className={styles.forgotPassword}>
        Forgot Password?
      </a>
      <div className={styles.signupPrompt}>
        <p>Don't have an account?</p>
        <Link href="/pages/signup">Register now!</Link>
      </div>
    </div>
  );
};

export default Login;
