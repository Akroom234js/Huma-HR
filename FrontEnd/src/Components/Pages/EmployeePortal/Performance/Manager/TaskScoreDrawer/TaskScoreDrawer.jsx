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

    // Mock Task Data
    const [task, setTask] = useState({
        id: 1,
        title: 'Optimize REST API Endpoints',
        employee_name: 'John Doe',
        due_date: 'May 30, 2026',
        submission_date: 'May 29, 2026',
        status: 'pending_review',
        days_late: 0,
        late_penalty_per_day: 5,
        scope: 'Refactoring the primary endpoints inside the RecognitionController and implementing Eloquent database query optimizations. Benchmark response times before and after to prove at least 30% latency reduction.',
        submission_notes: 'I optimized the eager-loading in the RecognitionController index and store endpoints, reducing queries from 14 to 3. Visual benchmarking output is attached in our wiki repository showing a 37% response time reduction. Ready for review.'
    });

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

    // Calculate a mock computed score based on backend logic to feed into the dumb component
    // In a real app, this would be computed by the backend or a state selector.
    // For live preview in this mockup, we can simulate the backend recalculation:
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
                            <div className="timeline-item completed">
                                <div className="timeline-icon"></div>
                                <div className="timeline-content">
                                    <div className="timeline-time">May 26, 2026 10:15 AM</div>
                                    <div className="timeline-title">{isAr ? 'تم إنشاء التكليف' : 'Task Assigned & Created'}</div>
                                    <div className="timeline-desc">{isAr ? 'تم تكليف الموظف جون دو بواسطة إميلي ميتشل' : 'Assigned to John Doe by Emily Mitchell'}</div>
                                </div>
                            </div>
                            <div className="timeline-item completed">
                                <div className="timeline-icon"></div>
                                <div className="timeline-content">
                                    <div className="timeline-time">May 26, 2026 02:40 PM</div>
                                    <div className="timeline-title">{isAr ? 'الحالة: قيد العمل' : 'Status: In Progress'}</div>
                                    <div className="timeline-desc">{isAr ? 'أشار جون دو إلى بدء العمل على المهمة' : 'John Doe flagged this task as started'}</div>
                                </div>
                            </div>
                            <div className="timeline-item active">
                                <div className="timeline-icon"></div>
                                <div className="timeline-content">
                                    <div className="timeline-time">May 29, 2026 04:12 PM</div>
                                    <div className="timeline-title">{isAr ? 'تم تسليم العمل للمراجعة' : 'Submitted for Review'}</div>
                                    <div className="timeline-desc">{isAr ? 'بانتظار إجراء المدير وتقييم مخرجات العمل' : 'Pending review and grading action'}</div>
                                </div>
                            </div>
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
