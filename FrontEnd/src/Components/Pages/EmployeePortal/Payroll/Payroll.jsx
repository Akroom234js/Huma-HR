import React from "react";
import "./Payroll.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";

const overviewData = [
  {
    title: "Gross Total Cost",
    value: "$55,000",
    type: "green",
    icon: "payments",
  },
  {
    title: "Bonuses",
    value: "$3,500",
    type: "green",
    icon: "card_giftcard",
  },
  {
    title: "Deductions",
    value: "-$12,000",
    type: "red",
    icon: "trending_down",
  },
  {
    title: "Total Net Paid",
    value: "$46,500",
    type: "blue",
    icon: "account_balance_wallet",
  },
];

const payrollHistory = [
  {
    month: "May 2025",
    salaries: 60000,
    allowances: 4100,
    bonuses: 2300,
    deductions: {
      tax: 50,
      insurance: 300,
      absences: 4000,
    },
  },
  {
    month: "May 2024",
    salaries: 40000,
    allowances: 4500,
    bonuses: 3100,
    deductions: {
      tax: 50,
      insurance: 3000,
      absences: 400,
    },
  },
  {
    month: "May 2024",
    salaries: 51000,
    allowances: 4500,
    bonuses: 3000,
    deductions: {
      tax: 50,
      insurance: 200,
      absences: 4200,
    },
  },
  {
    month: "May 2024",
    salaries: 44000,
    allowances: 4500,
    bonuses: 3000,
    deductions: {
      tax: 50,
      insurance: 300,
      absences: 4000,
    },
  },
];

const Payroll = () => {
  return (
    <div className="payroll-page">
      <h1 className="page-title">Payroll Reports</h1>
      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>
      <div className="summary-cards">
        {overviewData.map((item, index) => (
          <div className={`summary-card ${item.type}`} key={index}>
            <div className="icon">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div>
              <h4>{item.title}</h4>
              <div className="value">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <div className="table-card">
          <div className="card-header">
            <h2>Payroll Cycle History</h2>

            <div className="actions">
              <input placeholder="Search..." />
              <select>
                <option>Last 6 Months</option>
                <option>This Year</option>
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Salaries</th>
                <th>Allowances</th>
                <th>Bonuses</th>
                <th>Tax</th>
                <th>Insurance</th>
                <th>Absences</th>
                <th>Net</th>
              </tr>
            </thead>

            <tbody>
              {payrollHistory.map((item, index) => {
                const tax = item.deductions?.tax || 0;
                const insurance = item.deductions?.insurance || 0;
                const absences = item.deductions?.absences || 0;

                const net =
                  item.salaries +
                  item.allowances +
                  item.bonuses -
                  (tax + insurance + absences);

                return (
                  <tr key={index}>
                    <td>{item.month}</td>
                    <td>${item.salaries.toLocaleString()}</td>
                    <td className="positive">
                      ${item.allowances.toLocaleString()}
                    </td>
                    <td className="positive">
                      ${item.bonuses.toLocaleString()}
                    </td>
                    <td className="negative">${tax.toLocaleString()}</td>
                    <td className="negative">${insurance.toLocaleString()}</td>
                    <td className="negative">${absences.toLocaleString()}</td>
                    <td className="net">${net.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
