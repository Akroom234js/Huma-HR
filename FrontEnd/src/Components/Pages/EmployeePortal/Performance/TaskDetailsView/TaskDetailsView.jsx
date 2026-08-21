import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskDetailsView.css';

import DeadlineAlert from '../../../../Shared/Performance/DeadlineAlert/DeadlineAlert';
import ManagerNoteBox from '../../../../Shared/Performance/ManagerNoteBox/ManagerNoteBox';
import TaskScoreBreakdown from '../../../../Shared/Performance/TaskScoreBreakdown/TaskScoreBreakdown';
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { getTaskDetails, completeTask, startTask } from '../../../../../services/performanceService';

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
            await completeTask(task.id, {
                submission_notes: submissionText,
            });
            alert(t('successSubmit'));
            navigate('/portal/performance');
        } catch (error) {
            console.error("Error submitting task deliverable:", error);
            alert(t('failedSubmit'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="task-details-container" style={{ textAlign: 'center', padding: '60px' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#6366f1' }}></i>
                <p style={{ marginTop: '16px', color: '#64748b' }}>{t('loading')}</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="task-details-container" style={{ textAlign: 'center', padding: '60px' }}>
                <h2>{t('taskNotFound')}</h2>
                <button className="btn-back" onClick={() => navigate('/portal/performance')} style={{ marginTop: '16px' }}>
                    {t('backBtn')}
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
        daysLate: task.days_late ?? 0,
        penaltyPoints: task.penalty_points ?? 0,
        finalScore: task.final_score
    } : null;

    return (
        <div className={`task-details-container ${isAr ? 'rtl' : 'ltr'}`}>
            <div className="details-header-section">
                <div className="title-block">
                    <h1>{t('title')}</h1>
                    <p className="subtitle">{t('subtitle')}</p>
                </div>

                <div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>

                <button className="btn-back" onClick={() => navigate('/portal/performance')}>
                    <i className="fa-solid fa-arrow-left"></i>
                    {t('backBtn')}
                </button>
            </div>

            {task.due_date && <DeadlineAlert dueDate={task.due_date} lang={i18n.language} />}

            <div className="details-main-card">
                <div className="card-header-flex">
                    <h2 className="main-task-title">{task.title}</h2>
                    <span className={`status-revision-badge ${task.status}`}>
                        STATUS: {task.status?.toUpperCase().replace('_', ' ')}
                    </span>
                </div>

                <div className="task-specifications-block">
                    <h3>{t('specifications')}</h3>
                    <p>{task.description || (isAr ? 'لا يوجد وصف مفصل لهذه المهمة.' : 'No detailed description provided.')}</p>
                    
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.875rem', color: '#64748b' }}>
                        {task.difficulty && <span><strong>{t('difficulty')}</strong> {task.difficulty}</span>}
                        {task.priority && <span><strong>{t('priority')}</strong> {task.priority}</span>}
                        {task.due_date && <span><strong>{t('dueDate')}</strong> {task.due_date}</span>}
                    </div>
                </div>

                {task.manager_note && (
                    <ManagerNoteBox
                        notes={task.manager_note}
                        isRevision={isRevision}
                        lang={i18n.language}
                    />
                )}

                {/* Show submission form only if active/progress or revision */}
                {!isCompleted && !isPendingReview && (
                    <form onSubmit={handleSubmit} className="submission-form">
                        <div className="form-group">
                            <label className="required-label">
                                {t('submissionLabel')}
                            </label>
                            <textarea
                                className="form-textarea"
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                placeholder={t('submissionPlaceholder')}
                                rows={5}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('attachFiles')}</label>
                            <div className="file-upload-wrapper">
                                <label className="file-upload-btn">
                                    {t('chooseFile')}
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <span className="file-name-text">
                                    {selectedFile ? selectedFile.name : t('noFile')}
                                </span>
                            </div>
                        </div>

                        <div className="form-actions-buttons">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={() => navigate('/portal/performance')}
                            >
                                {t('cancel')}
                            </button>
                            <button 
                                type="submit" 
                                className="btn-submit-deliverable"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-paper-plane"></i>
                                        {isRevision ? t('resubmit') : t('submit')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {isPendingReview && (
                    <div style={{ padding: '20px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', marginTop: '20px', textAlign: 'center', color: '#2563eb' }}>
                        <i className="fa-solid fa-clock" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }}></i>
                        <strong>{isAr ? 'تم تسليم المخرجات بنجاح، وهي الآن بانتظار اعتماد وتقييم المشرف.' : 'Deliverable submitted! Currently awaiting supervisor score & evaluation.'}</strong>
                    </div>
                )}
            </div>

            {breakdownData && (
                <div className="grades-breakdown-section">
                    <h3 className="section-title-secondary">
                        {t('breakdownTitle')}
                    </h3>
                    <TaskScoreBreakdown 
                        completionScore={breakdownData.completionScore}
                        qualityScore={breakdownData.qualityScore}
                        daysLate={breakdownData.daysLate}
                        totalPenalty={breakdownData.penaltyPoints}
                        finalScore={breakdownData.finalScore}
                        lang={i18n.language}
                    />
                </div>
            )}
        </div>
    );
};

export default TaskDetailsView;