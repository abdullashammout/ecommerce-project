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
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const validateToken = async () => {
      const isValid = await checkTokenExpiry();
      if (!isValid) {
        router.replace("/pages/login");
      }
    };
    validateToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Frontend validation before sending request to backend
    if (!validateForm()) {
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Allow sending cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const decodedToken = jwt_decode.jwtDecode(data.accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          router.push("/pages/login");
        } else {
          sessionStorage.setItem("token", data.accessToken);
          router.push("/pages/home");
        }
      } else {
        switch (res.status) {
          case 400:
            setError("Invalid email or password");
            break;
          case 401:
            setError("Unauthorized. Please check your email and password.");
            break;
          case 403:
            setError("Forbidden. You may not have access to this resource.");
            break;
          case 500:
            setError("Server error. Please try again later.");
            break;
          default:
            setError("An unexpected error occurred. Please try again.");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again."); // General error message
    }
  };
  const validateForm = () => {
    if (!email) {
      setError("Email is required.");
      return false;
    }
    // Simple email regex pattern for validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Password is required.");
      return false;
    }

    setError(""); // Clear any errors if validation passes
    return true;
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
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          id="email"
        />

        <TextField
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          id="password"
        />
        <Button type="submit">Login</Button>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </form>
      <a href="/pages/forgetPassword" className={styles.forgotPassword}>
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
