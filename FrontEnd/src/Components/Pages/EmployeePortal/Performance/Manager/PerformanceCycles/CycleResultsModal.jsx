import React from 'react';
import './CycleResultsModal.css';

const CycleResultsModal = ({ isOpen, onClose, cycle }) => {
    if (!isOpen || !cycle) return null;

    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    // Mock results for the cycle
    const results = [
        { id: 1, nameEn: 'John Doe', nameAr: 'جون دو', deptEn: 'Engineering', deptAr: 'الهندسة', task: 85, manager: 80, peer: 90, attendance: 100, overtime: 20, final: 84.5, decisionEn: 'Bonus', decisionAr: 'مكافأة' },
        { id: 2, nameEn: 'Jane Smith', nameAr: 'جين سميث', deptEn: 'Marketing', deptAr: 'التسويق', task: 95, manager: 90, peer: 85, attendance: 100, overtime: 50, final: 91.5, decisionEn: 'Promotion', decisionAr: 'ترقية' },
        { id: 3, nameEn: 'Ali Ahmed', nameAr: 'علي أحمد', deptEn: 'Sales', deptAr: 'المبيعات', task: 65, manager: 60, peer: 70, attendance: 90, overtime: 0, final: 67.0, decisionEn: 'Training', decisionAr: 'تدريب' }
    ];

    return (
        <div className={`modal-overlay cycle-results-modal-overlay ${isAr ? 'rtl' : 'ltr'}`}>
            <div className="modal-container cycle-results-modal">
                <div className="modal-header">
                    <h2>{isAr ? `نتائج الدورة: ${cycle.nameAr}` : `Cycle Results: ${cycle.nameEn}`}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
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
                                {results.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 'bold' }}>{isAr ? r.nameAr : r.nameEn}</td>
                                        <td>{isAr ? r.deptAr : r.deptEn}</td>
                                        <td>{r.task}</td>
                                        <td>{r.manager}</td>
                                        <td>{r.peer}</td>
                                        <td>{r.attendance}</td>
                                        <td>{r.overtime}</td>
                                        <td style={{ fontWeight: 'bold', color: 'var(--color-scored)' }}>{r.final}</td>
                                        <td>
                                            <span className={`badge decision-badge ${r.decisionEn.toLowerCase()}`}>
                                                {isAr ? r.decisionAr : r.decisionEn}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CycleResultsModal;
