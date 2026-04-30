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
    totalMonthlyPayroll: 0,
    totalEmployeesPaid: 0,
    totalEmployees: 0,
    avgSalary: 0,
    departmentDistribution: []
  });

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await apiClient.get('/payroll/overview');
      setOverviewData(response.data.data);
    } catch (error) {
      console.error('Error fetching payroll overview:', error);
    }
  };

  const data = overviewData.departmentDistribution.length > 0 ? overviewData.departmentDistribution : [
    { name: t('Engineering'), value: 0 },
    { name: t('Product'), value: 0 },
    { name: t('Design'), value: 0 },
    { name: t('Other'), value: 0 },
  ];

  return (
    <div className="All_page">
      <div className="head1">
        <h2 className="title_salary"> {t('PayrollOverview')}</h2>
        <div className="sm-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>
      <div className="con_divs">
        <div>
          <p>{t('TotalMonthlyCompanyPayroll')}</p>
          <h3>${Number(overviewData.totalMonthlyPayroll).toLocaleString()}</h3>
        </div>

        <div>
          <p>{t('EmployeesPaid')}</p>
          <h3>{overviewData.totalEmployeesPaid} / {overviewData.totalEmployees}</h3>
        </div>

        <div>
          <p>{t('AvgSalaryEmployee')}</p>
          <h3>${Number(overviewData.avgSalary).toLocaleString()}</h3>
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
            {overviewData.departmentDistribution.map((dept, index) => (
              <tr key={index}>
                <td>{dept.name}</td>
                <td>${Number(dept.totalPayroll).toLocaleString()}</td>
                <td>${Number(dept.averageSalary).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                <td>{dept.employees}</td>
                <td>{dept.ofTotal}</td>
              </tr>
            ))}
            {overviewData.departmentDistribution.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center'}}>{t('NoData', 'No data available')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollOverview;
