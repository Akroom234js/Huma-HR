import React from "react";
import "./Performance.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";

export default function PerformanceManagement() {
  const { t, i18n } = useTranslation('EmployeePortal/PerformanceOverview');
  const isAr = i18n ? i18n.language === 'ar' : false;

  return (
    <div className={`performance-page ${isAr ? 'rtl' : 'ltr'}`}>
      <h1 className="page-title">{t('title')}</h1>

      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="performance-grid">
        <div className="card total-score-card">
          <h2>{t('totalScore')}</h2>

          <div className="score-box">
            <span className="score">8.5</span>
            <span className="score-total">{t('outOfTen')}</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          <p>
            {t('ratingDesc')}
            <br />
            <strong>{t('excellent')}</strong>
          </p>
        </div>

        <div className="card evaluation-card">
          <h2>{t('evaluations')}</h2>

          <div className="evaluation-chart">
            <div className="bars">
              <div className="bar" style={{ height: "60%" }}></div>
              <div className="bar" style={{ height: "75%" }}></div>
              <div className="bar active" style={{ height: "90%" }}></div>
              <div className="bar" style={{ height: "70%" }}></div>
              <div className="bar" style={{ height: "85%" }}></div>
            </div>

            <div className="chart-labels">
              <span>{t('months.jan')}</span>
              <span>{t('months.feb')}</span>
              <span>{t('months.mar')}</span>
              <span>{t('months.apr')}</span>
              <span>{t('months.may')}</span>
            </div>
          </div>
        </div>

        <div className="row-flex">
          <div className="card cumulative-card">
            <h2>{t('cumulative')}</h2>

            <table className="cumulative-table">
              <thead>
                <tr>
                  <th>{t('table.period')}</th>
                  <th>{t('table.yourScore')}</th>
                  <th>{t('table.benchmark')}</th>
                  <th>{t('table.status')}</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Q1 2024</td>
                  <td>8.2</td>
                  <td>7.5</td>
                  <td className="green">{t('table.onTrack')}</td>
                </tr>

                <tr>
                  <td>Q2 2024</td>
                  <td>8.5</td>
                  <td>7.8</td>
                  <td className="green">{t('table.exceeding')}</td>
                </tr>

                <tr>
                  <td>Q3 2024</td>
                  <td>8.7</td>
                  <td>8.0</td>
                  <td className="green">{t('table.exceeding')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card rating-card">
            <h2>{t('rating')}</h2>

            <div className="rating-item">
              <h3>{t('managerRating')}</h3>

              <div className="rating-row">
                <span className="badge">Excellent</span>
                <span>Score: 9.0/10</span>
              </div>
            </div>

            <div className="rating-item">
              <h3>{t('systemRating')}</h3>

              <div className="rating-row">
                <span className="badge">Good</span>
                <span>Score: 8.3/10</span>
              </div>
            </div>

            <button className="details-btn">{t('details')}</button>
          </div>
        </div>

        <div className="row-flex">
          <div className="card trend-card">
            <h2>{t('trend')}</h2>

            <div className="trend-chart">
              <svg viewBox="0 0 300 120" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  points="0,90 50,70 100,80 150,40 200,50 250,20 300,35"
                />
              </svg>

              <div className="chart-labels">
                <span>{t('days.mon')}</span>
                <span>{t('days.tue')}</span>
                <span>{t('days.wed')}</span>
                <span>{t('days.thu')}</span>
                <span>{t('days.fri')}</span>
                <span>{t('days.sat')}</span>
              </div>
            </div>
          </div>

          <div className="card courses-card">
            <div className="courses-header">
              <h2>{t('suggestedCourses')}</h2>

              <button>{t('suggestBtn')}</button>
            </div>

            <div className="course-item">
              <span>{t('courses.comm')}</span>
              <span>4 {t('hours')}</span>
            </div>

            <div className="course-item">
              <span>{t('courses.pm')}</span>
              <span>8 {t('hours')}</span>
            </div>

            <div className="course-item">
              <span>{t('courses.leadership')}</span>
              <span>12 {t('hours')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
