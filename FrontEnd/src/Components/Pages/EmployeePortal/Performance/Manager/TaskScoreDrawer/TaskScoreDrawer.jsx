import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskScoreDrawer.css';
import StatusBadge from '../../../../../Shared/Performance/StatusBadge/StatusBadge'
import ScoreFormPanel from '../../../../../Shared/Performance/ScoreFormPanel/ScoreFormPanel';
import { 
    getTaskDetails, 
    getDepartmentTasks, 
    scoreTask, 
    requestRevision 
} from '../../../../../../services/performanceService';

const TaskScoreDrawer = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Check language
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [task, setTask] = useState(null);
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const buildTimeline = (t, isAr) => {
        const timeline = [];
        
        timeline.push({
            time: t.created_at ? new Date(t.created_at).toLocaleDateString() : '',
            title: isAr ? 'تم إنشاء التكليف' : 'Task Assigned & Created',
            desc: isAr 
                ? `تم تكليف الموظف بواسطة ${t.assigned_by?.name || 'المدير'}` 
                : `Assigned by ${t.assigned_by?.name || 'Supervisor'}`,
            completed: true
        });
        
        if (t.status !== 'pending') {
            timeline.push({
                time: '',
                title: isAr ? 'الحالة: قيد العمل' : 'Status: In Progress',
                desc: isAr ? 'بدأ الموظف العمل على المهمة' : 'Employee started working on the task',
                completed: true
            });
        }
        
        if (t.completed_at || t.status === 'pending_review' || t.status === 'scored') {
            timeline.push({
                time: t.completed_at ? new Date(t.completed_at).toLocaleString() : '',
                title: isAr ? 'تم تسليم العمل للمراجعة' : 'Submitted for Review',
                desc: isAr ? 'بانتظار إجراء المدير وتقييم مخرجات العمل' : 'Pending review and grading action',
                completed: t.status === 'scored',
                active: t.status === 'pending_review'
            });
        }
        
        if (t.scored_at || t.status === 'scored') {
            timeline.push({
                time: t.scored_at ? new Date(t.scored_at).toLocaleString() : '',
                title: isAr ? 'تم رصد التقييم النهائي' : 'Final Grade Approved',
                desc: isAr 
                    ? `الدرجة المحسوبة والمعتمدة: ${t.task_score ?? 0}` 
                    : `Grade computed and approved: ${t.task_score ?? 0}`,
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
                const formattedTasks = rawTasks.map(t => {
                    const empName = t.employee?.name || t.employee?.full_name || (isAr ? 'موظف غير معروف' : 'Unknown Employee');
                    const avatar = empName
                        ? empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                        : '??';
                    return {
                        id: t.id,
                        title: t.title,
                        employee_name: empName,
                        employee_avatar: avatar,
                        status: t.status
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
                        const empName = fetchedTask.employee?.name || fetchedTask.employee?.full_name || (isAr ? 'موظف غير معروف' : 'Unknown Employee');
                        const avatar = empName
                            ? empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                            : '??';

                        const formatted = {
                            id: fetchedTask.id,
                            title: fetchedTask.title,
                            employee_name: empName,
                            employee_avatar: avatar,
                            due_date: fetchedTask.due_date,
                            submission_date: fetchedTask.completed_at ? fetchedTask.completed_at.split(' ')[0] : (isAr ? 'لم تسلم بعد' : 'Not submitted yet'),
                            status: fetchedTask.status,
                            days_late: fetchedTask.days_late || 0,
                            late_penalty_per_day: fetchedTask.late_penalty_per_day || 0,
                            scope: fetchedTask.description || (isAr ? 'لا يوجد وصف للمهمة' : 'No description provided'),
                            submission_notes: fetchedTask.manager_note || (isAr ? 'لا توجد ملاحظات حالية' : 'No notes provided yet'),
                            task_score: fetchedTask.task_score || 0,
                            timeline: buildTimeline(fetchedTask, isAr)
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
    }, [id]);

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
            alert(isAr ? 'تم اعتماد تقييم المهمة بنجاح!' : 'Task scored successfully!');
            navigate('/portal/manager/tasks');
        } catch (error) {
            console.error("Failed to score task:", error);
            alert(isAr ? 'فشل إرسال التقييم.' : 'Failed to submit score.');
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
            alert(isAr 
                ? 'تم إرجاع المهمة للموظف للتعديل مع الملاحظات.' 
                : 'Task sent back for revision with supervisor instructions.');
            navigate('/portal/manager/tasks');
        } catch (error) {
            console.error("Failed to request revision:", error);
            alert(isAr ? 'فشل طلب التعديل.' : 'Failed to request revision.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const [liveScore, setLiveScore] = useState(88.0);

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
                        <h1>{isAr ? 'لوحة تفاصيل وتقييم المهمة' : 'Task Evaluation & Details'}</h1>
                        <p>{isAr ? 'لا توجد أي مهام مسندة في القسم لمراجعتها حالياً.' : 'There are no assigned tasks in this department to evaluate currently.'}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>{isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
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
                    <h1>{isAr ? 'لوحة تفاصيل وتقييم المهمة' : 'Task Evaluation & Details'}</h1>
                    <p>{isAr ? 'راجع مخرجات العمل، اطلب تعديلات، أو اعتمد النتيجة النهائية للتكليف' : 'Review deliverables, request revisions, or score the final submission'}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>{isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
                </button>
            </div>

            {/* Employee Slider/Selection Row */}
            <div className="employee-slider-container">
                <h3 className="slider-section-title">{isAr ? 'اختر موظفاً للتقييم والمراجعة:' : 'Select Employee to Evaluate:'}</h3>
                <div className="employee-slider">
                    {allTasks.map((t) => {
                        const isSelected = task.id === t.id;
                        return (
                            <div 
                                key={t.id} 
                                className={`employee-slide-card ${isSelected ? 'active' : ''}`}
                                onClick={() => handleSelectTask(t)}
                            >
                                <div className="employee-slide-avatar">
                                    {t.employee_avatar}
                                </div>
                                <div className="employee-slide-info">
                                    <h4 className="employee-slide-name">{t.employee_name}</h4>
                                    <p className="employee-slide-task-title">{t.title}</p>
                                    <div className="employee-slide-badge-wrapper">
                                        <StatusBadge status={t.status} lang={currentLang} />
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
                            <span>{isAr ? 'مراجعة المخرجات المسلمة' : 'Submitted Deliverable Review'}</span>
                            <StatusBadge status={task.status} lang={currentLang} />
                        </div>
                        
                        <div className="task-specs-section">
                            <h3 className="task-title-bold">{task.title}</h3>
                            <div className="task-specs-meta">
                                <div><strong>{isAr ? 'الموظف:' : 'Assignee:'}</strong> {task.employee_name}</div>
                                <div>
                                    <strong>{isAr ? 'الموعد النهائي:' : 'Deadline:'}</strong> {task.due_date} ({isAr ? 'تم التسليم في' : 'Submitted on'} {task.submission_date} - <span className="green-text">{isAr ? 'قبل يوم واحد' : '1 day early'}</span>)
                                </div>
                                <div className="specs-description">
                                    <strong>{isAr ? 'متطلبات المهمة:' : 'Scope:'}</strong> {task.scope}
                                </div>
                            </div>
                        </div>

                        <div className="employee-notes-box">
                            <h4 className="notes-header-title">{isAr ? 'ملاحظات تسليم الموظف:' : 'Employee Submission Notes:'}</h4>
                            <p className="notes-content">"{task.submission_notes}"</p>
                        </div>
                    </div>

                    {/* Dumb Score Form Panel */}
                    <ScoreFormPanel 
                        task={task} 
                        onSubmitScore={handleScoreSubmit} 
                        onSubmitRevision={handleRevisionRequest} 
                        calculatedTaskScore={task.task_score || 0}
                        isSubmitting={isSubmitting}
                        lang={currentLang}
                    />
                </div>

                {/* Right Column: Timeline & Revision Actions */}
                <div className="right-column">
                    {/* Timeline */}
                    <div className="card timeline-card">
                        <div className="card-title">{isAr ? 'سجل تتبع الحالات' : 'Task Timeline History'}</div>
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
