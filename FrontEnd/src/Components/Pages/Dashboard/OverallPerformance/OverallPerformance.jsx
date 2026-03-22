import React from 'react';
import './OverallPerformance.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const OverallPerformance = () => {
    return (
        <div className="op-page">
            <div className="op-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <header className="op-header">
                <h1 className="op-title">Overall Performance</h1>
            </header>
            <div className="op-content">
                <p>Analyze the overall organization-wide performance metrics.</p>
            </div>
        </div>
    );
};

export default OverallPerformance;
