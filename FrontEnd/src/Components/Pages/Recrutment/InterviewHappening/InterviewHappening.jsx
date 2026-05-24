import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../Header/Header';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import Tabs from '../Tabs/Tabs';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import CreateJobModal from '../CreateJobModal/CreateJobModal';
import '../Main-page/Recrutment.css';
import './InterviewHappening.css';
import { 
    getApplications, 
    getJobPostings, 
    getApplicationsPipelineStats, 
    executeTransition, 
    recordInterviewFeedback 
} from '../../../../services/atsService';

// Premium skeleton matching the timeline list layout
const CandidateRowSkeleton = () => (
    <div className="timeline-item-wrapper" style={{ opacity: 0.6, pointerEvents: 'none' }}>
        <div className="timeline-row">
            <div className="time-column" style={{ minWidth: 90 }}>
                <div className="skeleton-line" style={{ width: 50, height: 20 }} />
                <div className="skeleton-line" style={{ width: 40, height: 12, marginTop: 4 }} />
            </div>
            <div className="candidate-column">
                <div className="candidate-row-top">
                    <div className="skeleton-line" style={{ width: 120, height: 18 }} />
                    <div className="skeleton-line" style={{ width: 80, height: 14 }} />
                </div>
                <div className="skeleton-line" style={{ width: 180, height: 12, marginTop: 6 }} />
            </div>
            <div className="details-column">
                <div className="skeleton-line" style={{ width: 100, height: 14 }} />
                <div className="skeleton-line" style={{ width: 70, height: 14, marginTop: 6 }} />
            </div>
            <div className="actions-column">
                <div className="skeleton-line" style={{ width: 38, height: 38, borderRadius: 8 }} />
                <div className="skeleton-line" style={{ width: 38, height: 38, borderRadius: 8 }} />
                <div className="skeleton-line" style={{ width: 38, height: 38, borderRadius: 8 }} />
            </div>
        </div>
    </div>
);

// Helpers to format scheduled times
const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '--:--';
    try {
        const timePart = dateTimeStr.split(' ')[1];
        return timePart ? timePart.substring(0, 5) : '--:--';
    } catch {
        return '--:--';
    }
};

const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    try {
        const datePart = dateTimeStr.split(' ')[0];
        const parts = datePart.split('-');
        if (parts.length === 3) {
            return `${parts[1]}/${parts[2]}`; // MM/DD
        }
        return datePart;
    } catch {
        return 'N/A';
    }
};

