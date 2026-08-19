import React, { useState, useEffect } from "react";
import "./PerformanceReport.css";
import ThemeToggle from "../../../../ThemeToggle/ThemeToggle";
import DecisionBadge from "../../../../Shared/Performance/DecisionBadge/DecisionBadge";
import CompetencyGapTag from "../../../../Shared/Performance/CompetencyGapTag/CompetencyGapTag";
import ScoreWeightBar from "../../../../Shared/Performance/ScoreWeightBar/ScoreWeightBar";
import AIRecommendationCard from "../../../../Shared/Performance/AIRecommendationCard/AIRecommendationCard";
import { getMyEvaluation } from "../../../../../services/performanceService";

const PerformanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState(null);

  const currentLang = sessionStorage.getItem('lang') || 'en';
  const isAr = currentLang === 'ar';

  const t = {
    title: isAr ? 'تقرير أدائي وخطة التطوير بالذكاء الاصطناعي' : 'My Performance & AI Development Report',
    subtitle: isAr ? 'تفاصيل بطاقة الأداء الموحدة، الملاحظات المجهولة، وتوصيات مسارات التعلم' : 'Consolidated scorecard details, anonymous peer comments, and AI learning pathway recommendations.',
    scoreCard: isAr ? 'بطاقة درجات الدورة الموحدة' : 'Consolidated Cycle Score Card',
    outOf100: isAr ? 'من 100' : 'out of 100',
    decisionResult: isAr ? 'نتيجة قرار الدورة الحالية' : 'Current Cycle Decision Result',
    decisionDesc: isAr ? 'تم تقييم أداءك النهائي بناءً على منظومة التقييم الشامل 360 درجة.' : 'Your overall weighted performance score is evaluated based on 360-degree performance matrix.',
    weightRules: isAr ? 'قواعد الأوزان: المهام (40%) + تقييم المدير (25%) + تقييم الأقران (15%) + الحضور (10%) + العمل الإضافي (10%).' : 'Weighting Rules: Task Grade (40%) + Supervisor Grade (25%) + Peer Grade (15%) + Attendance (10%) + Overtime Contribution (10%).',
    breakdownTitle: isAr ? 'تفصيل عناصر ومكونات الدرجة' : 'Score Components Breakdown',
    taskScore: isAr ? 'درجة المهام (الوزن 40%)' : 'Task Score (40% Weight)',
    managerScore: isAr ? 'تقييم المدير المباشر (الوزن 25%)' : 'Manager Evaluation Score (25% Weight)',
    peerScore: isAr ? 'تقييم الزملاء والأقران (الوزن 15%)' : 'Peer Evaluation Score (15% Weight)',
    attendanceScore: isAr ? 'الحضور والانضباط (الوزن 10%)' : 'Attendance & Punctuality (10% Weight)',
    overtimeScore: isAr ? 'مساهمة العمل الإضافي (الوزن 10%)' : 'Overtime Commitment (10% Weight)',
    peerComments: isAr ? 'تعليقات الزملاء المجمعة' : 'Aggregated Peer Comments',
    anonymized: isAr ? 'مجهولة الهوية ومحمية بالكامل' : 'Fully Anonymized',
    peerIntro: isAr ? 'ملاحظات تم تقديمها بسرية تامة من قبل زملائك في القسم بشأن جهود التعاون المشتركة:' : 'Feedback submitted anonymously by your colleagues regarding collaborative efforts during this performance window:',
    noComments: isAr ? 'لا توجد تعليقات إضافية مسجلة لهذه الدورة.' : 'No additional peer comments recorded for this cycle.',
    gapsTitle: isAr ? 'فجوات الكفاءة المحددة' : 'Identified Competency Gaps',
    gapsIntro: isAr ? 'حدد محرك تحليلات الأداء مجالات التركيز التالية بناءً على مؤشرات التقييم.' : 'The performance analytics engine identified the following focus areas based on evaluation indicators.',
    aiTitle: isAr ? 'توصيات التدريب الذكي (AI)' : 'AI Training Recommendations',
    aiBadge: isAr ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered Engine',
    aiIntro: isAr ? 'توصيات مسارات تعليمية مخصصة تم توليدها استناداً لمؤشرات أدائك وفجوات الكفاءة.' : 'Personalized learning recommendations generated based on your performance indicators and competency gaps.',
    noEvaluation: isAr ? 'لم يتم رصد نتائج تقييم معتمدة لك في الدورة الحالية بعد.' : 'No evaluated performance report available yet for the current cycle.',
    loadingText: isAr ? 'جاري تحميل تقرير الأداء...' : 'Loading performance report...',
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await getMyEvaluation();
        const data = res?.data?.data || res?.data;
        setEvaluation(data);
      } catch (err) {
        console.error("Failed to load evaluation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className={`performance-report-container ${isAr ? 'rtl' : 'ltr'}`} style={{ textAlign: 'center', padding: '60px' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#6366f1' }}></i>
        <p style={{ marginTop: '16px', color: '#64748b' }}>{t.loadingText}</p>
      </div>
    );
  }

  const finalScore = Number(evaluation?.final_score ?? 0);
  const scores = {
    tasks: Number(evaluation?.scores?.tasks ?? 0),
    manager: Number(evaluation?.scores?.manager ?? 0),
    peer: Number(evaluation?.scores?.peer ?? 0),
    attendance: Number(evaluation?.scores?.attendance ?? 0),
    overtime: Number(evaluation?.scores?.overtime ?? 0),
  };

  const aiRecs = Array.isArray(evaluation?.ai_recommendations) 
    ? evaluation.ai_recommendations 
    : (typeof evaluation?.ai_recommendations === 'string' ? (() => { try { return JSON.parse(evaluation.ai_recommendations || '[]'); } catch(e) { return []; } })() : []);

  const aiAnalysisObj = typeof evaluation?.ai_analysis === 'object' && evaluation?.ai_analysis !== null
    ? evaluation.ai_analysis
    : (typeof evaluation?.ai_analysis === 'string' ? (() => { try { return JSON.parse(evaluation.ai_analysis || '{}'); } catch(e) { return {}; } })() : {});

  const peerFeedback = Array.isArray(evaluation?.peer_feedback) && evaluation.peer_feedback.length > 0
    ? evaluation.peer_feedback 
    : (aiAnalysisObj?.peer_summary ? [aiAnalysisObj.peer_summary] : []);

  // Map backend decision string to frontend component prop
  const decisionKey = evaluation?.decision || (finalScore >= 90 ? 'promotion' : finalScore >= 75 ? 'bonus' : 'training_required');

  return (
    <div className={`performance-report-container ${isAr ? 'rtl' : 'ltr'}`}>
      <section className="top-header">
        <div className="page-title">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      {!evaluation ? (
        <div className="main-card" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <i className="fa-solid fa-chart-line" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '16px', display: 'block' }}></i>
          <h3>{t.noEvaluation}</h3>
        </div>
      ) : (
        <div className="report-grid-layout">
          <div className="left-report-column">
            {/* Consolidated Cycle Score Card */}
            <div className="main-card">
              <div className="card-header-title">
                <span>{t.scoreCard} {evaluation.cycle?.title ? `(${evaluation.cycle.title})` : ''}</span>
              </div>

              <div className="consolidated-flex-content">
                <div 
                  className="score-radial-progress" 
                  style={{ "--score": finalScore }} 
                >
                  <div className="radial-inner">
                    <span className="big-score-number">{finalScore}</span>
                    <span className="score-max-text">{t.outOf100}</span>
                  </div>
                </div>

                <div className="decision-info-block">
                  <h3 className="decision-mini-title">
                    {t.decisionResult}
                  </h3>

                  <p className="decision-paragraph-desc">
                    {t.decisionDesc}
                  </p>

                  <DecisionBadge decision={decisionKey} />
                </div>
              </div>

              <div className="weighting-rules-footer">
                <p>{t.weightRules}</p>
              </div>
            </div>

            {/* Score Components Breakdown */}
            <div className="main-card">
              <div className="card-header-title">
                <span>{t.breakdownTitle}</span>
              </div>

              <div className="components-bars-wrapper">
                <ScoreWeightBar
                  label={t.taskScore}
                  score={scores.tasks ?? 0}
                  weight={100}
                  color="#3b82f6"
                />

                <ScoreWeightBar
                  label={t.managerScore}
                  score={scores.manager ?? 0}
                  weight={100}
                  color="#8b5cf6"
                />

                <ScoreWeightBar
                  label={t.peerScore}
                  score={scores.peer ?? 0}
                  weight={100}
                  color="#10b981"
                />

                <ScoreWeightBar
                  label={t.attendanceScore}
                  score={scores.attendance ?? 0}
                  weight={100}
                  color="#f59e0b"
                />

                <ScoreWeightBar
                  label={t.overtimeScore}
                  score={scores.overtime ?? 0}
                  weight={100}
                  color="#ef4444"
                />
              </div>
            </div>
        
            {/* Aggregated Peer Comments */}
            <div className="main-card">
              <div className="card-header-title">
                <span>{t.peerComments}</span>
                <span className="meta-encryption-tag">
                  <i className="fa-solid fa-shield-halved"></i>
                  {t.anonymized}
                </span>
              </div>

              <p className="section-intro">
                {t.peerIntro}
              </p>

              <div className="comments-quotes-list">
                {peerFeedback.length > 0 ? (
                  peerFeedback.map((comment, index) => (
                    <div key={index} className="peer-comment-quote-box">
                      <p>"{comment}"</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '12px 0' }}>{t.noComments}</p>
                )}
              </div>
            </div>
          </div>

          <div className="right-report-column">
            {/* Identified Competency Gaps */}
            <div className="main-card">
              <div className="card-header-title">
                <span>{t.gapsTitle}</span>
              </div>

              <p className="section-intro">
                {t.gapsIntro}
              </p>

              <div className="gaps-tags-container">
                {scores.peer < 80 && (
                  <CompetencyGapTag
                    gapType="communication"
                    gapName={`${isAr ? 'التواصل والتعاون الجماعي' : 'Teamwork & Communication'} (${scores.peer})`}
                  />
                )}
                {scores.tasks < 80 && (
                  <CompetencyGapTag
                    gapType="technical"
                    gapName={`${isAr ? 'الإنجاز التقني للمهام' : 'Technical Execution'} (${scores.tasks})`}
                  />
                )}
                {scores.attendance < 85 && (
                  <CompetencyGapTag
                    gapType="attendance"
                    gapName={`${isAr ? 'الانضباط والالتزام بالمواعيد' : 'Punctuality & Attendance'} (${scores.attendance})`}
                  />
                )}
                {scores.tasks >= 80 && scores.peer >= 80 && scores.attendance >= 85 && (
                  <p style={{ color: '#10b981', fontSize: '0.9rem' }}>
                    <i className="fa-solid fa-circle-check"></i> {isAr ? 'أداء متوازن عبر جميع المؤشرات الرئيسية' : 'Balanced performance across all key metrics'}
                  </p>
                )}
              </div>
            </div>

            {/* AI Training Recommendations */}
            <div className="main-card">
              <div className="card-header-title">
                <span className="purple-text">
                  {t.aiTitle}
                </span>

                <span className="meta-engine-tag">
                  <i className="fa-solid fa-brain"></i>
                  {t.aiBadge}
                </span>
              </div>

              <p className="section-intro">
                {t.aiIntro}
              </p>

              <div className="ai-cards-container">
                {aiRecs.length > 0 ? (
                  aiRecs.map((item, index) => (
                    <AIRecommendationCard
                      key={index}
                      recommendation={{
                        courseName: item.course_name || item.courseName || item.title,
                        reason: item.reason || item.description,
                        matchingScore: item.matching_score || item.matchingScore || 90,
                        sequence: index + 1,
                      }}
                    />
                  ))
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '10px 0' }}>
                    {isAr ? 'سيتم توليد توصيات ذكية فور اكتمال معالجة بيانات الدورة.' : 'AI Recommendations will appear once cycle processing is complete.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceReport;