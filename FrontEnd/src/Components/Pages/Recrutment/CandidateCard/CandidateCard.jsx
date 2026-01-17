import React from 'react';
import './CandidateCard.css';

const CandidateCard = ({ candidate }) => {
    const { name, department, position, score, skills } = candidate;

    // Determine score color based on value
    const getScoreColor = (score) => {
        if (score >= 80) return 'emerald';
        if (score >= 60) return 'amber';
        return 'red';
    };

    const scoreColor = getScoreColor(score);

    return (
        <div className="candidate-card">
            <div className="card-content">
                <div className="candidate-header">
                    <div>
                        <h4 className="candidate-name">{name}</h4>
                        <p className="candidate-department">{department}</p>
                    </div>
                </div>

                <div className="position-info">
                    <p className="position-label">Applying for:</p>
                    <p className="position-title">{position}</p>
                </div>

                <div className="score-container">
                    <div className="score-header">
                        <span className="score-label">ATS SCORE</span>
                        <span className={`score-value score-${scoreColor}`}>{score}/100</span>
                    </div>
                    <div className="score-bar">
                        <div
                            className={`score-fill score-fill-${scoreColor}`}
                            style={{ width: `${score}%` }}
                        ></div>
                    </div>
                    <div className="skills-container">
                        {skills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card-actions">
                <button className="btn-move">
                    <span>Move to schedule interview</span>
                </button>
                <button className="btn-contact">
                    <span className="material-symbols-outlined">mail</span>
                    <span>Contact</span>
                </button>
            </div>
        </div>
    );
};

export default CandidateCard;
