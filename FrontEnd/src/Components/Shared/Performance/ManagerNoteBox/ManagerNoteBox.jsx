import React from 'react';
import './ManagerNoteBox.css';
import { useTranslation } from 'react-i18next';

const ManagerNoteBox = ({ notes = '', isRevision = false, lang }) => {
    const { i18n } = useTranslation();
    const currentLang = lang || (i18n ? i18n.language : sessionStorage.getItem('lang')) || 'en';
    const isAr = currentLang === 'ar';

    if (!notes) return null;

    return (
        <div className={`performance-manager-remarks-box ${isRevision ? 'highlight-revision' : 'standard-remarks'}`}>
            <div className="remarks-header">
                <i className={`bi ${isRevision ? 'bi-exclamation-triangle-fill' : 'bi-chat-left-text-fill'} remarks-icon me-1`}></i>
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
