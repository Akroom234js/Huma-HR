import React from 'react';
import './PayrollOverview.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const PayrollOverview = () => {
    return (
        <div className="sm-page">
            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <header className="sm-header">
                <h1 className="sm-title">Payroll Overview</h1>
                <p className="sm-subtitle">Manage and view your payroll overview here.</p>
            </header>
            <div className="sm-content">
                <p>Content for Payroll Overview will be added here.</p>
            </div>
        </div>
    );
};

export default PayrollOverview;
