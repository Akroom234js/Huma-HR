import React from 'react';
import './EmployeePortal.css'; // I'll create this file for common portal styles

const EmployeeDashboard = () => {
    return (
        <div className="portal-page">
            <header className="page-header">
                <h1>Welcome, Test Employee</h1>
                <p>Here's what's happening today.</p>
            </header>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Leave Balance</h3>
                    <div className="value">14 Days</div>
                    <div className="trend">Annual leave remaining</div>
                </div>
                <div className="stat-card">
                    <h3>Current Salary</h3>
                    <div className="value">$4,500</div>
                    <div className="trend">Next payday in 12 days</div>
                </div>
                <div className="stat-card">
                    <h3>Attendance</h3>
                    <div className="value">98%</div>
                    <div className="trend">This month's rate</div>
                </div>
            </div>

            <div className="recent-activity">
                <h2>Recent Requests</h2>
                <div className="activity-list">
                    <p>No recent activity found.</p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
