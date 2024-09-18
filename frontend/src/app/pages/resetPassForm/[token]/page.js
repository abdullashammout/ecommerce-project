"use client";
import { useSearchParams } from "next/navigation"; // Make sure this is the correct import
import React, { useState, useEffect } from "react";
import TextField from "../../../../components/TextField/TextField";
import Button from "../../../../components/Button/Button";
import styles from "../../../styles/resetpassword.module.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      setError("Password is required.");
      return false;
    }
    if (!confirmPassword) {
      setError("confirm Password is required.");
      return false;
    }
    //passwords do not match
    if (password != confirmPassword) {
      setError("The passwords do not match.");
      return false;
    }
    //password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    //password conatins
    if (!passwordRegex.test(password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return false;
    }
    if (/\s/.test(password)) {
      setError("Password cannot contain spaces.");
      return false;
    }

    try {
      const res = await fetch(`http://localhost:4000/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password has been successfully reset.");
        setError(""); // Clear previous errors
      } else {
        setError(data.message);
        setSuccess(""); // Clear previous success
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Something went wrong. Please try again.");
    }
  };
  useEffect(() => {
    console.log("Token:", token); // Log the token to debug
  }, [token]);

  return (
    <div className={styles.resetPasswordContainer}>
      <h1 className="h1">Reset Password</h1>
      <form className="form" onSubmit={handleResetPassword}>
        <TextField
          placeholder="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit">Reset Password</Button>
      </form>
      {success && <p className={styles.successMessage}>{success}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default ResetPassword;
