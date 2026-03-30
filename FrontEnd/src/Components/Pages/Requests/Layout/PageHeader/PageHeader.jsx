import React from 'react';
import './PageHeader.css';
import ThemeToggle from '../../../../ThemeToggle/ThemeToggle';

const PageHeader = ({ title, subtitle }) => {
    return (
        <header className="req-header">
            <div className="req-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <div className="req-header-content">
                <h1 className="req-title">{title}</h1>
                <p className="req-subtitle">{subtitle}</p>
            </div>
        </header>
    );
};

export default PageHeader;
