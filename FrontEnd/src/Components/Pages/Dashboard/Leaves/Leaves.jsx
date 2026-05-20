import React, { useState, useMemo } from 'react';
import './Leaves.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import { useTranslation } from "react-i18next";
import Avatar from '../../../Shared/Avatar/Avatar';

const Leaves = () => {
    const { t } = useTranslation("Dashboard/Leaves");
    const [searchTerm, setSearchTerm] = useState("");
    const [dept, setDept] = useState("");
    const [leaveType, setLeaveType] = useState("");
    const [status, setStatus] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const stats = [
        { label: t('stats.pending') || "Pending Requests", value: "15", icon: "pending_actions" },
        { label: t('stats.annual_balance') || "Annual Balance", value: "2,450 Days", icon: "account_balance" },
        { label: t('stats.highest_requester') || "Highest Requester", value: "John Doe", icon: "person_alert" },
        { label: t('stats.used_days') || "Used Days", value: "312", icon: "calendar_today" }
    ];

    const deptHeadcounts = {
        "IT": 20,
        "Marketing": 15,
        "HR": 8,
        "Sales": 25,
        "Design": 10
    };

    const leaveRequests = [
        {
            id: 1,
            name: "Olivia Rhye",
            dept: "IT",
            type: "Annual",
            dates: "2023-11-01 - 2023-11-03",
            duration: 3,
            status: "approved",
            balance: 17,
            reason: "Family vacation to Europe.",
            avatar: "https://i.pravatar.cc/150?u=olivia"
        },
        {
            id: 2,
            name: "Phoenix Baker",
            dept: "Marketing",
            type: "Sick",
            dates: "2023-10-26",
            duration: 1,
            status: "pending",
            balance: 9,
            reason: "Flu and high fever.",
            avatar: "https://i.pravatar.cc/150?u=phoenix"
        },
        {
            id: 3,
            name: "Lana Steiner",
            dept: "HR",
            type: "Emergency",
            dates: "2023-10-20",
            duration: 1,
            status: "rejected",
            balance: 4,
            reason: "Personal emergency at home.",
            avatar: "https://i.pravatar.cc/150?u=lana"
        },
        {
            id: 4,
            name: "Candice Wu",
            dept: "IT",
            type: "Annual",
            dates: "2023-12-20 - 2024-01-05",
            duration: 12,
            status: "pending",
            balance: 8,
            reason: "Winter holiday with family.",
            avatar: "https://i.pravatar.cc/150?u=candice"
        },
        {
            id: 5,
            name: "Lara Maciel",
            dept: "IT",
            type: "Sick",
            dates: "2023-11-05",
            duration: 1,
            status: "pending",
            balance: 12,
            reason: "Doctor appointment.",
            avatar: "https://i.pravatar.cc/150?u=lara"
        },
        {
            id: 6,
            name: "Zayn Malik",
            dept: "IT",
            type: "Annual",
            dates: "2023-11-10",
            duration: 5,
            status: "pending",
            balance: 20,
            reason: "Personal leave.",
            avatar: "https://i.pravatar.cc/150?u=zayn"
        },
        {
            id: 7,
            name: "Gigi Hadid",
            dept: "Marketing",
            type: "Annual",
            dates: "2023-11-12",
            duration: 2,
            status: "pending",
            balance: 15,
            reason: "Event attendance.",
            avatar: "https://i.pravatar.cc/150?u=gigi"
        }
    ];

    const filteredRequests = useMemo(() => {
        return leaveRequests.filter(req => {
            const matchSearch = !searchTerm || req.name.toLowerCase().includes(searchTerm.toLowerCase()) || req.reason.toLowerCase().includes(searchTerm.toLowerCase());
            const matchDept = !dept || req.dept.toLowerCase() === dept.toLowerCase();
            const matchType = !leaveType || req.type.toLowerCase() === leaveType.toLowerCase();
            const matchStatus = !status || req.status.toLowerCase() === status.toLowerCase();
            return matchSearch && matchDept && matchType && matchStatus;
        });
    }, [leaveRequests, searchTerm, dept, leaveType, status]);

    const calculatedImpacts = useMemo(() => {
        const counts = {};
        leaveRequests.forEach(req => {
            if (req.status !== 'rejected') {
                counts[req.dept] = (counts[req.dept] || 0) + 1;
            }
        });

        return Object.keys(deptHeadcounts).map(deptKey => {
            const count = counts[deptKey] || 0;
            const total = deptHeadcounts[deptKey];
            const percent = Math.round((count / total) * 100);

            let impact = "low";
            if (percent > 20) impact = "high";
            else if (percent >= 10) impact = "medium";

            return {
                name: `${deptKey} Department`,
                percent,
                impact
            };
        }).sort((a, b) => b.percent - a.percent);
    }, [leaveRequests]);

    const openDetails = (req) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeDetails = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <div className="portal-page-container-leaves fade-in-section">
            {/* Header Area styled identical to the premium site pattern */}
            <div className="leaves-portal-header-wrapper">
                <div className="leaves-portal-title-area">
                    <div>
                        <span className="premium-subtitle">Management Dashboard</span>
                        <h1>{t('title') || "Leaves Management"}</h1>
                    </div>
                </div>
                <div className="leaves-theme-toggle">
                    <ThemeToggle />
                </div>
            </div>

            {/* Premium Stats Overview Grid compatible with Employee View */}
            <div className="premium-stats-grid">
                {stats.map((s, i) => (
                    <div className="premium-stat-card" key={i}>
                        <div className="stat-card-header">
                            <span className="premium-stat-label">{s.label}</span>
                            <div className="stat-icon-wrapper">
                                <span className="material-symbols-outlined">{s.icon}</span>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <span className="premium-stat-value">{s.value}</span>
                        </div>
                        <div className="stat-card-glow"></div>
                    </div>
                ))}
            </div>

            {/* Single Unified Premium Card Section enclosing Filters and Main Table */}
            <div className="premium-card-section">
                <div className="filter-section-header multi-row-header">
                    <div className="search-input-wrapper custom-search-bar">
                        <span className="material-symbols-outlined search-icon">search</span>
                        <input
                            type="text"
                            className="premium-search-input"
                            placeholder={t('filters.search') || "Search employee name or reasons..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filters-controls-row">
                        <FilterDropdown
                            value={dept}
                            onChange={setDept}
                            options={[
                                { value: "", label: t('filters.department') || "All Departments" }, 
                                { value: "it", label: "IT" }, 
                                { value: "marketing", label: "Marketing" }, 
                                { value: "hr", label: "HR" }
                            ]}
                        />
                        <FilterDropdown
                            value={leaveType}
                            onChange={setLeaveType}
                            options={[
                                { value: "", label: t('filters.leave_type') || "All Leave Types" }, 
                                { value: "annual", label: "Annual" }, 
                                { value: "sick", label: "Sick" }, 
                                { value: "emergency", label: "Emergency" }
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

                <div className="premium-table-container">
                    <table className="premium-data-table">
                        <thead>
                            <tr>
                                <th>{t('table.emp_name') || "Employee Name"}</th>
                                <th>{t('table.leave_type') || "Leave Type"}</th>
                                <th>{t('table.date_range') || "Date Range"}</th>
                                <th>{t('table.duration') || "Duration"}</th>
                                <th>{t('table.status') || "Status"}</th>
                                <th>{t('table.rem_balance') || "Remaining Balance"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                                <tr key={req.id} onClick={() => openDetails(req)} className="premium-table-row clickable">
                                    <td className="emp-avatar-cell">
                                        <Avatar user={{ full_name: req.name }} size="sm" />
                                        <div className="emp-info-col">
                                            <span className="emp-full-name">{req.name}</span>
                                            <span className="emp-dept-badge">{req.dept}</span>
                                        </div>
                                    </td>
                                    <td className="type-column-bold">{req.type}</td>
                                    <td className="text-secondary-dim">{req.dates}</td>
                                    <td><strong>{req.duration}</strong> Days</td>
                                    <td>
                                        <span className={`premium-status-badge ${req.status}`}>
                                            {t(`status.${req.status}`) || req.status}
                                        </span>
                                    </td>
                                    <td className="font-bold text-accent">{req.balance} Days</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="premium-empty-cell">
                                        <div className="empty-state-content">
                                            <span className="material-symbols-outlined empty-icon">event_busy</span>
                                            <p>No leave requests found matching the active criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Analytics Reports Grid matching unified site widgets */}
            <div className="dashboard-reports-grid">
                <div className="premium-card-section report-widget">
                    <div className="widget-header">
                        <span className="material-symbols-outlined icon-glow">donut_large</span>
                        <h3>{t('reports.distribution') || "Leave Type Distribution"}</h3>
                    </div>
                    <div className="chart-preview-container">
                        <div className="premium-pie-mock">
                            <div className="pie-slice annual"></div>
                            <div className="pie-slice sick"></div>
                            <div className="pie-slice emergency"></div>
                            <div className="pie-inner-circle">
                                <span className="pie-total-label">Total</span>
                                <span className="pie-total-val">100%</span>
                            </div>
                        </div>
                        <div className="premium-chart-legend">
                            <div className="legend-item"><span className="legend-dot bg-blue"></span> Annual (40%)</div>
                            <div className="legend-item"><span className="legend-dot bg-amber"></span> Sick (30%)</div>
                            <div className="legend-item"><span className="legend-dot bg-red"></span> Emergency (20%)</div>
                            <div className="legend-item"><span className="legend-dot bg-emerald"></span> Other (10%)</div>
                        </div>
                    </div>
                </div>

                <div className="premium-card-section report-widget">
                    <div className="widget-header">
                        <span className="material-symbols-outlined icon-glow">moving</span>
                        <h3>{t('reports.impactful') || "Departmental Leave Impact"}</h3>
                    </div>
                    <div className="premium-impact-list">
                        {calculatedImpacts.map((item, i) => (
                            <div className="premium-impact-item" key={i}>
                                <div className="impact-main-area">
                                    <div className="impact-title-row">
                                        <span className="impact-dept-name">{item.name}</span>
                                        <span className="impact-percent-val">{item.percent}%</span>
                                    </div>
                                    <div className="impact-bar-track">
                                        <div
                                            className={`impact-bar-fill ${item.impact}`}
                                            style={{ width: `${item.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className={`impact-severity-tag ${item.impact}`}>
                                    {t(`impact.${item.impact}`) || item.impact}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="comparison-preview-area">
                        <div className="widget-header mini">
                            <span className="material-symbols-outlined icon-glow">bar_chart</span>
                            <h3>{t('reports.comparison') || "Monthly Trend Comparison"}</h3>
                        </div>
                        <div className="premium-bars-wrapper">
                            <div className="chart-bar-col"><div className="chart-bar-fill" style={{ height: '60%' }}></div><span>Q1</span></div>
                            <div className="chart-bar-col"><div className="chart-bar-fill" style={{ height: '85%' }}></div><span>Q2</span></div>
                            <div className="chart-bar-col"><div className="chart-bar-fill active" style={{ height: '40%' }}></div><span>Q3</span></div>
                            <div className="chart-bar-col"><div className="chart-bar-fill" style={{ height: '95%' }}></div><span>Q4</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Details Modal Overlay with Full Glassmorphism Blur */}
            {isModalOpen && selectedRequest && (
                <div className="premium-modal-overlay" onClick={closeDetails}>
                    <div className="premium-modal-card review-modal" onClick={e => e.stopPropagation()}>
                        <div className="premium-modal-header">
                            <div className="modal-reviewer-info">
                                <Avatar user={{ full_name: selectedRequest.name }} size="md" />
                                <div>
                                    <h3 className="modal-emp-name">{selectedRequest.name}</h3>
                                    <span className="modal-emp-dept">{selectedRequest.dept} Department</span>
                                </div>
                            </div>
                            <button className="premium-close-icon" onClick={closeDetails} aria-label="Close">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        
                        <div className="premium-modal-body">
                            <div className="detail-meta-grid">
                                <div className="meta-box">
                                    <span className="meta-label">Leave Type</span>
                                    <span className="meta-val font-bold">{selectedRequest.type}</span>
                                </div>
                                <div className="meta-box">
                                    <span className="meta-label">{t('modal.duration') || "Duration"}</span>
                                    <span className="meta-val font-bold text-accent">{selectedRequest.duration} {t('modal.days') || "Days"}</span>
                                </div>
                                <div className="meta-box col-full">
                                    <span className="meta-label">Requested Date Range</span>
                                    <span className="meta-val">{selectedRequest.dates}</span>
                                </div>
                            </div>

                            <div className="reason-container">
                                <span className="reason-label">{t('modal.reason_label') || "Reason for Leave"}:</span>
                                <p className="premium-reason-text">{selectedRequest.reason}</p>
                            </div>
                        </div>

                        <div className="premium-modal-footer review-footer">
                            <span className={`premium-status-badge ${selectedRequest.status}`}>
                                {selectedRequest.status}
                            </span>
                            <button className="premium-btn-primary small-btn" onClick={closeDetails}>
                                <i className="bi bi-check2"></i> Done Reviewing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;
