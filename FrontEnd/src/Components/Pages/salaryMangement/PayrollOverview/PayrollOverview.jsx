import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import React, { useState, useEffect } from "react";
import apiClient from "../../../../apiConfig";
import "./PayrollOverview.css";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#cbd5e1"];

const PayrollOverview = () => {
  const { t } = useTranslation('SalaryManagement/PayrollOverview');

  const [overviewData, setOverviewData] = useState({
    total_payroll_amount: 0,
    total_paid: 0,
    total_records: 0,
    avg_salary: 0,
    department_distribution: []
  });

  const [selectedMonth, setSelectedMonth] = useState("");
  
  const monthsList = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthsList.push(d.toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  }

  useEffect(() => {
    if (!selectedMonth) setSelectedMonth(monthsList[0]);
  }, [monthsList]);

  useEffect(() => {
    if (selectedMonth) fetchOverview();
  }, [selectedMonth]);

  const fetchOverview = async () => {
    try {
      const response = await apiClient.get('/payroll/overview', { params: { month: selectedMonth } });
      setOverviewData(response.data.data);
    } catch (error) {
      console.error('Error fetching payroll overview:', error);
    }
  };

  const data = overviewData.department_distribution && overviewData.department_distribution.length > 0 ? overviewData.department_distribution : [
    { name: t('Engineering'), value: 0 },
    { name: t('Product'), value: 0 },
    { name: t('Design'), value: 0 },
    { name: t('Other'), value: 0 },
  ];

  return (
    <div className="All_page">
      <div className="head1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 className="title_salary"> {t('PayrollOverview')}</h2>
          <select 
            className="dateselect" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            {monthsList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="sm-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>
      <div className="con_divs">
        <div>
          <p>{t('TotalMonthlyCompanyPayroll')}</p>
          <h3>${Number(overviewData.total_payroll_amount).toLocaleString()}</h3>
        </div>

        <div>
          <p>{t('EmployeesPaid')}</p>
          <h3>{overviewData.total_paid} / {overviewData.total_records}</h3>
        </div>

        <div>
          <p>{t('AvgSalaryEmployee')}</p>
          <h3>${Number(overviewData.avg_salary).toLocaleString()}</h3>
        </div>
      </div>
      <div className="all_chart">
        <h4 className="salary-title">{t('SalaryDistribution')}</h4>
        <div className="salary-card">
          <div className="salary-chart">
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="salary-legend">
            {data.map((item, index) => (
              <div className="legend-row" key={index}>
                <div className="legend-left">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: COLORS[index] }}
                  ></span>
                  {item.name}
                </div>
                <span className="legend-value">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="table-container2">
        <table className="payroll-table">
          <thead>
            <tr>
              <th>{t('DEPARTMENT')}</th>
              <th>{t('TOTALPAYROLL')}</th>
              <th>{t('AVERAGESALARY')}</th>
              <th>{t('EMPLOYEES')}</th>
              <th>{t('OFTOTAL')}</th>
            </tr>
          </thead>

          <tbody>
            {overviewData.department_distribution && overviewData.department_distribution.map((dept, index) => (
              <tr key={index}>
                <td>{dept.name}</td>
                <td>${Number(dept.total_payroll).toLocaleString()}</td>
                <td>${Number(dept.avg_salary).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td>{dept.employee_count}</td>
                <td>{dept.value}%</td>
              </tr>
            ))}
            {(!overviewData.department_distribution || overviewData.department_distribution.length === 0) && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>{t('NoData', 'No data available')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollOverview;
