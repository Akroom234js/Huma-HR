import React from 'react';
import './DeadlineAlert.css';
import { useTranslation } from 'react-i18next';

const DeadlineAlert = ({ dueDate, daysRemaining, isCompleted = false, penaltyPerDay = 0, lang }) => {
    const { i18n } = useTranslation();
    const currentLang = lang || (i18n ? i18n.language : sessionStorage.getItem('lang')) || 'en';
    const isAr = currentLang === 'ar';

    if (isCompleted) {
        return (
            <div className="performance-deadline-alert alert-success">
                <i className="bi bi-check-circle-fill alert-icon"></i>
                <span className="alert-message-text">
                    {isAr ? 'تم إنجاز وتسليم هذه المهمة بنجاح.' : 'Task has been completed and submitted successfully.'}
                </span>
                <span className="remaining-badge">
                    {isAr ? 'مكتملة' : 'Completed'}
                </span>
            </div>
        );
    }

    let calculatedDays = daysRemaining;
    if (calculatedDays === undefined && dueDate) {
        const due = new Date(dueDate);
        const now = new Date();
        const diffMs = due.setHours(23, 59, 59, 999) - now.getTime();
        calculatedDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
    if (calculatedDays === undefined) calculatedDays = 3;

    let severityClass = 'alert-success';
    let iconClass = 'bi bi-check-circle-fill';
    let message = '';

    if (calculatedDays < 0) {
        severityClass = 'alert-danger';
        iconClass = 'bi bi-exclamation-triangle-fill';
        message = isAr 
            ? `المهمة متأخرة ${Math.abs(calculatedDays)} يوم — يتم خصم ${penaltyPerDay || 2} نقاط يومياً!` 
            : `Task is overdue by ${Math.abs(calculatedDays)} days — ${penaltyPerDay || 2} pts daily penalty!`;
    } else if (calculatedDays === 0) {
        severityClass = 'alert-warning';
        iconClass = 'bi bi-exclamation-circle-fill';
        message = isAr 
            ? 'تاريخ الاستحقاق اليوم! يرجى تسليم المخرجات قبل نهاية اليوم.' 
            : 'Due today! Please submit your deliverable before end of day.';
    } else if (calculatedDays <= 2) {
        severityClass = 'alert-warning';
        iconClass = 'bi bi-clock-history';
        message = isAr 
            ? `أقل من ${calculatedDays} أيام متبقية للتسليم!` 
            : `Less than ${calculatedDays} days remaining to deliver!`;
    } else {
        severityClass = 'alert-success';
        iconClass = 'bi bi-calendar-check-fill';
        message = isAr 
            ? 'متبقي وقت كافٍ لتسليم المخرجات.' 
            : 'Plenty of time remaining for delivery.';
    }

    return (
        <div className={`performance-deadline-alert ${severityClass}`}>
            <i className={`${iconClass} alert-icon`}></i>
            <span className="alert-message-text">{message}</span>
            <span className="remaining-badge">
                {calculatedDays > 0 
                    ? `${calculatedDays} ${isAr ? 'أيام متبقية' : 'days left'}`
                    : calculatedDays === 0
                    ? (isAr ? 'اليوم' : 'Today')
                    : (isAr ? 'متأخرة' : 'Overdue')
                }
            </span>
        </div>
    );
};

export default DeadlineAlert;
