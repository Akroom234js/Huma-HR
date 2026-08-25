import React, { useState, useEffect } from 'react';
import './PeerReviewForm.css';
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { getDepartmentEmployees, getPerformanceCycles, submitPeerEvaluation } from '../../../../../services/performanceService';

const PeerReviewForm = () => {
    const { t, i18n } = useTranslation('EmployeePortal/PeerReviewForm');
    const isAr = i18n ? i18n.language === 'ar' : false;

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
                    
                    const activeCycles = cycleData.filter(c => c.status === 'active');
                    setCyclesList(activeCycles);
                    
                    if (activeCycles.length > 0) {
                        setSelectedCycle(activeCycles[0].id);
                    } else {
                        setSelectedCycle('');
                    }
                }
            } catch (err) {
                console.error("Error loading peer review metadata:", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [i18n.language]);

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
            alert(t('selectCycleAlert'));
            return;
        }

        try {
            setSubmitting(true);
            await submitPeerEvaluation({
                performance_cycle_id: Number(selectedCycle),
                employee_profile_id: Number(selectedColleague),
                collaboration_score: Math.round(commScore),
                teamwork_score: Math.round(teamworkScore),
                comment: comment.trim() || t('defaultComment')
            });

            alert(t('successMsg'));
            handleClear();
        } catch (error) {
            console.error("Error submitting peer review:", error);
            const errors = error.response?.data?.errors;
            let serverMsg = error.response?.data?.message;
            if (errors && typeof errors === 'object') {
                const firstKey = Object.keys(errors)[0];
                if (firstKey && errors[firstKey].length > 0) {
                    serverMsg = errors[firstKey][0];
                }
            }
            alert(serverMsg || t('errorMsg'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="peer-review-portal-container" style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                <p style={{ marginTop: '16px', color: 'var(--text-muted, #64748b)' }}>{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className={`peer-review-portal-container ${isAr ? 'rtl' : 'ltr'}`}>
            <section className="peer-header-section">
                <h1>{t('title')}</h1>
                <p className="subtitle">{t('subtitle')}</p>
            </section>

            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <div className="privacy-guarantee-banner">
                <div className="privacy-icon-wrapper">
                    <i className="bi bi-shield-lock-fill"></i>
                </div>
                <div className="privacy-text-content">
                    <strong>{t('privacyTitle')}</strong> {t('privacyBody')}
                </div>
            </div>

            <div className="peer-card-body">
                <div className="peer-card-header-flex">
                    <h2 className="card-inner-title">{t('formTitle')}</h2>
                    <span className="salt-status-badge">
                        <i className="bi bi-key-fill me-1"></i> {t('saltSecured')}
                    </span>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Performance Cycle Selection */}
                    <div className="peer-form-group">
                        <label className="peer-required-label">{t('cycleLabel')}</label>
                        <select
                            className="peer-select-input"
                            value={selectedCycle}
                            onChange={(e) => setSelectedCycle(e.target.value)}
                            required
                        >
                            <option value="">{t('selectCyclePlaceholder')}</option>
                            {cyclesList.map(cycle => (
                                <option key={cycle.id} value={cycle.id}>
                                    {cycle.title} ({cycle.start_date} - {cycle.end_date})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Colleague Target */}
                    <div className="peer-form-group">
                        <label className="peer-required-label">{t('selectColleague')}</label>
                        <select 
                            className="peer-select-input"
                            value={selectedColleague}
                            onChange={(e) => setSelectedColleague(e.target.value)}
                            required
                        >
                            <option value="">{t('selectPlaceholder')}</option>
                            {colleaguesList.map((colleague) => (
                                <option key={colleague.id} value={colleague.id}>
                                    {colleague.full_name || colleague.name || colleague.user?.name || `Employee #${colleague.id}`}
                                    {colleague.position ? ` — ${colleague.position}` : (colleague.job_title ? ` — ${colleague.job_title}` : '')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Teamwork Competency Slider */}
                    <div className="peer-form-group">
                        <div className="slider-box-wrap">
                            <div className="slider-label-header">
                                <span className="slider-title">
                                    <i className="bi bi-people-fill me-1"></i> {t('teamworkTitle')}
                                </span>
                                <span className="slider-counter-badge">{teamworkScore} / 10</span>
                            </div>
                            <input 
                                type="range" 
                                className="peer-range-slider" 
                                min="1.0" 
                                max="10.0" 
                                step="0.5"
                                value={teamworkScore}
                                onChange={(e) => setTeamworkScore(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Communication Competency Slider */}
                    <div className="peer-form-group">
                        <div className="slider-box-wrap">
                            <div className="slider-label-header">
                                <span className="slider-title">
                                    <i className="bi bi-chat-left-quote-fill me-1"></i> {t('commTitle')}
                                </span>
                                <span className="slider-counter-badge">{commScore} / 10</span>
                            </div>
                            <input 
                                type="range" 
                                className="peer-range-slider" 
                                min="1.0" 
                                max="10.0" 
                                step="0.5"
                                value={commScore}
                                onChange={(e) => setCommScore(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Subjective Comments */}
                    <div className="peer-form-group">
                        <label>{t('commentLabel')}</label>
                        <textarea
                            className="peer-textarea-field"
                            rows="4"
                            placeholder={t('commentPlaceholder')}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="anonymous-validation-footer-box">
                        <div className="validation-meta-text">
                            <h4>{t('anonymityVerified')}</h4>
                            <p>{t('anonymityDisclaimer')}</p>
                        </div>
                        <span className="hash-secured-badge">
                            <i className="bi bi-check-circle-fill"></i> {t('hashBadge')}
                        </span>
                    </div>

                    <div className="peer-form-actions">
                        <button 
                            type="button" 
                            className="btn-peer-clear" 
                            onClick={handleClear}
                            disabled={submitting}
                        >
                            {t('clear')}
                        </button>
                        <button 
                            type="submit" 
                            className="btn-peer-submit"
                            disabled={submitting || colleaguesList.length === 0}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    {t('submitting')}
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-send-fill me-1"></i>
                                    {t('submit')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PeerReviewForm;