import React from 'react';
import './CompetencyGapTag.css';

const CompetencyGapTag = ({ gapType = 'technical', score = 0, lang }) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const gapMap = {
        technical: {
            class: 'gap-technical',
            labelEn: 'Technical Execution Gap',
            labelAr: 'فجوة في التنفيذ الفني',
            icon: 'fa-solid fa-code'
        },
        teamwork: {
            class: 'gap-teamwork',
            labelEn: 'Teamwork & Cooperation Gap',
            labelAr: 'فجوة في العمل الجماعي والتعاون',
            icon: 'fa-solid fa-people-group'
        },
        commitment: {
            class: 'gap-commitment',
            labelEn: 'Commitment & Punctuality Gap',
            labelAr: 'فجوة في الالتزام بالمواعيد',
            icon: 'fa-solid fa-user-clock'
        },
        task_management: {
            class: 'gap-tasks',
            labelEn: 'Task Management Gap',
            labelAr: 'فجوة في إدارة المهام',
            icon: 'fa-solid fa-list-check'
        }
    };

    const currentGap = gapMap[gapType] || gapMap.technical;

    return (
        <span className={`performance-gap-pill ${currentGap.class}`}>
            <i className={`${currentGap.icon} gap-icon`}></i>
            <span className="gap-label-text">
                {isAr ? currentGap.labelAr : currentGap.labelEn}
            </span>
            <span className="gap-score-val">({isAr ? 'الدرجة:' : 'Score:'} {score.toFixed(0)})</span>
        </span>
    );
};

export default CompetencyGapTag;
