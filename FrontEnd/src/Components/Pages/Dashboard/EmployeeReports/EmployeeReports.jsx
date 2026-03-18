import React, { useState, useMemo } from 'react';
import './EmployeeReports.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import FilterDropdown from '../../Recrutment/FilterDropdown/FilterDropdown';

const EmployeeReports = () => {
    const { t } = useTranslation('Dashboard/EmployeeReports');
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const employees = [
        { name: 'Olivia Rhye', id: 'EMP-00123', job: 'Frontend Developer', dept: 'Engineering', date: '2022-10-15', status: 'active', img: 'https://i.pravatar.cc/150?u=olivia' },
        { name: 'Phoenix Baker', id: 'EMP-00124', job: 'Product Designer', dept: 'Design', date: '2021-05-20', status: 'active', img: 'https://i.pravatar.cc/150?u=phoenix' },
        { name: 'Lana Steiner', id: 'EMP-00125', job: 'Product Manager', dept: 'Product', date: '2020-01-10', status: 'onLeave', img: 'https://i.pravatar.cc/150?u=lana' },
        { name: 'Candice Wu', id: 'EMP-00126', job: 'Backend Developer', dept: 'Engineering', date: '2023-03-01', status: 'active', img: 'https://i.pravatar.cc/150?u=candice' },
        { name: 'Demi Wilkinson', id: 'EMP-00127', job: 'UX Researcher', dept: 'Design', date: '2022-08-12', status: 'active', img: 'https://i.pravatar.cc/150?u=demi' },
        { name: 'Nathan Roberts', id: 'EMP-00128', job: 'QA Engineer', dept: 'Engineering', date: '2019-11-25', status: 'active', img: 'https://i.pravatar.cc/150?u=nathan' },
    ];

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || emp.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = deptFilter === '' || emp.dept === deptFilter;
            const matchesStatus = statusFilter === '' || emp.status === statusFilter;
            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [searchTerm, deptFilter, statusFilter, employees]);

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
        { label: t('stats.totalEmployees'), value: '1,250' },
        { label: t('stats.newHires'), value: '15' },
        { label: t('stats.turnover'), value: '3.2%' },
        { label: t('stats.stabilityRate'), value: '96.8%' },
    ];

    return (
        <div className="er-page">
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
                            value=""
                            onChange={() => { }}
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

            {/* Table Section */}
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
                            {filteredEmployees.map((emp, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="er-employee-cell">
                                            <img src={emp.img} alt={emp.name} className="er-avatar" />
                                            <span className="er-employee-name">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="er-employee-id">{emp.id}</span></td>
                                    <td><span className="er-job-title">{emp.job}</span></td>
                                    <td><span className="er-dept">{emp.dept}</span></td>
                                    <td><span className="er-date">{emp.date}</span></td>
                                    <td>
                                        <span className={`er-status-badge er-status-${emp.status.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`}>
                                            {t(`status.${emp.status}`)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
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
};

export default EmployeeReports;
