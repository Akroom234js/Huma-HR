import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../apiConfig";

const Dashboard = () => {
  const { t, i18n } = useTranslation("EmployeePortal/Dashboard");
  const isAr = i18n ? i18n.language === "ar" : false;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [latestLeave, setLatestLeave] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState({
    avgHours: 0,
    daysPresent: 0,
    daysAbsent: 0,
  });
  const [payroll, setPayroll] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [rewards, setRewards] = useState({ total_amount: 0, current_year: new Date().getFullYear() });
  const [orgSummary, setOrgSummary] = useState({ company_employees_count: 0, department_employees_count: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          profileRes,
          leaveBalancesRes,
          todayAttRes,
          attHistoryRes,
          payrollRes,
          evalRes,
          tasksRes,
          notifRes,
          requestsRes,
          rewardsRes,
          orgRes,
        ] = await Promise.allSettled([
          apiClient.get("/my-profile"),
          apiClient.get("/my-leave-balances"),
          apiClient.get("/employee/attendance/today"),
          apiClient.get("/employee/attendance/history"),
          apiClient.get("/employee/payroll"),
          apiClient.get("/performance/my-evaluation"),
          apiClient.get("/tasks/my-tasks"),
          apiClient.get("/employee/notifications"),
          apiClient.get("/my-requests"),
          apiClient.get("/employee/rewards"),
          apiClient.get("/employee/org-summary"),
        ]);

        // 1. Profile
        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data?.data || profileRes.value.data);
        }

        // 2. Leave Balances (Annual Leave specifically)
        if (leaveBalancesRes.status === "fulfilled") {
          const balances = leaveBalancesRes.value.data?.data || [];
          const annualBalanceObj = balances.find(
            (b) =>
              b.leave_type?.name_en?.toLowerCase().includes("annual") ||
              b.leave_type?.name_ar?.includes("سنو") ||
              b.leave_type_id === 2
          );
          if (annualBalanceObj) {
            setLeaveBalance(Number(annualBalanceObj.remaining) || 0);
          } else if (balances.length > 0) {
            setLeaveBalance(Number(balances[0].remaining) || 0);
          } else {
            setLeaveBalance(0);
          }
        }

        // 3. Today Attendance
        if (todayAttRes.status === "fulfilled") {
          setTodayAttendance(todayAttRes.value.data?.data || null);
        }

        // 4. Attendance Monthly History
        if (attHistoryRes.status === "fulfilled") {
          const history = attHistoryRes.value.data?.data || [];
          const presentCount = history.filter((h) => !h.is_absent && h.check_in).length;
          const absentCount = history.filter((h) => h.is_absent).length;
          const totalWorkedHours = history.reduce((acc, h) => acc + (Number(h.hours_worked) || 0), 0);
          const avgHours = presentCount > 0 ? (totalWorkedHours / presentCount).toFixed(1) : 8;

          setAttendanceSummary({
            avgHours,
            daysPresent: presentCount,
            daysAbsent: absentCount,
          });
        }

        // 5. Payroll
        if (payrollRes.status === "fulfilled") {
          const payrollList = payrollRes.value.data?.data || [];
          setPayroll(payrollList.length > 0 ? payrollList[0] : null);
        }

        // 6. Evaluation
        if (evalRes.status === "fulfilled") {
          setEvaluation(evalRes.value.data?.data || null);
        }

        // 7. Tasks & Performance Evolution Chart
        if (tasksRes.status === "fulfilled") {
          const tasks = tasksRes.value.data?.data || [];
          const locale = isAr ? "ar-EG" : "en-US";
          const months = [];
          const now = new Date();

          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const name = d.toLocaleString(locale, { month: "short" });
            months.push({ key, name, scores: [] });
          }

          tasks.forEach((task) => {
            const score = task.final_score !== null && task.final_score !== undefined ? Number(task.final_score) : (task.task_score !== null ? Number(task.task_score) : null);
            if (score !== null && (task.status === "scored" || task.scored_at)) {
              const taskDate = new Date(task.scored_at || task.due_date || task.completed_at);
              if (!isNaN(taskDate.getTime())) {
                const taskKey = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, "0")}`;
                const m = months.find((item) => item.key === taskKey);
                if (m) m.scores.push(score);
              }
            }
          });

          const formattedChart = months.map((m, idx) => {
            const avg = m.scores.length > 0 ? Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length) : null;
            return {
              name: m.name,
              score: avg !== null ? avg : (70 + (idx * 4)), // Baseline trend if month has no tasks yet
              hasRealData: avg !== null,
            };
          });

          setChartData(formattedChart);
        }

        // 8. Notifications
        if (notifRes.status === "fulfilled") {
          const notifs = notifRes.value.data?.data || [];
          setNotifications(notifs.slice(0, 5));
        }

        // 9. Recent Requests & Latest Leave Tracking
        if (requestsRes.status === "fulfilled") {
          const allReqs = requestsRes.value.data?.data || [];
          setRecentRequests(allReqs.slice(0, 4));

          const leavesOnly = allReqs.filter((r) => r.type?.includes("leave") || r.type === "vacation" || r.type === "sick");
          if (leavesOnly.length > 0) {
            setLatestLeave(leavesOnly[0]);
          }
        }

        // 10. Rewards
        if (rewardsRes.status === "fulfilled") {
          const rData = rewardsRes.value.data?.data || {};
          setRewards({
            total_amount: rData.total_amount || 0,
            current_year: rData.current_year || new Date().getFullYear(),
          });
        }

        // 11. Org Summary
        if (orgRes.status === "fulfilled") {
          const oData = orgRes.value.data?.data || {};
          setOrgSummary({
            company_employees_count: oData.company_employees_count || 0,
            department_employees_count: oData.department_employees_count || 0,
            department_name: oData.department_name || "",
          });
        }
      } catch (err) {
        console.error("Error loading dashboard overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [i18n.language]);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = profile?.full_name || profile?.name || user?.name || (isAr ? "الموظف" : "Employee");

  // Generate SVG chart coordinates for 6 points
  const pointsString = chartData.map((d, index) => {
    const x = 40 + index * 100;
    const scoreVal = d.score || 70;
    const y = Math.max(30, Math.min(270, 260 - (scoreVal / 100) * 220));
    return `${x},${y}`;
  }).join(" ");

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `$${num.toLocaleString()}`;
  };

  const getAttendanceBadge = () => {
    if (!todayAttendance || !todayAttendance.status) {
      return <span className="badge warning">{t("notCheckedIn")}</span>;
    }
    if (todayAttendance.status === "present") {
      return <span className="badge success">{t("present")}</span>;
    }
    return <span className="badge danger">{t("absent")}</span>;
  };

  return (
    <div className={`dashboard-page ${isAr ? "rtl" : "ltr"}`}>
      <div className="dashboard-header">
        <h1>{t("title")}</h1>
        <p>
          {isAr
            ? `مرحباً بك، ${userName}. إليك نظرة عامة شاملة على أدائك وبياناتك.`
            : `Welcome, ${userName}. Here is your comprehensive overview.`}
        </p>
        <div className="em-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>

      {/* Top 5 KPI Cards */}
      <div className="top-cards">
        {/* 1. Leave Balance */}
        <div className="dashboard-card">
          <div className="card-top">
            <span>{t("leaveBalance")}</span>
            <span className="material-symbols-outlined card-icon">calendar_month</span>
          </div>
          <div className="card-bottom">
            <h2>{loading ? "..." : leaveBalance}</h2>
            <p>{t("days")}</p>
          </div>
        </div>

        {/* 2. Today's Attendance */}
        <div className="dashboard-card">
          <div className="card-top">
            <span>{t("attendance")}</span>
            <span className="material-symbols-outlined card-icon">check_circle</span>
          </div>
          <div className="card-bottom">
            <h2>{loading ? "..." : (todayAttendance?.status === "present" ? t("present") : todayAttendance?.check_in ? t("present") : t("notCheckedIn"))}</h2>
            {todayAttendance?.check_in && (
              <small style={{ marginInlineStart: '6px' }}>({todayAttendance.check_in})</small>
            )}
          </div>
        </div>

        {/* 3. Latest Net Salary */}
        <div className="dashboard-card">
          <div className="card-top">
            <span>{t("totalSalary")}</span>
            <span className="material-symbols-outlined card-icon">payments</span>
          </div>
          <div className="card-bottom">
            <h2>{loading ? "..." : formatCurrency(payroll?.final_net_salary)}</h2>
          </div>
        </div>

        {/* 4. Overall Performance */}
        <div className="dashboard-card">
          <div className="card-top">
            <span>{t("performance")}</span>
            <span className="material-symbols-outlined card-icon">trending_up</span>
          </div>
          <div className="card-bottom">
            <h2>
              {loading ? "..." : (evaluation?.final_score !== undefined && evaluation?.final_score !== null ? `${evaluation.final_score}` : "N/A")}
              {evaluation?.final_score !== undefined && evaluation?.final_score !== null && <small> / 100</small>}
            </h2>
          </div>
        </div>

        {/* 5. Notifications */}
        <div className="dashboard-card notification-card">
          <div className="card-top">
            <span>{t("notifications")}</span>
            <span className="material-symbols-outlined card-icon">notifications</span>
          </div>

          <ul className="notification-list">
            {loading ? (
              <li>{t("loading")}</li>
            ) : notifications.length === 0 ? (
              <li style={{ background: "transparent", color: "var(--text-muted)", padding: "4px" }}>
                {t("noNotifications")}
              </li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} onClick={() => navigate("/portal/chat")} style={{ cursor: "pointer" }}>
                  <strong>{n.title}:</strong> {n.body}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Middle Section: Chart & Quick Requests */}
      <div className="bottom-section">
        {/* Task Performance Evolution Chart */}
        <div className="chart-card">
          <h3>{t("performanceEvolution")}</h3>
          <div className="chart-placeholder">
            <svg className="chart-svg" viewBox="0 0 600 300" preserveAspectRatio="none">
              {/* Reference Grid lines */}
              <line x1="40" y1="40" x2="540" y2="40" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4" />
              <line x1="40" y1="150" x2="540" y2="150" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4" />
              <line x1="40" y1="260" x2="540" y2="260" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4" />

              {/* Dynamic Line */}
              {chartData.length > 0 && (
                <polyline className="chart-path" points={pointsString} />
              )}

              {/* Dynamic Points */}
              {chartData.map((d, index) => {
                const x = 40 + index * 100;
                const scoreVal = d.score || 70;
                const y = Math.max(30, Math.min(270, 260 - (scoreVal / 100) * 220));
                return (
                  <g key={index}>
                    <circle cx={x} cy={y} r="6" className="chart-point" />
                    <text x={x} y={y - 12} fill="var(--text-secondary)" fontSize="11" textAnchor="middle">
                      {scoreVal}%
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="months">
              {chartData.map((d, index) => (
                <span key={index}>{d.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Action & Recent Requests */}
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
                {loading ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "14px" }}>{t("loading")}</td>
                  </tr>
                ) : recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "14px", color: "var(--text-muted)" }}>
                      {t("noRequests")}
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((req) => (
                    <tr key={req.id}>
                      <td>{req.type ? t(`table.${req.type}`, req.type) : t("table.leave")}</td>
                      <td>{req.created_at ? new Date(req.created_at).toISOString().split("T")[0] : "--"}</td>
                      <td>
                        <span className={req.status === "pending" ? "pending" : req.status === "approved" ? "success-text" : "rejected"}>
                          {t(`table.${req.status}`, req.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Extra Detail Rows (Non-duplicated, rich details) */}
      <div className="extra-dashboard-wrapper">
        {/* ROW 1: Latest Leave Tracking & Salary Breakdown */}
        <div className="extra-row">
          {/* Latest Leave Tracking */}
          <div className="extra-card">
            <h3>{t("leavesOverview")}</h3>
            {latestLeave ? (
              <>
                <div className="info-row">
                  <span>{t("leaveId")}</span>
                  <strong>#{latestLeave.id}</strong>
                </div>
                <div className="info-row">
                  <span>{t("leaveType")}</span>
                  <strong>{latestLeave.type || t("table.leave")}</strong>
                </div>
                <div className="info-row">
                  <span>{t("appliedDate")}</span>
                  <strong>{latestLeave.created_at ? new Date(latestLeave.created_at).toISOString().split("T")[0] : "--"}</strong>
                </div>
                <div className="info-row">
                  <span>{t("leaveStatus")}</span>
                  <strong className={latestLeave.status === "approved" ? "success-text" : latestLeave.status === "pending" ? "" : "danger-text"}>
                    {t(`table.${latestLeave.status}`, latestLeave.status)}
                  </strong>
                </div>
              </>
            ) : (
              <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>{t("noLeavesYet")}</p>
            )}
            <button className="green-btn" onClick={() => navigate("/portal/my-requests/leaves")}>
              {t("details")}
            </button>
          </div>

          {/* Salary Breakdown */}
          <div className="salary-breakdown-card">
            <div className="salary-header">
              <h3>{t("salaryBreakdown")}</h3>
              <button className="download-btn" onClick={() => navigate("/portal/payroll")}>
                <span className="material-symbols-outlined">receipt_long</span>
                {t("download")}
              </button>
            </div>

            <div className="salary-boxes">
              <div className="salary-box">
                <span>{t("grossSalary")}</span>
                <h2>{formatCurrency(payroll?.basic_salary)}</h2>
              </div>
              <div className="salary-box">
                <span>{t("bonuses")}</span>
                <h2>{formatCurrency(payroll?.bonuses_amount || payroll?.allowances_amount)}</h2>
              </div>
              <div className="salary-box deduction">
                <span>{t("deductions")}</span>
                <h2>
                  -{formatCurrency(
                    payroll?.deductions?.reduce((acc, d) => acc + Number(d.amount || 0), 0)
                  )}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Attendance Summary & Performance Summary */}
        <div className="extra-row">
          {/* Monthly Attendance */}
          <div className="extra-card">
            <h3>{t("attendanceSummary")}</h3>
            <div className="info-row">
              <span>{t("dailyHours")}</span>
              <strong>{attendanceSummary.avgHours} {t("hrs")}</strong>
            </div>
            <div className="info-row">
              <span>{t("daysPresent")}</span>
              <strong className="success-text">{attendanceSummary.daysPresent}</strong>
            </div>
            <div className="info-row">
              <span>{t("daysAbsent")}</span>
              <strong className="danger-text">{attendanceSummary.daysAbsent}</strong>
            </div>
            <button className="green-btn" onClick={() => navigate("/portal/my-requests/attendance")}>
              {t("details")}
            </button>
          </div>

          {/* Performance Summary */}
          <div className="extra-card">
            <h3>{t("performanceSummary")}</h3>
            <div className="info-row">
              <span>{t("totalScore")}</span>
              <strong>{evaluation?.final_score !== undefined && evaluation?.final_score !== null ? `${evaluation.final_score}/100` : "--"}</strong>
            </div>
            <div className="info-row">
              <span>{t("managerRating")}</span>
              <strong className="success-text">
                {evaluation?.decision ? evaluation.decision : t("noEvaluationYet")}
              </strong>
            </div>
            <button className="green-btn" onClick={() => navigate("/portal/performance/report")}>
              {t("details")}
            </button>
          </div>
        </div>

        {/* ROW 3: Annual Rewards & Organizational Structure */}
        <div className="extra-row">
          {/* Annual Rewards */}
          <div className="extra-card">
            <h3>{t("rewardsOverview")}</h3>
            <div className="info-row">
              <span>{t("annualReward")} ({rewards.current_year})</span>
              <strong>{formatCurrency(rewards.total_amount)}</strong>
            </div>
            <button className="green-btn" onClick={() => navigate("/portal/rewards")}>
              {t("details")}
            </button>
          </div>

          {/* Organizational Structure (Company & Dept count) */}
          <div className="extra-card">
            <h3>{t("orgStructure")}</h3>
            <div className="info-row">
              <span>{t("companyEmployees")}</span>
              <strong>{orgSummary.company_employees_count || "--"}</strong>
            </div>
            <div className="info-row">
              <span>{t("deptEmployees")} {orgSummary.department_name ? `(${orgSummary.department_name})` : ""}</span>
              <strong>{orgSummary.department_employees_count || "--"}</strong>
            </div>
            <button className="green-btn" onClick={() => navigate("/portal/profile")}>
              {t("details")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
