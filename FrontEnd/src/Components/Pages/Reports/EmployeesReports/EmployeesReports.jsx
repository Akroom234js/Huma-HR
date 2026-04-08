import React, { useState } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import ReportsNavbar from "../components/ReportsNavbar/ReportsNavbar";
import FilterBar from "../components/FilterBar/FilterBar";
import ReportPdfPreview from "../components/ReportPdfPreview/ReportPdfPreview";
import "./EmployeesReports.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const turnoverData = [
  { name: "Jan", hires: 20, left: 5 },
  { name: "Feb", hires: 30, left: 8 },
  { name: "Mar", hires: 25, left: 6 },
  { name: "Apr", hires: 35, left: 10 },
  { name: "May", hires: 40, left: 12 },
  { name: "Jun", hires: 28, left: 7 },
];
const tenureData = [
  { range: "<1 yr", value: 120 },
  { range: "1-2 yrs", value: 300 },
  { range: "2-5 yrs", value: 450 },
  { range: "5-10 yrs", value: 250 },
  { range: ">10 yrs", value: 130 },
];
const pieData = [
  { name: "Junior", value: 45 },
  { name: "Mid-level", value: 35 },
  { name: "Senior", value: 20 },
];

const COLORS = ["#3b82f6", "#60a5fa", "#1d4ed8"];

const EmployeesReports = () => {
  const [showPreview, setShowPreview] = useState(false);

  // Configuration for PDF Export
  const reportConfig = {
    title: "Employee Reports & Analytics",
    summary: "This report provides a comprehensive overview of key human resources metrics. The data highlights a steady increase in new hires, employee experience distribution, and demographic breakdown across the organization.",
    kpis: [
      { label: "Total Employees", value: "1,250" },
      { label: "New Hires", value: "52" },
      { label: "Employees Left", value: "15" },
      { label: "Stability Rate", value: "98.8%" },
    ],
    sections: [
      {
        title: "Employee Turnover",
        content: (
          <LineChart width={650} height={250} data={turnoverData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="hires" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="left" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        )
      },
      {
        title: "Experience Level Distribution",
        content: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <PieChart width={250} height={200}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            <div className="pdf-legend-custom" style={{ fontSize: '14px' }}>
                {pieData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i] }}></span>
                        <span>{d.name}</span>
                        <span style={{ fontWeight: 'bold' }}>{d.value}%</span>
                    </div>
                ))}
            </div>
          </div>
        )
      },
      {
        title: "Employee Tenure Distribution",
        content: (
          <BarChart width={650} height={250} data={tenureData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        )
      }
    ],
    filename: "Employee_Analytics_Report.pdf"
  };

  return (
    <>
    <ReportPdfPreview 
        show={showPreview} 
        onClose={() => setShowPreview(false)} 
        {...reportConfig}
    />

    <div className="reports-page">
      <PageHeader
        title="Report & Analytics"
        Explanation="Company-wide employee status and digitalization insights."
        actions={
          <button className="emp-export-btn" onClick={() => setShowPreview(true)}>
            <i className="bi bi-file-earmark-arrow-down" /> Export PDF
          </button>
        }
      />
      <ReportsNavbar />
      <div className="con-car">
        <div className="card1">
          <p>Total Employees</p>
          <h3>1,250</h3>
        </div>
        <div className="card1">
          <p>New Hires</p>
          <h3>52</h3>
        </div>
        <div className="card1">
          <p>Employees Left</p>
          <h3>15</h3>
        </div>
        <div className="card1">
          <p>Stability Rate</p>
          <h3>98.8%</h3>
        </div>
      </div>

      <div className="row">
        <div className="card large">
          <h4>Employee Turnover</h4>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={turnoverData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line type="monotone" dataKey="hires" stroke="#3b82f6" />
              <Line type="monotone" dataKey="left" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card small">
          <h4>Experience Level</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            <div>
              <span className="dot blue"></span> Junior <span>45%</span>
            </div>
            <div>
              <span className="dot mid"></span> Mid-level <span>35%</span>
            </div>
            <div>
              <span className="dot dark"></span> Senior <span>20%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="diversity-card">
        <div className="diversity-header">
          <h4>Diversity Insights</h4>
          <a href="#" className="view-details-link">
            View Detailed Diversity
          </a>
        </div>

        <div className="diversity-content">
          <div className="div-item">
            <div className="icon-wrapper blue-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="div-text">
              <p className="label">Gender Ratio</p>
              <p className="value">60% Male, 40% Female</p>
            </div>
          </div>
          <div className="div-item">
            <div className="icon-wrapper blue-icon">
              <i className="fas fa-user-clock"></i>
            </div>
            <div className="div-text">
              <p className="label">Avg. Age</p>
              <p className="value">32 years</p>
            </div>
          </div>

          <div className="div-item">
            <div className="icon-wrapper blue-icon">
              <i className="fas fa-globe"></i>
            </div>
            <div className="div-text">
              <p className="label">Cultural Backgrounds</p>
              <p className="value">15+ Nationalities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="card large-flex">
          <h4>Talent Pool Overview</h4>
          <div className="talent-content">
            <div className="demographic-section">
              <p className="sub-title">Demographic Breakdown</p>
              <div className="chart-container-relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Male", value: 750 },
                        { name: "Female", value: 500 },
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#bfdbfe" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-center-text">
                  <h3>1,250</h3>
                </div>
              </div>
              <div className="gender-legend">
                <span>
                  <span className="dot male-dot"></span> Male
                </span>
                <span>
                  <span className="dot female-dot"></span> Female
                </span>
              </div>
            </div>

            <div className="skills-section">
              <p className="sub-title">Top Skills & Expertise</p>
              <div className="skills-grid">
                <span className="skill-badge blue-light">
                  Project Management
                </span>
                <span className="skill-badge blue-light">JavaScript</span>
                <span className="skill-badge grey-light">Data Analysis</span>
                <span className="skill-badge blue-light">React</span>
                <span className="skill-badge grey-light">UI/UX Design</span>
                <span className="skill-badge grey-light">Python</span>
                <span className="skill-badge blue-light">Cloud Computing</span>
                <span className="skill-badge grey-light">SQL</span>
              </div>
            </div>
          </div>
        </div>
        <div className="card small">
          <h4>Employee Tenure Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tenureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="tenure-footer">
            <div className="tenure-stat">
              <p>Avg. Tenure</p>
              <strong>3.8 years</strong>
            </div>
            <div className="tenure-stat">
              <p>Seniority Ratio</p>
              <strong>45%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default EmployeesReports;
