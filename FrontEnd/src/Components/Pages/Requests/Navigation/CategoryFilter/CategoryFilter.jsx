import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
    const categories = [
        { id: 'all', label: 'All requests' },
        { id: 'vacation', label: 'Vacation' },
        { id: 'advance', label: 'Advance' },
        { id: 'compensation', label: 'Compensation' },
        { id: 'data-update', label: 'Data Update' },
        { id: 'resignation', label: 'Resignation' },
        { id: 'transfer', label: 'Transfer' },
        { id: 'promotion', label: 'Promotion' },
        { id: 'equipment', label: 'Equipment' },
        { id: 'experience-certificate', label: 'Exp. Certificate' }
    ];

    return (
        <div className="req-category-filter">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    className={`req-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => onCategoryChange(cat.id)}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;
