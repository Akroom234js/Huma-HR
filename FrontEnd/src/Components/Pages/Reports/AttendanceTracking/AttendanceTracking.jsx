
import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import ReportsNavbar from "../components/ReportsNavbar/ReportsNavbar";
import FilterBar from "../components/FilterBar/FilterBar";
import ReportPdfPreview from "../components/ReportPdfPreview/ReportPdfPreview";
import "./AttendanceTracking.css";
import { useTranslation } from "react-i18next";
import apiClient from "../../../../apiConfig";

const AttendanceTracking = () => {
  const { t } = useTranslation("Reports/AttendanceTracking");
  const [showPreview, setShowPreview] = useState(false);

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);

  useEffect(() => {
    const fetchAttendanceReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentDate = new Date();
        const rawMonth = month || (currentDate.getMonth() + 1);
        const selectedYear = year || currentDate.getFullYear();

        const formattedMonth = parseInt(rawMonth, 10);
        const formattedYear = parseInt(selectedYear, 10);

        const res = await apiClient.get('/reports/attendance', {
          params: {
            month: formattedMonth,
            year: formattedYear
          }
        });

        const result = res.data;
console.log("Attendance Report API Response:", result); 
        if (result && (result.status === 'success' || result.status === true) && result.data) {
          setReportData(result.data);
        } else if (result && result.data) {
          setReportData(result.data);
        }
      } catch (err) {
        console.error("Failed fetching attendance report:", err);

        if (err.response?.status === 403) {
          setError(t("unauthorized") || "This action is unauthorized (HR Only).");
        } else if (err.response?.status === 422) {
          setError(t("invalidParameters") || "Invalid month or year parameter.");
        } else if (err.response?.status === 500) {
          setError(err.response.data?.message || t("serverError") || "Server error occurred while processing the report.");
        } else {
          setError(t("error") || "Failed to fetch report data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceReport();
  }, [month, year, t]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>{t("loading") || "Loading..."}</div>;
  if (error) return <div className="error-message" style={{ padding: "20px", color: "red", textAlign: "center" }}>{error}</div>;

  const overview = reportData?.overview || {};
  const timeTracking = reportData?.time_tracking || {};
  const absenceBreakdown = reportData?.absence_breakdown || [];
  const complianceRate = reportData?.compliance_rate ?? "N/A";
  const absenceFrequency = reportData?.absence_frequency ?? 0;
  const highOvertimeDepts = reportData?.departments_high_overtime || [];
  const dataNotes = reportData?.data_notes || null;

  const reportConfig = {
    title: t("AttendanceTracking"),
    summary: "This report provides a daily overview of employee attendance, time tracking efficiency, and compliance indicators. It highlights attendance trends and actionable insights for management.",
    kpis: [
      { label: t("present"), value: String(overview.present ?? 0) },
      { label: t("absent"), value: String(overview.absent ?? 0) },
      { label: t("compliance"), value: String(complianceRate) },
      { label: "Total Late", value: String(overview.late ?? 0) },
    ],
    sections: [
      {
        title: t("time"),
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="pdf-stat-box">
              <p style={{ margin: '5px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{t("Average")}:</span> 
                <strong style={{ float: 'right' }}>{timeTracking.avg_hours_worked ?? 0} {t("hours")}</strong>
              </p>
              <p style={{ margin: '5px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{t("overtime")}:</span> 
                <strong style={{ float: 'right' }}>{timeTracking.total_overtime_hours ?? 0} {t("hours")}</strong>
              </p>
            </div>
            <div className="pdf-stat-box">
              <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>{t("Breakdown")}:</span>
              <div style={{ fontSize: '13px' }}>
                {absenceBreakdown.length === 0 ? (
                  <p style={{ margin: '3px 0', color: '#94a3b8' }}>No breakdown data</p>
                ) : (
                  absenceBreakdown.map((item, idx) => (
                    <p key={idx} style={{ margin: '3px 0' }}>
                      {item.type} <span style={{ float: 'right', fontWeight: 'bold' }}>{item.count} ({item.percentage})</span>
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      },
      {
        title: t("Key"),
        content: (
          <div style={{ display: 'flex', gap: '50px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>{t("compliance")}</p>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#22c55e' }}>{complianceRate}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>{t("Frequency")}</p>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>{absenceFrequency}</p>
            </div>
          </div>
        )
      },
      {
        title: t("Actionable"),
        content: (
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700' }}>{t("Departments")} High Overtime:</p>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              {highOvertimeDepts.length === 0 ? (
                <span style={{ color: '#94a3b8' }}>No departments with high overtime</span>
              ) : (
                highOvertimeDepts.map((dept, idx) => (
                  <div key={idx}>
                    <strong style={{ display: 'block' }}>{dept.department}</strong> 
                    <span style={{ color: '#64748b' }}>{dept.hours} {t("hours")}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      }
    ],
    filename: "Attendance_Report.pdf"
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
          title={t("AttendanceTracking")} 
          Explanation={t("Detailed")}
          actions={
            <button className="emp-export-btn" onClick={() => setShowPreview(true)}>
              <i className="bi bi-file-earmark-arrow-down" /> Export PDF
            </button>
          }
        />

        <ReportsNavbar />
        
        <FilterBar onFilterChange={(m, y) => { setMonth(m); setYear(y); }} />

        {dataNotes?.absent_calculation && (
          <div style={{ background: '#eff6ff', color: '#1e40af', padding: '10px 15px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px' }}>
            <i className="bi bi-info-circle-fill" style={{ marginRight: '8px' }} />
            {dataNotes.absent_calculation}
          </div>
        )}

        <div className="vorview-daily-attendance">
          <h5>{t("overview")}</h5>
          <div className="daily-attendance">
            <p>{t("present")}</p>
            <p>{overview.present ?? 0}</p>
          </div>
          <div className="daily-attendance">
            <p>{t("absent")}</p>
            <p>{overview.absent ?? 0}</p>
          </div>
          <div className="daily-attendance daily-attendance-border">
            <p>{t("last") || "Late"}</p>
            <p>{overview.late ?? 0}</p>
          </div>
        </div>

        <div className="vorview-daily-attendance">
          <h5>{t("time")}</h5>
          <div className="daily-attendance">
            <p>{t("Average")}</p>
            <p>{timeTracking.avg_hours_worked ?? 0} {t("hours")}</p>
          </div>
          <div className="daily-attendance">
            <p>{t("overtime")}</p>
            <p>{timeTracking.total_overtime_hours ?? 0} {t("hours")}</p>
          </div>
          <div className="daily-attendance daily-attendance-border">
            <p>{t("Breakdown")}</p>
            <div>
              {absenceBreakdown.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>No data</p>
              ) : (
                absenceBreakdown.map((item, index) => (
                  <p key={index}>
                    {item.type} <span>{item.count} ({item.percentage})</span>
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="vorview-daily-attendance">
          <h5>{t("Key")}</h5>
          <div className="daily-attendance">
            <p>{t("compliance")}</p>
            <p className="green">{complianceRate}</p>
          </div>

          <div className="daily-attendance daily-attendance-border">
            <p>{t("Frequency")}</p>
            <p className="red">{absenceFrequency}</p>
          </div>
        </div>

        <div className="vorview-daily-attendance">
          <h5>{t("Actionable")}</h5>
          <div className="daily-attendance daily-attendance-border">
            <p>{t("Departments")}</p>
            <div>
              {highOvertimeDepts.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>No departments data</p>
              ) : (
                highOvertimeDepts.map((dept, index) => (
                  <p key={index}>
                    {dept.department} <span>{dept.hours} {t("hours")}</span>
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceTracking;