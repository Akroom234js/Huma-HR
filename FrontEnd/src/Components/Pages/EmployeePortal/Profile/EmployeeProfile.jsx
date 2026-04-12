import React from 'react';

const EmployeeProfile = () => {
    return (
        <div className="portal-page">
            <header className="page-header">
                <h1>My Profile</h1>
            </header>
            <div className="profile-container">
                <div className="profile-main-card">
                    <div className="profile-header-info">
                        <div className="avatar-placeholder">TE</div>
                        <div className="basic-info">
                            <h2>Test Employee</h2>
                            <p>Software Engineer | IT Department</p>
                        </div>
                    </div>
                    <div className="details-grid">
                        <div className="detail-item">
                            <label>Email</label>
                            <span>test.employee@example.com</span>
                        </div>
                        <div className="detail-item">
                            <label>Employee ID</label>
                            <span>EMP-2024-089</span>
                        </div>
                        <div className="detail-item">
                            <label>Joining Date</label>
                            <span>Jan 15, 2024</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
