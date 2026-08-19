import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PeriodicEvaluation.css';
import ManagerEvalForm from '../../../../../Shared/Performance/ManagerEvalForm/ManagerEvalForm';
import { 
    getDepartmentEmployees, 
    getPerformanceCycles, 
    getMyTeamEvaluations, 
    submitManagerEvaluation 
} from '../../../../../../services/performanceService';

const PeriodicEvaluation = () => {
    const navigate = useNavigate();
    const { employee_id } = useParams();

    // Check language
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [allEmployees, setAllEmployees] = useState([]);
    const [activeEmployee, setActiveEmployee] = useState(null);
    const [cycles, setCycles] = useState([]);
    const [selectedCycleId, setSelectedCycleId] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                const [cyclesRes, empRes] = await Promise.allSettled([
                    getPerformanceCycles(),
                    getDepartmentEmployees()
                ]);

                let fetchedCycles = [];
                if (cyclesRes.status === 'fulfilled') {
                    const raw = cyclesRes.value?.data?.data || cyclesRes.value?.data || [];
                    fetchedCycles = Array.isArray(raw) ? raw : [];
                    setCycles(fetchedCycles);
                    const activeCycle = fetchedCycles.find(c => c.status === 'active') || fetchedCycles[0];
                    if (activeCycle) {
                        setSelectedCycleId(activeCycle.id);
                    }
                }

                let employees = [];
                if (empRes.status === 'fulfilled') {
                    const rawEmp = empRes.value?.data?.data || empRes.value?.data || [];
                    employees = (Array.isArray(rawEmp) ? rawEmp : []).map(emp => {
                        const name = emp.full_name || emp.name || 'Employee';
                        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        return {
                            id: String(emp.id),
                            name: name,
                            avatar: initials,
                            department: emp.department?.name || emp.job_title || (isAr ? 'موظف' : 'Employee'),
                            status: 'pending'
                        };
                    });
                    setAllEmployees(employees);
                }

                if (employees.length > 0) {
                    if (employee_id) {
                        const found = employees.find(e => e.id === String(employee_id));
                        setActiveEmployee(found || employees[0]);
                    } else {
                        setActiveEmployee(employees[0]);
                    }
                }
            } catch (err) {
                console.error("Error loading periodic evaluation data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [employee_id]);

    const handleSelectEmployee = (emp) => {
        setActiveEmployee(emp);
        navigate(`/portal/manager/evaluate/${emp.id}`);
    };

    const handleSubmit = async (data) => {
        if (!activeEmployee) return;
        if (!selectedCycleId) {
            alert(isAr ? 'لا توجد دورة أداء نشطة. يرجى إنشاء دورة أولاً.' : 'No active performance cycle found. Please create one first.');
            return;
        }

        try {
            setIsSubmitting(true);
            await submitManagerEvaluation({
                performance_cycle_id: Number(selectedCycleId),
                employee_profile_id: Number(activeEmployee.id),
                professionalism: Number(data.professionalism),
                responsibility: Number(data.responsibility),
                problem_solving: Number(data.problem_solving),
                notes: data.notes || null,
            });

            alert(isAr 
                ? 'تم رصد التقييم الدوري للموظف بنجاح!' 
                : 'Periodic employee evaluation submitted successfully!');
            navigate('/portal/manager/tasks');
        } catch (error) {
            console.error("Failed to submit manager evaluation:", error);
            const errors = error.response?.data?.errors;
            let msg = error.response?.data?.message || (isAr ? 'فشل إرسال التقييم الدوري.' : 'Failed to submit periodic evaluation.');
            if (errors && typeof errors === 'object') {
                const detailed = Object.values(errors).flat().join('\n');
                if (detailed) msg = detailed;
            }
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-color)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '16px', display: 'block' }}></i>
                <div>{isAr ? 'جاري تحميل بيانات الموظفين والدورات...' : 'Loading employees and cycles data...'}</div>
            </div>
        );
    }

    if (allEmployees.length === 0) {
        return (
            <div className={`performance-periodic-evaluation ${isAr ? 'rtl' : 'ltr'}`}>
                <div className="top-header">
                    <div className="page-title">
                        <h1>{isAr ? 'التقييم الدوري للموظف' : 'Periodic Employee Evaluation'}</h1>
                        <p>{isAr ? 'لا يوجد موظفين في قسمك حالياً لإجراء التقييم الدوري.' : 'No employees currently found in your department to evaluate.'}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>{isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
                    </button>
                </div>
            </div>
        );
    }

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

            {/* Cycle Selection if multiple */}
            {cycles.length > 1 && (
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{isAr ? 'دورة الأداء:' : 'Performance Cycle:'}</span>
                    <select 
                        className="select-input" 
                        value={selectedCycleId || ''} 
                        onChange={(e) => setSelectedCycleId(e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                        {cycles.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.title} ({c.status})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Employee Slider/Selection Row */}
            <div className="employee-slider-container">
                <h3 className="slider-section-title">{isAr ? 'اختر موظفاً لبدء التقييم الدوري:' : 'Select Employee to Evaluate:'}</h3>
                <div className="employee-slider">
                    {allEmployees.map((emp) => {
                        const isSelected = activeEmployee?.id === emp.id;
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
            {activeEmployee && (
                <ManagerEvalForm 
                    employeeName={activeEmployee.name} 
                    onSubmit={handleSubmit} 
                    isSubmitting={isSubmitting}
                    lang={currentLang}
                />
            )}
        </div>
    );
};

export default PeriodicEvaluation;
