import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

import logo from '../../assets/logo.png';

import ThemeToggle from '../ThemeToggle/ThemeToggle';

const Sidebar = () => {
    const [departmentOpen, setDepartmentOpen] = useState(false);
    const [salaryOpen, setSalaryOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

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
                                <p>Dashboard</p>
                            </Link>

                            <Link to="/employees" className="nav-item">
                                <span className="material-symbols-outlined">group</span>
                                <p>Employee Management</p>
                            </Link>

                            <div className="nav-section">
                                <button
                                    className="nav-item nav-toggle"
                                    onClick={() => setDepartmentOpen(!departmentOpen)}
                                >
                                    <div className="nav-item-content">
                                        <span className="material-symbols-outlined">corporate_fare</span>
                                        <p>Department</p>
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
                                        <p>Salary Management</p>
                                    </div>
                                    <span className={`material-symbols-outlined expand-icon ${salaryOpen ? 'expanded' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                            </div>

                            <Link to="/leaves" className="nav-item">
                                <span className="material-symbols-outlined">event_busy</span>
                                <p>Leaves</p>
                            </Link>

                            <Link to="/performance" className="nav-item">
                                <span className="material-symbols-outlined">trending_up</span>
                                <p>Performance</p>
                            </Link>

                            <Link to="/recruitment" className="nav-item active">
                                <span className="material-symbols-outlined material-symbols-filled">person_add</span>
                                <p>Recruitment</p>
                            </Link>

                            <Link to="/request" className="nav-item">
                                <span className="material-symbols-outlined">task_alt</span>
                                <p>Request</p>
                            </Link>

                            <Link to="/reports" className="nav-item">
                                <span className="material-symbols-outlined">summarize</span>
                                <p>Reports</p>
                            </Link>
                        </nav>
                    </div>

                    <div className="sidebar-bottom">

                        {/* <div style={{ padding: '0 0.75rem', marginBottom: '0.5rem' }}>
                            <ThemeToggle />
                        </div> */}

                        <Link to="/logout" className="nav-item">
                            <span className="material-symbols-outlined">logout</span>
                            <p>Logout</p>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;