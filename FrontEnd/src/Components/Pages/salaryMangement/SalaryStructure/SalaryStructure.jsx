import React, { useState } from 'react';
import './SalaryStructure.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';

const SalaryStructure = () => {
    const { t } = useTranslation('SalaryManagement/SalaryStructure');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const salaryData = [
        { lvl: "Junior", pos: "Software Engineer I", min: "3000", max: "4500" },
        { lvl: "Mid-Level", pos: "Software Engineer II", min: "4500", max: "6500" },
        { lvl: "Senior", pos: "Senior Software Engineer", min: "6500", max: "9000" },
        { lvl: "Lead", pos: "Lead Software Engineer", min: "8500", max: "12000" },
        { lvl: "Principal", pos: "Principal Engineer", min: "11000", max: "15000" },
    ];

    const filteredData = salaryData.filter(item => 
        item.pos.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.lvl.toLowerCase().includes(searchTerm.toLowerCase())
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
                            {filteredData.map((row, idx) => (
                                <tr key={idx}>
                                    <td className="font-medium">{row.lvl}</td>
                                    <td>{row.pos}</td>
                                    <td className="text-right">${row.min}</td>
                                    <td className="text-right">${row.max}</td>
                                    <td className="text-center">${row.min} - ${row.max}</td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
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
                                <select className="sm-input">
                                    <option>{t('modal.selectJobLevel')}</option>
                                    <option>Junior</option>
                                    <option selected>Mid-Level</option>
                                    <option>Senior</option>
                                    <option>Lead</option>
                                    <option>Principal</option>
                                </select>
                            </div>
                            <div className="sm-form-row">
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('modal.minSalaryLabel')}</label>
                                    <div className="sm-input-with-icon">
                                        <span className="sm-input-icon">$</span>
                                        <input type="number" className="sm-input" defaultValue="4500" />
                                    </div>
                                </div>
                                <div className="sm-form-group">
                                    <label className="sm-label">{t('modal.maxSalaryLabel')}</label>
                                    <div className="sm-input-with-icon">
                                        <span className="sm-input-icon">$</span>
                                        <input type="number" className="sm-input" defaultValue="6500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="sm-modal-footer">
                            <button onClick={() => setIsEditModalOpen(false)} className="sm-btn-secondary">{t('modal.cancel')}</button>
                            <button onClick={() => setIsEditModalOpen(false)} className="sm-btn-primary">
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
