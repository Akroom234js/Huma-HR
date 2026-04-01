// import React from 'react';
import MetricRow from './MetricRow';

const SummaryCard = ({ title, metrics }) => (
    <div className="report-card">
        <h3 className="card-title">{title}</h3>
        <div className="metrics-list">
            {metrics.map((item, index) => (
                <MetricRow key={index} {...item} />
            ))}
        </div>
    </div>
);

export default SummaryCard;