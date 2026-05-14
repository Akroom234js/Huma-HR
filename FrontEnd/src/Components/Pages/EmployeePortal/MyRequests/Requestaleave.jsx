import React, { useState } from 'react';
import './Requestaleave.css';
import { useTranslation } from 'react-i18next';

export default function Requestaleave({ isOpen, onClose, onSubmit }) {
    const { t } = useTranslation("EmployeePortal/Requestaleave");
    const [leaveType, setLeaveType] = useState('Sick');
    const [startDate, setStartDate] = useState('');
    const [duration, setDuration] = useState('');
    const [reason, setReason] = useState('');
    const [fileName, setFileName] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit({
                id: Date.now(),
                type: leaveType,
                dates: startDate || new Date().toISOString().split('T')[0],
                datee: startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + (Number(duration) || 1))).toISOString().split('T')[0] : '-',
                duration: Number(duration) || 1,
                status: 'pending',
                Discounts: 0,
                reson: reason || '-'
            });
        }
        // Reset form
        setLeaveType('Sick');
        setStartDate('');
        setDuration('');
        setReason('');
        setFileName('');
        if (onClose) onClose();
    };

    return (
        <div className="request-leave-modal-overlay" onClick={onClose}>
            <div className="request-leave-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="request-leave-modal-header">
                    <div className="header-title-wrapper">
                        <div className="header-icon-glow">
                            <span className="material-symbols-outlined">event_available</span>
                        </div>
                        <h3>{t("Requestaleave")}</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="request-leave-form">
                    <div className="form-grid">
                        <div className="form-group col-full">
                            <label className="form-label">{t('type')}</label>
                            <div className="select-wrapper">
                                <select 
                                    className="premium-input premium-select"
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                >
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Annual">Annual Leave</option>
                                    <option value="Emergency">Emergency Leave</option>
                                </select>
                                <span className="select-arrow material-symbols-outlined">expand_more</span>
                            </div>
                        </div>

                        <div className="form-group col-half">
                            <label className="form-label">{t('Dates')}</label>
                            <input 
                                type="date" 
                                required 
                                className="premium-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group col-half">
                            <label className="form-label">{t('duration')} (Days)</label>
                            <input 
                                type="number" 
                                min="1"
                                max="90"
                                required 
                                className="premium-input"
                                placeholder="e.g. 3"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                        </div>

                        <div className="form-group col-full">
                            <label className="form-label">{t("reason")}</label>
                            <textarea 
                                className="premium-input premium-textarea" 
                                placeholder={t("placeholder")}
                                rows="3"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="form-group col-full">
                            <label className="form-label">{t("attah")}</label>
                            <div className="premium-file-dropzone">
                                <input 
                                    type="file"  
                                    id="premium-file-input" 
                                    onChange={handleFileChange}
                                    className="file-input-hidden"
                                />
                                <label htmlFor="premium-file-input" className="file-dropzone-content">
                                    <div className="dropzone-icon">
                                        <i className="bi bi-cloud-arrow-up"></i>
                                    </div>
                                    <span className="dropzone-text">
                                        {fileName ? (
                                            <span className="file-selected-name">
                                                <i className="bi bi-file-earmark-check"></i> {fileName}
                                            </span>
                                        ) : (
                                            t("click") || "Click to upload attachment"
                                        )}
                                    </span>
                                    <span className="dropzone-subtext">Supports PDF, PNG, JPG up to 10MB</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions-footer">
                        <button className="btn-tertiary" type="button" onClick={onClose}>
                            {t("cancel")}
                        </button>
                        <button className="btn-primary-gradient" type="submit">
                            <i className="bi bi-check2-circle"></i> {t("confirm")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}