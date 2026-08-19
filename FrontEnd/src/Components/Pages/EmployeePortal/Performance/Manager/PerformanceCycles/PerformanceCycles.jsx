import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PerformanceCycles.css';
import CycleResultsModal from './CycleResultsModal';
import { getPerformanceCycles } from '../../../../../../services/performanceService';

const PerformanceCycles = () => {
    const navigate = useNavigate();

    // Check language
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const [selectedCycle, setSelectedCycle] = useState(null);
    const [cycles, setCycles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCycles = async () => {
        try {
            setIsLoading(true);
            const res = await getPerformanceCycles();
            const raw = res?.data?.data || res?.data || [];
            setCycles(Array.isArray(raw) ? raw : []);
        } catch (error) {
            console.error("Failed to fetch performance cycles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCycles();
    }, []);

    const getJobStateText = (status) => {
        switch (status) {
            case 'active':
                return isAr ? 'بانتظار الإغلاق النهائي للحساب' : 'Awaiting final closing to calculate';
            case 'processing':
                return isAr ? 'جاري المعالجة وحساب الدرجات...' : 'Processing scores and AI actions...';
            case 'closed':
                return isAr ? 'تمت المعالجة والحساب بنجاح' : 'Processed successfully';
            case 'draft':
            default:
                return isAr ? 'غير مفتوحة بعد' : 'Unopened / Draft';
        }
    };

    return (
        <div className={`performance-cycles-management ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <div className="top-header">
                <div className="page-title">
                    <h1>{isAr ? 'إدارة دورات الأداء' : 'Performance Cycles Management'}</h1>
                    <p>{isAr ? 'تتبع فترات التقييم الحالية، تجميع الدرجات، ومراقبة العمليات الخلفية للقسم' : 'Track current evaluation durations, run automated score consolidations, and inspect queue states'}</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/portal/manager/tasks')}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>{isAr ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
                </button>
            </div>

            {/* Cycles Table */}
            <div className="card">
                <div className="card-title">
                    <span>{isAr ? 'دورات الأداء الحالية والسابقة' : 'Active & Historical Cycles'}</span>
                    <span className="card-subtitle-small">
                        <i className="fa-solid fa-circle-check font-green"></i> 
                        {isAr ? ' محرك المهام الخلفي نشط' : ' Job Queue Engine Online'}
                    </span>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}></i>
                        {isAr ? 'جاري تحميل الدورات...' : 'Loading cycles...'}
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>{isAr ? 'اسم الدورة' : 'Cycle Name'}</th>
                                    <th>{isAr ? 'فترة التقييم' : 'Duration Period'}</th>
                                    <th>{isAr ? 'القالب المستخدم' : 'Template'}</th>
                                    <th>{isAr ? 'الحالة' : 'Status'}</th>
                                    <th>{isAr ? 'حالة حساب العمليات الخلفية' : 'Background Job Score State'}</th>
                                    <th style={{ textAlign: 'right' }}>{isAr ? 'العمليات' : 'Operations'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cycles.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                            {isAr ? 'لا توجد دورات أداء مسجلة حالياً.' : 'No performance cycles found.'}
                                        </td>
                                    </tr>
                                ) : (
                                    cycles.map((c) => {
                                        const period = `${c.start_date || '-'} → ${c.end_date || '-'}`;
                                        return (
                                            <tr key={c.id}>
                                                <td style={{ fontWeight: 700, color: c.status === 'active' ? 'var(--primary-color)' : 'var(--text-main)' }}>
                                                    {c.title}
                                                </td>
                                                <td>{period}</td>
                                                <td>{c.template_name || (isAr ? 'القالب الافتراضي' : 'Default Template')}</td>
                                                <td>
                                                    {c.status === 'active' && (
                                                        <span className="badge badge-cycle-active">
                                                            <i className="fa-solid fa-circle-play pulse-dot-active"></i>
                                                            <span>{isAr ? 'نشطة' : 'Active'}</span>
                                                        </span>
                                                    )}
                                                    {c.status === 'closed' && (
                                                        <span className="badge badge-cycle-closed">
                                                            <span>{isAr ? 'مغلقة' : 'Closed'}</span>
                                                        </span>
                                                    )}
                                                    {c.status === 'processing' && (
                                                        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                                            <span>{isAr ? 'قيد المعالجة' : 'Processing'}</span>
                                                        </span>
                                                    )}
                                                    {c.status === 'draft' && (
                                                        <span className="badge badge-cycle-draft">
                                                            <span>{isAr ? 'مسودة' : 'Draft'}</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="job-state-cell">
                                                        <span className={`state-indicator-dot ${c.status}`}></span>
                                                        <span style={{ 
                                                            fontSize: '13px', 
                                                            color: c.status === 'closed' ? 'var(--color-scored)' : 'var(--text-secondary)',
                                                            fontWeight: c.status === 'closed' ? 600 : 'normal'
                                                        }}>
                                                            {getJobStateText(c.status)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {c.status === 'active' ? (
                                                        <button className="btn btn-secondary btn-sm disabled-opacity" disabled>
                                                            <i className="fa-solid fa-clock"></i>
                                                            <span>{isAr ? 'سيتم الحساب عند الإغلاق' : 'Calculated upon closure'}</span>
                                                        </button>
                                                    ) : c.status === 'closed' ? (
                                                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCycle(c)}>
                                                            <i className="fa-solid fa-chart-line"></i>
                                                            <span>{isAr ? 'عرض النتائج' : 'View Results'}</span>
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-secondary btn-sm disabled-opacity" disabled>
                                                            <i className="fa-solid fa-lock"></i>
                                                            <span>{isAr ? 'مغلق' : 'Locked'}</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Background Workers Monitor */}
            <div className="card">
                <div className="card-title">
                    {isAr ? 'مراقبة العمال والوظائف الخلفية' : 'Background Worker & Job Queue Monitor'}
                </div>
                <div className="workers-grid">
                    <div className="worker-monitor-card">
                        <div className="worker-header">
                            <span className="worker-name">ProcessPerformanceJob</span>
                            <span className="badge badge-scored btn-sm">{isAr ? 'جاهز' : 'Idle'}</span>
                        </div>
                        <p className="worker-desc">
                            {isAr 
                                ? 'يقوم بحساب المتوسط المرجح لدرجات الأداء الخمس للموظفين تلقائياً فور إغلاق الدورة.'
                                : 'Computes 5-component weighted average scores. Triggered on cycle closure or manual supervisor request.'}
                        </p>
                    </div>

                    <div className="worker-monitor-card">
                        <div className="worker-header">
                            <span className="worker-name">TriggerAIAnalysisJob</span>
                            <span className="badge badge-scored btn-sm">{isAr ? 'جاهز' : 'Idle'}</span>
                        </div>
                        <p className="worker-desc">
                            {isAr 
                                ? 'يرسل بيانات الموظف إلى الذكاء الاصطناعي لتشخيص الفجوات المكتشفة وتوصيات التدريب.'
                                : 'Dispatches prompt data to OpenAI model to establish 3 structured competency gaps and tailored training paths.'}
                        </p>
                    </div>

                    <div className="worker-monitor-card">
                        <div className="worker-header">
                            <span className="worker-name">ExecutePerformanceActionsJob</span>
                            <span className="badge badge-scored btn-sm">{isAr ? 'جاهز' : 'Idle'}</span>
                        </div>
                        <p className="worker-desc">
                            {isAr 
                                ? 'ينفذ الإجراءات التلقائية المترتبة على الدرجة كإعداد الترقية أو المكافأة أو الإنذار.'
                                : 'Automates HR task triggers (notifying employees of warnings, queuing bonus forms, issuing letters of training).'}
                        </p>
                    </div>
                </div>
            </div>

            <CycleResultsModal 
                isOpen={!!selectedCycle} 
                onClose={() => setSelectedCycle(null)} 
                cycle={selectedCycle} 
            />
        </div>
    );
};

export default PerformanceCycles;
