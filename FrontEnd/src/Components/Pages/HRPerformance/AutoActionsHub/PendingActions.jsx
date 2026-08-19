import React from "react";
import { useTranslation } from "react-i18next";
import DecisionBadge from '../../../Shared/Performance/DecisionBadge/DecisionBadge';

export default function PendingActions({ actions = [], onApprove, onReject }) {
    const { t } = useTranslation("HrPerformance/AutoActionsHub");

    return (
        <div className="card">
            <div className="card-title">
                <span>{t("pending.Pending")} ({actions.length})</span>
            </div>

            <div className="table-wrapper">
                <table className="custom-table" id="actionsTable">
                    <thead>
                        <tr>
                            <th>{t("pending.Type")}</th>
                            <th>{t("pending.Employee")}</th>
                            <th>{t("pending.Department")}</th>
                            <th>{t("pending.Grade")}</th>
                            <th>{t("pending.Recommendation")}</th>
                            <th>{t("pending.Date")}</th>
                            <th>{t("pending  Operations") || 'Operations'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actions.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                    لا توجد إجراءات معلقة بانتظار الموافقة حالياً
                                </td>
                            </tr>
                        ) : (
                            actions.map((act) => {
                                const empName = act.employee?.name || '-';
                                const deptName = act.cycle?.title || '-';
                                const grade = act.final_score ?? '-';
                                const dateStr = act.created_at ? act.created_at.substring(0, 10) : '-';

                                return (
                                    <tr key={act.id}>
                                        <td>
                                            <DecisionBadge decision={act.action_type} />
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{empName}</td>
                                        <td>{deptName}</td>
                                        <td>{grade}</td>
                                        <td>{act.details || act.action_type?.replace('_', ' ')}</td>
                                        <td>{dateStr}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button 
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => onApprove && onApprove(act.id)}
                                                >
                                                    <i className="fa-solid fa-circle-check"></i> Approve
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => onReject && onReject(act.id)}
                                                >
                                                    <i className="fa-solid fa-circle-xmark"></i> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}