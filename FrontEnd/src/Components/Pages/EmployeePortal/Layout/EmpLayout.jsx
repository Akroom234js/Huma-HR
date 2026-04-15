import React from 'react';
import { Outlet } from 'react-router-dom';
import EmpSidebar from './EmpSidebar';
import '../../../../App.css'; // Reuse existing layout styles

const EmpLayout = () => {
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
