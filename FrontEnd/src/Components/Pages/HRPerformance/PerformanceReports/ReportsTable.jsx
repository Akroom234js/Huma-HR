import React, { useState } from 'react';
import FinalScoreBreakdown from '../../../Shared/Performance/FinalScoreBreakdown/FinalScoreBreakdown';
import DecisionBadge from '../../../Shared/Performance/DecisionBadge/DecisionBadge';
import CompetencyGapTag from '../../../Shared/Performance/CompetencyGapTag/CompetencyGapTag';
import AIRecommendationCard from '../../../Shared/Performance/AIRecommendationCard/AIRecommendationCard';
import DashboardLoader from '../../../Shared/DashboardLoader/DashboardLoader';
import { getPeerEvaluationsForEmployee } from '../../../../services/PerformanceHrService';
import { useTranslation } from 'react-i18next';

export default function ReportsTable({ evaluations = [], cycleId = null }) {
    const { t } = useTranslation("HrPerformance/PerformanceReports");
    const [expandedRows, setExpandedRows] = useState({});
    const [peerFeedbackState, setPeerFeedbackState] = useState({});

    const toggleRowDetails = async (index, employeeId) => {
        const nextState = !expandedRows[index];
        setExpandedRows(prev => ({
            ...prev,
            [index]: nextState
        }));

        if (nextState && employeeId && cycleId && !peerFeedbackState[employeeId]) {
            setPeerFeedbackState(prev => ({
                ...prev,
                [employeeId]: { loading: true, data: [], error: null }
            }));
            try {
                const res = await getPeerEvaluationsForEmployee(cycleId, employeeId);
                const rawData = res?.data?.data || res?.data;
                const comments = rawData?.comments || [];
                setPeerFeedbackState(prev => ({
                    ...prev,
                    [employeeId]: { loading: false, data: comments, error: null }
                }));
            } catch (err) {
                console.error("Failed to load peer feedback:", err);
                setPeerFeedbackState(prev => ({
                    ...prev,
                    [employeeId]: { loading: false, data: [], error: err.message || 'Failed to load comments' }
                }));
            }
        }
    };

    if (evaluations.length === 0) {
        return (
            <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    {t("no_evaluations") || 'لا توجد تقييمات مسجلة لهذه الدورة'}
                </td>
            </tr>
        );
    }

    return (
        <>
            {evaluations.map((e, i) => {
                const isExpanded = !!expandedRows[i];
                const empName = e.employee?.name || 'Employee';
                const dept = e.department || '-';
                const scores = e.scores || {};
                const finalScore = e.final_score ?? '-';
                const decision = e.decision || 'N/A';
                const aiRecs = Array.isArray(e.ai_recommendations) 
                    ? e.ai_recommendations 
                    : (typeof e.ai_recommendations === 'string' ? JSON.parse(e.ai_recommendations || '[]') : []);

                return (
                    <React.Fragment key={e.id || i}>
                        <tr className={`clickable-row ${isExpanded ? 'active-row' : ''}`} onClick={() => toggleRowDetails(i, e.employee?.id)}>
                            <td>
                                <i className={`fa-solid fa-chevron-down row-expand-arrow ${isExpanded ? 'expanded' : ''}`} style={{ marginInlineEnd: '8px', cursor: 'pointer' }}></i>
                                {empName}
                            </td>
                            <td>{dept}</td>
                            <td>{scores.tasks ?? '-'}</td>
                            <td>{scores.manager ?? '-'}</td>
                            <td>{scores.peer ?? '-'}</td>
                            <td>{scores.attendance ?? '-'}</td>
                            <td>{scores.overtime ?? '-'}</td>
                            <td className='grade-hr' style={{ fontWeight: 'bold' }}>{finalScore}</td>
                            <td>
                                <DecisionBadge decision={decision} />
                            </td>
                        </tr>

                        {isExpanded && (
                            <tr className="detail-row expanded">
                                <td colSpan="9" className="detail-row-cell">
                                    <div className="detail-row-content">
                                        <div className="weights-grid-hr">
                                            <FinalScoreBreakdown 
                                                scores={{ 
                                                    finalScore: Number(finalScore) || 0, 
                                                    components: { 
                                                        task: scores.tasks ?? 0, 
                                                        manager: scores.manager ?? 0, 
                                                        peer: scores.peer ?? 0, 
                                                        attendance: scores.attendance ?? 0, 
                                                        overtime: scores.overtime ?? 0 
                                                    } 
                                                }} 
                                            />
                                        </div>

                                        <div className="gaps-and-ai-section">
                                            <h4 className="gaps-section-title">{t("Gaps")}</h4>
                                            <div className='fl-per-re'>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {scores.tasks < 80 && <CompetencyGapTag gapType="technical" gapName="التنفيذ الفني" />}
                                                    {scores.peer < 80 && <CompetencyGapTag gapType="communication" gapName="التواصل والتعاون" />}
                                                    {scores.attendance < 85 && <CompetencyGapTag gapType="attendance" gapName="الحضور والانضباط" />}
                                                    {scores.tasks >= 80 && scores.peer >= 80 && scores.attendance >= 85 && (
                                                        <span style={{ color: '#10b981', fontSize: '0.85rem' }}>كفاءة متوازنة</span>
                                                    )}
                                                </div>

                                                <div className='AIRecommendationCard'>
                                                    {aiRecs.length > 0 ? (
                                                        aiRecs.map((rec, idx) => (
                                                             <AIRecommendationCard 
                                                                key={idx}
                                                                recommendation={{ 
                                                                    courseName: rec.course_name || rec.title || 'Recommended Course', 
                                                                    reason: rec.reason || rec.description || 'AI gap optimization', 
                                                                    matchingScore: rec.matching_score || 90, 
                                                                    sequence: idx + 1 
                                                                }} 
                                                            />
                                                        ))
                                                    ) : (
                                                        <AIRecommendationCard 
                                                            recommendation={{ 
                                                                courseName: 'Agile & Performance Mastery', 
                                                                reason: 'AI continuous professional development recommendation', 
                                                                matchingScore: 92, 
                                                                sequence: 1 
                                                            }} 
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── ملاحظات تقييم الأقران المفكوكة التشفير (خاص بـ HR) ── */}
                                        <div className="peer-feedback-section-hr">
                                            <div className="peer-feedback-header">
                                                <div className="peer-feedback-title">
                                                    <i className="fa-solid fa-user-shield"></i>
                                                    <span>{t("peer_confidential_notes") || 'ملاحظات تقييم الزملاء (Decrypted Peer Feedback)'}</span>
                                                </div>
                                                <span className="confidential-badge">
                                                    <i className="fa-solid fa-lock-open"></i> {t("confidential_hr_only") || 'مشفرة - خاصة بالـ HR فقط'}
                                                </span>
                                            </div>

                                            {peerFeedbackState[e.employee?.id]?.loading ? (
                                                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                                                    <DashboardLoader size="sm" text={t("decrypting_comments") || 'جاري جلب وفك تشفير الملاحظات...'} />
                                                </div>
                                            ) : peerFeedbackState[e.employee?.id]?.data && peerFeedbackState[e.employee?.id]?.data.length > 0 ? (
                                                <div className="peer-comments-grid">
                                                    {peerFeedbackState[e.employee?.id]?.data.map((item, idx) => (
                                                        <div key={idx} className="peer-comment-card">
                                                            <div className="peer-card-top">
                                                                <div className="peer-anonymous-tag">
                                                                    <i className="fa-solid fa-user-secret"></i>
                                                                    <span>{t("anonymous_peer") || 'تقييم زميل مجهول'} #{idx + 1}</span>
                                                                </div>
                                                                <div className="peer-scores-tags">
                                                                    <span className="score-tag collab">
                                                                        {t("collaboration") || 'التعاون'}: {item.collaboration_score}/10
                                                                    </span>
                                                                    <span className="score-tag team">
                                                                        {t("teamwork") || 'العمل الجماعي'}: {item.teamwork_score}/10
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="peer-comment-body">
                                                                <p>{item.comment || <em style={{ color: 'var(--text-muted)' }}>{t("no_text_comment") || 'لا توجد ملاحظة نصية مكتوبة'}</em>}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="peer-feedback-empty">
                                                    <i className="fa-solid fa-comment-slash"></i>
                                                    <span>{t("no_peer_comments") || 'لا توجد ملاحظات نصية مسجلة من الزملاء لهذا الموظف في هذه الدورة.'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
}