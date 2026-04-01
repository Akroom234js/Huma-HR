import React from "react";
import PageHeader from "../components/PageHeader/PageHeader";
import ReportsNavbar from "../components/ReportsNavbar/ReportsNavbar";
import FilterBar from "../components/FilterBar/FilterBar";
import "./AttendanceTracking.css";
import { useTranslation } from "react-i18next";
const AttendanceTracking = () => {
  const { t } = useTranslation("Reports/AttendanceTracking");
  return (
    <div className="reports-page">
      <PageHeader title={t("AttendanceTracking")} Explanation={t("Detailed")} />

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
  );
  // =======
  // import React from "react";
  // import PageHeader from "../components/PageHeader/PageHeader";
  // import ReportsNavbar from "../components/ReportsNavbar/ReportsNavbar";
  // import FilterBar from "../components/FilterBar/FilterBar";
  // import "./AttendanceTracking.css";

  // const AttendanceTracking = () => {
  //   return (
  //     <div className="reports-page">
  //       <PageHeader title="Attendance Tracking" />
  //       <ReportsNavbar />
  //       <FilterBar />
  //       <div className="reports-content">
  //         {/* Attendance tracking content will go here */}
  //       </div>
  //     </div>
  //   );
  // >>>>>>> Stashed changes
};

export default AttendanceTracking;
