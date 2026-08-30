import React, { useState, useEffect } from 'react';
import './Requestaleave.css';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';

export default function Requestaleave({ isOpen, onClose, onSubmit, leaveTypes = [] }) {
    const { t, i18n } = useTranslation("EmployeePortal/Requestaleave");
    const isAr = i18n.language === "ar";

    const [requestCategory, setRequestCategory] = useState('vacation');
    
    // Vacation/Leave fields
    const [leaveType, setLeaveType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [duration, setDuration] = useState('');
    
    // Advance fields
    const [amount, setAmount] = useState('');
    const [installments, setInstallments] = useState('');

    // Equipment fields
    const [deviceType, setDeviceType] = useState('');
    const [specs, setSpecs] = useState('');

    // Compensation fields
    const [compAmount, setCompAmount] = useState('');
    const [compCategory, setCompCategory] = useState('');
    const [compDate, setCompDate] = useState('');

    // Data Update fields
    const [fieldName, setFieldName] = useState('');
    const [oldValue, setOldValue] = useState('');
    const [newValue, setNewValue] = useState('');

    // Resignation fields
    const [lastWorkingDay, setLastWorkingDay] = useState('');

    // Transfer fields
    const [currentDept, setCurrentDept] = useState('');
    const [newDept, setNewDept] = useState('');
    const [newTitle, setNewTitle] = useState('');

    // Promotion fields
    const [proposedTitle, setProposedTitle] = useState('');
    const [proposedSalary, setProposedSalary] = useState('');

    // Exp Certificate fields
    const [purpose, setPurpose] = useState('');

    // General fields
    const [reason, setReason] = useState('');
    const [fileName, setFileName] = useState('');
    const [fileObj, setFileObj] = useState(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (leaveTypes && leaveTypes.length > 0) {
            setLeaveType(leaveTypes[0].name_en);
        }
    }, [leaveTypes, isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
            setFileObj(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const formData = new FormData();
            formData.append('type', requestCategory);
            formData.append('reason', reason || '');
            
            // Build details JSON dynamic to the selected category
            let details = {};
            
            switch (requestCategory) {
                case 'vacation': {
                    const matchedType = leaveTypes.find(t => t.name_en === leaveType || t.id === Number(leaveType));
                    details = {
                        leave_type_id: matchedType ? matchedType.id : null,
                        leave_type_name: matchedType ? matchedType.name_en : leaveType,
                        leave_type_name_ar: matchedType ? matchedType.name_ar : '',
                        start_date: startDate || new Date().toISOString().split('T')[0],
                        duration: Number(duration) || 1
                    };
                    break;
                }
                case 'advance':
                    details = {
                        amount: amount,
                        installments: Number(installments) || 1,
                        reason: reason
                    };
                    break;
                case 'equipment':
                    details = {
                        deviceType: deviceType,
                        specs: specs
                    };
                    break;
                case 'compensation':
                    details = {
                        amount: compAmount,
                        category: compCategory,
                        spending_date: compDate
                    };
                    break;
                case 'data-update':
                    details = {
                        field: fieldName,
                        before: oldValue,
                        after: newValue
                    };
                    break;
                case 'resignation':
                    details = {
                        lastWorkingDay: lastWorkingDay
                    };
                    break;
                case 'transfer':
                    details = {
                        currentDept: currentDept,
                        newDept: newDept,
                        proposedTitle: newTitle
                    };
                    break;
                case 'promotion':
                    details = {
                        proposedTitle: proposedTitle,
                        proposedSalary: proposedSalary
                    };
                    break;
                case 'experience-certificate':
                    details = {
                        purpose: purpose
                    };
                    break;
                default:
                    details = { note: reason };
                    break;
            }

            formData.append('details', JSON.stringify(details));

            if (fileObj) {
                formData.append('attachment', fileObj);
            }

            await apiClient.post('/requests', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (onSubmit) {
                onSubmit();
            }

            // Reset state
            setStartDate('');
            setDuration('');
            setReason('');
            setAmount('');
            setInstallments('');
            setDeviceType('');
            setSpecs('');
            setCompAmount('');
            setCompCategory('');
            setCompDate('');
            setFieldName('');
            setOldValue('');
            setNewValue('');
            setLastWorkingDay('');
            setCurrentDept('');
            setNewDept('');
            setNewTitle('');
            setProposedTitle('');
            setProposedSalary('');
            setPurpose('');
            setFileName('');
            setFileObj(null);
            
            if (onClose) onClose();

        } catch (error) {
            console.error('Error submitting request:', error);
            setErrorMessage(error.response?.data?.message || (isAr ? 'فشل إرسال الطلب، يرجى المحاولة لاحقاً.' : 'Failed to submit request. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`request-leave-modal-overlay ${isAr ? "rtl" : "ltr"}`} onClick={onClose}>
            <div className="request-leave-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="request-leave-modal-header">
                    <div className="header-title-wrapper">
                        <div className="header-icon-glow">
                            <span className="material-symbols-outlined">assignment</span>
                        </div>
                        <h3>{t("modalTitle")}</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="request-leave-form">
                    <div className="modal-form-scrollable-body">
                        {errorMessage && (
                            <div className="leave-error-banner">
                                <span className="material-symbols-outlined">error</span>
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <div className="form-grid">
                        {/* Request Category Picker */}
                        <div className="form-group col-full">
                            <label className="form-label">{t("requestCategory")}</label>
                            <div className="select-wrapper">
                                <select 
                                    className="premium-input premium-select"
                                    value={requestCategory}
                                    onChange={(e) => setRequestCategory(e.target.value)}
                                    required
                                >
                                    <option value="vacation">{t("categories.vacation")}</option>
                                    <option value="advance">{t("categories.advance")}</option>
                                    <option value="equipment">{t("categories.equipment")}</option>
                                    <option value="compensation">{t("categories.compensation")}</option>
                                    <option value="data-update">{t("categories.dataUpdate")}</option>
                                    <option value="resignation">{t("categories.resignation")}</option>
                                    <option value="transfer">{t("categories.transfer")}</option>
                                    <option value="promotion">{t("categories.promotion")}</option>
                                    <option value="experience-certificate">{t("categories.expCertificate")}</option>
                                </select>
                                <span className="select-arrow material-symbols-outlined">expand_more</span>
                            </div>
                        </div>

                        {/* Category: Vacation / Leave */}
                        {requestCategory === 'vacation' && (
                            <>
                                <div className="form-group col-full">
                                    <label className="form-label">{t('type')}</label>
                                    <div className="select-wrapper">
                                        <select 
                                            className="premium-input premium-select"
                                            value={leaveType}
                                            onChange={(e) => setLeaveType(e.target.value)}
                                            required
                                        >
                                            {leaveTypes.length > 0 ? (
                                                leaveTypes.map(tObj => (
                                                    <option key={tObj.id} value={tObj.name_en}>
                                                        {isAr ? (tObj.name_ar || tObj.name_en) : (tObj.name_en || tObj.name_ar)}
                                                    </option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="Sick Leave">{isAr ? "إجازة مرضية" : "Sick Leave"}</option>
                                                    <option value="Annual Leave">{isAr ? "إجازة سنوية" : "Annual Leave"}</option>
                                                    <option value="Emergency Leave">{isAr ? "إجازة اضطرارية" : "Emergency Leave"}</option>
                                                </>
                                            )}
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
                                    <label className="form-label">{t('duration')}</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required 
                                        className="premium-input"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Category: Advance Request */}
                        {requestCategory === 'advance' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("advance.amount")}</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required 
                                        className="premium-input"
                                        placeholder="500"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("advance.installments")}</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required 
                                        className="premium-input"
                                        placeholder="6"
                                        value={installments}
                                        onChange={(e) => setInstallments(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Category: Equipment */}
                        {requestCategory === 'equipment' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("equipment.deviceType")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder={isAr ? "مثال: كمبيوتر محمول، شاشة" : "e.g. Laptop, Monitor"}
                                        value={deviceType}
                                        onChange={(e) => setDeviceType(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("equipment.specs")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder={isAr ? "مثال: 16GB RAM, Core i7" : "e.g. 16GB RAM, Core i7"}
                                        value={specs}
                                        onChange={(e) => setSpecs(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Category: Compensation */}
                        {requestCategory === 'compensation' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("compensation.amount")}</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required 
                                        className="premium-input"
                                        placeholder="150"
                                        value={compAmount}
                                        onChange={(e) => setCompAmount(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("compensation.category")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder={isAr ? "مثال: مصاريف سفر، بدل وجبات" : "e.g. Business Travel, Overtime"}
                                        value={compCategory}
                                        onChange={(e) => setCompCategory(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-full">
                                    <label className="form-label">{t("compensation.date")}</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="premium-input"
                                        value={compDate}
                                        onChange={(e) => setCompDate(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Category: Data Update */}
                        {requestCategory === 'data-update' && (
                            <>
                                <div className="form-group col-full">
                                    <label className="form-label">{t("dataUpdate.fieldName")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder={isAr ? "مثال: رقم الهاتف، العنوان" : "e.g. Phone Number, Address"}
                                        value={fieldName}
                                        onChange={(e) => setFieldName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("dataUpdate.oldValue")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        value={oldValue}
                                        onChange={(e) => setOldValue(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("dataUpdate.newValue")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Category: Resignation */}
                        {requestCategory === 'resignation' && (
                            <div className="form-group col-full">
                                <label className="form-label">{t("resignation.lastWorkingDay")}</label>
                                <input 
                                    type="date" 
                                    required 
                                    className="premium-input"
                                    value={lastWorkingDay}
                                    onChange={(e) => setLastWorkingDay(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Category: Transfer */}
                        {requestCategory === 'transfer' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("transfer.currentDept")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        value={currentDept}
                                        onChange={(e) => setCurrentDept(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("transfer.newDept")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        value={newDept}
                                        onChange={(e) => setNewDept(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-full">
                                    <label className="form-label">{t("transfer.newTitle")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Category: Promotion */}
                        {requestCategory === 'promotion' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("promotion.proposedTitle")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder={isAr ? "مثال: مبرمج أول" : "e.g. Senior Developer"}
                                        value={proposedTitle}
                                        onChange={(e) => setProposedTitle(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">{t("promotion.proposedSalary")}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder="500"
                                        value={proposedSalary}
                                        onChange={(e) => setProposedSalary(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {/* Category: Exp. Certificate */}
                        {requestCategory === 'experience-certificate' && (
                            <div className="form-group col-full">
                                <label className="form-label">{t("expCertificate.purpose")}</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="premium-input"
                                    placeholder={isAr ? "مثال: تقديم لسفارة، جهة بنكية" : "e.g. Visa Application, Banking"}
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Reason / Comments */}
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

                        {/* File Attachment */}
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
                                            t("click")
                                        )}
                                    </span>
                                    <span className="dropzone-subtext">PDF, PNG, JPG (Max: 10MB)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    </div>

                    <div className="modal-actions-footer">
                        <button className="btn-tertiary" type="button" onClick={onClose} disabled={isSubmitting}>
                            {t("cancel")}
                        </button>
                        <button className="btn-primary-gradient" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginInlineEnd: '8px', display: 'inline-block', width: '1rem', height: '1rem', border: '0.2em solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', verticalAlign: 'text-bottom', animation: 'spinner-border .75s linear infinite' }}></span>
                                    {t("submitting")}
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle"></i> {t("confirm")}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}