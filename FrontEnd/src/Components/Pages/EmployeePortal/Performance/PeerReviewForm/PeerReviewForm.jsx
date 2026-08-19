import React, { useState, useEffect } from 'react';
import './PeerReviewForm.css';
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';
import { getDepartmentEmployees, getPerformanceCycles, submitPeerEvaluation } from '../../../../../services/performanceService';

const PeerReviewForm = () => {
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const t = {
        title: isAr ? 'تقييم وملاحظات الأقران' : 'Peer Review & Feedback',
        subtitle: isAr ? 'قدم تقييمك وملاحظاتك المجهولة حول جهود التعاون المشتركة لزملائك' : "Submit anonymous feedback regarding your colleagues' collaborative efforts",
        privacyTitle: isAr ? 'ضمان الخصوصية والسرية المطلقة:' : 'STRICT PRIVACY GUARANTEE:',
        privacyBody: isAr 
            ? 'تقييمات الأقران مجهولة المصدر بنسبة 100%. يتم تشفير الملاحظات باستخدام مفاتيح أمان مع تجزئة هويتك المشفرة، ولا يمكن لأي مدير أو مسؤول موارد بشرية معرفة مصدر التقييم.'
            : 'Peer submissions are 100% anonymized. Your comments are automatically encrypted on submission, and your user ID is hashed using a cycle-specific security salt. No supervisors or HR representatives can trace these scores back to you.',
        formTitle: isAr ? 'نموذج تقييم الزميل' : 'Peer Assessment Form',
        saltActive: isAr ? 'تشفير أمان نشط' : 'Secure Salt Active',
        selectColleague: isAr ? 'اختر الزميل المراد تقييمه *' : 'Colleague to Evaluate *',
        selectColleaguePlaceholder: isAr ? 'اختر زميل العمل...' : 'Select Colleague...',
        selectCycle: isAr ? 'دورة الأداء *' : 'Performance Cycle *',
        selectCyclePlaceholder: isAr ? 'اختر دورة الأداء...' : 'Select Cycle...',
        teamworkLabel: isAr ? 'العمل الجماعي والتعاون (0 - 10)' : 'Teamwork & Collaboration (0 - 10)',
        teamworkDesc: isAr ? 'يقيس مدى الاستعداد للمساعدة، التناغم وروح الفريق.' : 'Evaluates readiness to help, collaboration, and team engagement.',
        commLabel: isAr ? 'التواصل والشفافية (0 - 10)' : 'Communication & Cooperation (0 - 10)',
        commDesc: isAr ? 'يقيس وضوح التواصل، سرعة الاستجابة والتعاطي الإيجابي.' : 'Evaluates communication clarity, transparency, and collaboration.',
        feedbackLabel: isAr ? 'ملاحظات بناءة (اختياري)' : 'Constructive Feedback (Optional)',
        feedbackPlaceholder: isAr ? 'اكتب ملاحظات بنّاءة ومجهولة الهوية لتحسين بيئة العمل المشتركة...' : 'Write anonymous feedback...',
        validationTitle: isAr ? 'التحقق المجهول' : 'Anonymous Validation',
        validationDesc: isAr ? 'التحقق القائم على التجزئة نشط لمنع التقييمات المكررة مع الحفاظ على سرية الهوية.' : 'Hash-based verification active to prevent duplicate submissions.',
        hashSecured: isAr ? 'مؤمّن بالتجزئة' : 'HASH SECURED',
        clearBtn: isAr ? 'مسح' : 'Clear',
        submitBtn: isAr ? 'إرسال التقييم السري' : 'Submit Feedback',
        submitting: isAr ? 'جاري الإرسال...' : 'Submitting...',
        successMsg: isAr ? 'تم إرسال تقييم الزميل بنجاح وبسرية تامة!' : 'Peer review submitted successfully and anonymized!',
        errorMsg: isAr ? 'تعذر إرسال التقييم، تأكد من عدم تكرار التقييم لنفس الزميل في هذه الدورة.' : 'Failed to submit evaluation. Please make sure you have not already evaluated this colleague in this cycle.',
        noColleagues: isAr ? 'لا يوجد زملاء متاحين للتقييم في قسمك حالياً.' : 'No colleagues found in your department.',
        loadingData: isAr ? 'جاري تحميل البيانات...' : 'Loading data...',
    };

    const [colleaguesList, setColleaguesList] = useState([]);
    const [cyclesList, setCyclesList] = useState([]);
    const [selectedColleague, setSelectedColleague] = useState('');
    const [selectedCycle, setSelectedCycle] = useState('');
    const [teamworkScore, setTeamworkScore] = useState(8.0);
    const [commScore, setCommScore] = useState(7.5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [empRes, cycleRes] = await Promise.allSettled([
                    getDepartmentEmployees(),
                    getPerformanceCycles()
                ]);

                if (empRes.status === 'fulfilled') {
                    const rawData = empRes.value?.data;
                    const empData = Array.isArray(rawData?.data) 
                        ? rawData.data 
                        : (Array.isArray(rawData) ? rawData : []);
                    setColleaguesList(empData);
                    if (empData.length > 0) {
                        setSelectedColleague(empData[0].id);
                    }
                } else {
                    console.warn("Failed to load department colleagues:", empRes.reason);
                }

                if (cycleRes.status === 'fulfilled') {
                    const rawCycle = cycleRes.value?.data;
                    const cycleData = Array.isArray(rawCycle?.data) 
                        ? rawCycle.data 
                        : (Array.isArray(rawCycle) ? rawCycle : []);
                    setCyclesList(cycleData);
                    
                    // Auto-select active or latest cycle if available
                    const active = cycleData.find(c => c.status === 'active') || cycleData[0];
                    if (active) setSelectedCycle(active.id);
                }
            } catch (err) {
                console.error("Error loading peer review metadata:", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const handleClear = () => {
        setSelectedColleague('');
        setTeamworkScore(5.0);
        setCommScore(5.0);
        setComment('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedColleague) return;
        if (!selectedCycle) {
            alert(isAr ? 'يرجى اختيار دورة الأداء أولاً.' : 'Please select a performance cycle first.');
            return;
        }

        try {
            setSubmitting(true);
            await submitPeerEvaluation({
                performance_cycle_id: Number(selectedCycle),
                employee_profile_id: Number(selectedColleague),
                collaboration_score: Math.round(commScore),
                teamwork_score: Math.round(teamworkScore),
                comment: comment.trim() || (isAr ? 'تقييم تعاون إيجابي وتواصل فعّال.' : 'Positive collaboration and effective communication.')
            });

            alert(t.successMsg);
            handleClear();
        } catch (error) {
            console.error("Error submitting peer review:", error);
            const errors = error.response?.data?.errors;
            let serverMsg = error.response?.data?.message;
            if (errors && typeof errors === 'object') {
                const detailed = Object.values(errors).flat().join('\n');
                if (detailed) serverMsg = detailed;
            }
            alert(serverMsg || t.errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`peer-review-portal-container ${isAr ? 'rtl' : 'ltr'}`}>
            <section className="peer-header-section">
                <h1>{t.title}</h1>
                <div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>
                <p className="subtitle">
                    {t.subtitle}
                </p>
            </section>

            <div className="privacy-guarantee-banner">
                <div className="privacy-icon-wrapper">
                    <i className="fa-solid fa-user-shield"></i>
                </div>
                <div className="privacy-text-content">
                    <strong>{t.privacyTitle}</strong> {t.privacyBody}
                </div>
            </div>

            <div className="peer-card-body">
                <div className="peer-card-header-flex">
                    <h2 className="card-inner-title">{t.formTitle}</h2>
                    <span className="salt-status-badge">
                        <i className="fa-solid fa-key"></i> {t.saltActive}
                    </span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}></i>
                        {t.loadingData}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="peer-actual-form">
                        {cyclesList.length > 0 && (
                            <div className="peer-form-group">
                                <label>{t.selectCycle}</label>
                                <select
                                    className="peer-select-input"
                                    value={selectedCycle}
                                    onChange={(e) => setSelectedCycle(e.target.value)}
                                    required
                                >
                                    <option value="" disabled hidden>
                                        {t.selectCyclePlaceholder}
                                    </option>
                                    {cyclesList.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.title} ({c.status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="peer-form-group">
                            <label>{t.selectColleague}</label>
                            <select
                                className="peer-select-input"
                                value={selectedColleague}
                                onChange={(e) => setSelectedColleague(e.target.value)}
                                required
                            >
                                <option value="" disabled hidden>
                                    {t.selectColleaguePlaceholder}
                                </option>
                                {colleaguesList.map(col => (
                                    <option key={col.id} value={col.id}>
                                        {col.full_name || col.name} {col.job_title ? `— (${col.job_title})` : ''}
                                    </option>
                                ))}
                            </select>
                            {colleaguesList.length === 0 && (
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>{t.noColleagues}</p>
                            )}
                        </div>

                        <div className="peer-form-group slider-box-wrap">
                            <div className="slider-label-header">
                                <span className="slider-title">
                                    {t.teamworkLabel}
                                </span>
                                <span className="slider-counter-badge">
                                    {teamworkScore.toFixed(1)}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                className="peer-range-slider"
                                value={teamworkScore}
                                onChange={(e) =>
                                    setTeamworkScore(parseFloat(e.target.value))
                                }
                            />

                            <p className="slider-bottom-desc">
                                {t.teamworkDesc}
                            </p>
                        </div>

                        <div className="peer-form-group slider-box-wrap">
                            <div className="slider-label-header">
                                <span className="slider-title">
                                    {t.commLabel}
                                </span>
                                <span className="slider-counter-badge">
                                    {commScore.toFixed(1)}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                className="peer-range-slider"
                                value={commScore}
                                onChange={(e) =>
                                    setCommScore(parseFloat(e.target.value))
                                }
                            />

                            <p className="slider-bottom-desc">
                                {t.commDesc}
                            </p>
                        </div>

                        <div className="peer-form-group">
                            <label>{t.feedbackLabel}</label>
                            <textarea
                                className="peer-textarea-field"
                                rows={4}
                                placeholder={t.feedbackPlaceholder}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <div className="anonymous-validation-footer-box">
                            <div className="validation-meta-text">
                                <h4>{t.validationTitle}</h4>
                                <p>{t.validationDesc}</p>
                            </div>

                            <span className="hash-secured-badge">
                                <i className="fa-solid fa-shield-halved"></i> {t.hashSecured}
                            </span>
                        </div>

                        <div className="peer-form-actions">
                            <button
                                type="button"
                                className="btn-peer-clear"
                                onClick={handleClear}
                            >
                                {t.clearBtn}
                            </button>

                            <button 
                                type="submit" 
                                className="btn-peer-submit"
                                disabled={submitting || colleaguesList.length === 0}
                            >
                                {submitting ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-lock"></i> {t.submitBtn}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PeerReviewForm;