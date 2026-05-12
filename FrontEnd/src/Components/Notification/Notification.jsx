import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    return (
        <div className={`notification-toast ${type}`}>
            <div className="notification-content">
                <span className="material-icons notification-icon">{getIcon()}</span>
                <p className="notification-message">{message}</p>
            </div>
            <button className="notification-close" onClick={onClose}>
                <span className="material-icons">close</span>
            </button>
            <div className="notification-progress"></div>
        </div>
    );
};

export default Notification;
