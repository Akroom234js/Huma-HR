import React from "react";
import { useTranslation } from "react-i18next";
import DecisionBadge from '../../../Shared/Performance/DecisionBadge/DecisionBadge';

export default function ActionsLog({ logs = [] }) {
    const { t } = useTranslation("HrPerformance/AutoActionsHub");

    return (
        <div className="card">
            <div className="card-title">{t("log.title")}</div>
            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>{t("log.Action")}</th>
                            <th>{t("log.Employee")}</th>
                            <th>{t("log.Date")}</th>
                            <th>{t("log.Decided")}</th>
                            <th>{t("log.Status")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                    {t("no_logs") || 'لا يوجد سجل إجراءات سابقة حتى الآن'}
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => {
                                const isApproved = log.status === 'approved';
                                const empName = log.employee?.name || '-';
                                const approverName = log.approved_by?.name || '-';
                                const dateStr = log.approved_at ? log.approved_at.substring(0, 10) : (log.created_at ? log.created_at.substring(0, 10) : '-');

                                return (
                                    <tr key={log.id}>
                                        <td>
                                            <DecisionBadge decision={log.action_type} />
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{empName}</td>
                                        <td>{dateStr}</td>
                                        <td>{approverName}</td>
                                        <td className={isApproved ? "sco-status" : "text-danger"}>
                                            <i className={`fa-solid ${isApproved ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i> {isApproved ? (t("status_approved") || 'معتمد') : (t("status_rejected") || 'مرفوض')}
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