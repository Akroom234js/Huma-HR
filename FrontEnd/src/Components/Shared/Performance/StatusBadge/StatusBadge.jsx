import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status = 'pending', lang }) => {
    // Detect language from context or session storage if not explicitly provided
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const statusMap = {
        pending: {
            class: 'badge-pending',
            labelEn: 'Pending',
            labelAr: 'معلقة',
            icon: 'fa-regular fa-clock'
        },
        in_progress: {
            class: 'badge-progress',
            labelEn: 'In Progress',
            labelAr: 'قيد التنفيذ',
            icon: 'fa-solid fa-spinner fa-spin-pulse'
        },
        pending_review: {
            class: 'badge-review',
            labelEn: 'Pending Review',
            labelAr: 'بانتظار المراجعة',
            icon: 'fa-solid fa-magnifying-glass'
        },
        needs_revision: {
            class: 'badge-revision',
            labelEn: 'Needs Revision',
            labelAr: 'تحتاج تعديل',
            icon: 'fa-solid fa-triangle-exclamation'
        },
        scored: {
            class: 'badge-scored',
            labelEn: 'Scored',
            labelAr: 'مقيّمة',
            icon: 'fa-solid fa-circle-check'
        }
    };

    const currentStatus = statusMap[status] || statusMap.pending;

    return (
        <span className={`performance-badge ${currentStatus.class}`}>
            <i className={`${currentStatus.icon} badge-icon`}></i>
            <span>{isAr ? currentStatus.labelAr : currentStatus.labelEn}</span>
        </span>
    );
};

export default StatusBadge;
