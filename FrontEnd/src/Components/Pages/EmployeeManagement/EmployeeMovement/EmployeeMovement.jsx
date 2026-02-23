import React, { useState } from 'react';
import './EmployeeMovement.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../Recrutment/FilterDropdown/FilterDropdown';
import { useTranslation } from 'react-i18next';

const movementData = [
    {
        name: 'Olivia Rhye',
        id: 'EMP001',
        date: '2024-07-26',
        typeKey: 'type-promotion',
        previousValue: 'Product Designer',
        newValue: 'Senior Product Designer',
        changedBy: 'Admin',
    },
    {
        name: 'Phoenix Baker',
        id: 'EMP002',
        date: '2024-07-20',
        typeKey: 'type-transfer',
        previousValue: 'Marketing Team',
        newValue: 'Sales Team',
        changedBy: 'HR Manager',
    },
    {
        name: 'Lana Steiner',
        id: 'EMP003',
        date: '2024-07-15',
        typeKey: 'type-salary-adjustment',
        previousValue: '$72,000',
        newValue: '$78,000',
        changedBy: 'Finance Dept',
    },
    {
        name: 'Demi Wilkinson',
        id: 'EMP004',
        date: '2024-07-01',
        typeKey: 'type-department-change',
        previousValue: 'Engineering',
        newValue: 'Research & Development',
        changedBy: 'Admin',
    },
    {
        name: 'Candice Wu',
        id: 'EMP005',
        date: '2024-06-25',
        typeKey: 'type-promotion',
        previousValue: 'Junior Developer',
        newValue: 'Software Engineer',
        changedBy: 'Admin',
    },
    {
        name: 'Natali Craig',
        id: 'EMP006',
        date: '2024-06-10',
        typeKey: 'type-salary-adjustment',
        previousValue: '$90,000',
        newValue: '$95,000',
        changedBy: 'HR Manager',
    },
];

const policyItems = [
    {
        icon: 'verified',
        titleKey: 'policy-eligibility-title',
        descKey: 'policy-eligibility-desc',
    },
    {
        icon: 'assignment_turned_in',
        titleKey: 'policy-review-title',
        descKey: 'policy-review-desc',
    },
    {
        icon: 'card_giftcard',
        titleKey: 'policy-benefits-title',
        descKey: 'policy-benefits-desc',
    },
];

