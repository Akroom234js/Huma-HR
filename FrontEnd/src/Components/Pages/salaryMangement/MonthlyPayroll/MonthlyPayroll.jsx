import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './MonthlyPayroll.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import apiClient from "../../../../apiConfig";

const MonthlyPayroll = () => {
    const { t } = useTranslation('SalaryManagement/MonthlyPayroll');
    const [details, setDetails] = useState([]);
    const [payrollData, setPayrollData] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(false);

    const handleInitializePayroll = async () => {
        if (!selectedMonth) return;
        try {
            setIsInitializing(true);
            const res = await apiClient.post('/payroll/initialize', {
                month: selectedMonth
            });
            alert(res.data.message);
            fetchPayroll();
        } catch (error) {
            console.error("Initialization failed", error);
            alert("Failed to initialize payroll.");
        } finally {
            setIsInitializing(false);
        }
    };

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDeptId, setSelectedDeptId] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("");

    // Generate months list
    const monthsList = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsList.push(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
    }

    useEffect(() => {
        if (!selectedMonth) setSelectedMonth(monthsList[0]);
    }, [monthsList]);

    const fetchDepartments = async () => {
        try {
            const res = await apiClient.get('/departments');
            setDepartments(res.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const fetchPayroll = useCallback(async () => {
        if (!selectedMonth) return;
        setIsLoading(true);
        try {
            const params = {
                month: selectedMonth,
                department_id: selectedDeptId === 'all' ? undefined : selectedDeptId,
                search: searchQuery || undefined
            };
            const res = await apiClient.get('/payroll', { params });
            const data = (res.data?.data || []).map(row => ({
                id: row.id,
                name: row.user?.employee_profile?.full_name || '—',
                department: row.user?.employee_profile?.department?.name || '—',
                jobTitle: row.user?.employee_profile?.job_title || '—',
                basic: `$${Number(row.basic_salary).toLocaleString()}`,
                allowances: `$${Number(row.allowances_amount || 0).toLocaleString()}`,
                bonuses: `$${Number(row.bonuses_amount || 0).toLocaleString()}`,
                ot: `${row.overtime_hours} hrs`,
                dedTypes: (row.deductions || []).map(d => ({ label: d.deduction_type || 'Deduction', class: 'tag-policy' })),
                dedAmounts: (row.deductions || []).map(d => ({ val: `$${Number(d.amount).toLocaleString()}`, muted: false })),
                final: `$${Number(row.final_net_salary).toLocaleString()}`,
                status: row.status === 'paid' ? 'Paid' : 'Unpaid',
                // Extra details for modal
                allowanceVal: `$${Number(row.allowances_amount || 0).toLocaleString()}`,
                bonusVal: `$${Number(row.bonuses_amount || 0).toLocaleString()}`,
                abs: `$${row.deductions?.filter(d => d.deduction_type === 'absence').reduce((acc, d) => acc + Number(d.amount), 0).toLocaleString()} (${row.deductions?.reduce((acc, d) => acc + (d.absence_days || 0), 0) || 0} days)`,
                date: row.deductions?.[0]?.applied_date || row.updated_at?.split('T')[0] || '- -',
                dedLines: (row.deductions || []).map(d => `${d.deduction_type}: $${d.amount} ${d.reason ? `(${d.reason})` : ''}`),
                reason: row.deductions?.[0]?.reason || '-',
                by: row.processor?.employee_profile?.full_name || row.processor?.profile?.full_name || 'System'
            }));
            setPayrollData(data);
        } catch (error) {
            console.error("Failed to fetch payroll data", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedMonth, selectedDeptId, searchQuery]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPayroll();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchPayroll]);

    // Payment Logic
    const handlePayEmployee = async (id) => {
        try {
            await apiClient.patch(`/payroll/${id}/pay`);
            fetchPayroll();
        } catch (error) {
            console.error("Payment failed", error);
        }
    };

    const handlePayAll = async () => {
        const unpaidIds = payrollData.filter(emp => emp.status === "Unpaid").map(emp => emp.id);
        if (unpaidIds.length === 0) return;
        try {
            await apiClient.post(`/payroll/pay-all`, { ids: unpaidIds });
            fetchPayroll();
        } catch (error) {
            console.error("Bulk payment failed", error);
        }
    };

    const moredetails = (e, abs, dedLines, date, reason, by, allowances, bonuses) => {
        const vis = document.querySelector(".details")
        const zind = document.querySelector(".mobile-toggle")
        if (zind) zind.style.zIndex = "-1"
        if (vis) vis.style.display = "block"
        document.body.style.overflow = 'hidden'

        const newDetails = (
            <div className='details-content-wrapper'>
                <div className='details-body'>
                    <div className='infocardsalary' style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <p style={{ fontWeight: 'bold' }}>{t('Allowances', 'Allowances')}:</p>
                        <p>{allowances}</p>
                    </div>
                    <div className='infocardsalary' style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <p style={{ fontWeight: 'bold' }}>{t('Bonuses', 'Bonuses')}:</p>
                        <p>{bonuses}</p>
                    </div>
                    <div className='infocardsalary' style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <p style={{ fontWeight: 'bold' }}>{t('AbsenceDeducted', 'Absence Deducted')}:</p>
                        <p>{abs}</p>
                    </div>
                    <div className='infocardsalary' style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        <p style={{ fontWeight: 'bold' }}>{t('Deductions', 'All Deductions')}:</p>
                        <div style={{ textAlign: 'right' }}>
                            {dedLines.length > 0 ? dedLines.map((d, i) => (
                                <div key={i} style={{ marginBottom: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>• {d}</div>
                            )) : <span style={{ color: 'var(--text-muted)' }}>None</span>}
                        </div>
                    </div>
                    <div className='infocardsalary'>
                        <p style={{ fontWeight: 'bold' }}>{t('deductiondate', 'Last Applied Date')}:</p>
                        <p>{date}</p>
                    </div>
                    <div className='infocardsalary'>
                        <p style={{ fontWeight: 'bold' }}>{t('Applied', 'Processed By')}:</p>
                        <p>{by}</p>
                    </div>
                </div>
            </div>
        );

        setDetails([newDetails]);
    };

    const hidden = (e) => {
        const hid = document.querySelector(".details")
        if (hid) hid.style.display = "none"
        document.body.style.overflow = 'auto'
        const zind = document.querySelector(".mobile-toggle")
        if (zind) zind.style.zIndex = "10"
    }

    return (
        <div className="sm-page">
            <header className="sm-header monthly">
                <h1 className="sm-title">{t('MonthlyPayroll', 'Monthly Payroll & Deductions')}</h1>
                <div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>
            </header>

            <div className='details'>
                <div className='newdetails'>
                    <div className='details-header-section'>
                        <h3>{t('Details', 'Details')}</h3>
                        <button onClick={(e) => { hidden(e) }} className='close-details-btn'>
                            <span className='bi bi-x'></span>
                        </button>
                    </div>
                    {details}
                </div>
            </div>

            <div className='monthlypayrollco'>
                <div className="searchFilterco pay-all-container">
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1 }}>
                        <div className="searchFilter">
                            <i className="bi bi-search search-icon-input"></i>
                            <input
                                className="Searchemployee"
                                placeholder={t("Searchemployee", "Search employee...")}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="AllDepartments"
                            value={selectedDeptId}
                            onChange={(e) => setSelectedDeptId(e.target.value)}
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                        <select
                            className="dateselect"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {monthsList.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            className="initialize-payroll-btn" 
                            onClick={handleInitializePayroll} 
                            disabled={isInitializing}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <i className={`bi bi-arrow-repeat ${isInitializing ? 'spin' : ''}`}></i>
                            {t('InitializePayroll', 'Generate Monthly Payroll')}
                        </button>

                        {payrollData.some(emp => emp.status === "Unpaid") && (
                            <button className="pay-all-btn" onClick={handlePayAll}>
                                <i className="bi bi-check2-all"></i> {t('PayAll', 'Pay All Unpaid')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="tablesalary">
                    <table className="">
                        <thead className="">
                            <tr>
                                <th className="" >{t('name', 'EMPLOYEE NAME')}</th>
                                <th className="" >{t('Department', 'DEPARTMENT')}</th>
                                <th className="" >{t('JobTitle', 'JOB TITLE')}</th>
                                <th className="" >{t('BasicSalary', 'BASIC SALARY')}</th>
                                <th className="" >{t('Allowances', 'ALLOWANCES')}</th>
                                <th className="" >{t('Bonuses', 'BONUSES')}</th>
                                <th className="" >{t('Overtime', 'OVERTIME HOURS')}</th>
                                <th className="" >{t('DeductionType', 'DEDUCTION TYPE')}</th>
                                <th className="" >{t('DeductionAmount', 'DEDUCTION AMOUNT')}</th>
                                <th className="" >{t('FinalNetSalary', 'FINAL NET SALARY')}</th>
                                <th className="" >{t('Actions', 'STATUS & ACTIONS')}</th>
                            </tr>
                        </thead>
                        <tbody className='salaryinfo'>
                            {isLoading ? (
                                <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                            ) : payrollData.length > 0 ? payrollData.map((row, idx) => (
                                <tr key={idx} className="">
                                    <td className="" style={{ fontWeight: '500' }}>{row.name}</td>
                                    <td className="">{row.department}</td>
                                    <td className="">{row.jobTitle}</td>
                                    <td className="">{row.basic}</td>
                                    <td className="text-success">{row.allowances}</td>
                                    <td className="text-success">{row.bonuses}</td>
                                    <td className="">{row.ot}</td>
                                    <td className="">
                                        {row.dedTypes.length > 0 ? (
                                            <div className="deduction-container">
                                                {row.dedTypes.map((type, i) => (
                                                    <span key={i} className={`deduction-type-tag ${type.class}`}>{type.label}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>None</span>
                                        )}
                                    </td>
                                    <td className="">
                                        {row.dedAmounts.length > 0 ? (
                                            <div className="deduction-amount-col">
                                                {row.dedAmounts.map((amt, i) => (
                                                    <span key={i} className={amt.muted ? 'deduction-amount-muted' : 'deduction-amount-val'}>{amt.val}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span>$0.00</span>
                                        )}
                                    </td>
                                    <td className="final-salary-bold">{row.final}</td>
                                    <td className="status-actions-cell">
                                        <div className={`status-badge ${row.status === 'Paid' ? 'paid' : 'unpaid'}`}>
                                            {t(row.status, row.status)}
                                        </div>
                                        {row.status === "Unpaid" && (
                                            <button className="pay-btn" onClick={() => handlePayEmployee(row.id)}>
                                                {t('Pay', 'Pay')}
                                            </button>
                                        )}
                                        <button className="moredetails" onClick={(e) => { moredetails(e, row.abs, row.dedLines, row.date, row.reason, row.by, row.allowanceVal, row.bonusVal) }}>
                                            {t('more', 'More Details')}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
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

                <div className='salaryinfocard'>
                    {payrollData.length > 0 ? payrollData.map((row, idx) => (
                        <div key={idx} className="infocard">
                            <div className='infocardsalary'>
                                <p className="" >{t('name')}: </p>
                                <p className="" style={{ fontWeight: 'bold' }}>{row.name}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('Department', 'Department')}: </p>
                                <p className="">{row.department}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('JobTitle', 'Job Title')}: </p>
                                <p className="">{row.jobTitle}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('BasicSalary')}: </p>
                                <p className="">{row.basic}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('Overtime')}: </p>
                                <p className="">{row.ot}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('DeductionType', 'Deduction Type')}: </p>
                                <div className="">
                                    {row.dedTypes.length > 0 ? row.dedTypes.map((type, i) => <div key={i} style={{ fontSize: '12px' }} >{type.label}</div>) : "None"}
                                </div>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('DeductionAmount')}: </p>
                                <p className="">
                                    {row.dedAmounts.length > 0 ? row.dedAmounts.map((amt, i) => <span key={i} style={{ marginInlineEnd: '5px' }}>{amt.val}</span>) : "$0.00"}
                                </p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('FinalNetSalary')}: </p>
                                <p className="" style={{ fontWeight: 'bold' }}>{row.final}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('Status', 'Status')}: </p>
                                <div className={`status-badge ${row.status === 'Paid' ? 'paid' : 'unpaid'}`}>
                                    {t(row.status, row.status)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                                {row.status === "Unpaid" ? (
                                    <button className="pay-btn" onClick={() => handlePayEmployee(row.id)}>
                                        {t('Pay', 'Pay')}
                                    </button>
                                ) : <div></div>}
                                <button className="moredetails" onClick={(e) => { moredetails(e, row.abs, row.dedLines, row.date, row.reason, row.by, row.allowanceVal, row.bonusVal) }}>
                                    {t('more', 'More Details')}
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                            No data found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthlyPayroll;
