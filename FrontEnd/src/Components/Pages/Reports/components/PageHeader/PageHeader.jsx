import React from "react";
import ThemeToggle from "../../../../ThemeToggle/ThemeToggle";
import "./PageHeader.css";
const PageHeader = ({ title, Explanation, actions }) => {
  return (
    <div className="reports-page-header-container">
      <div className="reports-header-actions">
        {actions}
        <div className="reports-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>
      <header className="page-header reports">
        <h1>{title}</h1>
        <p>{Explanation}</p>
      </header>
    </div>
  );
};

export default PageHeader;
