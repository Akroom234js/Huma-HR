import React from 'react';
import { NavLink } from 'react-router-dom';
import './ReportsNavbar.css';
import { useTranslation } from 'react-i18next';
const ReportsNavbar = () => {
    const {t}=useTranslation("Reports/ReportsNavbar")
    return (
        <nav className="reports-navbar">
            <NavLink to="/reports/payroll" className={({ isActive }) => isActive ? 'active' : ''}>{t("PayrollReports")}</NavLink>
            <NavLink to="/reports/performance" className={({ isActive }) => isActive ? 'active' : ''}>{t("PerformanceReports")}</NavLink>
            <NavLink to="/reports/leaves" className={({ isActive }) => isActive ? 'active' : ''}>{t("LeavesReports")}</NavLink>
            <NavLink to="/reports/attendance" className={({ isActive }) => isActive ? 'active' : ''}>{t("AttendanceTracking")}</NavLink>
            <NavLink to="/reports/employees" className={({ isActive }) => isActive ? 'active' : ''}>{t("EmployeeReports")}</NavLink>
        </nav>
    );
};

export default ReportsNavbar;
