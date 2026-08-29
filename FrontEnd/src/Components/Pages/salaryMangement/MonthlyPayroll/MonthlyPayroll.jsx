import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './MonthlyPayroll.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import apiClient from "../../../../apiConfig";
import { useNotification } from '../../../Notification/NotificationContext';
import DashboardLoader from '../../../Shared/DashboardLoader/DashboardLoader';

const MonthlyPayroll = () => {
    const { t } = useTranslation('SalaryManagement/MonthlyPayroll');
    const { showSuccess, showError, showWarning, showInfo } = useNotification();
    const [details, setDetails] = useState([]);
    const [payrollData, setPayrollData] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitializing, setIsInitializing] = useState(false);
    const [activeTab, setActiveTab] = useState('payroll'); // 'payroll', 'deductions', 'bonus_rules'
    const [stats, setStats] = useState({
        total_records: 0,
        total_paid: 0,
        total_unpaid: 0,
        total_payroll_amount: 0,
        avg_salary: 0
    });

    // Edit Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editFormData, setEditFormData] = useState({ basic_salary: "", allowances_amount: "", notes: "" });

    // Deduction Modal States
    const [isDedModalOpen, setIsDedModalOpen] = useState(false);
    const [dedFormData, setDedFormData] = useState({ user_id: "", deduction_type: "penalty", amount: "", is_addition: false, reason: "", month: "" });

    const [bonusRules, setBonusRules] = useState([]);
    const [allAdjustments, setAllAdjustments] = useState([]);
    const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
    const [bonusFormData, setBonusFormData] = useState({ name: "", target_type: "all", target_id: "", amount: "", is_percentage: false, frequency: "monthly", apply_month: "", condition_type: "none" });

    const handleInitializePayroll = async () => {
        if (!selectedMonth) return;
        try {
            setIsInitializing(true);
            const res = await apiClient.post('/payroll/initialize', {
                month: selectedMonth
            });
            showSuccess(res.data?.message || t('InitSuccess', "Monthly payroll generated successfully."));
            fetchPayroll();
            fetchStats();
        } catch (error) {
            console.error("Initialization failed", error);
            showError(error, t('InitError', "Failed to initialize payroll."));
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
                userId: row.user_id,
                // Extra details for modal
                allowanceVal: `$${Number(row.allowances_amount || 0).toLocaleString()}`,
                bonusVal: `$${Number(row.bonuses_amount || 0).toLocaleString()}`,
                abs: `$${(row.deductions || []).filter(d => d.deduction_type === 'absence').reduce((acc, d) => acc + Number(d.amount), 0).toLocaleString()} (${(row.deductions || []).reduce((acc, d) => acc + (d.absence_days || 0), 0) || 0} days)`,
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

    const fetchStats = async () => {
        try {
            const res = await apiClient.get('/payroll/overview');
            if (res.data?.data) {
                setStats(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const fetchBonusRules = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/bonus-rules');
            setBonusRules(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch bonus rules", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllAdjustments = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/deductions');
            setAllAdjustments(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch adjustments", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'payroll') fetchPayroll();
        if (activeTab === 'bonus_rules') fetchBonusRules();
        if (activeTab === 'deductions') fetchAllAdjustments();
    }, [activeTab, fetchPayroll]);

    // Payment Logic
    const handlePayEmployee = async (id) => {
        try {
            await apiClient.patch(`/payroll/${id}/pay`);
            showSuccess(t('PaySuccess', "Payment marked as paid."));
            fetchPayroll();
            fetchStats();
        } catch (error) {
            console.error("Payment failed", error);
            showError(error, t('PayError', "Payment failed."));
        }
    };

    const handleRevertPayment = async (id) => {
        if (!window.confirm(t('ConfirmRevert', "Revert this payment to unpaid?"))) return;
        try {
            await apiClient.patch(`/payroll/${id}/revert`);
            showSuccess(t('RevertSuccess', "Payment reverted to unpaid."));
            fetchPayroll();
            fetchStats();
        } catch (error) {
            console.error("Revert failed", error);
            showError(error, t('RevertError', "Revert failed."));
        }
    };

    const handleDeletePayroll = async (id) => {
        if (!window.confirm(t('ConfirmDeletePayroll', "Delete this payroll record?"))) return;
        try {
            await apiClient.delete(`/payroll/${id}`);
            showSuccess(t('DeletePayrollSuccess', "Payroll record deleted successfully."));
            fetchPayroll();
            fetchStats();
        } catch (error) {
            console.error("Delete failed", error);
            showError(error, t('DeletePayrollError', "Failed to delete payroll record."));
        }
    };

    const handleApplyBonusRules = async () => {
        if (!selectedMonth) return;
        try {
            const res = await apiClient.post('/bonus-rules/apply', { month: selectedMonth });
            showSuccess(res.data?.message || t('BonusApplySuccess', "Bonus rules applied successfully."));
            fetchPayroll();
            fetchStats();
        } catch (error) {
            console.error("Failed to apply bonus rules", error);
            showError(error, t('BonusApplyError', "Failed to apply bonus rules."));
        }
    };

    const handleSaveBonusRule = async () => {
        try {
            const dataToSubmit = { ...bonusFormData };
            if (dataToSubmit.frequency === 'once' && !dataToSubmit.apply_month) {
                dataToSubmit.apply_month = selectedMonth;
            }
            await apiClient.post('/bonus-rules', dataToSubmit);
            setIsBonusModalOpen(false);
            fetchBonusRules();
            showSuccess(t('BonusRuleSuccess', "Bonus rule saved successfully."));
        } catch (error) {
            console.error("Failed to save bonus rule", error);
            showError(error, t('BonusRuleError', "Failed to save bonus rule."));
        }
    };

    const handleSaveDed = async () => {
        try {
            const dataToSubmit = { 
                ...dedFormData,
                month: dedFormData.month || selectedMonth
            };
            await apiClient.post('/deductions', dataToSubmit);
            setIsDedModalOpen(false);
            fetchPayroll();
            fetchStats();
            if (activeTab === 'deductions') fetchAllAdjustments();
            showSuccess(t('AdjSaveSuccess', dataToSubmit.is_addition ? "Addition recorded successfully." : "Deduction recorded successfully."));
        } catch (error) {
            console.error("Failed to save deduction", error);
            showError(error, t('AdjSaveError', "Failed to save adjustment. Make sure the employee has a payroll record for this month."));
        }
    };

    const handleDeleteBonusRule = async (id) => {
        if (!window.confirm(t('ConfirmDeleteRule', "Delete this rule?"))) return;
        try {
            await apiClient.delete(`/bonus-rules/${id}`);
            showSuccess(t('DeleteRuleSuccess', "Bonus rule deleted successfully."));
            fetchBonusRules();
        } catch (error) {
            console.error("Failed to delete rule", error);
            showError(error, t('DeleteRuleError', "Failed to delete bonus rule."));
        }
    };

    const handleDeleteAdjustment = async (id) => {
        if (!window.confirm(t('ConfirmDeleteAdj', "Delete this adjustment?"))) return;
        try {
            await apiClient.delete(`/deductions/${id}`);
            showSuccess(t('AdjDeleteSuccess', "Adjustment deleted successfully."));
            fetchAllAdjustments();
            fetchPayroll();
            fetchStats();
        } catch (error) {
            console.error("Failed to delete adjustment", error);
            showError(error, t('AdjDeleteError', "Failed to delete adjustment."));
        }
    };

    const handlePayAll = async () => {
        const unpaidIds = payrollData.filter(emp => emp.status === "Unpaid").map(emp => emp.id);
        if (unpaidIds.length === 0) return;
        try {
            await apiClient.post(`/payroll/pay-all`, { ids: unpaidIds });
            showSuccess(t('PayAllSuccess', "All pending payroll records marked as paid."));
            fetchPayroll();
            fetchStats();
        } catch (error) {
            console.error("Bulk payment failed", error);
            showError(error, t('PayAllError', "Bulk payment failed."));
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

    const openEditModal = (row) => {
        // Find original record from payrollData raw or fetch if needed
        // For simplicity, we use the row data but we need numeric values
        setEditingRecord(row);
        setEditFormData({
            basic_salary: row.basic.replace('$', '').replace(',', ''),
            allowances_amount: row.allowanceVal.replace('$', '').replace(',', ''),
            notes: row.reason || ""
        });
        setIsEditModalOpen(true);
    };

    const handleUpdatePayroll = async () => {
        try {
            await apiClient.patch(`/payroll/${editingRecord.id}`, editFormData);
            setIsEditModalOpen(false);
            showSuccess(t('UpdateSuccess', "Payroll record updated successfully."));
            fetchPayroll();
            fetchStats();
        } catch (error) {
            console.error("Update failed", error);
            showError(error, t('UpdateError', "Failed to update payroll record."));
        }
    };

    return (
        <div className="sm-page">
            <header className="sm-header monthly">
                <h1 className="sm-title">{t('MonthlyPayroll', 'Monthly Payroll & Deductions')}</h1>
                <div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>
            </header>

            <div className="payroll-stats-grid">
                <div className="payroll-stat-card">
                    <div className="stat-label">{t('TotalRecords', 'Total Records')}</div>
                    <div className="stat-value">{stats.total_records}</div>
                </div>
                <div className="payroll-stat-card">
                    <div className="stat-label">{t('PaidRecords', 'Paid')}</div>
                    <div className="stat-value text-success">{stats.total_paid}</div>
                </div>
                <div className="payroll-stat-card">
                    <div className="stat-label">{t('UnpaidRecords', 'Unpaid')}</div>
                    <div className="stat-value text-danger">{stats.total_unpaid}</div>
                </div>
                <div className="payroll-stat-card">
                    <div className="stat-label">{t('TotalPayroll', 'Total Amount')}</div>
                    <div className="stat-value">${Number(stats.total_payroll_amount).toLocaleString()}</div>
                </div>
            </div>

            <div className="payroll-tabs">
                <button 
                    className={`payroll-tab-btn ${activeTab === 'payroll' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payroll')}
                >
                    {t('TabPayroll', 'Monthly Payroll')}
                </button>
                <button 
                    className={`payroll-tab-btn ${activeTab === 'deductions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deductions')}
                >
                    {t('TabDeductions', 'All Adjustments')}
                </button>
                <button 
                    className={`payroll-tab-btn ${activeTab === 'bonus_rules' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bonus_rules')}
                >
                    {t('TabBonusRules', 'Bonus Rules')}
                </button>
            </div>

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

            {activeTab === 'payroll' && (
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

                        <button className="apply-rules-btn" onClick={handleApplyBonusRules} style={{ backgroundColor: "rgb(19 131 237)", color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="bi bi-magic"></i> {t('ApplyBonusRules', 'Apply Bonus Rules')}
                        </button>
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
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                        <DashboardLoader text={t('LoadingPayroll', 'Loading payroll data...')} size="md" />
                                    </td>
                                </tr>
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
                                    <td className="" style={{ fontWeight: '600' }}>{row.final}</td>
                                    <td className="">
                                        <div className="payroll-actions-cell">
                                            <div className={`status-badge ${row.status === 'Paid' ? 'paid' : 'unpaid'}`}>
                                                {t(row.status, row.status)}
                                            </div>
                                            {row.status === "Unpaid" ? (
                                                <button className="pay-btn" onClick={() => handlePayEmployee(row.id)}>
                                                    <i className="bi bi-cash-stack"></i> {t('Pay', 'Pay')}
                                                </button>
                                            ) : (
                                                <button className="revert-btn" onClick={() => handleRevertPayment(row.id)} title="Revert to Unpaid">
                                                    <i className="bi bi-arrow-counterclockwise"></i>
                                                </button>
                                            )}
                                            <button className="btn-icon-edit" onClick={() => openEditModal(row)} title="Edit Record">
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn-icon-delete" onClick={() => handleDeletePayroll(row.id)} title="Delete Record">
                                                <i className="bi bi-trash"></i>
                                            </button>
                                            <button className="moredetails" onClick={(e) => { moredetails(e, row.abs, row.dedLines, row.date, row.reason, row.by, row.allowanceVal, row.bonusVal) }}>
                                                {t('more', 'More')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="11" style={{ textAlign: 'center', padding: '30px' }}>No payroll records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className='salaryinfocard'>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <DashboardLoader text={t('LoadingPayroll', 'Loading payroll data...')} size="md" />
                        </div>
                    ) : payrollData.length > 0 ? payrollData.map((row, idx) => (
                        <div key={idx} className='infocard'>
                            <div className='infocardsalary'>
                                <p className="" >{t('name')}: </p>
                                <p className="" >{row.name}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('Department')}: </p>
                                <p className="" >{row.department}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('JobTitle')}: </p>
                                <p className="" >{row.jobTitle}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('BasicSalary')}: </p>
                                <p className="" >{row.basic}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('Allowances')}: </p>
                                <p className="" >{row.allowances}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('Bonuses')}: </p>
                                <p className="" >{row.bonuses}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('Overtime')}: </p>
                                <p className="" >{row.ot}</p>
                            </div>
                            <div className='infocardsalary'>
                                <p className="" >{t('DeductionType')}: </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
            )}

            {activeTab === 'deductions' && (
                <div className="adjustments-tab-content monthlypayrollco">
                    <div className="searchFilterco">
                        <h3 className="sm-title" style={{ fontSize: '18px' }}>{t('RecentAdjustments', 'Recent Adjustments (Bonuses & Penalties)')}</h3>
                    </div>
                    <div className="tablesalary">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('Employee', 'Employee')}</th>
                                    <th>{t('Type', 'Type')}</th>
                                    <th>{t('Amount', 'Amount')}</th>
                                    <th>{t('Reason', 'Reason')}</th>
                                    <th>{t('AppliedBy', 'Applied By')}</th>
                                    <th>{t('Date', 'Date')}</th>
                                    <th>{t('Actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                            <DashboardLoader text={t('LoadingAdjustments', 'Loading adjustments...')} size="md" />
                                        </td>
                                    </tr>
                                ) : allAdjustments.length > 0 ? allAdjustments.map((adj, i) => (
                                    <tr key={adj.id || i}>
                                        <td>{adj.payroll_record?.user?.employee_profile?.full_name || 'N/A'}</td>
                                        <td>
                                            <span className={`deduction-type-tag ${adj.is_addition ? 'text-success' : 'tag-policy'}`}>
                                                {adj.deduction_type}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: '600', color: adj.is_addition ? '#10b981' : '#ef4444' }}>
                                            {adj.is_addition ? '+' : '-'}${Number(adj.amount).toLocaleString()}
                                        </td>
                                        <td>{adj.reason || '-'}</td>
                                        <td>{adj.applied_by}</td>
                                        <td>{adj.applied_date}</td>
                                        <td>
                                            <button className="btn-icon-delete" onClick={() => handleDeleteAdjustment(adj.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No adjustments found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'bonus_rules' && (
                <div className="bonus-rules-tab-content monthlypayrollco">
                    <div className="searchFilterco" style={{ justifyContent: 'space-between' }}>
                        <h3 className="sm-title" style={{ fontSize: '18px' }}>{t('ManageBonusRules', 'Automated Bonus Rules')}</h3>
                        <button className="sm-btn-primary" onClick={() => setIsBonusModalOpen(true)}>
                            <i className="bi bi-plus-lg"></i> {t('AddRule', 'Create New Rule')}
                        </button>
                    </div>
                    <div className="tablesalary">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('RuleName', 'Rule Name')}</th>
                                    <th>{t('Target', 'Target Scope')}</th>
                                    <th>{t('Amount', 'Amount')}</th>
                                    <th>{t('Frequency', 'Frequency')}</th>
                                    <th>{t('Condition', 'Condition')}</th>
                                    <th>{t('Status', 'Status')}</th>
                                    <th>{t('Actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                                            <DashboardLoader text={t('LoadingRules', 'Loading bonus rules...')} size="md" />
                                        </td>
                                    </tr>
                                ) : bonusRules.length > 0 ? bonusRules.map((rule, i) => (
                                    <tr key={rule.id || i}>
                                        <td style={{ fontWeight: '600' }}>{rule.name}</td>
                                        <td>{rule.target_type === 'all' ? 'Everyone' : `${rule.target_type} ID: ${rule.target_id}`}</td>
                                        <td>{rule.amount}{rule.is_percentage ? '%' : '$'}</td>
                                        <td>{rule.frequency}</td>
                                        <td>{rule.condition_type}</td>
                                        <td>
                                            <span className={`status-badge ${rule.is_active ? 'paid' : 'unpaid'}`}>
                                                {rule.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-icon-delete" onClick={() => handleDeleteBonusRule(rule.id)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No rules created yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payroll Edit Modal */}
            {isEditModalOpen && editingRecord && (
                <div className="sm-modal-overlay">
                    <div className="sm-modal" style={{ maxWidth: '450px' }}>
                        <div className="sm-modal-header">
                            <div>
                                <h2 className="sm-modal-title">{t('EditPayroll', 'Edit Payroll Record')}</h2>
                                <p className="sm-modal-subtitle">{editingRecord.name} - {selectedMonth}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="sm-modal-close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="sm-modal-body">
                            <div className="sm-form-group">
                                <label className="sm-label">{t('BasicSalary', 'Basic Salary')}</label>
                                <input 
                                    type="number" 
                                    className="sm-input" 
                                    value={editFormData.basic_salary} 
                                    onChange={e => setEditFormData({...editFormData, basic_salary: e.target.value})} 
                                />
                            </div>
                            <div className="sm-form-group">
                                <label className="sm-label">{t('Allowances', 'Allowances')}</label>
                                <input 
                                    type="number" 
                                    className="sm-input" 
                                    value={editFormData.allowances_amount} 
                                    onChange={e => setEditFormData({...editFormData, allowances_amount: e.target.value})} 
                                />
                            </div>
                            <div className="sm-form-group">
                                <label className="sm-label">{t('Notes', 'Notes / Reason')}</label>
                                <textarea 
                                    className="sm-input" 
                                    style={{ height: '80px', paddingTop: '10px' }}
                                    value={editFormData.notes} 
                                    onChange={e => setEditFormData({...editFormData, notes: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="sm-modal-footer">
                            <button onClick={() => setIsEditModalOpen(false)} className="sm-btn-secondary">{t('Cancel', 'Cancel')}</button>
                            <button onClick={handleUpdatePayroll} className="sm-btn-primary">
                                <i className="bi bi-save"></i> {t('SaveChanges', 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bonus Rule Modal */}
            {isBonusModalOpen && (
                <div className="sm-modal-overlay">
                    <div className="sm-modal" style={{ maxWidth: '500px' }}>
                        <div className="sm-modal-header">
                            <div>
                                <h2 className="sm-modal-title">{t('NewBonusRule', 'Create Automated Bonus Rule')}</h2>
                            </div>
                            <button onClick={() => setIsBonusModalOpen(false)} className="sm-modal-close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="sm-modal-body">
                            <div className="sm-form-group">
                                <label className="sm-label">{t('RuleName', 'Rule Name')}</label>
                                <input className="sm-input" value={bonusFormData.name} onChange={e => setBonusFormData({...bonusFormData, name: e.target.value})} />
                            </div>
                            <div className="sm-form-row">
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('Target', 'Target')}</label>
                                    <select className="sm-input" value={bonusFormData.target_type} onChange={e => setBonusFormData({...bonusFormData, target_type: e.target.value})}>
                                        <option value="all">Everyone</option>
                                        <option value="department">Department</option>
                                        <option value="employee">Specific Employee</option>
                                    </select>
                                </div>
                                {bonusFormData.target_type !== 'all' && (
                                    <div className="sm-form-group">
                                        <label className="sm-label">ID / Value</label>
                                        <input className="sm-input" type="number" value={bonusFormData.target_id} onChange={e => setBonusFormData({...bonusFormData, target_id: e.target.value})} />
                                    </div>
                                )}
                            </div>
                            <div className="sm-form-row">
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('Amount', 'Amount')}</label>
                                    <input className="sm-input" type="number" value={bonusFormData.amount} onChange={e => setBonusFormData({...bonusFormData, amount: e.target.value})} />
                                </div>
                                <div className="sm-form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '25px' }}>
                                    <input type="checkbox" id="is_pct" checked={bonusFormData.is_percentage} onChange={e => setBonusFormData({...bonusFormData, is_percentage: e.target.checked})} />
                                    <label htmlFor="is_pct" style={{ marginBottom: 0 }}>Is Percentage (%)?</label>
                                </div>
                            </div>
                            <div className="sm-form-row">
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('Frequency', 'Frequency')}</label>
                                    <select className="sm-input" value={bonusFormData.frequency} onChange={e => setBonusFormData({...bonusFormData, frequency: e.target.value})}>
                                        <option value="monthly">Monthly</option>
                                        <option value="once">Once</option>
                                    </select>
                                </div>
                                {bonusFormData.frequency === 'once' && (
                                    <div className="sm-form-group">
                                        <label className="sm-label">Apply Month</label>
                                        <select className="sm-input" value={bonusFormData.apply_month || selectedMonth} onChange={e => setBonusFormData({...bonusFormData, apply_month: e.target.value})}>
                                            <option value="">Select Month...</option>
                                            {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="sm-modal-footer">
                            <button onClick={() => setIsBonusModalOpen(false)} className="sm-btn-secondary">{t('Cancel', 'Cancel')}</button>
                            <button onClick={handleSaveBonusRule} className="sm-btn-primary">
                                <i className="bi bi-check-lg"></i> {t('SaveRule', 'Save Rule')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Deduction Modal */}
            {isDedModalOpen && (
                <div className="sm-modal-overlay">
                    <div className="sm-modal" style={{ maxWidth: '450px' }}>
                        <div className="sm-modal-header">
                            <div>
                                <h2 className="sm-modal-title">{t('AddAdjustment', 'Add Adjustment')}</h2>
                                <p className="sm-modal-subtitle">{t('AddAdjSubtitle', 'Bonuses, Penalties, or manual adjustments')}</p>
                            </div>
                            <button onClick={() => setIsDedModalOpen(false)} className="sm-modal-close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="sm-modal-body">
                            <div className="sm-form-group">
                                <label className="sm-label">{t('Type', 'Adjustment Type')}</label>
                                <select 
                                    className="sm-input" 
                                    value={dedFormData.deduction_type} 
                                    onChange={e => setDedFormData({...dedFormData, deduction_type: e.target.value, is_addition: ['bonus', 'reward'].includes(e.target.value)})}
                                >
                                    <option value="penalty">{t('Penalty', 'Penalty')}</option>
                                    <option value="bonus">{t('Bonus', 'Bonus')}</option>
                                    <option value="reward">{t('Reward', 'Reward')}</option>
                                    <option value="absence">{t('Absence', 'Absence')}</option>
                                    <option value="other">{t('Other', 'Other')}</option>
                                </select>
                            </div>
                            <div className="sm-form-group">
                                <label className="sm-label">{t('Amount', 'Amount ($)')}</label>
                                <input 
                                    type="number" 
                                    className="sm-input" 
                                    value={dedFormData.amount} 
                                    onChange={e => setDedFormData({...dedFormData, amount: e.target.value})} 
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="sm-form-group">
                                <label className="sm-label">{t('Reason', 'Reason / Description')}</label>
                                <textarea 
                                    className="sm-input" 
                                    style={{ height: '80px', paddingTop: '10px' }}
                                    value={dedFormData.reason} 
                                    onChange={e => setDedFormData({...dedFormData, reason: e.target.value})}
                                    placeholder={t('ReasonPlaceholder', 'Why is this being applied?')}
                                />
                            </div>
                        </div>
                        <div className="sm-modal-footer">
                            <button onClick={() => setIsDedModalOpen(false)} className="sm-btn-secondary">{t('Cancel', 'Cancel')}</button>
                            <button onClick={handleSaveDed} className="sm-btn-primary">
                                <i className="bi bi-check-lg"></i> {t('ApplyAdjustment', 'Apply Adjustment')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyPayroll;
