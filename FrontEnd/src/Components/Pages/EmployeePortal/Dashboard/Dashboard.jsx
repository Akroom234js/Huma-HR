import React from "react";
import "./Dashboard.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <p>Welcome, John Doe. Here is your overview.</p>
        <div className="em-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>

      <div className="top-cards">
        <div className="dashboard-card">
          <div className="card-top">
            <span>Leave Balance</span>
            <span className="material-symbols-outlined card-icon">
              calendar_month
            </span>
          </div>

          <div className="card-bottom">
            <h2>14</h2>
            <p>days</p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span>Attendance</span>
            <span className="material-symbols-outlined card-icon">
              check_circle
            </span>
          </div>

          <div className="card-bottom">
            <h2>Present</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span>Total Salary</span>
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
            <span>Performance</span>
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
            <span>Notifications</span>
            <span className="material-symbols-outlined card-icon">
              notifications
            </span>
          </div>

          <ul className="notification-list">
            <li>Your leave request was approved.</li>
            <li>New company policy updated.</li>
            <li>Performance review is scheduled.</li>
            <li>Team meeting at 3 PM today.</li>
            <li>Submit your timesheet by EOD.</li>
          </ul>
        </div>
      </div>

      <div className="bottom-section">
        <div className="chart-card">
          <h3>Performance Evolution</h3>
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
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>

        <div className="right-side2">
          <div className="quick-card">
            <h3>Quick Actions</h3>
            <p>Need to take time off?</p>

            <button className="request">
              <span className="material-symbols-outlined">add</span>
              Submit Leave Request
            </button>
          </div>

          <div className="request-card">
            <h3>Pending Requests</h3>

            <table>
              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Vacation</td>
                  <td>2024-09-01</td>
                  <td>
                    <span className="pending">Pending</span>
                  </td>
                </tr>

                <tr>
                  <td>Sick Leave</td>
                  <td>2024-07-22</td>
                  <td>
                    <span className="rejected">Rejected</span>
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
            <h3>Leaves Overview</h3>

            <div className="info-row">
              <span>Leave ID:</span>
              <strong>L-78923</strong>
            </div>

            <div className="info-row">
              <span>Leave Type:</span>
              <strong>Annual</strong>
            </div>

            <div className="info-row">
              <span>Last Applied:</span>
              <strong>2024-03-10</strong>
            </div>

            <div className="info-row">
              <span>Last Leave Type:</span>
              <strong>Sick Leave</strong>
            </div>

            <button className="green-btn">Details</button>
          </div>

          {/* Leave Balance */}
          <div className="extra-card">
            <h3>Leave Balance</h3>

            <div className="leave-balance-box">
              <h2>14</h2>
              <span>days</span>
            </div>

            <p className="leave-note">
              Current Leave Balance. Can include past leaves from supervisor.
            </p>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="salary-breakdown-card">
          <div className="salary-header">
            <h3>Salary Breakdown</h3>

            <button className="download-btn">
              <span className="material-symbols-outlined">download</span>
              Download
            </button>
          </div>

          <div className="salary-boxes">
            <div className="salary-box">
              <span>Gross Salary</span>
              <h2>$7,500</h2>
            </div>

            <div className="salary-box">
              <span>Bonuses</span>
              <h2>$500</h2>
            </div>

            <div className="salary-box deduction">
              <span>Deductions</span>
              <h2>-$250</h2>
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="extra-row">
          {/* Attendance */}
          <div className="extra-card">
            <h3>Attendance Summary</h3>

            <div className="info-row">
              <span>Daily Working Hours</span>
              <strong>8 hrs</strong>
            </div>

            <div className="info-row">
              <span>Days Present Count</span>
              <strong>19</strong>
            </div>

            <div className="info-row">
              <span>Days Absent Count</span>
              <strong className="danger-text">2</strong>
            </div>

            <button className="green-btn">Details</button>
          </div>

          <div className="extra-card">
            <h3>Performance Summary</h3>

            <div className="info-row">
              <span>Total Score</span>
              <strong>92/100</strong>
            </div>

            <div className="info-row">
              <span>Manager's Rating</span>

              <strong className="success-text">Exceeds Expectations</strong>
            </div>

            <button className="green-btn">Details</button>
          </div>
        </div>

        {/* ROW 3 */}
        <div className="extra-row">
          {/* Rewards */}
          <div className="extra-card">
            <h3>Rewards Overview</h3>

            <div className="info-row">
              <span>Annual Reward</span>
              <strong>$1,200</strong>
            </div>

            <button className="green-btn">Details</button>
          </div>

          {/* Organizational */}
          <div className="extra-card">
            <h3>Organizational Structure</h3>

            <div className="info-row">
              <span>Company Employees</span>
              <strong>1,250</strong>
            </div>

            <div className="info-row">
              <span>Department Employees</span>
              <strong>42</strong>
            </div>

            <button className="green-btn">Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
