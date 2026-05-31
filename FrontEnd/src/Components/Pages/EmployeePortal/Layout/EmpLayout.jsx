import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import EmpSidebar from './EmpSidebar';
import '../../../../App.css'; // Reuse existing layout styles

const EmpLayout = () => {
    useEffect(() => {
        // Read and apply the saved theme on mount/refresh
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark'); // Standard fallback
        }
    }, []);

    return (
        <div className="app-container">
            <EmpSidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default EmpLayout;
