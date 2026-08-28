import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'info', onClose, duration = 4500 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error_outline';
            case 'warning': return 'warning_amber';
            default: return 'notifications_active';
        }
    };

    return (
        <div className={`notification-toast ${type}`} role="alert">
            <div className="notification-content">
                <div className="notification-icon-wrapper">
                    <span className="material-icons notification-icon">{getIcon()}</span>
                </div>
                <p className="notification-message">{message}</p>
            </div>
            <button className="notification-close" onClick={onClose} aria-label="Close notification">
                <span className="material-icons">close</span>
            </button>
            <div 
                className="notification-progress" 
                style={{ animationDuration: `${duration}ms` }}
            ></div>
        </div>
    );
};

export default Notification;
