import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PerformanceCycles.css';

const PerformanceCycles = () => {
    const navigate = useNavigate();

    // Check language
    const currentLang = sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const [isConsolidating, setIsConsolidating] = useState(false);

    // Mock Cycles
    const [cycles, setCycles] = useState([
        {
            id: 1,
            nameEn: 'First Quarter 2026 (Q1)',
            nameAr: 'الربع الأول 2026 (Q1)',
            periodEn: 'Jan 01, 2026 - Mar 31, 2026',
            periodAr: '01 يناير 2026 - 31 مارس 2026',
            employees: 14,
            status: 'active',
            jobStateEn: 'Awaiting final closing to calculate',
            jobStateAr: 'بانتظار الإغلاق النهائي للحساب'
        },
        {
            id: 2,
            nameEn: 'Fourth Quarter 2025 (Q4)',
            nameAr: 'الربع الرابع 2025 (Q4)',
            periodEn: 'Oct 01, 2025 - Dec 31, 2025',
            periodAr: '01 أكتوبر 2025 - 31 ديسمبر 2025',
            employees: 12,
            status: 'closed',
            jobStateEn: 'Processed successfully',
            jobStateAr: 'تمت المعالجة والحساب بنجاح'
        },
        {
            id: 3,
            nameEn: 'Second Quarter 2026 (Q2)',
            nameAr: 'الربع الثاني 2026 (Q2)',
            periodEn: 'Apr 01, 2026 - Jun 30, 2026',
            periodAr: '01 أبريل 2026 - 30 يونيو 2026',
            employees: 0,
            status: 'draft',
            jobStateEn: 'Unopened',
            jobStateAr: 'غير مفتوحة بعد'
        }
    ]);

    const handleRunCalc = () => {
        setIsConsolidating(true);
        alert(isAr 
            ? 'بدأ حساب وتجميع درجات الأداء في الخلفية (ProcessPerformanceJob)...' 
            : 'Consolidated performance scores calculation started in the background (ProcessPerformanceJob)...');
        
        setTimeout(() => {
            setIsConsolidating(false);
            alert(isAr 
                ? 'اكتمل الحساب وتنشيط تحليل الذكاء الاصطناعي بنجاح!' 
                : 'Consolidation calculation and AI analysis completed successfully!');
        }, 2000);
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

                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>{isAr ? 'اسم الدورة' : 'Cycle Name'}</th>
                                <th>{isAr ? 'فترة التقييم' : 'Duration Period'}</th>
                                <th>{isAr ? 'الموظفون المشمولون' : 'Tracked Employees'}</th>
                                <th>{isAr ? 'الحالة' : 'Status'}</th>
                                <th>{isAr ? 'حالة حساب العمليات الخلفية' : 'Background Job Score State'}</th>
                                <th style={{ textAlign: 'right' }}>{isAr ? 'العمليات' : 'Operations'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cycles.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 700, color: c.status === 'active' ? 'var(--primary-color)' : 'inherit' }}>
                                        {isAr ? c.nameAr : c.nameEn}
                                    </td>
                                    <td>{isAr ? c.periodAr : c.periodEn}</td>
                                    <td>{c.employees > 0 ? `${c.employees} ${isAr ? 'موظفين' : 'Employees'}` : '--'}</td>
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
                                                {isAr ? c.jobStateAr : c.jobStateEn}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {c.status === 'active' ? (
                                            <button className="btn btn-primary btn-sm" onClick={handleRunCalc} disabled={isConsolidating}>
                                                <i className="fa-solid fa-calculator"></i>
                                                <span>{isAr ? 'حساب تجريبي' : 'Run Mock Calc'}</span>
                                            </button>
                                        ) : c.status === 'closed' ? (
                                            <button className="btn btn-secondary btn-sm" onClick={() => alert(isAr ? 'عرض نتائج وتفاصيل تجميع درجات دورة Q4 25...' : 'Displaying consolidated analytical dashboard for Q4 2025...')}>
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
                            ))}
                        </tbody>
                    </table>
                </div>
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
        </div>
    );
};

export default PerformanceCycles;
