import React, { useState } from 'react';
import './ManagerEvalForm.css';
import { useTranslation } from 'react-i18next';

const ManagerEvalForm = ({ 
    employeeName = '', 
    onSubmit, 
    isSubmitting = false, 
    managerScore = 0, // Passed from parent/backend
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
                        onChange={(e) => setProfessionalism(parseInt(e.target.value))}
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
                        onChange={(e) => setResponsibility(parseInt(e.target.value))}
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
                        onChange={(e) => setProblemSolving(parseInt(e.target.value))}
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
                    className="eval-submit-btn" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            <span>{isAr ? 'جاري إرسال التقييم...' : 'Submitting Evaluation...'}</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-circle-check"></i>
                            <span>{isAr ? 'اعتماد وإرسال التقييم' : 'Approve & Submit Evaluation'}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ManagerEvalForm;
