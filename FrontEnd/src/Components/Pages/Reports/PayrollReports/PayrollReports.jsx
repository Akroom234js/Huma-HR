import React, { useState } from 'react';
import PageHeader from '../../Reports/components/PageHeader/PageHeader';
import ReportsNavbar from '../../Reports/components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../../Reports/components/FilterBar/FilterBar';
import ReportPdfPreview from "../components/ReportPdfPreview/ReportPdfPreview";

// استيراد المكونات الجديدة
import SummaryCard from './SummaryCard';
import DepartmentCard from './DepartmentCard';

import './PayrollReports.css';

const PayrollReports = () => {
    const [showPreview, setShowPreview] = useState(false);

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

    const reportConfig = {
        title: "Payroll & Cost Reports",
        summary: "Detailed analysis of salary distribution, cost breakdowns, and financial indicators for the current period. This report highlights the organization's fiscal health regarding human resources expenditures.",
        kpis: overviewData.map(item => ({ label: item.label, value: item.value })),
        sections: [
            {
                title: "Key Cost Indicators",
                content: (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {indicatorData.map((item, idx) => (
                            <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>{item.label}</span>
                                <p style={{ fontSize: '16px', fontWeight: '800', margin: '4px 0 0' }}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                )
            },
            {
                title: "Cost Breakdown by Department",
                content: (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: '10px 5px', fontSize: '12px', color: '#64748b' }}>Department</th>
                                <th style={{ padding: '10px 5px', fontSize: '12px', color: '#64748b' }}>Headcount</th>
                                <th style={{ padding: '10px 5px', fontSize: '12px', color: '#64748b' }}>Total Payroll</th>
                                <th style={{ padding: '10px 5px', fontSize: '12px', color: '#64748b' }}>Avg. Salary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((dept, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                    <td style={{ padding: '10px 5px', fontWeight: '600' }}>{dept.name}</td>
                                    <td style={{ padding: '10px 5px' }}>{dept.headcount}</td>
                                    <td style={{ padding: '10px 5px', fontWeight: '700' }}>{dept.total}</td>
                                    <td style={{ padding: '10px 5px' }}>{dept.avg}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            }
        ],
        filename: "Payroll_Cost_Report.pdf"
    };

    return (
        <>
        <ReportPdfPreview 
            show={showPreview} 
            onClose={() => setShowPreview(false)} 
            {...reportConfig}
        />

        <div className="reports-page">
            <PageHeader
                title="Payroll & Cost Reports"
                subtitle="Detailed analysis of salary distribution, cost breakdowns, and financial indicators."
                actions={
                    <button className="emp-export-btn" onClick={() => setShowPreview(true)}>
                        <i className="bi bi-file-earmark-arrow-down" /> Export PDF
                    </button>
                }
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
        </>
    );
};

export default PayrollReports;