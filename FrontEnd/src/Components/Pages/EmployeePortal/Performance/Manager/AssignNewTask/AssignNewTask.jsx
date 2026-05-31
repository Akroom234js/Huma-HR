import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AssignNewTask.css';

const AssignNewTask = ({ isModal = false, isEdit = false, taskData, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Check language
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    // States
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState(''); // Used for Edit Mode
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [latePenalty, setLatePenalty] = useState(2);
    const [difficulty, setDifficulty] = useState('medium');
    const [priority, setPriority] = useState('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Employees (used for Create Mode)
    const employees = [
        { id: '1', name: isAr ? 'جون دو (مهندس برمجيات)' : 'John Doe (Software Engineer)' },
        { id: '2', name: isAr ? 'أليس سميث (مطور أول)' : 'Alice Smith (Senior Developer)' },
        { id: '3', name: isAr ? 'روبرت كينج (محلل نظم)' : 'Robert King (System Analyst)' }
    ];

    // Load initial data for Edit Mode
    useEffect(() => {
        if (isEdit) {
            if (taskData) {
                setEmployeeName(taskData.employee_name);
                setTitle(taskData.title);
                setDescription(taskData.description || (isAr ? 'يتطلب هذا التكليف إعادة صياغة نقاط النهاية الرئيسية...' : 'This task requires refactoring the primary endpoints inside the RecognitionController and implementing Eloquent database query optimizations. Benchmark response times before and after to prove at least 30% latency reduction.'));
                try {
                    if (taskData.due_date) {
                        const parsedDate = new Date(taskData.due_date);
                        if (!isNaN(parsedDate.getTime())) {
                            setDueDate(parsedDate.toISOString().split('T')[0]);
                        } else {
                            setDueDate('2026-05-30');
                        }
                    } else {
                        setDueDate('2026-05-30');
                    }
                } catch (err) {
                    setDueDate('2026-05-30');
                }
                setLatePenalty(taskData.late_penalty || 5);
                setDifficulty(taskData.difficulty || 'hard');
                setPriority(taskData.priority || 'high');
            } else {
                // Default fallback if no taskData is passed but we have route id
                setEmployeeName(isAr ? 'جون دو' : 'John Doe');
                setTitle('Optimize REST API Endpoints');
                setDescription('This task requires refactoring the primary endpoints inside the RecognitionController and implementing Eloquent database query optimizations. Benchmark response times before and after to prove at least 30% latency reduction.');
                setDueDate('2026-05-30');
                setLatePenalty(5);
                setDifficulty('hard');
                setPriority('high');
            }
        }
    }, [id, taskData, isEdit, isAr]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            if (isEdit) {
                alert(isAr ? 'تم تعديل بيانات التكليف بنجاح!' : 'Task assignment updated successfully!');
                if (isModal) {
                    if (onSuccess) {
                        onSuccess({
                            id: taskData?.id,
                            title: title,
                            employee_name: taskData?.employee_name || employeeName,
                            employee_avatar: taskData?.employee_avatar || 'JD',
                            due_date: new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                            difficulty: difficulty,
                            priority: priority,
                            status: taskData?.status || 'pending'
                        });
                    }
                    if (onClose) onClose();
                } else {
                    navigate('/portal/manager/tasks');
                }
            } else {
                alert(isAr ? 'تم إسناد التكليف بنجاح وإشعار الموظف!' : 'Task assigned successfully and employee notified!');
                if (isModal) {
                    const selectedEmp = employees.find(emp => emp.id === employeeId);
                    if (onSuccess) {
                        onSuccess({
                            id: Date.now(),
                            title: title,
                            employee_name: selectedEmp ? selectedEmp.name.split(' (')[0] : 'John Doe',
                            employee_avatar: selectedEmp ? selectedEmp.name.charAt(0) + selectedEmp.name.split(' ')[1]?.charAt(0) : 'JD',
                            due_date: new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                            difficulty: difficulty,
                            priority: priority,
                            status: 'pending'
                        });
                    }
                    if (onClose) onClose();
                } else {
                    navigate('/portal/manager/tasks');
                }
            }
        }, 1000);
    };

    const handleReset = () => {
        setEmployeeId('');
        setTitle('');
        setDescription('');
        setDueDate('');
        setLatePenalty(2);
        setDifficulty('medium');
        setPriority('medium');
    };

    return (
        <div className={`performance-assign-new-task ${isAr ? 'rtl' : 'ltr'} ${isModal ? 'is-modal' : ''}`}>
            {/* Header */}
            {!isModal && (
                <div className="top-header">
                    <div className="page-title">
                        <h1>{isEdit ? (isAr ? 'تعديل تفاصيل المهمة' : 'Edit Task Details') : (isAr ? 'إسناد تكليف جديد' : 'Assign New Task')}</h1>
                        <p>{isEdit ? (isAr ? 'عدل على معايير وتفاصيل المهمة قبل رصد التقييم النهائي لها' : 'Modify task specifications before the task undergoes final scoring') : (isAr ? 'قم بإنشاء مهمة جديدة، وحدد الصعوبة، الأولوية، وأسندها للموظف' : 'Create a task, choose complexity, priority, and assign it to a team member')}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>{isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
                    </button>
                </div>
            )}

            {/* Form Card */}
            <div className="card">
                <div className="card-title">
                    <span>{isEdit ? (isAr ? 'نموذج تعديل التكليف' : 'Edit Task Form') : (isAr ? 'نموذج التكليف بالمهام' : 'Task Assignment Form')}</span>
                    <span className="card-subtitle-small">
                        {isEdit ? (
                            <>
                                <i className="fa-solid fa-lock"></i> {isAr ? 'الموظف مقفل • API: PUT /tasks/{id}' : 'Assignee Locked • API: PUT /tasks/{id}'}
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-circle-info"></i> API: POST /tasks
                            </>
                        )}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="task-assignment-form">
                    <div className="form-grid">
                        {/* Assignee */}
                        <div className="form-group">
                            <label className="form-label">
                                {isEdit ? (isAr ? 'الموظف المسند إليه (مقفل)' : 'Assignee Employee (Locked)') : (isAr ? 'الموظف المسند إليه' : 'Assignee Employee')} {!isEdit && <span className="req">*</span>}
                            </label>
                            {isEdit ? (
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={employeeName}
                                    disabled 
                                />
                            ) : (
                                <select 
                                    className="form-control" 
                                    value={employeeId} 
                                    onChange={(e) => setEmployeeId(e.target.value)} 
                                    required
                                >
                                    <option value="">{isAr ? '-- اختر الموظف --' : 'Select Department Employee'}</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Title */}
                        <div className="form-group">
                            <label className="form-label">
                                {isAr ? 'عنوان المهمة' : 'Task Title'} <span className="req">*</span>
                            </label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder={isAr ? 'مثال: تحسين طبقة الكاشينج باستخدام Redis' : 'e.g. Optimize Redis Caching Layer'} 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required 
                            />
                        </div>

                        {/* Specifications Description */}
                        <div className="form-group full-width">
                            <label className="form-label">
                                {isAr ? 'وصف التكليف والمعايير المطلوبة' : 'Task Specifications & Description'} <span className="req">*</span>
                            </label>
                            <textarea 
                                className="form-control" 
                                placeholder={isAr ? 'صف المخرجات المطلوبة ومعايير الجودة ومجال المهمة بوضوح...' : 'Describe the deliverable requirements, criteria for excellence, and scope...'} 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required 
                            />
                        </div>

                        {/* Due Date */}
                        <div className="form-group">
                            <label className="form-label">
                                {isAr ? 'تاريخ الاستحقاق' : 'Due Date'} <span className="req">*</span>
                            </label>
                            <input 
                                type="date" 
                                className="form-control" 
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required 
                                min={new Date().toISOString().split('T')[0]} 
                            />
                        </div>

                        {/* Late Penalty */}
                        <div className="form-group">
                            <label className="form-label">
                                {isAr ? 'خصم التأخير اليومي (نقاط من التقييم)' : 'Late Penalty Per Day (Deducted Points)'} <span className="opt">{isAr ? '(اختياري)' : '(Optional)'}</span>
                            </label>
                            <input 
                                type="number" 
                                className="form-control" 
                                value={latePenalty}
                                onChange={(e) => setLatePenalty(e.target.value)}
                                min="0" 
                                max="100" 
                            />
                        </div>

                        {/* Difficulty */}
                        <div className="form-group">
                            <label className="form-label">
                                {isAr ? 'مستوى الصعوبة' : 'Difficulty Level'} <span className="req">*</span>
                            </label>
                            <select 
                                className="form-control" 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(e.target.value)} 
                                required
                            >
                                <option value="easy">{isAr ? 'سهل (سهل: 1.0)' : 'Easy (Multiplier: 1.0)'}</option>
                                <option value="medium">{isAr ? 'متوسط (متوسط: 1.2)' : 'Medium (Multiplier: 1.2)'}</option>
                                <option value="hard">{isAr ? 'صعب (صعب: 1.5)' : 'Hard (Multiplier: 1.5)'}</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="form-group">
                            <label className="form-label">
                                {isAr ? 'مستوى الأولوية' : 'Priority Level'} <span className="req">*</span>
                            </label>
                            <select 
                                className="form-control" 
                                value={priority} 
                                onChange={(e) => setPriority(e.target.value)} 
                                required
                            >
                                <option value="low">{isAr ? 'منخفض' : 'Low'}</option>
                                <option value="medium">{isAr ? 'متوسط' : 'Medium'}</option>
                                <option value="high">{isAr ? 'عالي' : 'High'}</option>
                                <option value="urgent">{isAr ? 'عاجل جداً' : 'Urgent'}</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        {isModal ? (
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                {isAr ? 'إلغاء' : 'Cancel'}
                            </button>
                        ) : (
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                                {isAr ? 'العودة' : 'Back'}
                            </button>
                        )}
                        {!isEdit && (
                            <button type="button" className="btn btn-secondary" onClick={handleReset}>
                                {isAr ? 'إعادة ضبط' : 'Reset'}
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    <span>{isEdit ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'جاري الإسناد...' : 'Assigning...')}</span>
                                </>
                            ) : (
                                <>
                                    <i className={isEdit ? "fa-solid fa-floppy-disk" : "fa-solid fa-paper-plane"}></i>
                                    <span>{isEdit ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إسناد المهمة' : 'Assign Task')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignNewTask;
