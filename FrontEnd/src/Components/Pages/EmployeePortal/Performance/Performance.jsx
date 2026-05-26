import React from "react";
import "./Performance.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";

export default function PerformanceManagement() {
  return (
    <div className="performance-page">
      <h1 className="page-title">Performance Management</h1>

      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="performance-grid">
        <div className="card total-score-card">
          <h2>Total Score</h2>

          <div className="score-box">
            <span className="score">8.5</span>
            <span className="score-total">/10</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          <p>
            Your performance is rated as
            <br />
            <strong>Excellent.</strong>
          </p>
        </div>

        <div className="card evaluation-card">
          <h2>Performance Evaluations</h2>

          <div className="evaluation-chart">
            <div className="bars">
              <div className="bar" style={{ height: "60%" }}></div>
              <div className="bar" style={{ height: "75%" }}></div>
              <div className="bar active" style={{ height: "90%" }}></div>
              <div className="bar" style={{ height: "70%" }}></div>
              <div className="bar" style={{ height: "85%" }}></div>
            </div>

            <div className="chart-labels">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>
          </div>
        </div>

        <div className="row-flex">
          <div className="card cumulative-card">
            <h2>Cumulative Points Overview</h2>

            <table className="cumulative-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Your Score</th>
                  <th>Benchmark</th>
                  <th>System Management</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Q1 2024</td>
                  <td>8.2</td>
                  <td>7.5</td>
                  <td className="green">On Track</td>
                </tr>

                <tr>
                  <td>Q2 2024</td>
                  <td>8.5</td>
                  <td>7.8</td>
                  <td className="green">Exceeding</td>
                </tr>

                <tr>
                  <td>Q3 2024</td>
                  <td>8.7</td>
                  <td>8.0</td>
                  <td className="green">Exceeding</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card rating-card">
            <h2>Performance Rating</h2>

            <div className="rating-item">
              <h3>Manager's Rating</h3>

              <div className="rating-row">
                <span className="badge">Excellent</span>
                <span>Score: 9.0/10</span>
              </div>
            </div>

            <div className="rating-item">
              <h3>System Rating</h3>

              <div className="rating-row">
                <span className="badge">Good</span>
                <span>Score: 8.3/10</span>
              </div>
            </div>

            <button className="details-btn">Details</button>
          </div>
        </div>

        <div className="row-flex">
          <div className="card trend-card">
            <h2>Performance Trend</h2>

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
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
            </div>
          </div>

          <div className="card courses-card">
            <div className="courses-header">
              <h2>Suggested Courses</h2>

              <button>+ Suggest</button>
            </div>

            <div className="course-item">
              <span>Advanced Communication</span>
              <span>4 Hours</span>
            </div>

            <div className="course-item">
              <span>Project Management Basics</span>
              <span>8 Hours</span>
            </div>

            <div className="course-item">
              <span>Leadership Skills</span>
              <span>12 Hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
