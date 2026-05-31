import React from 'react';
import './ActionReviewCard.css';
import DecisionBadge from '../DecisionBadge/DecisionBadge';

const ActionReviewCard = ({
    action = {},
    onApprove,
    onReject,
    onDefer,
    isSubmitting = false,
    lang
}) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    const {
        id,
        employeeName = 'John Doe',
        department = 'IT Department',
        actionType = 'bonus', // promotion_bonus, bonus, training_required, warning, pip
        finalGrade = 0,
        recommendedAction = '',
        createdDate = ''
    } = action;

    const handleApprove = () => {
        if (onApprove) onApprove(id);
    };

    const handleReject = () => {
        if (onReject) onReject(id);
    };

    const handleDefer = () => {
        if (onDefer) onDefer(id);
    };

    return (
        <div className="performance-action-review-card">
            <div className="action-card-header">
                <div className="employee-info-section">
                    <span className="employee-name-label">{employeeName}</span>
                    <span className="employee-dept-label">{department}</span>
                </div>
                <div className="decision-badge-section">
                    <DecisionBadge decision={actionType} lang={currentLang} />
                </div>
            </div>

            <div className="action-card-body">
                <div className="grade-display-box">
                    <span className="grade-label">{isAr ? 'الدرجة النهائية:' : 'Final Grade:'}</span>
                    <span className="grade-value-bold">{finalGrade.toFixed(1)}</span>
                </div>

                <div className="recommendation-text-box">
                    <span className="rec-label">{isAr ? 'الإجراء الموصى به تلقائياً:' : 'Automated System Recommendation:'}</span>
                    <p className="rec-text">{recommendedAction}</p>
                </div>
            </div>

            <div className="action-card-footer">
                <span className="creation-date-text">
                    {isAr ? `تاريخ الطلب: ${createdDate}` : `Queued on: ${createdDate}`}
                </span>

                <div className="review-action-buttons">
                    <button 
                        type="button" 
                        className="btn-review-defer" 
                        onClick={handleDefer}
                        disabled={isSubmitting}
                        title={isAr ? 'مراجعة لاحقاً' : 'Review Later'}
                    >
                        <i className="fa-solid fa-clock"></i>
                        <span>{isAr ? 'لاحقاً' : 'Later'}</span>
                    </button>
                    <button 
                        type="button" 
                        className="btn-review-reject" 
                        onClick={handleReject}
                        disabled={isSubmitting}
                        title={isAr ? 'رفض الطلب' : 'Reject Action'}
                    >
                        <i className="fa-solid fa-circle-xmark"></i>
                        <span>{isAr ? 'رفض' : 'Reject'}</span>
                    </button>
                    <button 
                        type="button" 
                        className="btn-review-approve" 
                        onClick={handleApprove}
                        disabled={isSubmitting}
                        title={isAr ? 'موافقة وتنفيذ' : 'Approve & Execute'}
                    >
                        <i className="fa-solid fa-circle-check"></i>
                        <span>{isAr ? 'موافقة' : 'Approve'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionReviewCard;