const EmployeeMovement = () => {
    const { t } = useTranslation('EmployeeMovement/EmployeeMovement');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showTransferModal, setShowTransferModal] = useState(false);

    const movementTypeOptions = [
        { value: '', label: t('filter-movement-type') },
        { value: 'type-promotion', label: t('filter-promotion') },
        { value: 'type-transfer', label: t('filter-transfer') },
        { value: 'type-department-change', label: t('filter-department-change') },
        { value: 'type-salary-adjustment', label: t('filter-salary-adjustment') },
    ];

    const filteredData = movementData.filter((item) => {
        const matchesSearch = item.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType = typeFilter ? item.typeKey === typeFilter : true;
        const matchesStart = startDate ? item.date >= startDate : true;
        const matchesEnd = endDate ? item.date <= endDate : true;
        return matchesSearch && matchesType && matchesStart && matchesEnd;
    });

    return (
        <div className="em-page">
            <div className="em-theme-toggle-wrapper">
                <ThemeToggle />
            </div>
            <header className="em-header">
                <div className="em-header-info">
                    <h1 className="em-title">{t('page-title')}</h1>
                    <p className="em-subtitle">{t('page-subtitle')}</p>
                </div>
                <div className="em-header-actions">
                    <button className="em-btn em-btn-primary" onClick={() => setShowTransferModal(true)}>
                        <span className="material-symbols-outlined">person_add</span>
                        {t('btn-add-movement')}
                    </button>
                </div>

            </header>

            {/* Filters & Table Card */}
            <div className="em-table-card">
                {/* Filters */}
                <div className="em-filters">
                    <div className="em-filter-item em-search-wrapper">
                        <span className="material-symbols-outlined em-search-icon">
                            search
                        </span>
                        <input
                            type="text"
                            className="em-input em-search-input"
                            placeholder={t('filter-search-placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="em-filter-item">
                        <FilterDropdown
                            value={typeFilter}
                            onChange={setTypeFilter}
                            options={movementTypeOptions}
                        />
                    </div>
                    <div className="em-filter-item">
                        <input
                            type="date"
                            className="em-input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="em-filter-item">
                        <input
                            type="date"
                            className="em-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="em-table-wrapper">
                    <table className="em-table">
                        <thead>
                            <tr>
                                <th>
                                    <div className="em-th-content">
                                        {t('th-employee-name')}
                                        <span className="material-symbols-outlined em-sort-icon">
                                            unfold_more
                                        </span>
                                    </div>
                                </th>
                                <th>{t('th-employee-id')}</th>
                                <th>
                                    <div className="em-th-content">
                                        {t('th-date')}
                                        <span className="material-symbols-outlined em-sort-icon">
                                            unfold_more
                                        </span>
                                    </div>
                                </th>
                                <th>
                                    <div className="em-th-content">
                                        {t('th-movement-type')}
                                        <span className="material-symbols-outlined em-sort-icon">
                                            unfold_more
                                        </span>
                                    </div>
                                </th>
                                <th>{t('th-previous-value')}</th>
                                <th>{t('th-new-value')}</th>
                                <th>{t('th-changed-by')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td className="em-name-cell">{item.name}</td>
                                    <td>{item.id}</td>
                                    <td>{item.date}</td>
                                    <td>
                                        <span className={`em-badge em-badge-${item.typeKey.replace('type-', '')}`}>
                                            {t(item.typeKey)}
                                        </span>
                                    </td>
                                    <td>{item.previousValue}</td>
                                    <td>{item.newValue}</td>
                                    <td>{item.changedBy}</td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="em-no-data">
                                        {t('no-data')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Policy Section */}
            <div className="em-policy-section">
                <div className="em-policy-header">
                    <span className="material-symbols-outlined em-policy-header-icon">
                        gavel
                    </span>
                    <div>
                        <h2 className="em-policy-title">{t('policy-title')}</h2>
                        <p className="em-policy-subtitle">{t('policy-subtitle')}</p>
                    </div>
                </div>
                <div className="em-policy-cards">
                    {policyItems.map((item, index) => (
                        <div className="em-policy-card" key={index}>
                            <div className="em-policy-card-icon-wrap">
                                <span className="material-symbols-outlined">
                                    {item.icon}
                                </span>
                            </div>
                            <h3 className="em-policy-card-title">{t(item.titleKey)}</h3>
                            <p className="em-policy-card-desc">{t(item.descKey)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add New Transfer Modal */}
            {showTransferModal && (
                <div className="em-modal-overlay" onClick={() => setShowTransferModal(false)}>
                    <div className="em-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="em-modal-header">
                            <h2 className="em-modal-title">{t('modal-title')}</h2>
                            <button className="em-modal-close" onClick={() => setShowTransferModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form className="em-modal-body">
                            <div className="em-modal-field">
                                <label className="em-modal-label" htmlFor="select-employee">{t('modal-select-employee')}</label>
                                <div className="em-search-wrapper">
                                    <span className="material-symbols-outlined em-search-icon">search</span>
                                    <input
                                        type="text"
                                        className="em-input em-search-input"
                                        id="select-employee"
                                        placeholder={t('modal-search-placeholder')}
                                    />
                                </div>
                            </div>
                            <div className="em-modal-field">
                                <label className="em-modal-label">{t('modal-current-dept')}</label>
                                <p className="em-modal-readonly">{t('modal-current-dept-placeholder')}</p>
                            </div>
                            <div className="em-modal-field">
                                <label className="em-modal-label" htmlFor="new-department">{t('modal-new-dept')}</label>
                                <div className="em-select-wrapper">
                                    <select className="em-input em-select" id="new-department">
                                        <option disabled selected>{t('modal-new-dept-placeholder')}</option>
                                        <option>Product</option>
                                        <option>Engineering</option>
                                        <option>Marketing</option>
                                        <option>Sales</option>
                                        <option>Human Resources</option>
                                    </select>
                                    <span className="material-symbols-outlined em-select-icon">expand_more</span>
                                </div>
                            </div>
                            <div className="em-modal-field">
                                <label className="em-modal-label" htmlFor="effective-date">{t('modal-date-of-transfer')}</label>
                                <input
                                    type="date"
                                    className="em-input"
                                    id="effective-date"
                                />
                            </div>
                        </form>
                        <div className="em-modal-footer">
                            <button type="button" className="em-btn em-btn-cancel" onClick={() => setShowTransferModal(false)}>
                                {t('modal-cancel')}
                            </button>
                            <button type="submit" className="em-btn em-btn-primary">
                                {t('modal-submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeMovement;
