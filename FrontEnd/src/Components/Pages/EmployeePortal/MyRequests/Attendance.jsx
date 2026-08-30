import React, { useEffect, useState, useCallback } from "react";
import apiClient from "../../../../apiConfig";
import "./Attendance.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Attendance = () => {
  const { t, i18n } = useTranslation("EmployeePortal/Attendance");
  const isAr = i18n ? i18n.language === "ar" : false;

  const [todayStatus, setTodayStatus] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState(null);

  // Late Check-in Reason Modal States
  const [showLateModal, setShowLateModal] = useState(false);
  const [latenessReason, setLatenessReason] = useState("");
  const [lateError, setLateError] = useState("");

  const showAlert = (message, type = "info") => {
    setAlertInfo({ message, type });
    setTimeout(() => {
      setAlertInfo(null);
    }, 6000);
  };

  const convertHours = useCallback((decimalHours) => {
    if (decimalHours === null || decimalHours === undefined || isNaN(decimalHours)) {
      return "--h --m";
    }

    const num = parseFloat(decimalHours);
    if (isNaN(num)) return "--h --m";

    const hours = Math.floor(num);
    const minutes = Math.round((num - hours) * 60);

    return isAr ? `${hours} س ${minutes} د` : `${hours}h ${minutes}m`;
  }, [isAr]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("geolocation_not_supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        },
      );
    });
  };

  const fetchTodayStatus = async () => {
    try {
      const response = await apiClient.get("/employee/attendance/today");
      setTodayStatus(response.data?.data || null);
    } catch (error) {
      console.error("Failed to fetch today status:", error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await apiClient.get("/employee/attendance/history");
      setAttendanceHistory(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Failed to fetch attendance history:", error);
    }
  };

  const fetchAttendanceTrends = useCallback(async () => {
    try {
      const response = await apiClient.get("/employee/attendance/trends");
      const rawList = Array.isArray(response.data?.data) ? response.data.data : [];

      const formattedData = rawList.map((item) => ({
        rawDay: item.day,
        day: t(`days.${item.day}`, { defaultValue: item.day }),
        attendance: typeof item.hours === "number" ? item.hours : parseFloat(item.hours) || 0,
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error("Failed to fetch attendance trends:", error);
    }
  }, [t]);

  const loadAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchTodayStatus(),
        fetchAttendanceHistory(),
        fetchAttendanceTrends(),
      ]);
    } finally {
      setInitialLoading(false);
    }
  }, [fetchAttendanceTrends]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Check if current time is past start time + grace period
  const isLateCheckin = useCallback(() => {
    if (todayStatus?.is_late_now !== undefined) {
      return Boolean(todayStatus.is_late_now);
    }
    if (todayStatus?.start_time) {
      const now = new Date();
      const parts = todayStatus.start_time.split(":");
      const shiftStart = new Date();
      shiftStart.setHours(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) + (parseInt(todayStatus.grace_period, 10) || 15),
        parseInt(parts[2] || 0, 10),
        0
      );
      return now > shiftStart;
    }
    return false;
  }, [todayStatus]);

  const executeCheckin = async (reason = null) => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      const payload = reason ? { ...location, lateness_reason: reason } : location;
      const response = await apiClient.post("/employee/attendance/checkin", payload);
      await loadAllData();
      showAlert(response.data?.message || t("alerts.checkinSuccess"), "success");
    } catch (error) {
      console.error("Check-in error:", error);
      let errorMsg = t("alerts.checkinFail");

      if (error instanceof Error && error.message === "geolocation_not_supported") {
        errorMsg = t("alerts.geoNotSupported");
      } else if (error.code === 1) {
        errorMsg = t("alerts.permissionDenied");
      } else if (error.code === 2) {
        errorMsg = t("alerts.posUnavailable");
      } else if (error.code === 3) {
        errorMsg = t("alerts.timeout");
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      showAlert(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = () => {
    if (isLateCheckin()) {
      setLatenessReason("");
      setLateError("");
      setShowLateModal(true);
    } else {
      executeCheckin();
    }
  };

  const handleConfirmLateCheckin = async (e) => {
    e?.preventDefault();
    if (!latenessReason.trim()) {
      setLateError(t("lateModal.requiredError"));
      return;
    }
    setShowLateModal(false);
    await executeCheckin(latenessReason.trim());
    setLatenessReason("");
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      const response = await apiClient.post("/employee/attendance/checkout", location);
      await loadAllData();
      showAlert(response.data?.message || t("alerts.checkoutSuccess"), "success");
    } catch (error) {
      console.error("Checkout error:", error);
      let errorMsg = t("alerts.checkoutFail");

      if (error instanceof Error && error.message === "geolocation_not_supported") {
        errorMsg = t("alerts.geoNotSupported");
      } else if (error.code === 1) {
        errorMsg = t("alerts.permissionDenied");
      } else if (error.code === 2) {
        errorMsg = t("alerts.posUnavailable");
      } else if (error.code === 3) {
        errorMsg = t("alerts.timeout");
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      showAlert(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return { label: t("present"), className: "badge-success" };
      case "late":
        return { label: t("late"), className: "badge-warning" };
      case "absent":
        return { label: t("absent"), className: "badge-danger" };
      case "not_checked_in":
        return { label: t("notCheckedIn"), className: "badge-neutral" };
      default:
        return { label: status || t("unknown"), className: "badge-neutral" };
    }
  };

  const todayBadge = getStatusBadge(todayStatus?.status);

  return (
    <div className={`attendance-page ${isAr ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="attendance-header-wrapper">
        <div className="title-group">
          <i className="bi bi-clock-history header-icon"></i>
          <h1 className="page-title">{t("pageTitle")}</h1>
        </div>
        <div className="theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>

      {/* Alert Notification Toast */}
      {alertInfo && (
        <div className={`attendance-alert-banner ${alertInfo.type}`}>
          <i
            className={`bi ${
              alertInfo.type === "success"
                ? "bi-check-circle-fill"
                : alertInfo.type === "error"
                ? "bi-exclamation-triangle-fill"
                : "bi-info-circle-fill"
            } alert-icon`}
          ></i>
          <span>{alertInfo.message}</span>
          <button
            type="button"
            className="alert-close-btn"
            onClick={() => setAlertInfo(null)}
            aria-label="Close"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="attendance-actions">
        <button
          type="button"
          className="btn-attendance btn-checkin"
          onClick={handleCheckin}
          disabled={loading || todayStatus?.status === "present" || todayStatus?.status === "late"}
        >
          <i className="bi bi-box-arrow-in-right me-1"></i>
          <span>{loading ? t("loading") : t("checkIn")}</span>
        </button>

        <button
          type="button"
          className="btn-attendance btn-checkout"
          onClick={handleCheckOut}
          disabled={
            loading ||
            !todayStatus ||
            todayStatus.status === "not_checked_in" ||
            Boolean(todayStatus.check_out)
          }
        >
          <i className="bi bi-box-arrow-right me-1"></i>
          <span>{loading ? t("loading") : t("checkOut")}</span>
        </button>
      </div>

      {/* Main Grid: Today Status & Weekly Trends */}
      <div className="main-grid">
        {/* Today's Status Card */}
        <div className="card status-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <i className="bi bi-calendar-check-fill card-icon"></i>
              <h2>{t("todayStatus")}</h2>
            </div>
            {todayStatus?.branch_name && (
              <span className="branch-tag">
                <i className="bi bi-geo-alt-fill me-1"></i>
                {todayStatus.branch_name}
              </span>
            )}
          </div>

          <div className="status-rows-container">
            <div className="status-row">
              <span className="status-label">{t("status")}</span>
              <span className={`badge ${todayBadge.className}`}>
                {todayBadge.label}
              </span>
            </div>

            <div className="status-row">
              <span className="status-label">{t("checkInTime")}</span>
              <span className="status-value">{todayStatus?.check_in || "--:--"}</span>
            </div>

            <div className="status-row">
              <span className="status-label">{t("checkOutTime")}</span>
              <span className="status-value">{todayStatus?.check_out || "--:--"}</span>
            </div>

            <hr className="divider" />

            <div className="status-row highlight-row">
              <span className="status-label">
                {t("hoursWorkedToday")}{" "}
                {todayStatus?.is_live && (
                  <span className="live-indicator">{t("live")}</span>
                )}
              </span>
              <span className="status-value highlight-value">
                {convertHours(todayStatus?.hours_worked)}
              </span>
            </div>
          </div>
        </div>

        {/* Trends Chart Card */}
        <div className="card chart-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <i className="bi bi-graph-up-arrow card-icon"></i>
              <h2>{t("trendsTitle")}</h2>
            </div>
            <span className="chart-unit-tag">{t("hours")}</span>
          </div>

          <div className="chart-wrapper">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.6} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} domain={[0, "auto"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                      borderRadius: "10px",
                      color: "var(--text-main)",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    name={t("hours")}
                    stroke="var(--primary-color, #359EFF)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "var(--primary-color, #359EFF)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                <span className="text-muted">No trend data available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Attendance Table */}
      <div className="card table-card">
        <div className="card-header-flex">
          <div className="card-title-group">
            <i className="bi bi-table card-icon"></i>
            <h2>{t("historicalAttendance")}</h2>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>{t("table.date")}</th>
                <th>{t("table.checkIn")}</th>
                <th>{t("table.checkOut")}</th>
                <th>{t("table.status")}</th>
                <th>{t("table.hoursWorked")}</th>
                <th>{t("table.branch")}</th>
              </tr>
            </thead>
            <tbody>
              {initialLoading ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    <div className="attendance-spinner"></div>
                    <div style={{ marginTop: "0.5rem" }}>{t("loading")}</div>
                  </td>
                </tr>
              ) : attendanceHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    <i className="bi bi-calendar-x empty-icon"></i>
                    <div>{t("table.empty")}</div>
                  </td>
                </tr>
              ) : (
                attendanceHistory.map((item, index) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <tr key={item.id || index}>
                      <td className="date-cell">
                        <i className="bi bi-calendar2-event me-1"></i>
                        {item.date}
                      </td>
                      <td>{item.check_in || "--:--"}</td>
                      <td>{item.check_out || "--:--"}</td>
                      <td>
                        <span className={`badge ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="hours-cell">
                        {item.hours_worked !== null && item.hours_worked !== undefined
                          ? convertHours(item.hours_worked)
                          : item.is_absent
                          ? t("absent")
                          : "--"}
                      </td>
                      <td>
                        {item.branch ? (
                          <span className="branch-subtle-badge">
                            <i className="bi bi-building me-1"></i>
                            {item.branch}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ✨ LATE CHECK-IN REASON POPUP MODAL
         ══════════════════════════════════════════════════════════════════ */}
      {showLateModal && (
        <div className="late-modal-overlay" onClick={() => setShowLateModal(false)}>
          <div className="late-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="late-modal-header">
              <div className="late-modal-icon-wrapper">
                <i className="bi bi-exclamation-diamond-fill"></i>
              </div>
              <div className="late-modal-title-group">
                <h3>{t("lateModal.title")}</h3>
                <p>{t("lateModal.subtitle")}</p>
              </div>
              <button
                type="button"
                className="late-modal-close-btn"
                onClick={() => setShowLateModal(false)}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleConfirmLateCheckin}>
              <div className="late-modal-body">
                <div className="late-modal-field">
                  <label htmlFor="lateness-reason-input" className="late-modal-label">
                    {t("lateModal.reasonLabel")}
                  </label>
                  <textarea
                    id="lateness-reason-input"
                    className="late-modal-textarea"
                    placeholder={t("lateModal.reasonPlaceholder")}
                    value={latenessReason}
                    onChange={(e) => {
                      setLatenessReason(e.target.value);
                      if (lateError) setLateError("");
                    }}
                    rows={4}
                    autoFocus
                    required
                  />
                  {lateError && (
                    <span style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: 600 }}>
                      {lateError}
                    </span>
                  )}
                </div>
              </div>

              <div className="late-modal-actions">
                <button
                  type="button"
                  className="late-btn-cancel"
                  onClick={() => setShowLateModal(false)}
                  disabled={loading}
                >
                  {t("lateModal.cancelBtn")}
                </button>
                <button
                  type="submit"
                  className="late-btn-confirm"
                  disabled={loading}
                >
                  <i className="bi bi-check2-circle"></i>
                  <span>{loading ? t("loading") : t("lateModal.confirmBtn")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
