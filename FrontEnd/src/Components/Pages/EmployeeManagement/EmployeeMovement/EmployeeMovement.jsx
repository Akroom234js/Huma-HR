import React, { useState } from 'react';
import './EmployeeMovement.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import FilterDropdown from '../../Recrutment/FilterDropdown/FilterDropdown';
import { useTranslation } from 'react-i18next';

const movementTypeOptions = [
    { value: '', label: 'Filter by Movement Type' },
    { value: 'Promotion', label: 'Promotion' },
    { value: 'Transfer', label: 'Transfer' },
    { value: 'Department Change', label: 'Department Change' },
    { value: 'Salary Adjustment', label: 'Salary Adjustment' },
];

const movementData = [
    {
        name: 'Olivia Rhye',
        id: 'EMP001',
        date: '2024-07-26',
        type: 'Promotion',
        previousValue: 'Product Designer',
        newValue: 'Senior Product Designer',
        changedBy: 'Admin',
    },
    {
        name: 'Phoenix Baker',
        id: 'EMP002',
        date: '2024-07-20',
        type: 'Transfer',
        previousValue: 'Marketing Team',
        newValue: 'Sales Team',
        changedBy: 'HR Manager',
    },
    {
        name: 'Lana Steiner',
        id: 'EMP003',
        date: '2024-07-15',
        type: 'Salary Adjustment',
        previousValue: '$72,000',
        newValue: '$78,000',
        changedBy: 'Finance Dept',
    },
    {
        name: 'Demi Wilkinson',
        id: 'EMP004',
        date: '2024-07-01',
        type: 'Department Change',
        previousValue: 'Engineering',
        newValue: 'Research & Development',
        changedBy: 'Admin',
    },
    {
        name: 'Candice Wu',
        id: 'EMP005',
        date: '2024-06-25',
        type: 'Promotion',
        previousValue: 'Junior Developer',
        newValue: 'Software Engineer',
        changedBy: 'Admin',
    },
    {
        name: 'Natali Craig',
        id: 'EMP006',
        date: '2024-06-10',
        type: 'Salary Adjustment',
        previousValue: '$90,000',
        newValue: '$95,000',
        changedBy: 'HR Manager',
    },
];

const policyItems = [
    {
        icon: 'verified',
        title: 'Eligibility',
        description:
            'Reviewed annually during performance appraisal cycles based on performance ratings, skill development, and leadership potential.',
    },
    {
        icon: 'assignment_turned_in',
        title: 'Review Process',
        description:
            'Involves a formal review by the employee\'s direct manager, department head, and the HR department.',
    },
    {
        icon: 'card_giftcard',
        title: 'Benefits',
        description:
            'A promotion typically comes with a title change, an increase in salary, and expanded job responsibilities.',
    },
];

const EmployeeMovement = () => {
    const { t } = useTranslation('Sidebar/Sidebar');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredData = movementData.filter((item) => {
        const matchesSearch = item.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType = typeFilter ? item.type === typeFilter : true;
        const matchesStart = startDate ? item.date >= startDate : true;
        const matchesEnd = endDate ? item.date <= endDate : true;
        return matchesSearch && matchesType && matchesStart && matchesEnd;
    });

    return (
        <div className="em-page">
            <header className="em-header">
                <div className="em-header-info">
                    <h1 className="em-title">Company-Wide Movement Log</h1>
                    <p className="em-subtitle">
                        A comprehensive log of all employee movements within the
                        company.
                    </p>
                </div>
                <div className="em-header-actions">
                    <ThemeToggle />
                    <button className="em-btn em-btn-secondary">
                        <span className="material-symbols-outlined">military_tech</span>
                        Promote Employee
                    </button>
                    <button className="em-btn em-btn-primary">
                        <span className="material-symbols-outlined">person_add</span>
                        Add New Movement
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
                            placeholder="Filter by employee name..."
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
                                        Employee Name
                                        <span className="material-symbols-outlined em-sort-icon">
                                            unfold_more
                                        </span>
                                    </div>
                                </th>
                                <th>Employee ID</th>
                                <th>
                                    <div className="em-th-content">
                                        Date of Movement
                                        <span className="material-symbols-outlined em-sort-icon">
                                            unfold_more
                                        </span>
                                    </div>
                                </th>
                                <th>
                                    <div className="em-th-content">
                                        Movement Type
                                        <span className="material-symbols-outlined em-sort-icon">
                                            unfold_more
                                        </span>
                                    </div>
                                </th>
                                <th>Previous Value</th>
                                <th>New Value</th>
                                <th>Changed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td className="em-name-cell">{item.name}</td>
                                    <td>{item.id}</td>
                                    <td>{item.date}</td>
                                    <td>
                                        <span className={`em-badge em-badge-${item.type.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {item.type}
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
                                        No movements found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Policy Section - Redesigned with cards */}
            <div className="em-policy-section">
                <div className="em-policy-header">
                    <span className="material-symbols-outlined em-policy-header-icon">
                        gavel
                    </span>
                    <div>
                        <h2 className="em-policy-title">
                            Promotions: Policy & Process
                        </h2>
                        <p className="em-policy-subtitle">
                            Promotions recognize exceptional performance, increased
                            responsibilities, and readiness for new challenges.
                        </p>
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
                            <h3 className="em-policy-card-title">{item.title}</h3>
                            <p className="em-policy-card-desc">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmployeeMovement;
