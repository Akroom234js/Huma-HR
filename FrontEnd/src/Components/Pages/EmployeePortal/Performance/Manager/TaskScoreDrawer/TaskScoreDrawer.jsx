import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskScoreDrawer.css';
import StatusBadge from '../../../../../Shared/Performance/StatusBadge/StatusBadge';
import ScoreFormPanel from '../../../../../Shared/Performance/ScoreFormPanel/ScoreFormPanel';
import { useTranslation } from 'react-i18next';
import { 
    getTaskDetails, 
    getDepartmentTasks, 
    scoreTask, 
    requestRevision 
} from '../../../../../../services/performanceService';

const TaskScoreDrawer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { t, i18n } = useTranslation('EmployeePortal/TaskScoreDrawer');
    const isAr = i18n ? i18n.language === 'ar' : false;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [task, setTask] = useState(null);
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const buildTimeline = (itemData) => {
        const timeline = [];
        
        timeline.push({
            time: itemData.created_at ? new Date(itemData.created_at).toLocaleDateString() : '',
            title: t('timeline.taskCreated'),
            desc: t('timeline.assignedBy', { name: itemData.assigned_by?.name || (isAr ? 'المدير' : 'Supervisor') }),
            completed: true
        });
        
        if (itemData.status !== 'pending') {
            timeline.push({
                time: '',
                title: t('timeline.statusInProgress'),
                desc: t('timeline.employeeStarted'),
                completed: true
            });
        }
        
        if (itemData.completed_at || itemData.status === 'pending_review' || itemData.status === 'scored') {
            timeline.push({
                time: itemData.completed_at ? new Date(itemData.completed_at).toLocaleString() : '',
                title: t('timeline.submittedForReview'),
                desc: t('timeline.pendingManagerAction'),
                completed: itemData.status === 'scored',
                active: itemData.status === 'pending_review'
            });
        }
        
        if (itemData.scored_at || itemData.status === 'scored') {
            timeline.push({
                time: itemData.scored_at ? new Date(itemData.scored_at).toLocaleString() : '',
                title: t('timeline.finalGradeApproved'),
                desc: t('timeline.gradeApprovedDesc', { score: itemData.task_score ?? 0 }),
                active: true
            });
        }
        
        return timeline;
    };

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                // 1. Fetch all tasks for the department
                const resTasks = await getDepartmentTasks();
                const rawTasks = resTasks.data?.data || [];
                
                // Format all tasks for the slider
                const formattedTasks = rawTasks.map(tItem => {
                    const empName = tItem.employee?.name || tItem.employee?.full_name || t('alerts.unknownEmployee');
                    const avatar = empName
                        ? empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                        : '??';
                    return {
                        id: tItem.id,
                        title: tItem.title,
                        employee_name: empName,
                        employee_avatar: avatar,
                        status: tItem.status
                    };
                });
                setAllTasks(formattedTasks);

                // 2. Determine target task
                let targetTaskId = null;
                if (id) {
                    targetTaskId = parseInt(id);
                } else if (rawTasks.length > 0) {
                    targetTaskId = rawTasks[0].id;
                }

                if (targetTaskId) {
                    // Fetch details of target task
                    const resDetails = await getTaskDetails(targetTaskId);
                    if (resDetails.data?.data) {
                        const fetchedTask = resDetails.data.data;
                        const empName = fetchedTask.employee?.name || fetchedTask.employee?.full_name || t('alerts.unknownEmployee');
                        const avatar = empName
                            ? empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                            : '??';

                        const formatted = {
                            id: fetchedTask.id,
                            title: fetchedTask.title,
                            employee_name: empName,
                            employee_avatar: avatar,
                            due_date: fetchedTask.due_date,
                            submission_date: fetchedTask.completed_at ? fetchedTask.completed_at.split(' ')[0] : t('notSubmittedYet'),
                            status: fetchedTask.status,
                            days_late: fetchedTask.days_late || 0,
                            late_penalty_per_day: fetchedTask.late_penalty_per_day || 0,
                            scope: fetchedTask.description || t('noScope'),
                            submission_notes: fetchedTask.manager_note || t('noNotes'),
                            task_score: fetchedTask.task_score || 0,
                            timeline: buildTimeline(fetchedTask)
                        };
                        setTask(formatted);
                    }
                } else {
                    setTask(null);
                }
            } catch (error) {
                console.error("Error initializing task evaluation screen:", error);
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [id, i18n.language]);

    // Handle selecting task from horizontal slider
    const handleSelectTask = (selectedTask) => {
        navigate(`/portal/manager/tasks/score/${selectedTask.id}`);
    };

    // Handle submissions
    const handleScoreSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await scoreTask(task.id, {
                completion_score: data.completion_score,
                quality_score: data.quality_score,
                manager_note: data.notes
            });
            alert(t('alerts.scoreSuccess'));
            navigate('/portal/manager/tasks');
        } catch (error) {
            console.error("Failed to score task:", error);
            alert(t('alerts.scoreError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevisionRequest = async (data) => {
        setIsSubmitting(true);
        try {
            await requestRevision(task.id, {
                manager_note: data.notes
            });
            alert(t('alerts.revisionSuccess'));
            navigate('/portal/manager/tasks');
        } catch (error) {
            console.error("Failed to request revision:", error);
            alert(t('alerts.revisionError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-color)' }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--color-primary)' }}></i>
                <div>{isAr ? 'جاري تحميل تفاصيل المهمة...' : 'Loading task details...'}</div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className={`performance-task-score-drawer ${isAr ? 'rtl' : 'ltr'}`} style={{ padding: '40px 35px' }}>
                <div className="top-header">
                    <div className="page-title">
                        <h1>{t('title')}</h1>
                        <p>{t('noTasksFound')}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>{t('backToDashboard')}</span>
                    </button>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', marginTop: '20px' }}>
                    <i className="fa-solid fa-list-check" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
                    <h3>{isAr ? 'قائمة المهام فارغة' : 'Tasks List is Empty'}</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {isAr ? 'لم تقم بإسناد أي مهمة لموظفي قسمك بعد.' : 'You have not assigned any tasks to your department employees yet.'}
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/portal/manager/tasks')}>
                        <i className="fa-solid fa-plus"></i>
                        <span>{isAr ? 'إسناد تكليف جديد' : 'Assign New Task'}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`performance-task-score-drawer ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <div className="top-header">
                <div className="page-title">
                    <h1>{t('title')}</h1>
                    <p>{t('subtitle')}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>{t('backToDashboard')}</span>
                </button>
            </div>

            {/* Employee Slider/Selection Row */}
            <div className="employee-slider-container">
                <h3 className="slider-section-title">{t('selectTaskTitle')}</h3>
                <div className="employee-slider">
                    {allTasks.map((tItem) => {
                        const isSelected = task.id === tItem.id;
                        return (
                            <div 
                                key={tItem.id} 
                                className={`employee-slide-card ${isSelected ? 'active' : ''}`}
                                onClick={() => handleSelectTask(tItem)}
                            >
                                <div className="employee-slide-avatar">
                                    {tItem.employee_avatar}
                                </div>
                                <div className="employee-slide-info">
                                    <h4 className="employee-slide-name">{tItem.employee_name}</h4>
                                    <p className="employee-slide-task-title">{tItem.title}</p>
                                    <div className="employee-slide-badge-wrapper">
                                        <StatusBadge status={tItem.status} lang={i18n.language} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="split-layout">
                {/* Left Column: Review and Scoring */}
                <div className="left-column">
                    {/* Deliverable Review */}
                    <div className="card deliverable-card">
                        <div className="card-title">
                            <span>{t('taskDetails')}</span>
                            <StatusBadge status={task.status} lang={i18n.language} />
                        </div>
                        
                        <div className="task-specs-section">
                            <h3 className="task-title-bold">{task.title}</h3>
                            <div className="task-specs-meta">
                                <div><strong>{t('assignedTo')}</strong> {task.employee_name}</div>
                                <div>
                                    <strong>{t('dueDate')}</strong> {task.due_date} ({t('submissionDate')} {task.submission_date})
                                </div>
                                <div className="specs-description">
                                    <strong>{t('taskScope')}:</strong> {task.scope}
                                </div>
                            </div>
                        </div>

                        <div className="employee-notes-box">
                            <h4 className="notes-header-title">{t('submissionNotes')}:</h4>
                            <p className="notes-content">"{task.submission_notes}"</p>
                        </div>
                    </div>

                    {/* Score Form Panel */}
                    <ScoreFormPanel 
                        task={task} 
                        onSubmitScore={handleScoreSubmit} 
                        onSubmitRevision={handleRevisionRequest} 
                        calculatedTaskScore={task.task_score || 0}
                        isSubmitting={isSubmitting}
                        lang={i18n.language}
                    />
                </div>

                {/* Right Column: Timeline & Revision Actions */}
                <div className="right-column">
                    {/* Timeline */}
                    <div className="card timeline-card">
                        <div className="card-title">{t('activityTimeline')}</div>
                        <div className="timeline">
                            {task.timeline && task.timeline.map((item, idx) => (
                                <div key={idx} className={`timeline-item ${item.completed ? 'completed' : item.active ? 'active' : ''}`}>
                                    <div className="timeline-icon"></div>
                                    <div className="timeline-content">
                                        <div className="timeline-time">{item.time}</div>
                                        <div className="timeline-title">{item.title}</div>
                                        <div className="timeline-desc">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Info Box on Scoring Rules */}
                    <div className="card rules-info-card">
                        <div className="card-title">
                            <span>{isAr ? 'قواعد احتساب التقييم' : 'Evaluation Guidelines'}</span>
                        </div>
                        <ul className="rules-list">
                            <li>
                                <i className="fa-solid fa-circle-info"></i>
                                <span>{isAr ? 'وزن درجة الاكتمال يمثل 60% من التقييم الكلي.' : 'Completion metric represents 60% of total score.'}</span>
                            </li>
                            <li>
                                <i className="fa-solid fa-circle-info"></i>
                                <span>{isAr ? 'وزن درجة جودة المخرجات يمثل 40% من التقييم الكلي.' : 'Quality metric represents 40% of total score.'}</span>
                            </li>
                            <li>
                                <i className="fa-solid fa-circle-info"></i>
                                <span>{isAr ? 'أي يوم تأخير بعد الموعد يخصم نقاطاً تراكمية تلقائياً.' : 'Each overdue day accumulates penalties automatically.'}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskScoreDrawer;
