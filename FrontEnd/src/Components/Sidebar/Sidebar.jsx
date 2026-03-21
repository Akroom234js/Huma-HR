import React, { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import LanSw from '../LanSw'
import apiClient from '../../apiConfig';
import logo from '../../assets/logo.png';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
    const [dashboardOpen, setDashboardOpen] = useState(false);
    const [departmentOpen, setDepartmentOpen] = useState(false);
    const [employeeOpen, setEmployeeOpen] = useState(false);
    const [salaryOpen, setSalaryOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation('Sidebar/Sidebar');
    const location = useLocation();

    // Check if sub-routes are active
    const isDashboardActive = location.pathname.startsWith('/dashboard');
    const isEmployeeActive = location.pathname.startsWith('/employees');
    const isDepartmentActive = location.pathname.startsWith('/department');
    const isSalaryActive = location.pathname.startsWith('/salary');
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await apiClient.delete('/auth/sessions');
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
        }
    };

    return (
        <>
            {/* Mobile Toggle */}
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

                        {/* ── Logo ── */}
                        <div className="sidebar-header">
                            <Link to="/">
                                {/* Original logo — always visible */}
                                <img src={logo} alt="Huma HR Logo" className="sidebar-logo" />
                                {/* Site name — appears on expand */}
                                <h1 className="sidebar-title">Huma</h1>
                            </Link>
                        </div>

                        {/* ── Navigation ── */}
                        <nav className="sidebar-nav">
                            <div className="nav-section">
                                <button
                                    className={`nav-item nav-toggle ${isDashboardActive || dashboardOpen ? 'active' : ''}`}
                                    onClick={() => setDashboardOpen(!dashboardOpen)}
                                >
                                    <div className="nav-item-content">
                                        <span className="material-symbols-outlined">dashboard</span>
                                        <p>{t('Dashboard')}</p>
                                    </div>
                                    <span className={`material-symbols-outlined expand-icon ${dashboardOpen ? 'expanded' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                {(dashboardOpen || isDashboardActive) && (
                                    <div className="sub-menu">
                                        <NavLink to="/dashboard/general" className="sub-nav-item">
                                            {t('General')}
                                        </NavLink>
                                        <NavLink to="/dashboard/employee-reports" className="sub-nav-item">
                                            {t('Employee-Reports')}
                                        </NavLink>
                                        <NavLink to="/dashboard/attendance" className="sub-nav-item">
                                            {t('Attendance')}
                                        </NavLink>
                                        <NavLink to="/dashboard/leaves" className="sub-nav-item">
                                            {t('Leaves')}
                                        </NavLink>
                                        <NavLink to="/dashboard/salaries" className="sub-nav-item">
                                            {t('Salaries')}
                                        </NavLink>
                                        <NavLink to="/dashboard/performance" className="sub-nav-item">
                                            {t('Overall-Performance')}
                                        </NavLink>
                                        <NavLink to="/dashboard/improvement" className="sub-nav-item">
                                            {t('Improvement-Statistics')}
                                        </NavLink>
                                    </div>
                                )}
                            </div>

                            {/* Employee Management */}
                            <div className="nav-section">
                                <button
                                    className={`nav-item nav-toggle ${isEmployeeActive || employeeOpen ? 'active' : ''}`}
                                    onClick={() => setEmployeeOpen(!employeeOpen)}
                                >
                                    <div className="nav-item-content">
                                        <span className="nav-icon material-symbols-outlined">group</span>
                                        <p>{t('Employee-Management')}</p>
                                    </div>
                                    <span className={`material-symbols-outlined expand-icon ${employeeOpen ? 'expanded' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                {employeeOpen && (
                                    <div className="sub-menu">
                                        <NavLink to="/employees/all" className="sub-nav-item">
                                            {t('All-Employees')}
                                        </NavLink>
                                        <NavLink to="/employees/movement" className="sub-nav-item">
                                            {t('Employee-Movement')}
                                        </NavLink>
                                    </div>
                                )}
                            </div>

                            {/* Department */}
                            <div className="nav-section">
                                <button
                                    className={`nav-item nav-toggle ${isDepartmentActive || departmentOpen ? 'active' : ''}`}
                                    onClick={() => setDepartmentOpen(!departmentOpen)}
                                >
                                    <div className="nav-item-content">
                                        <span className="nav-icon material-symbols-outlined">corporate_fare</span>
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

                            {/* Salary Management */}
                            <div className="nav-section">
                                <button
                                    className={`nav-item nav-toggle ${isSalaryActive || salaryOpen ? 'active' : ''}`}
                                    onClick={() => setSalaryOpen(!salaryOpen)}
                                >
                                    <div className="nav-item-content">
                                        <span className="nav-icon material-symbols-outlined">payments</span>
                                        <p>{t('Salary-Management')}</p>
                                    </div>
                                    <span className={`material-symbols-outlined expand-icon ${salaryOpen ? 'expanded' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                {salaryOpen && (
                                    <div className="sub-menu">
                                        <NavLink to="/salary/payroll-overview" className="sub-nav-item">
                                            {t('Payroll-Overview')}
                                        </NavLink>
                                        <NavLink to="/salary/salary-structure" className="sub-nav-item">
                                            {t('Salary-Structure')}
                                        </NavLink>
                                        <NavLink to="/salary/monthly-payroll" className="sub-nav-item">
                                            {t('Monthly-Payroll')}
                                        </NavLink>
                                        <NavLink to="/salary/salary-adjustments" className="sub-nav-item">
                                            {t('Salary-Adjustments')}
                                        </NavLink>
                                    </div>
                                )}
                            </div>

                            {/* Leaves */}
                            <NavLink to="/leaves" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">event_busy</span>
                                <p>{t('Leaves')}</p>
                            </NavLink>

                            {/* Performance */}
                            <NavLink to="/performance" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">trending_up</span>
                                <p>{t('Performance')}</p>
                            </NavLink>

                            {/* Recruitment */}
                            <NavLink to="/recruitment" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">person_add</span>
                                <p>{t('Recruitment')}</p>
                            </NavLink>

                            {/* Request */}
                            <NavLink to="/request" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">task_alt</span>
                                <p>{t('Request')}</p>
                            </NavLink>

                            {/* Reports */}
                            <NavLink to="/reports" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">summarize</span>
                                <p>{t('Reports')}</p>
                            </NavLink>

                        </nav>
                    </div>

                    {/* ── Bottom ── */}
                    <div className="sidebar-bottom">
                        <LanSw />
                        <button onClick={handleLogout} className="nav-item logout-button">
                            <span className="nav-icon material-symbols-outlined">logout</span>
                            <p>{t('Logout')}</p>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;