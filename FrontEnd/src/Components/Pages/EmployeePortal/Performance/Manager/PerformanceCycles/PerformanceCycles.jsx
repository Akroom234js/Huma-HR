import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PerformanceCycles.css';
import CycleResultsModal from './CycleResultsModal';
import { useTranslation } from 'react-i18next';
import { getPerformanceCycles } from '../../../../../../services/performanceService';

const PerformanceCycles = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation('EmployeePortal/PerformanceCycles');
    const isAr = i18n ? i18n.language === 'ar' : false;

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
    }, [i18n.language]);

    const getJobStateText = (status) => {
        switch (status) {
            case 'active':
                return t('jobStates.active');
            case 'processing':
                return t('jobStates.processing');
            case 'closed':
            case 'completed':
                return t('jobStates.closed');
            case 'draft':
            default:
                return t('jobStates.draft');
        }
    };

    return (
        <div className={`performance-cycles-management ${isAr ? 'rtl' : 'ltr'}`}>
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

            {/* Cycles Table */}
            <div className="card">
                <div className="card-title">
                    <span>{t('cyclesCardTitle')}</span>
                    <span className="card-subtitle-small">
                        <i className="fa-solid fa-circle-check font-green"></i> 
                        {` ${t('queueEngineOnline')}`}
                    </span>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}></i>
                        {t('loading')}
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>{t('table.cycleName')}</th>
                                    <th>{t('table.durationPeriod')}</th>
                                    <th>{t('table.template')}</th>
                                    <th>{t('table.status')}</th>
                                    <th>{t('table.jobScoreState')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('table.operations')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cycles.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                                            {t('noCyclesFound')}
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
                                                <td>{c.template_name || t('table.defaultTemplate')}</td>
                                                <td>
                                                    {c.status === 'active' && (
                                                        <span className="badge badge-cycle-active">
                                                            <i className="fa-solid fa-circle-play pulse-dot-active"></i>
                                                            <span>{t('statuses.active')}</span>
                                                        </span>
                                                    )}
                                                    {(c.status === 'closed' || c.status === 'completed') && (
                                                        <span className="badge badge-cycle-closed">
                                                            <span>{t('statuses.closed')}</span>
                                                        </span>
                                                    )}
                                                    {c.status === 'processing' && (
                                                        <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                                            <span>{t('statuses.processing')}</span>
                                                        </span>
                                                    )}
                                                    {c.status === 'draft' && (
                                                        <span className="badge badge-cycle-draft">
                                                            <span>{t('statuses.draft')}</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="job-state-cell">
                                                        <span className={`state-indicator-dot ${c.status}`}></span>
                                                        <span style={{ 
                                                            fontSize: '13px', 
                                                            color: (c.status === 'closed' || c.status === 'completed') ? 'var(--color-scored)' : 'var(--text-secondary)',
                                                            fontWeight: (c.status === 'closed' || c.status === 'completed') ? 600 : 'normal'
                                                        }}>
                                                            {getJobStateText(c.status)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {c.status === 'active' ? (
                                                        <button className="btn btn-secondary btn-sm disabled-opacity" disabled>
                                                            <i className="fa-solid fa-clock"></i>
                                                            <span>{t('table.calculatedOnClose')}</span>
                                                        </button>
                                                    ) : (c.status === 'closed' || c.status === 'completed') ? (
                                                        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCycle(c)}>
                                                            <i className="fa-solid fa-chart-line"></i>
                                                            <span>{t('table.viewResults')}</span>
                                                        </button>
                                                    ) : (
                                                        <button className="btn btn-secondary btn-sm disabled-opacity" disabled>
                                                            <i className="fa-solid fa-lock"></i>
                                                            <span>{t('table.locked')}</span>
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
                    {t('workersTitle')}
                </div>
                <div className="workers-grid">
                    <div className="worker-monitor-card">
                        <div className="worker-header">
                            <span className="worker-name">ProcessPerformanceJob</span>
                            <span className="badge badge-scored btn-sm">{t('idleBadge')}</span>
                        </div>
                        <p className="worker-desc">
                            {t('workers.processDesc')}
                        </p>
                    </div>

                    <div className="worker-monitor-card">
                        <div className="worker-header">
                            <span className="worker-name">TriggerAIAnalysisJob</span>
                            <span className="badge badge-scored btn-sm">{t('idleBadge')}</span>
                        </div>
                        <p className="worker-desc">
                            {t('workers.aiDesc')}
                        </p>
                    </div>

                    <div className="worker-monitor-card">
                        <div className="worker-header">
                            <span className="worker-name">ExecutePerformanceActionsJob</span>
                            <span className="badge badge-scored btn-sm">{t('idleBadge')}</span>
                        </div>
                        <p className="worker-desc">
                            {t('workers.actionsDesc')}
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
