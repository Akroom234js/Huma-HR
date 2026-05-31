import React from 'react';
import './ScoreWeightBar.css';

const ScoreWeightBar = ({ label = '', score = 0, weight = 100, color = '' }) => {
    // Fill calculations
    const fillPercent = Math.min(100, Math.max(0, score));

    return (
        <div className="performance-weight-bar-item">
            <div className="weight-bar-label-row">
                <span className="weight-bar-label">{label}</span>
                <span className="weight-bar-score-val" style={{ color: color || 'var(--primary-color)' }}>
                    {score.toFixed(1)} / {weight}
                </span>
            </div>
            <div className="weight-bar-outer">
                <div 
                    className="weight-bar-inner" 
                    style={{ 
                        width: `${fillPercent}%`,
                        background: color ? `linear-gradient(to right, rgba(29, 78, 216, 0.4), ${color})` : 'var(--primary-gradient)'
                    }}
                ></div>
            </div>
        </div>
    );
};

export default ScoreWeightBar;