export default function InterviewHappening() {
    const [activeTab, setActiveTab]       = useState('interview-happening');
    const [selectedDept, setSelectedDept]   = useState(() => sessionStorage.getItem('selected_job_posting_id') || '');
    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [editingJob, setEditingJob]       = useState(null);
    const [applications, setApplications]   = useState([]);
    const [loading, setLoading]             = useState(true);
    const [pagination, setPagination]       = useState({ total: 0, current_page: 1, last_page: 1 });
    const [jobs, setJobs]                   = useState([]);
    const [jobsCount, setJobsCount]         = useState(0);
    const [counts, setCounts]               = useState({ pending: 0, shortlisted: 0, interviewing: 0, offered: 0, hired: 0 });

    // State for inline feedback/rejection drawers
    const [activeFeedbackId, setActiveFeedbackId]   = useState(null);
    const [activeRejectionId, setActiveRejectionId] = useState(null);
    const [inlineRating, setInlineRating]           = useState(0);
    const [inlineFeedback, setInlineFeedback]       = useState('');
    const [submittingAction, setSubmittingAction]   = useState(false);

    const { t } = useTranslation('Recrutment/ToScheduleInterview');

    const tabs = [
        { id: 'newly-applied',       label: t('Tabs.Newly-Applied') || 'Newly Applied',       count: counts.pending,      path: '/recruitment/newly-applied' },
        { id: 'schedule-interview',  label: t('Tabs.To-Schedule-Interview'),   count: counts.shortlisted,  path: '/recruitment/schedule-interview' },
        { id: 'interview-happening', label: t('Tabs.Interview-Happening'),    count: counts.interviewing, path: '/recruitment/interview-happening' },
        { id: 'make-offer',          label: t('Tabs.To-Make-Offer'),           count: counts.offered,      path: '/recruitment/make-offer' },
        { id: 'hired',               label: 'Hired Candidates',                count: counts.hired,        path: '/recruitment/hired' },
        { id: 'opening-jobs',        label: t('Tabs.Opening'),                 count: jobsCount,           path: '/recruitment/opening-jobs' },
    ];

    const departmentOptions = [
        { value: '', label: t('departmentOptions.all') || 'الكل' },
        ...jobs.map(j => ({ value: String(j.id), label: j.title })),
    ];

    // ── Fetch all job postings for dropdown ────────────────
    useEffect(() => {
        getJobPostings().then(res => {
            const data = res.data?.data ?? res.data ?? [];
            const list = Array.isArray(data) ? data : [];
            setJobs(list);
            setJobsCount(list.length);
        }).catch(err => console.error('Failed to fetch jobs:', err));
    }, []);

    // ── Fetch pipeline counts for tab badges ──────────────────
    const fetchCounts = useCallback(async () => {
        try {
            const res = await getApplicationsPipelineStats(selectedDept || null);
            const stats = res.data?.data ?? {};
            setCounts({
                pending:      (stats.pending ?? 0) + (stats.reviewed ?? 0),
                shortlisted:  stats.shortlisted ?? 0,
                interviewing: stats.interviewing ?? 0,
                offered:      stats.offered ?? 0,
                hired:        stats.hired ?? 0,
            });
        } catch { /* silent */ }
    }, [selectedDept]);

    useEffect(() => { fetchCounts(); }, [fetchCounts]);

    // ── Fetch interviewing applications ────────────────────
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const params = { status: 'interviewing', per_page: 20 };
            if (selectedDept) {
                params.job_posting_id = selectedDept;
            }
            const res  = await getApplications(params);
            const body = res.data?.data ?? {};
            const list = body.applications ?? [];
            setApplications(Array.isArray(list) ? list : []);
            if (body.pagination) setPagination(body.pagination);
        } catch (err) {
            console.error('Failed to fetch interviewing applications:', err);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDept]);

    useEffect(() => { fetchApplications(); }, [fetchApplications]);

    // Remove / update card after pipeline action
    const handleTransitionDone = (updatedApp) => {
        if (updatedApp.status !== 'interviewing') {
            setApplications(prev => prev.filter(a => a.id !== updatedApp.id));
        } else {
            setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
        }
    };

    // Actions & inline drawer logic
    const handlePass = async (appId) => {
        const confirmMsg = t('confirm.pass') || 'هل أنت متأكد من قبول المترشح ونقله إلى مرحلة تقديم العرض؟';
        if (window.confirm(confirmMsg)) {
            setSubmittingAction(true);
            try {
                const res = await executeTransition(appId, 'offered');
                const updated = res.data?.data ?? res.data ?? {};
                handleTransitionDone(updated);
                fetchCounts();
            } catch (err) {
                console.error('Failed to pass candidate:', err);
                alert(t('errors.generic') || 'فشلت العملية. الرجاء المحاولة مرة أخرى.');
            } finally {
                setSubmittingAction(false);
            }
        }
    };

    const handleToggleRejection = (appId) => {
        if (activeRejectionId === appId) {
            handleCancelDrawer();
        } else {
            setActiveRejectionId(appId);
            setActiveFeedbackId(null);
            setInlineFeedback('');
        }
    };

    const handleToggleFeedback = (appId, interview) => {
        if (activeFeedbackId === appId) {
            handleCancelDrawer();
        } else {
            setActiveFeedbackId(appId);
            setActiveRejectionId(null);
            setInlineRating(interview.rating || 0);
            setInlineFeedback(interview.feedback || '');
        }
    };

    const handleCancelDrawer = () => {
        setActiveFeedbackId(null);
        setActiveRejectionId(null);
        setInlineRating(0);
        setInlineFeedback('');
    };

    const handleConfirmRejection = async (appId) => {
        setSubmittingAction(true);
        try {
            const res = await executeTransition(appId, 'rejected', inlineFeedback);
            const updated = res.data?.data ?? res.data ?? {};
            handleTransitionDone(updated);
            handleCancelDrawer();
            fetchCounts();
        } catch (err) {
            console.error('Failed to reject candidate:', err);
            alert(t('errors.generic') || 'فشلت العملية. الرجاء المحاولة مرة أخرى.');
        } finally {
            setSubmittingAction(false);
        }
    };

    const handleSaveFeedback = async (interviewId, application) => {
        if (inlineRating < 1 || inlineRating > 5) {
            alert(t('errors.ratingRequired') || 'الرجاء اختيار تقييم بين 1 و 5 نجوم.');
            return;
        }
        setSubmittingAction(true);
        try {
            await recordInterviewFeedback(interviewId, {
                rating: inlineRating,
                feedback: inlineFeedback
            });

            // Local state update for instant, responsive UI experience
            setApplications(prev => prev.map(app => {
                if (app.id === application.id) {
                    return {
                        ...app,
                        interviews: app.interviews.map(i => 
                            i.id === interviewId ? { ...i, rating: inlineRating, feedback: inlineFeedback } : i
                        )
                    };
                }
                return app;
            }));
            
            handleCancelDrawer();
        } catch (err) {
            console.error('Failed to save interview feedback:', err);
            alert(t('errors.generic') || 'فشلت العملية. الرجاء المحاولة مرة أخرى.');
        } finally {
            setSubmittingAction(false);
        }
    };

    const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            <div className="recruitment-page">
                <div className="recruitment-container">
                    <div className="recruitment-header-flex">
                        <Header onCreateJob={() => { setEditingJob(null); setIsModalOpen(true); }} />
                        <ThemeToggle />
                    </div>
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                    <FilterDropdown
                        value={selectedDept}
                        onChange={(val) => {
                            setSelectedDept(val);
                            sessionStorage.setItem('selected_job_posting_id', val);
                        }}
                        options={departmentOptions}
                    />

                    {/* Date Separator */}
                    <div className="interviewhappening">
                        <hr className="hr" />
                        <p className="dateInterview">{today}</p>
                        <hr className="hr" />
                    </div>

                    {/* Dynamic Card-Free Timeline list */}
                    {loading ? (
                        <div className="timeline-container">
                            {Array.from({ length: 3 }).map((_, i) => <CandidateRowSkeleton key={i} />)}
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="jops-empty-state">
                            <span className="material-symbols-outlined">event_busy</span>
                            <p>{t('noInterviewsToday') || 'لا توجد مقابلات مجدولة حالياً.'}</p>
                        </div>
                    ) : (
                        <div className="timeline-container">
                            {applications.map(app => {
                                const latestInterview = app.interviews && app.interviews.length > 0 ? app.interviews[0] : null;
                                const timeStr = latestInterview ? formatTime(latestInterview.scheduled_at) : '--:--';
                                const dateStr = latestInterview ? formatDate(latestInterview.scheduled_at) : 'N/A';

                                // Score classification
                                let scoreClass = 'score-badge-low';
                                if (app.match_score >= 80) scoreClass = 'score-badge-high';
                                else if (app.match_score >= 50) scoreClass = 'score-badge-med';

                                // Interview type visual classification
                                let typeClass = 'type-indicator';
                                let typeIcon = 'event';
                                let typeLabel = latestInterview?.interview_type || 'Interview';
                                if (latestInterview) {
                                    const type = latestInterview.interview_type?.toLowerCase();
                                    if (type === 'video') {
                                        typeClass = 'type-indicator type-video';
                                        typeIcon = 'videocam';
                                        typeLabel = t('interviewTypes.video') || 'مكالمة فيديو';
                                    } else if (type === 'phone') {
                                        typeClass = 'type-indicator type-phone';
                                        typeIcon = 'phone';
                                        typeLabel = t('interviewTypes.phone') || 'مكالمة هاتفية';
                                    } else if (type === 'in-person') {
                                        typeClass = 'type-indicator type-in-person';
                                        typeIcon = 'person_pin';
                                        typeLabel = t('interviewTypes.inPerson') || 'مقابلة شخصية';
                                    } else if (type === 'technical') {
                                        typeClass = 'type-indicator type-technical';
                                        typeIcon = 'code';
                                        typeLabel = t('interviewTypes.technical') || 'مقابلة تقنية';
                                    } else if (type === 'hr') {
                                        typeClass = 'type-indicator type-hr';
                                        typeIcon = 'diversity_3';
                                        typeLabel = t('interviewTypes.hr') || 'مقابلة HR';
                                    }
                                }

                                const isFeedbackOpen = activeFeedbackId === app.id;
                                const isRejectionOpen = activeRejectionId === app.id;

                                return (
                                    <div key={app.id} className="timeline-item-wrapper">
                                        <div className="timeline-row">
                                            {/* Time Column */}
                                            <div className="time-column">
                                                <span className="time-val">{timeStr}</span>
                                                <span className="date-val">{dateStr}</span>
                                            </div>

                                            {/* Candidate Column */}
                                            <div className="candidate-column">
                                                <div className="candidate-row-top">
                                                    <span className="candidate-name-link">{app.full_name}</span>
                                                    {app.job_posting && (
                                                        <span className="job-pill">{app.job_posting.title}</span>
                                                    )}
                                                    {app.is_evaluated && app.match_score !== null && (
                                                        <span className={`mini-score-badge ${scoreClass}`}>
                                                            {t('score') || 'المطابقة'}: {app.match_score}%
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="candidate-contact-info">
                                                    {app.email} {app.phone ? ` • ${app.phone}` : ''}
                                                </p>
                                            </div>

                                            {/* Interview Details Column */}
                                            <div className="details-column">
                                                <div className="badge-wrapper">
                                                    <span className="material-symbols-outlined icon">person</span>
                                                    <span className="name-val">
                                                        {latestInterview?.interviewer_name || t('noInterviewer') || 'غير محدد'}
                                                    </span>
                                                </div>
                                                <div className={typeClass}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{typeIcon}</span>
                                                    <span>{typeLabel}</span>
                                                </div>
                                                {latestInterview?.rating > 0 && (
                                                    <div className="rating-display" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                        <div style={{ display: 'flex', gap: '1px' }}>
                                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                                <span 
                                                                    key={idx} 
                                                                    className="material-symbols-outlined" 
                                                                    style={{ 
                                                                        fontSize: '15px', 
                                                                        color: idx < latestInterview.rating ? '#fbbf24' : '#d1d5db' 
                                                                    }}
                                                                >
                                                                    {idx < latestInterview.rating ? 'star' : 'star_border'}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {latestInterview.feedback && (
                                                            <span 
                                                                className="material-symbols-outlined" 
                                                                style={{ fontSize: '14px', color: 'var(--text-muted, #6b7280)', cursor: 'help', verticalAlign: 'middle' }}
                                                                title={latestInterview.feedback}
                                                            >
                                                                chat_bubble
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons Column */}
                                            <div className="actions-column">
                                                {/* Pass to Offers stage */}
                                                <button
                                                    className="timeline-btn btn-pass"
                                                    title={t('actions.pass') || 'قبول وتخطي'}
                                                    onClick={() => handlePass(app.id)}
                                                    disabled={submittingAction}
                                                >
                                                    <span className="material-symbols-outlined">check_circle</span>
                                                </button>

                                                {/* Reject Candidate */}
                                                <button
                                                    className={`timeline-btn btn-fail ${isRejectionOpen ? 'active' : ''}`}
                                                    title={t('actions.fail') || 'استبعاد'}
                                                    onClick={() => handleToggleRejection(app.id)}
                                                    disabled={submittingAction}
                                                >
                                                    <span className="material-symbols-outlined">cancel</span>
                                                </button>

                                                {/* Record Rating & Feedback */}
                                                {latestInterview && (
                                                    <button
                                                        className={`timeline-btn btn-note ${isFeedbackOpen ? 'active' : ''}`}
                                                        title={t('actions.feedback') || 'تقييم وملاحظات'}
                                                        onClick={() => handleToggleFeedback(app.id, latestInterview)}
                                                        disabled={submittingAction}
                                                    >
                                                        <span className="material-symbols-outlined">rate_review</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Drawer for rejection reason */}
                                        {isRejectionOpen && (
                                            <div className="rejection-drawer">
                                                <h4 className="feedback-form-title">{t('rejection.title') || 'تحديد سبب الاستبعاد (اختياري)'}</h4>
                                                <textarea
                                                    className="feedback-textarea"
                                                    placeholder={t('rejection.placeholder') || 'اكتب هنا سبب استبعاد المترشح...'}
                                                    value={inlineFeedback}
                                                    onChange={(e) => setInlineFeedback(e.target.value)}
                                                    disabled={submittingAction}
                                                />
                                                <div className="drawer-actions">
                                                    <button
                                                        className="drawer-btn btn-drawer-cancel"
                                                        onClick={handleCancelDrawer}
                                                        disabled={submittingAction}
                                                    >
                                                        {t('buttons.cancel') || 'إلغاء'}
                                                    </button>
                                                    <button
                                                        className="drawer-btn btn-drawer-save"
                                                        style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                                                        onClick={() => handleConfirmRejection(app.id)}
                                                        disabled={submittingAction}
                                                    >
                                                        {submittingAction ? t('buttons.saving') || 'جاري الحفظ...' : t('buttons.reject') || 'تأكيد الاستبعاد'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Drawer for recording feedback / rating */}
                                        {isFeedbackOpen && (
                                            <div className="feedback-drawer">
                                                <h4 className="feedback-form-title">{t('feedback.title') || 'تسجيل تقييم وملاحظات المقابلة'}</h4>
                                                
                                                <div className="star-rating-wrap">
                                                    {Array.from({ length: 5 }).map((_, idx) => {
                                                        const starValue = idx + 1;
                                                        const isFilled = inlineRating >= starValue;
                                                        return (
                                                            <button
                                                                key={starValue}
                                                                type="button"
                                                                className={`star-btn ${isFilled ? 'filled' : ''}`}
                                                                onClick={() => setInlineRating(starValue)}
                                                                disabled={submittingAction}
                                                            >
                                                                <span className="material-symbols-outlined">
                                                                    {isFilled ? 'star' : 'star_border'}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                    <span className="star-label">
                                                        {inlineRating > 0 ? `${inlineRating} / 5` : t('feedback.ratePrompt') || 'انقر للتقييم'}
                                                    </span>
                                                </div>

                                                <textarea
                                                    className="feedback-textarea"
                                                    placeholder={t('feedback.placeholder') || 'اكتب انطباعك وملاحظاتك حول المقابلة هنا...'}
                                                    value={inlineFeedback}
                                                    onChange={(e) => setInlineFeedback(e.target.value)}
                                                    disabled={submittingAction}
                                                />
                                                
                                                <div className="drawer-actions">
                                                    <button
                                                        className="drawer-btn btn-drawer-cancel"
                                                        onClick={handleCancelDrawer}
                                                        disabled={submittingAction}
                                                    >
                                                        {t('buttons.cancel') || 'إلغاء'}
                                                    </button>
                                                    <button
                                                        className="drawer-btn btn-drawer-save"
                                                        onClick={() => handleSaveFeedback(latestInterview.id, app)}
                                                        disabled={submittingAction}
                                                    >
                                                        {submittingAction ? t('buttons.saving') || 'جاري الحفظ...' : t('buttons.save') || 'حفظ التقييم'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <CreateJobModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingJob(null); }}
                    onSave={() => setIsModalOpen(false)}
                    editingJob={editingJob}
                    departmentOptions={[]}
                />
            )}
        </>
    );
}
