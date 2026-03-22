import React, { useState, useMemo } from 'react';
import './Leaves.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../Recrutment/FilterDropdown/FilterDropdown';
import { useTranslation } from "react-i18next";

const Leaves = () => {
    const { t } = useTranslation("Dashboard/Leaves");
    const [searchTerm, setSearchTerm] = useState("");
    const [dept, setDept] = useState("");
    const [leaveType, setLeaveType] = useState("");
    const [status, setStatus] = useState("");
    const [timePeriod, setTimePeriod] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const stats = [
        { label: t('stats.pending'), value: "15" },
        { label: t('stats.annual_balance'), value: "2,450 Days" },
        { label: t('stats.highest_requester'), value: "John Doe" },
        { label: t('stats.used_days'), value: "312" }
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
    };

    return (
        <div className="leaves-page">
            <header className="page-header">
                <h1>{t('title')}</h1>
                <div className="leaves-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((s, i) => (
                    <div className="stat-card" key={i}>
                        <span className="stat-label">{s.label}</span>
                        <span className="stat-value">{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Filter Section */}
            <div className="leaves-filters">
                <div className="search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input 
                        type="text" 
                        placeholder={t('filters.search')} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters-row">
                    <FilterDropdown 
                        value={dept} 
                        onChange={setDept} 
                        options={[{value: "", label: t('filters.department')}, {value: "it", label: "IT"}, {value: "hr", label: "HR"}]}
                    />
                    <FilterDropdown 
                        value={leaveType} 
                        onChange={setLeaveType} 
                        options={[{value: "", label: t('filters.leave_type')}, {value: "annual", label: "Annual"}, {value: "sick", label: "Sick"}]}
                    />
                    <FilterDropdown 
                        value={status} 
                        onChange={setStatus} 
                        options={[{value: "", label: t('filters.status')}, {value: "approved", label: t('status.approved')}, {value: "pending", label: t('status.pending')}]}
                    />
                    <FilterDropdown 
                        value={timePeriod} 
                        onChange={setTimePeriod} 
                        options={[{value: "", label: t('filters.time_period')}, {value: "this_month", label: "This Month"}, {value: "last_month", label: "Last Month"}]}
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="leaves-table-section">
                <h3 className="section-title">Leave Requests and Records Table</h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('table.emp_name')}</th>
                                <th>{t('table.leave_type')}</th>
                                <th>{t('table.date_range')}</th>
                                <th>{t('table.duration')}</th>
                                <th>{t('table.status')}</th>
                                <th>{t('table.rem_balance')}</th>
                                <th>{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveRequests.map((req) => (
                                <tr key={req.id}>
                                    <td className="emp-cell">
                                        <img src={req.avatar} alt={req.name} className="emp-avatar" />
                                        <span>{req.name}</span>
                                    </td>
                                    <td>{req.type}</td>
                                    <td>{req.dates}</td>
                                    <td>{req.duration}</td>
                                    <td>
                                        <span className={`status-badge ${req.status}`}>
                                            {t(`status.${req.status}`)}
                                        </span>
                                    </td>
                                    <td>{req.balance}</td>
                                    <td>
                                        <button className="action-link" onClick={() => openDetails(req)}>
                                            {req.status === 'pending' ? t('actions.review') : t('actions.view')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reports Section */}
            <div className="leaves-reports-grid">
                <div className="report-card distribution">
                    <h3>{t('reports.distribution')}</h3>
                    <div className="chart-placeholder">
                        {/* CSS Pie Chart Mock */}
                        <div className="pie-chart-mock">
                            <div className="pie-segment annual" style={{"--p":40, "--c":"#3b82f6"}}></div>
                            <div className="pie-segment sick" style={{"--p":30, "--c":"#f59e0b"}}></div>
                            <div className="pie-segment emergency" style={{"--p":20, "--c":"#ef4444"}}></div>
                            <div className="pie-segment other" style={{"--p":10, "--c":"#10b981"}}></div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item"><span className="dot annual"></span> Annual</div>
                            <div className="legend-item"><span className="dot sick"></span> Sick</div>
                            <div className="legend-item"><span className="dot emergency"></span> Emergency</div>
                        </div>
                    </div>
                </div>

                <div className="report-card impactful">
                    <div className="impact-header">
                        <h3>{t('reports.impactful')}</h3>
                    </div>
                    <div className="impact-list">
                        {calculatedImpacts.map((item, i) => (
                            <div className="impact-item" key={i}>
                                <div className="impact-info">
                                    <div className="impact-meta">
                                        <span className="impact-dept">{item.name}</span>
                                        <span className="impact-percentage">{item.percent}%</span>
                                    </div>
                                    <div className="impact-progress">
                                        <div 
                                            className={`impact-progress-bar ${item.impact}`} 
                                            style={{ width: `${item.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className={`impact-level ${item.impact}`}>
                                    {t(`impact.${item.impact}`)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="comparison-section">
                        <h3>{t('reports.comparison')}</h3>
                        <div className="bar-chart-placeholder">
                            <div className="bar" style={{height: '60%'}}></div>
                            <div className="bar" style={{height: '80%'}}></div>
                            <div className="bar" style={{height: '40%'}}></div>
                            <div className="bar" style={{height: '90%'}}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {isModalOpen && selectedRequest && (
                <div className="leaves-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="leaves-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Leave Request Details</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="detail-row">
                                <strong>Employee:</strong> <span>{selectedRequest.name}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Type:</strong> <span>{selectedRequest.type}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Date Range:</strong> <span>{selectedRequest.dates}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Duration:</strong> <span>{selectedRequest.duration} Days</span>
                            </div>
                            <div className="detail-row reason-row">
                                <strong>Reason for request:</strong>
                                <p>{selectedRequest.reason}</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="confirm-btn" onClick={() => setIsModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;
