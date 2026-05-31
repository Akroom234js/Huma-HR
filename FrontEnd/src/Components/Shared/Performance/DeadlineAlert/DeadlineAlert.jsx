import React from 'react';
import './DeadlineAlert.css';

const DeadlineAlert = ({ daysRemaining = 3, lang }) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    let severityClass = 'alert-success';
    let iconClass = 'fa-solid fa-circle-check';
    let message = '';

    if (daysRemaining <= 0) {
        severityClass = 'alert-danger';
        iconClass = 'fa-solid fa-circle-exclamation';
        message = isAr 
            ? 'المهمة متأخرة — كل يوم إضافي يقتطع نقاطاً!' 
            : 'Task is overdue — daily points penalty applied!';
    } else if (daysRemaining < 2) {
        severityClass = 'alert-warning';
        iconClass = 'fa-solid fa-triangle-exclamation';
        message = isAr 
            ? 'أقل من يومين متبقيين للتسليم!' 
            : 'Less than 2 days remaining to deliver!';
    } else {
        severityClass = 'alert-success';
        iconClass = 'fa-solid fa-circle-check';
        message = isAr 
            ? 'متبقي وقت كافٍ للتسليم.' 
            : 'Plenty of time remaining for delivery.';
    }

    return (
        <div className={`performance-deadline-alert ${severityClass}`}>
            <i className={`${iconClass} alert-icon`}></i>
            <span className="alert-message-text">{message}</span>
            <span className="remaining-badge">
                {daysRemaining > 0 
                    ? `${daysRemaining} ${isAr ? 'أيام متبقية' : 'days left'}`
                    : (isAr ? 'متأخرة' : 'Overdue')
                }
            </span>
        </div>
    );
};

export default DeadlineAlert;
