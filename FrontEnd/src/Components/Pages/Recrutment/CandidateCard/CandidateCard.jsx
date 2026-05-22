import React, { useState } from 'react';
import './CandidateCard.css';
import { useTranslation } from 'react-i18next';
import { executeTransition, downloadResume } from '../../../../services/atsService';
import ScheduleInterview from '../ScheduleInterview/ScheduleInterview';
import Attachments from '../Attachments/Attachments';

/**
 * CandidateCard — Unified candidate card for all HR pipeline tabs
 *
 * Props:
 *  candidate         — application object from API
 *  onTransitionDone  — callback(updatedApp) after a pipeline action succeeds
 */
const CandidateCard = ({ candidate, onTransitionDone }) => {
    const {
        id,
        full_name,
        email,
        phone,
        status,
        current_stage,
        match_score,
        is_evaluated,
        allowed_transitions = [],
        job_posting,
        attachments = [],
    } = candidate;

    const { t } = useTranslation('Recrutment/ToMakeOffer');
    const [actionLoading, setActionLoading] = useState(null);
    const [feedbackFor, setFeedbackFor]   = useState(null); // transition name
    const [feedbackText, setFeedbackText] = useState('');
    const [error, setError]               = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showAttachments, setShowAttachments] = useState(false);

    // Determine score color
    const score = match_score ?? 0;
    const getScoreColor = (s) => {
        if (s >= 80) return 'emerald';
        if (s >= 60) return 'amber';
        return 'red';
    };
    const scoreColor = getScoreColor(score);

    // ── Transition labels / icons ───────────────────────────
    const TRANSITION_META = {
        reviewed:     { label: 'Mark Reviewed',  icon: 'visibility',        cls: 'btn-action--blue'   },
        shortlisted:  { label: 'Shortlist',       icon: 'checklist',         cls: 'btn-action--teal'   },
        interviewing: { label: 'To Interview',    icon: 'groups',            cls: 'btn-action--purple' },
        offered:      { label: 'Make Offer',      icon: 'handshake',         cls: 'btn-action--green'  },
        hired:        { label: 'Hire',            icon: 'person_check',      cls: 'btn-action--emerald'},
        rejected:     { label: 'Reject',          icon: 'person_remove',     cls: 'btn-action--red'    },
        withdrawn:    { label: 'Withdraw',        icon: 'exit_to_app',       cls: 'btn-action--gray'   },
        no_show:      { label: 'No Show',         icon: 'event_busy',        cls: 'btn-action--orange' },
    };

    // Transitions that require optional feedback
    const NEEDS_FEEDBACK = ['shortlisted', 'rejected'];

    // ── Execute a pipeline transition ───────────────────────
    const handleTransition = async (transition) => {
        if (NEEDS_FEEDBACK.includes(transition) && feedbackFor !== transition) {
            setFeedbackFor(transition);
            setFeedbackText('');
            return;
        }
        setActionLoading(transition);
        setError('');
        try {
            const res = await executeTransition(id, transition, feedbackText);
            const updated = res.data?.data ?? res.data;
            setFeedbackFor(null);
            setFeedbackText('');
            if (onTransitionDone) onTransitionDone(updated);
        } catch (err) {
            setError(err?.response?.data?.message || 'Action failed.');
        } finally {
            setActionLoading(null);
        }
    };

    // ── Download resume ─────────────────────────────────────
    const handleDownloadResume = async () => {
        try {
            const res = await downloadResume(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${full_name}_resume.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert('Could not download resume.');
        }
    };

    return (
        <div className="candidate-card">
            <div className="card-content">
                {/* ── Header ── */}
                <div className="candidate-header">
                    <div>
                        <h4 className="candidate-name">{full_name}</h4>
                        <p className="candidate-department">{email}</p>
                    </div>
                    <span className={`stage-badge stage-${status}`}>{current_stage || status}</span>
                </div>

                {/* Job title */}
                {job_posting?.title && (
                    <div className="position-info">
                        <p className="position-label">{t('CandidateCard.Applying')}</p>
                        <p className="position-title">{job_posting.title}</p>
                    </div>
                )}

                {/* ── AI Score ── */}
                <div className="score-container">
                    <div className="score-header">
                        <span className="score-label">
                            {is_evaluated ? 'AI Match Score' : t('CandidateCard.SCORE')}
                        </span>
                        {is_evaluated ? (
                            <span className={`score-value score-${scoreColor}`}>{score}/100</span>
                        ) : (
                            <span className="score-value score-pending">Evaluating…</span>
                        )}
                    </div>
                    <div className="score-bar">
                        <div
                            className={`score-fill score-fill-${scoreColor}`}
                            style={{ width: `${is_evaluated ? score : 30}%`, opacity: is_evaluated ? 1 : 0.4 }}
                        />
                    </div>

                    {/* Skills from AI analysis if available */}
                    {candidate.ai_analysis?.skills?.length > 0 && (
                        <div className="skills-container">
                            {candidate.ai_analysis.skills.slice(0, 4).map((skill, i) => (
                                <span key={i} className="skill-tag">{skill}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="candidate-error">
                        <span className="material-symbols-outlined">error</span>
                        {error}
                    </div>
                )}

                {/* Feedback input for shortlist/reject */}
                {feedbackFor && (
                    <div className="feedback-input-wrap">
                        <textarea
                            className="feedback-input"
                            placeholder={feedbackFor === 'rejected'
                                ? 'Optional: Rejection reason for candidate…'
                                : 'Optional: Note for shortlisting…'}
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                            rows={2}
                        />
                        <div className="feedback-actions">
                            <button className="feedback-cancel" onClick={() => setFeedbackFor(null)}>Cancel</button>
                            <button
                                className={`btn-action ${TRANSITION_META[feedbackFor]?.cls || ''}`}
                                onClick={() => handleTransition(feedbackFor)}
                                disabled={!!actionLoading}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Action Buttons ── */}
            <div className="card-actions-row">
                {/* Resume download */}
                <button className="btn-resume" onClick={handleDownloadResume} title="Download Resume">
                    <span className="material-symbols-outlined">download</span>
                    Resume
                </button>

                {/* View attachments separate interface */}
                <button className="btn-resume btn-view-attachments" onClick={() => setShowAttachments(true)} title="View Attachments" style={{ gap: '4px' }}>
                    <span className="material-symbols-outlined">visibility</span>
                    View Attachments
                </button>

                {/* Dynamic pipeline buttons from allowed_transitions */}
                {!feedbackFor && allowed_transitions.map(transition => {
                    const meta = TRANSITION_META[transition] || { label: transition, icon: 'arrow_forward', cls: '' };
                    return (
                        <button
                            key={transition}
                            className={`btn-action ${meta.cls}`}
                            onClick={() => {
                                if (transition === 'interviewing') {
                                    setShowScheduleModal(true);
                                } else {
                                    handleTransition(transition);
                                }
                            }}
                            disabled={actionLoading === transition}
                            title={meta.label}
                        >
                            {actionLoading === transition
                                ? <span className="action-spinner" />
                                : <span className="material-symbols-outlined">{meta.icon}</span>
                            }
                            <span className="btn-action-label">{meta.label}</span>
                        </button>
                    );
                })}
            </div>

            {showScheduleModal && (
                <ScheduleInterview
                    name={full_name}
                    department={job_posting?.title || 'Recruitment'}
                    applicationId={id}
                    onClose={() => setShowScheduleModal(false)}
                    onSuccess={(updated) => {
                        setShowScheduleModal(false);
                        if (onTransitionDone) onTransitionDone(updated);
                    }}
                />
            )}

            {showAttachments && (
                <div className="shinvisibility">
                    <Attachments
                        name={full_name}
                        att={attachments}
                        onClose={() => setShowAttachments(false)}
                        applicationId={id}
                    />
                </div>
            )}
        </div>
    );
};

export default CandidateCard;
