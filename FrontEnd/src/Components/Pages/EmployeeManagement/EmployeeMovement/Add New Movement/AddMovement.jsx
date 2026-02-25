import React, { useState } from 'react';
import './AddMovement.css';
import { useTranslation } from 'react-i18next';

const AddMovement = () => {
    const { t } = useTranslation('EmployeeMovement/EmployeeMovement');
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [modalStep, setModalStep] = useState('selection'); // 'selection' or 'promotion'

    return (
        <div className="em-add-movement-container">
            <button className="em-btn em-btn-primary" onClick={() => {
                setShowMovementModal(true);
                setModalStep('selection');
            }}>
                <span className="material-symbols-outlined">person_add</span>
                {t('btn-add-movement')}
            </button>

            {/* Movement Modal */}
            {showMovementModal && (
                <div className="em-modal-overlay" onClick={() => setShowMovementModal(false)}>
                    <div className="em-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className={`em-modal-wrapper step-${modalStep}`}>
                            {/* Step 1: Selection */}
                            <div className="em-modal-step">
                                <div className="em-modal-header">
                                    <div>
                                        <h2 className="em-modal-title">{t('modal-title-select')}</h2>
                                        <p className="em-subtitle" style={{ fontSize: '0.8125rem' }}>{t('modal-subtitle-select')}</p>
                                    </div>
                                    <button className="em-modal-close" onClick={() => setShowMovementModal(false)}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="em-modal-body">
                                    <div className="em-modal-selection-list">
                                        <button className="em-selection-btn" onClick={() => setModalStep('promotion')}>
                                            <div className="em-selection-content">
                                                <div className="em-selection-icon-box em-type-promotion-bg">
                                                    <span className="material-symbols-outlined">trending_up</span>
                                                </div>
                                                <div className="em-selection-text">
                                                    <h4>{t('type-promotion')}</h4>
                                                    <p>{t('type-promotion-desc')}</p>
                                                </div>
                                            </div>
                                            <span className="em-selection-action">{t('btn-select')}</span>
                                        </button>

                                        <button className="em-selection-btn">
                                            <div className="em-selection-content">
                                                <div className="em-selection-icon-box em-type-transfer-bg">
                                                    <span className="material-symbols-outlined">move_location</span>
                                                </div>
                                                <div className="em-selection-text">
                                                    <h4>{t('type-transfer')}</h4>
                                                    <p>{t('type-transfer-desc')}</p>
                                                </div>
                                            </div>
                                            <span className="em-selection-action">{t('btn-select')}</span>
                                        </button>

                                        <button className="em-selection-btn">
                                            <div className="em-selection-content">
                                                <div className="em-selection-icon-box em-type-salary-bg">
                                                    <span className="material-symbols-outlined">payments</span>
                                                </div>
                                                <div className="em-selection-text">
                                                    <h4>{t('type-salary-adjustment')}</h4>
                                                    <p>{t('type-salary-adjustment-desc')}</p>
                                                </div>
                                            </div>
                                            <span className="em-selection-action">{t('btn-select')}</span>
                                        </button>

                                        <button className="em-selection-btn">
                                            <div className="em-selection-content">
                                                <div className="em-selection-icon-box em-type-dept-bg">
                                                    <span className="material-symbols-outlined">domain_add</span>
                                                </div>
                                                <div className="em-selection-text">
                                                    <h4>{t('type-department-change')}</h4>
                                                    <p>{t('type-department-change-desc')}</p>
                                                </div>
                                            </div>
                                            <span className="em-selection-action">{t('btn-select')}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="em-modal-footer-info">
                                    <p>{t('modal-info-footer')}</p>
                                </div>
                            </div>

                            {/* Step 2: Promotion Form */}
                            <div className="em-modal-step">
                                <div className="em-modal-header em-modal-header-form">
                                    <div className="em-header-with-icon">
                                        <div className="em-selection-icon-box em-type-promotion-bg">
                                            <span className="material-symbols-outlined">trending_up</span>
                                        </div>
                                        <div>
                                            <h2 className="em-modal-title">{t('promotion-modal-title')}</h2>
                                            <p className="em-subtitle">{t('promotion-modal-subtitle')}</p>
                                        </div>
                                    </div>
                                    <button className="em-modal-close" onClick={() => setShowMovementModal(false)}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="em-modal-body em-form-body">
                                    <div className="em-form-group full-width">
                                        <label className="em-label">{t('label-select-employee')}</label>
                                        <div className="em-search-container">
                                            <span className="material-symbols-outlined em-icon-left">search</span>
                                            <input type="text" className="em-input-with-icon" placeholder={t('placeholder-search-employee')} />
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-current-position')}</label>
                                            <div className="em-readonly-input">Product Designer</div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-new-position')}</label>
                                            <div className="em-select-container">
                                                <select className="em-select-input">
                                                    <option disabled selected>{t('placeholder-select-new-role')}</option>
                                                    <option>Senior Product Designer</option>
                                                    <option>Lead Product Designer</option>
                                                </select>
                                                <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-department')}</label>
                                            <div className="em-readonly-input">Design Team</div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-effective-date')}</label>
                                            <input type="date" className="em-date-input" />
                                        </div>
                                    </div>

                                    <div className="em-form-group full-width">
                                        <label className="em-label">{t('label-direct-manager')}</label>
                                        <div className="em-select-container">
                                            <span className="material-symbols-outlined em-icon-left">person</span>
                                            <select className="em-select-input has-icon-left">
                                                <option disabled selected>{t('placeholder-select-manager')}</option>
                                                <option>Admin</option>
                                                <option>HR Manager</option>
                                            </select>
                                            <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                        </div>
                                    </div>

                                    <div className="em-form-group full-width">
                                        <label className="em-label">{t('label-promotion-reason')}</label>
                                        <textarea className="em-textarea" placeholder={t('placeholder-promotion-reason')}></textarea>
                                    </div>
                                </div>
                                <div className="em-modal-footer em-form-footer">
                                    <button className="em-back-btn" onClick={() => setModalStep('selection')}>
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        {t('btn-back')}
                                    </button>
                                    <div className="em-footer-actions">
                                        <button className="em-confirm-btn">
                                            <span className="material-symbols-outlined">check</span>
                                            {t('btn-confirm-promotion')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddMovement;
