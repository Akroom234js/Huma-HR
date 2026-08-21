import React from 'react';
import './PriorityBadge.css';
import { useTranslation } from 'react-i18next';

const PriorityBadge = ({ priority = 'medium', lang }) => {
    const { i18n } = useTranslation();
    const currentLang = lang || (i18n ? i18n.language : sessionStorage.getItem('lang')) || 'en';
    const isAr = currentLang === 'ar';

    const priorityMap = {
        low: {
            class: 'badge-priority-low',
            labelEn: 'Low',
            labelAr: 'منخفض',
            icon: 'fa-solid fa-arrow-down'
        },
        medium: {
            class: 'badge-priority-medium',
            labelEn: 'Medium',
            labelAr: 'متوسط',
            icon: 'fa-solid fa-minus'
        },
        high: {
            class: 'badge-priority-high',
            labelEn: 'High',
            labelAr: 'عالي',
            icon: 'fa-solid fa-arrow-up'
        },
        urgent: {
            class: 'badge-priority-urgent',
            labelEn: 'Urgent',
            labelAr: 'عاجل',
            icon: 'fa-solid fa-triangle-exclamation'
        }
    };

    const currentPriority = priorityMap[priority] || priorityMap.medium;

    return (
        <span className={`performance-priority-badge ${currentPriority.class}`}>
            <i className={`${currentPriority.icon} priority-icon`}></i>
            <span>{isAr ? currentPriority.labelAr : currentPriority.labelEn}</span>
        </span>
    );
};

export default PriorityBadge;
