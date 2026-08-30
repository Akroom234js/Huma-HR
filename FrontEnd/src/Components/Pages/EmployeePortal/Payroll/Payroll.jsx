import React, { useState, useEffect } from "react";
import "./Payroll.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import apiClient from "../../../../apiConfig";
import { useTranslation } from "react-i18next";
import DashboardLoader from "../../../Shared/DashboardLoader/DashboardLoader";

const Payroll = () => {
  const { t, i18n } = useTranslation("EmployeePortal/Payroll");
  const isAr = i18n ? i18n.language === "ar" : false;

  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/employee/payroll');
        setPayrollHistory(response.data?.data || []);
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
      title: t("latestNetPaid"),
      value: payrollHistory.length > 0 ? `$${Number(payrollHistory[0].final_net_salary).toLocaleString()}` : "$0",
      type: "blue",
      icon: "account_balance_wallet",
    },
    {
      title: t("totalBonusesYearly"),
      value: `$${payrollHistory.reduce((acc, curr) => acc + Number(curr.bonuses_amount || 0), 0).toLocaleString()}`,
      type: "green",
      icon: "card_giftcard",
    },
    {
      title: t("totalDeductionsYearly"),
      value: `-$${payrollHistory.reduce((acc, curr) => acc + (curr.deductions?.reduce((dAcc, d) => dAcc + Number(d.amount), 0) || 0), 0).toLocaleString()}`,
      type: "red",
      icon: "trending_down",
    },
  ];

  return (
    <div className={`payroll-page ${isAr ? "rtl" : "ltr"}`}>
      <h1 className="page-title">{t("pageTitle")}</h1>
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
            <h2>{t("historyTitle")}</h2>

            <div className="actions">
              <input placeholder={t("searchPlaceholder")} />
              <select>
                <option>{t("filter.last6Months")}</option>
                <option>{t("filter.thisYear")}</option>
              </select>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>{t("table.month")}</th>
                <th>{t("table.salaries")}</th>
                <th>{t("table.allowances")}</th>
                <th>{t("table.bonuses")}</th>
                <th>{t("table.tax")}</th>
                <th>{t("table.insurance")}</th>
                <th>{t("table.absences")}</th>
                <th>{t("table.net")}</th>
                <th>{t("table.status")}</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                    <DashboardLoader text={t("loading", "Loading payroll history...")} size="md" />
                  </td>
                </tr>
              ) : payrollHistory.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>{t("noRecords")}</td></tr>
              ) : (
                payrollHistory.map((item, index) => {
                  const locale = isAr ? 'ar-EG' : 'en-US';
                  const monthName = new Date(item.payroll_year, item.payroll_month - 1).toLocaleString(locale, { month: 'long', year: 'numeric' });
                  const basic = Number(item.basic_salary || 0);
                  const allowances = Number(item.allowances_amount || 0);
                  const bonuses = Number(item.bonuses_amount || 0);
                  const tax = item.deductions?.filter(d => d.deduction_type === 'tax').reduce((acc, d) => acc + Number(d.amount), 0) || 0;
                  const insurance = item.deductions?.filter(d => d.deduction_type === 'insurance').reduce((acc, d) => acc + Number(d.amount), 0) || 0;
                  const absences = item.deductions?.filter(d => d.deduction_type === 'absence' || d.deduction_type === 'penalty').reduce((acc, d) => acc + Number(d.amount), 0) || 0;
                  const net = Number(item.final_net_salary || 0);

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
                          {item.status === 'paid' ? t("table.paid") : t("table.pending")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
