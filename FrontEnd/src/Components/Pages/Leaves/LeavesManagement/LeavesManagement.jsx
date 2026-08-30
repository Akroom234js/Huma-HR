import React, { useState, useEffect, useMemo } from 'react';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import AddLeaves from '../AddLeaves/AddLeaves';
import './LeavesManagement.css';
import { useTranslation } from 'react-i18next';
import Avatar from '../../../Shared/Avatar/Avatar';
import apiClient from '../../../../apiConfig';
import { useNotification } from '../../../Notification/NotificationContext';

export default function LeavesManagement() {
    const { t, i18n } = useTranslation('Leaves/LeavesManagement');
    const isAr = i18n.language === 'ar';
    const { showSuccess, showError, showWarning } = useNotification();

    // Sub-navigation tabs: 'requests' or 'balances'
    const [activeSubTab, setActiveSubTab] = useState('requests');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLeaveType, setEditingLeaveType] = useState(null);
    const [editingEmployeeBalance, setEditingEmployeeBalance] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [balanceSearch, setBalanceSearch] = useState('');
    const [showPolicy, setShowPolicy] = useState(false);

    // Data lists
    const [requestsList, setRequestsList] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [employeeBalances, setEmployeeBalances] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isBalancesLoading, setIsBalancesLoading] = useState(false);

    const fetchLeaveTypes = async () => {
        try {
            const response = await apiClient.get('/leave-types');
            setLeaveTypes(response.data.data || []);
        } catch (error) {
            console.error('Error fetching leave types:', error);
        }
    };

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter.toLowerCase();
            if (typeFilter) params.type = typeFilter;
            
            const response = await apiClient.get('/requests', { params });
            setRequestsList(response.data.data?.requests || []);
            setStats(response.data.data?.stats || { pending: 0, approved: 0, rejected: 0 });
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployeeBalances = async () => {
        setIsBalancesLoading(true);
        try {
            const response = await apiClient.get('/employee-balances');
            setEmployeeBalances(response.data.data || []);
        } catch (error) {
            console.error('Error fetching employee balances:', error);
        } finally {
            setIsBalancesLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
        fetchEmployeeBalances();
    }, []);

    useEffect(() => {
        if (activeSubTab === 'requests') {
            fetchRequests();
        } else if (activeSubTab === 'balances') {
            fetchEmployeeBalances();
        }
    }, [statusFilter, typeFilter, activeSubTab]);

    const handleAction = async (id, status) => {
        let reason = '';
        if (status === 'rejected') {
            reason = prompt(t('EnterRejectReason') || "Enter reason for rejection:");
            if (reason === null) return; // cancelled
        }
        
        try {
            await apiClient.patch(`/requests/${id}/status`, { status, reason });
            fetchRequests();
            fetchEmployeeBalances();
            showSuccess(status === 'approved' ? (t('approveSuccess') || 'Request approved successfully.') : (t('rejectSuccess') || 'Request rejected successfully.'));
        } catch (error) {
            console.error('Error updating request status:', error);
            showError(error, 'Failed to update status.');
        }
    };

    // Policy CRUD handlers
    const handleOpenAddModal = () => {
        setEditingLeaveType(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (type) => {
        setEditingLeaveType(type);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingLeaveType(null);
    };

    const handleAddOrEditLeaveType = async (typeData) => {
        try {
            if (typeData.id) {
                await apiClient.put(`/leave-types/${typeData.id}`, typeData);
                showSuccess(t('updateSuccess') || 'Leave type updated successfully.');
            } else {
                await apiClient.post('/leave-types', typeData);
                showSuccess(t('addSuccess') || 'Leave type created successfully.');
            }
            fetchLeaveTypes();
            fetchEmployeeBalances();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving leave type:', error);
            showError(error, 'Failed to save leave type.');
        }
    };

    const handleDeleteLeaveType = async (id) => {
        if (!window.confirm(t('confirmDelete') || 'Are you sure you want to delete this leave type?')) {
            return;
        }

        try {
            await apiClient.delete(`/leave-types/${id}`);
            showSuccess(t('deleteSuccess') || 'Leave type deleted successfully.');
            fetchLeaveTypes();
            fetchEmployeeBalances();
        } catch (error) {
            console.error('Error deleting leave type:', error);
            showError(error, t('deleteError') || 'Failed to delete leave type.');
        }
    };

    // Individual employee balance adjustment handlers
    const handleOpenEditBalanceModal = (emp, defaultTypeId = null) => {
        const firstType = leaveTypes.length > 0 ? leaveTypes[0].id : null;
        const targetTypeId = defaultTypeId || firstType;
        const existingBalance = (emp.leave_balances || []).find(b => b.leave_type_id === targetTypeId);

        setEditingEmployeeBalance({
            employeeId: emp.id,
            employeeName: emp.full_name,
            departmentName: emp.department?.name || '-',
            leaveTypeId: targetTypeId,
            allocated: existingBalance ? existingBalance.allocated : 24,
            used: existingBalance ? existingBalance.used : 0,
            allBalances: emp.leave_balances || []
        });
    };

    const handleLeaveTypeChangeInBalanceModal = (newTypeId) => {
        if (!editingEmployeeBalance) return;
        const matched = editingEmployeeBalance.allBalances.find(b => b.leave_type_id === Number(newTypeId));
        const typeMeta = leaveTypes.find(t => t.id === Number(newTypeId));

        setEditingEmployeeBalance(prev => ({
            ...prev,
            leaveTypeId: Number(newTypeId),
            allocated: matched ? matched.allocated : (typeMeta?.allocation || 15),
            used: matched ? matched.used : 0
        }));
    };

    const handleSaveEmployeeBalance = async (e) => {
        e.preventDefault();
        if (!editingEmployeeBalance) return;

        try {
            await apiClient.put(
                `/employee-balances/${editingEmployeeBalance.employeeId}/${editingEmployeeBalance.leaveTypeId}`,
                {
                    allocated: Number(editingEmployeeBalance.allocated) || 0,
                    used: Number(editingEmployeeBalance.used) || 0
                }
            );
            showSuccess(t('balanceUpdateSuccess') || 'Employee balance updated successfully.');
            setEditingEmployeeBalance(null);
            fetchEmployeeBalances();
        } catch (error) {
            console.error('Error adjusting employee balance:', error);
            showError(error, 'Failed to adjust employee balance.');
        }
    };

    const displayLeaveTypes = useMemo(() => {
        return leaveTypes.map(t => {
            let icon = 'event_available';
            let color = 'blue';
            const nameLower = (t.name_en || '').toLowerCase();
            if (nameLower.includes('sick')) {
                icon = 'medical_services';
                color = 'red';
            } else if (nameLower.includes('vacation') || nameLower.includes('annual')) {
                icon = 'beach_access';
                color = 'blue';
            } else if (nameLower.includes('emergency')) {
                icon = 'warning';
                color = 'purple';
            } else if (nameLower.includes('personal')) {
                icon = 'person';
                color = 'amber';
            } else if (nameLower.includes('parental')) {
                icon = 'child_care';
                color = 'emerald';
            }
            return {
                id: t.id,
                name_en: t.name_en,
                name_ar: t.name_ar,
                allocation: t.allocation,
                desc_en: t.desc_en,
                desc_ar: t.desc_ar,
                is_paid: t.is_paid,
                requires_approval: t.requires_approval,
                icon: icon,
                color: color
            };
        });
    }, [leaveTypes]);

    const mappedRequests = useMemo(() => {
        return requestsList.map(req => {
            const employeeName = req.employee_profile?.full_name || "Unknown Employee";
            const start = req.details?.start_date || "-";
            const duration = req.details?.duration || 1;
            
            let end = req.details?.end_date;
            if (!end && start && start !== '-') {
                try {
                    const startDateObj = new Date(start);
                    startDateObj.setDate(startDateObj.getDate() + Number(duration) - 1);
                    end = startDateObj.toISOString().split('T')[0];
                } catch (e) {
                    end = '-';
                }
            }

            return {
                id: req.id,
                employee: employeeName,
                type: req.type,
                from: start,
                to: end || '-',
                remaining: req.details?.remaining_balance !== undefined ? req.details.remaining_balance : 'N/A',
                status: req.status,
                attachmentUrl: req.details?.attachment_url || null,
                attachmentName: req.details?.attachment_name || null
            };
        });
    }, [requestsList]);

    // Filtered employee balances for the ledger
    const filteredEmployeeBalances = useMemo(() => {
        return employeeBalances.filter(emp => {
            if (!balanceSearch) return true;
            const searchLower = balanceSearch.toLowerCase();
            const matchName = (emp.full_name || '').toLowerCase().includes(searchLower);
            const matchId = (emp.employee_id || '').toLowerCase().includes(searchLower);
            const matchDept = (emp.department?.name || '').toLowerCase().includes(searchLower);
            return matchName || matchId || matchDept;
        });
    }, [employeeBalances, balanceSearch]);

    return (
        <div className={`portal-page-container-leaves fade-in-section ${isAr ? "rtl" : "ltr"}`}>
            {/* Header Area */}
            <header className="leaves-portal-header-wrapper">
                <div className="leaves-portal-title-area">
                    <div>
                        <span className="premium-subtitle">{t('track')}</span>
                        <h1>{t("LeavesManagement")}</h1>
                    </div>
                    <div className="header-actions-flex">
                        <button 
                            className={`premium-btn-secondary ${showPolicy ? 'active' : ''}`} 
                            onClick={() => setShowPolicy(!showPolicy)}
                        >
                            <span className="material-symbols-outlined">{showPolicy ? 'visibility_off' : 'visibility'}</span>
                            {showPolicy ? t('HidePolicy') : t('ShowPolicy')}
                        </button>
                        <button className="premium-btn-primary" onClick={handleOpenAddModal}>
                            <span className="material-symbols-outlined">add</span>
                            {t('add')}
                        </button>
                    </div>
                </div>
                <div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>
            </header>

            {/* Sub-navigation Tabs: Requests Log vs Employee Balances Ledger */}
            <div className="leaves-subnav-tabs">
                <button 
                    className={`leaves-subtab-btn ${activeSubTab === 'requests' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('requests')}
                >
                    <span className="material-symbols-outlined">pending_actions</span>
                    {t('tabRequests')}
                </button>
                <button 
                    className={`leaves-subtab-btn ${activeSubTab === 'balances' ? 'active' : ''}`}
                    onClick={() => setActiveSubTab('balances')}
                >
                    <span className="material-symbols-outlined">badge</span>
                    {t('tabBalances')}
                </button>
            </div>

            {/* Stats Overview Grid */}
            <div className="premium-stats-grid">
                <div className="premium-stat-card">
                    <div className="stat-card-header">
                        <span className="premium-stat-label">{t('Pending')}</span>
                        <div className="stat-icon-wrapper">
                            <span className="material-symbols-outlined">pending_actions</span>
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <span className="premium-stat-value">{stats.pending}</span>
                    </div>
                    <div className="stat-card-glow"></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-card-header">
                        <span className="premium-stat-label">{t('Approved')}</span>
                        <div className="stat-icon-wrapper">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <span className="premium-stat-value">{stats.approved}</span>
                    </div>
                    <div className="stat-card-glow"></div>
                </div>
            </div>

            {/* TAB 1: Main Requests Table Section */}
            {activeSubTab === 'requests' && (
                <div className="premium-card-section">
                    <div className="filter-section-header">
                        <div className="section-title-with-icon">
                            <span className="material-symbols-outlined">table_chart</span>
                            <h3>{t('RequestsTable')}</h3>
                        </div>
                        <div className="filters-controls-row">
                            <div className="filter-item">
                                <select 
                                    className="premium-select-input"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">{t('FilterbyStatus')}</option>
                                    <option value="Approved">{t("Approved")}</option>
                                    <option value="Pending">{t("Pending")}</option>
                                    <option value="Rejected">{t("Rejected")}</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <select 
                                    className="premium-select-input"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="">{t('FilterbyLeaveType')}</option>
                                    {displayLeaveTypes.map(type => (
                                        <option key={type.id} value={type.name_en}>
                                            {isAr ? (type.name_ar || type.name_en) : (type.name_en || type.name_ar)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="premium-table-container">
                        <table className="premium-data-table">
                            <thead>
                                <tr>
                                    <th>{t('EMPLOYEE')}</th>
                                    <th>{t("LEAVETYPE")}</th>
                                    <th>{t("FROMDATE")}</th>
                                    <th>{t("TODATE")}</th>
                                    <th>{t("LEAVESREMAINING")}</th>
                                    <th>{t("STATUS")}</th>
                                    <th>{t("ACTIONS")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="premium-empty-cell">
                                            <div className="empty-state-content">
                                                <span className="material-symbols-outlined premium-spinner">sync</span>
                                                <p>Loading requests...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : mappedRequests.length > 0 ? mappedRequests.map((req) => (
                                    <tr key={req.id} className="premium-table-row">
                                        <td className="emp-avatar-cell">
                                            <Avatar user={{ full_name: req.employee }} size="sm" />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="emp-full-name">{req.employee}</span>
                                                {req.attachmentUrl && (
                                                    <a href={req.attachmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#1890ff', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>attach_file</span>
                                                        {req.attachmentName || 'Attachment'}
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="type-column-bold">{req.type}</td>
                                        <td className="text-secondary-dim">{req.from}</td>
                                        <td className="text-secondary-dim">{req.to}</td>
                                        <td className="font-bold text-accent">{req.remaining}</td>
                                        <td>
                                            <span className={`premium-status-badge ${req.status.toLowerCase()}`}>
                                                {t(req.status, req.status)}
                                            </span>
                                        </td>
                                        <td>
                                            {req.status.toLowerCase() === 'pending' ? (
                                                <div className="action-buttons-flex">
                                                    <button className="action-btn-success" title="Approve" onClick={() => handleAction(req.id, 'approved')}>
                                                        <span className="material-symbols-outlined">check</span>
                                                    </button>
                                                    <button className="action-btn-danger" title="Reject" onClick={() => handleAction(req.id, 'rejected')}>
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-secondary-dim">-</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="premium-empty-cell">
                                            <div className="empty-state-content">
                                                <span className="material-symbols-outlined empty-icon">search_off</span>
                                                <p>{t('NoData', 'No matching records found')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: Employee Balances Ledger Section */}
            {activeSubTab === 'balances' && (
                <div className="premium-card-section">
                    <div className="filter-section-header">
                        <div className="section-title-with-icon">
                            <span className="material-symbols-outlined">account_balance_wallet</span>
                            <h3>{t('tabBalances')}</h3>
                        </div>
                        <div className="search-input-wrapper">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input 
                                type="text"
                                className="search-input-field"
                                placeholder={t('searchEmployees')}
                                value={balanceSearch}
                                onChange={(e) => setBalanceSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="premium-table-container">
                        <table className="premium-data-table">
                            <thead>
                                <tr>
                                    <th>{t('EMPLOYEE')}</th>
                                    <th>{t('Types')}</th>
                                    <th>{t('ACTIONS')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isBalancesLoading ? (
                                    <tr>
                                        <td colSpan="3" className="premium-empty-cell">
                                            <div className="empty-state-content">
                                                <span className="material-symbols-outlined premium-spinner">sync</span>
                                                <p>Loading employee balances...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEmployeeBalances.length > 0 ? (
                                    filteredEmployeeBalances.map((emp) => (
                                        <tr key={emp.id} className="premium-table-row">
                                            <td className="emp-avatar-cell">
                                                <Avatar user={{ full_name: emp.full_name }} size="sm" />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span className="emp-full-name">{emp.full_name}</span>
                                                    <small className="text-secondary-dim">{emp.department?.name || 'Department'} • {emp.employee_id}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="balance-pills-container">
                                                    {(emp.leave_balances && emp.leave_balances.length > 0) ? (
                                                        emp.leave_balances.map(b => (
                                                            <span key={b.id} className="balance-pill" title={`Used: ${b.used} days`}>
                                                                {isAr ? (b.leave_type?.name_ar || b.leave_type?.name_en) : (b.leave_type?.name_en || b.leave_type?.name_ar)}: 
                                                                <strong> {b.remaining}/{b.allocated} {t('days')}</strong>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-secondary-dim" style={{ fontSize: '0.8rem' }}>No balances assigned</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <button 
                                                    className="premium-btn-secondary" 
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                                                    onClick={() => handleOpenEditBalanceModal(emp)}
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
                                                    {t('editEmployeeBalance')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="premium-empty-cell">
                                            <div className="empty-state-content">
                                                <span className="material-symbols-outlined empty-icon">search_off</span>
                                                <p>{t('noBalancesFound')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Policy Overview Section - Animated Visibility */}
            <div className={`premium-card-section policy-section collapsible-section ${showPolicy ? 'expanded' : 'collapsed'}`}>
                <div className="policy-header">
                    <div className="title-flex">
                        <span className="material-symbols-outlined">gavel</span>
                        <h3>{t("PolicyOverview")}</h3>
                    </div>
                    <button className="btn-close-policy" onClick={() => setShowPolicy(false)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="policy-content-wrapper">
                    <div className="policy-grid-layout">
                        <div className="policy-block">
                            <div className="block-title">
                                <span className="material-symbols-outlined">verified_user</span>
                                <h4>{t("Eligibility")}</h4>
                            </div>
                            <p className="policy-text">{t("Eligibility1")}</p>
                        </div>

                        <div className="policy-block full-width">
                            <div className="block-title">
                                <span className="material-symbols-outlined">category</span>
                                <h4>{t("Types")}</h4>
                            </div>
                            <div className="types-grid">
                                {displayLeaveTypes.map((type) => (
                                    <div key={type.id} className="type-card-mini">
                                        <div className="type-card-left-flex">
                                            <div className={`type-icon-box bg-${type.color}`}>
                                                <span className="material-symbols-outlined">{type.icon}</span>
                                            </div>
                                            <div className="type-info">
                                                <span className="type-name">
                                                    {isAr ? (type.name_ar || type.name_en) : (type.name_en || type.name_ar)}
                                                </span>
                                                <p className="type-desc">
                                                    {isAr ? (type.desc_ar || type.desc_en) : (type.desc_en || type.desc_ar)}
                                                </p>
                                                <span className="type-allocation-badge">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>event</span>
                                                    {t('allocation')} {type.allocation} {t('days')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="type-actions-box">
                                            <button 
                                                className="type-btn-action edit-btn" 
                                                title={t('edit')} 
                                                onClick={() => handleOpenEditModal(type)}
                                                type="button"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button 
                                                className="type-btn-action delete-btn" 
                                                title={t('delete')} 
                                                onClick={() => handleDeleteLeaveType(type.id)}
                                                type="button"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="policy-block">
                            <div className="block-title">
                                <span className="material-symbols-outlined">send_and_archive</span>
                                <h4>{t("Request")}</h4>
                            </div>
                            <p className="policy-text">{t("Request1")}</p>
                            <p className="policy-text-note">{t("Request2")}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add & Edit Policy Modal */}
            {isAddModalOpen && (
                <AddLeaves 
                    isOpen={isAddModalOpen} 
                    onClose={handleCloseModal} 
                    onSubmit={handleAddOrEditLeaveType}
                    initialData={editingLeaveType}
                />
            )}

            {/* Modal: Edit Individual Employee Balance */}
            {editingEmployeeBalance && (
                <div className="edit-balance-overlay" onClick={() => setEditingEmployeeBalance(null)}>
                    <div className="edit-balance-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="edit-balance-header">
                            <h3>{t('editEmployeeBalance')}</h3>
                            <button className="btn-modal-close" onClick={() => setEditingEmployeeBalance(null)} type="button">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSaveEmployeeBalance}>
                            <div className="edit-balance-body">
                                <div className="emp-info-banner">
                                    <Avatar user={{ full_name: editingEmployeeBalance.employeeName }} size="sm" />
                                    <div>
                                        <strong>{editingEmployeeBalance.employeeName}</strong>
                                        <br />
                                        <span>{editingEmployeeBalance.departmentName}</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="premium-label">{t('selectLeaveType')}</label>
                                    <select 
                                        className="premium-select-input"
                                        style={{ width: '100%' }}
                                        value={editingEmployeeBalance.leaveTypeId}
                                        onChange={(e) => handleLeaveTypeChangeInBalanceModal(e.target.value)}
                                        required
                                    >
                                        {leaveTypes.map(tObj => (
                                            <option key={tObj.id} value={tObj.id}>
                                                {isAr ? (tObj.name_ar || tObj.name_en) : (tObj.name_en || tObj.name_ar)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="premium-label">{t('allocatedDays')}</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="365"
                                        required
                                        className="premium-select-input"
                                        style={{ width: '100%' }}
                                        value={editingEmployeeBalance.allocated}
                                        onChange={(e) => setEditingEmployeeBalance(prev => ({ ...prev, allocated: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="premium-label">{t('usedDays')}</label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="365"
                                        required
                                        className="premium-select-input"
                                        style={{ width: '100%' }}
                                        value={editingEmployeeBalance.used}
                                        onChange={(e) => setEditingEmployeeBalance(prev => ({ ...prev, used: e.target.value }))}
                                    />
                                </div>

                                <div className="balance-calc-preview">
                                    <span>{t('remainingDays')}:</span>
                                    <strong>
                                        {Math.max(0, (Number(editingEmployeeBalance.allocated) || 0) - (Number(editingEmployeeBalance.used) || 0))} {t('days')}
                                    </strong>
                                </div>
                            </div>

                            <div className="edit-balance-footer">
                                <button type="button" className="premium-btn-cancel" onClick={() => setEditingEmployeeBalance(null)}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" className="premium-btn-submit">
                                    <i className="bi bi-check2"></i> {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}