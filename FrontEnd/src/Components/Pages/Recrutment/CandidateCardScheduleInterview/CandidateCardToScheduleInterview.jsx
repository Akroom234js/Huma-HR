import { useState } from "react";
import { useTranslation } from "react-i18next";
import ScheduleInterview from "../ScheduleInterview/ScheduleInterview";
import Attachments from "../Attachments/Attachments";
export default function CandidateCardToScheduleInterview({ candidate }) {
    const { id, name, department, position, score, skills, att } = candidate;
    const [visisibilty, setVisisibilty] = useState('shinhidden')
    const [visisibilty1, setVisisibilty1] = useState('shinhidden')
    // Determine score color based on value
    const getScoreColor = (score) => {
        if (score >= 80) return 'emerald';
        if (score >= 60) return 'amber';
        return 'red';
    };
    const schedule = (e, id) => {
        const element = document.getElementById(`#${id}`)
        console.log(element)
        if (element) {
            element.className = 'shinvisibility'
        }
    }
    const attachments = (e, id) => {
        const element = document.getElementById(`$${id}`)
        console.log(element)
        if (element) {

            element.className = 'shinvisibility'
        }

    }
    const scoreColor = getScoreColor(score);
    const { t } = useTranslation("Recrutment/ToScheduleInterview")
    return (
        <>
            <div className={visisibilty} id={`#${id}`}>
                <ScheduleInterview name={name} department={department} />
            </div>
            <div className={visisibilty1} id={`$${id}`}>
                <Attachments name={name} att={att} />
            </div>
            <div className="candidate-card">
                <div className="card-content">
                    <div className="candidate-header">
                        <div>
                            <h4 className="candidate-name">{name}</h4>
                            <p className="candidate-department">{department}</p>
                        </div>
                    </div>

                    <div className="position-info">
                        <p className="position-label">{t('CandidateCard.Applying')}</p>
                        <p className="position-title">{position}</p>
                    </div>

                    <div className="score-container">
                        <div className="score-header">
                            <span className="score-label">{t('CandidateCard.SCORE')}</span>
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
                    <button className="btn-move calender" onClick={(e) => { schedule(e, id) }}>
                        <i className="bi bi-calendar"></i>
                        <span >{t('CandidateCard.schedule')}</span>
                    </button>
                    <button className="btn-contact btn-view-att" onClick={(e) => { attachments(e, id) }}>
                        <i className="bi bi-file-earmark"></i>
                        <span>{t('CandidateCard.Attachments')}</span>
                    </button>
                </div>
            </div>
        </>
    );
}