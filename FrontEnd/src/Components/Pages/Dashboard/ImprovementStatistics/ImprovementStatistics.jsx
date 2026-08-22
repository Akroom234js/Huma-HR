import React, { useState, useEffect } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ScatterChart, Scatter, Cell
} from 'recharts';
import './ImprovementStatistics.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';

export default function ImprovementStatistics() {
    const { t, i18n } = useTranslation('Dashboard/ImprovementStatistics');
    const isAr = i18n ? i18n.language === 'ar' : false;

    const [overallStats, setOverallStats] = useState({
        mostProductiveDept: '---',
        avgEmployeeCost: '---',
        overallIndex: '---',
        operationalEfficiency: '---'
    });
    const [departmentsData, setDepartmentsData] = useState([]);
    const [monthlyTrends, setMonthlyTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await apiClient.get('/dashboard/improvement-stats');
                const result = res.data;

                if (result && result.status && result.data) {
                    const apiData = result.data;
                    const stats = apiData.stats || apiData.overall_stats || {};
                    setOverallStats({
                        mostProductiveDept: stats.most_productive_dept || stats.mostProductiveDept || '---',
                        avgEmployeeCost: stats.avg_employee_cost || stats.avgEmployeeCost || '---',
                        overallIndex: stats.overall_index || stats.overallIndex || '---',
                        operationalEfficiency: stats.operational_efficiency || stats.operationalEfficiency || '---'
                    });

                    const rawDepts = apiData.departments || apiData.departments_data || apiData.department_stats || [];
                    const defaultColors = ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6'];
                    
                    const formattedDepts = rawDepts.map((dept, idx) => ({
                        id: dept.id || idx + 1,
                        name: dept.name || dept.department_name || 'N/A',
                        attendance: dept.attendance || dept.attendance_rate || 0,
                        tasks: dept.tasks || dept.tasks_completed || 0,
                        cost: dept.cost || dept.avg_cost || 0,
                        index: dept.index || dept.performance_index || 0,
                        color: dept.color || defaultColors[idx % defaultColors.length]
                    }));
                    setDepartmentsData(formattedDepts);
                    const rawTrends = apiData.monthly_trends || apiData.monthlyTrends || apiData.trends || [];
                    setMonthlyTrends(rawTrends);
                }
            } catch (err) {
                console.error("Failed fetching improvement statistics:", err);
                setError(t('error'));
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [i18n.language]);

    const getIndexClass = (score) => {
        if (score >= 90) return 'is-badge-success';
        if (score >= 80) return 'is-badge-warning';
        return 'is-badge-danger';
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t('loading')}</div>;
    if (error) return <div className="error-message" style={{ padding: '20px', color: 'red' }}>{error}</div>;

    return (
        <div className={`is-page ${isAr ? 'rtl' : 'ltr'}`}>
            <div className="is-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <header className="is-header">
                <h1 className="is-title">{t('title')}</h1>
            </header>

            <div className="is-content">
                <section className="is-stats-grid">
                    <div className="is-stat-card">
                        <span className="is-stat-label">{t('mostProductiveDept')}</span>
                        <span className="is-stat-value">{overallStats.mostProductiveDept}</span>
                    </div>
                    <div className="is-stat-card">
                        <span className="is-stat-label">{t('avgEmployeeCost')}</span>
                        <span className="is-stat-value">
                            {typeof overallStats.avgEmployeeCost === 'number' ? `$${overallStats.avgEmployeeCost}` : overallStats.avgEmployeeCost}
                        </span>
                    </div>
                    <div className="is-stat-card">
                        <span className="is-stat-label">{t('overallIndex')}</span>
                        <span className="is-stat-value">
                            {overallStats.overallIndex}{typeof overallStats.overallIndex === 'number' ? '%' : ''}
                        </span>
                    </div>
                    <div className="is-stat-card">
                        <span className="is-stat-label">{t('operationalEfficiency')}</span>
                        <span className="is-stat-value">{overallStats.operationalEfficiency}</span>
                    </div>
                </section>
                <section className="is-charts-grid">
                    <div className="is-chart-card">
                        <h3 className="is-chart-title">{t('costVsPerformance')}</h3>
                        <div className="is-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis type="number" dataKey="cost" name="Cost" unit="$" stroke="var(--text-secondary)" fontSize={12} />
                                    <YAxis type="number" dataKey="index" name="Performance" unit="%" stroke="var(--text-secondary)" fontSize={12} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="Departments" data={departmentsData}>
                                        {departmentsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="is-chart-card">
                        <h3 className="is-chart-title">{t('performanceTrend')}</h3>
                        <div className="is-chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="performance" stroke="#6366f1" fillOpacity={1} fill="url(#colorPerf)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
                <div className="is-table-wrapper">
                    <table className="is-table">
                        <thead>
                            <tr>
                                <th>{t('table.department')}</th>
                                <th>{t('table.attendanceRate')}</th>
                                <th>{t('table.tasksCompleted')}</th>
                                <th>{t('table.performanceIndex')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departmentsData.map((dept) => (
                                <tr key={dept.id}>
                                    <td className="is-font-bold">{dept.name}</td>
                                    <td>{dept.attendance}%</td>
                                    <td>{dept.tasks}</td>
                                    <td>
                                        <span className={`is-index-badge ${getIndexClass(dept.index)}`}>
                                            {dept.index}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}