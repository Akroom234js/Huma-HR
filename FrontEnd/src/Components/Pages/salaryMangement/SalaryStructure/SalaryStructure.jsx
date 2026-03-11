import React from 'react';
import './SalaryStructure.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const SalaryStructure = () => {
    return (
        <div className="sm-page">
            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <header className="sm-header">
                <h1 className="sm-title">Salary Structure</h1>
                <p className="sm-subtitle">View and define the salary structure.</p>
            </header>
            <div className="sm-content">
                <p>Content for Salary Structure will be added here.</p>
            </div>
        </div>
    );
};

export default SalaryStructure;
