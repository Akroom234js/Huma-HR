
import React, { useState, useEffect } from 'react';
import './General.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';

export default function General() {
    const { t, i18n } = useTranslation("Dashboard/GeneralDashboard");
    const isAr = i18n ? i18n.language === 'ar' : false;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({});
    const [comparisonData, setComparisonData] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.get('/dashboard/general');
                const result = response.data;
                console.log("dddddddd",result);

                if (result && (result.status || result.success)) {
                    const apiData = result.data || {};
                    const fetchedStats = apiData.stats || apiData.overall_stats || apiData;
                    
                    setStats({
                        totalEmployees: fetchedStats.total_employees ?? fetchedStats.totalEmployees ?? 0,
                        newThisMonth: fetchedStats.new_this_month ?? fetchedStats.newThisMonth ?? 0,
                        performanceRate: fetchedStats.performance_rate ?? fetchedStats.performanceRate ?? 0,
                        employeesOnLeaveToday: fetchedStats.employees_on_leave_today ?? fetchedStats.employeesOnLeaveToday ?? 0,
                        leaveBreakdown: fetchedStats.leave_breakdown ?? fetchedStats.leaveBreakdown ?? '',
                        overtimeHours: fetchedStats.overtime_hours ?? fetchedStats.overtimeHours ?? 0,
                        overtimeGrowthPercent: fetchedStats.overtime_growth_percent ?? fetchedStats.overtimeGrowthPercent ?? 0,
                        monthlySalaryCost: fetchedStats.monthly_salary_cost ?? fetchedStats.monthlySalaryCost ?? 0,
                        employeesOnLeaveThisMonth: fetchedStats.employees_on_leave_this_month ?? fetchedStats.employeesOnLeaveThisMonth ?? 0,
                        employeesLateToday: fetchedStats.employees_late_today ?? fetchedStats.employeesLateToday ?? 0,
                        avgPerformanceRating: fetchedStats.avg_performance_rating ?? fetchedStats.avgPerformanceRating ?? 0,
                        performanceGrowthQuarter: fetchedStats.performance_growth_quarter ?? fetchedStats.performanceGrowthQuarter ?? 0
                    });

                    const rawComparison = apiData.month_comparison || apiData.monthComparison || apiData.comparison || [];
                    setComparisonData(rawComparison);
                } else {
                    setError(result.message || 'Failed to load data');
                }
            } catch (err) {
                console.error("Error fetching general dashboard data:", err);
                const serverMsg = err.response?.data?.message || err.message || 'Error connecting to the server';
                setError(serverMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [i18n.language]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t("loading") || "Loading..."}</div>;
    if (error) return (
        <div className="error-message" style={{ padding: '20px', color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
        </div>
    );

    return (
        <div className={`dashboard-page ${isAr ? 'rtl' : 'ltr'}`}>
            <div className="general-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            
            <header className="page-header general">
                <h1>{t("GeneralDashboard")}</h1>
            </header>

            <div className='general-info'>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("TotalEmployees")}</h3>
                    <p className="number">{stats.totalEmployees}</p>
                    <span className="badge badge-green">
                        <i className="bi bi-arrow-up-short"></i> +{stats.newThisMonth} {t("newthismonth")}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("PerformanceRate")}</h3>
                    <p className="number">{stats.performanceRate}%</p>
                    <span className="badge badge-green">
                        {t("High")}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesonLeaveToday")}</h3>
                    <p className="number">{stats.employeesOnLeaveToday}</p>
                    <span className="badge badge-gray">
                        {stats.leaveBreakdown}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("OvertimeHours")}</h3>
                    <p className="number">{stats.overtimeHours}</p>
                    <span className="badge badge-green">
                        +{stats.overtimeGrowthPercent}% {t("fromlastmonth")}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("MonthlySalaryCost")}</h3>
                    <p className="number">
                        ${stats.monthlySalaryCost ? stats.monthlySalaryCost.toLocaleString() : 0}
                    </p>
                    <span className="badge badge-gray">
                        {t("Approx")}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesonLeavethisMonth")}</h3>
                    <p className="number">{stats.employeesOnLeaveThisMonth}</p>
                    <span className="badge badge-gray">
                        (Total)
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesLateToday")}</h3>
                    <p className="number">{stats.employeesLateToday}</p>
                    <span className="badge badge-red">
                        {t("Higherthanusual")}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("AveragePerformanceRating")}</h3>
                    <p className="number">{stats.avgPerformanceRating} <span>/ 5.0</span></p>
                    <span className="badge badge-green">
                        {t("Up")} {stats.performanceGrowthQuarter} {t("fromlastquarter")}
                    </span>
                </div>
            </div>

            <div className='graph'>
                <h3>{t("Month-over-monthComparison")}</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        />
                        <YAxis
                            ticks={[0, 25, 50, 75, 100]}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-main)'
                            }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="ThisMonth" name={t("ThisMonth")} fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="LastMonth" name={t("LastMonth")} fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}