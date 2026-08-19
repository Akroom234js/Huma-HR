import React, { useState } from 'react';
import FinalScoreBreakdown from '../../../Shared/Performance/FinalScoreBreakdown/FinalScoreBreakdown';
import DecisionBadge from '../../../Shared/Performance/DecisionBadge/DecisionBadge';
import CompetencyGapTag from '../../../Shared/Performance/CompetencyGapTag/CompetencyGapTag';
import AIRecommendationCard from '../../../Shared/Performance/AIRecommendationCard/AIRecommendationCard';
import { useTranslation } from 'react-i18next';

export default function ReportsTable({ evaluations = [] }) {
    const { t } = useTranslation("HrPerformance/PerformanceReports");
    const [expandedRows, setExpandedRows] = useState({});

    const toggleRowDetails = (index) => {
        setExpandedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    if (evaluations.length === 0) {
        return (
            <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    لا توجد تقييمات مسجلة لهذه الدورة
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
                        <tr className="clickable-row" onClick={() => toggleRowDetails(i)}>
                            <td>
                                <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ marginRight: '8px', cursor: 'pointer' }}></i>
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
                                <td colSpan="9">
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

                                        <div>
                                            <h4>{t("Gaps")}</h4>
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