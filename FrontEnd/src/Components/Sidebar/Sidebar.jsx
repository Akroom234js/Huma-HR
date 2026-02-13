import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
                            <Link to="/home">
                                <img src={logo} alt="Huma HR Logo" className="sidebar-logo" />
                                <h1 className="sidebar-title">Huma</h1>
                            </Link>
                        </div>

                        <nav className="sidebar-nav">
                            <NavLink to="/" className="nav-item" end>
                                <span className="material-symbols-outlined">dashboard</span>
                                <p>{t('Dashboard')}</p>
                            </NavLink>

                            <NavLink to="/employees" className="nav-item">
                                <span className="material-symbols-outlined">group</span>
                                <p>{t('Employee-Management')}</p>
                            </NavLink>

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
                                {departmentOpen && (
                                    <div className="sub-menu">
                                        <NavLink to="/department/overview" className="sub-nav-item">
                                            {t('Department-Overview')}
                                        </NavLink>
                                        <NavLink to="/department/org-chart" className="sub-nav-item">
                                            {t('Organizational-Chart')}
                                        </NavLink>
                                        <NavLink to="/department/positions" className="sub-nav-item">
                                            {t('Positions-Roles')}
                                        </NavLink>
                                    </div>
                                )}
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

                            <NavLink to="/leaves" className="nav-item">
                                <span className="material-symbols-outlined">event_busy</span>
                                <p>{t('Leaves')}</p>
                            </NavLink>

                            <NavLink to="/performance" className="nav-item">
                                <span className="material-symbols-outlined">trending_up</span>
                                <p>{t('Performance')}</p>
                            </NavLink>

                            <NavLink to="/recruitment" className="nav-item">
                                <span className="material-symbols-outlined material-symbols-filled">person_add</span>
                                <p>{t('Recruitment')}</p>
                            </NavLink>

                            <NavLink to="/request" className="nav-item">
                                <span className="material-symbols-outlined">task_alt</span>
                                <p>{t('Request')}</p>
                            </NavLink>

                            <NavLink to="/reports" className="nav-item">
                                <span className="material-symbols-outlined">summarize</span>
                                <p>{t('Reports')}</p>
                            </NavLink>
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