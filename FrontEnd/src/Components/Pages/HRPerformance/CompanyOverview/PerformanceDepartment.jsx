import React from "react";
import { useTranslation } from "react-i18next";

export default function PerformanceDepartment({ deptAverages }) {
    const { t } = useTranslation("HrPerformance/CompanyOverview");

    const depts = (deptAverages && Array.isArray(deptAverages))
        ? deptAverages.map(d => ({
            name: d.department_name || 'Department',
            score: Number(d.avg_score) || 0
        }))
        : [];

    return (
        <div className="card">
            <div className="card-title">{t("bartitle")}</div>
            <div className="bar-chart-container">
                {depts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        لا توجد بيانات أداء للأقسام مسجلة حالياً
                    </div>
                ) : (
                    depts.map((d, index) => {
                        const widthPercent = `${Math.min(100, Math.max(0, d.score))}%`;
                        return (
                            <div key={index} className="bar-row">
                                <div className="bar-label">{d.name}</div>
                                <div className="bar-fill-track">
                                    <div className="bar-fill-amount" style={{ width: widthPercent }}></div>
                                </div>
                                <div className="bar-value">{d.score}%</div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}