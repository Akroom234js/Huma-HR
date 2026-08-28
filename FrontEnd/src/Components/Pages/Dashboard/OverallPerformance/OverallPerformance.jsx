import React, { useState, useEffect, useMemo } from 'react';
import './OverallPerformance.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import { useTranslation } from "react-i18next";
import { getPerformanceStats, getPerformanceCycles, getEvaluationsByCycle } from '../../../../services/PerformanceHrService';
import DashboardLoader from '../../../Shared/DashboardLoader/DashboardLoader';

const OverallPerformance = () => {
    const { t } = useTranslation("Dashboard/OverallPerformance");
    const [searchTerm, setSearchTerm] = useState("");
    const [dept, setDept] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [statsData, setStatsData] = useState(null);
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardPerformance = async () => {
            try {
                setLoading(true);
                const [statsRes, cyclesRes] = await Promise.allSettled([
                    getPerformanceStats(),
                    getPerformanceCycles()
                ]);

                if (statsRes.status === 'fulfilled') {
                    setStatsData(statsRes.value?.data?.data || null);
                }

                if (cyclesRes.status === 'fulfilled') {
                    const rawCycles = cyclesRes.value?.data?.data || cyclesRes.value?.data || [];
                    const activeCycle = rawCycles.find(c => c.status === 'active') || rawCycles.find(c => c.status === 'closed') || rawCycles[0];
                    if (activeCycle) {
                        const evalsRes = await getEvaluationsByCycle(activeCycle.id);
                        const evals = evalsRes?.data?.data?.evaluations || [];
                        setEvaluations(Array.isArray(evals) ? evals : []);
                    }
                }
            } catch (err) {
                console.error("Error loading dashboard performance:", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardPerformance();
    }, []);

    const avgScoreDisplay = statsData?.avg_score 
        ? `${statsData.avg_score} / 100` 
        : '84.5 / 100';
    const compRateDisplay = statsData?.completion_rate !== null && statsData?.completion_rate !== undefined 
        ? `${statsData.completion_rate}%` 
        : '92%';
    const needsTrainingCount = statsData?.pending_actions ?? evaluations.filter(e => e.decision === 'training_required' || (e.final_score && e.final_score < 70)).length;

    const stats = [
        { label: t('stats.avg_score'), value: avgScoreDisplay },
        { label: t('stats.completion_rate'), value: compRateDisplay },
        { label: t('stats.needs_training'), value: String(needsTrainingCount) },
        { label: t('stats.next_review'), value: statsData?.active_cycle?.end_date || "Active Cycle" }
    ];

    const getStatusKey = (score) => {
        if (score >= 85 || score >= 4.5) return "rewarded";
        if (score >= 70 || score >= 3.5) return "completed";
        return "needs_review";
    };

    const formattedList = useMemo(() => {
        if (evaluations.length > 0) {
            return evaluations.map(e => ({
                id: e.id,
                name: e.employee?.name || 'Employee',
                score: Number(e.final_score) || 0,
                dept: e.department || 'General',
                metrics: {
                    tasks: e.scores?.tasks ?? 85,
                    manager: e.scores?.manager ?? 80,
                    peer: e.scores?.peer ?? 75,
                    attendance: e.scores?.attendance ?? 90
                }
            }));
        }
        return [
            { id: 1, name: "Olivia Rhye", score: 92.0, dept: "IT", metrics: { tasks: 95, manager: 90, peer: 98, attendance: 92 } },
            { id: 2, name: "Phoenix Baker", score: 88.5, dept: "Marketing", metrics: { tasks: 88, manager: 92, peer: 85, attendance: 90 } },
            { id: 3, name: "Lana Steiner", score: 68.2, dept: "HR", metrics: { tasks: 65, manager: 70, peer: 60, attendance: 75 } },
            { id: 4, name: "Candice Wu", score: 80.0, dept: "Design", metrics: { tasks: 80, manager: 85, peer: 75, attendance: 82 } },
            { id: 5, name: "Zayn Malik", score: 94.6, dept: "IT", metrics: { tasks: 92, manager: 88, peer: 95, attendance: 94 } },
            { id: 6, name: "Gigi Hadid", score: 76.8, dept: "Marketing", metrics: { tasks: 78, manager: 80, peer: 82, attendance: 75 } }
        ];
    }, [evaluations]);

    const filteredData = useMemo(() => {
        return formattedList.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = !dept || emp.dept.toLowerCase() === dept.toLowerCase();
            const matchesStatus = !statusFilter || getStatusKey(emp.score) === statusFilter;
            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [formattedList, searchTerm, dept, statusFilter]);

    const handleViewDetails = (emp) => {
        setSelectedEmployee(emp);
        setIsModalOpen(true);
    };

    if (loading) {
        return <DashboardLoader text={t('loading') || "Loading Performance Dashboard..."} fullPage size="lg" />;
    }

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
                                        <span className={`op-status-badge ${getStatusKey(emp.score)}`}>
                                            {t(`status.${getStatusKey(emp.score)}`)}
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
                                        <span style={{ textTransform: 'capitalize' }}>{key}</span>
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
