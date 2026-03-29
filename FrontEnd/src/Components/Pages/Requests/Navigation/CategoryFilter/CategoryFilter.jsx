import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ activeCategory, onCategoryChange }) => {
    const categories = [
        { id: 'all', label: 'All requests' },
        { id: 'vacation', label: 'Vacation requests' },
        { id: 'advance', label: 'Advance requests' },
        { id: 'compensation', label: 'Compensation requests' },
        { id: 'data-update', label: 'Data update requests' }
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
