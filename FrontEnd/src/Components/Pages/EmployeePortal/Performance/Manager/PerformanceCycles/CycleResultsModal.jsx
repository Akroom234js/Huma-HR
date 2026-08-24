import React, { useState, useEffect } from 'react';
import './CycleResultsModal.css';
import { useTranslation } from 'react-i18next';
import { getEvaluationsByCycle } from '../../../../../../services/PerformanceHrService';

const CycleResultsModal = ({ isOpen, onClose, cycle }) => {
    const { t, i18n } = useTranslation('EmployeePortal/PerformanceCycles');
    const isAr = i18n ? i18n.language === 'ar' : false;

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && cycle?.id) {
            const fetchResults = async () => {
                try {
                    setLoading(true);
                    const res = await getEvaluationsByCycle(cycle.id);
                    const evals = res?.data?.data?.evaluations || [];
                    setResults(Array.isArray(evals) ? evals : []);
                } catch (error) {
                    console.error("Error fetching cycle results:", error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchResults();
        }
    }, [isOpen, cycle?.id]);

    if (!isOpen || !cycle) return null;

    const cycleTitle = cycle.title || (isAr ? cycle.nameAr : cycle.nameEn) || '';

    return (
        <div className={`cycle-results-modal-overlay ${isAr ? 'rtl' : 'ltr'}`} onClick={onClose}>
            <div className="cycle-results-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('modal.cycleResults', { name: cycleTitle })}</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}></i>
                            {t('modal.loadingResults')}
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>{t('modal.employee')}</th>
                                        <th>{t('modal.department')}</th>
                                        <th>{t('modal.tasksWeight')}</th>
                                        <th>{t('modal.managerWeight')}</th>
                                        <th>{t('modal.peerWeight')}</th>
                                        <th>{t('modal.attendanceWeight')}</th>
                                        <th>{t('modal.overtimeWeight')}</th>
                                        <th>{t('modal.finalScore')}</th>
                                        <th>{t('modal.autoDecision')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                                {t('modal.noRecords')}
                                            </td>
                                        </tr>
                                    ) : (
                                        results.map((r) => {
                                            const empName = r.employee?.name || t('modal.defaultEmployee');
                                            const deptName = r.department || '-';
                                            const scores = r.scores || {};
                                            const finalScore = r.final_score ?? '-';
                                            const decision = r.decision || 'N/A';

                                            return (
                                                <tr key={r.id}>
                                                    <td style={{ fontWeight: 'bold' }}>{empName}</td>
                                                    <td>{deptName}</td>
                                                    <td>{scores.tasks ?? '-'}</td>
                                                    <td>{scores.manager ?? '-'}</td>
                                                    <td>{scores.peer ?? '-'}</td>
                                                    <td>{scores.attendance ?? '-'}</td>
                                                    <td>{scores.overtime ?? '-'}</td>
                                                    <td style={{ fontWeight: 'bold', color: 'var(--color-scored)' }}>{finalScore}</td>
                                                    <td>
                                                        <span className={`badge decision-badge ${decision.toLowerCase()}`}>
                                                            {decision.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CycleResultsModal;
