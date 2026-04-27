import React, { useState, useEffect, useCallback } from 'react';
import './AddMovement.css';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../../apiConfig';

const AddMovement = ({ onAddMovement }) => {
    const { t } = useTranslation('EmployeeMovement/EmployeeMovement');
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [modalStep, setModalStep] = useState('selection'); // 'selection', 'promotion', or 'transfer'
    const [positionsList, setPositionsList] = useState([]);
    // Form and Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [adjustmentTypes, setAdjustmentTypes] = useState([]);
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        newPosition: '',
        newLocation: '',
        effectiveDate: '',
        manager: '',
        newSalary: '',
        reason: '',
        adjustmentType: '',
        customTypeEn: '',
        customTypeAr: '',
        newDepartmentId: ''
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [posRes, empRes] = await Promise.all([
                    apiClient.get('/positions', { params: { per_page: 100 } }),
                    apiClient.get('/employees', { params: { per_page: 100 } })
                ]);

                // التأكد من الوصول للمسار الصحيح للبيانات بناءً على الـ Resource الخاص بك
                setPositionsList(posRes.data?.data?.positions || posRes.data?.data || []);
                setManagers(empRes.data?.data?.employees || empRes.data?.data || []);
            } catch (error) {
                console.error("Error fetching movement data:", error);
            }
        };

        if (showMovementModal) {
            fetchData();
        }
    }, [showMovementModal]); // سيتم الجلب فقط عند فتح الم
    const fetchEmployees = useCallback(async (query) => {
        if (!query) return;
        try {
            const res = await apiClient.get('/employees', { params: { search: query } });
            setEmployees(res.data?.data?.employees || []);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery && !selectedEmployee) {
                fetchEmployees(searchQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedEmployee, fetchEmployees]);

    // استبدل دالة fetchFilters (من السطر 53 إلى 65) بهذا الكود:
    const fetchFilters = useCallback(async () => {
        // جلب كل فلتر على حدة لضمان عدم توقف الواجهة
        apiClient.get('/departments')
            .then(res => setDepartmentOptions(res.data?.data || []))
            .catch(err => console.error("Error fetching departments:", err));

        apiClient.get('/salary-adjustments/types')
            .then(res => setAdjustmentTypes(res.data?.data || []))
            .catch(err => console.error("Error fetching adjustment types:", err));

        apiClient.get('/employees/managers')
            .then(res => setManagers(res.data?.data || []))
            .catch(err => console.error("Error fetching managers:", err));
    }, []);
    useEffect(() => {
        if (showMovementModal) {
            fetchFilters();
        }
    }, [showMovementModal]);

    const handleEmployeeSelect = (emp) => {
        setSelectedEmployee(emp);
        setSearchQuery(emp.full_name);
        setShowSearchResults(false);
        // Pre-fill effective date if needed
        setFormData(prev => ({ ...prev, effectiveDate: new Date().toISOString().split('T')[0] }));
    };

    const handleConfirm = async () => {
        if (!selectedEmployee || !formData.effectiveDate) {
            alert('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                employee_profile_id: selectedEmployee.id,
                movement_date: formData.effectiveDate,
                effective_date: formData.effectiveDate,
                notes: formData.reason || '',
            };

            if (modalStep === 'promotion') {
                payload.movement_type = 'promotion';
                payload.new_position = formData.newPosition;
                payload.manager_id = formData.manager;
            } else if (modalStep === 'transfer') {
                payload.movement_type = 'transfer';
                payload.new_position = formData.newPosition;
                payload.manager_id = formData.manager;
                payload.adjustment_reason = formData.reason;
            } else if (modalStep === 'dept-change') {
                payload.movement_type = 'department_change';
                payload.new_department_id = formData.newDepartmentId;
                payload.manager_id = formData.manager;
            } else if (modalStep === 'salary') {
                payload.movement_type = 'salary_adjustment';
                payload.new_salary = formData.newSalary;
                // إذا كانت القيمة "other" نرسل null للـ id، وإلا نرسل الـ id المختار
                payload.adjustment_type_id = formData.adjustmentType === 'option-other' ? null : formData.adjustmentType;
                payload.custom_type_name = formData.adjustmentType === 'option-other' ? formData.customTypeEn : null;
                payload.adjustment_reason = formData.reason;
            }

            await apiClient.post('/employee-movements', payload);
            alert('Movement recorded successfully!');
            onAddMovement(); // Refresh the list in parent
            setShowMovementModal(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save movement", error);
            const errorMsg = error.response?.data?.message || 'Error saving movement';
            alert(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setModalStep('selection');
        setSearchQuery('');
        setSelectedEmployee(null);
        setFormData({
            newPosition: '',
            newLocation: '',
            effectiveDate: '',
            manager: '',
            newSalary: '',
            reason: '',
            adjustmentType: '',
            customTypeEn: '',
            customTypeAr: '',
            newDepartmentId: ''
        });
    };

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

                                        <button className="em-selection-btn" onClick={() => setModalStep('transfer')}>
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

                                        <button className="em-selection-btn" onClick={() => setModalStep('dept-change')}>
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

                                        <button className="em-selection-btn" onClick={() => setModalStep('salary')}>
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

                                        {/* Removed redundant Dept Change button here as it's added above */}
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
                                            <input
                                                type="text"
                                                className="em-input-with-icon"
                                                placeholder={t('placeholder-search-employee')}
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setShowSearchResults(true);
                                                    if (selectedEmployee) setSelectedEmployee(null);
                                                }}
                                                onFocus={() => setShowSearchResults(true)}
                                            />
                                            {showSearchResults && searchQuery && (
                                                <div className="em-search-results">
                                                    {employees.length > 0 ? (
                                                        employees.map(emp => (
                                                            <div
                                                                key={emp.id}
                                                                className="em-search-result-item"
                                                                onClick={() => handleEmployeeSelect(emp)}
                                                            >
                                                                <div className="em-result-info">
                                                                    <span className="em-result-name">{emp.full_name}</span>
                                                                    <span className="em-result-id">{emp.employee_id}</span>
                                                                </div>
                                                                <span className="em-result-pos">{emp.job_title}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="em-no-results">No employees found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-current-position')}</label>
                                            <div className="em-readonly-input">
                                                {selectedEmployee ? selectedEmployee.position : '—'}
                                            </div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-new-position')}</label>
                                            <div className="em-select-container">
                                                <select
                                                    className="em-select-input"
                                                    value={formData.newPosition}
                                                    onChange={(e) => setFormData({ ...formData, newPosition: e.target.value })}
                                                >
                                                    <option value="">{t('select_position')}</option>
                                                    {positionsList.map(pos => (
                                                        <option key={pos.id} value={pos.title}>{pos.title}</option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-department')}</label>
                                            <div className="em-readonly-input">
                                                {selectedEmployee ? selectedEmployee.department?.name : '—'}
                                            </div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-effective-date')}</label>
                                            <input
                                                type="date"
                                                className="em-date-input"
                                                value={formData.effectiveDate}
                                                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="em-form-group full-width">
                                        <label className="em-label">{t('label-direct-manager')}</label>
                                        <div className="em-select-container">
                                            <span className="material-symbols-outlined em-icon-left">person</span>
                                            <select
                                                className="em-select-input has-icon-left"
                                                value={formData.manager}
                                                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                            >
                                                <option value="">{t('select_manager')}</option>
                                                {managers.map(m => (
                                                    <option key={m.id} value={m.id}>{m.full_name}</option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="em-modal-footer em-form-footer">
                                    <button className="em-back-btn" onClick={() => setModalStep('selection')}>
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        {t('btn-back')}
                                    </button>
                                    <div className="em-footer-actions">
                                        <button className="em-confirm-btn" onClick={handleConfirm}>
                                            <span className="material-symbols-outlined">check</span>
                                            {t('btn-confirm-promotion')}
                                        </button>
                                    </div>
                                </div>
                            </div>                             {/* Step 3: Transfer Form (Updated) */}
                            <div className="em-modal-step">
                                <div className="em-modal-header em-modal-header-form">
                                    <div className="em-header-with-icon">
                                        <div className="em-selection-icon-box em-type-transfer-bg">
                                            <span className="material-symbols-outlined">move_location</span>
                                        </div>
                                        <div>
                                            <h2 className="em-modal-title">{t('transfer-modal-title')}</h2>
                                            <p className="em-subtitle">{t('transfer-modal-subtitle')}</p>
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
                                            <input
                                                type="text"
                                                className="em-input-with-icon"
                                                placeholder={t('placeholder-search-employee')}
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setShowSearchResults(true);
                                                    if (selectedEmployee) setSelectedEmployee(null);
                                                }}
                                                onFocus={() => setShowSearchResults(true)}
                                            />
                                            {showSearchResults && searchQuery && (
                                                <div className="em-search-results">
                                                    {employees.length > 0 ? (
                                                        employees.map(emp => (
                                                            <div
                                                                key={emp.id}
                                                                className="em-search-result-item"
                                                                onClick={() => handleEmployeeSelect(emp)}
                                                            >
                                                                <div className="em-result-info">
                                                                    <span className="em-result-name">{emp.full_name}</span>
                                                                    <span className="em-result-id">{emp.employee_id}</span>
                                                                </div>
                                                                <span className="em-result-pos">{emp.job_title}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="em-no-results">No employees found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-current-position')}</label>
                                            <div className="em-readonly-input">
                                                {selectedEmployee ? selectedEmployee.job_title : '—'}
                                            </div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-new-position')}</label>
                                            <div className="em-select-container">
                                                <select
                                                    className="em-select-input"
                                                    value={formData.newPosition}
                                                    onChange={(e) => setFormData({ ...formData, newPosition: e.target.value })}
                                                >
                                                    <option value="">{t('select_position')}</option>
                                                    {positionsList.map(pos => (
                                                        <option key={pos.id} value={pos.title}>{pos.title}</option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-direct-manager')}</label>
                                            <div className="em-select-container">
                                                <span className="material-symbols-outlined em-icon-left">person</span>
                                                <select
                                                    className="em-select-input has-icon-left"
                                                    value={formData.manager}
                                                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                                >
                                                    <option value="" disabled>{t('placeholder-select-manager')}</option>
                                                    {managers.map(m => (
                                                        <option key={m.id} value={m.id}>{m.full_name}</option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                            </div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-effective-date')}</label>
                                            <input
                                                type="date"
                                                className="em-date-input"
                                                value={formData.effectiveDate}
                                                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="em-form-group full-width">
                                        <label className="em-label">{t('label-adjustment-reason')}</label>
                                        <textarea
                                            className="em-textarea"
                                            rows="3"
                                            placeholder={t('placeholder-adjustment-reason')}
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="em-modal-footer em-form-footer">
                                    <button className="em-back-btn" onClick={() => setModalStep('selection')}>
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        {t('btn-back')}
                                    </button>
                                    <div className="em-footer-actions">
                                        <button className="em-confirm-btn" onClick={handleConfirm}>
                                            <span className="material-symbols-outlined">check</span>
                                            {t('btn-confirm-transfer')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Step 4: Salary Adjustment Form */}
                            <div className="em-modal-step">
                                <div className="em-modal-header em-modal-header-form">
                                    <div className="em-header-with-icon">
                                        <div className="em-selection-icon-box em-type-salary-bg">
                                            <span className="material-symbols-outlined">payments</span>
                                        </div>
                                        <div>
                                            <h2 className="em-modal-title">{t('salary-modal-title')}</h2>
                                            <p className="em-subtitle">{t('salary-modal-subtitle')}</p>
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
                                            <input
                                                type="text"
                                                className="em-input-with-icon"
                                                placeholder={t('placeholder-search-employee')}
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setShowSearchResults(true);
                                                    if (selectedEmployee) setSelectedEmployee(null);
                                                }}
                                                onFocus={() => setShowSearchResults(true)}
                                            />
                                            {showSearchResults && searchQuery && (
                                                <div className="em-search-results">
                                                    {employees.length > 0 ? (
                                                        employees.map(emp => (
                                                            <div
                                                                key={emp.id}
                                                                className="em-search-result-item"
                                                                onClick={() => handleEmployeeSelect(emp)}
                                                            >
                                                                <div className="em-result-info">
                                                                    <span className="em-result-name">{emp.full_name}</span>
                                                                    <span className="em-result-id">{emp.employee_id}</span>
                                                                </div>
                                                                <span className="em-result-pos">{emp.job_title}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="em-no-results">No employees found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-current-salary')}</label>
                                            <div className="em-readonly-input">
                                                {selectedEmployee?.salary ? `$ ${selectedEmployee.salary} USD` : '—'}
                                            </div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-effective-date')}</label>
                                            <input
                                                type="date"
                                                className="em-date-input"
                                                value={formData.effectiveDate}
                                                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-adjustment-type')}</label>
                                            <div className="em-select-container">
                                                <select
                                                    className="em-select-input"
                                                    value={formData.adjustmentType}
                                                    onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value })}
                                                >
                                                    <option value="" disabled>{t('label-adjustment-type')}</option>
                                                    {adjustmentTypes.map(adj => (
                                                        <option key={adj.id} value={adj.id}>
                                                            {adj.name_ar || adj.name}
                                                        </option>
                                                    ))}
                                                    <option value="option-other">{t('option-other')}</option>
                                                </select>
                                                <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                            </div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-new-salary')}</label>
                                            <div className="em-search-container">
                                                <span className="em-icon-left">$</span>
                                                <input
                                                    type="number"
                                                    className="em-input-with-icon"
                                                    placeholder="0.00"
                                                    value={formData.newSalary}
                                                    onChange={(e) => setFormData({ ...formData, newSalary: e.target.value })}
                                                />
                                                <span className="em-icon-right" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>USD</span>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.adjustmentType === 'option-other' && (
                                        <div className="em-form-row">
                                            <div className="em-form-group">
                                                <label className="em-label">{t('label-custom-type-en')}</label>
                                                <input
                                                    type="text"
                                                    className="em-input"
                                                    placeholder={t('placeholder-custom-type-en')}
                                                    value={formData.customTypeEn}
                                                    onChange={(e) => setFormData({ ...formData, customTypeEn: e.target.value })}
                                                />
                                            </div>
                                            <div className="em-form-group">
                                                <label className="em-label">{t('label-custom-type-ar')}</label>
                                                <input
                                                    type="text"
                                                    className="em-input"
                                                    placeholder={t('placeholder-custom-type-ar')}
                                                    value={formData.customTypeAr}
                                                    onChange={(e) => setFormData({ ...formData, customTypeAr: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="em-form-group full-width">
                                        <label className="em-label">{t('label-adjustment-reason')}</label>
                                        <textarea
                                            className="em-textarea"
                                            rows="3"
                                            placeholder={t('placeholder-adjustment-reason')}
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="em-modal-footer em-form-footer">
                                    <button className="em-back-btn" onClick={() => setModalStep('selection')}>
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        {t('btn-back')}
                                    </button>
                                    <div className="em-footer-actions">
                                        <button className="em-confirm-btn" onClick={handleConfirm}>
                                            <span className="material-symbols-outlined">payments</span>
                                            {t('btn-confirm-salary')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Step 5: Department Change Form (Was Transfer) */}
                            <div className="em-modal-step">
                                <div className="em-modal-header em-modal-header-form">
                                    <div className="em-header-with-icon">
                                        <div className="em-selection-icon-box em-type-dept-bg">
                                            <span className="material-symbols-outlined">domain_add</span>
                                        </div>
                                        <div>
                                            <h2 className="em-modal-title">{t('dept-change-modal-title')}</h2>
                                            <p className="em-subtitle">{t('dept-change-modal-subtitle')}</p>
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
                                            <input
                                                type="text"
                                                className="em-input-with-icon"
                                                placeholder={t('placeholder-search-employee')}
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setShowSearchResults(true);
                                                    if (selectedEmployee) setSelectedEmployee(null);
                                                }}
                                                onFocus={() => setShowSearchResults(true)}
                                            />
                                            {showSearchResults && searchQuery && (
                                                <div className="em-search-results">
                                                    {employees.length > 0 ? (
                                                        employees.map(emp => (
                                                            <div
                                                                key={emp.id}
                                                                className="em-search-result-item"
                                                                onClick={() => handleEmployeeSelect(emp)}
                                                            >
                                                                <div className="em-result-info">
                                                                    <span className="em-result-name">{emp.full_name}</span>
                                                                    <span className="em-result-id">{emp.employee_id}</span>
                                                                </div>
                                                                <span className="em-result-pos">{emp.department?.name || 'No Dept'}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="em-no-results">No employees found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-current-branch')}</label>
                                            <div className="em-readonly-input">
                                                {selectedEmployee ? selectedEmployee.department?.name : '—'}
                                            </div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-new-branch')}</label>
                                            <div className="em-select-container">
                                                <select
                                                    className="em-select-input"
                                                    value={formData.newDepartmentId}
                                                    onChange={(e) => setFormData({ ...formData, newDepartmentId: e.target.value })}
                                                >
                                                    <option value="" disabled>{t('placeholder-select-location')}</option>
                                                    {departmentOptions.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name}</option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="em-form-group full-width">
                                        <label className="em-label">{t('label-effective-date')}</label>
                                        <input
                                            type="date"
                                            className="em-date-input"
                                            value={formData.effectiveDate}
                                            onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="em-form-group full-width">
                                        <label className="em-label">{t('label-direct-manager')}</label>
                                        <div className="em-select-container">
                                            <span className="material-symbols-outlined em-icon-left">person</span>
                                            <select
                                                className="em-select-input has-icon-left"
                                                value={formData.manager}
                                                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                            >
                                                <option value="" disabled>{t('placeholder-select-manager')}</option>
                                                {managers.map(m => (
                                                    <option key={m.id} value={m.id}>{m.full_name}</option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="em-modal-footer em-form-footer">
                                    <button className="em-back-btn" onClick={() => setModalStep('selection')}>
                                        <span className="material-symbols-outlined">arrow_back</span>
                                        {t('btn-back')}
                                    </button>
                                    <div className="em-footer-actions">
                                        <button className="em-confirm-btn" onClick={handleConfirm}>
                                            <span className="material-symbols-outlined">check</span>
                                            {t('btn-confirm-transfer')}
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
