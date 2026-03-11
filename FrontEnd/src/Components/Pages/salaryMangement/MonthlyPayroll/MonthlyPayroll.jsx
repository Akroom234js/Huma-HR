import React from 'react';
import './MonthlyPayroll.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const MonthlyPayroll = () => {
    return (
        <div className="sm-page">
            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <header className="sm-header">
                <h1 className="sm-title">Monthly Payroll</h1>
                <p className="sm-subtitle">Process and view monthly payroll details.</p>
            </header>
            <div className="sm-content">
                <p>Content for Monthly Payroll will be added here.</p>
            </div>
        </div>
    );
};

export default MonthlyPayroll;
