import React, { useState, useEffect } from 'react';
import './PerformanceReports.css';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import ReportsTable from './ReportsTable';
import CycleModal from './CycleModal';
import { getPerformanceCycles, getEvaluationsByCycle } from '../../../../services/PerformanceHrService';

const PerformanceReports = () => {
    const { t } = useTranslation("HrPerformance/PerformanceReports");
    const [cycles, setCycles] = useState([]);
    const [selectedCycleId, setSelectedCycleId] = useState(null);
    const [evaluations, setEvaluations] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch initial cycles list
    const fetchCycles = async () => {
        try {
            setIsLoading(true);
            const res = await getPerformanceCycles();
            const raw = res?.data?.data || res?.data || [];
            const cycleList = Array.isArray(raw) ? raw : [];
            setCycles(cycleList);

            if (cycleList.length > 0) {
                // Select active cycle, or latest
                const active = cycleList.find(c => c.status === 'active') || cycleList[0];
                setSelectedCycleId(active.id);
            }
        } catch (error) {
            console.error("Error loading cycles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCycles();
    }, []);

    // Fetch evaluations whenever selectedCycleId changes
    useEffect(() => {
        if (!selectedCycleId) {
            setEvaluations([]);
            return;
        }

        const fetchEvaluations = async () => {
            try {
                setIsTableLoading(true);
                const res = await getEvaluationsByCycle(selectedCycleId);
                const data = res?.data?.data;
                const evals = data?.evaluations || [];
                setEvaluations(Array.isArray(evals) ? evals : []);
                setSummary(data?.summary || null);
            } catch (error) {
                console.error("Error loading evaluations for cycle:", error);
                setEvaluations([]);
            } finally {
                setIsTableLoading(false);
            }
        };

        fetchEvaluations();
    }, [selectedCycleId]);

    const handleExportCSV = () => {
        if (evaluations.length === 0) return;
        const headers = ["Employee", "Department", "Tasks (40%)", "Manager (25%)", "Peers (15%)", "Attendance (10%)", "Overtime (10%)", "Final Grade", "Decision"];
        const rows = evaluations.map(e => [
            `"${e.employee?.name || ''}"`,
            `"${e.department || ''}"`,
            e.scores?.tasks ?? '',
            e.scores?.manager ?? '',
            e.scores?.peer ?? '',
            e.scores?.attendance ?? '',
            e.scores?.overtime ?? '',
            e.final_score ?? '',
            `"${e.decision || ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `performance_report_cycle_${selectedCycleId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="performance-container PerformanceReports-container">
            {isModalOpen && (
                <div className="cycle-modal-hr" style={{ display: 'flex' }}>
                    <CycleModal 
                        onClose={() => setIsModalOpen(false)} 
                        onSuccess={() => {
                            setIsModalOpen(false);
                            fetchCycles();
                        }}
                    />
                </div>
            )}

            <div className='fl-per'>
                <div>
                    <h1>{t("title")}</h1>
                    <p>{t("des")}</p>
                </div>
                <div>
                    <button className="btn btn-secondary pos-per" onClick={handleExportCSV}>
                        <i className="fa-solid fa-file-export"></i> {t("Export")}
                    </button>
                    <button className="btn btn-start-cycle" onClick={() => setIsModalOpen(true)} id="startCycleBtn">
                        <i className="fa-solid fa-circle-play"></i>
                        <span>{t("new.Start") || 'Start New Cycle'}</span>
                        <span className="pulse-dot"></span>
                    </button>
                </div>
            </div>

            <div className="em-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <div className="card">
                <div className="card-title fl-hr-re">
                    <div>
                        <span>{t("Consolidated")}</span>
                        <div className="filter-group">
                            <span className="filter-label">{t("Selection")}</span>
                            <select 
                                className="select-input" 
                                value={selectedCycleId || ''} 
                                onChange={(e) => setSelectedCycleId(Number(e.target.value))}
                            >
                                {cycles.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.title} ({c.status})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {summary && (
                        <div style={{ fontSize: '0.9rem', color: '#64748b', display: 'flex', gap: '16px' }}>
                            <span>{t("total_evaluated") || 'Total Evaluated'}: <strong>{summary.evaluated} / {summary.total}</strong></span>
                            <span>{t("avg_score") || 'Average Score'}: <strong>{summary.avg_score || '-'}</strong></span>
                        </div>
                    )}
                </div>

                <div className="table-wrapper">
                    <table className="custom-table" id="consolidatedScoreTable">
                        <thead>
                            <tr>
                                <th>{t("table.Employee")}</th>
                                <th>{t("table.Department")}</th>
                                <th>{t("table.Task")} (40%)</th>
                                <th>{t("table.Manager")} (25%)</th>
                                <th>{t("table.Peers")} (15%)</th>
                                <th>{t("table.Attend")} (10%)</th>
                                <th>{t("table.Overtime")} (10%)</th>
                                <th className='grade-hr'>{t("table.Grade")}</th>
                                <th>{t("table.Decision")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isTableLoading ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                                        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                                        {t("loading") || 'Loading evaluations...'}
                                    </td>
                                </tr>
                            ) : (
                                <ReportsTable evaluations={evaluations} cycleId={selectedCycleId} />
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PerformanceReports;
