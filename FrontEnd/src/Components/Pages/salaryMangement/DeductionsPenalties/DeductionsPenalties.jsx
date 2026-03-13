import React from "react";
import "./DeductionsPenalties.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";

const DeductionsPenalties = () => {
  return (
    <div className="sm-page">
      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      <header className="sm-header">
        <h1 className="sm-title">Deductions & Penalties</h1>
        <p className="sm-subtitle">Manage employee deductions and penalties.</p>
      </header>
      <div className="sm-content">
        <p>Content for Deductions & Penalties will be added here.</p>
      </div>
    </div>
  );
};

export default DeductionsPenalties;
