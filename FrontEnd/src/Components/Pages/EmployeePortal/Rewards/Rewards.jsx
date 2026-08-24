import React, { useEffect, useState, useCallback } from "react";
import "./Rewards.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import SendRecognitionModal from "./SendRecognition";
import { getEmployeeRecognitions, getEmployeeRewards } from "../../../../services/RewardsBonusesService";
import { useTranslation } from "react-i18next";

const BADGE_MAP = {
  rockstar: { iconClass: "bi bi-star-fill", labelKey: "badges.rockstar", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  teamplayer: { iconClass: "bi bi-people-fill", labelKey: "badges.teamplayer", color: "#359EFF", bg: "rgba(53, 158, 255, 0.12)" },
  innovator: { iconClass: "bi bi-lightbulb-fill", labelKey: "badges.innovator", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
  leader: { iconClass: "bi bi-award-fill", labelKey: "badges.leader", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)" },
  creative: { iconClass: "bi bi-palette-fill", labelKey: "badges.creative", color: "#ec4899", bg: "rgba(236, 72, 153, 0.12)" },
};

export default function RewardsBonuses() {
  const { t, i18n } = useTranslation("EmployeePortal/Rewards");
  const isAr = i18n ? i18n.language === "ar" : false;

  const [rewards, setRewards] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resRewards, resRecognitions] = await Promise.all([
        getEmployeeRewards(),
        getEmployeeRecognitions(),
      ]);

      const dataRewards = resRewards.data?.data ?? resRewards.data ?? {};
      const dataRecognitions = resRecognitions.data?.data ?? resRecognitions.data ?? {};

      setRewards(Array.isArray(dataRewards.bonuses) ? dataRewards.bonuses : []);
      setRecognitions(Array.isArray(dataRecognitions.received) ? dataRecognitions.received : []);
      setCurrentYear(dataRewards.current_year || new Date().getFullYear());
      setTotalAmount(Number(dataRewards.total_amount) || 0);
    } catch (err) {
      console.error("Failed to fetch rewards/recognitions:", err);
      setRewards([]);
      setRecognitions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString(isAr ? "ar-EG" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(isAr ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`rewards-page ${isAr ? "rtl" : "ltr"}`}>
      {/* Page Header */}
      <div className="rewards-header-wrapper">
        <div>
          <h1 className="page-title">{t("pageTitle")}</h1>
        </div>
        <div className="rewards-theme-toggle">
          <ThemeToggle />
        </div>
      </div>

      <div className="rewards-grid">
        {/* Top Cards Section */}
        <div className="row-flex">
          {/* Total Rewards Card */}
          <div className="card rewards-total-card">
            <div className="rewards-total-content">
              <div className="reward-icon-wrapper" aria-hidden="true">
                <i className="bi bi-wallet2 reward-icon"></i>
              </div>
              <div className="rewards-total-info">
                <span className="rewards-badge-highlight">{currentYear}</span>
                <p className="rewards-total-title">
                  {t("totalRewardsTitle", { year: currentYear })}
                </p>
                <h2 className="rewards-total-value">{formatCurrency(totalAmount)} $</h2>
                <p className="rewards-total-subtitle">{t("totalRewardsSubtitle")}</p>
              </div>
            </div>
          </div>

          {/* Recognitions Card */}
          <div className="card recognition-card">
            <div className="recognition-card-header">
              <div className="card-title-group">
                <i className="bi bi-award-fill card-title-icon"></i>
                <h2>{t("receivedRecognition")}</h2>
              </div>
              <button
                type="button"
                className="btn-send-recognition"
                onClick={() => setIsSendModalOpen(true)}
              >
                <i className="bi bi-plus-lg"></i>
                <span>{t("sendRecognitionBtn")}</span>
              </button>
            </div>

            <div className="recognition-con">
              {loading ? (
                <div className="recognition-loading">
                  <div className="loading-spinner" />
                </div>
              ) : recognitions.length === 0 ? (
                <div className="empty-recognition-box">
                  <i className="bi bi-chat-square-quote empty-icon"></i>
                  <p className="no-data-msg">{t("noRecognitions")}</p>
                </div>
              ) : (
                recognitions.map((recognition) => {
                  const badgeInfo = BADGE_MAP[recognition.badge_type] || BADGE_MAP.teamplayer;
                  const senderName = recognition.sender?.full_name || recognition.sender?.name || "Colleague";
                  const senderTitle = recognition.sender?.job_title || "";
                  const senderPic = recognition.sender?.profile_pic;
                  const initial = senderName.charAt(0).toUpperCase();

                  return (
                    <div key={recognition.id} className="recognition-box">
                      <div className="recognition-avatar-wrapper">
                        {senderPic ? (
                          <img
                            src={senderPic}
                            alt={senderName}
                            className="recognition-avatar"
                          />
                        ) : (
                          <div className="recognition-avatar-initial">{initial}</div>
                        )}
                      </div>

                      <div className="recognition-body">
                        <div className="recognition-top">
                          <div className="recognition-sender-info">
                            <span className="recognition-sender-name">{senderName}</span>
                            {senderTitle && (
                              <span className="recognition-sender-title">— {senderTitle}</span>
                            )}
                          </div>

                          <div
                            className="recognition-badge-tag"
                            style={{
                              color: badgeInfo.color,
                              backgroundColor: badgeInfo.bg,
                              borderColor: badgeInfo.color,
                            }}
                          >
                            <i className={`${badgeInfo.iconClass} badge-icon-sm`}></i>
                            <span>{t(badgeInfo.labelKey)}</span>
                          </div>
                        </div>

                        <p className="recognition-message">{recognition.message}</p>

                        <div className="recognition-footer">
                          <span className="recognition-date">
                            <i className="bi bi-calendar-event me-1"></i>
                            {formatDate(recognition.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="card rewards-history-card">
          <div className="card-title-group mb-3">
            <i className="bi bi-clock-history card-title-icon"></i>
            <h2>{t("historyTitle")}</h2>
          </div>

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
                  <tr>
                    <td colSpan="5" className="table-loading-cell">
                      <div className="loading-spinner" />
                    </td>
                  </tr>
                ) : rewards.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty-cell">
                      <i className="bi bi-inbox empty-table-icon"></i>
                      <div>{t("noRewards")}</div>
                    </td>
                  </tr>
                ) : (
                  rewards.map((reward) => (
                    <tr key={reward.id}>
                      <td className="date-cell">
                        <i className="bi bi-calendar2-check date-icon"></i>
                        {formatDate(reward.date_received)}
                      </td>
                      <td>
                        <span className="reward-type-badge">{reward.type}</span>
                      </td>
                      <td className="amount-cell primary-val">{formatCurrency(reward.amount)} $</td>
                      <td className="reason-cell">{reward.reason}</td>
                      <td>
                        <span className="awarded-by-badge">
                          <i className="bi bi-person-check-fill me-1"></i>
                          {reward.awarded_by}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy Section */}
        <div className="card policy-card">
          <div className="policy-header">
            <i className="bi bi-shield-check policy-icon"></i>
            <h2>{t("policyTitle")}</h2>
          </div>
          <p>
            {t("policyText")}{" "}
            <button
              type="button"
              className="policy-link-btn"
              onClick={() => setIsPolicyModalOpen(true)}
            >
              {t("policyLink")}
            </button>
          </p>
        </div>
      </div>

      {/* Send Recognition Modal */}
      <SendRecognitionModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Policy Information Modal */}
      {isPolicyModalOpen && (
        <div className="recognition-modal-overlay" onClick={() => setIsPolicyModalOpen(false)}>
          <div
            className={`policy-modal-container ${isAr ? "rtl" : "ltr"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="policy-modal-header">
              <div className="policy-modal-title-group">
                <i className="bi bi-shield-check modal-title-icon"></i>
                <h3>{t("policyModal.title")}</h3>
              </div>
              <button
                className="recognition-modal-close"
                onClick={() => setIsPolicyModalOpen(false)}
                type="button"
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="policy-modal-content">
              <p className="policy-intro">{t("policyModal.intro")}</p>

              <div className="policy-section">
                <h4>
                  <i className="bi bi-check2-circle me-1"></i>
                  {t("policyModal.sec1Title")}
                </h4>
                <p>{t("policyModal.sec1Text")}</p>
              </div>

              <div className="policy-section">
                <h4>
                  <i className="bi bi-gem me-1"></i>
                  {t("policyModal.sec2Title")}
                </h4>
                <p>{t("policyModal.sec2Text")}</p>
              </div>

              <div className="policy-section">
                <h4>
                  <i className="bi bi-bank me-1"></i>
                  {t("policyModal.sec3Title")}
                </h4>
                <p>{t("policyModal.sec3Text")}</p>
              </div>
            </div>

            <div className="policy-modal-footer">
              <button
                type="button"
                className="btn-policy-close"
                onClick={() => setIsPolicyModalOpen(false)}
              >
                {t("policyModal.close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
