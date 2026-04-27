import React, { useState, useEffect } from 'react';
import './Salaries.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import axios from 'axios';

const Salaries = () => {
    const { t } = useTranslation('Dashboard/SalariesCompensation');

    const [deptFilter, setDeptFilter] = useState('');
    const [statFilter, setStatFilter] = useState('');
    const [payrollFilter, setPayrollFilter] = useState('');
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayroll();
    }, [deptFilter, statFilter, payrollFilter]);

    const fetchPayroll = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/payroll', {
                params: {
                    department_id: deptFilter,
                    status: statFilter,
                    month: payrollFilter
                }
            });
            setPayrollData(response.data.data || []);
        } catch (error) {
            console.error('Error fetching payroll:', error);
        } finally {
            setLoading(false);
        }
    };

    const departmentOptions = [
        { value: '', label: t('filters.department') },
        { value: '1', label: t('Engineering') },
        { value: '2', label: t('Design') },
    ];

    const statusOptions = [
        { value: '', label: t('filters.Status') },
        { value: 'paid', label: t('filters.Paid') },
        { value: 'unpaid', label: t('filters.Pending') },
    ];

    const payrollperiodOptions = [
        { value: '', label: t('filters.payrollperiod') },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
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
                                    <td colSpan="7" className="text-center py-4">{t('Loading')}</td>
                                </tr>
                            ) : payrollData.map((row, i) => {
                                const totalDeductions = row.deductions?.reduce((acc, d) => acc + parseFloat(d.amount), 0) || 0;
                                return (
                                <tr key={i}>
                                    <td className="name-emp-salary">
                                        <img
                                            src={row.user?.employee_profile?.profile_pic || 'https://i.pravatar.cc/150'}
                                            alt={row.user?.name}
                                            className="er-avatar"
                                        />{' '}
                                        {row.user?.name}
                                    </td>
                                    <td>{row.user?.employee_profile?.job_title}</td>
                                    <td>${row.basic_salary}</td>
                                    <td>${row.overtime_amount}</td>
                                    <td>${totalDeductions}</td>
                                    <td>${row.final_net_salary}</td>
                                    <td>
                                        <span className={`bg-${row.status === 'paid' ? 'green' : 'orange'}`}>
                                            {t(row.status)}
                                        </span>
                                    </td>
                                </tr>
                                );
                            })}
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