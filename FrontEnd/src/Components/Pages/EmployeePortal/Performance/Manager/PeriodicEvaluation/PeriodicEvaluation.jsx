import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PeriodicEvaluation.css';
import ManagerEvalForm from '../../../../../Shared/Performance/ManagerEvalForm/ManagerEvalForm';
import { useTranslation } from 'react-i18next';
import { 
    getDepartmentEmployees, 
    getPerformanceCycles, 
    submitManagerEvaluation,
    updateManagerEvaluation,
    getMyTeamEvaluations
} from '../../../../../../services/performanceService';

const PeriodicEvaluation = () => {
    const navigate = useNavigate();
    const { employee_id } = useParams();
    const { t, i18n } = useTranslation('EmployeePortal/PeriodicEvaluation');
    const isAr = i18n ? i18n.language === 'ar' : false;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [allEmployees, setAllEmployees] = useState([]);
    const [activeEmployee, setActiveEmployee] = useState(null);
    const [cycles, setCycles] = useState([]);
    const [selectedCycleId, setSelectedCycleId] = useState(null);

    // Helper to load team employees and evaluation statuses for a given cycle
    const loadTeamEvaluations = useCallback(async (cycleId, targetEmployeeId = null) => {
        try {
            setIsLoading(true);
            const [teamRes, deptEmpRes] = await Promise.allSettled([
                cycleId ? getMyTeamEvaluations(cycleId) : Promise.reject('No cycleId'),
                getDepartmentEmployees()
            ]);

            // Build map of evaluations if available
            const evaluationsMap = new Map();
            if (teamRes.status === 'fulfilled') {
                const teamData = teamRes.value?.data?.data?.team || teamRes.value?.data?.team || [];
                if (Array.isArray(teamData)) {
                    teamData.forEach(item => {
                        const empId = String(item.employee?.id || item.id);
                        evaluationsMap.set(empId, {
                            evaluated: Boolean(item.evaluated),
                            evaluation: item.evaluation || null,
                            jobTitle: item.employee?.job_title || ''
                        });
                    });
                }
            }

            // Raw department employees
            let rawEmps = [];
            if (deptEmpRes.status === 'fulfilled') {
                const rawData = deptEmpRes.value?.data?.data || deptEmpRes.value?.data || [];
                rawEmps = Array.isArray(rawData) ? rawData : [];
            }

            // Merge evaluations with employee list
            const mergedEmployees = rawEmps.map(emp => {
                const empId = String(emp.id);
                const evalInfo = evaluationsMap.get(empId);
                const isEvaluated = evalInfo ? evalInfo.evaluated : false;
                const evaluation = evalInfo ? evalInfo.evaluation : null;

                const name = emp.full_name || emp.name || (isAr ? 'موظف' : 'Employee');
                const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                return {
                    id: empId,
                    name: name,
                    avatar: initials,
                    department: emp.department?.name || emp.job_title || (isAr ? 'موظف' : 'Employee'),
                    isEvaluated: isEvaluated,
                    evaluation: evaluation,
                    status: isEvaluated ? 'evaluated' : 'pending'
                };
            });

            setAllEmployees(mergedEmployees);

            if (mergedEmployees.length > 0) {
                const currentId = targetEmployeeId || employee_id || activeEmployee?.id;
                if (currentId) {
                    const matched = mergedEmployees.find(e => e.id === String(currentId));
                    setActiveEmployee(matched || mergedEmployees[0]);
                } else {
                    setActiveEmployee(mergedEmployees[0]);
                }
            }
        } catch (err) {
            console.error("Error loading team evaluations:", err);
        } finally {
            setIsLoading(false);
        }
    }, [employee_id, isAr]);

    // Initial load: fetch performance cycles and determine active cycle
    useEffect(() => {
        const initCycles = async () => {
            try {
                const cyclesRes = await getPerformanceCycles();
                const rawCycles = cyclesRes.data?.data || cyclesRes.data || [];
                const fetchedCycles = Array.isArray(rawCycles) ? rawCycles : [];
                setCycles(fetchedCycles);

                if (fetchedCycles.length > 0) {
                    const activeCycle = fetchedCycles.find(c => c.status === 'active') || fetchedCycles[0];
                    setSelectedCycleId(activeCycle.id);
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Error loading performance cycles:", err);
                setIsLoading(false);
            }
        };

        initCycles();
    }, []);

    // Load team data whenever selected cycle changes
    useEffect(() => {
        if (selectedCycleId) {
            loadTeamEvaluations(selectedCycleId, employee_id);
        }
    }, [selectedCycleId, loadTeamEvaluations, employee_id]);

    const handleSelectEmployee = (emp) => {
        setActiveEmployee(emp);
        navigate(`/portal/manager/evaluate/${emp.id}`);
    };

    const handleCycleChange = (e) => {
        const newCycleId = e.target.value;
        setSelectedCycleId(newCycleId);
    };

    const handleSubmit = async (data) => {
        if (!activeEmployee) return;
        if (!selectedCycleId) {
            alert(t('alerts.noActiveCycle'));
            return;
        }

        try {
            setIsSubmitting(true);

            if (activeEmployee.isEvaluated && activeEmployee.evaluation?.id) {
                // Update existing evaluation via PUT
                const res = await updateManagerEvaluation(activeEmployee.evaluation.id, {
                    professionalism: Number(data.professionalism),
                    responsibility: Number(data.responsibility),
                    problem_solving: Number(data.problem_solving),
                    notes: data.notes || null,
                });

                const updatedEval = res.data?.data || res.data || {};

                // Update local state
                setAllEmployees(prev => prev.map(emp => {
                    if (emp.id === activeEmployee.id) {
                        return {
                            ...emp,
                            isEvaluated: true,
                            evaluation: {
                                ...emp.evaluation,
                                ...data,
                                ...updatedEval
                            }
                        };
                    }
                    return emp;
                }));

                setActiveEmployee(prev => ({
                    ...prev,
                    isEvaluated: true,
                    evaluation: {
                        ...prev.evaluation,
                        ...data,
                        ...updatedEval
                    }
                }));

                alert(t('alerts.updateSuccess'));
            } else {
                // Create new evaluation via POST
                const res = await submitManagerEvaluation({
                    performance_cycle_id: Number(selectedCycleId),
                    employee_profile_id: Number(activeEmployee.id),
                    professionalism: Number(data.professionalism),
                    responsibility: Number(data.responsibility),
                    problem_solving: Number(data.problem_solving),
                    notes: data.notes || null,
                });

                const newEval = res.data?.data || res.data || {};

                // Update local state
                setAllEmployees(prev => prev.map(emp => {
                    if (emp.id === activeEmployee.id) {
                        return {
                            ...emp,
                            isEvaluated: true,
                            status: 'evaluated',
                            evaluation: newEval
                        };
                    }
                    return emp;
                }));

                setActiveEmployee(prev => ({
                    ...prev,
                    isEvaluated: true,
                    status: 'evaluated',
                    evaluation: newEval
                }));

                alert(t('alerts.submitSuccess'));
            }
        } catch (error) {
            console.error("Failed to save manager evaluation:", error);
            if (error.response?.status === 409) {
                alert(t('alerts.alreadyEvaluated'));
                // Resync data with backend
                loadTeamEvaluations(selectedCycleId, activeEmployee.id);
            } else {
                const errors = error.response?.data?.errors;
                let msg = error.response?.data?.message || (activeEmployee.isEvaluated ? t('alerts.updateError') : t('alerts.submitError'));
                if (errors && typeof errors === 'object') {
                    const detailed = Object.values(errors).flat().join('\n');
                    if (detailed) msg = detailed;
                }
                alert(msg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-color)' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '16px', display: 'block' }}></i>
                <div>{t('loading')}</div>
            </div>
        );
    }

    if (allEmployees.length === 0) {
        return (
            <div className={`performance-periodic-evaluation ${isAr ? 'rtl' : 'ltr'}`}>
                <div className="top-header">
                    <div className="page-title">
                        <h1>{t('title')}</h1>
                        <p>{t('noEmployees')}</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>{t('backToDashboard')}</span>
                    </button>
                </div>
            </div>
        );
    }

    const evaluatedCount = allEmployees.filter(e => e.isEvaluated).length;
    const totalCount = allEmployees.length;

    return (
        <div className={`performance-periodic-evaluation ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <div className="top-header">
                <div className="page-title">
                    <h1>{t('title')}</h1>
                    <p>{t('subtitle')}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>{t('backToDashboard')}</span>
                </button>
            </div>

            {/* Cycle Selection if multiple */}
            {cycles.length > 1 && (
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('cycleLabel')}</span>
                    <select 
                        className="select-input" 
                        value={selectedCycleId || ''} 
                        onChange={handleCycleChange}
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
                <div className="slider-header-flex">
                    <h3 className="slider-section-title">{t('selectEmployeeTitle')}</h3>
                    <span className="slider-stats-pill">
                        <i className="fa-solid fa-user-check"></i>
                        <span>{t('summaryStats', { evaluated: evaluatedCount, total: totalCount })}</span>
                    </span>
                </div>
                <div className="employee-slider">
                    {allEmployees.map((emp) => {
                        const isSelected = activeEmployee?.id === emp.id;
                        return (
                            <div 
                                key={emp.id} 
                                className={`employee-slide-card ${isSelected ? 'active' : ''}`}
                                onClick={() => handleSelectEmployee(emp)}
                            >
                                <div className="employee-slide-avatar-wrapper">
                                    <div className={`employee-slide-avatar ${emp.isEvaluated ? 'evaluated' : ''}`}>
                                        {emp.avatar}
                                    </div>
                                    {emp.isEvaluated && (
                                        <span className="avatar-evaluated-check">
                                            <i className="fa-solid fa-check"></i>
                                        </span>
                                    )}
                                </div>
                                <div className="employee-slide-info">
                                    <h4 className="employee-slide-name">{emp.name}</h4>
                                    <p className="employee-slide-task-title">{emp.department}</p>
                                    <div className="employee-slide-badge-wrapper">
                                        {emp.isEvaluated ? (
                                            <span className="badge badge-evaluated">
                                                <i className="fa-solid fa-circle-check"></i>
                                                {t('evaluated')}
                                            </span>
                                        ) : (
                                            <span className="badge badge-pending">
                                                <i className="fa-regular fa-clock"></i>
                                                {t('pendingEvaluation')}
                                            </span>
                                        )}
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
                    isEvaluated={Boolean(activeEmployee.isEvaluated)}
                    initialValues={activeEmployee.evaluation}
                    lang={i18n.language}
                />
            )}
        </div>
    );
};

export default PeriodicEvaluation;

