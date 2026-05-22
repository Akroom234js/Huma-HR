import React, { useState } from 'react';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import AddLeaves from '../AddLeaves/AddLeaves';
import './LeavesManagement.css';
import { useTranslation } from 'react-i18next';
import Avatar from '../../../Shared/Avatar/Avatar';

export default function LeavesManagement() {
    const { t } = useTranslation('Leaves/LeavesManagement');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showPolicy, setShowPolicy] = useState(false);

    const leaveTypes = [
        { key: 'Vacation', descKey: 'Vacation1', icon: 'beach_access', color: 'blue' },
        { key: 'Sick', descKey: 'Sick1', icon: 'medical_services', color: 'red' },
        { key: 'Personal', descKey: 'Personal1', icon: 'person', color: 'amber' },
        { key: 'Bereavement', descKey: 'Bereavement1', icon: 'church', color: 'purple' },
        { key: 'Parental', descKey: 'Parental1', icon: 'child_care', color: 'emerald' }
    ];

    const requests = [
        { id: 1, employee: "John Doe", type: "Vacation", from: "2024-08-15", to: "2024-08-20", remaining: 10, status: "Pending" },
        { id: 2, employee: "Jane Smith", type: "Sick", from: "2024-08-10", to: "2024-08-12", remaining: 5, status: "Approved" },
        { id: 3, employee: "Mike Ross", type: "Personal", from: "2024-08-18", to: "2024-08-18", remaining: 12, status: "Rejected" },
        { id: 4, employee: "Rachel Zane", type: "Vacation", from: "2024-09-01", to: "2024-09-10", remaining: 8, status: "Pending" }
    ];

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
                        <span className="premium-stat-value">12</span>
                    </div>
                    <div className="stat-card-glow"></div>
                </div>
                <div className="premium-stat-card">
                    <div className="stat-card-header">
                        <span className="premium-stat-label">{t('Approved') || "Approved Today"}</span>
                        <div className="stat-icon-wrapper">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                    </div>
                    <div className="stat-card-body">
                        <span className="premium-stat-value">5</span>
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
                                <option value="">{t('FilterbyLeaveType') || "All Types"}</option>
                                {leaveTypes.map(type => (
                                    <option key={type.key} value={type.key}>{t(type.key)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-item">
                            <input className="premium-date-input" type="date" />
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
                            {requests.map((req) => (
                                <tr key={req.id} className="premium-table-row">
                                    <td className="emp-avatar-cell">
                                        <Avatar user={{ full_name: req.employee }} size="sm" />
                                        <span className="emp-full-name">{req.employee}</span>
                                    </td>
                                    <td className="type-column-bold">{t(req.type)}</td>
                                    <td className="text-secondary-dim">{req.from}</td>
                                    <td className="text-secondary-dim">{req.to}</td>
                                    <td className="font-bold text-accent">{req.remaining}</td>
                                    <td>
                                        <span className={`premium-status-badge ${req.status.toLowerCase()}`}>
                                            {t(req.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons-flex">
                                            <button className="action-btn-success" title="Approve">
                                                <span className="material-symbols-outlined">check</span>
                                            </button>
                                            <button className="action-btn-danger" title="Reject">
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                                {leaveTypes.map((type, idx) => (
                                    <div key={idx} className="type-card-mini">
                                        <div className={`type-icon-box bg-${type.color}`}>
                                            <span className="material-symbols-outlined">{type.icon}</span>
                                        </div>
                                        <div className="type-info">
                                            <span className="type-name">{t(type.key)}</span>
                                            <p className="type-desc">{t(type.descKey)}</p>
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

            {/* Add Modal */}
            {isAddModalOpen && (
                <AddLeaves 
                    isOpen={isAddModalOpen} 
                    onClose={toggleAddModal} 
                />
            )}
        </div>
    );
}