import React, { useState, useEffect } from 'react';
import './CompanyOverview.css';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import PerformanceDepartment from './PerformanceDepartment';
import Card from './Card';
import TaskStatusPool from './TaskStatusPool';
import TasksTable from './TastsTable';
import CycleTable from './CycleTable';
import { getPerformanceStats, getPerformanceCycles } from '../../../../services/PerformanceHrService';
import { getDepartmentTasks } from '../../../../services/performanceService';

import DashboardLoader from '../../../Shared/DashboardLoader/DashboardLoader';

const CompanyOverview = () => {
    const { t } = useTranslation("HrPerformance/CompanyOverview");
    const [stats, setStats] = useState(null);
    const [cycles, setCycles] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadOverviewData = async () => {
        try {
            setIsLoading(true);
            const [statsRes, cyclesRes, tasksRes] = await Promise.allSettled([
                getPerformanceStats(),
                getPerformanceCycles(),
                getDepartmentTasks()
            ]);

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value?.data?.data || null);
            }
            if (cyclesRes.status === 'fulfilled') {
                const rawCycles = cyclesRes.value?.data?.data || cyclesRes.value?.data || [];
                setCycles(Array.isArray(rawCycles) ? rawCycles : []);
            }
            if (tasksRes.status === 'fulfilled') {
                const rawTasks = tasksRes.value?.data?.data || tasksRes.value?.data || [];
                setTasks(Array.isArray(rawTasks) ? rawTasks : []);
            }
        } catch (error) {
            console.error("Error loading HR Company Overview data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOverviewData();
    }, []);

    return (
        <div className="performance-container CompanyOverview-container">
            <h2>{t('title')}</h2>
            <p>{t("des")}</p>
            <div className="em-theme-toggle-wrapper">
                <ThemeToggle />
            </div>

            {isLoading ? (
                <DashboardLoader text={t("loading") || "جاري تحميل بيانات الأداء المؤسسي..."} size="lg" />
            ) : (
                <>
                    <Card stats={stats} /> 
                    <div className="chart-layout">
                        <PerformanceDepartment deptAverages={stats?.department_averages} />
                        <TaskStatusPool taskStats={stats?.tasks} />
                    </div>
                    <CycleTable cycles={cycles} onRefresh={loadOverviewData} />
                    <br />
                    <TasksTable tasks={tasks} />
                </>
            )}
        </div>
    );
};

export default CompanyOverview;