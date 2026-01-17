import React, { useState } from 'react';
import './Tabs.css';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className="tabs-container">
            <div className="tabs-wrapper">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tabs;
