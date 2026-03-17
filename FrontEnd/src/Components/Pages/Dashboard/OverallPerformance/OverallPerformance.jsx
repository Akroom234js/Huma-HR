import React from 'react';
import './OverallPerformance.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const OverallPerformance = () => {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Overall Performance</h1>
                <ThemeToggle />
            </header>
            <div className="page-content">
                <p>Analyze the overall organization-wide performance metrics.</p>
            </div>
        </div>
    );
};

export default OverallPerformance;
