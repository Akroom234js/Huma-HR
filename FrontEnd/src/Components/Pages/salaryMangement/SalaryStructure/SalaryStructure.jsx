import React, { useState, useEffect } from 'react';
import './SalaryStructure.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../apiConfig';

const SalaryStructure = () => {
    const { t } = useTranslation('SalaryManagement/SalaryStructure');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [salaryData, setSalaryData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedStructureId, setSelectedStructureId] = useState("");
    const [editData, setEditData] = useState({ min_salary: "", max_salary: "" });

    const handleSelectStructure = (e) => {
        const id = e.target.value;
        setSelectedStructureId(id);
        const structure = salaryData.find(s => s.id == id);
        if (structure) {
            setEditData({ min_salary: structure.min_salary, max_salary: structure.max_salary });
        } else {
            setEditData({ min_salary: "", max_salary: "" });
        }
    };

    const handleSaveChanges = async () => {
        if (!selectedStructureId) return;
        try {
            await apiClient.put(`/salary-structures/${selectedStructureId}`, editData);
            setIsEditModalOpen(false);
            fetchSalaryStructures();
        } catch (error) {
            console.error('Error updating salary structure:', error);
        }
    };

    useEffect(() => {
        fetchSalaryStructures();
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

    const filteredData = salaryData.filter(item => 
        (item.job_title && item.job_title.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (item.job_level && item.job_level.toLowerCase().includes(searchTerm.toLowerCase()))
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
                <button onClick={() => setIsEditModalOpen(true)} className="sm-btn-primary">
                    <span className="material-symbols-outlined">edit</span>
                    <span>{t('editStructure')}</span>
                </button>
            </header>

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
                                <th>{t('table.jobLevel')}</th>
                                <th>{t('table.positionTitle')}</th>
                                <th className="text-right">{t('table.minSalary')}</th>
                                <th className="text-right">{t('table.maxSalary')}</th>
                                <th className="text-center">{t('table.range')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">{t('table.loading', 'Loading...')}</td>
                                </tr>
                            ) : filteredData.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="font-medium">{row.job_level}</td>
                                    <td>{row.job_title}</td>
                                    <td className="text-right">${row.min_salary}</td>
                                    <td className="text-right">${row.max_salary}</td>
                                    <td className="text-center">${row.min_salary} - ${row.max_salary}</td>
                                </tr>
                            ))}
                            {!loading && filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="sm-no-data">{t('table.noResults')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
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
                                <label className="sm-label">{t('modal.jobLevelLabel')}</label>
                                <select className="sm-input" value={selectedStructureId} onChange={handleSelectStructure}>
                                    <option value="">{t('modal.selectJobLevel')}</option>
                                    {salaryData.map(s => (
                                        <option key={s.id} value={s.id}>{s.job_level} - {s.job_title}</option>
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
        </div>
    );
};

export default SalaryStructure;
