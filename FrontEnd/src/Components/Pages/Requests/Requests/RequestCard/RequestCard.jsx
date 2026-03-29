import React from 'react';
import './RequestCard.css';
import UserProfileInfo from '../../../Requests/UI/UserProfileInfo/UserProfileInfo';
import StatusBadge from '../StatusBadge/StatusBadge';
import Button from '../../../Requests/UI/Button/Button';

const RequestCard = ({ request }) => {
    const { employee, requestType, date, details, status } = request;

    return (
        <div className="req-card">
            <div className="req-card-main">
                <UserProfileInfo
                    name={employee.name}
                    role={employee.role}
                    avatar={employee.avatar}
                />

                <div className="req-details-section">
                    <div className="req-type-icon">
                        <span className="material-symbols-outlined">{requestType.icon}</span>
                    </div>
                    <div className="req-details-text">
                        <h4 className="req-type-label">{requestType.label}</h4>
                        <p className="req-date-details">{date} {details && `(${details})`}</p>
                    </div>
                </div>

                <div className="req-status-section">
                    <StatusBadge status={status} />
                </div>

                <div className="req-actions-section">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="danger" size="sm">Reject</Button>
                    <Button variant="primary" size="sm">Approve</Button>
                </div>
            </div>
        </div>
    );
};

export default RequestCard;
