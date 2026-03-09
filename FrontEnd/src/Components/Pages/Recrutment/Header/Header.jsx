import React from 'react';
import './Header.css';
import { useTranslation } from 'react-i18next';
const Header = ({ onCreateJob }) => {
            const {t}=useTranslation("Recrutment/ToScheduleInterview")
    return (
        <header className="page-header">
            <div className="header-actions">
                <button className="btn-primary" onClick={onCreateJob}>
                    <span className="material-symbols-outlined">add</span>
                   { t('create')}
                </button>

            </div>
        </header>
    );
};

export default Header;
