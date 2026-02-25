import React, { useState } from 'react';
import './AddMovement.css';
import { useTranslation } from 'react-i18next';

const mockEmployees = [
    { id: 'EMP001', name: 'Olivia Rhye', position: 'Product Designer', department: 'Design Team', location: 'New York HQ - Sales Dept' },
    { id: 'EMP002', name: 'Phoenix Baker', position: 'Marketing Manager', department: 'Marketing Team', location: 'London Office' },
    { id: 'EMP003', name: 'Lana Steiner', position: 'Software Engineer', department: 'Engineering', location: 'Berlin Branch' },
    { id: 'EMP004', name: 'Demi Wilkinson', position: 'Researcher', department: 'R&D', location: 'San Francisco Tech Center' },
    { id: 'EMP005', name: 'Candice Wu', position: 'Junior Developer', department: 'Engineering', location: 'Dubai Hub' },
    { id: 'EMP006', name: 'Natali Craig', position: 'Hr Coordinator', department: 'HR Team', location: 'Paris HQ' },
];

const AddMovement = ({ onAddMovement }) => {
    const { t } = useTranslation('EmployeeMovement/EmployeeMovement');
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [modalStep, setModalStep] = useState('selection'); // 'selection', 'promotion', or 'transfer'

    // Form and Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        newPosition: '',
        newLocation: '',
        effectiveDate: '',
        manager: ''
    });

    const filteredEmployees = mockEmployees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEmployeeSelect = (emp) => {
        setSelectedEmployee(emp);
        setSearchQuery(emp.name);
        setShowSearchResults(false);
    };

    const handleConfirm = () => {
        if (!selectedEmployee || !formData.effectiveDate) {
            alert('Please fill in all required fields');
            return;
        }

        if (modalStep === 'promotion' && !formData.newPosition) {
            alert('Please select a new position');
            return;
        }

        if (modalStep === 'transfer' && !formData.newLocation) {
            alert('Please select a new location');
            return;
        }

        const newMovement = {
            name: selectedEmployee.name,
            id: selectedEmployee.id,
            date: formData.effectiveDate,
            typeKey: modalStep === 'promotion' ? 'type-promotion' : 'type-transfer',
            previousValue: modalStep === 'promotion' ? selectedEmployee.position : selectedEmployee.location,
            newValue: modalStep === 'promotion' ? formData.newPosition : formData.newLocation,
        };

        onAddMovement(newMovement);
        setShowMovementModal(false);
        resetForm();
    };

    const resetForm = () => {
        setModalStep('selection');
        setSearchQuery('');
        setSelectedEmployee(null);
        setFormData({
            newPosition: '',
            newLocation: '',
            effectiveDate: '',
            manager: ''
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
                                                    {filteredEmployees.length > 0 ? (
                                                        filteredEmployees.map(emp => (
                                                            <div
                                                                key={emp.id}
                                                                className="em-search-result-item"
                                                                onClick={() => handleEmployeeSelect(emp)}
                                                            >
                                                                <div className="em-result-info">
                                                                    <span className="em-result-name">{emp.name}</span>
                                                                    <span className="em-result-id">{emp.id}</span>
                                                                </div>
                                                                <span className="em-result-pos">{emp.position}</span>
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
                                                    <option value="" disabled>{t('placeholder-select-new-role')}</option>
                                                    <option>Senior Product Designer</option>
                                                    <option>Lead Product Designer</option>
                                                    <option>Senior Software Engineer</option>
                                                    <option>Team Lead</option>
                                                </select>
                                                <span className="material-symbols-outlined em-icon-right">expand_more</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="em-form-row">
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-department')}</label>
                                            <div className="em-readonly-input">
                                                {selectedEmployee ? selectedEmployee.department : '—'}
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
                                                <option value="" disabled>{t('placeholder-select-manager')}</option>
                                                <option>Admin</option>
                                                <option>HR Manager</option>
                                                <option>Technical Director</option>
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
                            </div>

                            {/* Step 3: Transfer Form */}
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
                                                    {filteredEmployees.length > 0 ? (
                                                        filteredEmployees.map(emp => (
                                                            <div
                                                                key={emp.id}
                                                                className="em-search-result-item"
                                                                onClick={() => handleEmployeeSelect(emp)}
                                                            >
                                                                <div className="em-result-info">
                                                                    <span className="em-result-name">{emp.name}</span>
                                                                    <span className="em-result-id">{emp.id}</span>
                                                                </div>
                                                                <span className="em-result-pos">{emp.location}</span>
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
                                                {selectedEmployee ? selectedEmployee.location : '—'}
                                            </div>
                                        </div>
                                        <div className="em-form-group">
                                            <label className="em-label">{t('label-new-branch')}</label>
                                            <div className="em-select-container">
                                                <select
                                                    className="em-select-input"
                                                    value={formData.newLocation}
                                                    onChange={(e) => setFormData({ ...formData, newLocation: e.target.value })}
                                                >
                                                    <option value="" disabled>{t('placeholder-select-location')}</option>
                                                    <option>New York HQ - Sales Dept</option>
                                                    <option>London Office</option>
                                                    <option>Berlin Branch</option>
                                                    <option>San Francisco Tech Center</option>
                                                    <option>Dubai Hub</option>
                                                    <option>Paris HQ</option>
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
                                                <option>Admin</option>
                                                <option>HR Manager</option>
                                                <option>Technical Director</option>
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
