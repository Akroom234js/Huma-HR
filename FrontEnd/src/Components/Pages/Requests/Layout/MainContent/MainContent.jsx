import React from 'react';
import './MainContent.css';

const MainContent = ({ children }) => {
    return (
        <div className="req-main-content">
            {children}
        </div>
    );
};

export default MainContent;
