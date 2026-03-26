import React from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import './LeavesReports.css';

const LeavesReports = () => {
    return (
        <div className="reports-page">
            <PageHeader title="Leaves Reports" />
            <ReportsNavbar />
            <FilterBar />
            <div className="reports-content">
                {/* Leaves reports content will go here */}
            </div>
        </div>
    );
};

export default LeavesReports;
