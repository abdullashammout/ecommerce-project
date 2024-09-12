"use client";

import React, { useState } from "react";
import TextField from "../../../components/TextField/TextField";
import Button from "../../../components/Button/Button";
import styles from "../../styles/signup.module.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          phonenumber,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        console.log("Signup successful!");
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="container">
      <div className={styles.loginContainer}>
        <header className={styles.loginHeader}>
          <img src="/logo.png" alt="MySooq Logo" className={styles.logo} />
          <h1>Welcome to BII Shop</h1>
          <p>Your favorite place to shop online.</p>
        </header>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <TextField
              label="First Name"
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              id="firstname"
            />
            <TextField
              label="Last Name"
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              id="lastname"
            />
          </div>

          <div className={styles.formGroup}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
            />
            <TextField
              label="Phone Number"
              type="tel"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              id="phonenumber"
            />
          </div>

          <div className={styles.formGroup}>
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="confirmPassword"
            />
          </div>

          <Button type="submit">Sign Up</Button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
