// import React from 'react';
import PageHeader from '../../Reports/components/PageHeader/PageHeader';
import ReportsNavbar from '../../Reports/components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../../Reports/components/FilterBar/FilterBar';

// استيراد المكونات الجديدة
import SummaryCard from './SummaryCard';
import DepartmentCard from './DepartmentCard';

import './PayrollReports.css';

const PayrollReports = () => {
    // هذه البيانات هي ما ستجلبها لاحقاً من الـ API
    const overviewData = [
        { label: 'Total Monthly Salary Cost', value: '$1,254,300', icon: 'fa-solid fa-money-bill-wave', color: 'var(--primary-color)' },
        { label: 'Average Salary per Employee', value: '$6,432', icon: 'fa-solid fa-users-gear', color: 'var(--primary-color)' },
        { label: 'Total Overtime Cost', value: '$45,200', icon: 'fa-solid fa-clock', color: 'var(--amber-500)' },
        { label: 'Total Deductions Applied', value: '$32,150', icon: 'fa-solid fa-circle-minus', color: 'var(--red-500)' },
    ];

    const indicatorData = [
        { label: 'Payroll-to-Revenue Ratio', value: '28.5%', icon: 'fa-solid fa-chart-pie' },
        { label: 'Benefit Cost per Employee', value: '$1,150', icon: 'fa-solid fa-shield-halved' },
        { label: 'Cost of New Hires (Period)', value: '$65,000', icon: 'fa-solid fa-user-plus' },
        { label: 'YoY Payroll Cost Growth', value: '+4.2%', icon: 'fa-solid fa-chart-line', isTrend: true },
    ];

    const departments = [
        { name: 'Engineering', total: '$550,000', headcount: 85, avg: '$6,470' },
        { name: 'Marketing', total: '$240,000', headcount: 42, avg: '$5,714' },
        { name: 'Sales', total: '$380,000', headcount: 60, avg: '$6,333' },
        { name: 'Product Design', total: '$125,000', headcount: 18, avg: '$6,944' },
        { name: 'Human Resources', total: '$70,000', headcount: 12, avg: '$5,833' },
        { name: 'Operations & Admin', total: '$108,000', headcount: 24, avg: '$4,500' },
    ];

    return (
        <div className="reports-page">
            <PageHeader
                title="Payroll & Cost Reports"
                subtitle="Detailed analysis of salary distribution, cost breakdowns, and financial indicators."
            />
            <ReportsNavbar />

            <div className="reports-container">
                {/* شبكة الكروت العلوية */}
                <div className="stats-grid-payroll-report">
                    <SummaryCard title="Overview of Payroll Costs (Current Period)" metrics={overviewData} />
                    <SummaryCard title="Key Cost Indicators" metrics={indicatorData} />
                </div>

                {/* قسم توزيع الأقسام */}
                <div className="breakdown-section">
                    <h3 className="section-title">Cost Breakdown by Department</h3>
                    <div className="department-grid">
                        {departments.map((dept, index) => (
                            <DepartmentCard key={index} {...dept} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayrollReports;