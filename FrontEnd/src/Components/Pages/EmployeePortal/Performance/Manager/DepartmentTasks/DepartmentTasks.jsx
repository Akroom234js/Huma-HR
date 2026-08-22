import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DepartmentTasks.css';
import DifficultyBadge from '../../../../../Shared/Performance/DifficultyBadge/DifficultyBadge';
import PriorityBadge from '../../../../../Shared/Performance/PriorityBadge/PriorityBadge';
import StatusBadge from '../../../../../Shared/Performance/StatusBadge/StatusBadge';
import TaskFormModal from '../../../../../Shared/Performance/TaskFormModal/TaskFormModal';
import { useTranslation } from 'react-i18next';
import { 
    getDepartmentTasks, 
    getDepartmentEmployees, 
    createTask, 
    updateTask, 
    deleteTask 
} from '../../../../../../services/performanceService';

const DepartmentTasks = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('EmployeePortal/DepartmentTasks');
    const isAr = i18n ? i18n.language === 'ar' : false;

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isModalSubmitting, setIsModalSubmitting] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [employeesList, setEmployeesList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const formatTaskForFrontend = (backendTask) => {
        const empName = backendTask.employee?.name || backendTask.employee?.full_name || t('alerts.unknownEmployee');
        const avatar = empName
            ? empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : '??';
            
        return {
            id: backendTask.id,
            title: backendTask.title,
            description: backendTask.description || '',
            employee_name: empName,
            employee_avatar: avatar,
            due_date: backendTask.due_date,
            difficulty: backendTask.difficulty || 'medium',
            priority: backendTask.priority || 'medium',
            status: backendTask.status || 'pending',
            employee_id: backendTask.employee?.id ? backendTask.employee.id.toString() : '',
            late_penalty_per_day: backendTask.late_penalty_per_day || 0
        };
    };

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [tasksRes, employeesRes] = await Promise.all([
                getDepartmentTasks(),
                getDepartmentEmployees()
            ]);
            
            const rawTasks = tasksRes.data?.data || [];
            const formattedTasks = rawTasks.map(t => formatTaskForFrontend(t));
            setTasks(formattedTasks);
            
            const rawEmployees = employeesRes.data?.data || [];
            const formattedEmployees = rawEmployees.map(emp => ({
                id: emp.id.toString(),
                name: emp.full_name || emp.name || '',
                department: emp.department?.name || emp.job_title || ''
            }));
            setEmployeesList(formattedEmployees);
        } catch (error) {
            console.error("Failed to load department performance data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [i18n.language]);

    // Success handlers
    const handleAssignSuccess = (newTask) => {
        setTasks([newTask, ...tasks]);
    };

    const handleEditSuccess = (updatedTask) => {
        setTasks(tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t));
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm(t('alerts.deleteConfirm'))) {
            try {
                await deleteTask(id);
                setTasks(tasks.filter(t => t.id !== id));
            } catch (error) {
                console.error("Failed to delete task:", error);
                alert(t('alerts.deleteError'));
            }
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
                    <h1>{t('title')}</h1>
                    <p>{t('subtitle')}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
                    <i className="fa-solid fa-plus"></i>
                    <span>{t('assignNewTask')}</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card total-tasks">
                    <i className="fa-solid fa-list-check stat-icon"></i>
                    <div className="stat-label">{t('stats.total')}</div>
                    <div className="stat-value">{totalCount}</div>
                </div>
                <div className="stat-card pending">
                    <i className="fa-solid fa-clock stat-icon"></i>
                    <div className="stat-label">{t('stats.pending')}</div>
                    <div className="stat-value">{pendingCount}</div>
                </div>
                <div className="stat-card progress">
                    <i className="fa-solid fa-spinner stat-icon"></i>
                    <div className="stat-label">{t('stats.inProgress')}</div>
                    <div className="stat-value">{progressCount}</div>
                </div>
                <div className="stat-card review">
                    <i className="fa-solid fa-envelope-open-text stat-icon"></i>
                    <div className="stat-label">{t('stats.pendingReview')}</div>
                    <div className="stat-value" style={{ color: 'var(--color-review)' }}>{reviewCount}</div>
                </div>
                <div className="stat-card revision">
                    <i className="fa-solid fa-triangle-exclamation stat-icon"></i>
                    <div className="stat-label">{t('stats.needsRevision')}</div>
                    <div className="stat-value">{revisionCount}</div>
                </div>
                <div className="stat-card scored">
                    <i className="fa-solid fa-circle-check stat-icon"></i>
                    <div className="stat-label">{t('stats.scored')}</div>
                    <div className="stat-value">{scoredCount}</div>
                </div>
            </div>

            {/* Table Card */}
            <div className="card">
                <div className="card-title">
                    <span>{t('activeTasksList')}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                        {t('managerPortalSub')}
                    </span>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="search-wrapper">
                        <i className="fa-solid fa-magnifying-glass"></i>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="filter-group">
                        <span className="filter-label">{t('statusFilter')}</span>
                        <select 
                            className="select-input"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">{t('allStatuses')}</option>
                            <option value="pending">{t('statuses.pending')}</option>
                            <option value="in_progress">{t('statuses.in_progress')}</option>
                            <option value="pending_review">{t('statuses.pending_review')}</option>
                            <option value="needs_revision">{t('statuses.needs_revision')}</option>
                            <option value="scored">{t('statuses.scored')}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <span className="filter-label">{t('priorityFilter')}</span>
                        <select 
                            className="select-input"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <option value="">{t('allPriorities')}</option>
                            <option value="low">{t('priorities.low')}</option>
                            <option value="medium">{t('priorities.medium')}</option>
                            <option value="high">{t('priorities.high')}</option>
                            <option value="urgent">{t('priorities.urgent')}</option>
                        </select>
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>{t('table.taskTitle')}</th>
                                <th>{t('table.assignedTo')}</th>
                                <th>{t('table.dueDate')}</th>
                                <th>{t('table.difficulty')}</th>
                                <th>{t('table.priority')}</th>
                                <th>{t('table.status')}</th>
                                <th style={{ textAlign: isAr ? 'left' : 'right' }}>{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        {t('table.noTasks')}
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <tr key={task.id}>
                                        <td data-label={t('table.task')} style={{ fontWeight: 600 }}>{task.title}</td>
                                        <td data-label={t('table.employee')}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="user-avatar btn-sm" style={{ width: '26px', height: '26px', fontSize: '10px', borderColor: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {task.employee_avatar}
                                                </div>
                                                <span>{task.employee_name}</span>
                                            </div>
                                        </td>
                                        <td data-label={t('table.dueDate')}>{task.due_date}</td>
                                        <td data-label={t('table.difficulty')}>
                                            <DifficultyBadge difficulty={task.difficulty} lang={i18n.language} />
                                        </td>
                                        <td data-label={t('table.priority')}>
                                            <PriorityBadge priority={task.priority} lang={i18n.language} />
                                        </td>
                                        <td data-label={t('table.status')}>
                                            <StatusBadge status={task.status} lang={i18n.language} />
                                        </td>
                                        <td style={{ textAlign: isAr ? 'left' : 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
                                                {task.status === 'pending_review' ? (
                                                    <button 
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => navigate(`/portal/manager/tasks/score/${task.id}`)}
                                                    >
                                                        <i className="fa-solid fa-star"></i>
                                                        <span>{t('table.score')}</span>
                                                    </button>
                                                ) : task.status === 'scored' ? (
                                                    <button 
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => navigate(`/portal/manager/tasks/score/${task.id}`)}
                                                    >
                                                        <i className="fa-solid fa-search"></i>
                                                        <span>{t('table.details')}</span>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="btn btn-secondary btn-sm" 
                                                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                                        disabled
                                                    >
                                                        <i className="fa-solid fa-star"></i>
                                                        <span>{t('table.score')}</span>
                                                    </button>
                                                )}

                                                {task.status !== 'scored' ? (
                                                    <button 
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setEditingTask(task)}
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                        <span>{t('table.edit')}</span>
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className="btn btn-secondary btn-sm" 
                                                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                                        disabled
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                        <span>{t('table.edit')}</span>
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
            <TaskFormModal 
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSubmit={async (formData) => {
                    setIsModalSubmitting(true);
                    try {
                        const payload = {
                            employee_profile_id: Number(formData.employee_id),
                            title: formData.title,
                            description: formData.description,
                            due_date: formData.due_date,
                            difficulty: formData.difficulty,
                            priority: formData.priority,
                            late_penalty_per_day: Number(formData.late_penalty_per_day)
                        };
                        const res = await createTask(payload);
                        if (res.data?.data) {
                            const newTaskFormatted = formatTaskForFrontend(res.data.data);
                            handleAssignSuccess(newTaskFormatted);
                        }
                        setShowAssignModal(false);
                    } catch (error) {
                        console.error("Failed to create task:", error);
                        alert(t('alerts.createError'));
                    } finally {
                        setIsModalSubmitting(false);
                    }
                }}
                employees={employeesList}
                isSubmitting={isModalSubmitting}
                lang={i18n.language}
            />

            {/* Edit Task Modal */}
            <TaskFormModal 
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                onSubmit={async (formData) => {
                    setIsModalSubmitting(true);
                    try {
                        const payload = {
                            title: formData.title,
                            description: formData.description,
                            due_date: formData.due_date,
                            difficulty: formData.difficulty,
                            priority: formData.priority,
                            late_penalty_per_day: Number(formData.late_penalty_per_day)
                        };
                        const res = await updateTask(editingTask.id, payload);
                        if (res.data?.data) {
                            const updatedTaskFormatted = formatTaskForFrontend(res.data.data);
                            handleEditSuccess(updatedTaskFormatted);
                        }
                        setEditingTask(null);
                    } catch (error) {
                        console.error("Failed to update task:", error);
                        alert(t('alerts.updateError'));
                    } finally {
                        setIsModalSubmitting(false);
                    }
                }}
                task={editingTask ? {
                    ...editingTask,
                    employee_id: editingTask.employee_id
                } : null}
                employees={employeesList}
                isSubmitting={isModalSubmitting}
                lang={i18n.language}
            />
        </section>
    );
};

export default DepartmentTasks;
