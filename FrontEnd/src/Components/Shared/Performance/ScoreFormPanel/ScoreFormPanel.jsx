import React, { useState } from 'react';
import './ScoreFormPanel.css';

const ScoreFormPanel = ({
    task = {},
    onSubmitScore,
    onSubmitRevision,
    calculatedTaskScore = 0, // Passed directly from parent/backend
    isSubmitting = false,
    lang
}) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

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
            alert(isAr ? 'يرجى كتابة ملاحظات التعديل المطلوبة لتوجيه الموظف' : 'Please write revision notes to guide the employee');
            return;
        }
        if (onSubmitRevision) {
            onSubmitRevision({
                task_id: task.id,
                notes: notes
            });
        }
    };

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

                {/* Live Preview Box (Value received from parent/backend calculations) */}
                <div className="score-live-preview-box">
                    <div className="score-preview-info">
                        <span className="score-preview-label">{isAr ? 'درجة المهمة المعتمدة:' : 'Approved Task Score:'}</span>
                        <span className="score-preview-math">
                            {isAr 
                                ? 'الدرجة المحسوبة والمعتمدة في الخلفية' 
                                : 'Consolidated grade computed in the backend'
                            }
                        </span>
                    </div>
                    <div className="score-preview-value-big">
                        {calculatedTaskScore.toFixed(1)} <span className="score-preview-max">/ 100</span>
                    </div>
                </div>

                {/* Two Action Paths */}
                <div className="score-panel-actions">
                    <button 
                        type="button" 
                        className="score-btn-revision"
                        onClick={handleRevisionRequest}
                        disabled={isSubmitting}
                    >
                        <i className="fa-solid fa-rotate-left"></i>
                        <span>{isAr ? 'إعادة للتعديل' : 'Request Revision'}</span>
                    </button>
                    <button 
                        type="button" 
                        className="score-btn-approve"
                        onClick={handleScoreSubmit}
                        disabled={isSubmitting}
                    >
                        <i className="fa-solid fa-check-double"></i>
                        <span>{isAr ? 'اعتماد رصد الدرجة' : 'Approve & Score'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ScoreFormPanel;
