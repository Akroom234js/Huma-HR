import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import '../../../Sidebar/Sidebar'; // Reuse existing sidebar styles
import LanSw from '../../../LanSw'
import apiClient from '../../../../apiConfig';
import logo from '../../../../assets/logo.png';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';

const EmpSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation('Sidebar/Sidebar'); // We can reuse or create specific one
    const [isOpen, setIsOpen] = useState(false);

    // Retrieve user and role from local storage to check for department supervisor privileges
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isSupervisor = user && (user.role === 'department supervisor' || user.role === 'department_manager' || user.role === 'manager');

    const [openMenu, setOpenMenu] = useState(() => {
        if (location.pathname.startsWith('/portal/my-requests')) return 'requests';
        if (location.pathname.startsWith('/portal/performance')) return 'my_performance';
        if (location.pathname.startsWith('/portal/manager')) return 'manager_performance';
        return null;
    });

    // Check if sub-routes are active
    const isDashboardActive = location.pathname === '/portal/dashboard';
    const isProfileActive = location.pathname === '/portal/profile';
    const isRequestsActive = location.pathname.startsWith('/portal/my-requests');
    const isPayrollActive = location.pathname === '/portal/payroll';
    const isMyPerformanceActive = location.pathname.startsWith('/portal/performance');
    const isManagerPerformanceActive = location.pathname.startsWith('/portal/manager');
    const isRewardsActive = location.pathname === '/portal/rewards';
    const isChatActive = location.pathname === '/portal/chat';

    // Sync menu states on location change
    useEffect(() => {
        if (isRequestsActive) setOpenMenu('requests');
        else if (isMyPerformanceActive) setOpenMenu('my_performance');
        else if (isManagerPerformanceActive) setOpenMenu('manager_performance');
        else setOpenMenu(null);
    }, [location.pathname]);

    const handleSectionToggle = (menu, firstLink) => {
        if (firstLink) {
            navigate(firstLink);
        }
        setOpenMenu(prev => (prev === menu ? null : menu));
    };


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
                                <img src={logo} alt="Huma HR Logo" className="sidebar-logo" />
                                <h1 className="sidebar-title">Huma</h1>
                            </Link>
                        </div>

                        {/* ── Navigation ── */}
                        <nav className="sidebar-nav">
                            {/* Dashboard */}
                            <NavLink to="/portal/dashboard" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">dashboard</span>
                                <p>{t('Dashboard') || 'Dashboard'}</p>
                            </NavLink>

                            {/* Profile */}
                            <NavLink to="/portal/profile" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">person</span>
                                <p>{t('Profile') || 'My Profile'}</p>
                            </NavLink>

                            {/* My Requests (Accordion) */}
                            <NavLink
                                to="/portal/my-requests/leaves"
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <div className="nav-item-content">
                                    <span className="nav-icon material-symbols-outlined">assignment</span>
                                    <p>{t('My-Requests') || 'My Requests'}</p>
                                </div>
                            </NavLink>

                            {/* رابط الحضور المنفصل */}
                            <NavLink
                                to="/portal/my-requests/attendance"
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <div className="nav-item-content">
                                    <span className="nav-icon material-symbols-outlined">fingerprint</span>
                                    <p>{t('My-Attendance') || 'My Attendance'}</p>
                                </div>
                            </NavLink>

                            {/* Payroll */}
                            <NavLink to="/portal/payroll" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">payments</span>
                                <p>{t('Payroll') || 'Payroll'}</p>
                            </NavLink>

                            {/* My Performance (Accordion) */}
                            <div className="nav-section">
                                <button
                                    className={`nav-item nav-toggle ${isMyPerformanceActive ? 'active' : ''}`}
                                    onClick={() => handleSectionToggle('my_performance', '/portal/performance')}
                                >
                                    <div className="nav-item-content">
                                        <span className="nav-icon material-symbols-outlined">trending_up</span>
                                        <p>{t('My-Performance') || 'My Performance'}</p>
                                    </div>
                                    <span className={`material-symbols-outlined expand-icon ${openMenu === 'my_performance' ? 'expanded' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                <div className={`sub-menu ${openMenu === 'my_performance' ? 'open' : ''}`}>
                                    <NavLink to="/portal/performance" end className="sub-nav-item">
                                        {t('My-Tasks-Portal') || 'My Tasks Portal'}
                                    </NavLink>
                                    <NavLink to="/portal/performance/tasks/active" className="sub-nav-item">
                                        {t('Task-Details-View') || 'Task Details View'}
                                    </NavLink>
                                    <NavLink to="/portal/performance/report" className="sub-nav-item">
                                        {t('Performance-Report') || 'Performance Report'}
                                    </NavLink>
                                    <NavLink to="/portal/performance/peer-review" className="sub-nav-item">
                                        {t('Peer-Review-Form') || 'Peer Review Form'}
                                    </NavLink>
                                </div>
                            </div>

                            {/* Department Performance Accordion - Conditional for Supervisor */}
                            {isSupervisor && (
                                <div className="nav-section">
                                    <button
                                        className={`nav-item nav-toggle ${isManagerPerformanceActive ? 'active' : ''}`}
                                        onClick={() => handleSectionToggle('manager_performance', '/portal/manager/tasks')}
                                    >
                                        <div className="nav-item-content">
                                            <span className="nav-icon material-symbols-outlined">manage_accounts</span>
                                            <p>{t('Department-Performance') || 'Department Performance'}</p>
                                        </div>
                                        <span className={`material-symbols-outlined expand-icon ${openMenu === 'manager_performance' ? 'expanded' : ''}`}>
                                            expand_more
                                        </span>
                                    </button>
                                    <div className={`sub-menu ${openMenu === 'manager_performance' ? 'open' : ''}`}>
                                        <NavLink to="/portal/manager/tasks" className="sub-nav-item">
                                            {t('Department-Tasks') || 'Department Tasks'}
                                        </NavLink>
                                        <NavLink to="/portal/manager/tasks/new" className="sub-nav-item">
                                            {t('Assign-New-Task') || 'Assign New Task'}
                                        </NavLink>
                                        <NavLink to="/portal/manager/tasks/edit/active" className="sub-nav-item">
                                            {t('Edit-Task-Panel') || 'Edit Task Panel'}
                                        </NavLink>
                                        <NavLink to="/portal/manager/tasks/score/active" className="sub-nav-item">
                                            {t('Task-Score-Drawer') || 'Task Score Drawer'}
                                        </NavLink>
                                        <NavLink to="/portal/manager/evaluate/active" className="sub-nav-item">
                                            {t('Periodic-Evaluation') || 'Periodic Evaluation'}
                                        </NavLink>
                                        <NavLink to="/portal/manager/cycles" className="sub-nav-item">
                                            {t('Performance-Cycles') || 'Performance Cycles'}
                                        </NavLink>
                                    </div>
                                </div>
                            )}


                            {/* Rewards & Bonuses */}
                            <NavLink to="/portal/rewards" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">military_tech</span>
                                <p>{t('Rewards') || 'Rewards & Bonuses'}</p>
                            </NavLink>

                            {/* Chat & Notifications */}
                            <NavLink to="/portal/chat" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">chat</span>
                                <p>{t('Chat') || 'Chat & Notifications'}</p>
                            </NavLink>

                        </nav>
                    </div>

                    {/* ── Bottom ── */}
                    <div className="sidebar-bottom">
                        <LanSw />
                        <button onClick={handleLogout} className="nav-item logout-button">
                            <span className="nav-icon material-symbols-outlined">logout</span>
                            <p>{t('Logout') || 'Logout'}</p>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default EmpSidebar;
