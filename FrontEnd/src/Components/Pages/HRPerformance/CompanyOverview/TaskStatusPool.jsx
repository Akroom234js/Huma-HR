import React from "react";
import { useTranslation } from "react-i18next";

export default function TaskStatusPool({ taskStats }) {
    const { t } = useTranslation("HrPerformance/CompanyOverview");

    const scored = taskStats?.scored || 0;
    const inProgress = taskStats?.in_progress || 0;
    const review = taskStats?.pending_review || 0;
    const unstarted = taskStats?.pending || 0;
    const revision = taskStats?.needs_revision || 0;

    const total = scored + inProgress + review + unstarted + revision || 1;

    const pScored = Math.round((scored / total) * 100);
    const pProgress = Math.round((inProgress / total) * 100);
    const pReview = Math.round((review / total) * 100);
    const pUnstarted = Math.round((unstarted / total) * 100);
    const pRevision = 100 - (pScored + pProgress + pReview + pUnstarted);

    const s1 = pScored;
    const s2 = s1 + pProgress;
    const s3 = s2 + pReview;
    const s4 = s3 + pUnstarted;

    return (
        <div className="card">
            <div className="card-title">{t('pie.StatusPool')}</div>
            <div className="pie-chart-mock-hr">
                <div
                    className="pie-circle-hr"
                    style={{
                        background: `conic-gradient(
                            var(--color-scored) 0% ${s1}%,
                            var(--color-progress) ${s1}% ${s2}%,
                            var(--color-review) ${s2}% ${s3}%,
                            var(--color-pending) ${s3}% ${s4}%,
                            var(--color-revision) ${s4}% 100%
                        )`
                    }}
                ></div>

                <div className="chart-legend-hr">
                    <div className="legend-item-hr">
                        <span className="legend-dot-hr Scored"></span>
                        <span>{t("pie.Scored")} ({scored})</span>
                    </div>
                    <div className="legend-item-hr">
                        <span className="legend-dot-hr Progress"></span>
                        <span>{t("pie.Progress")} ({inProgress})</span>
                    </div>
                    <div className="legend-item-hr">
                        <span className="legend-dot-hr Review"></span>
                        <span>{t("pie.Review")} ({review})</span>
                    </div>
                    <div className="legend-item-hr">
                        <span className="legend-dot-hr Unstarted"></span>
                        <span>{t("Unstarted")} ({unstarted})</span>
                    </div>
                    <div className="legend-item-hr">
                        <span className="legend-dot-hr Revision"></span>
                        <span>{t("Revision")} ({revision})</span>
                    </div>
                </div>
            </div>
        </div>
    );
}