import React from 'react';
import './General.css';
import ThemeToggle from '../../../ThemeToggle/ThemeToggle';
import { useTranslation } from 'react-i18next';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';
const General = () => {
    const { t } = useTranslation("Dashboard/GeneralDashboard")
    const data = [
        {
            name: "Attendance",
            LastMonth: "75",
            ThisMonth: "20",

        },
        {
            name: "Productivity",
            LastMonth: "80",
            ThisMonth: "25",

        },
        {
            name: "Job Satisfaction",
            LastMonth: "55",
            ThisMonth: "10",

        }
    ];
    const yax = ["0%", "25%", "50%", "75%", "100%"]
    return (
        <div className="dashboard-page">
            <header className="page-header general">
                <h1>{t("GeneralDashboard")}</h1>
                <div className="general-theme-toggle-wrapper">
                    <ThemeToggle />
                </div>
            </header>
            <div className='general-info'>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("TotalEmployees")}</h3>
                    <p className="number">125</p>
                    <span className="badge badge-green">
                        <i className="bi bi-arrow-up-short"></i> +5 {t("newthismonth")}
                    </span>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("PerformanceRate")}</h3>
                    <p className="number">92%</p>
                    <span className="badge badge-green">
                        {t("High")}
                    </span>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesonLeaveToday")}</h3>
                    <p className="number">8</p>
                    <span className="badge badge-gray">
                        3 Sick, 5 Annual
                    </span>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("OvertimeHours")}</h3>
                    <p className="number">76</p>
                    <span className="badge badge-green">
                        +2% {t("fromlastmonth")}
                    </span>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("MonthlySalaryCost")}</h3>
                    <p className="number">$250,000</p>
                    <span className="badge badge-gray">
                        {t("Approx")}
                    </span>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesonLeavethisMonth")}</h3>
                    <p className="number">15</p>
                    <span className="badge badge-gray">
                        (Total)
                    </span>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesLateToday")}</h3>
                    <p className="number">3</p>
                    <span className="badge badge-red">
                        {t("Higherthanusual")}
                    </span>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("AveragePerformanceRating")}</h3>
                    <p className="number">4.2 <span>/ 5.0</span></p>
                    <span className="badge badge-green">
                        {t("Up")} 0.3 {t("fromlastquarter")}
                    </span>
                </div>
            </div>
            <div className='graph'>
                <h3>{t("Month-over-monthComparison")}</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        />
                        <YAxis
                            ticks={[0, 25, 50, 75, 100]}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-main)'
                            }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="ThisMonth" name={t("ThisMonth")} fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="LastMonth" name={t("LastMonth")} fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default General;
