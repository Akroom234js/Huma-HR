import React from 'react';
import './FilterDropdown.css';

const FilterDropdown = ({ value, onChange, options }) => {
    return (
        <div className="filter-dropdown-container">
            <div className="filter-dropdown-wrapper">
                <span className="filter-icon material-symbols-outlined">filter_alt</span>
                <select
                    className="filter-dropdown"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FilterDropdown;
