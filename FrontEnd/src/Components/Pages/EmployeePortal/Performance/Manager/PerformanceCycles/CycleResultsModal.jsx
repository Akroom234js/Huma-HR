import React, { useState, useEffect } from 'react';
import './CycleResultsModal.css';
import { getEvaluationsByCycle } from '../../../../../../services/PerformanceHrService';

const CycleResultsModal = ({ isOpen, onClose, cycle }) => {
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

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

    return (
        <div className={`modal-overlay cycle-results-modal-overlay ${isAr ? 'rtl' : 'ltr'}`}>
            <div className="modal-container cycle-results-modal">
                <div className="modal-header">
                    <h2>{isAr ? `نتائج الدورة: ${cycle.title || cycle.nameAr}` : `Cycle Results: ${cycle.title || cycle.nameEn}`}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}></i>
                            {isAr ? 'جاري تحميل النتائج...' : 'Loading results...'}
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>{isAr ? 'الموظف' : 'Employee'}</th>
                                        <th>{isAr ? 'القسم' : 'Department'}</th>
                                        <th>{isAr ? 'المهام (40%)' : 'Tasks (40%)'}</th>
                                        <th>{isAr ? 'المدير (25%)' : 'Manager (25%)'}</th>
                                        <th>{isAr ? 'الزملاء (15%)' : 'Peers (15%)'}</th>
                                        <th>{isAr ? 'الحضور (10%)' : 'Attendance (10%)'}</th>
                                        <th>{isAr ? 'الإضافي (10%)' : 'Overtime (10%)'}</th>
                                        <th>{isAr ? 'النهائية' : 'Final Score'}</th>
                                        <th>{isAr ? 'القرار التلقائي' : 'Auto Decision'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                                {isAr ? 'لا توجد نتائج تقييم مرصودة لهذه الدورة بعد.' : 'No evaluation records found for this cycle.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        results.map((r) => {
                                            const empName = r.employee?.name || (isAr ? 'موظف' : 'Employee');
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
