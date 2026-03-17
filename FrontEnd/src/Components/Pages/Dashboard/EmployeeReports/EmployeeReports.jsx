import React from 'react';
import './EmployeeReports.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const EmployeeReports = () => {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Employee Reports</h1>
                <ThemeToggle />
            </header>
            <div className="page-content">
                <p>View and manage detailed employee reports here.</p>
            </div>
        </div>
    );
};

export default EmployeeReports;
