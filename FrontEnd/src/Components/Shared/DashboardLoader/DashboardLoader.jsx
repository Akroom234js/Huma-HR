import React from 'react';
import './DashboardLoader.css';
import logo from '../../../assets/logo.png';

/**
 * Premium circular branded loader component inspired by Huma-HR logo.
 * Unifies all dashboard loading states with a polished, cohesive animation.
 */
const DashboardLoader = ({
    text,
    size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
    fullPage = false,
    className = '',
    style = {}
}) => {
    return (
        <div 
            className={`dashboard-loader-container size-${size} ${fullPage ? 'full-page' : ''} ${className}`}
            style={style}
            role="status"
            aria-live="polite"
        >
            <div className="dashboard-loader-wrapper">
                <div className="dashboard-loader-ring-outer"></div>
                <div className="dashboard-loader-ring-inner"></div>
                <div className="dashboard-loader-core">
                    <img src={logo} alt="Huma HR" className="dashboard-loader-logo" />
                </div>
            </div>
            {text && <p className="dashboard-loader-text">{text}</p>}
        </div>
    );
};

export default DashboardLoader;
