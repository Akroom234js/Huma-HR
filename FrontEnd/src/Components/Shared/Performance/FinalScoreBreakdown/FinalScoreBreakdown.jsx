import React from 'react';
import './FinalScoreBreakdown.css';

const FinalScoreBreakdown = ({
    taskScore = 0,
    taskContribution = 0,
    managerScore = 0,
    managerContribution = 0,
    peerScore = 0,
    peerContribution = 0,
    attendanceScore = 0,
    attendanceContribution = 0,
    overtimeScore = 0,
    overtimeContribution = 0,
    finalScore = 0,
    lang
}) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const metrics = [
        {
            titleEn: 'Tasks',
            titleAr: 'درجة المهام',
            weight: '40%',
            score: taskScore,
            contrib: taskContribution,
            icon: 'fa-solid fa-list-check',
            colorClass: 'tasks-color'
        },
        {
            titleEn: 'Manager',
            titleAr: 'درجة المدير',
            weight: '25%',
            score: managerScore,
            contrib: managerContribution,
            icon: 'fa-solid fa-user-tie',
            colorClass: 'manager-color'
        },
        {
            titleEn: 'Peers',
            titleAr: 'درجة الزملاء',
            weight: '15%',
            score: peerScore,
            contrib: peerContribution,
            icon: 'fa-solid fa-users',
            colorClass: 'peers-color'
        },
        {
            titleEn: 'Attendance',
            titleAr: 'درجة الحضور',
            weight: '10%',
            score: attendanceScore,
            contrib: attendanceContribution,
            icon: 'fa-solid fa-calendar-check',
            colorClass: 'attendance-color'
        },
        {
            titleEn: 'Overtime',
            titleAr: 'العمل الإضافي',
            weight: '10%',
            score: overtimeScore,
            contrib: overtimeContribution,
            icon: 'fa-solid fa-clock-rotate-left',
            colorClass: 'overtime-color'
        }
    ];

    return (
        <div className="final-score-breakdown-card">
            <h4 className="final-breakdown-title">
                <i className="fa-solid fa-chart-pie title-icon"></i>
                <span>{isAr ? 'تفصيل احتساب الدرجة النهائية الشاملة' : 'Consolidated Score Breakdown'}</span>
            </h4>

            <div className="final-weights-grid">
                {metrics.map((m, idx) => (
                    <div key={idx} className={`weight-metric-card ${m.colorClass}`}>
                        <div className="weight-icon-wrapper">
                            <i className={m.icon}></i>
                        </div>
                        <div className="weight-metric-title">
                            {isAr ? m.titleAr : m.titleEn} ({m.weight})
                        </div>
                        <div className="weight-metric-value">{m.score.toFixed(1)}</div>
                        <div className="weight-metric-weight">
                            {isAr ? 'المساهمة:' : 'Contr:'} {m.contrib.toFixed(1)} {isAr ? 'نقطة' : 'pts'}
                        </div>
                    </div>
                ))}
            </div>

            <div className="final-score-total-row">
                <div className="total-label-section">
                    <span className="total-label">{isAr ? 'الدرجة النهائية Consolidated' : 'Final Grade Score'}</span>
                    <span className="total-formula">
                        {isAr 
                            ? '(المهام × 40%) + (المدير × 25%) + (الزملاء × 15%) + (الحضور × 10%) + (الإضافي × 10%)'
                            : '(Tasks × 40%) + (Manager × 25%) + (Peers × 15%) + (Attend × 10%) + (OT × 10%)'}
                    </span>
                </div>
                <div className="total-score-box">
                    <span className="score-num">{finalScore.toFixed(1)}</span>
                    <span className="score-den">/ 100</span>
                </div>
            </div>
        </div>
    );
};

export default FinalScoreBreakdown;
