import React from "react";
import "./Dashboard.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { t, i18n } = useTranslation("EmployeePortal/Dashboard");
  const isAr = i18n ? i18n.language === "ar" : false;
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user?.name || user?.full_name || (isAr ? "الموظف" : "John Doe");

  return (
    <div className={`dashboard-page ${isAr ? "rtl" : "ltr"}`}>
      <div className="dashboard-header">
        <h1>{t("title")}</h1>
        <p>{isAr ? `مرحباً بك، ${userName}. إليك نظرة عامة على أدائك وبياناتك.` : `Welcome, ${userName}. Here is your overview.`}</p>
        <div className="em-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>

      <div className="top-cards">
        <div className="dashboard-card">
          <div className="card-top">
            <span>{t("leaveBalance")}</span>
            <span className="material-symbols-outlined card-icon">
              calendar_month
            </span>
          </div>

          <div className="card-bottom">
            <h2>14</h2>
            <p>{t("days")}</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span>{t("attendance")}</span>
            <span className="material-symbols-outlined card-icon">
              check_circle
            </span>
          </div>

          <div className="card-bottom">
            <h2>{t("present")}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span>{t("totalSalary")}</span>
            <span className="material-symbols-outlined card-icon">
              payments
            </span>
          </div>

          <div className="card-bottom">
            <h2>$7,500</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span>{t("performance")}</span>
            <span className="material-symbols-outlined card-icon">
              trending_up
            </span>
          </div>

          <div className="card-bottom">
            <h2>
              4.8 <small>/5.0</small>
            </h2>
          </div>
        </div>

        <div className="dashboard-card notification-card">
          <div className="card-top">
            <span>{t("notifications")}</span>
            <span className="material-symbols-outlined card-icon">
              notifications
            </span>
          </div>

          <ul className="notification-list">
            <li>{t("notif1")}</li>
            <li>{t("notif2")}</li>
            <li>{t("notif3")}</li>
            <li>{t("notif4")}</li>
            <li>{t("notif5")}</li>
          </ul>
        </div>
      </div>

      <div className="bottom-section">
        <div className="chart-card">
          <h3>{t("performanceEvolution")}</h3>
          <div className="chart-placeholder">
            <svg
              className="chart-svg"
              viewBox="0 0 600 300"
              preserveAspectRatio="none"
            >
              <polyline
                className="chart-path"
                points="40,230 140,180 240,200 340,120 440,150 540,70"
              />
              <circle cx="40" cy="230" r="6" className="chart-point" />
              <circle cx="140" cy="180" r="6" className="chart-point" />
              <circle cx="240" cy="200" r="6" className="chart-point" />
              <circle cx="340" cy="120" r="6" className="chart-point" />
              <circle cx="440" cy="150" r="6" className="chart-point" />
              <circle cx="540" cy="70" r="6" className="chart-point" />
            </svg>

            <div className="months">
              <span>{t("months.jan")}</span>
              <span>{t("months.feb")}</span>
              <span>{t("months.mar")}</span>
              <span>{t("months.apr")}</span>
              <span>{t("months.may")}</span>
              <span>{t("months.jun")}</span>
            </div>
          </div>
        </div>

        <div className="right-side2">
          <div className="quick-card">
            <h3>{t("quickActions")}</h3>
            <p>{t("needTimeOff")}</p>

            <button className="request" onClick={() => navigate("/portal/my-requests/leaves")}>
              <span className="material-symbols-outlined">add</span>
              {t("submitLeave")}
            </button>
          </div>

          <div className="request-card">
            <h3>{t("pendingRequests")}</h3>

            <table>
              <thead>
                <tr>
                  <th>{t("table.type")}</th>
                  <th>{t("table.date")}</th>
                  <th>{t("table.status")}</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>{t("table.vacation")}</td>
                  <td>2024-09-01</td>
                  <td>
                    <span className="pending">{t("table.pending")}</span>
                  </td>
                </tr>

                <tr>
                  <td>{t("table.sickLeave")}</td>
                  <td>2024-07-22</td>
                  <td>
                    <span className="rejected">{t("table.rejected")}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="extra-dashboard-wrapper">
        {/* ROW 1 */}
        <div className="extra-row">
          {/* Leave Overview */}
          <div className="extra-card">
            <h3>{t("leavesOverview")}</h3>

            <div className="info-row">
              <span>{t("leaveId")}</span>
              <strong>L-78923</strong>
            </div>

            <div className="info-row">
              <span>{t("leaveType")}</span>
              <strong>{t("annual")}</strong>
            </div>

            <div className="info-row">
              <span>{t("lastApplied")}</span>
              <strong>2024-03-10</strong>
            </div>

            <div className="info-row">
              <span>{t("lastLeaveType")}</span>
              <strong>{t("table.sickLeave")}</strong>
            </div>

            <button className="green-btn" onClick={() => navigate("/portal/my-requests/leaves")}>{t("details")}</button>
          </div>

          {/* Leave Balance */}
          <div className="extra-card">
            <h3>{t("leaveBalance")}</h3>

            <div className="leave-balance-box">
              <h2>14</h2>
              <span>{t("days")}</span>
            </div>

            <p className="leave-note">
              {t("leaveNote")}
            </p>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="salary-breakdown-card">
          <div className="salary-header">
            <h3>{t("salaryBreakdown")}</h3>

            <button className="download-btn" onClick={() => navigate("/portal/payroll")}>
              <span className="material-symbols-outlined">download</span>
              {t("download")}
            </button>
          </div>

          <div className="salary-boxes">
            <div className="salary-box">
              <span>{t("grossSalary")}</span>
              <h2>$7,500</h2>
            </div>

            <div className="salary-box">
              <span>{t("bonuses")}</span>
              <h2>$500</h2>
            </div>

            <div className="salary-box deduction">
              <span>{t("deductions")}</span>
              <h2>-$250</h2>
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="extra-row">
          {/* Attendance */}
          <div className="extra-card">
            <h3>{t("attendanceSummary")}</h3>

            <div className="info-row">
              <span>{t("dailyHours")}</span>
              <strong>8 hrs</strong>
            </div>

            <div className="info-row">
              <span>{t("daysPresent")}</span>
              <strong>19</strong>
            </div>

            <div className="info-row">
              <span>{t("daysAbsent")}</span>
              <strong className="danger-text">2</strong>
            </div>

            <button className="green-btn" onClick={() => navigate("/portal/my-requests/attendance")}>{t("details")}</button>
          </div>

          <div className="extra-card">
            <h3>{t("performanceSummary")}</h3>

            <div className="info-row">
              <span>{t("totalScore")}</span>
              <strong>92/100</strong>
            </div>

            <div className="info-row">
              <span>{t("managerRating")}</span>

              <strong className="success-text">{t("exceedsExpectations")}</strong>
            </div>

            <button className="green-btn" onClick={() => navigate("/portal/performance/report")}>{t("details")}</button>
          </div>
        </div>

        {/* ROW 3 */}
        <div className="extra-row">
          {/* Rewards */}
          <div className="extra-card">
            <h3>{t("rewardsOverview")}</h3>

            <div className="info-row">
              <span>{t("annualReward")}</span>
              <strong>$1,200</strong>
            </div>

            <button className="green-btn" onClick={() => navigate("/portal/rewards")}>{t("details")}</button>
          </div>

          {/* Organizational */}
          <div className="extra-card">
            <h3>{t("orgStructure")}</h3>

            <div className="info-row">
              <span>{t("companyEmployees")}</span>
              <strong>1,250</strong>
            </div>

            <div className="info-row">
              <span>{t("deptEmployees")}</span>
              <strong>42</strong>
            </div>

            <button className="green-btn" onClick={() => navigate("/portal/profile")}>{t("details")}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
