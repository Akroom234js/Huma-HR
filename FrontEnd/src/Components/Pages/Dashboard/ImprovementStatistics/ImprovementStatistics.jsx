import React from 'react';
import './ImprovementStatistics.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const ImprovementStatistics = () => {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Improvement Statistics</h1>
                <ThemeToggle />
            </header>
            <div className="page-content">
                <p>Track growth and improvement trends across teams.</p>
            </div>
        </div>
    );
};

export default ImprovementStatistics;
