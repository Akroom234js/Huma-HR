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

    const [openMenu, setOpenMenu] = useState(() => {
        if (location.pathname.startsWith('/portal/my-requests')) return 'requests';
        return null;
    });

    // Check if sub-routes are active
    const isDashboardActive = location.pathname === '/portal/dashboard';
    const isProfileActive = location.pathname === '/portal/profile';
    const isRequestsActive = location.pathname.startsWith('/portal/my-requests');
    const isPayrollActive = location.pathname === '/portal/payroll';
    const isPerformanceActive = location.pathname === '/portal/performance';
    const isRewardsActive = location.pathname === '/portal/rewards';
    const isChatActive = location.pathname === '/portal/chat';

    // Sync menu states on location change
    useEffect(() => {
        if (isRequestsActive) setOpenMenu('requests');
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
                            <Link to="/portal/dashboard">
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
                            {/* رابط الإجازات المنفصل */}
                            <NavLink
                                to="/portal/my-requests/leaves"
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <div className="nav-item-content">
                                    <span className="nav-icon material-symbols-outlined">event_available</span>
                                    <p>{t('My-Leaves') || 'My Leaves'}</p>
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

                            {/* Performance */}
                            <NavLink to="/portal/performance" className="nav-item">
                                <span className="nav-icon material-symbols-outlined">trending_up</span>
                                <p>{t('Performance') || 'Performance'}</p>
                            </NavLink>

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
