import React, { useState, useEffect } from 'react';
import './TaskFormModal.css';
import { useTranslation } from 'react-i18next';

const TaskFormModal = ({
    isOpen = false,
    onClose,
    onSubmit,
    task = null, // If task is provided, we are in EDIT mode
    employees = [],
    isSubmitting = false,
    lang
}) => {
    const { i18n } = useTranslation();
    const currentLang = lang || (i18n ? i18n.language : sessionStorage.getItem('lang')) || 'en';
    const isAr = currentLang === 'ar';

    const isEditMode = !!task;

    // Form states
    const [employeeId, setEmployeeId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [priority, setPriority] = useState('medium');
    const [latePenalty, setLatePenalty] = useState(0);

    // Load task data if in edit mode
    useEffect(() => {
        if (task) {
            setEmployeeId(task.employee_id || '');
            setTitle(task.title || '');
            setDescription(task.description || '');
            
            // Format date to YYYY-MM-DD
            if (task.due_date) {
                const d = new Date(task.due_date);
                const formattedDate = d.toISOString().split('T')[0];
                setDueDate(formattedDate);
            } else {
                setDueDate('');
            }

            setDifficulty(task.difficulty || 'medium');
            setPriority(task.priority || 'medium');
            setLatePenalty(task.late_penalty_per_day || 0);
        } else {
            // Reset states for create mode
            setEmployeeId('');
            setTitle('');
            setDescription('');
            setDueDate('');
            setDifficulty('medium');
            setPriority('medium');
            setLatePenalty(0);
        }
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!employeeId) {
            alert(isAr ? 'يرجى تحديد الموظف المسند إليه' : 'Please select an assigned employee');
            return;
        }

        if (onSubmit) {
            onSubmit({
                id: task?.id || undefined,
                employee_id: employeeId,
                title: title,
                description: description,
                due_date: dueDate,
                difficulty: difficulty,
                priority: priority,
                late_penalty_per_day: Number(latePenalty)
            });
        }
    };

    return (
        <div className="task-form-modal-overlay">
            <div className="task-form-modal-box">
                {/* Header */}
                <div className="task-modal-header">
                    <div className="task-modal-title-section">
                        <div className="task-modal-icon-circle">
                            <i className={`fa-solid ${isEditMode ? 'fa-pen-to-square' : 'fa-circle-plus'}`}></i>
                        </div>
                        <div>
                            <h3 className="task-modal-title">
                                {isEditMode 
                                    ? (isAr ? 'تعديل بيانات التكليف' : 'Edit Task Assignment')
                                    : (isAr ? 'تكليف بمهمة جديدة' : 'Assign New Task')
                                }
                            </h3>
                            <p className="task-modal-subtitle">
                                {isAr ? 'املأ البيانات لرصد وحساب أداء المهام تلقائياً' : 'Provide details for automatic tracking & grading'}
                            </p>
                        </div>
                    </div>
                    <button className="task-modal-close-btn" onClick={onClose} aria-label="Close">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="task-modal-divider"></div>

                {/* Form */}
                <form onSubmit={handleFormSubmit} className="task-modal-form">
                    <div className="task-form-grid">
                        {/* Employee (Disabled in edit mode) */}
                        <div className="task-form-group full-width">
                            <label className="task-form-label">
                                {isAr ? 'الموظف المسند إليه' : 'Assigned Employee'} <span className="req">*</span>
                            </label>
                            <select 
                                className="task-form-control"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                disabled={isEditMode}
                                required
                            >
                                <option value="">{isAr ? '-- اختر الموظف المُكلَّف --' : '-- Select Assigned Employee --'}</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} {emp.department ? `(${emp.department})` : ''}
                                    </option>
                                ))}
                            </select>
                            {isEditMode && (
                                <span className="input-hint-disabled">
                                    {isAr ? 'لا يمكن تغيير الموظف المسند إليه بعد إنشاء المهمة.' : 'Employee assignment cannot be altered after creation.'}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <div className="task-form-group full-width">
                            <label className="task-form-label">
                                {isAr ? 'عنوان المهمة' : 'Task Title'} <span className="req">*</span>
                            </label>
                            <input 
                                type="text"
                                className="task-form-control"
                                placeholder={isAr ? 'مثال: تحسين استعلامات قاعدة البيانات الرئيسية...' : 'e.g. Optimize main database queries...'}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="task-form-group full-width">
                            <label className="task-form-label">
                                {isAr ? 'تفاصيل ووصف التكليف' : 'Task Details & Description'} <span className="req">*</span>
                            </label>
                            <textarea 
                                className="task-form-control"
                                placeholder={isAr ? 'اكتب تفاصيل التسليم والمعايير المطلوبة بوضوح...' : 'Clearly document delivery details and required standards...'}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Due date */}
                        <div className="task-form-group">
                            <label className="task-form-label">
                                {isAr ? 'تاريخ الاستحقاق والتسليم' : 'Due Date & Deadline'} <span className="req">*</span>
                            </label>
                            <input 
                                type="date"
                                className="task-form-control"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} // Future dates only
                                required
                            />
                        </div>

                        {/* Late Penalty */}
                        <div className="task-form-group">
                            <label className="task-form-label">
                                {isAr ? 'خصم التأخير اليومي (نقاط)' : 'Daily Late Penalty (pts)'}
                            </label>
                            <input 
                                type="number"
                                className="task-form-control"
                                min="0"
                                max="100"
                                value={latePenalty}
                                onChange={(e) => setLatePenalty(e.target.value)}
                            />
                        </div>

                        {/* Difficulty */}
                        <div className="task-form-group">
                            <label className="task-form-label">
                                {isAr ? 'مستوى الصعوبة' : 'Difficulty Level'} <span className="req">*</span>
                            </label>
                            <select 
                                className="task-form-control"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                required
                            >
                                <option value="easy">{isAr ? 'سهل (Easy)' : 'Easy'}</option>
                                <option value="medium">{isAr ? 'متوسط (Medium)' : 'Medium'}</option>
                                <option value="hard">{isAr ? 'صعب (Hard)' : 'Hard'}</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="task-form-group">
                            <label className="task-form-label">
                                {isAr ? 'مستوى الأولوية' : 'Priority Level'} <span className="req">*</span>
                            </label>
                            <select 
                                className="task-form-control"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                required
                            >
                                <option value="low">{isAr ? 'منخفضة (Low)' : 'Low'}</option>
                                <option value="medium">{isAr ? 'متوسطة (Medium)' : 'Medium'}</option>
                                <option value="high">{isAr ? 'عالية (High)' : 'High'}</option>
                                <option value="urgent">{isAr ? 'عاجلة (Urgent)' : 'Urgent'}</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="task-modal-footer">
                        <button 
                            type="button" 
                            className="task-btn-cancel" 
                            onClick={onClose}
                        >
                            {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button 
                            type="submit" 
                            className="task-btn-submit" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    <span>{isAr ? 'جاري الحفظ والتكليف...' : 'Saving Assignment...'}</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    <span>
                                        {isEditMode 
                                            ? (isAr ? 'حفظ التعديلات' : 'Save Changes')
                                            : (isAr ? 'اعتماد التكليف بالمهمة' : 'Assign Task')
                                        }
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskFormModal;
