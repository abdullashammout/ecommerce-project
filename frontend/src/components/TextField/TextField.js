// src/components/TextField/TextField.js

import React from "react";
import styles from "./TextField.module.css";

const TextField = ({ label, type = "text", value, onChange, id }) => {
  return (
    <div className={styles.textFieldContainer}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={styles.input}
        required
      />
    </div>
  );
};

export default TextField;
