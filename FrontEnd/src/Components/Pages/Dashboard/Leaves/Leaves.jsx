import React from 'react';
import './Leaves.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const Leaves = () => {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Leaves Dashboard</h1>
                <ThemeToggle />
            </header>
            <div className="page-content">
                <p>Manage and review employee leave requests and balances.</p>
            </div>
        </div>
    );
};

export default Leaves;
