import React from 'react';
import './RequestList.css';
import RequestCard from '../RequestCard/RequestCard';

const RequestList = ({ requests }) => {
    return (
        <div className="req-list">
            {requests.map((request, index) => (
                <RequestCard key={index} request={request} />
            ))}
        </div>
    );
};

export default RequestList;
