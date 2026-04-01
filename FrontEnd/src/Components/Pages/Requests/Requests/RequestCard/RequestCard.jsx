import React from 'react';
import './RequestCard.css';
import UserProfileInfo from '../../../Requests/UI/UserProfileInfo/UserProfileInfo';
import StatusBadge from '../StatusBadge/StatusBadge';
import Button from '../../../Requests/UI/Button/Button';

const RequestCard = ({ request }) => {
    const { employee, type, requestType, status, data } = request;

    const renderRequestDetails = () => {
        switch (type) {
            case 'vacation':
                return (
                    <div className="req-card-details">
                        <div className="req-detail-item">
                            <span className="req-detail-label">Type</span>
                            <span className="req-detail-value">{data.leaveType}</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Duration</span>
                            <span className="req-detail-value">{data.range} ({data.totalDays} Days)</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Balance</span>
                            <span className="req-detail-value">{data.remainingBalance} Days Left</span>
                        </div>
                    </div>
                );
            case 'advance':
                return (
                    <div className="req-card-details">
                        <div className="req-detail-item">
                            <span className="req-detail-label">Amount</span>
                            <span className="req-detail-value">{data.amount}</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Installments</span>
                            <span className="req-detail-value">{data.installments} Months</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Reason</span>
                            <span className="req-detail-value">{data.reason}</span>
                        </div>
                    </div>
                );
            case 'compensation':
                return (
                    <div className="req-card-details">
                        <div className="req-detail-item">
                            <span className="req-detail-label">Amount</span>
                            <span className="req-detail-value">{data.amount}</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Date</span>
                            <span className="req-detail-value">{data.date}</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Category</span>
                            <span className="req-detail-value">{data.category}</span>
                        </div>
                    </div>
                );
            case 'data-update':
                return (
                    <div className="req-card-details">
                        <div className="req-detail-item">
                            <span className="req-detail-label">Field</span>
                            <span className="req-detail-value">{data.field}</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Changes</span>
                            <span className="req-detail-value">
                                <span className="text-muted">{data.before}</span>
                                <span className="material-symbols-outlined inline-icon">arrow_forward</span>
                                <span>{data.after}</span>
                            </span>
                        </div>
                    </div>
                );
            case 'resignation':
                return (
                    <div className="req-card-details">
                        <div className="req-detail-item">
                            <span className="req-detail-label">Last Day</span>
                            <span className="req-detail-value">{data.lastWorkingDay}</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Keywords</span>
                            <span className="req-detail-value">{data.keywords}</span>
                        </div>
                    </div>
                );
            case 'transfer':
                return (
                    <div className="req-card-details">
                        <div className="req-detail-item">
                            <span className="req-detail-label">Dept. Change</span>
                            <span className="req-detail-value">{data.currentDept} → {data.newDept}</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">New Title</span>
                            <span className="req-detail-value">{data.newTitle}</span>
                        </div>
                    </div>
                );
            case 'promotion':
                return (
                    <div className="req-card-details">
                        <div className="req-detail-item">
                            <span className="req-detail-label">Title Change</span>
                            <span className="req-detail-value">{data.currentTitle} → {data.proposedTitle}</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Salary Inc.</span>
                            <span className="req-detail-value">{data.salaryIncrease}</span>
                        </div>
                    </div>
                );
            case 'equipment':
                return (
                    <div className="req-card-details">
                        <div className="req-detail-item">
                            <span className="req-detail-label">Device</span>
                            <span className="req-detail-value">{data.deviceType} ({data.specs})</span>
                        </div>
                        <div className="req-detail-item">
                            <span className="req-detail-label">Reason</span>
                            <span className="req-detail-value">{data.reason}</span>
                        </div>
                    </div>
                );
            case 'experience-certificate':
                return (
                    <div className="req-card-details">
                        <div className="req-detail-item">
                            <span className="req-detail-label">Purpose</span>
                            <span className="req-detail-value">{data.purpose}</span>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="req-card">
            <div className="req-card-main">
                <UserProfileInfo
                    name={employee.name}
                    role={employee.role}
                    avatar={employee.avatar}
                />

                <div className="req-type-badge">
                    <span className="material-symbols-outlined">{requestType.icon}</span>
                    <span>{requestType.label}</span>
                </div>

                {renderRequestDetails()}
                
                <div className="req-card-footer">
                    <div className="req-status-section">
                        <StatusBadge status={status} />
                    </div>

                    <div className="req-actions-section">
                        <Button variant="outline" size="sm">Details</Button>
                        <Button variant="danger" size="sm">Reject</Button>
                        <Button variant="primary" size="sm">Approve</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestCard;
