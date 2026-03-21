import React from 'react';
import './Salaries.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const Salaries = () => {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Salaries Dashboard</h1>
                <ThemeToggle />
            </header>
            <div className="page-content">
                <p>Overview of payroll and salary distributions.</p>
            </div>
        </div>
    );
};

export default Salaries;
