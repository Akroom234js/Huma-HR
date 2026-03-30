import React, { useRef, useState } from "react";
import "./EmployeesPdfPreview.css";
import html2pdf from "html2pdf.js";
import {
  PieChart,
  Pie,
  Cell,
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

/* ── static data (mirrors EmployeesReports) ── */
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

/* ────────────────────────────────────────────────
   EmployeesPdfPreview
   Full-screen overlay that shows an A4-sized
   preview and lets the user download it as PDF.
──────────────────────────────────────────────── */
const EmployeesPdfPreview = ({ onClose }) => {
  const a4Ref = useRef();
  const [loading, setLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleDownload = () => {
    setLoading(true);
    const el = a4Ref.current;
    const opt = {
      margin: 0,
      filename: "Employee_Reports.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };
    html2pdf()
      .set(opt)
      .from(el)
      .save()
      .then(() => setLoading(false));
  };

  return (
    <div className="pdf-preview-overlay">
      {/* ── Top Action Bar ── */}
      <div className="pdf-preview-topbar">
        <button className="pdf-preview-close" onClick={onClose} title="Close">
          <i className="bi bi-x-lg" />
        </button>
        <span className="pdf-preview-label">Preview — Employee Reports</span>
        <button
          className="pdf-preview-download-btn"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="bi bi-hourglass-split" /> Generating…
            </>
          ) : (
            <>
              <i className="bi bi-file-earmark-arrow-down" /> Download PDF
            </>
          )}
        </button>
      </div>

      {/* ── Scrollable A4 Canvas ── */}
      <div className="pdf-preview-scroll">
        <div className="pdf-a4" ref={a4Ref}>
          {/* ── Report Header ── */}
          <div className="pdf-report-header">
            <div className="pdf-logo-group">
              <div className="pdf-logo">HR</div>
              <div>
                <div className="pdf-report-title">HR Reports</div>
                <div className="pdf-report-date">{today}</div>
              </div>
            </div>
            <div className="pdf-report-actions-placeholder" />
          </div>

          <hr className="pdf-divider" />

          {/* ── Summary ── */}
          <div className="pdf-section-title">Report Summary</div>
          <p className="pdf-summary-text">
            This report provides a comprehensive overview of key human resources
            metrics. The data highlights a steady increase in new hires,
            employee experience distribution, and demographic breakdown across
            the organization.
          </p>

          {/* ── KPI Cards ── */}
          <div className="pdf-kpi-row">
            {[
              { label: "Total Employees", value: "1,250" },
              { label: "New Hires", value: "52" },
              { label: "Employees Left", value: "15" },
              { label: "Stability Rate", value: "98.8%" },
            ].map((k) => (
              <div className="pdf-kpi-card" key={k.label}>
                <div className="pdf-kpi-label">{k.label}</div>
                <div className="pdf-kpi-value">{k.value}</div>
              </div>
            ))}
          </div>

          {/* ── Charts row ── */}
          <div className="pdf-charts-row">
            {/* Turnover */}
            <div className="pdf-chart-box pdf-chart-large">
              <div className="pdf-chart-title">Employee Turnover</div>
              <LineChart width={360} height={200} data={turnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="hires" stroke="#3b82f6" dot={false} />
                <Line type="monotone" dataKey="left" stroke="#ef4444" dot={false} />
              </LineChart>
              <div className="pdf-chart-caption">
                Monthly comparison of new hires versus departing employees.
              </div>
            </div>

            {/* Experience Level */}
            <div className="pdf-chart-box pdf-chart-small">
              <div className="pdf-chart-title">Experience Level</div>
              <PieChart width={160} height={130}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
              <div className="pdf-legend">
                {pieData.map((d, i) => (
                  <div className="pdf-legend-item" key={d.name}>
                    <span
                      className="pdf-dot"
                      style={{ background: COLORS[i] }}
                    />
                    <span>{d.name}</span>
                    <span>{d.value}%</span>
                  </div>
                ))}
              </div>
              <div className="pdf-chart-caption">
                Distribution of workforce seniority levels.
              </div>
            </div>
          </div>

          {/* ── Demographic Breakdown ── */}
          <div className="pdf-chart-box pdf-chart-full" style={{ pageBreakInside: "avoid" }}>
            <div className="pdf-chart-title">Demographic Breakdown</div>
            <div className="pdf-demo-row">
              <div className="pdf-demo-chart">
                <PieChart width={160} height={140}>
                  <Pie
                    data={[
                      { name: "Male", value: 750 },
                      { name: "Female", value: 500 },
                    ]}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#bfdbfe" />
                  </Pie>
                </PieChart>
                <div className="pdf-demo-legend">
                  <span>
                    <span className="pdf-dot" style={{ background: "#3b82f6" }} /> Male: 55%
                  </span>
                  <span>
                    <span className="pdf-dot" style={{ background: "#bfdbfe" }} /> Female: 45%
                  </span>
                </div>
              </div>
              <div className="pdf-demo-details">
                <div className="pdf-diversity-item">
                  <strong>Gender Ratio</strong>
                  <span>60% Male, 40% Female</span>
                </div>
                <div className="pdf-diversity-item">
                  <strong>Average Age</strong>
                  <span>32 years</span>
                </div>
                <div className="pdf-diversity-item">
                  <strong>Cultural Backgrounds</strong>
                  <span>15+ Nationalities</span>
                </div>
              </div>
              <div className="pdf-demo-skills">
                <strong>Top Skills</strong>
                <div className="pdf-skills-grid">
                  {["Project Mgmt", "JavaScript", "Data Analysis", "React", "UI/UX", "Python", "Cloud", "SQL"].map(
                    (s) => (
                      <span className="pdf-skill-badge" key={s}>{s}</span>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="pdf-chart-caption">Gender ratio across the entire company workforce.</div>
          </div>

          {/* ── Tenure ── */}
          <div className="pdf-chart-box pdf-chart-full" style={{ pageBreakInside: "avoid" }}>
            <div className="pdf-chart-title">Employee Tenure Distribution</div>
            <BarChart width={520} height={180} data={tenureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
            <div className="pdf-tenure-stats">
              <div>
                <div className="pdf-stat-label">Avg. Tenure</div>
                <strong>3.8 years</strong>
              </div>
              <div>
                <div className="pdf-stat-label">Seniority Ratio</div>
                <strong>45%</strong>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="pdf-footer">Page 1 of 1</div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPdfPreview;
