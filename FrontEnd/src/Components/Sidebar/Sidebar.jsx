import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import LanSw from '../LanSw'
import logo from '../../assets/logo.png';

import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const [departmentOpen, setDepartmentOpen] = useState(false);
    const [salaryOpen, setSalaryOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation('Sidebar/Sidebar')
    return (
        <>
            <button
                className={`mobile-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
            >
                <span className="material-symbols-outlined">
                    {isOpen ? 'close' : 'menu'}
                </span>
            </button>

            {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <div className="sidebar-top">
                        <div className="sidebar-header">
                            <img src={logo} alt="Huma HR Logo" className="sidebar-logo" />
                            <h1 className="sidebar-title">Huma</h1>
                        </div>

                        <nav className="sidebar-nav">
                            <Link to="/" className="nav-item">
                                <span className="material-symbols-outlined">dashboard</span>
                                <p>{t('Dashboard')}</p>
                            </Link>

                            <Link to="/employees" className="nav-item">
                                <span className="material-symbols-outlined">group</span>
                                <p>{t('Employee-Management')}</p>
                            </Link>

                            <div className="nav-section">
                                <button
                                    className="nav-item nav-toggle"
                                    onClick={() => setDepartmentOpen(!departmentOpen)}
                                >
                                    <div className="nav-item-content">
                                        <span className="material-symbols-outlined">corporate_fare</span>
                                        <p>{t('Department')}</p>
                                    </div>
                                    <span className={`material-symbols-outlined expand-icon ${departmentOpen ? 'expanded' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                            </div>

                            <div className="nav-section">
                                <button
                                    className="nav-item nav-toggle"
                                    onClick={() => setSalaryOpen(!salaryOpen)}
                                >
                                    <div className="nav-item-content">
                                        <span className="material-symbols-outlined">payments</span>
                                        <p>{t('Salary-Management')}</p>
                                    </div>
                                    <span className={`material-symbols-outlined expand-icon ${salaryOpen ? 'expanded' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                            </div>

                            <Link to="/leaves" className="nav-item">
                                <span className="material-symbols-outlined">event_busy</span>
                                <p>{t('Leaves')}</p>
                            </Link>

                            <Link to="/performance" className="nav-item">
                                <span className="material-symbols-outlined">trending_up</span>
                                <p>{t('Performance')}</p>
                            </Link>

                            <Link to="/recruitment" className="nav-item active">
                                <span className="material-symbols-outlined material-symbols-filled">person_add</span>
                                <p>{t('Recruitment')}</p>
                            </Link>

                            <Link to="/request" className="nav-item">
                                <span className="material-symbols-outlined">task_alt</span>
                                <p>{t('Request')}</p>
                            </Link>

                            <Link to="/reports" className="nav-item">
                                <span className="material-symbols-outlined">summarize</span>
                                <p>{t('Reports')}</p>
                            </Link>
                        </nav>
                    </div>

                    <div className="sidebar-bottom">

                        <LanSw />
                        <Link to="/logout" className="nav-item">
                            <span className="material-symbols-outlined">logout</span>
                            <p>{t('Logout')}</p>
                        </Link>
                    </div >
                </div >
            </aside >
        </>
    );
};

export default Sidebar;