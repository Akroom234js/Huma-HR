import React, { useState, useEffect } from 'react';
import './Model.css';
import { useTranslation } from 'react-i18next';
import { createPerformanceCycle, getPerformanceTemplates } from '../../../../services/PerformanceHrService';

export default function CycleModal({ onClose, onSuccess }) {
    const { t } = useTranslation("HrPerformance/PerformanceReports");
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [templates, setTemplates] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await getPerformanceTemplates();
                const raw = res?.data?.data || res?.data || [];
                const list = Array.isArray(raw) ? raw : [];
                setTemplates(list);
                if (list.length > 0) setTemplateId(list[0].id);
            } catch (err) {
                console.error("Failed to load templates:", err);
            }
        };
        fetchTemplates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !startDate || !endDate) return;

        try {
            setIsSubmitting(true);
            const payload = {
                title: name,
                start_date: startDate,
                end_date: endDate,
            };

            if (templateId) {
                payload.performance_template_id = Number(templateId);
            } else {
                // If no template is saved yet in the database, send standard 5 components
                payload.components = [
                    { component_key: 'tasks', weight: 40 },
                    { component_key: 'manager', weight: 25 },
                    { component_key: 'peer', weight: 15 },
                    { component_key: 'attendance', weight: 10 },
                    { component_key: 'overtime', weight: 10 }
                ];
            }

            await createPerformanceCycle(payload);

            alert('تم إنشاء دورة الأداء بنجاح!');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to create performance cycle:", error);
            const errors = error.response?.data?.errors;
            let errorText = error.response?.data?.message || 'فشل إنشاء دورة الأداء.';
            if (errors && typeof errors === 'object') {
                const detailed = Object.values(errors).flat().join('\n');
                if (detailed) errorText = detailed;
            }
            alert(errorText);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-box">
            {/* Header */}
            <div className="modal-header">
                <div className="modal-header-title">
                    <div className="modal-icon-circle">
                        <i className="fa-solid fa-circle-play"></i>
                    </div>
                    <div>
                        <div className="modal-title">{t("new.Start")}</div>
                        <div className="modal-subtitle">{t("new.Define")}</div>
                    </div>
                </div>
                <button className="modal-close-btn" onClick={onClose} title="Close">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div className="modal-divider"></div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                {/* Cycle Name */}
                <div className="modal-form-group">
                    <label className="modal-label" htmlFor="cycleName">
                        {t("new.Name")} <span className="req">*</span>
                    </label>
                    <input 
                        type="text" 
                        id="cycleName" 
                        className="modal-input" 
                        placeholder="e.g. Q3 2026, H1 2026, Annual Review..." 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Date Range */}
                <div className="modal-form-group">
                    <label className="modal-label">
                        {t("new.Period")} <span className="req">*</span>
                    </label>
                    <div className="modal-date-grid">
                        <div>
                            <label className="modal-label">{t("new.Date")}</label>
                            <input 
                                type="date" 
                                className="modal-input" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="modal-label">{t("new.End")}</label>
                            <input 
                                type="date" 
                                className="modal-input" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Template Selection */}
                {templates.length > 0 && (
                    <div className="modal-form-group">
                        <label className="modal-label">نموذج ومعايير التقييم (Template)</label>
                        <select 
                            className="modal-input" 
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                        >
                            {templates.map(tpl => (
                                <option key={tpl.id} value={tpl.id}>
                                    {tpl.name} {tpl.is_default ? '(الافتراضي)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Live Preview Banner */}
                <div className="modal-preview-banner">
                    <i className="fa-solid fa-eye"></i>
                    <div>
                        <div>{t("new.PREVIEW")}</div>
                        <div>{name ? `"${name}" · ${startDate} → ${endDate}` : '[All Departments]'}</div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button type="button" className="btn-modal-cancel" onClick={onClose}>
                        {t("new.Cancel")}
                    </button>
                    <button 
                        type="submit" 
                        className="btn-modal-submit" 
                        disabled={isSubmitting || !name || !startDate || !endDate}
                    >
                        {isSubmitting ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                            <>
                                <i className="fa-solid fa-circle-play"></i>
                                {t("new.Launch")}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}