import React from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import './PayrollReports.css';

const PayrollReports = () => {
    return (
        <div className="reports-page">
            <PageHeader title="Payroll Reports" />
            <ReportsNavbar />
            <FilterBar />
            <div className="reports-content">
                {/* Payroll reports content will go here */}
            </div>
        </div>
    );
};

export default PayrollReports;
