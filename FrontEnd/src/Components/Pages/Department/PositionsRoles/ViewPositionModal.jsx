import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';
import DashboardLoader from '../../../Shared/DashboardLoader/DashboardLoader';

export default function ViewPositionModal({ positionId, onClose, onEdit }) {
    const { t, i18n } = useTranslation('Department/PositionRoles');
    const isAr = i18n?.language === 'ar';

    const [position, setPosition] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!positionId) return;

        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const res = await apiClient.get(`/positions/${positionId}`);
                setPosition(res.data?.data || null);
            } catch (error) {
                console.error("Failed to load position details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [positionId]);

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
    };

    return (
        <div 
            className={`arm-overlay ${isAr ? 'rtl' : 'ltr'}`} 
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            role="dialog"
            aria-modal="true"
        >
            <div className="arm-container" style={{ maxWidth: '640px' }}>
                {/* Header */}
                <div className="arm-header">
                    <div className="arm-header-title">
                        <span className="arm-badge">{position?.department?.name || t('position')}</span>
                        <h3>{position?.title || t('position_details') || 'Position Details'}</h3>
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

                {/* Body */}
                <div className="arm-body">
                    {isLoading ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }}>
                            <DashboardLoader text={t('loading')} size="md" />
                        </div>
                    ) : !position ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {t('not_found') || 'Position not found'}
                        </p>
                    ) : (
                        <>
                            {/* Stats Highlights */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'var(--bg-page)',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                                        {t('openings_capacity') || 'Total Openings'}
                                    </span>
                                    <strong style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}>
                                        {position.openings || 1}
                                    </strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                                        {t('assigned_employees') || 'Assigned Employees'}
                                    </span>
                                    <strong style={{ fontSize: '1.25rem', color: (position.assigned_count >= position.openings) ? 'var(--emerald-500, #10b981)' : 'var(--amber-500, #f59e0b)' }}>
                                        {position.assigned_count ?? position.employees?.length ?? 0}
                                    </strong>
                                </div>
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                                        {t('available_slots') || 'Available Slots'}
                                    </span>
                                    <strong style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>
                                        {position.available_openings ?? Math.max(0, (position.openings || 1) - (position.assigned_count ?? 0))}
                                    </strong>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="arm-section">
                                <h4 className="arm-section-title">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>info</span>
                                    {t('overview') || 'Role Overview'}
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('department') || 'Department'}: </span>
                                        <span style={{ color: 'var(--text-main)' }}>{position.department?.name || '—'}</span>
                                    </div>
                                    {position.reporting_to && (
                                        <div>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('reporting') || 'Reports to'}: </span>
                                            <span style={{ color: 'var(--text-main)' }}>{position.reporting_to}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('Role') || 'Description'}: </span>
                                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-main)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                            {position.description || '—'}
                                        </p>
                                    </div>
                                    {position.requirements && (
                                        <div>
                                            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('skill') || 'Skills & Requirements'}: </span>
                                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-main)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                                {position.requirements}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Assigned Employees */}
                            <div className="arm-section">
                                <h4 className="arm-section-title">
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>group</span>
                                    {t('current_employees') || 'Current Employees in this Role'}
                                </h4>
                                {position.employees && position.employees.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto' }}>
                                        {position.employees.map((emp) => (
                                            <div 
                                                key={emp.id} 
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '8px',
                                                    background: 'var(--bg-page)',
                                                    border: '1px solid var(--border-color)'
                                                }}
                                            >
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(53, 158, 255, 0.15)',
                                                    color: 'var(--primary-color)',
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {getInitials(emp.name)}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                                                        {emp.name}
                                                    </p>
                                                    {emp.employee_id && (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            #{emp.employee_id}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontStyle: 'italic', margin: 0 }}>
                                        {t('no_employees_assigned') || 'No employees currently assigned to this position.'}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="arm-footer">
                    <button type="button" className="arm-btn-cancel" onClick={onClose}>
                        {t('close') || 'Close'}
                    </button>
                    {position && onEdit && (
                        <button 
                            type="button" 
                            className="arm-btn-submit" 
                            onClick={() => {
                                onClose?.();
                                onEdit(position);
                            }}
                        >
                            <i className="bi bi-pen" style={{ marginInlineEnd: '4px' }}></i>
                            {t('edit') || 'Edit Position'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
