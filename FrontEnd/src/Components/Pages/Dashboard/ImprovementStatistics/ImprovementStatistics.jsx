import React from 'react';
import './ImprovementStatistics.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const ImprovementStatistics = () => {
    return (
        <div className="is-page">
            <div className="is-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <header className="is-header">
                <h1 className="is-title">Improvement Statistics</h1>
            </header>
            <div className="is-content">
                <p>Track growth and improvement trends across teams.</p>
            </div>
        </div>
    );
};

export default ImprovementStatistics;
