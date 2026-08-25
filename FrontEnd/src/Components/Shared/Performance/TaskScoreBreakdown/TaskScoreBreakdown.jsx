import React from 'react';
import './TaskScoreBreakdown.css';
import { useTranslation } from 'react-i18next';

const TaskScoreBreakdown = ({
    data,
    completionScore = data?.completionScore ?? 0,
    completionContribution = data?.completionContribution ?? (completionScore * 0.6),
    qualityScore = data?.qualityScore ?? 0,
    qualityContribution = data?.qualityContribution ?? (qualityScore * 0.4),
    daysLate = data?.daysLate ?? 0,
    penaltyDeduction = data?.penaltyDeduction ?? 0,
    totalPenalty = data?.totalPenalty ?? penaltyDeduction,
    finalGrade = data?.finalGrade ?? data?.finalScore,
    finalScore = finalGrade !== undefined ? Number(finalGrade) : (completionContribution + qualityContribution - totalPenalty),
    managerFeedback = data?.managerFeedback,
    lang
}) => {
    const { i18n } = useTranslation();
    const currentLang = lang || (i18n ? i18n.language : sessionStorage.getItem('lang')) || 'en';
    const isAr = currentLang === 'ar';

    return (
        <div className="task-score-breakdown-card">
            <h4 className="breakdown-title">
                <i className="bi bi-calculator-fill title-icon me-1"></i>
                <span>{isAr ? 'تفصيل احتساب درجة المهمة' : 'Task Score Breakdown'}</span>
            </h4>

            <div className="breakdown-grid">
                {/* Completion Column */}
                <div className="breakdown-metric">
                    <span className="metric-label">{isAr ? 'درجة الاكتمال (60%)' : 'Completion (60%)'}</span>
                    <span className="metric-val">{completionScore} / 100</span>
                    <span className="metric-contrib">
                        {isAr ? 'المساهمة:' : 'Contr:'} +{Number(completionContribution).toFixed(1)} {isAr ? 'نقطة' : 'pts'}
                    </span>
                </div>

                {/* Quality Column */}
                <div className="breakdown-metric">
                    <span className="metric-label">{isAr ? 'درجة الجودة (40%)' : 'Quality (40%)'}</span>
                    <span className="metric-val">{qualityScore} / 100</span>
                    <span className="metric-contrib">
                        {isAr ? 'المساهمة:' : 'Contr:'} +{Number(qualityContribution).toFixed(1)} {isAr ? 'نقطة' : 'pts'}
                    </span>
                </div>

                {/* Penalties Column */}
                <div className={`breakdown-metric ${totalPenalty > 0 ? 'has-penalty' : ''}`}>
                    <span className="metric-label">{isAr ? 'خصم التأخير' : 'Late Penalty'}</span>
                    <span className="metric-val">
                        {daysLate > 0 ? `${daysLate} ${isAr ? 'أيام تأخير' : 'days late'}` : (isAr ? 'لا يوجد تأخير' : 'On Time')}
                    </span>
                    <span className="metric-contrib penalty-text">
                        {totalPenalty > 0 ? `-${Number(totalPenalty).toFixed(1)}` : '0'} {isAr ? 'نقطة خصم' : 'pts'}
                    </span>
                </div>
            </div>

            {managerFeedback && (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'var(--bg-page, #f8fafc)', borderRadius: '10px', fontSize: '0.85rem' }}>
                    <strong>{isAr ? 'ملاحظة المقيم: ' : 'Evaluator Note: '}</strong>
                    <span>{managerFeedback}</span>
                </div>
            )}

            <div className="breakdown-footer-score">
                <div className="footer-label">{isAr ? 'الدرجة النهائية للمهمة' : 'Net Final Task Score'}</div>
                <div className="footer-score-val">{Number(finalScore).toFixed(1)} / 100</div>
            </div>
        </div>
    );
};

export default TaskScoreBreakdown;
