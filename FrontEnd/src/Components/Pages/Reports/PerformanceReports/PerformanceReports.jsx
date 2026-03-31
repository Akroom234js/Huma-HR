import React from 'react';
import PageHeader from '../components/PageHeader/PageHeader';
import ReportsNavbar from '../components/ReportsNavbar/ReportsNavbar';
import FilterBar from '../components/FilterBar/FilterBar';
import './PerformanceReports.css';
import { useTranslation } from 'react-i18next';
const PerformanceReports = () => {
    const {t}=useTranslation("Reports/PerformanceReports")
    return (
        <div className="reports-page">
            <PageHeader title={t("PerformanceReports")} Explanation={t("Detailed")} />
            <ReportsNavbar />
                    <div className='leave-reports-co'>
             <div className='leave-reports'>
             <h5>{t("performance")}</h5>
              <div className='daily-attendance'>
              <p><i className='bi bi-star-fill blue'></i>   {t("Average")}</p>
                <p>4.2 <span className='score'>/5.0</span></p>
            </div>
            <div className='daily-attendance'>
              <p><i className='bi bi-check-circle-fill green'></i>   {t("rate")}</p>
                <p >94%</p>
            </div>
             <div className='daily-attendance'>
            <p><i className='bi bi-mortarboard blue'></i>   {t("Employees")}</p>
                <p>28</p>
            </div>
             <div className='daily-attendance daily-attendance-border'>
              <p><i className='bi bi-exclamation-triangle-fill red'></i>   {t("pips")}</p>
                <p className='red'>5</p>
            </div>
            
           
           </div></div>
        </div>
    );
};

export default PerformanceReports;
