import React from 'react';
import './SalaryAdjustments.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const SalaryAdjustments = () => {
    return (
        <div className="sm-page">
            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <header className="sm-header">
                <h1 className="sm-title">Salary Adjustments</h1>
                <p className="sm-subtitle">Review and apply salary adjustments.</p>
            </header>
            <div className="sm-content">
                <p>Content for Salary Adjustments will be added here.</p>
            </div>
        </div>
    );
};

export default SalaryAdjustments;
