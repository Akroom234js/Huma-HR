import React, { useState } from 'react';
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

    // Mock employee name
    const [employeeName, setEmployeeName] = useState(isAr ? 'جون دو' : 'John Doe');

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

            {/* Manager Evaluation Form */}
            <ManagerEvalForm 
                employeeName={employeeName} 
                onSubmit={handleSubmit} 
                managerScore={liveScore}
                isSubmitting={isSubmitting}
                lang={currentLang}
            />
        </div>
    );
};

export default PeriodicEvaluation;
