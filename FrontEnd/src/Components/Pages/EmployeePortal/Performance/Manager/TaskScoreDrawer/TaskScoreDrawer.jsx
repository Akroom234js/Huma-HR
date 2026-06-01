import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TaskScoreDrawer.css';
import StatusBadge from '../../../../../Shared/Performance/StatusBadge/StatusBadge'
import ScoreFormPanel from '../../../../../Shared/Performance/ScoreFormPanel/ScoreFormPanel';

const TaskScoreDrawer = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Check language
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Task Data representing all department evaluation candidates
    const allTasks = [
        {
            id: 1,
            title: isAr ? 'تحسين نقاط اتصال REST API' : 'Optimize REST API Endpoints',
            employee_name: isAr ? 'جون دو' : 'John Doe',
            employee_avatar: 'JD',
            due_date: 'May 30, 2026',
            submission_date: 'May 29, 2026',
            status: 'pending_review',
            days_late: 0,
            late_penalty_per_day: 5,
            scope: isAr 
                ? 'إعادة هيكلة نقاط الاتصال الأساسية داخل RecognitionController وتطبيق تحسينات استعلام قاعدة بيانات Eloquent. قياس أوقات الاستجابة قبل وبعد لإثبات تقليل زمن الانتقال بنسبة 30٪ على الأقل.'
                : 'Refactoring the primary endpoints inside the RecognitionController and implementing Eloquent database query optimizations. Benchmark response times before and after to prove at least 30% latency reduction.',
            submission_notes: isAr 
                ? 'لقد قمت بتحسين التحميل المسبق في نقاط فهرسة وتخزين RecognitionController، مما أدى إلى تقليل الاستعلامات من 14 إلى 3. تم إرفاق ناتج القياس المرئي في مستودع الويكي الخاص بنا والذي يوضح انخفاض وقت الاستجابة بنسبة 37٪. جاهز للمراجعة.'
                : 'I optimized the eager-loading in the RecognitionController index and store endpoints, reducing queries from 14 to 3. Visual benchmarking output is attached in our wiki repository showing a 37% response time reduction. Ready for review.',
            timeline: [
                { time: 'May 26, 2026 10:15 AM', title: isAr ? 'تم إنشاء التكليف' : 'Task Assigned & Created', desc: isAr ? 'تم تكليف الموظف جون دو بواسطة إميلي ميتشل' : 'Assigned to John Doe by Emily Mitchell', completed: true },
                { time: 'May 26, 2026 02:40 PM', title: isAr ? 'الحالة: قيد العمل' : 'Status: In Progress', desc: isAr ? 'أشار جون دو إلى بدء العمل على المهمة' : 'John Doe flagged this task as started', completed: true },
                { time: 'May 29, 2026 04:12 PM', title: isAr ? 'تم تسليم العمل للمراجعة' : 'Submitted for Review', desc: isAr ? 'بانتظار إجراء المدير وتقييم مخرجات العمل' : 'Pending review and grading action', active: true }
            ]
        },
        {
            id: 2,
            title: isAr ? 'ترحيل قاعدة البيانات القديمة إلى PostgreSQL' : 'Migrate Legacy Database to PostgreSQL',
            employee_name: isAr ? 'أليس سميث' : 'Alice Smith',
            employee_avatar: 'AS',
            due_date: 'Jun 04, 2026',
            submission_date: 'Jun 03, 2026',
            status: 'in_progress',
            days_late: 0,
            late_penalty_per_day: 5,
            scope: isAr
                ? 'ترحيل جميع جداول قاعدة بيانات MySQL القديمة إلى جداول PostgreSQL مع فحص التكامل الهيكلي والبياني للتأكد من نجاح العملية بنسبة 100٪.'
                : 'Migrate all old MySQL schemas to PostgreSQL tables, update all indices and run data seeding checks.',
            submission_notes: isAr
                ? 'تم نقل الجداول بالكامل، ونجحت اختبارات الترحيل والتأكد بنسبة 100٪ من سلامة البيانات.'
                : 'Fully migrated schemas, seeding checks passed successfully with 100% data integrity verified.',
            timeline: [
                { time: 'Jun 01, 2026 09:00 AM', title: isAr ? 'تم إنشاء التكليف' : 'Task Assigned & Created', desc: isAr ? 'تم تكليف الموظفة أليس سميث بواسطة إميلي ميتشل' : 'Assigned to Alice Smith by Emily Mitchell', completed: true },
                { time: 'Jun 02, 2026 11:30 AM', title: isAr ? 'الحالة: قيد العمل' : 'Status: In Progress', desc: isAr ? 'أشارت أليس إلى بدء كتابة الأكواد والتعديل' : 'Alice flagged task as started and in progress', active: true }
            ]
        },
        {
            id: 3,
            title: isAr ? 'صياغة مستندات التكامل البرمجي' : 'Draft Integration Documentation',
            employee_name: isAr ? 'روبرت كينج' : 'Robert King',
            employee_avatar: 'RK',
            due_date: 'May 28, 2026',
            submission_date: 'May 27, 2026',
            status: 'needs_revision',
            days_late: 0,
            late_penalty_per_day: 5,
            scope: isAr
                ? 'كتابة مستند تفصيلي يوضح كيفية تكامل الأنظمة وربطها برمجياً مع مراجعة المعايير الأمنية.'
                : 'Draft complete API and system integration documentation for review.',
            submission_notes: isAr
                ? 'تمت صياغة المستند الأولي، لكن يحتاج لمراجعة إضافية على القسم الثالث (بروتوكولات الأمان).'
                : 'Drafted documentation, needs a second look on section 3 (security protocols).',
            timeline: [
                { time: 'May 24, 2026 08:15 AM', title: isAr ? 'تم إنشاء التكليف' : 'Task Assigned & Created', desc: isAr ? 'تم تكليف الموظف روبرت كينج بواسطة إميلي ميتشل' : 'Assigned to Robert King by Emily Mitchell', completed: true },
                { time: 'May 25, 2026 10:45 AM', title: isAr ? 'الحالة: قيد العمل' : 'Status: In Progress', desc: isAr ? 'أشار روبرت لبدء صياغة متطلبات التكامل' : 'Robert King flagged task as in progress', completed: true },
                { time: 'May 27, 2026 03:00 PM', title: isAr ? 'تم تسليم المسودة للمراجعة' : 'Submitted Draft for Review', desc: isAr ? 'تم تسليم المسودة الأولى للتكامل والمراجعة' : 'First system draft submitted for review', completed: true },
                { time: 'May 28, 2026 09:20 AM', title: isAr ? 'تم طلب التعديل وإرجاع المهمة' : 'Revisions Requested', desc: isAr ? 'طلب المدير تعديل المعايير الأمنية في القسم الثالث' : 'Emily Mitchell requested revisions on security controls', active: true }
            ]
        }
    ];

    const getInitialTask = () => {
        if (id) {
            const found = allTasks.find(t => t.id === parseInt(id));
            if (found) return found;
        }
        return allTasks[0]; // John Doe as default
    };

    const [task, setTask] = useState(getInitialTask());

    // Sync task state if id URL parameter changes
    useEffect(() => {
        if (id) {
            const found = allTasks.find(t => t.id === parseInt(id));
            if (found) {
                setTask(found);
            }
        }
    }, [id]);

    // Handle selecting task from horizontal slider
    const handleSelectTask = (selectedTask) => {
        setTask(selectedTask);
        navigate(`/portal/manager/tasks/score/${selectedTask.id}`);
    };

    // Handle submissions
    const handleScoreSubmit = (data) => {
        setIsSubmitting(true);
        // Simulate sending to backend
        setTimeout(() => {
            setIsSubmitting(false);
            alert(isAr 
                ? `تم اعتماد تقييم المهمة بنجاح!` 
                : `Task scored successfully!`);
            navigate('/portal/manager/tasks');
        }, 1000);
    };

    const handleRevisionRequest = (data) => {
        setIsSubmitting(true);
        // Simulate sending to backend
        setTimeout(() => {
            setIsSubmitting(false);
            alert(isAr 
                ? 'تم إرجاع المهمة للموظف للتعديل مع الملاحظات.' 
                : 'Task sent back for revision with supervisor instructions.');
            navigate('/portal/manager/tasks');
        }, 1000);
    };

    const [liveScore, setLiveScore] = useState(88.0);

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
                        calculatedTaskScore={liveScore}
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
