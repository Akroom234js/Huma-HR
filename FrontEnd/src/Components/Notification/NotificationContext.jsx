import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from './Notification';

const NotificationContext = createContext(null);

/**
 * Sanitizes backend/database error strings to prevent leaking raw SQL/technical details to users.
 */
export const sanitizeErrorMessage = (errorOrMsg, fallback = "حدث خطأ في معالجة الطلب، يرجى المحاولة لاحقاً.") => {
    if (!errorOrMsg) return fallback;

    let rawMsg = "";
    if (typeof errorOrMsg === "string") {
        rawMsg = errorOrMsg;
    } else if (errorOrMsg?.response?.data?.message) {
        rawMsg = errorOrMsg.response.data.message;
    } else if (errorOrMsg?.response?.data?.error) {
        rawMsg = errorOrMsg.response.data.error;
    } else if (errorOrMsg?.message) {
        rawMsg = errorOrMsg.message;
    } else {
        return fallback;
    }

    // Pattern to catch database errors, SQLSTATE codes, stack traces, and 500 crashes
    const technicalPatterns = [
        /sqlstate/i,
        /sql:/i,
        /syntax error/i,
        /data truncated/i,
        /integrity constraint/i,
        /queryexception/i,
        /pdoexception/i,
        /connection refused/i,
        /access denied for user/i,
        /table .* doesn't exist/i,
        /column not found/i,
        /uncaught/i,
        /fatal error/i,
        /call to undefined/i,
        /500 internal server error/i,
        /stack trace/i,
        /database error/i
    ];

    const isTechnical = technicalPatterns.some(pattern => pattern.test(rawMsg));

    return isTechnical ? fallback : rawMsg;
};

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'info', duration = 4500) => {
        if (!message) return;
        setNotification({
            id: Date.now(),
            message,
            type,
            duration
        });
    }, []);

    const showSuccess = useCallback((message, duration = 4000) => {
        showNotification(message, 'success', duration);
    }, [showNotification]);

    const showError = useCallback((errorOrMessage, fallback, duration = 5000) => {
        const cleanMessage = sanitizeErrorMessage(errorOrMessage, fallback);
        showNotification(cleanMessage, 'error', duration);
    }, [showNotification]);

    const showWarning = useCallback((message, duration = 4500) => {
        showNotification(message, 'warning', duration);
    }, [showNotification]);

    const showInfo = useCallback((message, duration = 4500) => {
        showNotification(message, 'info', duration);
    }, [showNotification]);

    const hideNotification = useCallback(() => {
        setNotification(null);
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                showNotification,
                showSuccess,
                showError,
                showWarning,
                showInfo,
                hideNotification
            }}
        >
            {children}
            {notification && (
                <Notification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    duration={notification.duration}
                    onClose={hideNotification}
                />
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        // Fallback safe object if called outside provider
        return {
            showNotification: (msg) => console.log("[Notification]:", msg),
            showSuccess: (msg) => console.log("[Success]:", msg),
            showError: (err) => console.error("[Error]:", err),
            showWarning: (msg) => console.warn("[Warning]:", msg),
            showInfo: (msg) => console.info("[Info]:", msg),
            hideNotification: () => {}
        };
    }
    return context;
};

export default NotificationContext;
