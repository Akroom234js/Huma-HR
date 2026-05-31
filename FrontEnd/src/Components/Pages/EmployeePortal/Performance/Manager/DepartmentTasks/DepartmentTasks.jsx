import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DepartmentTasks.css';
import AssignNewTask from '../AssignNewTask/AssignNewTask';
import EditTaskPanel from '../EditTaskPanel/EditTaskPanel';

const DepartmentTasks = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Success handlers
    const handleAssignSuccess = (newTask) => {
        setTasks([newTask, ...tasks]);
    };

    const handleEditSuccess = (updatedTask) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    };

    // Check language
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    // Mock Tasks Data representing Department tasks (directly matching mockup entries)
    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: 'Optimize REST API Endpoints',
            employee_name: 'John Doe',
            employee_avatar: 'JD',
            due_date: 'May 30, 2026',
            difficulty: 'hard',
            priority: 'high',
            status: 'pending_review'
        },
        {
            id: 2,
            title: 'Migrate Legacy Database to PostgreSQL',
            employee_name: 'Alice Smith',
            employee_avatar: 'AS',
            due_date: 'Jun 04, 2026',
            difficulty: 'medium',
            priority: 'urgent',
            status: 'in_progress'
        },
        {
            id: 3,
            title: 'Draft Integration Documentation',
            employee_name: 'Robert King',
            employee_avatar: 'RK',
            due_date: 'May 28, 2026',
            difficulty: 'easy',
            priority: 'medium',
            status: 'needs_revision'
        },
        {
            id: 4,
            title: 'Clean Up Deprecated Frontend Assets',
            employee_name: 'John Doe',
            employee_avatar: 'JD',
            due_date: 'May 25, 2026',
            difficulty: 'easy',
            priority: 'low',
            status: 'scored'
        },
        {
            id: 5,
            title: 'Design Identity Provider Microservice',
            employee_name: 'Alice Smith',
            employee_avatar: 'AS',
            due_date: 'Jun 10, 2026',
            difficulty: 'hard',
            priority: 'high',
            status: 'pending'
        }
    ]);

    // Handle delete
    const handleDelete = (id) => {
        const confirmMsg = isAr 
            ? 'هل أنت متأكد من رغبتك في حذف هذه المهمة نهائياً؟' 
            : 'Are you sure you want to delete this task? This action is irreversible.';
        if (window.confirm(confirmMsg)) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    // Filters
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              task.employee_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || task.status === statusFilter;
        const matchesPriority = !priorityFilter || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Counts for stats
    const totalCount = tasks.length;
    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const progressCount = tasks.filter(t => t.status === 'in_progress').length;
    const reviewCount = tasks.filter(t => t.status === 'pending_review').length;
    const revisionCount = tasks.filter(t => t.status === 'needs_revision').length;
    const scoredCount = tasks.filter(t => t.status === 'scored').length;

    return (
        <section className={`tab-content active performance-department-tasks ${isAr ? 'rtl' : 'ltr'}`}>
            <div className="top-header">
                <div className="page-title">
                    <h1>{isAr ? 'لوحة تحكم مهام القسم' : 'Department Tasks Dashboard'}</h1>
                    <p>{isAr ? 'مراقبة وتقييم نسب إنجاز وجودة المهام لموظفي القسم' : "Monitor and evaluate your team's task completion and quality scores"}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
                    <i className="fa-solid fa-plus"></i>
                    <span>{isAr ? 'إسناد تكليف جديد' : 'Assign New Task'}</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card total-tasks">
                    <i className="fa-solid fa-list-check stat-icon"></i>
                    <div className="stat-label">{isAr ? 'إجمالي المهام' : 'Total Dept Tasks'}</div>
                    <div className="stat-value">{totalCount}</div>
                </div>
                <div className="stat-card pending">
                    <i className="fa-solid fa-clock stat-icon"></i>
                    <div className="stat-label">{isAr ? 'معلقة / لم تبدأ' : 'Pending / Unstarted'}</div>
                    <div className="stat-value">{pendingCount}</div>
                </div>
                <div className="stat-card progress">
                    <i className="fa-solid fa-spinner stat-icon"></i>
                    <div className="stat-label">{isAr ? 'قيد التنفيذ' : 'In Progress'}</div>
                    <div className="stat-value">{progressCount}</div>
                </div>
                <div className="stat-card review">
                    <i className="fa-solid fa-envelope-open-text stat-icon"></i>
                    <div className="stat-label">{isAr ? 'بانتظار المراجعة' : 'Pending Review'}</div>
                    <div className="stat-value" style={{ color: 'var(--color-review)' }}>{reviewCount}</div>
                </div>
                <div className="stat-card revision">
                    <i className="fa-solid fa-triangle-exclamation stat-icon"></i>
                    <div className="stat-label">{isAr ? 'تحتاج تعديل' : 'Needs Revision'}</div>
                    <div className="stat-value">{revisionCount}</div>
                </div>
                <div className="stat-card scored">
                    <i className="fa-solid fa-circle-check stat-icon"></i>
                    <div className="stat-label">{isAr ? 'مقيّمة / مكتملة' : 'Scored / Completed'}</div>
                    <div className="stat-value">{scoredCount}</div>
                </div>
            </div>

            {/* Table Card */}
            <div className="card">
                <div className="card-title">
                    <span>{isAr ? 'قائمة المهام النشطة' : 'Active Tasks List'}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                        {isAr ? 'بوابة المدير • قسم تكنولوجيا المعلومات' : 'Manager Portal • IT Division'}
                    </span>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="search-wrapper">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder={isAr ? 'البحث عن مهمة أو اسم موظف...' : 'Search by task title or employee name...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-group">
                        <span className="filter-label">{isAr ? 'الحالة' : 'Status'}</span>
                        <select 
                            className="select-input"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                            <option value="pending">{isAr ? 'معلقة' : 'Pending'}</option>
                            <option value="in_progress">{isAr ? 'قيد التنفيذ' : 'In Progress'}</option>
                            <option value="pending_review">{isAr ? 'بانتظار المراجعة' : 'Pending Review'}</option>
                            <option value="needs_revision">{isAr ? 'تحتاج تعديل' : 'Needs Revision'}</option>
                            <option value="scored">{isAr ? 'مقيّمة' : 'Scored'}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <span className="filter-label">{isAr ? 'الأولوية' : 'Priority'}</span>
                        <select 
                            className="select-input"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="">{isAr ? 'جميع الأولويات' : 'All Priorities'}</option>
                            <option value="low">{isAr ? 'منخفضة' : 'Low'}</option>
                            <option value="medium">{isAr ? 'متوسطة' : 'Medium'}</option>
                            <option value="high">{isAr ? 'عالية' : 'High'}</option>
                            <option value="urgent">{isAr ? 'عاجلة' : 'Urgent'}</option>
                        </select>
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>{isAr ? 'عنوان التكليف' : 'Task Title'}</th>
                                <th>{isAr ? 'الموظف المسند إليه' : 'Assigned To'}</th>
                                <th>{isAr ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                                <th>{isAr ? 'الصعوبة' : 'Difficulty'}</th>
                                <th>{isAr ? 'الأولوية' : 'Priority'}</th>
                                <th>{isAr ? 'الحالة' : 'Status'}</th>
                                <th style={{ textAlign: isAr ? 'left' : 'right' }}>{isAr ? 'العمليات' : 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        {isAr ? 'لا توجد مهام مطابقة لخيارات التصفية' : 'No tasks match current filters'}
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <tr key={task.id}>
                                        <td style={{ fontWeight: 600 }}>{task.title}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="user-avatar btn-sm" style={{ width: '26px', height: '26px', fontSize: '10px', borderColor: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {task.employee_avatar}
                                                </div>
                                                <span>{task.employee_name}</span>
                                            </div>
                                        </td>
                                        <td>{task.due_date}</td>
                                        <td>
                                            <span className={`badge badge-difficulty-${task.difficulty}`}>
                                                {task.difficulty === 'easy' && (isAr ? 'سهل' : 'Easy')}
                                                {task.difficulty === 'medium' && (isAr ? 'متوسط' : 'Medium')}
                                                {task.difficulty === 'hard' && (isAr ? 'صعب' : 'Hard')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-priority-${task.priority}`}>
                                                {task.priority === 'low' && (isAr ? 'منخفضة' : 'Low')}
                                                {task.priority === 'medium' && (isAr ? 'متوسطة' : 'Medium')}
                                                {task.priority === 'high' && (isAr ? 'عالية' : 'High')}
                                                {task.priority === 'urgent' && (isAr ? 'عاجلة' : 'Urgent')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${task.status === 'in_progress' ? 'progress' : task.status === 'pending_review' ? 'review' : task.status === 'needs_revision' ? 'revision' : task.status}`}>
                                                {task.status === 'pending' && (isAr ? 'معلقة' : 'Pending')}
                                                {task.status === 'in_progress' && (isAr ? 'قيد التنفيذ' : 'In Progress')}
                                                {task.status === 'pending_review' && (isAr ? 'بانتظار المراجعة' : 'Pending Review')}
                                                {task.status === 'needs_revision' && (isAr ? 'تحتاج تعديل' : 'Needs Revision')}
                                                {task.status === 'scored' && (isAr ? 'مقيّمة' : 'Scored')}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: isAr ? 'left' : 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
                                                {task.status === 'pending_review' ? (
                                                    <button 
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => navigate(`/portal/manager/tasks/score/${task.id}`)}
                                                    >
                                                        <i className="fa-solid fa-star"></i>
                                                        <span>{isAr ? 'تقييم' : 'Score'}</span>
                                                    </button>
                                                ) : task.status === 'scored' ? (
                                                    <button 
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => navigate(`/portal/manager/tasks/score/${task.id}`)}
                                                    >
                                                        <i className="fa-solid fa-search"></i>
                                                        <span>{isAr ? 'التفاصيل' : 'Details'}</span>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="btn btn-secondary btn-sm" 
                                                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                                        disabled
                                                    >
                                                        <i className="fa-solid fa-star"></i>
                                                        <span>{isAr ? 'تقييم' : 'Score'}</span>
                                                    </button>
                                                )}

                                                {task.status !== 'scored' ? (
                                                    <button 
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setEditingTask(task)}
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="btn btn-secondary btn-sm" 
                                                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                                        disabled
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                        <span>{isAr ? 'تعديل' : 'Edit'}</span>
                                                    </button>
                                                )}

                                                {task.status !== 'scored' ? (
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(task.id)}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="btn btn-secondary btn-sm" 
                                                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                                        disabled
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assign Task Modal */}
            {showAssignModal && (
                <div className="performance-modal-backdrop" onClick={() => setShowAssignModal(false)}>
                    <div className="performance-modal-content" onClick={(e) => e.stopPropagation()}>
                        <AssignNewTask 
                            isModal={true} 
                            onClose={() => setShowAssignModal(false)} 
                            onSuccess={handleAssignSuccess} 
                        />
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {editingTask && (
                <div className="performance-modal-backdrop" onClick={() => setEditingTask(null)}>
                    <div className="performance-modal-content" onClick={(e) => e.stopPropagation()}>
                        <EditTaskPanel 
                            isModal={true} 
                            taskData={editingTask} 
                            onClose={() => setEditingTask(null)} 
                            onSuccess={handleEditSuccess} 
                        />
                    </div>
                </div>
            )}
        </section>
    );
};

export default DepartmentTasks;
