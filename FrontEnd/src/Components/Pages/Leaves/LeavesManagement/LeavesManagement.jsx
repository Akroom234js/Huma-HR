import React, { useState, useEffect, useMemo } from 'react';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import AddLeaves from '../AddLeaves/AddLeaves';
import './LeavesManagement.css';
import { useTranslation } from 'react-i18next';
import Avatar from '../../../Shared/Avatar/Avatar';
import apiClient from '../../../../apiConfig';

export default function LeavesManagement() {
    const { t } = useTranslation('Leaves/LeavesManagement');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showPolicy, setShowPolicy] = useState(false);

    const [requestsList, setRequestsList] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, typeFilter]);

    const handleAction = async (id, status) => {
        let reason = '';
        if (status === 'rejected') {
            reason = prompt(t('EnterRejectReason') || "Enter reason for rejection:");
            if (reason === null) return; // cancelled
        }
        
        try {
            await apiClient.patch(`/requests/${id}/status`, { status, reason });
            fetchRequests();
        } catch (error) {
            console.error('Error updating request status:', error);
            alert(error.response?.data?.message || 'Failed to update status.');
        }
    };

    const handleAddLeaveType = async (newType) => {
        try {
            await apiClient.post('/leave-types', newType);
            fetchLeaveTypes();
            toggleAddModal();
        } catch (error) {
            console.error('Error adding leave type:', error);
            alert(error.response?.data?.message || 'Failed to add leave type.');
        }
    };

    const displayLeaveTypes = leaveTypes.map(t => {
        let icon = 'event_available';
        let color = 'blue';
        const nameLower = t.name_en.toLowerCase();
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
            key: t.name_en,
            name_en: t.name_en,
            name_ar: t.name_ar,
            descEn: t.desc_en || 'Policy rule configuration.',
            descAr: t.desc_ar || 'إعداد سياسة إجازة.',
            icon: icon,
            color: color
        };
    });

    const mappedRequests = useMemo(() => {
        return requestsList.map(req => {
            const employeeName = req.employee_profile?.full_name || "Unknown Employee";
            const start = req.details?.start_date || "-";
            const duration = req.details?.duration || 1;
            
            let end = req.details?.end_date;
            if (!end && start && start !== '-') {
                try {
                    const startDateObj = new Date(start);
                    startDateObj.setDate(startDateObj.getDate() + duration - 1);
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

    const toggleAddModal = () => {
        setIsAddModalOpen(!isAddModalOpen);
        if (!isAddModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    };

    return (
        <div className="portal-page-container-leaves fade-in-section">
            {/* Header Area */}
            <header className="leaves-portal-header-wrapper">
                <div className="leaves-portal-title-area">
                    <div>
                        <span className="premium-subtitle">{t('track') || "Leaves Tracking"}</span>
                        <h1>{t("LeavesManagement") || "Leaves Management"}</h1>
                    </div>
                    <div className="header-actions-flex">
                        <button 
                            className={`premium-btn-secondary ${showPolicy ? 'active' : ''}`} 
                            onClick={() => setShowPolicy(!showPolicy)}
                        >
                            <span className="material-symbols-outlined">{showPolicy ? 'visibility_off' : 'visibility'}</span>
                            {showPolicy ? (t('HidePolicy') || "Hide Policy") : (t('ShowPolicy') || "Show Policy")}
                        </button>
                        <button className="premium-btn-primary" onClick={toggleAddModal}>
                            <span className="material-symbols-outlined">add</span>
                            {t('add') || "Add Leave Type"}
                        </button>
                    </div>
                </div>
                <div className="leaves-theme-toggle">
                    <ThemeToggle />
                </div>
            </header>

            {/* Stats Overview Grid */}
            <div className="premium-stats-grid">
                <div className="premium-stat-card">
                    <div className="stat-card-header">
                        <span className="premium-stat-label">{t('Pending') || "Pending Requests"}</span>
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
                        <span className="premium-stat-label">{t('Approved') || "Approved Requests"}</span>
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

            {/* Main Content Table Section */}
            <div className="premium-card-section">
                <div className="filter-section-header">
                    <div className="section-title-with-icon">
                        <span className="material-symbols-outlined">table_chart</span>
                        <h3>{t('RequestsTable') || "Requests Table"}</h3>
                    </div>
                    <div className="filters-controls-row">
                        <div className="filter-item">
                            <select 
                                className="premium-select-input"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">{t('FilterbyStatus') || "All Statuses"}</option>
                                <option value="Approved">{t("Approved") || "Approved"}</option>
                                <option value="Pending">{t("Pending") || "Pending"}</option>
                                <option value="Rejected">{t("Rejected") || "Rejected"}</option>
                            </select>
                        </div>
                        <div className="filter-item">
                            <select 
                                className="premium-select-input"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">{t('FilterbyLeaveType') || "All Types"}</option>
                                {displayLeaveTypes.map(type => (
                                    <option key={type.key} value={type.key}>{type.name_en} {type.name_ar ? `(${type.name_ar})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="premium-table-container">
                    <table className="premium-data-table">
                        <thead>
                            <tr>
                                <th>{t('EMPLOYEE') || "Employee"}</th>
                                <th>{t("LEAVETYPE") || "Leave Type"}</th>
                                <th>{t("FROMDATE") || "From Date"}</th>
                                <th>{t("TODATE") || "To Date"}</th>
                                <th>{t("LEAVESREMAINING") || "Leaves Remaining"}</th>
                                <th>{t("STATUS") || "Status"}</th>
                                <th>{t("ACTIONS") || "Actions"}</th>
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
                                            {req.status}
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

            {/* Policy Overview Section - Animated Visibility */}
            <div className={`premium-card-section policy-section collapsible-section ${showPolicy ? 'expanded' : 'collapsed'}`}>
                <div className="policy-header">
                    <div className="title-flex">
                        <span className="material-symbols-outlined">gavel</span>
                        <h3>{t("PolicyOverview") || "Policy Overview"}</h3>
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
                                <h4>{t("Eligibility") || "Eligibility"}</h4>
                            </div>
                            <p className="policy-text">{t("Eligibility1") || "All full-time employees are eligible for paid leave after completing their probation period."}</p>
                        </div>

                        <div className="policy-block full-width">
                            <div className="block-title">
                                <span className="material-symbols-outlined">category</span>
                                <h4>{t("Types") || "Leave Types"}</h4>
                            </div>
                            <div className="types-grid">
                                {displayLeaveTypes.map((type, idx) => (
                                    <div key={idx} className="type-card-mini">
                                        <div className={`type-icon-box bg-${type.color}`}>
                                            <span className="material-symbols-outlined">{type.icon}</span>
                                        </div>
                                        <div className="type-info">
                                            <span className="type-name">{type.name_en} {type.name_ar ? `(${type.name_ar})` : ''}</span>
                                            <p className="type-desc">{type.descEn}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="policy-block">
                            <div className="block-title">
                                <span className="material-symbols-outlined">send_and_archive</span>
                                <h4>{t("Request") || "How to Request"}</h4>
                            </div>
                            <p className="policy-text">{t("Request1") || "Request must be submitted through the portal at least 3 days prior to the start date."}</p>
                            <p className="policy-text-note">{t("Request2") || "Note: Medical certificates are mandatory for sick leaves longer than 2 days."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <AddLeaves 
                    isOpen={isAddModalOpen} 
                    onClose={toggleAddModal} 
                    onAddType={handleAddLeaveType}
                />
            )}
        </div>
    );
}