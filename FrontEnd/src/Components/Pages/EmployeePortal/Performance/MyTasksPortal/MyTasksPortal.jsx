import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyTasksPortal.css';
import StatusBadge from "../../../../Shared/Performance/StatusBadge/StatusBadge";
import ManagerNoteBox from "../../../../Shared/Performance/ManagerNoteBox/ManagerNoteBox";
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import { getMyTasks, startTask } from '../../../../../services/performanceService';

const MyTasksPortal = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('EmployeePortal/MyTasksPortal');
    const isAr = i18n ? i18n.language === 'ar' : false;

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await getMyTasks();
            const data = response?.data?.data || response?.data || [];
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching my tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [i18n.language]);

    const handleStart = async (taskId) => {
        try {
            setActionLoadingId(taskId);
            await startTask(taskId);
            await fetchTasks();
        } catch (error) {
            console.error("Failed to start task:", error);
            alert(t('startError'));
        } finally {
            setActionLoadingId(null);
        }
    };

    const normalizeStatus = (backendStatus) => {
        switch (backendStatus) {
            case 'pending': return 'pending';
            case 'in_progress': return 'in_progress';
            case 'pending_review': return 'pending_review';
            case 'needs_revision': return 'needs_revision';
            case 'completed':
            case 'scored': return 'scored';
            default: return backendStatus || 'pending';
        }
    };

    const filteredTasks = tasks.filter(task =>
        (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const countByNormStatus = (status) => 
        tasks.filter(tItem => normalizeStatus(tItem.status) === status).length;

    // Calculate Average Score
    const scoredTasks = tasks.filter(tItem => tItem.final_score !== null && tItem.final_score !== undefined);
    const avgScore = scoredTasks.length > 0
        ? (scoredTasks.reduce((acc, tItem) => acc + Number(tItem.final_score), 0) / scoredTasks.length).toFixed(1)
        : '0.0';

    return (
        <div className={`my-tasks-portal-container ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <section className="top-header">
                <div className="page-title">
                    <h1>{t('title')}</h1>
                    <p>{t('subtitle')}</p>
                </div>
            </section>
            
            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <div className="stats-grid">
                <div className="stat-card total">
                    <i className="fa-solid fa-briefcase stat-icon"></i>
                    <div className="stat-label">{t('stats.assignedTasks')}</div>
                    <div className="stat-value">{tasks.length}</div>
                </div>
                <div className="stat-card pending">
                    <i className="fa-solid fa-circle-pause stat-icon"></i>
                    <div className="stat-label">{t('stats.unstarted')}</div>
                    <div className="stat-value">{countByNormStatus('pending')}</div>
                </div>
                <div className="stat-card progress">
                    <i className="fa-solid fa-spinner stat-icon"></i>
                    <div className="stat-label">{t('stats.activeProgress')}</div>
                    <div className="stat-value">{countByNormStatus('in_progress')}</div>
                </div>
                <div className="stat-card review">
                    <i className="fa-solid fa-paper-plane stat-icon"></i>
                    <div className="stat-label">{t('stats.submittedReview')}</div>
                    <div className="stat-value">{countByNormStatus('pending_review')}</div>
                </div>
                <div className="stat-card revision">
                    <i className="fa-solid fa-circle-exclamation stat-icon"></i>
                    <div className="stat-label" style={{ color: '#f87171' }}>{t('stats.requiresRevision')}</div>
                    <div className="stat-value" style={{ color: 'var(--color-revision)' }}>{countByNormStatus('needs_revision')}</div>
                </div>
                <div className="stat-card average">
                    <i className="fa-solid fa-trophy stat-icon"></i>
                    <div className="stat-label">{t('stats.avgScore')}</div>
                    <div className="stat-value">{avgScore}</div>
                </div>
            </div>

            <div className="main-card">
                <div className="card-header-title">
                    <span>{t('currentDeliverables')}</span>
                    <span className="cycle-badge">{t('cycleText')}</span>
                </div>

                <div className="filter-bar">
                    <div className="search-wrapper">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder={t('searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}></i>
                        {t('loading')}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <i className="fa-solid fa-clipboard-check" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', color: '#cbd5e1' }}></i>
                        {t('noTasks')}
                    </div>
                ) : (
                    <div className="task-card-grid">
                        {filteredTasks.map(taskItem => {
                            const normStatus = normalizeStatus(taskItem.status);
                            const isLate = taskItem.is_late || (taskItem.penalty_points > 0);

                            return (
                                <div 
                                    key={taskItem.id} 
                                    className={`task-item-card ${normStatus === 'needs_revision' ? 'highlight-revision' : ''} ${normStatus === 'scored' ? 'highlight-scored' : ''}`}
                                >
                                    <div>
                                        <div className="task-card-header">
                                            <h3 className="task-card-title">{taskItem.title}</h3>
                                            <div className="task-status-wrapper">
                                                <StatusBadge status={normStatus} lang={i18n.language} />
                                                {normStatus === 'scored' && taskItem.final_score !== null && (
                                                    <span className="score-text">
                                                        {taskItem.final_score}/100
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="task-card-desc">{taskItem.description}</p>
                                        
                                        {taskItem.manager_note && (
                                            <ManagerNoteBox
                                                notes={taskItem.manager_note}
                                                isRevision={normStatus === 'needs_revision'}
                                                lang={i18n.language}
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <div className="task-meta-list">
                                            <span>
                                                <i className="fa-solid fa-calendar"></i>
                                                {normStatus === 'scored' && taskItem.completed_at
                                                    ? ` ${t('completedDate')} ${taskItem.completed_at.substring(0, 10)}`
                                                    : ` ${t('due')} ${taskItem.due_date || '-'}`}
                                            </span>
                                            {taskItem.difficulty && (
                                                <span style={{ marginInlineStart: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                                                    <i className="fa-solid fa-layer-group"></i> {taskItem.difficulty}
                                                </span>
                                            )}
                                        </div>

                                        <div className="task-card-actions">
                                            {isLate ? (
                                                <span className="penalty-text">
                                                    <i className="fa-solid fa-triangle-exclamation"></i> {t('penaltyActive')} (-{taskItem.penalty_points || 0})
                                                </span>
                                            ) : (
                                                <span className="placeholder-text">
                                                    {normStatus === 'pending_review' && t('awaitingSupervisor')}
                                                    {normStatus === 'scored' && Number(taskItem.final_score) >= 85 && (
                                                        <span className="excellent-badge"><i className="fa-solid fa-star"></i> {t('excellentWork')}</span>
                                                    )}
                                                </span>
                                            )}

                                            {normStatus === 'needs_revision' && (
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={() => navigate(`/portal/performance/tasks/${taskItem.id}`)}
                                                >
                                                    {t('buttons.resubmit')}
                                                </button>
                                            )}
                                            {(normStatus === 'pending_review' || normStatus === 'in_progress') && (
                                                <button 
                                                    className="btn btn-secondary" 
                                                    onClick={() => navigate(`/portal/performance/tasks/${taskItem.id}`)}
                                                >
                                                    {t('buttons.details')}
                                                </button>
                                            )}
                                            {normStatus === 'pending' && (
                                                <button 
                                                    className="btn btn-primary" 
                                                    disabled={actionLoadingId === taskItem.id}
                                                    onClick={() => handleStart(taskItem.id)}
                                                >
                                                    {actionLoadingId === taskItem.id ? <i className="fa-solid fa-spinner fa-spin"></i> : t('buttons.start')}
                                                </button>
                                            )}
                                            {normStatus === 'scored' && (
                                                <button 
                                                    className="btn btn-secondary"
                                                    onClick={() => navigate(`/portal/performance/tasks/${taskItem.id}`)}
                                                >
                                                    {t('buttons.viewGrade')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTasksPortal;
