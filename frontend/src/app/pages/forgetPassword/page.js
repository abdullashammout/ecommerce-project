"use client";

import React, { useState } from "react";
import TextField from "../../../components/TextField/TextField";
import Button from "../../../components/Button/Button";
import styles from "../../styles/forgotpassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password reset link has been sent to your email.");
        setError(""); // Clear any previous errors
      } else {
        setError(data.message);
        setSuccess(""); // Clear any previous success message
      }
    } catch (err) {
      console.error("Error sending forgot password request:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <h1 className="h1">Forgot Password</h1>
      <p className="p">Enter your email to receive a password reset link.</p>
      <form onSubmit={handleForgotPassword}>
        <TextField
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
            setSuccess("");
          }}
        />
        <Button type="submit">Submit</Button>
      </form>
      {success && <p className={styles.successMessage}>{success}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default ForgotPassword;
