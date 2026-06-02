import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PeriodicEvaluation.css';
import ManagerEvalForm from '../../../../../Shared/Performance/ManagerEvalForm/ManagerEvalForm';

const PeriodicEvaluation = () => {
    const navigate = useNavigate();
    const { employee_id } = useParams();

    // Check language
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock Department Employees for periodic evaluation
    const allEmployees = [
        { id: '1', name: isAr ? 'جون دو' : 'John Doe', avatar: 'JD', department: isAr ? 'مهندس برمجيات' : 'Software Engineer', status: 'pending' },
        { id: '2', name: isAr ? 'أليس سميث' : 'Alice Smith', avatar: 'AS', department: isAr ? 'مطور أول' : 'Senior Developer', status: 'pending' },
        { id: '3', name: isAr ? 'روبرت كينج' : 'Robert King', avatar: 'RK', department: isAr ? 'محلل نظم' : 'System Analyst', status: 'pending' }
    ];

    const getInitialEmployee = () => {
        if (employee_id) {
            const found = allEmployees.find(emp => emp.id === employee_id);
            if (found) return found;
        }
        return allEmployees[0]; // John Doe as default
    };

    const [activeEmployee, setActiveEmployee] = useState(getInitialEmployee());

    // Sync active employee state when URL employee_id changes
    useEffect(() => {
        if (employee_id) {
            const found = allEmployees.find(emp => emp.id === employee_id);
            if (found) {
                setActiveEmployee(found);
            }
        }
    }, [employee_id]);

    // Handle employee slider click selection
    const handleSelectEmployee = (emp) => {
        setActiveEmployee(emp);
        navigate(`/portal/manager/evaluate/${emp.id}`);
    };

    // Simulate backend returned score based on form values for the preview box
    const [liveScore, setLiveScore] = useState(81.7);

    const handleSubmit = (data) => {
        setIsSubmitting(true);
        // Simulate sending to backend
        setTimeout(() => {
            setIsSubmitting(false);
            alert(isAr 
                ? 'تم رصد التقييم الدوري للموظف بنجاح!' 
                : 'Periodic employee evaluation submitted successfully!');
            navigate('/portal/manager/tasks');
        }, 1000);
    };

    return (
        <div className={`performance-periodic-evaluation ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <div className="top-header">
                <div className="page-title">
                    <h1>{isAr ? 'التقييم الدوري للموظف' : 'Periodic Employee Evaluation'}</h1>
                    <p>{isAr ? 'قم برصد درجات الاحترافية والمسؤولية وحل المشكلات للدورة الحالية' : 'Grade the general professionalism, responsibility, and problem-solving skills for this active cycle'}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>{isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
                </button>
            </div>

            {/* Employee Slider/Selection Row */}
            <div className="employee-slider-container">
                <h3 className="slider-section-title">{isAr ? 'اختر موظفاً لبدء التقييم الدوري:' : 'Select Employee to Evaluate:'}</h3>
                <div className="employee-slider">
                    {allEmployees.map((emp) => {
                        const isSelected = activeEmployee.id === emp.id;
                        return (
                            <div 
                                key={emp.id} 
                                className={`employee-slide-card ${isSelected ? 'active' : ''}`}
                                onClick={() => handleSelectEmployee(emp)}
                            >
                                <div className="employee-slide-avatar">
                                    {emp.avatar}
                                </div>
                                <div className="employee-slide-info">
                                    <h4 className="employee-slide-name">{emp.name}</h4>
                                    <p className="employee-slide-task-title">{emp.department}</p>
                                    <div className="employee-slide-badge-wrapper">
                                        <span className="badge badge-pending" style={{ fontSize: '9px', padding: '2px 6px' }}>
                                            {isAr ? 'بانتظار التقييم' : 'Pending Evaluation'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Manager Evaluation Form */}
            <ManagerEvalForm 
                employeeName={activeEmployee.name} 
                onSubmit={handleSubmit} 
                managerScore={liveScore}
                isSubmitting={isSubmitting}
                lang={currentLang}
            />
        </div>
    );
};

export default PeriodicEvaluation;
