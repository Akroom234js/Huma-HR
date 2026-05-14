import React, { useState } from 'react';
import './AddLeaves.css';
import { useTranslation } from 'react-i18next';

export default function AddLeaves({ isOpen, onClose, onAddType }) {
    const { t } = useTranslation('Leaves/AddLeaves');
    const [leaveName, setLeaveName] = useState('');
    const [leaveNameAr, setLeaveNameAr] = useState('');
    const [allocation, setAllocation] = useState('');
    const [descEn, setDescEn] = useState('');
    const [descAr, setDescAr] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [requiresApproval, setRequiresApproval] = useState(true);

    const handleClose = (e) => {
        if (e) e.preventDefault();
        // Prop-based React state support
        if (onClose) {
            onClose();
        } else {
            // Fallback native DOM sync
            const overlay = document.querySelector('.addleaveshidden');
            const container = document.querySelector('.addleaves-co');
            if (overlay) {
                document.body.style.overflow = 'auto';
                overlay.style.display = 'none';
                overlay.style.visibility = 'hidden';
                if (container) container.style.display = 'none';
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onAddType) {
            onAddType({
                nameEn: leaveName || 'Custom Leave',
                nameAr: leaveNameAr || 'إجازة مخصصة',
                allocation: Number(allocation) || 10,
                descEn: descEn || 'Custom policy rule configuration.',
                descAr: descAr || 'إعداد سياسة إجازة مخصصة.'
            });
        }
        // Reset form fields
        setLeaveName('');
        setLeaveNameAr('');
        setAllocation('');
        setDescEn('');
        setDescAr('');
        setIsPaid(false);
        setRequiresApproval(true);
        handleClose();
    };

    return (
        <div className="premium-addleaves-overlay" onClick={handleClose}>
            <div className="premium-addleaves-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-bar">
                    <div className="header-title-flex">
                        <div className="header-icon-box">
                            <span className="material-symbols-outlined">playlist_add</span>
                        </div>
                        <h3>{t('add') || "Add Leave Type"}</h3>
                    </div>
                    <button className="btn-modal-close" onClick={handleClose} type="button" aria-label="Close">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="premium-addleaves-form">
                    <div className="form-fields-scroll-area">
                        <div className="form-row-group">
                            <label className="premium-label">{t('name') || "Leave Name (English)"}</label>
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
                            <label className="premium-label">{t('name1') || "Leave Name (Arabic)"}</label>
                            <input 
                                className="premium-input-field text-rtl"  
                                placeholder="مثلاً إجازة سنوية" 
                                type="text"
                                value={leaveNameAr}
                                onChange={(e) => setLeaveNameAr(e.target.value)}
                            />
                        </div>

                        <div className="form-row-group">
                            <label className="premium-label">{t('Allocation') || "Default Allocation (Days)"}</label>
                            <input 
                                className="premium-input-field"  
                                placeholder={t('number') || "Number of days"} 
                                type="number" 
                                min="1"
                                max="365"
                                required
                                value={allocation}
                                onChange={(e) => setAllocation(e.target.value)}
                            />
                        </div>

                        <div className="form-row-group">
                            <label className="premium-label">{t("DescriptionPolicy") || "Policy Description (English)"}</label>
                            <textarea 
                                className="premium-textarea-field"  
                                placeholder={t('details') || "Enter policy guidelines and eligibility criteria..."} 
                                rows="3"
                                value={descEn}
                                onChange={(e) => setDescEn(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="form-row-group">
                            <label className="premium-label">{t("DescriptionPolicy1") || "Policy Description (Arabic)"}</label>
                            <textarea 
                                className="premium-textarea-field text-rtl"  
                                placeholder={t('details1') || "أدخل شروط وضوابط استحقاق الإجازة..."} 
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
                                <span className="checkbox-label-text">{t('Paid') || "Paid Leave"}</span>
                            </label>

                            <label className="custom-checkbox-wrapper">
                                <input 
                                    className="custom-checkbox-input"  
                                    type="checkbox" 
                                    checked={requiresApproval}
                                    onChange={(e) => setRequiresApproval(e.target.checked)}
                                />
                                <span className="custom-checkbox-box"></span>
                                <span className="checkbox-label-text">{t('Approval') || "Requires Approval"}</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-footer-actions">
                        <button onClick={handleClose} className="premium-btn-cancel" type="button">
                            Cancel
                        </button>
                        <button className="premium-btn-submit" type="submit">
                            <i className="bi bi-check2"></i> Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}