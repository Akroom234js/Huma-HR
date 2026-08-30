import React, { useState, useEffect, useCallback } from 'react';
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import "./DepartmentOverview.css";
import apiClient from "../../../../apiConfig";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../../Notification/NotificationContext";
import DashboardLoader from "../../../Shared/DashboardLoader/DashboardLoader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2563eb", "#60a5fa", "#3b82f6", "#93c5fd", "#bfdbfe", "#dbeafe"];

const DepartmentOverview = () => {
  const { t, i18n } = useTranslation('Department/DepartmentOverview');
  const isAr = i18n?.language === 'ar';
  const { showSuccess, showError } = useNotification();

  const [stats, setStats] = useState({
    distribution: [],
    budget: [],
    tableData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/departments/stats');
      setStats(res.data?.data || { distribution: [], budget: [], tableData: [] });
    } catch (error) {
      console.error("Failed to fetch department stats", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDeleteDepartment = async (id, name) => {
    if (!id) return;
    if (window.confirm(t('confirm-delete', { name }) || `Are you sure you want to delete department "${name}"?`)) {
      try {
        await apiClient.delete(`/departments/${id}`);
        showSuccess(t('toast-delete-success') || `Department "${name}" deleted successfully.`);
        fetchStats();
      } catch (error) {
        showError(error, t('toast-delete-error') || "Failed to delete department");
      }
    }
  };

  const totalDepts = stats.tableData.length;
  const totalEmployees = stats.distribution.reduce((acc, curr) => acc + curr.value, 0);
  const avgEmployees = totalDepts > 0 ? (totalEmployees / totalDepts).toFixed(1) : 0;

  const highestHeadcountItem = stats.distribution.length > 0
    ? [...stats.distribution].sort((a, b) => b.value - a.value)[0]
    : { name: '—', value: 0 };

  const totalBudget = stats.budget.reduce((acc, curr) => acc + (curr.budget || 0), 0);

  return (
    <div className={`page-container ${isAr ? 'rtl' : 'ltr'}`}>
      <div className="page-title">
        <h2>{t('page-title')}</h2>
        <div className="sm-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>
      <div className="container-subcard">
        <div className="subcart1">
          <h6>{t('total-departments')}</h6>
          <h2>{totalDepts}</h2>
        </div>
        <div className="subcart1">
          <h6>{t('avg-employees')}</h6>
          <h2>{avgEmployees}</h2>
        </div>
        <div className="subcart1">
          <h6>{t('highest-headcount')}</h6>
          <h2>{highestHeadcountItem.name} ({highestHeadcountItem.value})</h2>
        </div>
        <div className="subcart1">
          <h6>{t('total-budget')}</h6>
          <h2>${totalBudget.toLocaleString()}</h2>
        </div>
      </div>
      <div className="chart1">
        <div className="charts-wrapper">
          <div className="card">
            <h6>{t('chart-distribution-title')}</h6>
            <ResponsiveContainer width="100%" height={"100%"}>
              <BarChart data={stats.distribution}>
                <XAxis dataKey="name" />
                <YAxis hide axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card donut">
            <h6>{t('chart-budget-title')}</h6>
            <ResponsiveContainer width="100%" height={"100%"}>
              <PieChart>
                <Pie
                  data={stats.budget}
                  dataKey="budget"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {stats.budget.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="custom-legend">
              {stats.budget.slice(0, 5).map((item, i) => (
                <div key={i} className="legend-item">
                  <div className="legend-left">
                    <span
                      className="legend-color"
                      style={{
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    ></span>
                    {item.name}
                  </div>
                  <span>{totalBudget > 0 ? (((item.budget || 0) / totalBudget) * 100).toFixed(1) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="table-card">
        <table className="department-table">
          <thead>
            <tr>
              <th>{t('th-dept-name')}</th>
              <th>{t('th-dept-head')}</th>
              <th>{t('th-employees')}</th>
              <th>{t('th-open-positions')}</th>
              <th>{t('th-annual-budget')}</th>
              <th style={{ textAlign: 'center' }}>{t('th-actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                  <DashboardLoader text={t('loading')} size="md" />
                </td>
              </tr>
            ) : stats.tableData.length > 0 ? (
              stats.tableData.map((dept, idx) => (
                <tr key={dept.id || idx}>
                  <td><strong>{dept.name}</strong></td>
                  <td>{dept.head || '—'}</td>
                  <td>{dept.count}</td>
                  <td>{dept.openPositions}</td>
                  <td>{dept.budget}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      type="button" 
                      className="dept-delete-btn"
                      onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                      title={t('delete') || "Delete Department"}
                      aria-label={`Delete ${dept.name}`}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary, #64748b)' }}>
                  {t('no-data')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentOverview;
