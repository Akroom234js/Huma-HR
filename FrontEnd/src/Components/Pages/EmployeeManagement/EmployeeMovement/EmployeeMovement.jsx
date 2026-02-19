import React from 'react';
import './EmployeeMovement.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';

const EmployeeMovement = () => {
    const { t } = useTranslation('Sidebar/Sidebar');

    return (
        <div className="employee-movement-page">
            <header className="page-header">
                <div className="header-info">
                    <h1>{t('Employee-Movement')}</h1>
                </div>
                <ThemeToggle />
            </header>
        </div>
    );
};

export default EmployeeMovement;
