import React from 'react';
import './PerformanceReports.css';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import ReportsTable from './ReportsTable';
import { Modal } from 'bootstrap';
import CycleModal from './CycleModal';
import Message from './Message';
    // ── Cycle Modal Logic ─────────────────────────────────────────
    const show=()=>{
      console.log('fdfdf')
                const container = document.querySelector('.cycle-modal-hr');
            if (container) {
                document.body.style.overflow = 'hidden';
                container.style.display = 'flex';
             
            }
    }
    const message=()=>{
      console.log('fdfdf')
                const container = document.querySelector('.del-cycle-hr');
            if (container) {
                document.body.style.overflow = 'hidden';
                container.style.display = 'flex';
             
            }
    }
const PerformanceReports = () => {
    const {t}=useTranslation("HrPerformance/PerformanceReports")

    return (
        <div className="performance-container PerformanceReports-container">
          <div className="cycle-modal-hr">
            <CycleModal/>
          </div>
          <div className="del-cycle-hr">
            <Message/>
          </div>
          <div className='fl-per'>
      <div>
          <h1>{t("title")}</h1>
          <p>{t("des")}</p>
      </div>
        <div>
              <button className="btn btn-secondary pos-per" onClick="exportReportsCSV()">
          <i className="fa-solid fa-file-export"></i> {t("Export")}
        </button>
        <button className="btn btn-start-cycle" onClick={()=>show()} id="startCycleBtn">
            <i className="fa-solid fa-circle-play"></i>
            <span>Start New Cycle</span>
            <span className="pulse-dot"></span>
          </button>
        </div>
          </div>
     
           <div className="em-theme-toggle-wrapper">
          <ThemeToggle />
            
        </div>


           <div className="card">
        <div className="card-title fl-hr-re">
        <div>  <span>{t("Consolidated")}</span>
          <div className="filter-group">
            <span className="filter-label">{t("Selection")}</span>
            <select className="select-input" >
              <option selected>{t("First")} 2026 (Q1)</option>
              <option>{t("Fourth")} 2025 (Q4)</option>
            </select>
          </div></div>
          <div>
            <button className='btn btn-start-cycle btn-edit-cycle' onClick={()=>show()}>{t("edit")}</button>
            <button className='btn btn-start-cycle btn-del-cycle' onClick={()=>message()}>{t("delete")}</button>
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
