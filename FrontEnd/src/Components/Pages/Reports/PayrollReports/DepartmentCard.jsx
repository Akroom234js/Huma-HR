// import React from 'react';

const DepartmentCard = ({ name, headcount, total, avg }) => (
    <div className="dept-card">
        <div className="dept-header">
            <div>
                <h4>{name}</h4>
                <p>Headcount: {headcount}</p>
            </div>
            <div className="dept-values">
                <p className="dept-total">Total: <strong>{total}</strong></p>
                <p className="dept-avg">Avg: {avg}</p>
            </div>
        </div>
    </div>
);

export default DepartmentCard;