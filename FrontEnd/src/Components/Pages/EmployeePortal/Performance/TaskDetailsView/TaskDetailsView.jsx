import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskDetailsView.css';

import DeadlineAlert from '../../../../Shared/Performance/DeadlineAlert/DeadlineAlert';
import ManagerNoteBox from '../../../../Shared/Performance/ManagerNoteBox/ManagerNoteBox';
import TaskScoreBreakdown from '../../../../Shared/Performance/TaskScoreBreakdown/TaskScoreBreakdown';
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { getTaskDetails, completeTask } from '../../../../../services/performanceService';
import { STORAGE_BASE_URL } from '../../../../../apiConfig';

const TaskDetailsView = () => {
    const navigate = useNavigate();
    const { id, taskId } = useParams();
    const activeTaskId = id || taskId;
    const { t, i18n } = useTranslation('EmployeePortal/TaskDetailsView');
    const isAr = i18n ? i18n.language === 'ar' : false;

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submissionText, setSubmissionText] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchTask = async () => {
        if (!activeTaskId) return;
        try {
            setLoading(true);
            const response = await getTaskDetails(activeTaskId);
            const data = response?.data?.data || response?.data;
            setTask(data);
            if (data?.submission_notes) {
                setSubmissionText(data.submission_notes);
            }
        } catch (error) {
            console.error("Error loading task details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTask();
    }, [activeTaskId, i18n.language]);

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!task) return;

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('submission_notes', submissionText);
            if (selectedFile) {
                formData.append('attachment', selectedFile);
            }
            await completeTask(task.id, formData);
            alert(t('successSubmit') || (isAr ? 'تم تسليم المهمة بنجاح!' : 'Task submitted successfully!'));
            navigate('/portal/performance');
        } catch (error) {
            console.error("Error submitting task deliverable:", error);
            alert(t('failedSubmit') || (isAr ? 'فشل تسليم المهمة.' : 'Failed to submit task.'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="task-details-container" style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                <p style={{ marginTop: '16px', color: 'var(--text-muted, #64748b)' }}>{t('loading')}</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="task-details-container" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>{t('taskNotFound')}</h2>
                <button className="btn-back" onClick={() => navigate('/portal/performance')} style={{ marginTop: '16px' }}>
                    <i className="bi bi-arrow-left me-1"></i> {t('backBtn')}
                </button>
            </div>
        );
    }

    const isRevision = task.status === 'needs_revision';
    const isCompleted = task.status === 'completed' || task.status === 'scored';
    const isPendingReview = task.status === 'pending_review';

    const breakdownData = task.final_score !== null && task.final_score !== undefined ? {
        completionScore: task.completion_score ?? 100,
        qualityScore: task.quality_score ?? 100,
        penaltyDeduction: task.penalty_points ?? 0,
        finalGrade: task.final_score,
        managerFeedback: task.manager_note,
        reviewedAt: task.reviewed_at
    } : null;

    return (
        <div className={`task-details-container ${isAr ? 'rtl' : 'ltr'}`}>
            <div className="details-header-section">
                <div>
                    <h1>{t('title')}</h1>
                    <p className="subtitle">{t('subtitle')}</p>
                </div>
                <button className="btn-back" onClick={() => navigate('/portal/performance')}>
                    <i className="bi bi-arrow-left me-1"></i> {t('backBtn')}
                </button>
            </div>

            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <div className="details-main-card">
                <div className="card-header-flex">
                    <h2 className="main-task-title">{task.title}</h2>
                    {isRevision && (
                        <span className="status-revision-badge">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i> {t('revisionRequested')}
                        </span>
                    )}
                </div>

                <DeadlineAlert 
                    dueDate={task.due_date} 
                    isCompleted={isCompleted}
                    penaltyPerDay={task.late_penalty_per_day}
                    lang={i18n.language}
                />

                <div className="task-specifications-block">
                    <h3>{t('taskSpecs')}</h3>
                    <p>{task.description || t('noDescription')}</p>
                </div>

                {task.manager_note && (
                    <ManagerNoteBox
                        notes={task.manager_note}
                        isRevision={isRevision}
                        lang={i18n.language}
                    />
                )}

                {/* Submissions Section */}
                <div className="submission-form">
                    <h3>{t('deliverableSection')}</h3>

                    {isCompleted ? (
                        <div className="submission-read-only">
                            <div className="form-group">
                                <label>{t('notesLabel')}</label>
                                <div className="form-textarea" style={{ background: 'var(--bg-page, #f5f7f8)', minHeight: '80px' }}>
                                    {task.submission_notes || t('noNotesSubmitted')}
                                </div>
                            </div>

                            {task.attachment_path && (
                                <div className="form-group">
                                    <label>{t('attachmentLabel')}</label>
                                    <div className="file-upload-wrapper">
                                        <i className="bi bi-paperclip"></i>
                                        <a 
                                            href={`${STORAGE_BASE_URL}/${task.attachment_path}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="file-name-text"
                                            style={{ color: 'var(--primary-color, #359EFF)', textDecoration: 'underline' }}
                                        >
                                            {t('downloadDeliverable')}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="required-label">{t('submissionNotes')}</label>
                                <textarea
                                    className="form-textarea"
                                    rows="4"
                                    placeholder={t('notesPlaceholder')}
                                    value={submissionText}
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    required
                                    disabled={submitting || isPendingReview}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>{t('attachment')}</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        type="file"
                                        id="task-file-upload"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                        disabled={submitting || isPendingReview}
                                    />
                                    <label htmlFor="task-file-upload" className="file-upload-btn">
                                        <i className="bi bi-cloud-upload me-1"></i> {t('chooseFile')}
                                    </label>
                                    <span className="file-name-text">
                                        {selectedFile ? selectedFile.name : (task.attachment_path ? t('existingFile') : t('noFileChosen'))}
                                    </span>
                                </div>
                            </div>

                            {!isPendingReview && (
                                <div className="form-actions-buttons">
                                    <button 
                                        type="button" 
                                        className="btn-cancel"
                                        onClick={() => navigate('/portal/performance')}
                                        disabled={submitting}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-submit-deliverable"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                {t('submitting')}
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-send-fill me-1"></i>
                                                {isRevision ? t('resubmitBtn') : t('submitBtn')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Score Breakdown when graded */}
                {breakdownData && (
                    <div className="grades-breakdown-section">
                        <h3 className="section-title-secondary">{t('gradeBreakdown')}</h3>
                        <TaskScoreBreakdown 
                            data={breakdownData} 
                            lang={i18n.language}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetailsView;