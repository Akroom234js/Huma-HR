import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from './Notification';

const NotificationContext = createContext(null);

const NOTIFICATION_EN_TO_AR = {
    // Salary Management
    "Salary structure updated successfully.": "تم تحديث هيكل الرواتب بنجاح.",
    "Employee salary updated successfully.": "تم تحديث راتب الموظف بنجاح.",
    "Failed to update salary structure.": "فشل تحديث هيكل الرواتب.",
    "Update failed.": "فشل التحديث، يرجى المحاولة لاحقاً.",
    "Payroll initialized successfully.": "تم بدء تهيئة مسير الرواتب بنجاح.",
    "Failed to initialize payroll.": "فشل بدء تهيئة مسير الرواتب.",
    "Bonus rules applied successfully.": "تم تطبيق قواعد المكافآت بنجاح.",
    "Bonus rule saved successfully.": "تم حفظ قاعدة المكافأة بنجاح.",
    "Failed to save bonus rule.": "فشل حفظ قاعدة المكافأة.",
    "Addition recorded successfully.": "تم تسجيل الإضافة بنجاح.",
    "Addition recorded successfully!": "تم تسجيل الإضافة بنجاح.",
    "Deduction recorded successfully.": "تم تسجيل الخصم بنجاح.",
    "Deduction recorded successfully!": "تم تسجيل الخصم بنجاح.",
    "Failed to record deduction.": "فشل تسجيل الخصم.",
    "Failed to save adjustment. Make sure the employee has a payroll record for this month.": "فشل حفظ التعديل، تأكد من وجود سجل راتب للموظف في هذا الشهر.",
    "Application failed.": "فشلت عملية التطبيق.",

    // Form validation & common alerts
    "Please fill in all required fields.": "يرجى ملء جميع الحقول المطلوبة.",
    "Please fill in all required fields": "يرجى ملء جميع الحقول المطلوبة.",
    
    // Requests
    "Request approved successfully.": "تمت الموافقة على الطلب بنجاح.",
    "Request rejected successfully.": "تم رفض الطلب بنجاح.",
    "Failed to update status.": "فشل تحديث حالة الطلب.",

    // Attendance & Geofencing
    "Location deactivated": "تم تعطيل موقع الفرع.",
    "Location activated": "تم تفعيل موقع الفرع بنجاح.",
    "Location deleted successfully": "تم حذف موقع الفرع بنجاح.",
    "Work hours saved successfully": "تم حفظ إعدادات ساعات العمل بنجاح.",
    "Failed to update location status": "فشل تحديث حالة الموقع الجغرافي.",
    "Failed to delete location": "فشل حذف الموقع الجغرافي.",
    "Location added successfully": "تم إضافة موقع الفرع بنجاح.",

    // Employee Management
    "Employee deleted successfully": "تم حذف الموظف بنجاح.",
    "Employee deleted successfully.": "تم حذف الموظف بنجاح.",
    "Employee account created successfully.": "تم إنشاء حساب الموظف بنجاح.",
    "Employee created successfully": "تم إنشاء حساب الموظف بنجاح.",
    "Employee updated successfully": "تم تحديث بيانات الموظف بنجاح.",
    "Employee details updated successfully.": "تم تحديث بيانات الموظف بنجاح.",
    "Movement recorded successfully!": "تم تسجيل حركة الموظف بنجاح.",
    "Movement recorded successfully.": "تم تسجيل حركة الموظف بنجاح.",
    "Failed to record movement": "فشل تسجيل حركة الموظف.",
    "Failed to record movement, please try again.": "فشل تسجيل حركة الموظف.",
    "Error deleting employee": "فشل حذف الموظف.",
    "Error loading employee data": "فشل تحميل بيانات الموظف.",
    "Failed to load employee details": "فشل تحميل بيانات الموظف.",
    "Error saving employee.": "فشل حفظ بيانات الموظف.",
    "Failed to save employee": "فشل حفظ بيانات الموظف.",

    // Leaves Management
    "Leave type updated successfully.": "تم تحديث نوع الإجازة بنجاح.",
    "Leave type created successfully.": "تم إنشاء نوع الإجازة بنجاح.",
    "Leave type deleted successfully.": "تم حذف نوع الإجازة بنجاح.",
    "Employee balance updated successfully.": "تم تحديث رصيد إجازات الموظف بنجاح.",
    "Failed to save leave type.": "فشل حفظ نوع الإجازة.",
    "Failed to delete leave type.": "فشل حذف نوع الإجازة.",
    "Failed to adjust employee balance.": "فشل تعديل رصيد الموظف.",

    // Backend Auth & System errors
    "Unauthenticated.": "انتهت الجلسة، يرجى تسجيل الدخول مجدداً.",
    "Unauthorized": "غير مصرح لك بالقيام بهذا الإجراء.",
    "Server Error": "حدث خطأ في الخادم.",
    "The given data was invalid.": "البيانات المدخلة غير صحيحة، يرجى مراجعة الحقول.",
};

const NOTIFICATION_AR_TO_EN = Object.entries(NOTIFICATION_EN_TO_AR).reduce((acc, [en, ar]) => {
    acc[ar] = en;
    return acc;
}, {});

/**
 * Translates message dynamically based on the current active language.
 */
export const translateMessage = (msg, currentLang = 'ar') => {
    if (!msg || typeof msg !== 'string') return msg;
    const trimmed = msg.trim();
    if (currentLang === 'ar') {
        return NOTIFICATION_EN_TO_AR[trimmed] || trimmed;
    } else {
        return NOTIFICATION_AR_TO_EN[trimmed] || trimmed;
    }
};

/**
 * Sanitizes backend/database error strings to prevent leaking raw SQL/technical details to users.
 */
export const sanitizeErrorMessage = (errorOrMsg, fallback, currentLang = 'ar') => {
    const defaultFallback = currentLang === 'ar'
        ? "حدث خطأ في معالجة الطلب، يرجى المحاولة لاحقاً."
        : "An error occurred while processing the request. Please try again later.";

    const finalFallback = fallback || defaultFallback;
    if (!errorOrMsg) return translateMessage(finalFallback, currentLang);

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
        return translateMessage(finalFallback, currentLang);
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
    if (isTechnical) {
        return translateMessage(finalFallback, currentLang);
    }

    return translateMessage(rawMsg, currentLang);
};

export const NotificationProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n?.language || sessionStorage.getItem('lang') || 'ar';
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'info', duration = 4500) => {
        if (!message) return;
        const localizedMessage = translateMessage(message, currentLang);
        setNotification({
            id: Date.now(),
            message: localizedMessage,
            type,
            duration
        });
    }, [currentLang]);

    const showSuccess = useCallback((message, duration = 4000) => {
        showNotification(message, 'success', duration);
    }, [showNotification]);

    const showError = useCallback((errorOrMessage, fallback, duration = 5000) => {
        const cleanMessage = sanitizeErrorMessage(errorOrMessage, fallback, currentLang);
        showNotification(cleanMessage, 'error', duration);
    }, [showNotification, currentLang]);

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
