import React, { useState, useEffect } from 'react';
import './EmployeeReports.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import Avatar from '../../../Shared/Avatar/Avatar';
import apiClient from '../../../../apiConfig';

export default function EmployeeReports() {
    const { t, i18n } = useTranslation('Dashboard/EmployeeReports');
    const isAr = i18n ? i18n.language === 'ar' : false;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [statsData, setStatsData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [joinDateFilter, setJoinDateFilter] = useState('');

    useEffect(() => {
        const fetchEmployeeReports = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiClient.get('/dashboard/employee-reports', {
                    params: {
                        search: searchTerm,
                        department: deptFilter,
                        status: statusFilter,
                        join_date: joinDateFilter,
                    }
                });

                const result = response.data;
                console.log("Employee Reports Result:", result);

                if (result && (result.status || result.success)) {
                    const apiData = result.data || {};
                    setEmployees(apiData.employees || []);
                    setStatsData(apiData.stats || {});
                } else {
                    setError(result.message || 'Failed to load employee reports');
                }
            } catch (err) {
                console.error("Error fetching employee reports:", err);
                const serverMsg = err.response?.data?.message || err.message || 'Error connecting to the server';
                setError(serverMsg);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeReports();
    }, [searchTerm, deptFilter, statusFilter, joinDateFilter, i18n?.language]);

    const departmentOptions = [
        { value: '', label: t('filters.department') },
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Design', label: 'Design' },
        { value: 'Product', label: 'Product Management' },
        { value: 'Marketing', label: 'Marketing' },
    ];

    const statusOptions = [
        { value: '', label: t('filters.employmentStatus') },
        { value: 'active', label: t('status.active') },
        { value: 'onLeave', label: t('status.onLeave') },
        { value: 'terminated', label: t('status.terminated') },
    ];

    const joinDateOptions = [
        { value: '', label: t('filters.joinDate') },
        { value: 'today', label: 'Today' },
        { value: 'this-month', label: 'This Month' },
        { value: 'this-year', label: 'This Year' },
    ];

    const stats = [
        { label: t('stats.totalEmployees'), value: statsData.total_employees ?? '0' },
        { label: t('stats.newHires'), value: statsData.new_hires ?? '0' },
        { label: t('stats.turnover'), value: statsData.turnover ?? '0%' },
        { label: t('stats.stabilityRate'), value: statsData.stability_rate ?? '0%' },
    ];

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>{t("loading") || "Loading..."}</div>;
    
    if (error) return (
        <div className="error-message" style={{ padding: '20px', color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>
            {error}
        </div>
    );

    return (
        <div className={`er-page ${isAr ? 'rtl' : 'ltr'}`}>
            <div className="er-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <header className="er-header">
                <h1 className="er-title">{t('title')}</h1>
            </header>

            {/* Filter Section */}
            <div className="er-filter-card">
                <div className="er-all-filt">
                    <input
                        type="text"
                        className="er-search-input"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="er-filters-row">
                        <FilterDropdown
                            value={deptFilter}
                            onChange={setDeptFilter}
                            options={departmentOptions}
                            placeholder={t('filters.department')}
                        />
                        <FilterDropdown
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusOptions}
                            placeholder={t('filters.employmentStatus')}
                        />
                        <FilterDropdown
                            value={joinDateFilter}
                            onChange={setJoinDateFilter}
                            options={joinDateOptions}
                            placeholder={t('filters.joinDate')}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="er-stats-row">
                {stats.map((stat, idx) => (
                    <div key={idx} className="er-stat-card">
                        <span className="er-stat-label">{stat.label}</span>
                        <span className="er-stat-value">{stat.value}</span>
                    </div>
                ))}
            </div>
            <div className="er-table-card">
                <div className="er-table-header">
                    <h2 className="er-table-title">{t('table.title')}</h2>
                </div>
                <div className="er-table-wrapper">
                    <table className="er-table">
                        <thead>
                            <tr>
                                <th>{t('table.employeeName')}</th>
                                <th>{t('table.employeeId')}</th>
                                <th>{t('table.jobTitle')}</th>
                                <th>{t('table.department')}</th>
                                <th>{t('table.joiningDate')}</th>
                                <th>{t('table.employmentStatus')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, idx) => (
                                <tr key={emp.id || idx}>
                                    <td>
                                        <div className="er-employee-cell">
                                            <Avatar user={{ full_name: emp.name, avatar: emp.img }} size="sm" />
                                            <span className="er-employee-name">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="er-employee-id">{emp.id}</span></td>
                                    <td><span className="er-job-title">{emp.job}</span></td>
                                    <td><span className="er-dept">{emp.dept}</span></td>
                                    <td><span className="er-date">{emp.date}</span></td>
                                    <td>
                                        <span className={`er-status-badge er-status-${(emp.status || '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`}>
                                            {t(`status.${emp.status}`)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                                        {t('table.noResults')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}