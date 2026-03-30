import React from 'react';
import './UserProfileInfo.css';

const UserProfileInfo = ({ name, role, avatar }) => {
    return (
        <div className="req-user-profile">
            <div className="req-avatar-wrapper">
                {avatar ? (
                    <img src={avatar} alt={name} className="req-avatar" />
                ) : (
                    <div className="req-avatar-placeholder">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                )}
            </div>
            <div className="req-user-details">
                <h4 className="req-user-name">{name}</h4>
                <p className="req-user-role">{role}</p>
            </div>
        </div>
    );
};

export default UserProfileInfo;
