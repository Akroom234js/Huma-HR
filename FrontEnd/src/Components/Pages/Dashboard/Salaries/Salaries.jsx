import React from 'react';
import './Salaries.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const Salaries = () => {
    return (
        <div className="sa-page">
            <div className="sa-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <header className="sa-header">
                <h1 className="sa-title">Salaries Dashboard</h1>
            </header>
            <div className="sa-content">
                <p>Overview of payroll and salary distributions.</p>
            </div>
        </div>
    );
};

export default Salaries;
