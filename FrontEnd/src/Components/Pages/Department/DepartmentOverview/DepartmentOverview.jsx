import React, { useState, useEffect } from 'react';
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import "./DepartmentOverview.css";
import apiClient from "../../../../apiConfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2563eb", "#60a5fa", "#3b82f6", "#93c5fd", "#bfdbfe", "#dbeafe"];

const DepartmentOverview = () => {
  const [stats, setStats] = useState({
    distribution: [],
    budget: [],
    tableData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/departments/stats');
        setStats(res.data?.data || { distribution: [], budget: [], tableData: [] });
      } catch (error) {
        console.error("Failed to fetch department stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalDepts = stats.tableData.length;
  const totalEmployees = stats.distribution.reduce((acc, curr) => acc + curr.value, 0);
  const avgEmployees = totalDepts > 0 ? (totalEmployees / totalDepts).toFixed(1) : 0;

  const highestHeadcountItem = stats.distribution.length > 0
    ? [...stats.distribution].sort((a, b) => b.value - a.value)[0]
    : { name: '—', value: 0 };

  const totalBudget = stats.budget.reduce((acc, curr) => acc + (curr.budget || 0), 0);

  return (
    <div className="page-container">
      <div className="page-title">
        <h2>Department Overview</h2>
        <div className="sm-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>
      <div className="container-subcard">
        <div className="subcart1">
          <h6>Total Departments</h6>
          <h2>{totalDepts}</h2>
        </div>
        <div className="subcart1">
          <h6>Avg. Employees / Dept.</h6>
          <h2>{avgEmployees}</h2>
        </div>
        <div className="subcart1">
          <h6>Highest Headcount</h6>
          <h2>{highestHeadcountItem.name} ({highestHeadcountItem.value})</h2>
        </div>
        <div className="subcart1">
          <h6>Total Staff Budget</h6>
          <h2>${totalBudget.toLocaleString()}</h2>
        </div>
      </div>
      <div className="chart1">
        <div className="charts-wrapper">
          <div className="card">
            <h6>Employee Distribution by Department</h6>
            <ResponsiveContainer width="100%" height={"100%"}>
              <BarChart data={stats.distribution}>
                <XAxis dataKey="name" />
                <YAxis hide axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card donut">
            <h6>Budget Allocation</h6>
            <ResponsiveContainer width="100%" height={"100%"}>
              <PieChart>
                <Pie
                  data={stats.budget}
                  dataKey="budget"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {stats.budget.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="custom-legend">
              {stats.budget.slice(0, 5).map((item, i) => (
                <div key={i} className="legend-item">
                  <div className="legend-left">
                    <span
                      className="legend-color"
                      style={{
                        backgroundColor: COLORS[i % COLORS.length],
                      }}
                    ></span>
                    {item.name}
                  </div>
                  <span>{totalBudget > 0 ? (((item.budget || 0) / totalBudget) * 100).toFixed(1) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="table-card">
        <table className="department-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Department Head</th>
              <th>Employees</th>
              <th>Open Positions</th>
              <th>Annual Budget</th>
            </tr>
          </thead>
          <tbody>
            {stats.tableData.map((dept, idx) => (
              <tr key={idx}>
                <td>{dept.name}</td>
                <td>{dept.head}</td>
                <td>{dept.count}</td>
                <td>{dept.openPositions}</td>
                <td>{dept.budget}</td>
              </tr>
            ))}
            {stats.tableData.length === 0 && !isLoading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentOverview;
