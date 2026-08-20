import React from 'react';
import './FinalScoreBreakdown.css';

const FinalScoreBreakdown = ({
    scores,
    taskScore,
    taskContribution,
    managerScore,
    managerContribution,
    peerScore,
    peerContribution,
    attendanceScore,
    attendanceContribution,
    overtimeScore,
    overtimeContribution,
    finalScore,
    lang
}) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    // استخراج القيم سواء تم تمريرها كـ props مباشرة أو ككائن scores
    const tScore = Number(scores?.components?.task ?? scores?.components?.tasks ?? taskScore ?? 0);
    const mScore = Number(scores?.components?.manager ?? managerScore ?? 0);
    const pScore = Number(scores?.components?.peer ?? scores?.components?.peers ?? peerScore ?? 0);
    const aScore = Number(scores?.components?.attendance ?? attendanceScore ?? 0);
    const oScore = Number(scores?.components?.overtime ?? overtimeScore ?? 0);
    const fScore = Number(scores?.finalScore ?? finalScore ?? 0);

    const tContrib = taskContribution !== undefined ? Number(taskContribution) : (tScore * 0.40);
    const mContrib = managerContribution !== undefined ? Number(managerContribution) : (mScore * 0.25);
    const pContrib = peerContribution !== undefined ? Number(peerContribution) : (pScore * 0.15);
    const aContrib = attendanceContribution !== undefined ? Number(attendanceContribution) : (aScore * 0.10);
    const oContrib = overtimeContribution !== undefined ? Number(overtimeContribution) : (oScore * 0.10);

    const metrics = [
        {
            titleEn: 'Tasks',
            titleAr: 'درجة المهام',
            weight: '40%',
            score: tScore,
            contrib: tContrib,
            icon: 'fa-solid fa-list-check',
            colorClass: 'tasks-color'
        },
        {
            titleEn: 'Manager',
            titleAr: 'درجة المدير',
            weight: '25%',
            score: mScore,
            contrib: mContrib,
            icon: 'fa-solid fa-user-tie',
            colorClass: 'manager-color'
        },
        {
            titleEn: 'Peers',
            titleAr: 'درجة الزملاء',
            weight: '15%',
            score: pScore,
            contrib: pContrib,
            icon: 'fa-solid fa-users',
            colorClass: 'peers-color'
        },
        {
            titleEn: 'Attendance',
            titleAr: 'درجة الحضور',
            weight: '10%',
            score: aScore,
            contrib: aContrib,
            icon: 'fa-solid fa-calendar-check',
            colorClass: 'attendance-color'
        },
        {
            titleEn: 'Overtime',
            titleAr: 'العمل الإضافي',
            weight: '10%',
            score: oScore,
            contrib: oContrib,
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
                        <div className="weight-metric-value">{Number(m.score).toFixed(1)}</div>
                        <div className="weight-metric-weight">
                            {isAr ? 'المساهمة:' : 'Contr:'} {Number(m.contrib).toFixed(1)} {isAr ? 'نقطة' : 'pts'}
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
                    <span className="score-num">{Number(fScore).toFixed(1)}</span>
                    <span className="score-den">/ 100</span>
                </div>
            </div>
        </div>
    );
};

export default FinalScoreBreakdown;
