import React from 'react';
import { useParams } from 'react-router-dom';

const MyRequests = () => {
    const { subpage } = useParams();
    
    return (
        <div className="portal-page">
            <header className="page-header">
                <h1>My Requests - {subpage ? subpage.charAt(0).toUpperCase() + subpage.slice(1) : 'Overview'}</h1>
            </header>
            <div className="requests-container">
                <div className="empty-state">
                    <span className="material-symbols-outlined">inbox</span>
                    <p>You haven't submitted any {subpage || 'requests'} yet.</p>
                </div>
            </div>
        </div>
    );
};

export default MyRequests;
