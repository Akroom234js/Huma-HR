import React from 'react';
import './ManagerNoteBox.css';

const ManagerNoteBox = ({ notes = '', isRevision = false, lang }) => {
    const currentLang = lang || sessionStorage.getItem('lang') || 'en';
    const isAr = currentLang === 'ar';

    if (!notes) return null;

    return (
        <div className={`performance-manager-remarks-box ${isRevision ? 'highlight-revision' : 'standard-remarks'}`}>
            <div className="remarks-header">
                <i className={`fa-solid ${isRevision ? 'fa-triangle-exclamation' : 'fa-comment-dots'} remarks-icon`}></i>
                <span className="remarks-title-text">
                    {isRevision 
                        ? (isAr ? 'ملاحظات تعديل الأداء المطلوبة' : 'Required Performance Revision Notes')
                        : (isAr ? 'ملاحظات وتقييم المشرف المباشر' : 'Supervisor Notes & Comments')
                    }
                </span>
            </div>
            <p className="remarks-content-text">{notes}</p>
        </div>
    );
};

export default ManagerNoteBox;
