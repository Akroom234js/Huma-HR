import React, { useState, useEffect } from 'react';
import './AddLeaves.css';
import { useTranslation } from 'react-i18next';

export default function AddLeaves({ isOpen, onClose, onSubmit, initialData = null }) {
    const { t, i18n } = useTranslation('Leaves/AddLeaves');
    const isAr = i18n.language === 'ar';

    const [leaveName, setLeaveName] = useState('');
    const [leaveNameAr, setLeaveNameAr] = useState('');
    const [allocation, setAllocation] = useState('');
    const [descEn, setDescEn] = useState('');
    const [descAr, setDescAr] = useState('');
    const [isPaid, setIsPaid] = useState(true);
    const [requiresApproval, setRequiresApproval] = useState(true);

    useEffect(() => {
        if (initialData) {
            setLeaveName(initialData.name_en || initialData.nameEn || '');
            setLeaveNameAr(initialData.name_ar || initialData.nameAr || '');
            setAllocation(String(initialData.allocation || ''));
            setDescEn(initialData.desc_en || initialData.descEn || '');
            setDescAr(initialData.desc_ar || initialData.descAr || '');
            setIsPaid(initialData.is_paid !== undefined ? Boolean(initialData.is_paid) : true);
            setRequiresApproval(initialData.requires_approval !== undefined ? Boolean(initialData.requires_approval) : true);
        } else {
            setLeaveName('');
            setLeaveNameAr('');
            setAllocation('');
            setDescEn('');
            setDescAr('');
            setIsPaid(true);
            setRequiresApproval(true);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleClose = (e) => {
        if (e) e.preventDefault();
        if (onClose) onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                id: initialData?.id || null,
                nameEn: leaveName.trim(),
                nameAr: leaveNameAr.trim(),
                allocation: Number(allocation) || 1,
                descEn: descEn.trim(),
                descAr: descAr.trim(),
                isPaid: isPaid,
                requiresApproval: requiresApproval
            });
        }
        handleClose();
    };

    const isEditMode = Boolean(initialData);

    return (
        <div className={`premium-addleaves-overlay ${isAr ? "rtl" : "ltr"}`} onClick={handleClose}>
            <div className="premium-addleaves-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-bar">
                    <div className="header-title-flex">
                        <div className="header-icon-box">
                            <span className="material-symbols-outlined">
                                {isEditMode ? "edit_note" : "playlist_add"}
                            </span>
                        </div>
                        <h3>{isEditMode ? t('edit') : t('add')}</h3>
                    </div>
                    <button className="btn-modal-close" onClick={handleClose} type="button" aria-label="Close">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="premium-addleaves-form">
                    <div className="form-fields-scroll-area">
                        <div className="form-row-group">
                            <label className="premium-label">{t('name')}</label>
                            <input 
                                className="premium-input-field"  
                                placeholder="e.g., Annual Leave" 
                                type="text"
                                required
                                value={leaveName}
                                onChange={(e) => setLeaveName(e.target.value)}
                            />
                        </div>

                        <div className="form-row-group">
                            <label className="premium-label">{t('name1')}</label>
                            <input 
                                className="premium-input-field text-rtl"  
                                placeholder="مثلاً: إجازة سنوية" 
                                type="text"
                                value={leaveNameAr}
                                onChange={(e) => setLeaveNameAr(e.target.value)}
                            />
                        </div>

                        <div className="form-row-group">
                            <label className="premium-label">{t('Allocation')}</label>
                            <input 
                                className="premium-input-field"  
                                placeholder={t('number')} 
                                type="number" 
                                min="1"
                                max="365"
                                required
                                value={allocation}
                                onChange={(e) => setAllocation(e.target.value)}
                            />
                        </div>

                        <div className="form-row-group">
                            <label className="premium-label">{t("DescriptionPolicy")}</label>
                            <textarea 
                                className="premium-textarea-field"  
                                placeholder={t('details')} 
                                rows="3"
                                value={descEn}
                                onChange={(e) => setDescEn(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="form-row-group">
                            <label className="premium-label">{t("DescriptionPolicy1")}</label>
                            <textarea 
                                className="premium-textarea-field text-rtl"  
                                placeholder={t('details1')} 
                                rows="3"
                                value={descAr}
                                onChange={(e) => setDescAr(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="checkboxes-flex-row">
                            <label className="custom-checkbox-wrapper">
                                <input 
                                    className="custom-checkbox-input"  
                                    type="checkbox" 
                                    checked={isPaid}
                                    onChange={(e) => setIsPaid(e.target.checked)}
                                />
                                <span className="custom-checkbox-box"></span>
                                <span className="checkbox-label-text">{t('Paid')}</span>
                            </label>

                            <label className="custom-checkbox-wrapper">
                                <input 
                                    className="custom-checkbox-input"  
                                    type="checkbox" 
                                    checked={requiresApproval}
                                    onChange={(e) => setRequiresApproval(e.target.checked)}
                                />
                                <span className="custom-checkbox-box"></span>
                                <span className="checkbox-label-text">{t('Approval')}</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-footer-actions">
                        <button onClick={handleClose} className="premium-btn-cancel" type="button">
                            {t('cancel')}
                        </button>
                        <button className="premium-btn-submit" type="submit">
                            <i className="bi bi-check2"></i> {isEditMode ? t('submit') : t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}