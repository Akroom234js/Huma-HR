import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import React from "react";
import "./PayrollOverview.css";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Engineering", value: 45 },
  { name: "Product", value: 30 },
  { name: "Design", value: 15 },
  { name: "Other", value: 10 },
];

const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#cbd5e1"];

const PayrollOverview = () => {
  return (
    <div className="All_page">
      <div className="head1">
        <h2 className="title_salary"> Payroll Overview</h2>
        <ThemeToggle />
      </div>
      <div className="con_divs">
        <div>
          <p>Total Monthly Company Payroll</p>
          <h3>$450,320</h3>
        </div>

        <div>
          <p>Employees Paid</p>
          <h3>258 / 258</h3>
        </div>

        <div>
          <p>Avg. Salary / Employee</p>
          <h3>$1,745</h3>
        </div>
      </div>
      <div className="all_chart">
        <h4 className="salary-title">Salary Distribution</h4>
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
      <div class="table-container2">
        <table class="payroll-table">
          <thead>
            <tr>
              <th>DEPARTMENT</th>
              <th>TOTAL PAYROLL</th>
              <th>AVERAGE SALARY</th>
              <th>EMPLOYEES</th>
              <th>% OF TOTAL</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Engineering</td>
              <td>$202,644</td>
              <td>$4,824</td>
              <td>42</td>
              <td>45%</td>
            </tr>

            <tr>
              <td>Product</td>
              <td>$135,096</td>
              <td>$5,873</td>
              <td>23</td>
              <td>30%</td>
            </tr>

            <tr>
              <td>Design</td>
              <td>$67,548</td>
              <td>$4,503</td>
              <td>15</td>
              <td>15%</td>
            </tr>

            <tr>
              <td>Marketing</td>
              <td>$22,516</td>
              <td>$1,250</td>
              <td>18</td>
              <td>5%</td>
            </tr>

            <tr>
              <td>Other Departments</td>
              <td>$22,516</td>
              <td>$750</td>
              <td>30</td>
              <td>5%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollOverview;
