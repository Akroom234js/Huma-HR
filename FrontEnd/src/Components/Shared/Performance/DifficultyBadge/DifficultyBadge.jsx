import React from 'react';
import './DifficultyBadge.css';

const DifficultyBadge = ({ difficulty = 'medium', lang }) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const diffMap = {
        easy: {
            class: 'badge-difficulty-easy',
            labelEn: 'Easy',
            labelAr: 'سهل',
            icon: 'fa-regular fa-circle-play'
        },
        medium: {
            class: 'badge-difficulty-medium',
            labelEn: 'Medium',
            labelAr: 'متوسط',
            icon: 'fa-solid fa-bolt'
        },
        hard: {
            class: 'badge-difficulty-hard',
            labelEn: 'Hard',
            labelAr: 'صعب',
            icon: 'fa-solid fa-fire'
        }
    };

    const currentDiff = diffMap[difficulty] || diffMap.medium;

    return (
        <span className={`performance-difficulty-badge ${currentDiff.class}`}>
            <i className={`${currentDiff.icon} diff-icon`}></i>
            <span>{isAr ? currentDiff.labelAr : currentDiff.labelEn}</span>
        </span>
    );
};

export default DifficultyBadge;
