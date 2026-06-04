import React from 'react';
import './AutoActionsHub.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import PendingActions from './PendingActions';
import ActionsLog from './ActionsLog';
const AutoActionsHub = () => {
    const {t}=useTranslation("HrPerformance/AutoActionsHub")
    return (
        <div className="performance-container AutoActionsHub-container">
               <h1>{t("title")}</h1>
          <p>{t("des")}</p>
               <div className="em-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
        <PendingActions/>
        <br/>
        <ActionsLog/>
        </div>
    );
};

export default AutoActionsHub;
