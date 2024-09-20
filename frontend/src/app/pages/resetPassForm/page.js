"use client";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import TextField from "../../../components/TextField/TextField";
import Button from "../../../components/Button/Button";
import styles from "../../styles/resetpassword.module.css";

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

    // Validate form
    if (!password) {
      setError("Password is required.");
      return false;
    }
    if (!confirmPassword) {
      setError("Confirm Password is required.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
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
        setSuccess(
          "Thank you" + "\n" + " Password has been successfully reset."
        );
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

      {/* Conditionally render the form or success message */}
      {success ? (
        <p className={styles.successMessage}>{success}</p>
      ) : (
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
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
          />
          <Button type="submit">Reset Password</Button>
        </form>
      )}

      {/* Display error message if there's an error */}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default ResetPassword;
