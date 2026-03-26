import React from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import './PerformanceReports.css';

const PerformanceReports = () => {
    return (
        <div className="reports-page">
            <PageHeader title="Performance Reports" />
            <ReportsNavbar />
            <FilterBar />
            <div className="reports-content">
                {/* Performance reports content will go here */}
            </div>
        </div>
    );
};

export default PerformanceReports;
