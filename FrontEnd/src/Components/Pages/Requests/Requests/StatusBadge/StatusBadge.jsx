import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
    const statusLower = status?.toLowerCase();
    
    return (
        <span className={`req-status-badge req-status-${statusLower}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
