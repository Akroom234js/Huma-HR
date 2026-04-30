import React, { useState, useEffect } from 'react';
import './SalaryStructure.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';

const SalaryStructure = () => {
    const { t } = useTranslation('SalaryManagement/SalaryStructure');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [salaryData, setSalaryData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('structures'); // 'structures' or 'employees'

    const [selectedStructureId, setSelectedStructureId] = useState("");
    const [editData, setEditData] = useState({ min_salary: "", max_salary: "", tax_percent: "", insurance_amount: "", allowances: "" });

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [empEditData, setEmpEditData] = useState({ salary: "", tax_percent: "", insurance_amount: "", allowances: "" });

    const handleSelectStructure = (e) => {
        const id = e.target.value;
        setSelectedStructureId(id);
        const position = salaryData.find(s => s.id == id);
        if (position) {
            setEditData({ 
                min_salary: position.min_salary, 
                max_salary: position.max_salary,
                tax_percent: position.tax_percent || 0,
                insurance_amount: position.insurance_amount || 0,
                allowances: position.allowances || 0
            });
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedStructureId) return;
        try {
            await apiClient.put(`/salary-structures/${selectedStructureId}`, editData);
            setIsEditModalOpen(false);
            // Refresh both because position changes affect employees
            fetchSalaryStructures();
            fetchEmployees();
        } catch (error) {
            console.error('Error updating salary structure:', error);
        }
    };

    const handleOpenEmpEdit = (emp) => {
        setSelectedEmployee(emp);
        setEmpEditData({
            salary: emp.salary,
            tax_percent: emp.tax_percent || 0,
            insurance_amount: emp.insurance_amount || 0,
            allowances: emp.allowances || 0
        });
        setIsEmpModalOpen(true);
    };

    const handleSaveEmpChanges = async () => {
        if (!selectedEmployee) return;
        try {
            await apiClient.patch(`/salary-structures/employees/${selectedEmployee.id}`, empEditData);
            setIsEmpModalOpen(false);
            fetchEmployees();
        } catch (error) {
            console.error('Error updating employee salary:', error);
            alert(error.response?.data?.message || "Update failed");
        }
    };

    useEffect(() => {
        fetchSalaryStructures();
        fetchEmployees();
    }, []);

    const fetchSalaryStructures = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/salary-structures');
            setSalaryData(response.data.data || []);
        } catch (error) {
            console.error('Error fetching salary structures:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await apiClient.get('/salary-structures/employees');
            setEmployees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const filteredData = salaryData.filter(item => 
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredEmployees = employees.filter(emp => 
        (emp.full_name && emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.job_title && emp.job_title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="sm-page">
            <div className="sm-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            <header className="sm-header">
                <div>
                    <h1 className="sm-title">{t('title')}</h1>
                    <p className="sm-subtitle">{t('subtitle')}</p>
                </div>
                <div className="sm-header-actions">
                    <button 
                        onClick={() => setActiveTab(activeTab === 'structures' ? 'employees' : 'structures')} 
                        className="sm-btn-secondary"
                    >
                        <span className="material-symbols-outlined">{activeTab === 'structures' ? 'group' : 'account_balance_wallet'}</span>
                        <span>{activeTab === 'structures' ? t('viewEmployees', 'Employee Salaries') : t('viewStructures', 'Salary Structures')}</span>
                    </button>
                    <button onClick={() => setIsEditModalOpen(true)} className="sm-btn-primary">
                        <span className="material-symbols-outlined">edit</span>
                        <span>{t('editStructure')}</span>
                    </button>
                </div>
            </header>

            {activeTab === 'structures' ? (
                <div className="sm-content-card">
                    <div className="sm-card-header">
                        <h3 className="sm-card-title">{t('scalesTitle')}</h3>
                        <div className="sm-search-wrapper">
                            <span className="material-symbols-outlined sm-search-icon">search</span>
                            <input 
                                type="text" 
                                className="sm-input sm-search-input" 
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="sm-table-wrapper">
                        <table className="sm-table">
                            <thead>
                                <tr>
                                    <th>{t('table.positionTitle', 'POSITION TITLE')}</th>
                                    <th className="text-right">{t('table.minSalary')}</th>
                                    <th className="text-right">{t('table.maxSalary')}</th>
                                    <th className="text-center">{t('table.allowances', 'Allowances')}</th>
                                    <th className="text-center">{t('table.tax', 'Tax %')}</th>
                                    <th className="text-center">{t('table.insurance', 'Insurance')}</th>
                                    <th className="text-center">{t('table.range')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">{t('table.loading', 'Loading...')}</td>
                                    </tr>
                                ) : filteredData.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="font-medium">{row.title}</td>
                                        <td className="text-right">${Number(row.min_salary).toLocaleString()}</td>
                                        <td className="text-right">${Number(row.max_salary).toLocaleString()}</td>
                                        <td className="text-center">${Number(row.allowances).toLocaleString()}</td>
                                        <td className="text-center">{row.tax_percent}%</td>
                                        <td className="text-center">${Number(row.insurance_amount).toLocaleString()}</td>
                                        <td className="text-center">${Number(row.min_salary).toLocaleString()} - ${Number(row.max_salary).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="sm-content-card">
                    <div className="sm-card-header">
                        <h3 className="sm-card-title">{t('employeeSalaries', 'Individual Employee Salaries')}</h3>
                        <div className="sm-search-wrapper">
                            <span className="material-symbols-outlined sm-search-icon">search</span>
                            <input 
                                type="text" 
                                className="sm-input sm-search-input" 
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="sm-table-wrapper">
                        <table className="sm-table">
                            <thead>
                                <tr>
                                    <th>{t('table.employee', 'EMPLOYEE')}</th>
                                    <th>{t('table.position', 'POSITION')}</th>
                                    <th className="text-right">{t('table.salary', 'SALARY')}</th>
                                    <th className="text-center">{t('table.allowances', 'ALLOWANCES')}</th>
                                    <th className="text-center">{t('table.tax', 'TAX %')}</th>
                                    <th className="text-center">{t('table.insurance', 'INSURANCE')}</th>
                                    <th className="text-center">{t('table.actions', 'ACTIONS')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img 
                                                    src={emp.profile_pic ? `/storage/${emp.profile_pic}` : 'https://i.pravatar.cc/150'} 
                                                    alt="" 
                                                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                                                />
                                                <span>{emp.full_name}</span>
                                            </div>
                                        </td>
                                        <td>{emp.job_title}</td>
                                        <td className="text-right" style={{ fontWeight: '600' }}>${Number(emp.salary).toLocaleString()}</td>
                                        <td className="text-center">${Number(emp.allowances).toLocaleString()}</td>
                                        <td className="text-center">{emp.tax_percent}%</td>
                                        <td className="text-center">${Number(emp.insurance_amount).toLocaleString()}</td>
                                        <td className="text-center">
                                            <button onClick={() => handleOpenEmpEdit(emp)} className="btn-edit-salary">
                                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Structure Edit Modal */}
            {isEditModalOpen && (
                <div className="sm-modal-overlay">
                    <div className="sm-modal">
                        <div className="sm-modal-header">
                            <div>
                                <h2 className="sm-modal-title">{t('modal.title')}</h2>
                                <p className="sm-modal-subtitle">{t('modal.subtitle')}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="sm-modal-close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="sm-modal-body">
                            <div className="sm-form-group">
                                <label className="sm-label">{t('modal.jobLevelLabel', 'Select Position')}</label>
                                <select className="sm-input" value={selectedStructureId} onChange={handleSelectStructure}>
                                    <option value="">{t('modal.selectJobLevel', 'Select a Position')}</option>
                                    {salaryData.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm-form-row">
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('modal.minSalaryLabel')}</label>
                                    <div className="sm-input-with-icon">
                                        <span className="sm-input-icon">$</span>
                                        <input type="number" className="sm-input" value={editData.min_salary} onChange={e => setEditData({...editData, min_salary: e.target.value})} />
                                    </div>
                                </div>
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('modal.maxSalaryLabel')}</label>
                                    <div className="sm-input-with-icon">
                                        <span className="sm-input-icon">$</span>
                                        <input type="number" className="sm-input" value={editData.max_salary} onChange={e => setEditData({...editData, max_salary: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div className="sm-form-row" style={{ marginTop: '15px', borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('modal.allowancesLabel', 'Default Allowances ($)')}</label>
                                    <input type="number" className="sm-input" value={editData.allowances} onChange={e => setEditData({...editData, allowances: e.target.value})} />
                                </div>
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('modal.taxLabel', 'Default Tax (%)')}</label>
                                    <input type="number" className="sm-input" value={editData.tax_percent} onChange={e => setEditData({...editData, tax_percent: e.target.value})} />
                                </div>
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('modal.insuranceLabel', 'Default Insurance ($)')}</label>
                                    <input type="number" className="sm-input" value={editData.insurance_amount} onChange={e => setEditData({...editData, insurance_amount: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="sm-modal-footer">
                            <button onClick={() => setIsEditModalOpen(false)} className="sm-btn-secondary">{t('modal.cancel')}</button>
                            <button onClick={handleSaveChanges} className="sm-btn-primary" disabled={!selectedStructureId}>
                                <span className="material-symbols-outlined">save</span>
                                {t('modal.saveChanges')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Salary Edit Modal */}
            {isEmpModalOpen && selectedEmployee && (
                <div className="sm-modal-overlay">
                    <div className="sm-modal">
                        <div className="sm-modal-header">
                            <div>
                                <h2 className="sm-modal-title">{t('empModal.title', 'Adjust Salary Settings')}</h2>
                                <p className="sm-modal-subtitle">{selectedEmployee.full_name} - {selectedEmployee.job_title}</p>
                            </div>
                            <button onClick={() => setIsEmpModalOpen(false)} className="sm-modal-close">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="sm-modal-body">
                            <div className="sm-form-group">
                                <label className="sm-label">{t('empModal.salaryLabel', 'Current Salary')}</label>
                                <div className="sm-input-with-icon">
                                    <span className="sm-input-icon">$</span>
                                    <input type="number" className="sm-input" value={empEditData.salary} onChange={e => setEmpEditData({...empEditData, salary: e.target.value})} />
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Range: ${Number(salaryData.find(s => s.title === selectedEmployee.job_title)?.min_salary || 0).toLocaleString()} - 
                                    ${Number(salaryData.find(s => s.title === selectedEmployee.job_title)?.max_salary || 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="sm-form-row">
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('empModal.allowancesLabel', 'Personal Allowances ($)')}</label>
                                    <input type="number" className="sm-input" value={empEditData.allowances} onChange={e => setEmpEditData({...empEditData, allowances: e.target.value})} />
                                </div>
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('empModal.taxLabel', 'Personal Tax (%)')}</label>
                                    <input type="number" className="sm-input" value={empEditData.tax_percent} onChange={e => setEmpEditData({...empEditData, tax_percent: e.target.value})} />
                                </div>
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('empModal.insuranceLabel', 'Personal Insurance ($)')}</label>
                                    <input type="number" className="sm-input" value={empEditData.insurance_amount} onChange={e => setEmpEditData({...empEditData, insurance_amount: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="sm-modal-footer">
                            <button onClick={() => setIsEmpModalOpen(false)} className="sm-btn-secondary">{t('modal.cancel')}</button>
                            <button onClick={handleSaveEmpChanges} className="sm-btn-primary">
                                <span className="material-symbols-outlined">save</span>
                                {t('modal.saveChanges')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryStructure;
