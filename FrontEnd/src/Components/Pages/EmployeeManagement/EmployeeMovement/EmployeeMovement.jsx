import React, { useState } from 'react';
import './EmployeeMovement.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../../FilterDropdown/FilterDropdown';
import { useTranslation } from 'react-i18next';
import AddMovement from './Add New Movement/AddMovement';
import apiClient from '../../../../apiConfig';

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
    const { t, i18n } = useTranslation('EmployeeMovement/EmployeeMovement');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // State for movements list
    const [movements, setMovements] = useState([]);

    const fetchMovements = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (typeFilter) params.type = typeFilter.replace('type-', '');
            if (startDate) params.date_from = startDate;
            if (endDate) params.date_to = endDate;

            const res = await apiClient.get('/employee-movements', { params });
            const data = res.data?.data?.movements || [];

            // Map backend data to frontend structure
            const mappedMovements = data.map(m => ({
                name: m.employee?.full_name || '—',
                id: m.employee?.employee_id || '—',
                date: m.movement_date,
                typeKey: `type-${m.movement_type}`,
                previousValue: m.previous_value,
                newValue: m.new_value,
                changedBy: m.created_by?.email || 'System',
            }));

            setMovements(mappedMovements);
        } catch (error) {
            console.error("Failed to fetch movements", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, typeFilter, startDate, endDate]);

    React.useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    const movementTypeOptions = [
        { value: '', label: t('filter-movement-type') },
        { value: 'type-promotion', label: t('filter-promotion') },
        { value: 'type-transfer', label: t('filter-transfer') },
        { value: 'type-department-change', label: t('filter-department-change') },
        { value: 'type-salary-adjustment', label: t('filter-salary-adjustment') },
    ];

    const handleAddMovement = () => {
        fetchMovements(); // Refresh list after adding
    };

    const filteredData = movements; // Filtering is now handled by the backend

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
                    <AddMovement onAddMovement={handleAddMovement} />
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

        </div>
    );
};

export default EmployeeMovement;
