// src/components/TextField/TextField.js

import React from "react";
import styles from "./TextField.module.css";

const TextField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  id,
  inputMode,
}) => {
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
        placeholder={placeholder} /* Label text moved into placeholder */
        className={styles.input}
        required
        inputMode={inputMode}
      />
    </div>
  );
};

export default TextField;
