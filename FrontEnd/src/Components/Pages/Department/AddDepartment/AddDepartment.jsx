import React, { useState, useEffect } from 'react';
import './AddDepartment.css';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';
import { useNotification } from '../../../Notification/NotificationContext';
import DashboardLoader from '../../../Shared/DashboardLoader/DashboardLoader';

export default function AddDepartment({ onClose, onSuccess }) {
    const { t, i18n } = useTranslation('Department/AddDepartment');
    const isAr = i18n?.language === 'ar';
    const { showSuccess, showError, showWarning } = useNotification();

    const [name, setName] = useState('');
    const [headId, setHeadId] = useState('');
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [employeesList, setEmployeesList] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoadingEmployees(true);
                const res = await apiClient.get('/employees', { params: { per_page: 100 } });
                setEmployeesList(res.data?.data?.employees || []);
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleAddEmployee = (e) => {
        const empId = parseInt(e.target.value);
        if (!empId) return;

        const employee = employeesList.find(emp => emp.id === empId);
        if (employee && !assignedEmployees.find(emp => emp.id === empId)) {
            setAssignedEmployees([...assignedEmployees, employee]);
        }
        e.target.value = '';
    };

    const handleRemoveEmployee = (empId) => {
        setAssignedEmployees(assignedEmployees.filter(emp => emp.id !== empId));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!name.trim()) {
            showWarning(t('toast-enter-name') || "Please enter department name");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name: name.trim(),
                head_id: headId || null,
                employee_ids: assignedEmployees.map(emp => emp.id)
            };
            await apiClient.post('/departments', payload);
            showSuccess(t('toast-create-success') || "Department created successfully.");
            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to create department:', error);
            showError(error, t('toast-create-error') || "Failed to create department");
        } finally {
            setIsSubmitting(false);
        }
    };

    const unassignedEmployees = employeesList.filter(
        emp => !assignedEmployees.find(assigned => assigned.id === emp.id) && emp.id !== parseInt(headId)
    );

    const getInitials = (fullName) => {
        if (!fullName) return '?';
        const parts = fullName.trim().split(' ');
        return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
    };

    return (
        <div 
            className={`adm-overlay ${isAr ? 'rtl' : 'ltr'}`} 
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            role="dialog"
            aria-modal="true"
        >
            <div className="adm-container">
                {/* Modal Header */}
                <div className="adm-header">
                    <div className="adm-header-title">
                        <span className="adm-badge">{t('details')}</span>
                        <h3>{t('add')}</h3>
                    </div>
                    <button 
                        type="button" 
                        className="adm-close-btn" 
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>

                {/* Modal Body */}
                <form className="adm-body" onSubmit={handleSubmit}>
                    {/* Section 1: Department Info */}
                    <div className="adm-section">
                        <h4 className="adm-section-title">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>domain</span>
                            {t('details')}
                        </h4>
                        <div className="adm-form-grid">
                            <div className="adm-form-group">
                                <label>{t('name')} *</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('e.g')}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="adm-form-group">
                                <label>{t('head')}</label>
                                <select 
                                    className="adm-select" 
                                    value={headId} 
                                    onChange={(e) => setHeadId(e.target.value)}
                                >
                                    <option value="">{t('select_head') || 'Select Department Head...'}</option>
                                    {employeesList.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Assign Employees */}
                    <div className="adm-section">
                        <h4 className="adm-section-title">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>group_add</span>
                            {t('assign')}
                        </h4>
                        <div className="adm-form-group full-width">
                            <label>{t('selectemp')}</label>
                            <select 
                                className="adm-select" 
                                onChange={handleAddEmployee} 
                                defaultValue=""
                                disabled={loadingEmployees}
                            >
                                <option value="" disabled>
                                    {loadingEmployees ? '...' : (t('select_employee_to_assign') || 'Select employee to add...')}
                                </option>
                                {unassignedEmployees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Assigned Employee Chips */}
                        <div className="adm-employees-box">
                            {assignedEmployees.length === 0 ? (
                                <p className="adm-empty-employees">
                                    {t('no_employees_assigned') || 'No employees assigned yet.'}
                                </p>
                            ) : (
                                assignedEmployees.map((emp) => (
                                    <div key={emp.id} className="adm-employee-chip">
                                        <div className="adm-chip-info">
                                            <div className="adm-chip-avatar">
                                                {getInitials(emp.full_name)}
                                            </div>
                                            <span className="adm-chip-name">{emp.full_name}</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="adm-chip-remove" 
                                            onClick={() => handleRemoveEmployee(emp.id)}
                                            title="Remove employee"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="adm-footer">
                    <button type="button" className="adm-btn-cancel" onClick={onClose} disabled={isSubmitting}>
                        {t('cancel')}
                    </button>
                    <button 
                        type="button" 
                        className="adm-btn-submit" 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <DashboardLoader size="xs" inline text="" />
                        ) : (
                            t('submit')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}