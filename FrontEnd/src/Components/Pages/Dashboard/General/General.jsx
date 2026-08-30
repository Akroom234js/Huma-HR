import React, { useState, useEffect } from 'react';
import './General.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';
import DashboardLoader from '../../../Shared/DashboardLoader/DashboardLoader';
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

                if (result && (result.status || result.success)) {
                    const apiData = result.data || {};
                    const fetchedStats = apiData.stats || apiData.overall_stats || apiData;
                    
                    setStats({
                        totalEmployees: fetchedStats.total_employees ?? fetchedStats.totalEmployees ?? 0,
                        newThisMonth: fetchedStats.new_this_month ?? fetchedStats.newThisMonth ?? 0,
                        performanceRate: fetchedStats.performance_rate ?? fetchedStats.performanceRate ?? 0,
                        employeesOnLeaveToday: fetchedStats.employees_on_leave_today ?? fetchedStats.employeesOnLeaveToday ?? 0,
                        sickLeavesCount: fetchedStats.sick_leaves_count,
                        annualLeavesCount: fetchedStats.annual_leaves_count,
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
                    setError(result.message || t('error_loading'));
                }
            } catch (err) {
                console.error("Error fetching general dashboard data:", err);
                const serverMsg = err.response?.data?.message || err.message || t('error_loading');
                setError(serverMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [i18n.language]);

    if (loading) return <DashboardLoader text={t("loading") || "Loading Dashboard Data..."} fullPage size="lg" />;
    if (error) return (
        <div className="error-message" style={{ padding: '20px', color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
        </div>
    );

    // Dynamic states for badges
    const isPerformanceHigh = (stats.performanceRate ?? 0) >= 75;
    const isLateHigh = (stats.employeesLateToday ?? 0) > 5;
    const isGrowthPositive = (stats.performanceGrowthQuarter ?? 0) >= 0;
    const isOvertimePositive = (stats.overtimeGrowthPercent ?? 0) >= 0;

    // Formatted leave breakdown with localization
    const leaveBreakdownText = (stats.sickLeavesCount !== undefined && stats.annualLeavesCount !== undefined)
        ? `${stats.sickLeavesCount} ${t('Sick')}, ${stats.annualLeavesCount} ${t('Annual')}`
        : stats.leaveBreakdown;

    // Translated chart data
    const translatedComparisonData = comparisonData.map(item => ({
        ...item,
        name: t(item.name) || item.name
    }));

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
                        <i className="bi bi-arrow-up-short"></i> {stats.newThisMonth > 0 ? `+${stats.newThisMonth}` : stats.newThisMonth} {t("newthismonth")}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("PerformanceRate")}</h3>
                    <p className="number">{stats.performanceRate}%</p>
                    <span className={`badge ${isPerformanceHigh ? 'badge-green' : 'badge-red'}`}>
                        {isPerformanceHigh ? t("High") : t("Low")}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesonLeaveToday")}</h3>
                    <p className="number">{stats.employeesOnLeaveToday}</p>
                    <span className="badge badge-gray">
                        {leaveBreakdownText}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("OvertimeHours")}</h3>
                    <p className="number">{stats.overtimeHours}</p>
                    <span className={`badge ${isOvertimePositive ? 'badge-green' : 'badge-red'}`}>
                        {isOvertimePositive ? `+${stats.overtimeGrowthPercent}` : stats.overtimeGrowthPercent}% {t("fromlastmonth")}
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
                        ({t("Total")})
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesLateToday")}</h3>
                    <p className="number">{stats.employeesLateToday}</p>
                    <span className={`badge ${isLateHigh ? 'badge-red' : 'badge-green'}`}>
                        {isLateHigh ? t("Higherthanusual") : t("Lowerthanusual")}
                    </span>
                </div>

                <div className='general-info-card'>
                    <h3 className="title-card">{t("AveragePerformanceRating")}</h3>
                    <p className="number">{stats.avgPerformanceRating} <span>/ 5.0</span></p>
                    <span className={`badge ${isGrowthPositive ? 'badge-green' : 'badge-red'}`}>
                        {isGrowthPositive ? t("Up") : t("Down")} {Math.abs(stats.performanceGrowthQuarter || 0)} {t("fromlastquarter")}
                    </span>
                </div>
            </div>

            <div className='graph'>
                <h3>{t("Month-over-monthComparison")}</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={translatedComparisonData}>
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