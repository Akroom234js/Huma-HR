import React, { useEffect, useState } from 'react';
import './Tabs.css';
import { NavLink } from 'react-router-dom';

const Tabs = ({ tabs }) => {
    return (
        <div className="tabs-container">
            <div className="tabs-wrapper">
                {tabs.map((tab) => (
                    <NavLink
                        to={tab.path}
                        key={tab.id}
                        className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}
                    >
                        {tab.label} ({tab.count})
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default Tabs;
