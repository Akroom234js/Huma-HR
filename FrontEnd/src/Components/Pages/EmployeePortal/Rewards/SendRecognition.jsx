import React, { useState, useEffect } from "react";
import { getColleagues, sendRecognition } from "../../../../services/RewardsBonusesService";
import { useTranslation } from "react-i18next";

export default function SendRecognitionModal({ isOpen, onClose, onSuccess }) {
  const { t, i18n } = useTranslation("EmployeePortal/Rewards");
  const isAr = i18n ? i18n.language === "ar" : false;

  const [colleagues, setColleagues] = useState([]);
  const [recipientId, setRecipientId] = useState("");
  const [badgeType, setBadgeType] = useState("teamplayer");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const badgeOptions = [
    { value: "rockstar", iconClass: "bi bi-star-fill", label: t("badges.rockstar") },
    { value: "teamplayer", iconClass: "bi bi-people-fill", label: t("badges.teamplayer") },
    { value: "innovator", iconClass: "bi bi-lightbulb-fill", label: t("badges.innovator") },
    { value: "leader", iconClass: "bi bi-award-fill", label: t("badges.leader") },
    { value: "creative", iconClass: "bi bi-palette-fill", label: t("badges.creative") },
  ];

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setSuccessMsg("");
      setMessage("");
      setRecipientId("");
      setBadgeType("teamplayer");
      setIsPublic(true);

      const fetchColleagues = async () => {
        setLoading(true);
        try {
          const res = await getColleagues();
          const list = res.data?.data ?? res.data ?? [];
          setColleagues(Array.isArray(list) ? list : []);
        } catch (err) {
          console.error("Failed to fetch colleagues:", err);
          setErrorMsg(t("sendModal.error"));
        } finally {
          setLoading(false);
        }
      };

      fetchColleagues();
    }
  }, [isOpen, t]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!recipientId || !message.trim()) {
      setErrorMsg(t("sendModal.validationRequired"));
      return;
    }

    setSubmitting(true);
    try {
      await sendRecognition({
        recipient_id: Number(recipientId),
        badge_type: badgeType,
        message: message.trim(),
        is_public: isPublic,
      });

      setSuccessMsg(t("sendModal.success"));
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 900);
    } catch (err) {
      console.error("Error sending recognition:", err);
      const serverMsg = err.response?.data?.message || t("sendModal.error");
      setErrorMsg(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="recognition-modal-overlay" onClick={onClose}>
      <div
        className={`recognition-modal-container ${isAr ? "rtl" : "ltr"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="recognition-modal-header">
          <div className="recognition-modal-title-group">
            <i className="bi bi-award-fill modal-title-icon"></i>
            <h3>{t("sendModal.title")}</h3>
          </div>
          <button className="recognition-modal-close" onClick={onClose} type="button" aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {errorMsg && <div className="recognition-alert error">{errorMsg}</div>}
        {successMsg && <div className="recognition-alert success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="recognition-form">
          {/* Select Colleague */}
          <div className="recognition-form-group">
            <label className="recognition-label">{t("sendModal.colleagueLabel")} *</label>
            <select
              className="recognition-select"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              disabled={loading || submitting}
              required
            >
              <option value="">{t("sendModal.colleaguePlaceholder")}</option>
              {colleagues.map((colleague) => (
                <option key={colleague.profile_id || colleague.user_id} value={colleague.profile_id}>
                  {colleague.full_name} {colleague.job_title ? `— ${colleague.job_title}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Badge Selection */}
          <div className="recognition-form-group">
            <label className="recognition-label">{t("sendModal.badgeLabel")}</label>
            <div className="recognition-badge-picker">
              {badgeOptions.map((badge) => (
                <button
                  key={badge.value}
                  type="button"
                  className={`badge-picker-btn ${badgeType === badge.value ? "active" : ""}`}
                  onClick={() => setBadgeType(badge.value)}
                >
                  <i className={`${badge.iconClass} badge-picker-icon`}></i>
                  <span className="badge-picker-text">{badge.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recognition Message */}
          <div className="recognition-form-group">
            <label className="recognition-label">{t("sendModal.messageLabel")} *</label>
            <textarea
              className="recognition-textarea"
              placeholder={t("sendModal.messagePlaceholder")}
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          {/* Public Feed Checkbox */}
          <div className="recognition-checkbox-group">
            <label className="recognition-checkbox-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={submitting}
              />
              <span>{t("sendModal.isPublicLabel")}</span>
            </label>
          </div>

          {/* Actions */}
          <div className="recognition-modal-actions">
            <button
              type="button"
              className="btn-recognition-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              {t("sendModal.cancel")}
            </button>
            <button
              type="submit"
              className="btn-recognition-submit"
              disabled={submitting || loading}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  {t("sendModal.sending")}
                </>
              ) : (
                <>
                  <i className="bi bi-send-fill me-1"></i>
                  {t("sendModal.submit")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}