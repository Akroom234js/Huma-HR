import React, { useState, useEffect } from "react";
import "./Performance.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getMyEvaluation, getMyTasks } from "../../../../services/performanceService";

export default function PerformanceManagement() {
  const { t, i18n } = useTranslation('EmployeePortal/PerformanceOverview');
  const isAr = i18n ? i18n.language === 'ar' : false;
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evalRes, tasksRes] = await Promise.allSettled([
          getMyEvaluation(),
          getMyTasks(),
        ]);

        if (evalRes.status === 'fulfilled') {
          const evalData = evalRes.value?.data?.data || evalRes.value?.data;
          setEvaluation(evalData || null);
        }

        if (tasksRes.status === 'fulfilled') {
          const taskData = tasksRes.value?.data?.data || tasksRes.value?.data || [];
          setTasks(Array.isArray(taskData) ? taskData : []);
        }
      } catch (err) {
        console.error("Failed to load performance overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [i18n.language]);

  const finalScore = evaluation?.final_score !== null && evaluation?.final_score !== undefined
    ? Number(evaluation.final_score).toFixed(1)
    : (tasks.length > 0
        ? (tasks.filter(t => t.final_score).reduce((acc, t) => acc + Number(t.final_score), 0) / (tasks.filter(t => t.final_score).length || 1)).toFixed(1)
        : "8.5");

  const ratingLabel = Number(finalScore) >= 90 
    ? (t('ratingLabels.excellent', { defaultValue: isAr ? 'ممتاز' : 'Excellent' }))
    : Number(finalScore) >= 75
    ? (t('ratingLabels.veryGood', { defaultValue: isAr ? 'جيد جداً' : 'Very Good' }))
    : (t('ratingLabels.good', { defaultValue: isAr ? 'جيد' : 'Good' }));

  return (
    <div className={`performance-page ${isAr ? 'rtl' : 'ltr'}`}>
      <div className="performance-header-wrapper">
        <div className="title-group">
          <i className="bi bi-graph-up-arrow header-icon"></i>
          <h1 className="page-title">{t('title')}</h1>
        </div>
        <div className="sm-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>

      <div className="performance-grid">
        {/* Total Score Card */}
        <div className="card total-score-card">
          <div className="card-title-group">
            <i className="bi bi-award-fill card-icon"></i>
            <h2>{t('totalScore')}</h2>
          </div>

          <div className="score-box">
            <span className="score">{finalScore}</span>
            <span className="score-total">{t('outOfTen', { defaultValue: '/ 100' })}</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, Number(finalScore)))}%` }}></div>
          </div>

          <p className="rating-desc-text">
            {t('ratingDesc')}
            <br />
            <strong className="rating-highlight">{ratingLabel}</strong>
          </p>
        </div>

        {/* Evaluation Summary Card */}
        <div className="card evaluation-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <i className="bi bi-bar-chart-line-fill card-icon"></i>
              <h2>{t('evaluations')}</h2>
            </div>
            <button 
              type="button" 
              className="btn-link-action"
              onClick={() => navigate('/portal/performance/report')}
            >
              {t('details')} <i className={`bi ${isAr ? 'bi-arrow-left' : 'bi-arrow-right'} ms-1`}></i>
            </button>
          </div>

          <div className="evaluation-chart">
            <div className="evaluation-breakdown-list">
              <div className="eval-metric-row">
                <span className="eval-metric-label">
                  <i className="bi bi-check2-square me-1"></i> {t('tasksCompletion', { defaultValue: isAr ? 'إنجاز المهام' : 'Tasks Delivery' })}
                </span>
                <span className="eval-metric-val">{evaluation?.scores?.tasks ?? 85}%</span>
              </div>
              <div className="progress-bar-subtle">
                <div className="progress-fill-subtle" style={{ width: `${evaluation?.scores?.tasks ?? 85}%` }}></div>
              </div>

              <div className="eval-metric-row">
                <span className="eval-metric-label">
                  <i className="bi bi-person-badge me-1"></i> {t('managerRating', { defaultValue: isAr ? 'تقييم المدير' : 'Manager Evaluation' })}
                </span>
                <span className="eval-metric-val">{evaluation?.scores?.manager ?? 90}%</span>
              </div>
              <div className="progress-bar-subtle">
                <div className="progress-fill-subtle" style={{ width: `${evaluation?.scores?.manager ?? 90}%` }}></div>
              </div>

              <div className="eval-metric-row">
                <span className="eval-metric-label">
                  <i className="bi bi-people me-1"></i> {t('peerScore', { defaultValue: isAr ? 'تقييم الأقران 360' : '360 Peer Review' })}
                </span>
                <span className="eval-metric-val">{evaluation?.scores?.peer ?? 80}%</span>
              </div>
              <div className="progress-bar-subtle">
                <div className="progress-fill-subtle" style={{ width: `${evaluation?.scores?.peer ?? 80}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Tasks & Quick Actions */}
        <div className="row-grid-2">
          {/* Active Deliverables Card */}
          <div className="card cumulative-card">
            <div className="card-header-flex mb-3">
              <div className="card-title-group">
                <i className="bi bi-list-task card-icon"></i>
                <h2>{t('activeTasks', { defaultValue: isAr ? 'أحدث المهام المكلف بها' : 'Recent Assigned Tasks' })}</h2>
              </div>
              <button 
                type="button" 
                className="btn-link-action"
                onClick={() => navigate('/portal/performance')}
              >
                {t('viewAll', { defaultValue: isAr ? 'عرض الكل' : 'View All' })}
              </button>
            </div>

            <div className="table-responsive">
              <table className="cumulative-table">
                <thead>
                  <tr>
                    <th>{t('taskTitle', { defaultValue: isAr ? 'المهمة' : 'Task' })}</th>
                    <th>{t('dueDate', { defaultValue: isAr ? 'تاريخ التسليم' : 'Due Date' })}</th>
                    <th>{t('table.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted, #9ca3af)' }}>
                        {t('noTasksYet', { defaultValue: isAr ? 'لا توجد مهام حالية' : 'No tasks assigned yet.' })}
                      </td>
                    </tr>
                  ) : (
                    tasks.slice(0, 4).map(taskItem => (
                      <tr key={taskItem.id}>
                        <td className="task-title-cell">{taskItem.title}</td>
                        <td>{taskItem.due_date || '-'}</td>
                        <td>
                          <span className={`badge-pill-status ${taskItem.status}`}>
                            {taskItem.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & 360 Review Card */}
          <div className="card rating-card">
            <div className="card-title-group mb-3">
              <i className="bi bi-lightning-charge-fill card-icon"></i>
              <h2>{t('quickActions', { defaultValue: isAr ? 'الوصول السريع' : 'Quick Actions' })}</h2>
            </div>

            <div className="quick-action-items-list">
              <div className="quick-action-item" onClick={() => navigate('/portal/performance/peer-review')}>
                <div className="action-icon-box">
                  <i className="bi bi-person-check-fill"></i>
                </div>
                <div className="action-info">
                  <h4>{t('peerReviewAction', { defaultValue: isAr ? 'تقييم زميل في القسم' : 'Submit Peer Review' })}</h4>
                  <p>{t('peerReviewActionDesc', { defaultValue: isAr ? 'شارك رأيك في أداء زملائك بسرية وأمان' : 'Provide anonymous 360 feedback to peers' })}</p>
                </div>
                <i className={`bi ${isAr ? 'bi-chevron-left' : 'bi-chevron-right'} arrow-icon`}></i>
              </div>

              <div className="quick-action-item" onClick={() => navigate('/portal/performance/report')}>
                <div className="action-icon-box">
                  <i className="bi bi-file-earmark-bar-graph-fill"></i>
                </div>
                <div className="action-info">
                  <h4>{t('reportAction', { defaultValue: isAr ? 'تقرير التقييم الشامل' : 'Full Evaluation Report' })}</h4>
                  <p>{t('reportActionDesc', { defaultValue: isAr ? 'اطلع على تحليلات الذكاء الاصطناعي والتوصيات' : 'Review AI analysis & career insights' })}</p>
                </div>
                <i className={`bi ${isAr ? 'bi-chevron-left' : 'bi-chevron-right'} arrow-icon`}></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
