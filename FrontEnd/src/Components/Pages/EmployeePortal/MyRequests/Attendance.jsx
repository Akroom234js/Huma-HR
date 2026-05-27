import React, { useEffect, useState } from "react";
import apiClient from "../../../../apiConfig";
import "./Attendance.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Attendance = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const convertHours = (decimalHours) => {
    if (decimalHours === null || decimalHours === undefined) return "--h --m";

    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);

    return `${hours}h ${minutes}m`;
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
      const currentMonth = new Date().toISOString().slice(0, 7);

      const response = await apiClient.get(
        `/employee/attendance/history?month=${currentMonth}`,
      );

      setAttendanceHistory(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAttendanceTrends = async () => {
    try {
      const response = await apiClient.get("/employee/attendance/trends");

      const formattedData = response.data.data.map((item) => ({
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

      console.log(response.data);

      await loadAllData();

      alert(response.data.message);
    } catch (error) {
      console.log(error);
      let errorMsg = "فشل تسجيل الدخول";
      if (error instanceof Error && error.message === "geolocation_not_supported") {
        errorMsg = "متصفحك لا يدعم تحديد الموقع الجغرافي.";
      } else if (error.code === 1) { // PERMISSION_DENIED
        errorMsg = "يرجى تفعيل صلاحية الوصول للموقع الجغرافي (GPS) للمتصفح لتتمكن من تسجيل الحضور.";
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMsg = "لم يتمكن الجهاز من تحديد موقعك الجغرافي، يرجى التحقق من اتصال الـ GPS.";
      } else if (error.code === 3) { // TIMEOUT
        errorMsg = "انتهت مهلة تحديد الموقع الجغرافي، يرجى المحاولة مرة أخرى.";
      } else {
        errorMsg = error?.response?.data?.message || "فشل تسجيل الحضور، يرجى المحاولة مجدداً.";
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

      const response = await apiClient.post(
        "/employee/attendance/checkout",
        location,
      );

      console.log(response.data);

      await loadAllData();

      alert(response.data.message);
    } catch (error) {
      console.log(error);
      let errorMsg = "فشل تسجيل الانصراف";
      if (error instanceof Error && error.message === "geolocation_not_supported") {
        errorMsg = "متصفحك لا يدعم تحديد الموقع الجغرافي.";
      } else if (error.code === 1) { // PERMISSION_DENIED
        errorMsg = "يرجى تفعيل صلاحية الوصول للموقع الجغرافي (GPS) للمتصفح لتتمكن من تسجيل الانصراف.";
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMsg = "لم يتمكن الجهاز من تحديد موقعك الجغرافي، يرجى التحقق من اتصال الـ GPS.";
      } else if (error.code === 3) { // TIMEOUT
        errorMsg = "انتهت مهلة تحديد الموقع الجغرافي، يرجى المحاولة مرة أخرى.";
      } else {
        errorMsg = error?.response?.data?.message || "فشل تسجيل الانصراف، يرجى المحاولة مجدداً.";
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-page">
      <h1 className="page-title">Attendance Management</h1>

      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="attendance-actions">
        <button className="checkin" onClick={handleCheckin} disabled={loading}>
          <span className="material-symbols-outlined">login</span>

          {loading ? "Loading..." : "Check-in"}
        </button>

        <button
          className="checkout"
          onClick={handleCheckOut}
          disabled={loading}
        >
          <span className="material-symbols-outlined">logout</span>

          {loading ? "Loading..." : "Checkout"}
        </button>
      </div>

      <div className="main-grid">
        <div className="status-card">
          <h2>Today's Status</h2>

          <div className="status-row">
            <span>Status</span>

            <span
              className={`badge ${
                todayStatus?.status === "present" ? "success" : "danger"
              }`}
            >
              {todayStatus?.status || "Unknown"}
            </span>
          </div>

          <div className="status-row">
            <span>Check-in Time</span>

            <span>{todayStatus?.check_in || "--:--"}</span>
          </div>

          <div className="status-row">
            <span>Check-out Time</span>

            <span>{todayStatus?.check_out || "--:--"}</span>
          </div>

          <hr />

          <div className="status-row">
            <span>Hours Worked Today</span>

            <strong>
              {todayStatus?.hours_worked
                ? convertHours(todayStatus.hours_worked)
                : "--h --m"}
            </strong>
          </div>
        </div>

        <div className="right-section">
          <div className="chart-card">
            <h2>Attendance Trends over Time</h2>

            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="day" stroke="#ccc" />

                  <YAxis
                    stroke="#ccc"
                    label={{
                      value: "Hours",
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
          <h2>Historical Attendance</h2>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Hours Worked</th>
            </tr>
          </thead>

          <tbody>
            {attendanceHistory.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>

                <td>{item.check_in}</td>

                <td>{item.check_out}</td>

                <td
                  className={
                    item.is_absent ? "negative" : item.is_late ? "warning" : ""
                  }
                >
                  {item.hours_worked}

                  {item.is_late && " (Late)"}
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
