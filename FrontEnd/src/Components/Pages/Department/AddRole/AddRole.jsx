import React, { useState, useEffect } from 'react';
import './AddRole.css';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';
import { useNotification } from '../../../Notification/NotificationContext';
import DashboardLoader from '../../../Shared/DashboardLoader/DashboardLoader';

export default function AddRole({ onClose, onSuccess, initialData = null }) {
    const { t, i18n } = useTranslation('Department/AddRole');
    const isAr = i18n?.language === 'ar';
    const { showSuccess, showError, showWarning } = useNotification();

    const isEdit = Boolean(initialData?.id);

    const [title, setTitle] = useState(initialData?.title || '');
    const [departmentId, setDepartmentId] = useState(initialData?.department_id || initialData?.department?.id || '');
    const [openings, setOpenings] = useState(initialData?.openings ? String(initialData.openings) : '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [skills, setSkills] = useState(initialData?.requirements || '');
    const [reportingTo, setReportingTo] = useState(initialData?.reporting_to || '');
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [isLoadingMeta, setIsLoadingMeta] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDepartmentId(initialData.department_id || initialData.department?.id || '');
            setOpenings(initialData.openings ? String(initialData.openings) : '1');
            setDescription(initialData.description || '');
            setSkills(initialData.requirements || '');
            setReportingTo(initialData.reporting_to || '');
        }
    }, [initialData]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoadingMeta(true);
                const [deptRes, posRes] = await Promise.allSettled([
                    apiClient.get('/departments'),
                    apiClient.get('/positions', { params: { per_page: 100 } })
                ]);

                if (deptRes.status === 'fulfilled') {
                    setDepartments(deptRes.value.data?.data || deptRes.value.data || []);
                }
                if (posRes.status === 'fulfilled') {
                    setPositions(posRes.value.data?.data?.positions || posRes.value.data?.positions || []);
                }
            } catch (error) {
                console.error("Failed to load initial role metadata:", error);
            } finally {
                setIsLoadingMeta(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!title.trim() || !departmentId) {
            showWarning(t('toast-fill-required') || "Please fill in Position and Department");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                department_id: departmentId,
                openings: openings ? parseInt(openings) : 1,
                description: description.trim(),
                requirements: skills.trim(),
                reporting_to: reportingTo || null
            };

            if (isEdit) {
                await apiClient.put(`/positions/${initialData.id}`, payload);
                showSuccess(t('toast-update-success') || "Position updated successfully.");
            } else {
                await apiClient.post('/positions', payload);
                showSuccess(t('toast-create-success') || "Position created successfully.");
            }

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to save position:', error);
            showError(error, isEdit ? (t('toast-update-error') || "Failed to update position") : (t('toast-create-error') || "Failed to create position"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className={`arm-overlay ${isAr ? 'rtl' : 'ltr'}`} 
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            role="dialog"
            aria-modal="true"
        >
            <div className="arm-container">
                {/* Header */}
                <div className="arm-header">
                    <div className="arm-header-title">
                        <span className="arm-badge">{t('position')}</span>
                        <h3>{isEdit ? (t('edit') || 'Edit Position') : t('add')}</h3>
                    </div>
                    <button 
                        type="button" 
                        className="arm-close-btn" 
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form className="arm-body" onSubmit={handleSubmit}>
                    {/* Section 1: Basic Info */}
                    <div className="arm-section">
                        <h4 className="arm-section-title">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>badge</span>
                            {t('position')}
                        </h4>
                        <div className="arm-form-grid">
                            <div className="arm-form-group">
                                <label>{t('position')} *</label>
                                <input
                                    type="text"
                                    className="arm-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t('e.gtitle')}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="arm-form-group">
                                <label>{t('name')} *</label>
                                <select 
                                    className="arm-select" 
                                    value={departmentId} 
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    required
                                    disabled={isLoadingMeta}
                                >
                                    <option value="">{isLoadingMeta ? '...' : (t('select_department') || 'Select Department...')}</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="arm-form-group">
                                <label>{t('number')}</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="arm-input"
                                    value={openings}
                                    onChange={(e) => setOpenings(e.target.value)}
                                    placeholder={t('e.g')}
                                />
                            </div>
                            <div className="arm-form-group">
                                <label>{t('reporting')}</label>
                                <select 
                                    className="arm-select" 
                                    value={reportingTo} 
                                    onChange={(e) => setReportingTo(e.target.value)}
                                    disabled={isLoadingMeta}
                                >
                                    <option value="">{t('select_position') || 'Select Supervising Position...'}</option>
                                    {positions.map(pos => (
                                        <option key={pos.id} value={pos.title}>{pos.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Description & Skills */}
                    <div className="arm-section">
                        <h4 className="arm-section-title">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>description</span>
                            {t('Role')}
                        </h4>
                        <div className="arm-form-group full-width">
                            <label>{t('Role')}</label>
                            <textarea
                                className="arm-textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('enter')}
                                rows={3}
                            />
                        </div>
                        <div className="arm-form-group full-width">
                            <label>{t('skill')}</label>
                            <input
                                type="text"
                                className="arm-input"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                placeholder={t('addskill')}
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="arm-footer">
                    <button type="button" className="arm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
                        {t('cancel')}
                    </button>
                    <button 
                        type="button" 
                        className="arm-btn-submit" 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <DashboardLoader size="xs" inline text="" />
                        ) : (
                            isEdit ? (t('save') || 'Save Changes') : t('submit')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}