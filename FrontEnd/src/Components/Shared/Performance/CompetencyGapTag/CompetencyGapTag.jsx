import React from 'react';
import './CompetencyGapTag.css';

const CompetencyGapTag = ({
    gapType = 'technical',
    gapName = '',
    score,
    lang
}) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const gapConfig = {
        technical: {
            class: 'gap-tech',
            icon: 'fa-solid fa-code',
            labelAr: 'فجوة في الإنجاز التقني للمهام',
            labelEn: 'Technical Execution Gap'
        },
        communication: {
            class: 'gap-comm',
            icon: 'fa-solid fa-comments',
            labelAr: 'فجوة في التواصل والعمل الجماعي',
            labelEn: 'Teamwork & Communication Gap'
        },
        attendance: {
            class: 'gap-attend',
            icon: 'fa-solid fa-user-clock',
            labelAr: 'فجوة في الحضور والانضباط',
            labelEn: 'Punctuality & Attendance Gap'
        }
    };

    const config = gapConfig[gapType] || gapConfig.technical;
    const numScore = score !== undefined && score !== null ? Number(score) : null;

    return (
        <span className={`competency-gap-pill ${config.class}`}>
            <i className={`${config.icon} gap-icon`}></i>
            <span className="gap-name">{gapName || (isAr ? config.labelAr : config.labelEn)}</span>
            {numScore !== null && !isNaN(numScore) && (
                <span className="gap-score-val">({isAr ? 'الدرجة:' : 'Score:'} {numScore.toFixed(0)})</span>
            )}
        </span>
    );
};

export default CompetencyGapTag;
