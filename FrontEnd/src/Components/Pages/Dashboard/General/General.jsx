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
                <ThemeToggle />
            </header>
            <div className='general-info'>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("TotalEmployees")}</h3>
                    <p className="number">125</p>
                    <p className="color-green">(+5 {t("newthismonth")})</p>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("TotalEmployees")}</h3>
                    <p className="number">92%</p>
                    <p className="color-green">({t("High")})</p>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesonLeaveToday")}</h3>
                    <p className="number">8</p>
                    <p className="color-gray">(3 Sick, 5 Annual)</p>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("OvertimeHours")}</h3>
                    <p className="number">76</p>
                    <p className="color-green">(+2% {t("fromlastmonth")})</p>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("MonthlySalaryCost")}</h3>
                    <p className="number">$250,000</p>
                    <p className="color-gray">({t("Approx")})</p>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesonLeavethisMonth")}</h3>
                    <p className="number">15</p>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("EmployeesLateToday")}</h3>
                    <p className="number">3</p>
                    <p className="color-red">({t("Higherthanusual")})</p>
                </div>
                <div className='general-info-card'>
                    <h3 className="title-card">{t("AveragePerformanceRating")}</h3>
                    <p className="number">4.2 <span>/ 5.0</span></p>
                    <p className="color-green">({t("Up")} 0.3 {t("fromlastquarter")})</p>
                </div>
            </div>
            <div className='graph'>
                <h3>{t("Month-over-monthComparison")}</h3>
                <ResponsiveContainer width="100%" height={"400"}>
                    <BarChart data={data}>
                        <XAxis dataKey="name" />
                        <YAxis ticks={[0, 25, 50, 75, 100]} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ThisMonth" fill="#3b82f6" barSize={70} />
                        <Bar dataKey="LastMonth" fill="#c4c2c2" barSize={70} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default General;
