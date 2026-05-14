import React, { useState, useMemo } from 'react';
import './Leaves.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import Requestaleave from './Requestaleave';

const Leaves = () => {
    const { t } = useTranslation("EmployeePortal/EmployeePortalLeaves");
    const [leaveType, setLeaveType] = useState("");
    const [status, setStatus] = useState("");
    
    // Internal interactive state list initialized with original static data
    const [leavesList, setLeavesList] = useState([
        {
            id: 1,
            type: "Annual",
            dates: "2023-11-01",
            datee: "2023-11-03",
            duration: 3,
            status: "approved",
            Discounts: 100,
            reson: "-"
        },
        {
            id: 2,
            type: "Sick",
            dates: "2023-10-26",
            datee: "2023-10-27",
            duration: 1,
            status: "pending",
            Discounts: 100,
            reson: "-"
        },
        {
            id: 3,
            type: "Emergency",
            dates: "2023-10-20",
            datee: "2023-10-21",
            duration: 1,
            status: "rejected",
            Discounts: "-",
            reson: "More days than the default number of days."
        },
        {
            id: 4,
            type: "Annual",
            dates: "2023-12-20",
            datee: "2024-01-01",
            duration: 12,
            status: "pending",
            Discounts: 100,
            reson: "-"
        },
        {
            id: 5,
            type: "Sick",
            dates: "2023-11-05",
            datee: "2023-11-06",
            duration: 1,
            status: "pending",
            Discounts: "--",
            reson: "-"
        },
        {
            id: 6,
            type: "Annual",
            dates: "2023-11-10",
            datee: "2023-11-15",
            duration: 5,
            status: "pending",
            Discounts: 100,
            reson: "-"
        },
        {
            id: 7,  
            type: "Annual",
            dates: "2023-11-12",
            datee: "2023-11-14",
            duration: 2,
            status: "pending",
            Discounts: 100,
            reson: "-"
        }
    ]);

    // States for Modals
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState("");

    // Stat configurations
    const Type = [
        { label: t('stats.sick') || "Sick Leave Balance", value: "15", icon: "medication" },
        { label: t('stats.Annual') || "Annual Leave Balance", value: "24", icon: "flight_takeoff" }
    ];

    // Filter logic
    const filteredLeaves = useMemo(() => {
        return leavesList.filter(item => {
            const matchType = !leaveType || item.type.toLowerCase() === leaveType.toLowerCase();
            const matchStatus = !status || item.status.toLowerCase() === status.toLowerCase();
            return matchType && matchStatus;
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
        setLeavesList(prev => [newLeave, ...prev]);
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
                />
            </div>

            {/* Page Header */}
            <div className="leaves-portal-header-wrapper">
                <div className="leaves-portal-title-area">
                    <div>
                        <span className="premium-subtitle">Employee Portal</span>
                        <h1>{t("title") || "My Leaves"}</h1>
                    </div>
                    <button className="premium-btn-primary" onClick={handleOpenRequestModal} type="button">
                        <span className="btn-glow-text">{t("Requestaleave")}</span>
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>
                <div className="leaves-theme-toggle">
                    <ThemeToggle />
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="premium-stats-grid">
                {Type.map((s, i) => (
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
                        <h3>{t("log") || "Leave Log"}</h3>
                    </div>
                    <div className="filters-controls-row">
                        <FilterDropdown
                            value={leaveType}
                            onChange={setLeaveType}
                            options={[
                                { value: "", label: t('filters.leave_type') || "All Leave Types" }, 
                                { value: "annual", label: t("Type.Annual") || "Annual" }, 
                                { value: "sick", label: t("Type.Sick") || "Sick" }
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
                                <th>{t("TypeLeave") || "Leave Type"}</th>
                                <th>{t('Dates') || "Start Date"}</th>
                                <th>{t('Datee') || "End Date"}</th>
                                <th>{t('duration') || "Duration"}</th>
                                <th>{t('Discounts') || "Discounts"}</th>
                                <th>{t('statusleave') || "Status"}</th>
                                <th>{t('Details') || "Details"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.length > 0 ? filteredLeaves.map(row => (
                                <tr key={row.id} className="premium-table-row">
                                    <td className="type-column-bold">
                                        <div className="type-badge-inline">
                                            <span className="material-symbols-outlined icon-xs">
                                                {row.type.toLowerCase() === 'sick' ? 'medical_services' : 'event'}
                                            </span>
                                            {row.type}
                                        </div>
                                    </td>
                                    <td>{row.dates}</td>
                                    <td>{row.datee}</td>
                                    <td><strong>{row.duration}</strong> {t("Days")}</td>
                                    <td className="text-muted">{row.Discounts}</td>
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
