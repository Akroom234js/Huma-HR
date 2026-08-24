import React, { useEffect, useState } from "react";
import "./Rewards.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import "../../EmployeePortal/MyRequests/Leaves.css";
import { getEmployeeRecognitions, getEmployeeRewards } from "../../../../services/RewardsBonusesService";
import { useTranslation } from "react-i18next";

export default function RewardsBonuses() {
  const { t, i18n } = useTranslation("EmployeePortal/Rewards");
  const isAr = i18n ? i18n.language === "ar" : false;

  const [rewards, setRewards] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await getEmployeeRewards();
        const resRecognitions = await getEmployeeRecognitions();
        const data = res.data?.data ?? res.data ?? [];
        const dataRecognitions = resRecognitions.data?.data ?? resRecognitions.data ?? [];
        setRewards(Array.isArray(data.bonuses) ? data.bonuses : []);
        setRecognitions(Array.isArray(dataRecognitions.received) ? dataRecognitions.received : []);
        setCurrentYear(data.current_year || new Date().getFullYear());
        setTotalAmount(data.total_amount || 0);
      } catch (err) {
        console.error('Failed to fetch Rewards:', err);
        setRewards([]);
        setRecognitions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  return (
    <div className={`rewards-page ${isAr ? "rtl" : "ltr"}`}>
      <div>
        <h1 className="page-title">{t("pageTitle")}</h1>
      </div>
      <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>

      <div className="rewards-grid">
        <div className="row-flex">
          <div className="card rewards-total-card">
            <div className="rewards-total-content">
              <div className="reward-icon">💵</div>
              <div>
                <p>{t("totalRewardsTitle", { year: currentYear })}</p>
                <h2>{totalAmount} $</h2>
              </div>
            </div>
          </div>

          <div className="card recognition-card">
            <h2>{t("receivedRecognition")}</h2>

            <div>
              <div className="recognition-con">
                {recognitions.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '12px' }}>{t("noRecognitions")}</p>
                ) : (
                  recognitions.map((recognition) => (
                    <div key={recognition.id} className="recognition-box brspan">
                      <p>"{recognition.message}"</p>
                      <span>- {recognition.sender?.full_name || recognition.sender?.name} ({recognition.sender?.job_title || ''})</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card rewards-history-card">
          <h2>{t("historyTitle")}</h2>

          <div className="table-wrapper">
            <table className="rewards-table">
              <thead>
                <tr>
                  <th>{t("table.dateReceived")}</th>
                  <th>{t("table.rewardType")}</th>
                  <th>{t("table.amount")}</th>
                  <th>{t("table.reason")}</th>
                  <th>{t("table.awardedBy")}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>...</td></tr>
                ) : rewards.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>{t("noRewards")}</td></tr>
                ) : (
                  rewards.map((reward) => (
                    <tr key={reward.id}>
                      <td>{reward.date_received}</td>
                      <td>{reward.type}</td>
                      <td className="green">{reward.amount} $</td>
                      <td>{reward.reason}</td>
                      <td>{reward.awarded_by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy */}
        <div className="card policy-card">
          <h2>{t("policyTitle")}</h2>

          <p>
            {t("policyText")}
            <span className="policy-link">
              {" "}
              {t("policyLink")}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
