import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskFormModal from '../../../../../Shared/Performance/TaskFormModal/TaskFormModal';

const AssignNewTask = ({ isModal = false, isEdit = false, taskData, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Check language from session storage
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Employees List matching department employees
    const employeesList = [
        { id: '1', name: isAr ? 'جون دو' : 'John Doe', department: isAr ? 'مهندس برمجيات' : 'Software Engineer' },
        { id: '2', name: isAr ? 'أليس سميث' : 'Alice Smith', department: isAr ? 'مطور أول' : 'Senior Developer' },
        { id: '3', name: isAr ? 'روبرت كينج' : 'Robert King', department: isAr ? 'محلل نظم' : 'System Analyst' }
    ];

    // Helper to translate employee name to their mock ID
    const getEmployeeId = (name) => {
        if (!name) return '1';
        if (name.includes('John') || name.includes('جون')) return '1';
        if (name.includes('Alice') || name.includes('أليس')) return '2';
        if (name.includes('Robert') || name.includes('روبرت')) return '3';
        return '1';
    };

    const handleFormSubmit = (formData) => {
        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            if (isEdit) {
                alert(isAr ? 'تم تعديل بيانات التكليف بنجاح!' : 'Task assignment updated successfully!');
                if (isModal) {
                    if (onSuccess) {
                        onSuccess({
                            id: taskData?.id,
                            title: formData.title,
                            employee_name: taskData?.employee_name,
                            employee_avatar: taskData?.employee_avatar || 'JD',
                            due_date: new Date(formData.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                            difficulty: formData.difficulty,
                            priority: formData.priority,
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
                    const selectedEmp = employeesList.find(emp => emp.id === formData.employee_id);
                    if (onSuccess) {
                        onSuccess({
                            id: Date.now(),
                            title: formData.title,
                            employee_name: selectedEmp ? selectedEmp.name : 'John Doe',
                            employee_avatar: selectedEmp ? selectedEmp.name.charAt(0) + selectedEmp.name.split(' ')[1]?.charAt(0) : 'JD',
                            due_date: new Date(formData.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                            difficulty: formData.difficulty,
                            priority: formData.priority,
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

    const handleClose = () => {
        if (isModal) {
            if (onClose) onClose();
        } else {
            navigate('/portal/manager/tasks');
        }
    };

    // Format taskData to match the expected format in TaskFormModal
    const mappedTask = taskData ? {
        ...taskData,
        employee_id: getEmployeeId(taskData.employee_name),
        late_penalty_per_day: taskData.late_penalty || 2
    } : null;

    return (
        <TaskFormModal 
            isOpen={true}
            onClose={handleClose}
            onSubmit={handleFormSubmit}
            task={mappedTask}
            employees={employeesList}
            isSubmitting={isSubmitting}
            lang={currentLang}
        />
    );
};

export default AssignNewTask;
