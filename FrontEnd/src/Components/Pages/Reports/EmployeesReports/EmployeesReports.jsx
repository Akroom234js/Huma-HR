import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import ReportsNavbar from "../components/ReportsNavbar/ReportsNavbar";
import FilterBar from "../components/FilterBar/FilterBar";
import ReportPdfPreview from "../components/ReportPdfPreview/ReportPdfPreview";
import "./EmployeesReports.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import apiClient from "../../../../apiConfig";
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

const COLORS = ["#3b82f6", "#60a5fa", "#1d4ed8"];
const GENDER_COLORS = ["#3b82f6", "#ec4899"];

export default function EmployeesReports() {
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Filter Parameters
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Report Data State
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchEmployeesReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (month) params.month = month;
        if (year) params.year = year;

        const res = await apiClient.get('/reports/employees', { params });
        const result = res.data;

        if (result && result.status) {
          setReportData(result.data);
        }
      } catch (err) {
        console.error("Failed fetching employees report:", err);
        setError("Failed to fetch employees report data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesReport();
  }, [month, year]);

  // Data Formatting for Recharts
  const turnoverData = reportData?.turnover?.map(item => ({
    name: item.month || "N/A",
    hires: item.hires || 0,
    left: item.left || 0
  })) || [];

  const pieData = reportData?.experience_levels?.map(item => ({
    name: item.level || "N/A",
    value: item.percentage || 0
  })) || [];

  const tenureData = reportData?.tenure_distribution?.map(item => ({
    range: item.range || "N/A",
    value: item.count || 0
  })) || [];

  // Strict Dynamic Extraction (Backend values OR 0 / N/A)
  const diversity = reportData?.diversity || {};
  
  const malePercentage = diversity.male_percentage ?? diversity.male ?? 0;
  const femalePercentage = diversity.female_percentage ?? diversity.female ?? 0;
  
  const genderRatioText = diversity.gender_ratio 
    || `${malePercentage}% Male, ${femalePercentage}% Female`;
    
  const culturalBackgroundsText = diversity.cultural_backgrounds 
    || diversity.nationalities 
    || "0";

  const avgAgeText = (diversity.avg_age !== undefined && diversity.avg_age !== null) 
    ? `${diversity.avg_age} years` 
    : "0 years";

  const genderData = [
    { name: "Male", value: malePercentage },
    { name: "Female", value: femalePercentage }
  ];

  // Dynamic values for summary KPIs
  const totalEmployees = reportData?.summary?.total_employees ?? 0;
  const newHires = reportData?.summary?.new_hires ?? 0;
  const employeesLeft = reportData?.summary?.employees_left ?? 0;
  const stabilityRate = reportData?.summary?.stability_rate || "0%";

  // Configuration for PDF Export
  const reportConfig = {
    title: "Employee Reports & Analytics",
    summary: "This report provides a comprehensive overview of key human resources metrics. The data highlights employee experience distribution, tenure breakdown, and recent turnover rates.",
    kpis: [
      { label: "Total Employees", value: totalEmployees.toString() },
      { label: "New Hires", value: newHires.toString() },
      { label: "Employees Left", value: employeesLeft.toString() },
      { label: "Stability Rate", value: stabilityRate },
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
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            <div className="pdf-legend-custom" style={{ fontSize: '14px' }}>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></span>
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

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading employee report data...</div>;
  if (error) return <div className="error-message" style={{ padding: "20px", color: "red", textAlign: "center" }}>{error}</div>;

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
        
        {/* FilterBar Integration */}
        <FilterBar 
          month={month} 
          year={year} 
          onMonthChange={(e) => setMonth(e.target.value)} 
          onYearChange={(e) => setYear(e.target.value)} 
        />

        <div className="con-car">
          <div className="card1">
            <p>Total Employees</p>
            <h3>{totalEmployees}</h3>
          </div>
          <div className="card1">
            <p>New Hires</p>
            <h3>{newHires}</h3>
          </div>
          <div className="card1">
            <p>Employees Left</p>
            <h3>{employeesLeft}</h3>
          </div>
          <div className="card1">
            <p>Stability Rate</p>
            <h3>{stabilityRate}</h3>
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
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend">
              {pieData.map((item, idx) => (
                <div key={idx}>
                  <span className={`dot ${idx === 0 ? 'blue' : idx === 1 ? 'mid' : 'dark'}`}></span>
                  {item.name} <span>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Diversity Insights Card */}
        <div className="diversity-card">
          <div className="diversity-header">
            <h4>Diversity Insights</h4>
          </div>

          <div className="diversity-content">
            <div className="div-item">
              <div className="icon-wrapper blue-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="div-text">
                <p className="label">Demographic Breakdown</p>
                <p className="value">{totalEmployees}</p>
              </div>
            </div>

            <div className="div-item gender-chart-item">
              <div style={{ width: "60px", height: "60px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={18}
                      outerRadius={28}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={index} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="div-text">
                <p className="label">Gender Ratio</p>
                <p className="value">{genderRatioText}</p>
              </div>
            </div>

            <div className="div-item">
              <div className="icon-wrapper blue-icon">
                <i className="fas fa-globe"></i>
              </div>
              <div className="div-text">
                <p className="label">Cultural Backgrounds</p>
                <p className="value">{culturalBackgroundsText}</p>
              </div>
            </div>

            <div className="div-item">
              <div className="icon-wrapper blue-icon">
                <i className="fas fa-user-clock"></i>
              </div>
              <div className="div-text">
                <p className="label">Avg. Age</p>
                <p className="value">{avgAgeText}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="card large-flex">
            <h4>Talent Pool Overview</h4>
            <div className="talent-content">
              <div className="skills-section" style={{ width: '100%' }}>
                <p className="sub-title">Top Skills & Expertise</p>
                <div className="skills-grid">
                  <span className="skill-badge blue-light">Project Management</span>
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
                <strong>{reportData?.avg_tenure_years !== undefined ? `${reportData.avg_tenure_years} years` : "0 years"}</strong>
              </div>
              <div className="tenure-stat">
                <p>Seniority Ratio</p>
                <strong>{reportData?.seniority_ratio || "0%"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}