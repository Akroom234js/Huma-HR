import React, { useState } from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import ReportsNavbar from "../components/ReportsNavbar/ReportsNavbar";
import FilterBar from "../components/FilterBar/FilterBar";
import ReportPdfPreview from "../components/ReportPdfPreview/ReportPdfPreview";
import "./AttendanceTracking.css";
import { useTranslation } from "react-i18next";

const AttendanceTracking = () => {
  const { t } = useTranslation("Reports/AttendanceTracking");
  const [showPreview, setShowPreview] = useState(false);

  const reportConfig = {
    title: t("AttendanceTracking"),
    summary: "This report provides a daily overview of employee attendance, time tracking efficiency, and compliance indicators. It highlights attendance trends and actionable insights for management.",
    kpis: [
      { label: t("present"), value: "1,250" },
      { label: t("absent"), value: "45" },
      { label: t("compliance"), value: "97.5%" },
      { label: "Total Late", value: "12" },
    ],
    sections: [
        {
            title: t("time"),
            content: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="pdf-stat-box">
                        <p style={{ margin: '5px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '12px' }}>{t("Average")}:</span> 
                            <strong style={{ float: 'right' }}>7.8 {t("hours")}</strong>
                        </p>
                        <p style={{ margin: '5px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '12px' }}>{t("overtime")}:</span> 
                            <strong style={{ float: 'right' }}>243 {t("hours")}</strong>
                        </p>
                    </div>
                    <div className="pdf-stat-box">
                        <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>{t("Breakdown")}:</span>
                        <div style={{ fontSize: '13px' }}>
                            <p style={{ margin: '3px 0' }}>{t("Sick")} <span style={{ float: 'right', fontWeight: 'bold' }}>20 (44%)</span></p>
                            <p style={{ margin: '3px 0' }}>{t("Annual")} <span style={{ float: 'right', fontWeight: 'bold' }}>15 (33%)</span></p>
                            <p style={{ margin: '3px 0' }}>{t("Unpaid")} <span style={{ float: 'right', fontWeight: 'bold' }}>10 (23%)</span></p>
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
                        <p style={{ fontSize: '20px', fontWeight: '800', color: '#22c55e' }}>97.5%</p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '5px' }}>{t("Frequency")}</p>
                        <p style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>57 <small style={{ fontWeight: 'normal', fontSize: '12px' }}>({t("Trending")} Down)</small></p>
                    </div>
                </div>
            )
        },
        {
            title: t("Actionable"),
            content: (
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700' }}>{t("Departments")} High Overtime:</p>
                    <div style={{ display: 'flex', gap: '30px' }}>
                        <div><strong style={{ display: 'block' }}>{t("Engineering")}</strong> <span style={{ color: '#64748b' }}>120 {t("hours")}</span></div>
                        <div><strong style={{ display: 'block' }}>{t("Product")}</strong> <span style={{ color: '#64748b' }}>75 {t("hours")}</span></div>
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

      <div className="vorview-daily-attendance">
        <h5>{t("overview")}</h5>
        <div className="daily-attendance">
          <p>{t("present")}</p>
          <p>1250</p>
        </div>
        <div className="daily-attendance">
          <p>{t("absent")}</p>
          <p>45</p>
        </div>
        <div className="daily-attendance daily-attendance-border">
          <p>{t("last")}</p>
          <p>2</p>
        </div>
      </div>

      <div className="vorview-daily-attendance">
        <h5>{t("time")}</h5>
        <div className="daily-attendance">
          <p>{t("Average")}</p>
          <p>12 {t("hours")}</p>
        </div>
        <div className="daily-attendance">
          <p>{t("overtime")}</p>
          <p>12 {t("hours")}</p>
        </div>
        <div className="daily-attendance daily-attendance-border">
          <p>{t("Breakdown")}</p>
          <div>
            <p>
              {t("Sick")} <span>20 (44%)</span>
            </p>
            <p>
              {t("Annual")} <span>15 (33%)</span>
            </p>
            <p>
              {t("Unpaid")} <span>10 (23%)</span>
            </p>
          </div>
        </div>
      </div>

      <div className="vorview-daily-attendance">
        <h5>{t("Key")}</h5>
        <div className="daily-attendance">
          <p>{t("compliance")}</p>
          <p className="green">97.5%</p>
        </div>

        <div className="daily-attendance daily-attendance-border">
          <p>{t("Frequency")}</p>
          <p className="red">57 ({t("Trending")})</p>
        </div>
      </div>

      <div className="vorview-daily-attendance">
        <h5>{t("Actionable")}</h5>
        <div className="daily-attendance">
          <p>{t("Employees")}</p>
          <p>12 {t("hours")}</p>
        </div>
        <div className="daily-attendance daily-attendance-border">
          <p>{t("Departments")}</p>
          <div>
            <p>
              {t("Engineering")} <span>120 {t("hours")}</span>
            </p>
            <p>
              {t("Product")} <span>75 {t("hours")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AttendanceTracking;
