import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, label, value, trend }) => {
    return (
        <div className="req-stat-card">
            <div className="req-stat-icon-wrapper">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div className="req-stat-info">
                <div className="req-stat-header">
                    <span className="req-stat-label">{label}</span>
                    {trend && <span className="req-stat-trend">{trend}</span>}
                </div>
                <h2 className="req-stat-value">{value}</h2>
            </div>
        </div>
    );
};

export default StatCard;
