import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyTasksPortal.css';
import StatusBadge from "../../../../Shared/Performance/StatusBadge/StatusBadge";
import ManagerNoteBox from "../../../../Shared/Performance/ManagerNoteBox/ManagerNoteBox";
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';
import { getMyTasks, startTask } from '../../../../../services/performanceService';

const MyTasksPortal = () => {
    const navigate = useNavigate();

    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';
    const t = {
        title: isAr ? 'مهام الأداء الخاصة بي' : 'My Performance Tasks',
        subtitle: isAr ? 'تتبع التكليفات المسندة إليك، ابدأ العمل، سلم المخرجات، وتابع رصد الدرجات' : 'Track your assignments, start actions, submit deliverables, and monitor score responses',
        assignedTasks: isAr ? 'المهام المسندة' : 'Assigned Tasks',
        unstarted: isAr ? 'لم تبدأ (معلقة)' : 'Unstarted (Pending)',
        activeProgress: isAr ? 'نشطة / جارية' : 'Active / Progress',
        submittedReview: isAr ? 'تم التسليم (للمراجعة)' : 'Submitted (Review)',
        requiresRevision: isAr ? 'تتطلب إعادة صياغة' : 'Requires Revision',
        avgScore: isAr ? 'متوسط درجاتي' : 'My Avg Task Score',
        currentDeliverables: isAr ? 'مخرجات المهام الحالية' : 'My Current Task Deliverables',
        cycleText: isAr ? 'دورة الأداء الحالية' : 'Current Performance Cycle',
        searchPlaceholder: isAr ? 'ابحث عن طريق عنوان المهمة...' : 'Search by task title...',
        supervisorRemark: isAr ? 'ملاحظة المشرف:' : 'Supervisor Remark:',
        due: isAr ? 'تاريخ الاستحقاق:' : 'Due:',
        completedDate: isAr ? 'تم الإنجاز في:' : 'Completed:',
        penaltyActive: isAr ? 'الجزاء نشط (تأخير)' : 'Penalty Active',
        awaitingSupervisor: isAr ? 'بانتظار مراجعة المشرف...' : 'Awaiting supervisor review...',
        btnResubmit: isAr ? 'إعادة تسليم' : 'Re-Submit',
        btnDetails: isAr ? 'التفاصيل' : 'Details',
        btnStart: isAr ? 'ابدأ العمل' : 'Start Task',
        btnViewGrade: isAr ? 'عرض الدرجة' : 'View Grade',
        statusScored: isAr ? 'تم رصد الدرجة' : 'Scored',
        excellentWork: isAr ? 'عمل ممتاز' : 'Excellent Work',
        noTasks: isAr ? 'لا توجد مهام مسندة إليك حالياً.' : 'No tasks currently assigned to you.',
        loading: isAr ? 'جاري تحميل المهام...' : 'Loading tasks...',
        startSuccess: isAr ? 'تم بدء المهمة بنجاح!' : 'Task started successfully!'
    };

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
    }, []);

    const handleStart = async (taskId) => {
        try {
            setActionLoadingId(taskId);
            await startTask(taskId);
            await fetchTasks();
        } catch (error) {
            console.error("Failed to start task:", error);
            alert(isAr ? 'تعذر بدء المهمة، يرجى المحاولة لاحقاً.' : 'Failed to start task, please try again.');
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
        tasks.filter(t => normalizeStatus(t.status) === status).length;

    // Calculate Average Score
    const scoredTasks = tasks.filter(t => t.final_score !== null && t.final_score !== undefined);
    const avgScore = scoredTasks.length > 0
        ? (scoredTasks.reduce((acc, t) => acc + Number(t.final_score), 0) / scoredTasks.length).toFixed(1)
        : '0.0';

    return (
        <div className={`my-tasks-portal-container ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <section className="top-header">
                <div className="page-title">
                    <h1>{t.title}</h1>
                    <p>{t.subtitle}</p>
                </div>
            </section>
            
            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <div className="stats-grid">
                <div className="stat-card total">
                    <i className="fa-solid fa-briefcase stat-icon"></i>
                    <div className="stat-label">{t.assignedTasks}</div>
                    <div className="stat-value">{tasks.length}</div>
                </div>
                <div className="stat-card pending">
                    <i className="fa-solid fa-circle-pause stat-icon"></i>
                    <div className="stat-label">{t.unstarted}</div>
                    <div className="stat-value">{countByNormStatus('pending')}</div>
                </div>
                <div className="stat-card progress">
                    <i className="fa-solid fa-spinner stat-icon"></i>
                    <div className="stat-label">{t.activeProgress}</div>
                    <div className="stat-value">{countByNormStatus('in_progress')}</div>
                </div>
                <div className="stat-card review">
                    <i className="fa-solid fa-paper-plane stat-icon"></i>
                    <div className="stat-label">{t.submittedReview}</div>
                    <div className="stat-value">{countByNormStatus('pending_review')}</div>
                </div>
                <div className="stat-card revision">
                    <i className="fa-solid fa-circle-exclamation stat-icon"></i>
                    <div className="stat-label" style={{ color: '#f87171' }}>{t.requiresRevision}</div>
                    <div className="stat-value" style={{ color: 'var(--color-revision)' }}>{countByNormStatus('needs_revision')}</div>
                </div>
                <div className="stat-card average">
                    <i className="fa-solid fa-trophy stat-icon"></i>
                    <div className="stat-label">{t.avgScore}</div>
                    <div className="stat-value">{avgScore}</div>
                </div>
            </div>

            <div className="main-card">
                <div className="card-header-title">
                    <span>{t.currentDeliverables}</span>
                    <span className="cycle-badge">{t.cycleText}</span>
                </div>

                <div className="filter-bar">
                    <div className="search-wrapper">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder={t.searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}></i>
                        {t.loading}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        <i className="fa-solid fa-clipboard-check" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', color: '#cbd5e1' }}></i>
                        {t.noTasks}
                    </div>
                ) : (
                    <div className="task-card-grid">
                        {filteredTasks.map(task => {
                            const normStatus = normalizeStatus(task.status);
                            const isLate = task.is_late || (task.penalty_points > 0);

                            return (
                                <div 
                                    key={task.id} 
                                    className={`task-item-card ${normStatus === 'needs_revision' ? 'highlight-revision' : ''} ${normStatus === 'scored' ? 'highlight-scored' : ''}`}
                                >
                                    <div>
                                        <div className="task-card-header">
                                            <h3 className="task-card-title">{task.title}</h3>
                                            <div className="task-status-wrapper">
                                                <StatusBadge status={normStatus} />
                                                {normStatus === 'scored' && task.final_score !== null && (
                                                    <span className="score-text">
                                                        {task.final_score}/100
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="task-card-desc">{task.description}</p>
                                        
                                        {task.manager_note && (
                                            <ManagerNoteBox
                                                notes={task.manager_note}
                                                isRevision={normStatus === 'needs_revision'}
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <div className="task-meta-list">
                                            <span>
                                                <i className="fa-solid fa-calendar"></i>
                                                {normStatus === 'scored' && task.completed_at
                                                    ? ` ${t.completedDate} ${task.completed_at.substring(0, 10)}`
                                                    : ` ${t.due} ${task.due_date || '-'}`}
                                            </span>
                                            {task.difficulty && (
                                                <span style={{ marginInlineStart: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                                                    <i className="fa-solid fa-layer-group"></i> {task.difficulty}
                                                </span>
                                            )}
                                        </div>

                                        <div className="task-card-actions">
                                            {isLate ? (
                                                <span className="penalty-text">
                                                    <i className="fa-solid fa-triangle-exclamation"></i> {t.penaltyActive} (-{task.penalty_points || 0})
                                                </span>
                                            ) : (
                                                <span className="placeholder-text">
                                                    {normStatus === 'pending_review' && t.awaitingSupervisor}
                                                    {normStatus === 'scored' && Number(task.final_score) >= 85 && (
                                                        <span className="excellent-badge"><i className="fa-solid fa-star"></i> {t.excellentWork}</span>
                                                    )}
                                                </span>
                                            )}

                                            {normStatus === 'needs_revision' && (
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={() => navigate(`/portal/performance/tasks/${task.id}`)}
                                                >
                                                    {t.btnResubmit}
                                                </button>
                                            )}
                                            {(normStatus === 'pending_review' || normStatus === 'in_progress') && (
                                                <button 
                                                    className="btn btn-secondary" 
                                                    onClick={() => navigate(`/portal/performance/tasks/${task.id}`)}
                                                >
                                                    {t.btnDetails}
                                                </button>
                                            )}
                                            {normStatus === 'pending' && (
                                                <button 
                                                    className="btn btn-primary" 
                                                    disabled={actionLoadingId === task.id}
                                                    onClick={() => handleStart(task.id)}
                                                >
                                                    {actionLoadingId === task.id ? <i className="fa-solid fa-spinner fa-spin"></i> : t.btnStart}
                                                </button>
                                            )}
                                            {normStatus === 'scored' && (
                                                <button 
                                                    className="btn btn-secondary"
                                                    onClick={() => navigate(`/portal/performance/tasks/${task.id}`)}
                                                >
                                                    {t.btnViewGrade}
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
