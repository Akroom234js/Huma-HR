import React, { useState, useEffect } from 'react';
import './Requestaleave.css';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';

export default function Requestaleave({ isOpen, onClose, onSubmit, leaveTypes = [] }) {
    const { t } = useTranslation("EmployeePortal/Requestaleave");
    const [requestCategory, setRequestCategory] = useState('vacation');
    
    // Vacation/Leave fields
    const [leaveType, setLeaveType] = useState('Sick Leave');
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
                case 'vacation':
                    details = {
                        leave_type_id: leaveTypes.find(t => t.name_en === leaveType)?.id,
                        leave_type_name: leaveType,
                        start_date: startDate || new Date().toISOString().split('T')[0],
                        duration: Number(duration) || 1
                    };
                    break;
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
                        specs: specs,
                        reason: reason
                    };
                    break;
                case 'compensation':
                    details = {
                        amount: compAmount,
                        category: compCategory,
                        date: compDate
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
                        newTitle: newTitle
                    };
                    break;
                case 'promotion':
                    details = {
                        proposedTitle: proposedTitle,
                        salaryIncrease: proposedSalary
                    };
                    break;
                case 'experience-certificate':
                    details = {
                        purpose: purpose
                    };
                    break;
                default:
                    break;
            }

            formData.append('details', JSON.stringify(details));

            if (fileObj) {
                formData.append('attachment', fileObj);
            }

            const response = await apiClient.post('/requests', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (onSubmit) {
                onSubmit(response.data.data);
            }

            // Reset form fields
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
            setErrorMessage(error.response?.data?.message || 'Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="request-leave-modal-overlay" onClick={onClose}>
            <div className="request-leave-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="request-leave-modal-header">
                    <div className="header-title-wrapper">
                        <div className="header-icon-glow">
                            <span className="material-symbols-outlined">assignment</span>
                        </div>
                        <h3>Submit New Request (تقديم طلب جديد)</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="request-leave-form">
                    {errorMessage && (
                        <div className="leave-error-banner" style={{ color: '#ff4d4f', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', padding: '10px', borderRadius: '6px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="form-grid">
                        {/* ── Request Category Picker ── */}
                        <div className="form-group col-full">
                            <label className="form-label">Request Category (تصنيف الطلب)</label>
                            <div className="select-wrapper">
                                <select 
                                    className="premium-input premium-select"
                                    value={requestCategory}
                                    onChange={(e) => setRequestCategory(e.target.value)}
                                    required
                                >
                                    <option value="vacation">Vacation / Leave (إجازة)</option>
                                    <option value="advance">Advance Request (طلب سلفة)</option>
                                    <option value="equipment">Equipment Request (طلب عهدة / أجهزة)</option>
                                    <option value="compensation">Compensation (طلب تعويض مالي)</option>
                                    <option value="data-update">Data Update (تعديل بيانات الموظف)</option>
                                    <option value="resignation">Resignation (تقديم استقالة)</option>
                                    <option value="transfer">Transfer Department (نقل قسم)</option>
                                    <option value="promotion">Promotion Request (طلب ترقية)</option>
                                    <option value="experience-certificate">Experience Certificate (شهادة خبرة)</option>
                                </select>
                                <span className="select-arrow material-symbols-outlined">expand_more</span>
                            </div>
                        </div>

                        {/* ── Dynamic Fields based on Category ── */}
                        {requestCategory === 'vacation' && (
                            <>
                                <div className="form-group col-full">
                                    <label className="form-label">{t('type') || "Leave Type"}</label>
                                    <div className="select-wrapper">
                                        <select 
                                            className="premium-input premium-select"
                                            value={leaveType}
                                            onChange={(e) => setLeaveType(e.target.value)}
                                            required
                                        >
                                            {leaveTypes.length > 0 ? (
                                                leaveTypes.map(t => (
                                                    <option key={t.id} value={t.name_en}>{t.name_en} {t.name_ar ? `(${t.name_ar})` : ''}</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="Sick Leave">Sick Leave</option>
                                                    <option value="Annual Leave">Annual Leave</option>
                                                    <option value="Emergency Leave">Emergency Leave</option>
                                                </>
                                            )}
                                        </select>
                                        <span className="select-arrow material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">{t('Dates') || "Start Date"}</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="premium-input"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">{t('duration') || "Duration"} (Days)</label>
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

                        {requestCategory === 'advance' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">Advance Amount (مبلغ السلفة)</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required 
                                        className="premium-input"
                                        placeholder="e.g. 500"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">Installments (عدد الأشهر لسدادها)</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required 
                                        className="premium-input"
                                        placeholder="e.g. 6"
                                        value={installments}
                                        onChange={(e) => setInstallments(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {requestCategory === 'equipment' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">Device Type (نوع الجهاز المطلوب)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder="e.g. Laptop, Monitor"
                                        value={deviceType}
                                        onChange={(e) => setDeviceType(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">Specifications (المواصفات المطلوبة)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder="e.g. 16GB RAM, i7"
                                        value={specs}
                                        onChange={(e) => setSpecs(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {requestCategory === 'compensation' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">Compensation Amount (مبلغ التعويض)</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required 
                                        className="premium-input"
                                        placeholder="e.g. 150"
                                        value={compAmount}
                                        onChange={(e) => setCompAmount(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">Category (التصنيف)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder="e.g. Business Travel, Overtime"
                                        value={compCategory}
                                        onChange={(e) => setCompCategory(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-full">
                                    <label className="form-label">Spending Date (تاريخ الإنفاق)</label>
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

                        {requestCategory === 'data-update' && (
                            <>
                                <div className="form-group col-full">
                                    <label className="form-label">Field Name (اسم الحقل المطلوب تعديله)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder="e.g. Phone Number, Address"
                                        value={fieldName}
                                        onChange={(e) => setFieldName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">Old Value (القيمة الحالية)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        value={oldValue}
                                        onChange={(e) => setOldValue(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">New Value (القيمة الجديدة)</label>
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

                        {requestCategory === 'resignation' && (
                            <div className="form-group col-full">
                                <label className="form-label">Last Working Day (آخر يوم عمل مقترح)</label>
                                <input 
                                    type="date" 
                                    required 
                                    className="premium-input"
                                    value={lastWorkingDay}
                                    onChange={(e) => setLastWorkingDay(e.target.value)}
                                />
                            </div>
                        )}

                        {requestCategory === 'transfer' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">Current Department (القسم الحالي)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        value={currentDept}
                                        onChange={(e) => setCurrentDept(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">Target Department (القسم المنقول إليه)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        value={newDept}
                                        onChange={(e) => setNewDept(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-full">
                                    <label className="form-label">Proposed Job Title (المسمى الوظيفي الجديد)</label>
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

                        {requestCategory === 'promotion' && (
                            <>
                                <div className="form-group col-half">
                                    <label className="form-label">Proposed Job Title (المسمى الوظيفي الجديد)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder="e.g. Senior Backend Developer"
                                        value={proposedTitle}
                                        onChange={(e) => setProposedTitle(e.target.value)}
                                    />
                                </div>
                                <div className="form-group col-half">
                                    <label className="form-label">Proposed Salary Increase (الزيادة المقترحة للراتب)</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="premium-input"
                                        placeholder="e.g. 500"
                                        value={proposedSalary}
                                        onChange={(e) => setProposedSalary(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {requestCategory === 'experience-certificate' && (
                            <div className="form-group col-full">
                                <label className="form-label">Purpose of Certificate (الغرض من الشهادة)</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="premium-input"
                                    placeholder="e.g. Bank Account, Visa Application"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>
                        )}

                        {/* ── General Common Reason Filed ── */}
                        <div className="form-group col-full">
                            <label className="form-label">Reason / Comments (السبب أو ملاحظات إضافية)</label>
                            <textarea 
                                className="premium-input premium-textarea" 
                                placeholder="Describe details or reasoning..."
                                rows="3"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            ></textarea>
                        </div>

                        {/* ── Common File Attachment ── */}
                        <div className="form-group col-full">
                            <label className="form-label">{t("attah") || "Attachment (مرفق)"}</label>
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
                        <button className="btn-tertiary" type="button" onClick={onClose} disabled={isSubmitting}>
                            {t("cancel") || "Cancel"}
                        </button>
                        <button className="btn-primary-gradient" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ marginRight: '8px', display: 'inline-block', width: '1rem', height: '1rem', border: '0.2em solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', verticalAlign: 'text-bottom', animation: 'spinner-border .75s linear infinite' }}></span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle"></i> {t("confirm") || "Confirm"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}