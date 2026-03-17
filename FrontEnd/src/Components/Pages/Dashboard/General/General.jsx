import React from 'react';
import './General.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const General = () => {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>General Dashboard</h1>
                <ThemeToggle />
            </header>
            <div className="page-content">
                <p>Welcome to the General Dashboard overview.</p>
            </div>
        </div>
    );
};

export default General;
