import React from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import './AttendanceTracking.css';

const AttendanceTracking = () => {
    return (
        <div className="reports-page">
            <PageHeader title="Attendance Tracking" />
            <ReportsNavbar />
            <FilterBar />
            <div className="reports-content">
                {/* Attendance tracking content will go here */}
            </div>
        </div>
    );
};

export default AttendanceTracking;
