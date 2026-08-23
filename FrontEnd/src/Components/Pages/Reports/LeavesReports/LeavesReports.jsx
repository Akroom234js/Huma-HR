
import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import ReportPdfPreview from "../components/ReportPdfPreview/ReportPdfPreview";
import './LeavesReports.css';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';

const LeavesReports = () => {
    const { t } = useTranslation("Reports/LeavesReports");
    const [showPreview, setShowPreview] = useState(false);

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter Parameters State
    const [month, setMonth] = useState(null);
    const [year, setYear] = useState(null);

    useEffect(() => {
        const fetchLeavesReport = async () => {
            try {
                setLoading(true);
                setError(null);

                const currentDate = new Date();
                const selectedMonth = month || (currentDate.getMonth() + 1);
                const selectedYear = year || currentDate.getFullYear();

                const res = await apiClient.get('/reports/leaves', { 
                    params: { 
                        month: selectedMonth, 
                        year: selectedYear 
                    } 
                });

                const result = res.data;
console.log("Leaves Report API Response:", result);
                if (result && result.status === 'success' && result.data) {
                    setReportData(result.data);
                }
            } catch (err) {
                console.error("Failed fetching leaves report:", err);
                if (err.response?.status === 403) {
                    setError(t('unauthorized') || 'This action is unauthorized (HR Only).');
                } else if (err.response?.status === 422) {
                    setError(t('invalidParameters') || 'Invalid month or year parameter.');
                } else {
                    setError(t('error') || 'Failed to fetch report data.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLeavesReport();
    }, [month, year, t]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('loading')}</div>;
    if (error) return <div className="error-message" style={{ padding: '20px', color: 'red', textAlign: 'center' }}>{error}</div>;

    const summary = reportData?.summary || {};
    const statusPct = reportData?.status_percentages || {};
    const breakdown = reportData?.breakdown_by_type || [];
    const keyIndicators = reportData?.key_indicators || {};
    const topEmployees = reportData?.top_employees || [];

    const inf = [
        { title: t("Approved"), color: "#22c55e", pct: statusPct.approved_pct || "0%", count: summary.approved || 0 },
        { title: t("Pending"), color: "#f59e0b", pct: statusPct.pending_pct || "0%", count: summary.pending || 0 },
        { title: t("Rejected"), color: "#ef4444", pct: statusPct.rejected_pct || "0%", count: summary.rejected || 0 }
    ];

    const reportConfig = {
        title: t("LeavesReports"),
        summary: "This report provides a detailed breakdown of employee leave activity, including submission status, leave types, and key indicators like average duration and approval rates.",
        kpis: [
            { label: t("submitted"), value: String(summary.total_submitted || 0) },
            { label: t("approved"), value: String(summary.approved || 0) },
            { label: t("pending"), value: String(summary.pending || 0) },
            { label: t("rejected"), value: String(summary.rejected || 0) },
        ],
        sections: [
            {
                title: t("leavestatus"),
                content: (
                    <div style={{ padding: '10px 0' }}>
                        {inf.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>
                                    <span>{item.title}</span>
                                    <span>{item.pct} ({item.count})</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: item.color, width: item.pct }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            },
            {
                title: t("Breakdown"),
                content: (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {breakdown.map((item, idx) => (
                            <div key={idx} className="pdf-stat-box">
                                <p style={{ margin: '5px 0', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.type}:</span> <strong>{item.count} ({item.percentage})</strong>
                                </p>
                            </div>
                        ))}
                    </div>
                )
            },
            {
                title: t("key"),
                content: (
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t("Average")}</p>
                            <p style={{ fontSize: '18px', fontWeight: '800' }}>{keyIndicators.avg_duration_days || 0} {t("days")}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{t("rate")}</p>
                            <p style={{ fontSize: '18px', fontWeight: '800', color: '#3b82f6' }}>{keyIndicators.approval_rate || '0%'}</p>
                        </div>
                    </div>
                )
            }
        ],
        filename: "Leaves_Report.pdf"
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
                    title={t("LeavesReports")} 
                    Explanation={t("Detailed")}
                    actions={
                        <button className="emp-export-btn" onClick={() => setShowPreview(true)}>
                            <i className="bi bi-file-earmark-arrow-down" /> Export PDF
                        </button>
                    }
                />
                <ReportsNavbar />
                
                <FilterBar onFilterChange={(m, y) => { setMonth(m); setYear(y); }} />

                <div className='leave-reports-co'>
                    <div className='leave-reports'>
                        <h5>{t("leaveactivity")}</h5>
                        <div className='daily-attendance'>
                            <p>{t("submitted")}</p>
                            <p>{summary.total_submitted || 0}</p>
                        </div>
                        <div className='daily-attendance'>
                            <p>{t("approved")}</p>
                            <p className='green'>{summary.approved || 0}</p>
                        </div>
                        <div className='daily-attendance'>
                            <p>{t("pending")}</p>
                            <p className='orangered'>{summary.pending || 0}</p>
                        </div>
                        <div className='daily-attendance daily-attendance-border'>
                            <p>{t("rejected")}</p>
                            <p className='red'>{summary.rejected || 0}</p>
                        </div>
                    </div>

                    <div className='leave-reports'>
                        <h5>{t("leavestatus")}</h5>
                        <div className='inf-mar'>
                            {inf.map((item, i) => (
                                <div className='info-mar' key={i}>
                                    <div className='daily-attendance daily-attendance-border'>
                                        <p>{item.title}</p>
                                        <p>{item.pct} ({item.count})</p>
                                    </div>
                                    <div className='Approved-inf-bg' style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                                        <div style={{ width: item.pct, backgroundColor: item.color, height: '100%', transition: 'width 0.3s ease' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='leave-reports'>
                        <h5>{t("Breakdown")}</h5>
                        {breakdown.length === 0 ? (
                            <p style={{ padding: '10px', color: '#64748b' }}>No data available</p>
                        ) : (
                            breakdown.map((item, index) => (
                                <div 
                                    key={index} 
                                    className={`daily-attendance ${index === breakdown.length - 1 ? 'daily-attendance-border' : ''}`}
                                >
                                    <p>{item.type}</p>
                                    <p>{item.count} ({item.percentage})</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className='leave-reports'>
                        <h5>{t("key")}</h5>
                        <div className='daily-attendance'>
                            <p>{t("Average")}</p>
                            <p>{keyIndicators.avg_duration_days || 0} {t("days")}</p>
                        </div>
                        <div className='daily-attendance'>
                            <p>{t("rate")}</p>
                            <p className='blue'>{keyIndicators.approval_rate || '0%'}</p>
                        </div>
                        <div className='daily-attendance-border'>
                            <p className='gray' style={{ marginTop: '10px', fontWeight: 'bold' }}>{t("Employees")}</p>
                            <div className='highest-leave-days'>
                                {topEmployees.length === 0 ? (
                                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>No employees data</p>
                                ) : (
                                    topEmployees.map((emp, index) => (
                                        <div key={index} className='daily-attendance daily-attendance-border'>
                                            <p>{emp.name}</p>
                                            <p>{emp.days} {t("days")}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LeavesReports;