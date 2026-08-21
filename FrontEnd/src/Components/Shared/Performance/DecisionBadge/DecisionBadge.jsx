import React from 'react';
import './DecisionBadge.css';
import { useTranslation } from 'react-i18next';

const DecisionBadge = ({ decision = 'bonus', lang }) => {
    const { i18n } = useTranslation();
    const currentLang = lang || (i18n ? i18n.language : sessionStorage.getItem('lang')) || 'en';
    const isAr = currentLang === 'ar';

    const decisionMap = {
        promotion_bonus: {
            class: 'badge-promo',
            labelEn: 'Promotion & Bonus',
            labelAr: 'ترقية + مكافأة',
            icon: 'fa-solid fa-trophy'
        },
        promotion: {
            class: 'badge-promo',
            labelEn: 'Promotion Recommended',
            labelAr: 'ترقية موصى بها',
            icon: 'fa-solid fa-trophy'
        },
        bonus: {
            class: 'badge-bonus',
            labelEn: 'Bonus Eligible',
            labelAr: 'مكافأة',
            icon: 'fa-solid fa-gift'
        },
        training_required: {
            class: 'badge-training',
            labelEn: 'Training Required',
            labelAr: 'يتطلب تدريباً',
            icon: 'fa-solid fa-chalkboard-user'
        },
        training: {
            class: 'badge-training',
            labelEn: 'Training Recommended',
            labelAr: 'تدريب موصى به',
            icon: 'fa-solid fa-chalkboard-user'
        },
        warning: {
            class: 'badge-warning',
            labelEn: 'Warning Issued',
            labelAr: 'إنذار',
            icon: 'fa-solid fa-triangle-exclamation'
        },
        pip: {
            class: 'badge-pip',
            labelEn: 'PIP Assigned',
            labelAr: 'خطة تحسين الأداء (PIP)',
            icon: 'fa-solid fa-user-gear'
        }
    };

    const currentDecision = decisionMap[decision] || decisionMap.bonus;

    return (
        <span className={`performance-decision-badge ${currentDecision.class}`}>
            <i className={`${currentDecision.icon} decision-icon`}></i>
            <span>{isAr ? currentDecision.labelAr : currentDecision.labelEn}</span>
        </span>
    );
};

export default DecisionBadge;
