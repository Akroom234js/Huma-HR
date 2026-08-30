import React, { useState } from 'react';
import './ScoreFormPanel.css';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../../Notification/NotificationContext';
import DashboardLoader from '../../DashboardLoader/DashboardLoader';

const ScoreFormPanel = ({
    task = {},
    onSubmitScore,
    onSubmitRevision,
    calculatedTaskScore = 0, // Passed directly from parent/backend
    isSubmitting = false,
    lang
}) => {
    const { i18n } = useTranslation();
    const currentLang = lang || (i18n ? i18n.language : sessionStorage.getItem('lang')) || 'en';
    const isAr = currentLang === 'ar';
    const { showWarning } = useNotification();

    // State variables
    const [completion, setCompletion] = useState(80);
    const [quality, setQuality] = useState(80);
    const [notes, setNotes] = useState('');

    const daysLate = task?.days_late || 0;
    const totalPenalty = daysLate * (task?.late_penalty_per_day || 0);

    const handleScoreSubmit = (e) => {
        e.preventDefault();
        if (onSubmitScore) {
            onSubmitScore({
                task_id: task.id,
                completion_score: completion,
                quality_score: quality,
                notes: notes
            });
        }
    };

    const handleRevisionRequest = (e) => {
        e.preventDefault();
        if (!notes.trim()) {
            showWarning(isAr ? 'يرجى كتابة ملاحظات التعديل المطلوبة لتوجيه الموظف' : 'Please write revision notes to guide the employee');
            return;
        }
        if (onSubmitRevision) {
            onSubmitRevision({
                task_id: task.id,
                notes: notes
            });
        }
    };

    const isPendingReview = task?.status === 'pending_review';

    return (
        <div className="performance-score-form-panel">
            <h4 className="score-panel-title">
                <i className="fa-solid fa-graduation-cap title-icon"></i>
                <span>{isAr ? 'لوحة تقييم واعتماد المهمة' : 'Task Grading & Review Panel'}</span>
            </h4>

            {daysLate > 0 && (
                <div className="score-panel-warning">
                    <i className="fa-solid fa-clock-warning panel-warn-icon"></i>
                    <div>
                        <span>
                            {isAr 
                                ? `تنبيه تأخير: المهمة متأخرة بـ ${daysLate} أيام. خصم التأخير الإجمالي = ${totalPenalty} نقاط.` 
                                : `Late Alert: Task is overdue by ${daysLate} days. Total late penalty = ${totalPenalty} pts.`}
                        </span>
                    </div>
                </div>
            )}

            <form className="score-panel-form">
                {/* Completion Slider */}
                <div className="score-range-container">
                    <div className="score-range-header">
                        <span className="score-range-title">
                            <i className="fa-solid fa-circle-check"></i> {isAr ? 'درجة اكتمال المخرجات (60%)' : 'Completion Score (60%)'}
                        </span>
                        <span className="score-range-val">{completion} / 100</span>
                    </div>
                    <input 
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        className="score-custom-range"
                        value={completion}
                        onChange={(e) => setCompletion(parseInt(e.target.value))}
                    />
                    <span className="slider-hint">
                        {isAr ? 'ما مدى إنجاز الموظف لكافة التسليمات المطلوبة للمهمة؟' : 'Has the employee successfully delivered all requested outputs?'}
                    </span>
                </div>

                {/* Quality Slider */}
                <div className="score-range-container">
                    <div className="score-range-header">
                        <span className="score-range-title">
                            <i className="fa-solid fa-star"></i> {isAr ? 'درجة جودة المخرجات (40%)' : 'Quality Score (40%)'}
                        </span>
                        <span className="score-range-val">{quality} / 100</span>
                    </div>
                    <input 
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        className="score-custom-range"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                    />
                    <span className="slider-hint">
                        {isAr ? 'ما مدى دقة واحترافية العمل المسلم؟' : 'What is the professional standard of the work delivered?'}
                    </span>
                </div>

                {/* Remarks Textarea */}
                <div className="score-panel-group">
                    <label className="score-panel-label">
                        {isAr ? 'ملاحظات وتوجيهات المدير المشرف' : 'Supervisor Review Notes'}
                    </label>
                    <textarea 
                        className="score-textarea-control"
                        placeholder={isAr 
                            ? 'اكتب ملاحظات التقييم هنا... (إلزامية في حالة طلب إعادة التعديل)' 
                            : 'Write review notes here... (Mandatory if requesting a revision)'}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Live Preview Box */}
                {(() => {
                    const liveEstimated = Math.max(0, Math.min(100, (completion * 0.6) + (quality * 0.4) - totalPenalty));
                    const displayScore = task?.status === 'scored' && calculatedTaskScore ? calculatedTaskScore : liveEstimated;
                    return (
                        <div className="score-live-preview-box">
                            <div className="score-preview-info">
                                <span className="score-preview-label">{isAr ? 'الدرجة التقديرية المحسوبة:' : 'Calculated Task Score:'}</span>
                                <span className="score-preview-math">
                                    {isAr 
                                        ? `(اكتمال 60% + جودة 40%) ${totalPenalty > 0 ? `- خصم تأخير (${totalPenalty} نقطة)` : ''}`
                                        : `(60% Completion + 40% Quality) ${totalPenalty > 0 ? `- Late penalty (${totalPenalty} pts)` : ''}`
                                    }
                                </span>
                            </div>
                            <div className="score-preview-value-big">
                                {displayScore.toFixed(1)} <span className="score-preview-max">/ 100</span>
                            </div>
                        </div>
                    );
                })()}

                {/* Two Action Paths */}
                <div className="score-panel-actions">
                    <button 
                        type="button" 
                        className="score-btn-revision"
                        onClick={handleRevisionRequest}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <DashboardLoader size="xs" inline text="" />
                        ) : (
                            <i className="fa-solid fa-rotate-left"></i>
                        )}
                        <span>{isAr ? 'إعادة للتعديل' : 'Request Revision'}</span>
                    </button>
                    <button 
                        type="button" 
                        className="score-btn-approve"
                        onClick={handleScoreSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <DashboardLoader size="xs" inline text="" />
                        ) : (
                            <i className="fa-solid fa-check-double"></i>
                        )}
                        <span>{isAr ? 'اعتماد رصد الدرجة' : 'Approve & Score'}</span>
                    </button>
                </div>
            </form>

            {!isPendingReview && (
                <div className="score-panel-overlay">
                    <div className="score-panel-overlay-card">
                        <i className="fa-solid fa-lock overlay-lock-icon"></i>
                        <h3>{isAr ? 'التقييم غير متاح' : 'Evaluation Unavailable'}</h3>
                        <p style={{ marginTop: '8px' }}>
                            {task?.status === 'scored' 
                                ? (isAr ? 'تم رصد التقييم النهائي لهذه المهمة واعتماد الدرجة مسبقاً، ولا يمكن تعديلها.' : 'The final evaluation for this task has already been completed and approved. It cannot be modified.')
                                : task?.status === 'pending'
                                ? (isAr ? 'هذه المهمة معلقة ولم يبدأ الموظف بالعمل عليها بعد، لذا لا يمكن تقييمها حالياً.' : 'This task is pending and has not been started by the employee yet. It cannot be evaluated yet.')
                                : task?.status === 'in_progress'
                                ? (isAr ? 'المهمة قيد العمل حالياً لدى الموظف ولم يتم تسليمها للمراجعة بعد.' : 'This task is currently in progress by the employee and has not been submitted for review yet.')
                                : task?.status === 'needs_revision'
                                ? (isAr ? 'تمت إعادة المهمة للموظف للتعديل وبانتظار تسليمها مجدداً للمراجعة.' : 'The task was returned to the employee for revision and is awaiting resubmission for review.')
                                : (isAr ? 'هذه المهمة غير جاهزة للمراجعة والتقييم حالياً.' : 'This task is not ready for review and evaluation currently.')
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScoreFormPanel;

