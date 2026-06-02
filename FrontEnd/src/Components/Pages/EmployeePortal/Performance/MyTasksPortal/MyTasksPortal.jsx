
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyTasksPortal.css';
import StatusBadge from "../../../../Shared/Performance/StatusBadge/StatusBadge";
import ManagerNoteBox from "../../../../Shared/Performance/ManagerNoteBox/ManagerNoteBox";
import DeadlineAlert from "../../../../Shared/Performance/DeadlineAlert/DeadlineAlert";
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';

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
        cycleText: isAr ? 'الدورة الموحدة للربع الأول 2026' : 'Consolidated Q1 2026 Cycle',
        searchPlaceholder: isAr ? 'ابحث عن طريق عنوان المهمة...' : 'Search by task title...',
        supervisorRemark: isAr ? 'ملاحظة المشرف:' : 'Supervisor Remark:',
        due: isAr ? 'تاريخ الاستحقاق:' : 'Due:',
        completedDate: isAr ? 'تم الإنجاز في:' : 'Completed:',
        penaltyActive: isAr ? 'الجزاء نشط' : 'Penalty Active',
        awaitingSupervisor: isAr ? 'بانتظار المشرف...' : 'Awaiting supervisor...',
        btnResubmit: isAr ? 'إعادة تسليم' : 'Re-Submit',
        btnDetails: isAr ? 'التفاصيل' : 'Details',
        btnStart: isAr ? 'ابدأ العمل' : 'Start Task',
        btnViewGrade: isAr ? 'عرض الدرجة' : 'View Grade',
        statusScored: isAr ? 'تم رصد الدرجة' : 'Scored',
        excellentWork: isAr ? 'عمل ممتاز' : 'Excellent Work'
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: isAr ? 'صياغة وثائق التكامل والربط' : 'Draft Integration Documentation',
            desc: isAr ? 'تأليف صفحات ويكي الخاصة بالتكامل لتوضيح تدفق المصادقة وخطافات الأحداث مع مخططات تسلسل واضحة.' : 'Author integration wiki pages detailing auth flow and event hooks with clear sequence diagrams.',
            status: 'revision', 
            dueDate: 'May 28',
            remark: isAr ? '"المخططات ممتازة ولكنك نسيت صياغة المخطط الهيكلي لبيانات الويب هوك الواردة."' : '"Diagrams are fine but you missed the webhook payload schemas."',
            penaltyActive: true,
            score: null
        },
        {
            id: 2,
            title: isAr ? 'تحسين نقاط نهاية واجهة برمجة التطبيقات REST' : 'Optimize REST API Endpoints',
            desc: isAr ? 'تحليل وإعادة هيكلة الاستعلامات داخل متحكم التقييم (RecognitionController) لتقليل زمن الاستجابة بنسبة 30%.' : 'Analyze and refactor queries inside the RecognitionController to reduce average response latencies by 30%.',
            status: 'review',
            dueDate: 'May 30, 2026',
            remark: null,
            penaltyActive: false,
            score: null
        },
        {
            id: 3,
            title: isAr ? 'تنظيف ملفات وأصول الواجهة الأمامية' : 'Clean Up Frontend Assets',
            desc: isAr ? 'إزالة مكتبات الموردين الفائضة وحزم CSS غير المستخدمة من تكوينات البناء لتحسين سرعات التحميل.' : 'Remove redundant vendor libraries and unused CSS bundles from build configurations to improve load speeds.',
            status: 'scored',
            dueDate: 'May 24',
            remark: isAr ? 'ممتاز جداً! تم تقليص حجم الحزمة النهائية بنسبة 40%.' : 'Excellent Work!',
            penaltyActive: false,
            score: '92/100'
        },{
    id: 4,
    title: isAr ? 'دمج Stripe Checkout' : 'Integrate Stripe Checkouts',
    desc: isAr
        ? 'تنفيذ تكامل Stripe Checkout في الواجهة الأمامية ومعالجة Webhooks الخاصة بالفوترة الدورية الديناميكية على الخادم.'
        : 'Implement frontend Stripe payment hooks and handle dynamic recurring billing webhooks on the server side.',
    status: 'pending',
    dueDate: 'Jun 08, 2026',
    remark: null,
    penaltyActive: false,
    score: null
}
    ]);

    const handleStartTask = (taskId) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, status: 'progress' } : task
            )
        );
    };

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const countByStatus = (status) => tasks.filter(t => t.status === status).length;
const statusMap = {
    pending: 'pending',
    progress: 'in_progress',
    review: 'pending_review',
    revision: 'needs_revision',
    scored: 'scored'
};
    return (
        <div className={`my-tasks-portal-container ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <section className="top-header">
                <div className="page-title">
                    <h1>{t.title}</h1>
                    <p>{t.subtitle}</p>
                </div>
            </section><div className="sm-theme-toggle-wrapper">
                    <ThemeToggle />
                  </div>

            <div className="stats-grid">
                <div className="stat-card total"
          
                >
                  
                    <i className="fa-solid fa-briefcase stat-icon"></i>
                    <div className="stat-label">{t.assignedTasks}</div>
                    <div className="stat-value">{tasks.length}</div>
                </div>
                <div className="stat-card pending">
                    <i className="fa-solid fa-circle-pause stat-icon"></i>
                    <div className="stat-label">{t.unstarted}</div>
                    <div className="stat-value">{countByStatus('pending')}</div>
                </div>
                <div className="stat-card progress">
                    <i className="fa-solid fa-spinner stat-icon"></i>
                    <div className="stat-label">{t.activeProgress}</div>
                    <div className="stat-value">{countByStatus('progress')}</div>
                </div>
                <div className="stat-card review">
                    <i className="fa-solid fa-paper-plane stat-icon"></i>
                    <div className="stat-label">{t.submittedReview}</div>
                    <div className="stat-value">{countByStatus('review')}</div>
                </div>
                <div className="stat-card revision">
                    <i className="fa-solid fa-circle-exclamation stat-icon"></i>
                    <div className="stat-label" style={{ color: '#f87171' }}>{t.requiresRevision}</div>
                    <div className="stat-value" style={{ color: 'var(--color-revision)' }}>{countByStatus('revision')}</div>
                </div>
                <div className="stat-card average">
                    <i className="fa-solid fa-trophy stat-icon"></i>
                    <div className="stat-label">{t.avgScore}</div>
                    <div className="stat-value">84.5</div>
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

                <div className="task-card-grid">
                    {filteredTasks.map(task => (
                        <div 
                            key={task.id} 
                            className={`task-item-card ${task.status === 'revision' ? 'highlight-revision' : ''} ${task.status === 'scored' ? 'highlight-scored' : ''}`}
                        >
                            <div>
                                <div className="task-card-header">
                                    <h3 className="task-card-title">{task.title}</h3>
                                    <div className="task-status-wrapper">
    <StatusBadge status={statusMap[task.status]} />

    {task.status === 'scored' && (
        <span className="score-text">
            {task.score}
        </span>
    )}
</div>
                                </div>
                                <p className="task-card-desc">{task.desc}</p>
                                
                             {task.remark && (
    <ManagerNoteBox
        notes={task.remark}
        isRevision={task.status === 'revision'}
    />
)}
                            </div>

                            <div>
                             <div className="task-meta-list">
 

    <span>
        <i className="fa-solid fa-calendar"></i>
        {task.status === 'scored'
            ? ` ${t.completedDate} ${task.dueDate}`
            : ` ${t.due} ${task.dueDate}`}
    </span>
</div>
                                <div className="task-card-actions">
                                    {task.penaltyActive ? (
                                        <span className="penalty-text">
                                            <i className="fa-solid fa-triangle-exclamation"></i> {t.penaltyActive}
                                        </span>
                                    ) : (
                                        <span className="placeholder-text">
                                            {task.status === 'review' && t.awaitingSupervisor}
                                            {task.status === 'scored' && <span className="excellent-badge"><i className="fa-solid fa-star"></i> {t.excellentWork}</span>}
                                        </span>
                                    )}

                                    {task.status === 'revision' && (
                                        <button className="btn btn-primary"
                                        //  onClick={() => navigate(`/portal/task-details/${task.id}`)}
                                         >
                                            {t.btnResubmit}
                                        </button>
                                    )}
                                    {task.status === 'review' && (
                                        <button className="btn btn-secondary" 
                                        // onClick={() => navigate(`/portal/task-details/${task.id}`)}
                                        >
                                            {t.btnDetails}
                                        </button>
                                    )}
                                    {task.status === 'pending' && (
                                        <button className="btn btn-primary" 
                                        // onClick={() => handleStartTask(task.id)}
                                        >
                                            {t.btnStart}
                                        </button>
                                    )}
                                    {task.status === 'scored' && (
                                        <button className="btn btn-secondary"
                                        //  onClick={() => navigate(`/portal/task-details/${task.id}`)}
                                         >
                                            {t.btnViewGrade}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyTasksPortal;
