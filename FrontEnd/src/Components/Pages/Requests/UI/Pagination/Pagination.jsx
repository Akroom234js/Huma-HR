import React from 'react';
import './Pagination.css';

const Pagination = ({ totalRequests = 28, currentCount = 4 }) => {
    return (
        <div className="req-pagination-container">
            <span className="req-pagination-info">
                SHOWING {currentCount} OF {totalRequests} REQUESTS
            </span>
            <div className="req-pagination-controls">
                <button className="req-page-btn arrow-btn">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="req-page-btn active">1</button>
                <button className="req-page-btn">2</button>
                <button className="req-page-btn">3</button>
                <button className="req-page-btn arrow-btn">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
            <span className="req-pagination-copyright">
                © 2024 HUMA HR PLATFORM
            </span>
        </div>
    );
};

export default Pagination;
