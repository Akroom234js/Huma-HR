import React from "react";
import ThemeToggle from "../../../../ThemeToggle/ThemeToggle";
import "./PageHeader.css";

const PageHeader = ({ title, Explanation, actions }) => {
  return (
    <div className="reports-page-header-container">
      {/* Theme Toggle moved to fixed corner of the screen */}
      <div className="reports-screen-corner-toggle">
        <ThemeToggle />
      </div>

      <div className="reports-header-top-row">
        <header className="page-header reports">
          <h1>{title}</h1>
          <p>{Explanation}</p>
        </header>

        {actions && (
          <div className="reports-header-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
