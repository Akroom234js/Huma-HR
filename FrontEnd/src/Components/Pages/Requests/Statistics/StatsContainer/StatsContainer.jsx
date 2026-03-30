import React from 'react';
import './StatsContainer.css';

const StatsContainer = ({ children }) => {
    return (
        <div className="req-stats-grid">
            {children}
        </div>
    );
};

export default StatsContainer;
