import React from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import './EmployeesReports.css';

const EmployeesReports = () => {
    return (
        <div className="reports-page">
            <PageHeader title="Employee Reports" />
            <ReportsNavbar />
            <FilterBar />
            <div className="reports-content">
                {/* Employees reports content will go here */}
            </div>
        </div>
    );
};

export default EmployeesReports;
