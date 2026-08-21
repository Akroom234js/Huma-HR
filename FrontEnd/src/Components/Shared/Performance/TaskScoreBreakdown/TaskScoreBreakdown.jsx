import React from 'react';
import './TaskScoreBreakdown.css';
import { useTranslation } from 'react-i18next';

const TaskScoreBreakdown = ({
    completionScore = 0,
    completionContribution = 0,
    qualityScore = 0,
    qualityContribution = 0,
    daysLate = 0,
    totalPenalty = 0,
    finalScore = 0,
    lang
}) => {
    const { i18n } = useTranslation();
    const currentLang = lang || (i18n ? i18n.language : sessionStorage.getItem('lang')) || 'en';
    const isAr = currentLang === 'ar';

    return (
        <div className="task-score-breakdown-card">
            <h4 className="breakdown-title">
                <i className="fa-solid fa-calculator title-icon"></i>
                <span>{isAr ? 'تفصيل احتساب درجة المهمة' : 'Task Score Breakdown'}</span>
            </h4>

            <div className="breakdown-grid">
                {/* Completion Column */}
                <div className="breakdown-metric">
                    <span className="metric-label">{isAr ? 'درجة الاكتمال (60%)' : 'Completion (60%)'}</span>
                    <span className="metric-val">{completionScore} / 100</span>
                    <span className="metric-contrib">
                        {isAr ? 'المساهمة:' : 'Contr:'} +{completionContribution.toFixed(1)} {isAr ? 'نقطة' : 'pts'}
                    </span>
                </div>

                {/* Quality Column */}
                <div className="breakdown-metric">
                    <span className="metric-label">{isAr ? 'درجة الجودة (40%)' : 'Quality (40%)'}</span>
                    <span className="metric-val">{qualityScore} / 100</span>
                    <span className="metric-contrib">
                        {isAr ? 'المساهمة:' : 'Contr:'} +{qualityContribution.toFixed(1)} {isAr ? 'نقطة' : 'pts'}
                    </span>
                </div>

                {/* Penalties Column */}
                <div className={`breakdown-metric ${totalPenalty > 0 ? 'has-penalty' : ''}`}>
                    <span className="metric-label">{isAr ? 'خصم التأخير اليومي' : 'Late Penalty'}</span>
                    <span className="metric-val">
                        {daysLate} {isAr ? 'أيام تأخير' : 'days late'}
                    </span>
                    <span className="metric-contrib penalty-text">
                        {totalPenalty > 0 ? `-${totalPenalty.toFixed(1)}` : '0'} {isAr ? 'نقطة خصم' : 'pts penalty'}
                    </span>
                </div>
            </div>

            <div className="breakdown-footer-score">
                <div className="footer-label">{isAr ? 'الدرجة النهائية للمهمة' : 'Net Final Task Score'}</div>
                <div className="footer-score-val">{finalScore.toFixed(1)} / 100</div>
            </div>
        </div>
    );
};

export default TaskScoreBreakdown;
