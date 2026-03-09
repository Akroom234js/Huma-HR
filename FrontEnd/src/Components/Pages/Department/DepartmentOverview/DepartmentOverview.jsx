import "./DepartmentOverview.css";
// import React from "react";
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

const employeeData = [
  { name: "Eng", value: 92 },
  { name: "Prod", value: 65 },
  { name: "Mktg", value: 38 },
  { name: "Design", value: 15 },
  { name: "HR", value: 28 },
  { name: "Sales", value: 22 },
  { name: "Legal", value: 16 },
];

const budgetData = [
  { name: "Engineering", value: 45 },
  { name: "Product", value: 25 },
  { name: "Other", value: 30 },
];

const DepartmentOverview = () => {
  return (
    <div className="page-container">
      <div className="page-title">
        <h2>Department Overview</h2>
      </div>
      <div className="container-subcard">
        <div className="subcart1">
          <h6>Total Departments</h6>
          <h2>12</h2>
        </div>
        <div className="subcart1">
          <h6>Total Departments</h6>
          <h2>21.5</h2>
        </div>
        <div className="subcart1">
          <h6>Highest Headcount</h6>
          <h2>Engineering (42)</h2>
        </div>
        <div className="subcart1">
          <h6>Avg. Employees / Dept.</h6>
          <h2>Design (2%)</h2>
        </div>
      </div>
      <div className="chart1">
        <div className="charts-wrapper">
          <div className="card">
            <h6>Employee Distribution by Department</h6>
            <ResponsiveContainer width="100%" height={"100%"}>
              <BarChart data={employeeData}>
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
                  data={budgetData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {budgetData.map((_, i) => (
                    <Cell key={i} fill={["#2563eb", "#60a5fa", "#cbd5e1"][i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="custom-legend">
              {budgetData.map((item, i) => (
                <div key={i} className="legend-item">
                  <div className="legend-left">
                    <span
                      className="legend-color"
                      style={{
                        backgroundColor: ["#2563eb", "#60a5fa", "#cbd5e1"][i],
                      }}
                    ></span>
                    {item.name}
                  </div>
                  <span>{item.value}%</span>
                </div>
              ))}
            </div>

            <span className="center-text">70%</span>
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
            <tr>
              <td>Engineering</td>
              <td>Candice Wu</td>
              <td>42</td>
              <td>5</td>
              <td>$5,200,000</td>
            </tr>
            <tr>
              <td>Design</td>
              <td>Phoenix Baker</td>
              <td>15</td>
              <td>2</td>
              <td>$1,800,000</td>
            </tr>
            <tr>
              <td>Product</td>
              <td>Lana Steiner</td>
              <td>23</td>
              <td>3</td>
              <td>$2,500,000</td>
            </tr>
            <tr>
              <td>Marketing</td>
              <td>Natali Craig</td>
              <td>18</td>
              <td>1</td>
              <td>$2,100,000</td>
            </tr>
            <tr>
              <td>Human Resources</td>
              <td>Olivia Rhye</td>
              <td>8</td>
              <td>0</td>
              <td>$950,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentOverview;
