import React from 'react';
import './RequestList.css';
import RequestCard from '../RequestCard/RequestCard';

const RequestList = ({ requests, onAction }) => {
    return (
        <div className="req-list">
            {requests.map((request, index) => (
                <RequestCard key={index} request={request} onAction={onAction} />
            ))}
        </div>
    );
};

export default RequestList;
