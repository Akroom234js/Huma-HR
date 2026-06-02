import React from 'react';
import './CompanyOverview.css';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import PerformanceDepartment from './PerformanceDepartment';
import Card from './Card';
import TaskStatusPool from './TaskStatusPool';
import TasksTable from './TastsTable';
const CompanyOverview = () => {
    const {t}=useTranslation("HrPerformance/CompanyOverview")
    return (
        <div className="performance-container CompanyOverview-container">
            <h2>{t('title')}</h2>
            <p>{t("des")}</p>
             <div className="em-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      <Card/> 
      <div className="chart-layout">
         <PerformanceDepartment/>
         <TaskStatusPool/>
      </div>
      <TasksTable/>
        </div>
    );
};

export default CompanyOverview;
// style="color:var(--color-scored); font-weight:600;"