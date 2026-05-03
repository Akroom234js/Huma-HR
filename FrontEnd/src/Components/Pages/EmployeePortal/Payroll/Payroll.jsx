import React, { useState, useEffect } from "react";
import "./Payroll.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import apiClient from "../../../../apiConfig";


const Payroll = () => {
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/employee/payroll');
        setPayrollHistory(response.data.data || []);
      } catch (error) {
        console.error("Error fetching payroll history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const overviewData = [
    {
      title: "Latest Net Paid",
      value: payrollHistory.length > 0 ? `$${Number(payrollHistory[0].final_net_salary).toLocaleString()}` : "$0",
      type: "blue",
      icon: "account_balance_wallet",
    },
    {
      title: "Total Bonuses (Yearly)",
      value: `$${payrollHistory.reduce((acc, curr) => acc + Number(curr.bonuses_amount), 0).toLocaleString()}`,
      type: "green",
      icon: "card_giftcard",
    },
    {
      title: "Total Deductions (Yearly)",
      value: `-$${payrollHistory.reduce((acc, curr) => acc + (curr.deductions?.reduce((dAcc, d) => dAcc + Number(d.amount), 0) || 0), 0).toLocaleString()}`,
      type: "red",
      icon: "trending_down",
    },
  ];
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
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
              ) : payrollHistory.map((item, index) => {
                const monthName = new Date(item.payroll_year, item.payroll_month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                const basic = Number(item.basic_salary);
                const allowances = Number(item.allowances_amount);
                const bonuses = Number(item.bonuses_amount);
                const tax = item.deductions?.filter(d => d.deduction_type === 'tax').reduce((acc, d) => acc + Number(d.amount), 0) || 0;
                const insurance = item.deductions?.filter(d => d.deduction_type === 'insurance').reduce((acc, d) => acc + Number(d.amount), 0) || 0;
                const absences = item.deductions?.filter(d => d.deduction_type === 'absence' || d.deduction_type === 'penalty').reduce((acc, d) => acc + Number(d.amount), 0) || 0;
                const net = Number(item.final_net_salary);

                return (
                  <tr key={index}>
                    <td>{monthName}</td>
                    <td>${basic.toLocaleString()}</td>
                    <td className="positive">${allowances.toLocaleString()}</td>
                    <td className="positive">${bonuses.toLocaleString()}</td>
                    <td className="negative">${tax.toLocaleString()}</td>
                    <td className="negative">${insurance.toLocaleString()}</td>
                    <td className="negative">${absences.toLocaleString()}</td>
                    <td className="net">${net.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${item.status === 'paid' ? 'paid' : 'unpaid'}`} style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {item.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
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
