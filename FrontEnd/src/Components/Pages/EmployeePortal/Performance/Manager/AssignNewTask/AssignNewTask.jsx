import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TaskFormModal from '../../../../../Shared/Performance/TaskFormModal/TaskFormModal';
import { useTranslation } from 'react-i18next';
import { getDepartmentEmployees, createTask, updateTask } from '../../../../../../services/performanceService';

const AssignNewTask = ({ isModal = false, isEdit = false, taskData, onClose, onSuccess }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { i18n } = useTranslation();
    const isAr = i18n ? i18n.language === 'ar' : false;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employeesList, setEmployeesList] = useState([]);

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const res = await getDepartmentEmployees();
                const rawEmployees = res.data?.data || [];
                const formattedEmployees = rawEmployees.map(emp => ({
                    id: emp.id.toString(),
                    name: emp.full_name || emp.name || '',
                    department: emp.department?.name || emp.job_title || ''
                }));
                setEmployeesList(formattedEmployees);
            } catch (error) {
                console.error("Failed to load department employees for assignment:", error);
            }
        };
        loadEmployees();
    }, [i18n.language]);

    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            if (isEdit) {
                const payload = {
                    title: formData.title,
                    description: formData.description,
                    due_date: formData.due_date,
                    difficulty: formData.difficulty,
                    priority: formData.priority,
                    late_penalty_per_day: Number(formData.late_penalty_per_day)
                };
                const res = await updateTask(taskData?.id || id, payload);
                alert(isAr ? 'تم تعديل بيانات التكليف بنجاح!' : 'Task assignment updated successfully!');
                if (isModal) {
                    if (onSuccess && res.data?.data) {
                        onSuccess(res.data.data);
                    }
                    if (onClose) onClose();
                } else {
                    navigate('/portal/manager/tasks');
                }
            } else {
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
                alert(isAr ? 'تم إسناد التكليف بنجاح وإشعار الموظف!' : 'Task assigned successfully and employee notified!');
                if (isModal) {
                    if (onSuccess && res.data?.data) {
                        onSuccess(res.data.data);
                    }
                    if (onClose) onClose();
                } else {
                    navigate('/portal/manager/tasks');
                }
            }
        } catch (error) {
            console.error("Failed to submit task form:", error);
            alert(isAr ? 'حدث خطأ أثناء حفظ التكليف.' : 'An error occurred while saving task.');
        } finally {
            setIsSubmitting(false);
        }
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
        employee_id: taskData.employee_id || taskData.employee?.id?.toString() || '',
        late_penalty_per_day: taskData.late_penalty_per_day || taskData.late_penalty || 0
    } : null;

    return (
        <TaskFormModal 
            isOpen={true}
            onClose={handleClose}
            onSubmit={handleFormSubmit}
            task={mappedTask}
            employees={employeesList}
            isSubmitting={isSubmitting}
            lang={i18n.language}
        />
    );
};

export default AssignNewTask;
