import React from 'react';
import './Header.css';

const Header = ({ onCreateJob }) => {
    return (
        <header className="page-header">
            <div className="header-actions">
                <button className="btn-primary" onClick={onCreateJob}>
                    <span className="material-symbols-outlined">add</span>
                    Create Job
                </button>

            </div>
        </header>
    );
};

export default Header;
