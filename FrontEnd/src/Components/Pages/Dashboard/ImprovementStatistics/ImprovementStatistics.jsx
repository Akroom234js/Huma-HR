import React from 'react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import './ImprovementStatistics.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';

const ImprovementStatistics = () => {
    // هذه المصفوفات هي التي سيتم استبدالها لاحقاً ببيانات من الباك اند (API Response)
    const departmentsData = [
        { id: 1, name: 'Engineering', attendance: 98, tasks: 124, cost: 8500, index: 95, color: '#10b981' },
        { id: 2, name: 'Marketing', attendance: 95, tasks: 88, cost: 5200, index: 82, color: '#f59e0b' },
        { id: 3, name: 'Sales', attendance: 92, tasks: 156, cost: 6800, index: 91, color: '#6366f1' },
        { id: 4, name: 'Support', attendance: 88, tasks: 210, cost: 4500, index: 75, color: '#ef4444' },
    ];

    const monthlyTrends = [
        { month: 'Jan', performance: 65 },
        { month: 'Feb', performance: 72 },
        { month: 'Mar', performance: 68 },
        { month: 'Apr', performance: 85 },
        { month: 'May', performance: 82 },
        { month: 'Jun', performance: 91 },
    ];

    const getIndexClass = (score) => {
        if (score >= 90) return 'is-badge-success';
        if (score >= 80) return 'is-badge-warning';
        return 'is-badge-danger';
    };

    return (
        <div className="is-page">
            <div className="is-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <header className="is-header">
                <h1 className="is-title">Improvement Statistics</h1>
            </header>

            <div className="is-content">
                {/* الإحصائيات السريعة */}
                <section className="is-stats-grid">
                    <div className="is-stat-card">
                        <span className="is-stat-label">Most Productive Dept.</span>
                        <span className="is-stat-value">Engineering</span>
                    </div>
                    <div className="is-stat-card">
                        <span className="is-stat-label">Avg. Employee Cost</span>
                        <span className="is-stat-value">$7,250</span>
                    </div>
                    <div className="is-stat-card">
                        <span className="is-stat-label">Overall Index</span>
                        <span className="is-stat-value">85.7%</span>
                    </div>
                    <div className="is-stat-card">
                        <span className="is-stat-label">Operational Efficiency</span>
                        <span className="is-stat-value">+12%</span>
                    </div>
                </section>

                {/* المخططات البيانية باستخدام Recharts */}
                <section className="is-charts-grid">
                    <div className="is-chart-card">
                        <h3 className="is-chart-title">Cost vs. Performance (Scatter)</h3>
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
                        <h3 className="is-chart-title">Company Performance Trend</h3>
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

                {/* جدول البيانات */}
                <div className="is-table-wrapper">
                    <table className="is-table">
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Attendance Rate</th>
                                <th>Tasks Completed</th>
                                <th>Performance Index</th>
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
};

export default ImprovementStatistics;