import React, { useState, useMemo, useEffect } from 'react';
import './Leaves.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import Requestaleave from './Requestaleave';
import apiClient from '../../../../apiConfig';

const Leaves = () => {
    const { t } = useTranslation("EmployeePortal/EmployeePortalLeaves");
    const [leaveType, setLeaveType] = useState("");
    const [status, setStatus] = useState("");
    
    const [leavesList, setLeavesList] = useState([]);
    const [balances, setBalances] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data from backend on mount
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [balancesRes, requestsRes, typesRes] = await Promise.all([
                apiClient.get('/my-leave-balances'),
                apiClient.get('/my-requests'),
                apiClient.get('/leave-types')
            ]);
            setBalances(balancesRes.data.data || []);
            setLeavesList(requestsRes.data.data || []);
            setLeaveTypes(typesRes.data.data || []);
        } catch (error) {
            console.error('Error fetching requests data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // States for Modals
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");

    // Stat configurations (dynamic based on balances from backend)
    const Type = balances.map(b => {
        const nameEn = b.leave_type?.name_en || 'Leave';
        const nameAr = b.leave_type?.name_ar || '';
        let icon = 'event_available';
        if (nameEn.toLowerCase().includes('sick')) {
            icon = 'medication';
        } else if (nameEn.toLowerCase().includes('annual')) {
            icon = 'flight_takeoff';
        } else if (nameEn.toLowerCase().includes('emergency')) {
            icon = 'emergency';
        } else if (nameEn.toLowerCase().includes('personal')) {
            icon = 'person';
        }
        return {
            label: `${nameEn} Balance ${nameAr ? `(${nameAr})` : ''}`,
            value: String(b.remaining),
            icon: icon
        };
    });

    const displayType = Type.length > 0 ? Type : [
        { label: t('stats.sick') || "Sick Leave Balance", value: "0", icon: "medication" },
        { label: t('stats.Annual') || "Annual Leave Balance", value: "0", icon: "flight_takeoff" }
    ];

    // Filter logic with mapping database fields for all kinds of requests
    const filteredLeaves = useMemo(() => {
        return leavesList
            .filter(item => {
                const matchType = !leaveType || (item.type && item.type.toLowerCase() === leaveType.toLowerCase());
                const matchStatus = !status || (item.status && item.status.toLowerCase() === status.toLowerCase());
                return matchType && matchStatus;
            })
            .map(item => {
                let typeLabel = item.type;
                let description = '-';
                let durationText = '-';

                const details = item.details ?? {};
                
                switch (item.type?.toLowerCase()) {
                    case 'vacation':
                    case 'leave':
                    case 'sick':
                    case 'annual':
                    case 'emergency':
                    case 'personal':
                        const start = details.start_date || item.dates || '-';
                        const dur = details.duration || item.duration || 1;
                        let end = details.end_date || item.datee;
                        if (!end && start && start !== '-') {
                            try {
                                const startDateObj = new Date(start);
                                startDateObj.setDate(startDateObj.getDate() + dur - 1);
                                end = startDateObj.toISOString().split('T')[0];
                            } catch (e) {
                                end = '-';
                            }
                        }
                        typeLabel = details.leave_type_name || item.type || 'Leave';
                        description = `From: ${start} To: ${end}`;
                        durationText = `${dur} Days`;
                        break;
                        
                    case 'advance':
                        typeLabel = 'Advance Request';
                        description = `Amount: ${details.amount || '-'} | Installments: ${details.installments || '-'} Months`;
                        durationText = '-';
                        break;
                        
                    case 'equipment':
                        typeLabel = 'Equipment Request';
                        description = `Device: ${details.deviceType || '-'} | Specs: ${details.specs || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'compensation':
                        typeLabel = 'Compensation Request';
                        description = `Amount: ${details.amount || '-'} | Category: ${details.category || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'data-update':
                        typeLabel = 'Data Update';
                        description = `Field: ${details.field || '-'} | Proposed: ${details.after || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'resignation':
                        typeLabel = 'Resignation';
                        description = `Last Day: ${details.lastWorkingDay || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'transfer':
                        typeLabel = 'Transfer';
                        description = `Current: ${details.currentDept || '-'} → New: ${details.newDept || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'promotion':
                        typeLabel = 'Promotion';
                        description = `Current: ${details.currentTitle || '-'} → Proposed: ${details.proposedTitle || '-'}`;
                        durationText = '-';
                        break;
                        
                    case 'experience-certificate':
                        typeLabel = 'Exp. Certificate';
                        description = `Purpose: ${details.purpose || '-'}`;
                        durationText = '-';
                        break;
                        
                    default:
                        typeLabel = item.type || 'Request';
                        description = item.reason || '-';
                        durationText = '-';
                        break;
                }

                return {
                    id: item.id,
                    type: typeLabel,
                    description: description,
                    duration: durationText,
                    status: item.status,
                    Discounts: details.discounts !== undefined ? details.discounts : '-',
                    reson: item.reason || '-'
                };
            });
    }, [leavesList, leaveType, status]);

    // Handlers for Request a leave modal
    const handleOpenRequestModal = () => {
        setIsRequestModalOpen(true);
        document.body.style.overflow = 'hidden';
        const element = document.querySelector('.reqleaveco');
        if (element) element.className = 'reqleavecovi';
    };

    const handleCloseRequestModal = () => {
        setIsRequestModalOpen(false);
        document.body.style.overflow = 'auto';
        const element = document.querySelector('.reqleavecovi');
        if (element) element.className = 'reqleaveco';
    };

    const handleAddLeaveRequest = (newLeave) => {
        fetchData();
        handleCloseRequestModal();
    };

    // Reason details modal logic
    const openModal = (reason) => {
        setSelectedReason(reason);
        setModalOpen(true);
        document.body.style.overflow = 'hidden';
        const themeToggle = document.querySelector(".mobile-toggle");
        if (themeToggle) themeToggle.style.zIndex = "-1";
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedReason("");
        document.body.style.overflow = 'auto';
        const themeToggle = document.querySelector(".mobile-toggle");
        if (themeToggle) themeToggle.style.zIndex = "10";
    };

    return (
        <div className="portal-page-container-leaves fade-in-section">
            {/* Dynamic + Legacy wrapper synchronization for Requestaleave */}
            <div className={isRequestModalOpen ? "reqleavecovi" : "reqleaveco"}>
                <Requestaleave 
                    isOpen={isRequestModalOpen} 
                    onClose={handleCloseRequestModal} 
                    onSubmit={handleAddLeaveRequest}
                    leaveTypes={leaveTypes}
                />
            </div>

            {/* Page Header */}
            <div className="leaves-portal-header-wrapper">
                <div className="leaves-portal-title-area">
                    <div>
                        <span className="premium-subtitle">Employee Portal</span>
                        <h1>{t("title") || "My Requests"}</h1>
                    </div>
                    <button className="premium-btn-primary" onClick={handleOpenRequestModal} type="button">
                        <span className="btn-glow-text">{t("SubmitRequest") || "Submit Request"}</span>
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
                <div className="leaves-theme-toggle">
                    <ThemeToggle />
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="premium-stats-grid">
                {displayType.map((s, i) => (
                    <div className="premium-stat-card" key={i}>
                        <div className="stat-card-header">
                            <span className="premium-stat-label">{s.label}</span>
                            <div className="stat-icon-wrapper">
                                <span className="material-symbols-outlined">{s.icon}</span>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <span className="premium-stat-value">{s.value}</span>
                            <span className="premium-stat-unit">{t("Days")}</span>
                        </div>
                        <div className="stat-card-glow"></div>
                    </div>
                ))}
            </div>

            {/* Filter Row Section */}
            <div className="premium-card-section">
                <div className="filter-section-header">
                    <div className="section-title-with-icon">
                        <span className="material-symbols-outlined">history</span>
                        <h3>{t("log") || "Requests Log"}</h3>
                    </div>
                    <div className="filters-controls-row">
                        <FilterDropdown
                            value={leaveType}
                            onChange={setLeaveType}
                            options={[
                                { value: "", label: t('filters.leave_type') || "All Request Types" }, 
                                { value: "vacation", label: "Vacation / Leave" },
                                { value: "advance", label: "Advance Request" },
                                { value: "equipment", label: "Equipment Request" },
                                { value: "compensation", label: "Compensation" },
                                { value: "data-update", label: "Data Update" },
                                { value: "resignation", label: "Resignation" },
                                { value: "transfer", label: "Transfer" },
                                { value: "promotion", label: "Promotion" },
                                { value: "experience-certificate", label: "Exp. Certificate" }
                            ]}
                        />
                        <FilterDropdown
                            value={status}
                            onChange={setStatus}
                            options={[
                                { value: "", label: t('filters.status') || "All Statuses" }, 
                                { value: "approved", label: t('status.approved') || "Approved" }, 
                                { value: "pending", label: t('status.pending') || "Pending" }, 
                                { value: "rejected", label: t('status.rejected') || "Rejected" }
                            ]}
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="premium-table-container">
                    <table className="premium-data-table">
                        <thead>
                            <tr>
                                <th>{t("TypeLeave") || "Request Type"}</th>
                                <th>{t('Description') || "Description / Details"}</th>
                                <th>{t('duration') || "Duration"}</th>
                                <th>{t('statusleave') || "Status"}</th>
                                <th>{t('Details') || "Details"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="premium-empty-cell">
                                        <div className="empty-state-content">
                                            <span className="material-symbols-outlined premium-spinner">sync</span>
                                            <p>Loading requests...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLeaves.length > 0 ? filteredLeaves.map(row => (
                                <tr key={row.id} className="premium-table-row">
                                    <td className="type-column-bold">
                                        <div className="type-badge-inline">
                                            <span className="material-symbols-outlined icon-xs">
                                                {row.type.toLowerCase().includes('sick') ? 'medical_services' : 
                                                 (row.type.toLowerCase().includes('annual') || row.type.toLowerCase().includes('vacation') ? 'beach_access' : 'assignment')}
                                            </span>
                                            {row.type}
                                        </div>
                                    </td>
                                    <td>{row.description}</td>
                                    <td><strong>{row.duration}</strong></td>
                                    <td>
                                        <span className={`premium-status-badge ${row.status.toLowerCase()}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td>
                                        {row.status.toLowerCase() === "rejected" ? (
                                            <button 
                                                className="premium-btn-view" 
                                                onClick={() => openModal(row.reson)}
                                                type="button"
                                            >
                                                <span className="material-symbols-outlined icon-view">visibility</span>
                                                {t('View') || "View"}
                                            </button>
                                        ) : (
                                            <span className="empty-dash">-</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="premium-empty-cell">
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

            {/* Policy Overview Section */}
            <div className="premium-card-section policy-section">
                <div className="policy-header">
                    <span className="material-symbols-outlined">policy</span>
                    <h3 className="PolicyOverview">{t("PolicyOverview") || "Policy Overview"}</h3>
                </div>
                <div className="policy-body">
                    <div className="policy-group">
                        <h4>{t("Types") || "Leave Types & Allocations"}</h4>
                        <ul className="premium-policy-list">
                            <li>
                                <div className="policy-type-meta">
                                    <span className="premium-policy-badge bg-amber">{t("Sick")}</span>
                                </div>
                                <p className="policy-type-description">{t("Sick1")}</p>
                            </li>
                            <li>
                                <div className="policy-type-meta">
                                    <span className="premium-policy-badge bg-blue">{t("Type.Annual") || "Annual"}</span>
                                </div>
                                <p className="policy-type-description">Standard leave provision intended for rest, recreation, and personal obligations.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Premium Reason Modal Overlay with Backdrop Blur */}
            {modalOpen && (
                <div className="premium-modal-overlay" onClick={closeModal}>
                    <div className="premium-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="premium-modal-header">
                            <div className="modal-title-with-icon">
                                <span className="material-symbols-outlined text-red">info</span>
                                <h3>{t('MoreDetails') || "Rejection Details"}</h3>
                            </div>
                            <button className="premium-close-icon" onClick={closeModal} aria-label="Close">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="premium-modal-body">
                            <div className="reason-container">
                                <strong>Reason provided by Reviewer:</strong>
                                <p className="premium-reason-text">{selectedReason}</p>
                            </div>
                        </div>
                        <div className="premium-modal-footer">
                            <button className="premium-btn-secondary" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;
