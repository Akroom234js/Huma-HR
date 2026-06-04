import React from 'react';
import './PerformanceReports.css';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import ReportsTable from './ReportsTable';

const PerformanceReports = () => {
    const {t}=useTranslation("HrPerformance/PerformanceReports")

    return (
        <div className="performance-container PerformanceReports-container">
          <div className='fl-per'>
      <div>
          <h1>{t("title")}</h1>
          <p>{t("des")}</p>
      </div>
            <button className="btn btn-secondary pos-per" onclick="exportReportsCSV()">
          <i className="fa-solid fa-file-export"></i> {t("Export")}
        </button>
          </div>
     
           <div className="em-theme-toggle-wrapper">
          <ThemeToggle />
            
        </div>


           <div className="card">
        <div className="card-title">
          <span>{t("Consolidated")}</span>
          <div className="filter-group">
            <span className="filter-label">{t("Selection")}</span>
            <select className="select-input" >
              <option selected>{t("First")} 2026 (Q1)</option>
              <option>{t("Fourth")} 2025 (Q4)</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="custom-table" id="consolidatedScoreTable">
            <thead>
              <tr>
                <th>{t("table.Employee")}</th>
                <th>{t("table.Department")}</th>
                <th>{t("table.Task")} (40%)</th>
                <th>{t("table.Manager")} (25%)</th>
                <th>{t("table.Peers")} (15%)</th>
                <th>{t("table.Attend")} (10%)</th>
                <th>{t("table.Overtime")} (10%)</th>
                <th className='grade-hr'>{t("table.Grade")}</th>
                <th>{t("table.Decision")}</th>
              </tr>
            </thead>
            <tbody>
               <ReportsTable/>
            </tbody>
          </table>
        </div>
        
      </div>
   
        </div>
    );
};

export default PerformanceReports;
