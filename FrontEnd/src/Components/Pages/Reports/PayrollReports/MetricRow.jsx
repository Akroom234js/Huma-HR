// import React from 'react';

const MetricRow = ({ icon, label, value, color, isTrend }) => (
    <div className="metric-row">
        <div className="metric-info">
            <i className={icon} style={{ color: color || 'inherit' }}></i>
            <span>{label}:</span>
        </div>
        <span className={`metric-value ${isTrend ? 'trend-up' : ''}`}>
            {value}
        </span>
    </div>
);

export default MetricRow;