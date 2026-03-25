import React, { useState } from 'react';
import './Salaries.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import FilterDropdown from '../../Recrutment/FilterDropdown/FilterDropdown';

const Salaries = () => {
    const { t } = useTranslation('Dashboard/SalariesCompensation');

    const [deptFilter, setDeptFilter] = useState('');
    const [statFilter, setStatFilter] = useState('');
    const [payroll, setPayrollFilter] = useState('');

    const departmentOptions = [
        { value: '', label: t('filters.department') },
        { value: 'Engineering', label: t('Engineering') },
        { value: 'Design', label: t('Design') },
        { value: 'Product', label: t('Product Management') },
        { value: 'Marketing', label: t('Marketing') },
    ];

    const statusOptions = [
        { value: '', label: t('filters.Status') },
        { value: 'Paid', label: t('filters.Paid') },
        { value: 'Ready', label: t('filters.Ready') },
        { value: 'Pending', label: t('filters.Pending') },
    ];

    const payrollperiodOptions = [
        { value: '', label: t('filters.payrollperiod') },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
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
                        <p>$125,430</p>
                    </div>
                    <div className="salaries-inf">
                        <h3>{t('TotalDeductions')}</h3>
                        <p>$12,870</p>
                    </div>
                    <div className="salaries-inf">
                        <h3>{t('TotalOvertimeCost')}</h3>
                        <p>$5,600</p>
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
                            value={payroll}
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
                            {[
                                {
                                    name: 'Olivia Rhye',
                                    title: 'Product Designer',
                                    additions: '$250',
                                    deductions: '$330',
                                    basic: '$5,500',
                                    net: '$5,600',
                                    status: 'Paid',
                                    color: 'green',
                                    img: 'https://i.pravatar.cc/150?u=1',
                                },
                                {
                                    name: 'Phoenix Baker',
                                    title: 'Product Designer',
                                    additions: '$250',
                                    deductions: '$330',
                                    basic: '$6,200',
                                    net: '$6,380',
                                    status: 'Ready',
                                    color: 'blue',
                                    img: 'https://i.pravatar.cc/150?u=2',
                                },
                                {
                                    name: 'Lana Steiner',
                                    title: 'Product Designer',
                                    additions: '$250',
                                    deductions: '$330',
                                    basic: '$7,000',
                                    net: '$6,550',
                                    status: 'Paid',
                                    color: 'green',
                                    img: 'https://i.pravatar.cc/150?u=3',
                                },
                                {
                                    name: 'Candice Wu',
                                    title: 'Product Designer',
                                    additions: '$250',
                                    deductions: '$330',
                                    basic: '$6,800',
                                    net: '$7,190',
                                    status: 'Pending',
                                    color: 'orange',
                                    img: 'https://i.pravatar.cc/150?u=4',
                                },
                            ].map((row, i) => (
                                <tr key={i}>
                                    <td className="name-emp-salary">
                                        <img
                                            src={row.img}
                                            alt={row.name}
                                            className="er-avatar"
                                        />{' '}
                                        {row.name}
                                    </td>
                                    <td>{row.title}</td>
                                    <td>{row.basic}</td>
                                    <td>{row.additions}</td>
                                    <td>{row.deductions}</td>
                                    <td>{row.net}</td>
                                    <td>
                                        <span className={`bg-${row.color}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
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