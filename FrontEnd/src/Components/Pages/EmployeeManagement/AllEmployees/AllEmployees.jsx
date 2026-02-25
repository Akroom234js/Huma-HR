// import React from 'react';
import './AllEmployees.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';

const AllEmployees = () => {
    const { t } = useTranslation('Sidebar/Sidebar');

    return (
        <div className="all-employees-page">
            <header className="page-header">
                <div className="header-info">
                    <h1>{t('All-Employees')}</h1>

                </div>
                <ThemeToggle />
            </header>
        </div>
    );
};

export default AllEmployees;
