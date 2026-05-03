import React, { useState, useEffect } from 'react';
import './Salaries.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import apiClient from '../../../../apiConfig';

const Salaries = () => {
    const { t } = useTranslation('Dashboard/SalariesCompensation');

    const [deptFilter, setDeptFilter] = useState('');
    const [statFilter, setStatFilter] = useState('');
    const [payrollFilter, setPayrollFilter] = useState('');
    const [payrollData, setPayrollData] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedMonth, setSelectedMonth] = useState('');

    // Generate dynamic months list
    const monthsList = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsList.push(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
    }

    useEffect(() => {
        if (!payrollFilter) setPayrollFilter(monthsList[0]);
    }, [monthsList]);

    useEffect(() => {
        fetchPayroll();
    }, [deptFilter, statFilter, payrollFilter]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await apiClient.get('/departments');
            setDepartments(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/payroll', {
                params: {
                    department_id: deptFilter === 'all' ? undefined : deptFilter,
                    status: statFilter || undefined,
                    month: payrollFilter || undefined
                }
            });
            setPayrollData(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching payroll:', error);
        } finally {
            setLoading(false);
        }
    };

    const departmentOptions = [
        { value: 'all', label: t('filters.all_departments', 'All Departments') },
        ...departments.map(dept => ({ value: dept.id.toString(), label: dept.name })),
    ];

    const statusOptions = [
        { value: '', label: t('filters.Status') },
        { value: 'paid', label: t('filters.Paid') },
        { value: 'unpaid', label: t('filters.Pending') },
    ];

    const payrollperiodOptions = [
        { value: '', label: t('filters.all_periods', 'All Periods') },
        ...monthsList.map(m => ({ value: m, label: m })),
    ];

    return (
        <div className="sa-page">
            <div className="sa-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <header className="sa-header">
                <h1 className="sa-title">{t('SalariesCompensation')}</h1>
            </header>

            {/* Summary Cards */}
            <div className="salaries-page">
                <div className="salaries">
                    <div className="salaries-inf">
                        <h3>{t('TotalMonthlyCost')}</h3>
                        <p>${payrollData.reduce((acc, row) => acc + parseFloat(row.final_net_salary), 0).toLocaleString()}</p>
                    </div>
                    <div className="salaries-inf">
                        <h3>{t('TotalDeductions')}</h3>
                        <p>${payrollData.reduce((acc, row) => acc + (row.deductions?.reduce((dacc, d) => dacc + parseFloat(d.amount), 0) || 0), 0).toLocaleString()}</p>
                    </div>
                    <div className="salaries-inf">
                        <h3>{t('TotalOvertimeCost')}</h3>
                        <p>${payrollData.reduce((acc, row) => acc + parseFloat(row.overtime_amount), 0).toLocaleString()}</p>
                    </div>
                    <div className="salaries-inf">
                        <h3>{t('NextPayrollDate')}</h3>
                        <p>Oct 31, 2023</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-salary-co">
                <div>
                    <input
                        className="er-search-input"
                        type="search"
                        placeholder={t('search')}
                    />
                </div>

                <div className="filter-salary">
                    <div className="filters-salary">
                        <FilterDropdown
                            value={deptFilter}
                            onChange={setDeptFilter}
                            options={departmentOptions}
                            placeholder={t('filters.department')}
                        />

                        <FilterDropdown
                            value={statFilter}
                            onChange={setStatFilter}
                            options={statusOptions}
                            placeholder={t('filters.Status')}
                        />

                        <FilterDropdown
                            value={payrollFilter}
                            onChange={setPayrollFilter}
                            options={payrollperiodOptions}
                            placeholder={t('filters.payrollperiod')}
                        />
                    </div>

                    <div>
                        <button className="export">
                            <i className="bi bi-download"></i>
                            {t('ExportPayrollReport')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="Payroll-Summary-table er-table-card">
                <div>
                    <h2 className="er-table-title">{t('PayrollSummaryTable')}</h2>
                </div>

                <div>
                    <table className="er-table">
                        <thead>
                            <tr>
                                <th>{t('EmployeeName')}</th>
                                <th>{t('JobTitle')}</th>
                                <th>{t('BasicSalary')}</th>
                                <th>{t('TotalAdditions')}</th>
                                <th>{t('TotalDeductions')}</th>
                                <th>{t('NetSalary')}</th>
                                <th>{t('Status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">{t('Loading', 'Loading payroll data...')}</td>
                                </tr>
                            ) : payrollData.length > 0 ? payrollData.map((row, i) => {
                                const totalDeductions = row.deductions?.reduce((acc, d) => acc + Number(d.amount), 0) || 0;
                                return (
                                <tr key={i}>
                                    <td className="name-emp-salary">
                                        <img
                                            src={row.user?.employee_profile?.profile_pic ? `/storage/${row.user.employee_profile.profile_pic}` : 'https://i.pravatar.cc/150'}
                                            alt={row.user?.employee_profile?.full_name || row.user?.name}
                                            className="er-avatar"
                                        />{' '}
                                        {row.user?.employee_profile?.full_name || row.user?.name}
                                    </td>
                                    <td>{row.user?.employee_profile?.job_title || '—'}</td>
                                    <td>${Number(row.basic_salary).toLocaleString()}</td>
                                    <td>${Number(row.overtime_amount).toLocaleString()}</td>
                                    <td>${totalDeductions.toLocaleString()}</td>
                                    <td style={{ fontWeight: 'bold' }}>${Number(row.final_net_salary).toLocaleString()}</td>
                                    <td>
                                        <span className={`status-badge ${row.status === 'paid' ? 'paid' : 'unpaid'}`} style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            backgroundColor: row.status === 'paid' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                                            color: row.status === 'paid' ? '#16a34a' : '#ea580c'
                                        }}>
                                            {t(row.status === 'paid' ? 'Paid' : 'Unpaid')}
                                        </span>
                                    </td>
                                </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
                                            <p>{t('NoData', 'No payroll records found for the selected criteria.')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Salary Reports */}
            <div className="salaries-page SalaryReports">
                <div>
                    <h2 className="er-table-title">{t('SalaryReports')}</h2>
                </div>

                <div className="salaries SalaryReportsflex">
                    {[
                        'GeneralSalaryReports',
                        'OvertimeReport',
                        'BonusesReport',
                        'EmployeeCostReport',
                    ].map((report, i) => (
                        <div key={i} className="view-salary-report">
                            <h6>{t(report)}</h6>
                            <p>{t(`${report}detials`)}</p>
                            <Link to="#">{t('ViewReport')}</Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Salaries;