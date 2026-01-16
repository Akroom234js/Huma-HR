import React from 'react';
import './Header.css';

const Header = () => {
    return (
        <header className="page-header">
            <div className="header-actions">
                <button className="btn-primary">
                    <span className="material-symbols-outlined">add</span>
                    Create Job
                </button>

            </div>
        </header>
    );
};

export default Header;
