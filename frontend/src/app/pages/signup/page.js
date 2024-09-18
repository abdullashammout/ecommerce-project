"use client";

import React, { useState } from "react";
import TextField from "../../../components/TextField/TextField";
import Button from "../../../components/Button/Button";
import styles from "../../styles/signup.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
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
        sessionStorage.setItem("token", data.accessToken);
        setSuccess("Signup successful! Redirecting to home...");
        setTimeout(() => {
          router.push("/pages/home"); // Redirect to home page after a delay
        }, 2000);
        console.log("Signup successful!");
      } else {
        setError(data.message || "Error occurred during signup.");
        console.error("Error:", data.message);
      }
    } catch (error) {
      setError("Signup error: " + error.message);
      console.error("Signup error:", error);
    }
  };
  const validateForm = () => {
    //email validation---
    //email is not empty
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
    //password validation---
    // password and confirm password is not empty
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
    //phone number validation---

    //phone number is not empty
    if (!phonenumber) {
      setError("phonenumber is required.");
      return false;
    }

    // Remove non-numeric characters (excluding '+') for length check
    const digitsOnly = phonenumber.replace(/\D/g, "");

    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setError("Phone number must be between 7 and 15 digits.");
      return false;
    }
    // first name and last name validation---
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    //  first name-
    if (!firstname) {
      setError("First name is required.");
      return false;
    }
    if (firstname.length < 2 || firstname.length > 50) {
      setError("First name must be between 2 and 50 characters.");
      return false;
    } else if (!nameRegex.test(firstname)) {
      setError(
        "Invalid first name. Only letters, spaces, hyphens, and apostrophes are allowed."
      );
      return false;
    } else if (/[\s]{2,}/.test(firstname)) {
      setError("First name cannot contain consecutive spaces.");
      return false;
    } else if (firstname.trim() !== firstname) {
      setError("First name cannot have leading or trailing spaces.");
      return false;
    }
    // last name-
    if (!lastname) {
      setError("Last name is required.");
      return false;
    }
    if (lastname.length < 2 || lastname.length > 50) {
      setError("Last name must be between 2 and 50 characters.");
      return false;
    } else if (!nameRegex.test(lastname)) {
      setError(
        "Invalid last name. Only letters, spaces, hyphens, and apostrophes are allowed."
      );
      return false;
    } else if (/[\s]{2,}/.test(lastname)) {
      setError("Last name cannot contain consecutive spaces.");
      return false;
    } else if (lastname.trim() !== lastname) {
      setError("Last name cannot have leading or trailing spaces.");
      return false;
    }

    setError(""); // Clear any errors if validation passes
    return true;
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
              placeholder="First Name"
              type="text"
              value={firstname}
              onChange={(e) => {
                setFirstname(e.target.value);
                setError("");
              }}
              id="firstname"
            />
            <TextField
              placeholder="Last Name"
              type="text"
              value={lastname}
              onChange={(e) => {
                setLastname(e.target.value);
                setError("");
              }}
              id="lastname"
            />
          </div>

          <div className={styles.formGroup}>
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
              placeholder="Phone Number"
              type="tel"
              value={phonenumber}
              onChange={(e) => {
                const input = e.target.value;
                // Allow only numeric characters
                const filteredInput = input.replace(/\D/g, "");
                setPhonenumber(filteredInput);
                setError("");
              }}
              id="phonenumber"
            />
          </div>

          <div className={styles.formGroup}>
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
            <TextField
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              id="confirmPassword"
            />
          </div>

          <Button type="submit">Sign Up</Button>
          <div className={styles.signupPrompt}>
            <Link href="/pages/login">already have an account?</Link>
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default SignUp;
