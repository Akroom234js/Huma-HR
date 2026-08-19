import React, { useState, useEffect } from 'react';
import './AutoActionsHub.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import PendingActions from './PendingActions';
import ActionsLog from './ActionsLog';
import { getPerformanceActions, approvePerformanceAction, rejectPerformanceAction } from '../../../../services/PerformanceHrService';

const AutoActionsHub = () => {
    const { t } = useTranslation("HrPerformance/AutoActionsHub");
    const [pendingActions, setPendingActions] = useState([]);
    const [actionsLog, setActionsLog] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadActions = async () => {
        try {
            setIsLoading(true);
            const [pendingRes, approvedRes, rejectedRes] = await Promise.allSettled([
                getPerformanceActions({ status: 'pending_approval' }),
                getPerformanceActions({ status: 'approved' }),
                getPerformanceActions({ status: 'rejected' })
            ]);

            if (pendingRes.status === 'fulfilled') {
                const rawPending = pendingRes.value?.data?.data || [];
                setPendingActions(Array.isArray(rawPending) ? rawPending : []);
            }

            let logItems = [];
            if (approvedRes.status === 'fulfilled') {
                const rawApp = approvedRes.value?.data?.data || [];
                if (Array.isArray(rawApp)) logItems.push(...rawApp);
            }
            if (rejectedRes.status === 'fulfilled') {
                const rawRej = rejectedRes.value?.data?.data || [];
                if (Array.isArray(rawRej)) logItems.push(...rawRej);
            }
            // Sort by approved_at/created_at descending
            logItems.sort((a, b) => new Date(b.approved_at || b.created_at) - new Date(a.approved_at || a.created_at));
            setActionsLog(logItems);
        } catch (error) {
            console.error("Error loading performance actions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadActions();
    }, []);

    const handleApprove = async (actionId) => {
        try {
            await approvePerformanceAction(actionId);
            alert("تمت الموافقة على الإجراء بنجاح!");
            loadActions();
        } catch (error) {
            console.error("Failed to approve action:", error);
            alert("تعذر اعتماد الإجراء.");
        }
    };

    const handleReject = async (actionId) => {
        const reason = window.prompt("سبب الرفض (اختياري):") || "";
        try {
            await rejectPerformanceAction(actionId, reason);
            alert("تم رفض الإجراء.");
            loadActions();
        } catch (error) {
            console.error("Failed to reject action:", error);
            alert("تعذر رفض الإجراء.");
        }
    };

    return (
        <div className="performance-container AutoActionsHub-container">
            <h1>{t("title")}</h1>
            <p>{t("des")}</p>
            <div className="em-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}></i>
                    <span>جاري تحميل الإجراءات التلقائية...</span>
                </div>
            ) : (
                <>
                    <PendingActions 
                        actions={pendingActions} 
                        onApprove={handleApprove} 
                        onReject={handleReject} 
                    />
                    <br />
                    <ActionsLog logs={actionsLog} />
                </>
            )}
        </div>
    );
};

export default AutoActionsHub;
