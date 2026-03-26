import React from 'react';
import { NavLink } from 'react-router-dom';
import './ReportsNavbar.css';

const ReportsNavbar = () => {
    return (
        <nav className="reports-navbar">
            <NavLink to="/reports/payroll" className={({ isActive }) => isActive ? 'active' : ''}>Payroll Reports</NavLink>
            <NavLink to="/reports/performance" className={({ isActive }) => isActive ? 'active' : ''}>Performance Reports</NavLink>
            <NavLink to="/reports/leaves" className={({ isActive }) => isActive ? 'active' : ''}>Leaves Reports</NavLink>
            <NavLink to="/reports/attendance" className={({ isActive }) => isActive ? 'active' : ''}>Attendance Tracking</NavLink>
            <NavLink to="/reports/employees" className={({ isActive }) => isActive ? 'active' : ''}>Employee Reports</NavLink>
        </nav>
    );
};

export default ReportsNavbar;
