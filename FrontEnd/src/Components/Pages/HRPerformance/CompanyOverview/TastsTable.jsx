import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import StatusBadge from "../../../Shared/Performance/StatusBadge/StatusBadge";

export default function TasksTable({ tasks = [] }) {
    const { t } = useTranslation("HrPerformance/CompanyOverview");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    // Extract unique departments
    const departments = Array.from(new Set(tasks.map(t => t.employee?.department?.name).filter(Boolean)));

    const filteredTasks = tasks.filter(task => {
        const titleMatch = (task.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (task.employee?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const deptMatch = !selectedDept || task.employee?.department?.name === selectedDept;
        return titleMatch && deptMatch;
    });

    return (
        <div className="card-hr">
            <div className="card-title-hr">
                <span>{t("table.Tasks")}</span>
                <span><i className="fa-solid fa-lock"></i> {t("table.view")}</span>
            </div>

            {/* Filter */}
            <div className="filter-bar">
                <div className="search-wrapper">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder={t("table.title")} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <span className="filter-label">{t("table.Department")}</span>
                    <select 
                        className="select-input" 
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        <option value="">{t("table.All") || 'All Departments'}</option>
                        {departments.map((dept, index) => (
                            <option key={index} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>{t("table.Task")}</th>
                            <th>{t("table.Employee")}</th>
                            <th>{t("table.Department")}</th>
                            <th>{t("table.Supervisor")}</th>
                            <th>{t("table.Date")}</th>
                            <th>{t("table.Status")}</th>
                            <th>{t("table.Grade")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                    لا توجد مهام مطابقة لخيارات البحث
                                </td>
                            </tr>
                        ) : (
                            filteredTasks.map((task) => (
                                <tr key={task.id}>
                                    <td style={{ fontWeight: 600 }}>{task.title}</td>
                                    <td>{task.employee?.name || task.employee?.full_name || '-'}</td>
                                    <td>{task.employee?.department?.name || '-'}</td>
                                    <td>{task.assigned_by?.name || '-'}</td>
                                    <td>{task.due_date || '-'}</td>
                                    <td>
                                        <StatusBadge status={task.status} />
                                    </td>
                                    <td className={task.final_score !== null ? "Scored-text" : "gray-text"}>
                                        {task.final_score !== null && task.final_score !== undefined 
                                            ? `${task.final_score}/100` 
                                            : (task.status === 'pending_review' ? 'Grading...' : '-')}
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