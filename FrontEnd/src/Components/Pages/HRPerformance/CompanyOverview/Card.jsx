import React from "react";
import { useTranslation } from "react-i18next";

export default function Card({ stats }) {
    const { t } = useTranslation("HrPerformance/CompanyOverview");

    const deptCount = stats?.department_averages?.length || 0;
    const avgScore = stats?.avg_score !== null && stats?.avg_score !== undefined 
        ? `${stats.avg_score} / 100` 
        : (stats?.completion_rate ? `${stats.completion_rate}%` : '0 / 100');
    
    // Total tasks pool
    const tasksCount = stats?.tasks 
        ? (stats.tasks.pending + stats.tasks.in_progress + stats.tasks.pending_review + stats.tasks.needs_revision + stats.tasks.scored)
        : 0;

    const pendingActions = stats?.pending_actions ?? 0;

    return (
        <div className="stats-grid-hr">
            <div className="stat-card-hr blue">
                <i className="fa-solid fa-circle-nodes stat-icon-hr"></i>
                <div className="stat-label-hr">{t('card.Departments')}</div>
                <div className="stat-value-hr">{deptCount}</div>
                <div className="stat-desc-hr">
                    {stats?.department_averages?.map(d => d.department_name).filter(Boolean).slice(0, 4).join(', ') || 'All Company Divisions'}
                </div>
            </div>

            <div className="stat-card-hr emerald">
                <i className="fa-solid fa-gauge-high stat-icon-hr"></i>
                <div className="stat-label-hr">{t('card.Score')}</div>
                <div className="stat-value-hr">{avgScore}</div>
                <div className="stat-desc-hr gre">
                    <i className="fa-solid fa-chart-line"></i> {stats?.active_cycle?.title || 'Consolidated Average'}
                </div>
            </div>

            <div className="stat-card-hr purple">
                <i className="fa-solid fa-network-wired stat-icon-hr"></i>
                <div className="stat-label-hr">{t("card.Pool")}</div>
                <div className="stat-value-hr">{tasksCount} {t("card.Task")}</div>
                <div className="stat-desc-hr">{t('card.supervisor')}</div>
            </div>

            <div className="stat-card-hr pink">
                <i className="fa-solid fa-circle-exclamation stat-icon-hr"></i>
                <div className="stat-label-hr">{t('card.Requires')}</div>
                <div className="stat-value-hr">{pendingActions} {t("card.Employees")}</div>
                <div className="stat-desc-hr">{t("card.gaps")}</div>
            </div>
        </div>
    );
}