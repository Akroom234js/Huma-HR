import React from 'react';
import './FilterBar.css';

const FilterBar = () => {
    return (
        <div className="filter-bar">
            <div className="filter-item">
                <label>Date:</label>
                <input type="date" className="filter-input" />
            </div>
            <div className="filter-item">
                <label>Department:</label>
                <select className="filter-select">
                    <option>All</option>
                    <option>Human Resources</option>
                    <option>Development</option>
                </select>
            </div>
        </div>
    );
};

export default FilterBar;
