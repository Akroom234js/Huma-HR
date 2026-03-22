import React, { useState, useMemo } from 'react';
import './OverallPerformance.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../Recrutment/FilterDropdown/FilterDropdown';
import { useTranslation } from "react-i18next";

const OverallPerformance = () => {
    const { t } = useTranslation("Dashboard/OverallPerformance");
    const [searchTerm, setSearchTerm] = useState("");
    const [dept, setDept] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const stats = [
        { label: t('stats.avg_score'), value: "4.2 / 5.0" },
        { label: t('stats.completion_rate'), value: "92%" },
        { label: t('stats.needs_training'), value: "14" },
        { label: t('stats.next_review'), value: "Jan 15" }
    ];

    const performanceData = [
        { id: 1, name: "Olivia Rhye", score: 4.8, dept: "IT", metrics: { quality: 95, speed: 90, teamwork: 98, reliability: 92 } },
        { id: 2, name: "Phoenix Baker", score: 4.5, dept: "Marketing", metrics: { quality: 88, speed: 92, teamwork: 85, reliability: 90 } },
        { id: 3, name: "Lana Steiner", score: 3.2, dept: "HR", metrics: { quality: 65, speed: 70, teamwork: 60, reliability: 75 } },
        { id: 4, name: "Candice Wu", score: 4.0, dept: "Design", metrics: { quality: 80, speed: 85, teamwork: 75, reliability: 82 } },
        { id: 5, name: "Zayn Malik", score: 4.6, dept: "IT", metrics: { quality: 92, speed: 88, teamwork: 95, reliability: 94 } },
        { id: 6, name: "Gigi Hadid", score: 3.8, dept: "Marketing", metrics: { quality: 78, speed: 80, teamwork: 82, reliability: 75 } }
    ];

    const getStatus = (score) => {
        if (score >= 4.5) return "rewarded";
        if (score >= 3.5) return "completed";
        return "needs_review";
    };

    const filteredData = useMemo(() => {
        return performanceData.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = !dept || emp.dept.toLowerCase() === dept.toLowerCase();
            const matchesStatus = !statusFilter || getStatus(emp.score) === statusFilter;
            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [searchTerm, dept, statusFilter]);

    const handleViewDetails = (emp) => {
        setSelectedEmployee(emp);
        setIsModalOpen(true);
    };

    return (
        <div className="op-page">
            <div className="op-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <header className="op-header">
                <h1 className="op-title">{t('title')}</h1>
            </header>

            {/* Stats Overview */}
            <div className="op-stats-grid">
                {stats.map((s, i) => (
                    <div className="op-stat-card" key={i}>
                        <span className="op-stat-label">{s.label}</span>
                        <span className="op-stat-value">{s.value}</span>
                    </div>
                ))}
            </div>

            {/* Filter Section */}
            <div className="op-filter-section">
                <div className="op-search-bar">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder={t('filters.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="op-filters-row">
                    <FilterDropdown
                        value={dept}
                        onChange={setDept}
                        options={[
                            { value: "", label: t('filters.department') },
                            { value: "it", label: "IT" },
                            { value: "marketing", label: "Marketing" },
                            { value: "hr", label: "HR" },
                            { value: "design", label: "Design" }
                        ]}
                    />
                    <FilterDropdown
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { value: "", label: t('filters.status') },
                            { value: "rewarded", label: t('status.rewarded') },
                            { value: "completed", label: t('status.completed') },
                            { value: "needs_review", label: t('status.needs_review') }
                        ]}
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="op-table-section">
                <h3 className="op-section-title">{t('table.summary_title')}</h3>
                <div className="op-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('table.employee')}</th>
                                <th>{t('table.final_score')}</th>
                                <th>{t('table.status')}</th>
                                <th>{t('table.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((emp) => (
                                <tr key={emp.id}>
                                    <td className="op-emp-name">{emp.name}</td>
                                    <td className="op-score-cell">{emp.score.toFixed(1)}</td>
                                    <td>
                                        <span className={`op-status-badge ${getStatus(emp.score)}`}>
                                            {t(`status.${getStatus(emp.score)}`)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="op-view-btn" onClick={() => handleViewDetails(emp)}>
                                            {t('table.action')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Breakdown Modal */}
            {isModalOpen && selectedEmployee && (
                <div className="op-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="op-modal" onClick={e => e.stopPropagation()}>
                        <div className="op-modal-header">
                            <h2>{t('modal.details_title')}: {selectedEmployee.name}</h2>
                            <button className="op-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="op-modal-content">
                            {Object.entries(selectedEmployee.metrics).map(([key, value]) => (
                                <div className="op-metric-row" key={key}>
                                    <div className="op-metric-label">
                                        <span>{t(`modal.metrics.${key}`)}</span>
                                        <span>{value}%</span>
                                    </div>
                                    <div className="op-metric-progress">
                                        <div
                                            className="op-metric-progress-bar"
                                            style={{ width: `${value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="op-modal-footer">
                            <button className="op-confirm-btn" onClick={() => setIsModalOpen(false)}>
                                {t('modal.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverallPerformance;
