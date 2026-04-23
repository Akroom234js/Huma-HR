import React from "react";
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

const chartData = [
  { day: "Mon", attendance: 20 },
  { day: "Tue", attendance: 30 },
  { day: "Wed", attendance: 25 },
  { day: "Thu", attendance: 45 },
  { day: "Fri", attendance: 35 },
  { day: "Sat", attendance: 50 },
];

const attendanceHistory = [
  {
    date: "2024-05-20",
    checkIn: "09:02 AM",
    checkOut: "05:15 PM",
    hours: "8h 15m",
  },
  {
    date: "2024-05-19",
    checkIn: "09:10 AM",
    checkOut: "05:05 PM",
    hours: "7h 55m",
  },
  {
    date: "2024-05-18",
    checkIn: "08:55 AM",
    checkOut: "05:00 PM",
    hours: "8h 05m",
  },
  {
    date: "2024-05-17",
    checkIn: "09:30 AM",
    checkOut: "05:00 PM",
    hours: "7h 30m",
    late: true,
  },
  {
    date: "2024-05-16",
    checkIn: "--:--",
    checkOut: "--:--",
    hours: "Absent",
    absent: true,
  },
];

const Attendance = () => {
  return (
    <div className="attendance-page">
      <h1 className="page-title">Attendance Management</h1>

      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="attendance-actions">
        <button className="checkin">
          <span className="material-symbols-outlined">login</span>
          Check-in
        </button>

        <button className="checkout">
          <span className="material-symbols-outlined">logout</span>
          Checkout
        </button>
      </div>

      <div className="main-grid">
        <div className="status-card">
          <h2>Today's Status</h2>

          <div className="status-row">
            <span>Status</span>
            <span className="badge success">Present</span>
          </div>

          <div className="status-row">
            <span>Check-in Time</span>
            <span>09:02 AM</span>
          </div>

          <div className="status-row">
            <span>Check-out Time</span>
            <span>--:--</span>
          </div>

          <hr />

          <div className="status-row">
            <span>Hours Worked Today</span>
            <strong>--h --m</strong>
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
                      value: "Employees",
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

                <td>{item.checkIn}</td>

                <td>{item.checkOut}</td>

                <td
                  className={
                    item.absent ? "negative" : item.late ? "warning" : ""
                  }
                >
                  {item.hours}
                  {item.late && " (Late)"}
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
