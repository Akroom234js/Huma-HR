import React, { useEffect, useState } from "react";
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
} from "recharts";

const Attendance = () => {
  const { t, i18n } = useTranslation("EmployeePortal/Attendance");
  const isAr = i18n ? i18n.language === "ar" : false;

  const [todayStatus, setTodayStatus] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const convertHours = (decimalHours) => {
    if (decimalHours === null || decimalHours === undefined) return "--h --m";

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    return isAr ? `${hours} س ${minutes} د` : `${hours}h ${minutes}m`;
  };

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
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  };

  const fetchTodayStatus = async () => {
    try {
      const response = await apiClient.get("/employee/attendance/today");
      setTodayStatus(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await apiClient.get("/employee/attendance/history");
      setAttendanceHistory(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAttendanceTrends = async () => {
    try {
      const response = await apiClient.get("/employee/attendance/trends");

      const formattedData = (response.data.data || []).map((item) => ({
        day: item.day,
        attendance: item.hours,
      }));

      setChartData(formattedData);
    } catch (error) {
      console.log(error);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      fetchTodayStatus(),
      fetchAttendanceHistory(),
      fetchAttendanceTrends(),
    ]);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCheckin = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      const response = await apiClient.post("/employee/attendance/checkin", location);
      await loadAllData();
      alert(response.data.message || (isAr ? "تم تسجيل الحضور بنجاح" : "Check-in successful"));
    } catch (error) {
      console.log(error);
      let errorMsg = t("alerts.checkinFail");
      if (error instanceof Error && error.message === "geolocation_not_supported") {
        errorMsg = t("alerts.geoNotSupported");
      } else if (error.code === 1) {
        errorMsg = t("alerts.permissionDenied");
      } else if (error.code === 2) {
        errorMsg = t("alerts.posUnavailable");
      } else if (error.code === 3) {
        errorMsg = t("alerts.timeout");
      } else {
        errorMsg = error?.response?.data?.message || t("alerts.checkinFail");
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      const response = await apiClient.post("/employee/attendance/checkout", location);
      await loadAllData();
      alert(response.data.message || (isAr ? "تم تسجيل الانصراف بنجاح" : "Checkout successful"));
    } catch (error) {
      console.log(error);
      let errorMsg = t("alerts.checkoutFail");
      if (error instanceof Error && error.message === "geolocation_not_supported") {
        errorMsg = t("alerts.geoNotSupported");
      } else if (error.code === 1) {
        errorMsg = t("alerts.permissionDenied");
      } else if (error.code === 2) {
        errorMsg = t("alerts.posUnavailable");
      } else if (error.code === 3) {
        errorMsg = t("alerts.timeout");
      } else {
        errorMsg = error?.response?.data?.message || t("alerts.checkoutFail");
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    if (!status) return t("unknown");
    if (status === "present") return t("present");
    if (status === "absent") return t("absent");
    return status;
  };

  return (
    <div className={`attendance-page ${isAr ? "rtl" : "ltr"}`}>
      <h1 className="page-title">{t("pageTitle")}</h1>

      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="attendance-actions">
        <button className="checkin" onClick={handleCheckin} disabled={loading}>
          <span className="material-symbols-outlined">login</span>
          {loading ? t("loading") : t("checkIn")}
        </button>

        <button
          className="checkout"
          onClick={handleCheckOut}
          disabled={loading}
        >
          <span className="material-symbols-outlined">logout</span>
          {loading ? t("loading") : t("checkOut")}
        </button>
      </div>

      <div className="main-grid">
        <div className="status-card">
          <h2>{t("todayStatus")}</h2>

          <div className="status-row">
            <span>{t("status")}</span>

            <span
              className={`badge ${
                todayStatus?.status === "present" ? "success" : "danger"
              }`}
            >
              {getStatusText(todayStatus?.status)}
            </span>
          </div>

          <div className="status-row">
            <span>{t("checkInTime")}</span>
            <span>{todayStatus?.check_in || "--:--"}</span>
          </div>

          <div className="status-row">
            <span>{t("checkOutTime")}</span>
            <span>{todayStatus?.check_out || "--:--"}</span>
          </div>

          <hr />

          <div className="status-row">
            <span>{t("hoursWorkedToday")}</span>
            <strong>
              {todayStatus?.hours_worked
                ? convertHours(todayStatus.hours_worked)
                : "--h --m"}
            </strong>
          </div>
        </div>

        <div className="right-section">
          <div className="chart-card">
            <h2>{t("trendsTitle")}</h2>

            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="day" stroke="#ccc" />
                  <YAxis
                    stroke="#ccc"
                    label={{
                      value: t("hours"),
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#4ade80"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card full-width">
        <div className="card-header">
          <h2>{t("historicalAttendance")}</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>{t("table.date")}</th>
              <th>{t("table.checkIn")}</th>
              <th>{t("table.checkOut")}</th>
              <th>{t("table.hoursWorked")}</th>
            </tr>
          </thead>

          <tbody>
            {attendanceHistory.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.check_in || "--:--"}</td>
                <td>{item.check_out || "--:--"}</td>
                <td
                  className={
                    item.is_absent ? "negative" : item.is_late ? "warning" : ""
                  }
                >
                  {item.hours_worked ? convertHours(item.hours_worked) : "--"}
                  {item.is_late && ` ${t("table.late")}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
