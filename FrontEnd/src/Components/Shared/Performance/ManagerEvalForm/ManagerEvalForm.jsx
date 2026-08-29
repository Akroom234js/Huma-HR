import React, { useState, useEffect } from 'react';
import './ManagerEvalForm.css';
import { useTranslation } from 'react-i18next';
import DashboardLoader from '../../DashboardLoader/DashboardLoader';

const ManagerEvalForm = ({ 
    employeeName = '', 
    onSubmit, 
    isSubmitting = false, 
    isEvaluated = false,
    initialValues = null,
    lang 
}) => {
    const { i18n } = useTranslation();
    const currentLang = lang || (i18n ? i18n.language : sessionStorage.getItem('lang')) || 'en';
    const isAr = currentLang === 'ar';

    // State variables for form fields
    const [professionalism, setProfessionalism] = useState(5);
    const [responsibility, setResponsibility] = useState(5);
    const [problemSolving, setProblemSolving] = useState(5);
    const [notes, setNotes] = useState('');

    // Pre-populate or reset values when active employee or initialValues change
    useEffect(() => {
        if (initialValues) {
            setProfessionalism(initialValues.professionalism !== undefined && initialValues.professionalism !== null ? Number(initialValues.professionalism) : 5);
            setResponsibility(initialValues.responsibility !== undefined && initialValues.responsibility !== null ? Number(initialValues.responsibility) : 5);
            setProblemSolving(initialValues.problem_solving !== undefined && initialValues.problem_solving !== null ? Number(initialValues.problem_solving) : 5);
            setNotes(initialValues.notes || '');
        } else {
            setProfessionalism(5);
            setResponsibility(5);
            setProblemSolving(5);
            setNotes('');
        }
    }, [initialValues, employeeName]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                professionalism: professionalism,
                responsibility: responsibility,
                problem_solving: problemSolving,
                notes: notes
            });
        }
    };

    // Calculate live composite score (out of 100) from the 3 sliders
    const currentScore = ((professionalism + responsibility + problemSolving) / 30) * 100;

    return (
        <form className="performance-manager-eval-form" onSubmit={handleSubmit}>
            <h4 className="eval-form-title">
                <i className="fa-solid fa-clipboard-check title-icon"></i>
                <span>
                    {isAr 
                        ? `نموذج التقييم الدوري للموظف: ${employeeName}` 
                        : `Supervisor Evaluation Form: ${employeeName}`
                    }
                </span>
            </h4>

            {/* Informational Banner if Employee is Already Evaluated */}
            {isEvaluated && (
                <div className="eval-already-submitted-banner">
                    <div className="banner-icon">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div className="banner-content">
                        <h5>{isAr ? 'تم تقييم هذا الموظف مسبقاً في هذه الدورة' : 'Employee Already Evaluated in this Cycle'}</h5>
                        <p>
                            {isAr 
                                ? 'تم رصد درجات هذا الموظف بالفعل. يمكنك تعديل الدرجات والملاحظات أدناه والضغط على "تحديث التقييم" لتعديل التقييم القائم.' 
                                : 'An evaluation has already been submitted for this employee. You can adjust the scores and remarks below and click "Update Evaluation" to update it.'}
                        </p>
                        {initialValues?.submitted_at && (
                            <span className="banner-date">
                                <i className="fa-regular fa-clock"></i> 
                                <span>{isAr ? `تاريخ الرصد: ${initialValues.submitted_at}` : `Recorded on: ${initialValues.submitted_at}`}</span>
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="eval-sliders-section">
                {/* Professionalism slider */}
                <div className="eval-range-container">
                    <div className="eval-range-header">
                        <span className="eval-range-title">
                            <i className="fa-solid fa-briefcase"></i> {isAr ? 'الاحترافية والمهنية (Professionalism)' : 'Professionalism'}
                        </span>
                        <span className="eval-range-val">{professionalism} / 10</span>
                    </div>
                    <input 
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        className="eval-custom-range"
                        value={professionalism}
                        onChange={(e) => setProfessionalism(parseInt(e.target.value, 10))}
                    />
                    <span className="slider-hint">
                        {isAr ? 'مدى الالتزام بالمعايير المهنية والسلوك الوظيفي' : 'Commitment to professional ethics and job behavior'}
                    </span>
                </div>

                {/* Responsibility slider */}
                <div className="eval-range-container">
                    <div className="eval-range-header">
                        <span className="eval-range-title">
                            <i className="fa-solid fa-circle-check"></i> {isAr ? 'المسؤولية والانضباط (Responsibility)' : 'Responsibility'}
                        </span>
                        <span className="eval-range-val">{responsibility} / 10</span>
                    </div>
                    <input 
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        className="eval-custom-range"
                        value={responsibility}
                        onChange={(e) => setResponsibility(parseInt(e.target.value, 10))}
                    />
                    <span className="slider-hint">
                        {isAr ? 'مدى تحمل المسؤولية والالتزام بالتسليمات والمواعيد' : 'Accountability and commitment to deliverables and deadlines'}
                    </span>
                </div>

                {/* Problem Solving slider */}
                <div className="eval-range-container">
                    <div className="eval-range-header">
                        <span className="eval-range-title">
                            <i className="fa-solid fa-lightbulb"></i> {isAr ? 'حل المشكلات والابتكار (Problem-Solving)' : 'Problem-Solving'}
                        </span>
                        <span className="eval-range-val">{problemSolving} / 10</span>
                    </div>
                    <input 
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        className="eval-custom-range"
                        value={problemSolving}
                        onChange={(e) => setProblemSolving(parseInt(e.target.value, 10))}
                    />
                    <span className="slider-hint">
                        {isAr ? 'القدرة على مواجهة التحديات وابتكار حلول عملية' : 'Ability to address challenges and create practical solutions'}
                    </span>
                </div>
            </div>

            {/* Optional remarks */}
            <div className="eval-form-group">
                <label className="eval-form-label">
                    {isAr ? 'ملاحظات وتوجيهات المدير' : 'Manager Feedback & Remarks'}
                </label>
                <textarea 
                    className="eval-textarea-control"
                    placeholder={isAr ? 'اكتب ملاحظاتك وتوجيهاتك للموظف...' : 'Write notes and directives for the employee...'}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            {/* Live Preview Box */}
            <div className="eval-live-preview-box">
                <div className="preview-info">
                    <span className="preview-label">{isAr ? 'الدرجة المحسوبة (من 100):' : 'Calculated Score (out of 100):'}</span>
                    <span className="preview-math">
                        {isAr 
                            ? 'متوسط معايير التقييم الثلاثة' 
                            : 'Average of the 3 evaluation metrics'
                        }
                    </span>
                </div>
                <div className="preview-value-big">
                    {currentScore.toFixed(1)} <span className="preview-max">/ 100</span>
                </div>
            </div>

            {/* Form actions */}
            <div className="eval-form-actions">
                <button 
                    type="submit" 
                    className={`eval-submit-btn ${isEvaluated ? 'update-mode' : ''}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <DashboardLoader size="xs" inline text="" />
                            <span style={{ marginInlineStart: '6px' }}>{isEvaluated 
                                ? (isAr ? 'جاري تحديث التقييم...' : 'Updating Evaluation...') 
                                : (isAr ? 'جاري إرسال التقييم...' : 'Submitting Evaluation...')}
                            </span>
                        </>
                    ) : (
                        <>
                            <i className={isEvaluated ? "fa-solid fa-pen-to-square" : "fa-solid fa-circle-check"}></i>
                            <span>{isEvaluated 
                                ? (isAr ? 'تحديث التقييم' : 'Update Evaluation') 
                                : (isAr ? 'اعتماد وإرسال التقييم' : 'Approve & Submit Evaluation')}
                            </span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ManagerEvalForm;

