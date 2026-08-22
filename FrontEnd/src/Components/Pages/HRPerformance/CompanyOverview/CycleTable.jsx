import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { activatePerformanceCycle, closePerformanceCycle } from "../../../../services/PerformanceHrService";

export default function CycleTable({ cycles = [], onRefresh }) {
    const { t } = useTranslation("HrPerformance/CompanyOverview");
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const handleActivate = async (cycleId) => {
        if (!window.confirm('هل تريد بالتأكيد تفعيل دورة الأداء هذه؟')) return;
        try {
            setActionLoadingId(cycleId);
            await activatePerformanceCycle(cycleId);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error("Failed to activate cycle:", err);
            alert("تعذر تفعيل الدورة.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleClose = async (cycleId) => {
        if (!window.confirm('هل تريد بالتأكيد إغلاق هذه الدورة وحساب درجات الأداء لجميع الموظفين؟')) return;
        try {
            setActionLoadingId(cycleId);
            await closePerformanceCycle(cycleId);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error("Failed to close cycle:", err);
            alert("تعذر إغلاق الدورة.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="badge badge-cycle-active"><i className="fa-solid fa-circle-play"></i> {t("status.active") || 'Active'}</span>;
            case 'closed':
                return <span className="badge badge-cycle-closed">{t("status.closed") || 'Closed'}</span>;
            case 'processing':
                return <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}><i className="fa-solid fa-spinner fa-spin"></i> {t("status.processing") || 'Processing'}</span>;
            case 'draft':
            default:
                return <span className="badge badge-cycle-draft">{t("status.draft") || 'Draft'}</span>;
        }
    };

    const getBgState = (status) => {
        switch (status) {
            case 'active': return t("bg_state.active") || 'Awaiting final closing to calculate';
            case 'processing': return t("bg_state.processing") || 'Processing AI & consolidating scores...';
            case 'closed': return t("bg_state.closed") || 'Processed successfully';
            case 'draft':
            default: return t("bg_state.draft") || 'Unopened / Draft';
        }
    };

    return (
        <div className="card">
            <div className="card-title">
                <span>{t("cycle.Active")}</span>
                <span><i className="fa-solid fa-circle-check"></i> {t("cycle.Job")}</span>
            </div>

            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>{t("cycle.Cycle")}</th>
                            <th>{t("cycle.Duration")}</th>
                            <th>{t("cycle.Tracked")}</th>
                            <th>{t("cycle.Status")}</th>
                            <th>{t("cycle.Background")}</th>
                            <th>{t("cycle.Operations")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cycles.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                    {t("no_cycles") || 'لا توجد دورات مسجلة حالياً'}
                                </td>
                            </tr>
                        ) : (
                            cycles.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                                    <td>{c.start_date || '-'} → {c.end_date || '-'}</td>
                                    <td>{c.template_name || 'Standard Matrix'}</td>
                                    <td>{getStatusBadge(c.status)}</td>
                                    <td>
                                        <div>
                                            <span>{getBgState(c.status)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {c.status === 'draft' && (
                                                <button 
                                                    className="btn btn-start-cycle btn-edit-cycle" 
                                                    disabled={actionLoadingId === c.id}
                                                    onClick={() => handleActivate(c.id)}
                                                >
                                                    {actionLoadingId === c.id ? <i className="fa-solid fa-spinner fa-spin"></i> : (t("btn_activate") || 'تفعيل الدورة')}
                                                </button>
                                            )}
                                            {c.status === 'active' && (
                                                <button 
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ backgroundColor: '#ef4444', color: '#fff' }}
                                                    disabled={actionLoadingId === c.id}
                                                    onClick={() => handleClose(c.id)}
                                                >
                                                    {actionLoadingId === c.id ? <i className="fa-solid fa-spinner fa-spin"></i> : (t("btn_close") || 'إغلاق وحساب')}
                                                </button>
                                            )}
                                            {c.status === 'closed' && (
                                                <button className="btn btn-secondary btn-sm" disabled>
                                                    <i className="fa-solid fa-lock"></i> {t("btn_locked") || 'Locked'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}