import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', size = 'md', icon, disabled = false }) => {
    return (
        <button
            type={type}
            className={`req-btn req-btn-${variant} req-btn-${size}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <span className="material-symbols-outlined btn-icon">{icon}</span>}
            {children}
        </button>
    );
};

export default Button;
