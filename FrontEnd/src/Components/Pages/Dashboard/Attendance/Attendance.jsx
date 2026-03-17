import React from 'react';
import './Attendance.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const Attendance = () => {
    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Attendance</h1>
                <ThemeToggle />
            </header>
            <div className="page-content">
                <p>Monitor real-time employee attendance tracking.</p>
            </div>
        </div>
    );
};

export default Attendance;
