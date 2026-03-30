import React from 'react';
import './TabSwitcher.css';

const TabSwitcher = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'all', label: 'All requests' },
        { id: 'pending', label: 'Pending' },
        { id: 'rejected', label: 'Rejected' },
        { id: 'approved', label: 'Approved' }
    ];

    return (
        <div className="req-tab-switcher">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`req-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabSwitcher;
