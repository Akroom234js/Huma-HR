import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiClient, { STORAGE_BASE_URL } from "../../../../apiConfig";
import "./Profile.css";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";

const Profile = () => {
  const { t, i18n } = useTranslation("EmployeePortal/Profile");
  const isRtl = i18n.language === "ar";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form fields for editing
  const [formData, setFormData] = useState({
    phone_number: "",
    address: "",
    marital_status: "",
    emergency_contacts: "",
  });

  // Helper to synchronize local storage user object with updated profile data
  const syncUserStorage = (data) => {
    if (!data) return;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userObj.full_name = data.full_name;
        userObj.profile_pic = data.profile_pic;
        userObj.profile_picture = data.profile_pic;
        localStorage.setItem('user', JSON.stringify(userObj));
        // Trigger storage event to notify other components (like navbar in Home.jsx) to re-render
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('local-storage-update'));
      } catch (err) {
        console.error("Error syncing user storage:", err);
      } 
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.get("/my-profile");
      const data = response.data?.data;
      setProfile(data);
      if (data) {
        syncUserStorage(data);
        setFormData({
          phone_number: data.phone_number || "",
          address: data.address || "",
          marital_status: data.marital_status || "single",
          emergency_contacts: data.emergency_contacts || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(t("alerts.loadError") || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      const response = await apiClient.put("/my-profile", formData);
      const data = response.data?.data;
      setProfile(data);
      syncUserStorage(data);
      setEditMode(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(t("alerts.saveError") || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("profile_pic", file);
    // _method MUST be in FormData body (not query params) for Laravel method spoofing with multipart
    uploadData.append("_method", "PUT");

    // Include current form fields to avoid validation errors
    uploadData.append("phone_number", formData.phone_number);
    uploadData.append("address", formData.address);
    uploadData.append("marital_status", formData.marital_status);
    uploadData.append("emergency_contacts", formData.emergency_contacts);

    try {
      setSaving(true);
      const response = await apiClient.post("/my-profile", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = response.data?.data;
      setProfile(data);
      syncUserStorage(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Error uploading picture:", err);
      alert(t("alerts.saveError") || "Failed to upload photo.");
    } finally {
      setSaving(false);
    }
  };

  // Build the full URL for a profile picture path returned from backend
  const getProfilePicUrl = (picPath) => {
    if (!picPath) return null;
    let url = picPath;
    if (!url.startsWith('http')) {
      url = `${STORAGE_BASE_URL}/${url}`;
    }
    // If the backend returned a localhost address but we are hosted globally, replace it dynamically
    const backendRoot = STORAGE_BASE_URL.replace('/storage', '');
    url = url.replace('http://127.0.0.1:8000', backendRoot)
             .replace('http://localhost:8000', backendRoot)
             .replace('http://localhost', backendRoot);
    return url;
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error-container">
        <span className="material-symbols-outlined error-icon">error</span>
        <p className="error-message">{error}</p>
        <button className="retry-btn" onClick={fetchProfile}>
          Retry
        </button>
      </div>
    );
  }

  // Get initials for profile fallback
  const getInitials = (name) => {
    if (!name) return "HR";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat(i18n.language === "ar" ? "ar-SA" : "en-US", {
      style: "currency",
      currency: "SAR",
    }).format(val);
  };

  return (
    <div className={`profile-page ${isRtl ? "rtl" : "ltr"}`}>
      <div className="profile-header-section">
        <h1 className="page-title">{t("title")}</h1>
         <div className="sm-theme-toggle-wrapper">
        <ThemeToggle />
      </div>
        {saveSuccess && (
          <div className="success-toast">
            <span className="material-symbols-outlined">check_circle</span>
            <p>{t("alerts.saveSuccess")}</p>
          </div>
        )}
      </div>

      <div className="profile-grid">
        {/* Left Column: Summary Card */}
        <div className="profile-card glassmorphic">
          <div className="avatar-container">
            <div className="avatar-wrapper">
              {profile?.profile_pic ? (
                <img
                  src={`${getProfilePicUrl(profile.profile_pic)}?t=${Date.now()}`}
                  alt={profile.full_name}
                  className="avatar-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="avatar-fallback"
                style={{ display: profile?.profile_pic ? 'none' : 'flex' }}
              >
                {getInitials(profile?.full_name)}
              </div>
            </div>
            <label className="avatar-upload-label" htmlFor="avatar-file-input">
              <span className="material-symbols-outlined camera-icon">
                photo_camera
              </span>
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <h3 className="employee-name">{profile?.full_name}</h3>
          <p className="role">{profile?.job_title || "-"}</p>
          <span className="department-badge">
            {profile?.department?.name || "-"}
          </span>

          <div className="status-badge-container">
            <span className={`status-dot ${profile?.employment_status || "active"}`}></span>
            <span className="status-text">
              {t(`fields.${profile?.employment_status || "active"}`)}
            </span>
          </div>

          <div className="action-buttons-group">
            <button
              className={`action-btn edit-btn ${editMode ? "cancel" : "primary"}`}
              onClick={() => {
                if (editMode) {
                  // Reset form fields
                  setFormData({
                    phone_number: profile?.phone_number || "",
                    address: profile?.address || "",
                    marital_status: profile?.marital_status || "single",
                    emergency_contacts: profile?.emergency_contacts || "",
                  });
                }
                setEditMode(!editMode);
              }}
            >
              <span className="material-symbols-outlined btn-icon">
                {editMode ? "close" : "edit"}
              </span>
              {editMode ? t("buttons.cancel") : t("buttons.edit")}
            </button>
          </div>
        </div>

        {/* Right Column: Tabbed Details Card */}
        <div className="info-card glassmorphic">
          {/* Tab Navigation */}
          <div className="tabs-nav-bar">
            {Object.keys(t("tabs", { returnObjects: true })).map((tabKey) => (
              <button
                key={tabKey}
                className={`tab-link-btn ${activeTab === tabKey ? "active" : ""}`}
                onClick={() => setActiveTab(tabKey)}
              >
                {t(`tabs.${tabKey}`)}
              </button>
            ))}
          </div>

          <div className="tab-content-container">
            {editMode ? (
              <form onSubmit={handleSave} className="edit-profile-form">
                <div className="form-fields-grid">
                  <div className="form-group full-width">
                    <label>{t("fields.fullName")}</label>
                    <p className="disabled-text-val">{profile?.full_name}</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="marital_status">{t("fields.maritalStatus")}</label>
                    <select
                      id="marital_status"
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleInputChange}
                      className="form-select-input"
                    >
                      <option value="single">{t("fields.single")}</option>
                      <option value="married">{t("fields.married")}</option>
                      <option value="divorced">{t("fields.divorced")}</option>
                      <option value="widowed">{t("fields.widowed")}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone_number">{t("fields.phone")}</label>
                    <input
                      id="phone_number"
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder={t("placeholders.phone")}
                      className="form-text-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">{t("fields.address")}</label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={t("placeholders.address")}
                      className="form-text-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="emergency_contacts">
                      {t("fields.emergencyContacts")}
                    </label>
                    <textarea
                      id="emergency_contacts"
                      name="emergency_contacts"
                      rows="4"
                      value={formData.emergency_contacts}
                      onChange={handleInputChange}
                      placeholder={t("placeholders.emergency")}
                      className="form-textarea-input"
                    ></textarea>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={saving}
                  >
                    <span className="material-symbols-outlined btn-icon">
                      {saving ? "sync" : "save"}
                    </span>
                    {saving ? t("buttons.saving") : t("buttons.save")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="view-profile-details">
                {/* 1. PERSONAL INFO TAB */}
                {activeTab === "personal" && (
                  <div className="info-fields-grid fade-in">
                    <div className="detail-field">
                      <label>{t("fields.fullName")}</label>
                      <p>{profile?.full_name || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.email")}</label>
                      <p className="email-link">{profile?.email || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.phone")}</label>
                      <p>{profile?.phone_number || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.dob")}</label>
                      <p>{profile?.date_of_birth || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.maritalStatus")}</label>
                      <p>{t(`fields.${profile?.marital_status || "single"}`)}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.address")}</label>
                      <p>{profile?.address || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.city")}</label>
                      <p>{profile?.city || "-"}</p>
                    </div>
                  </div>
                )}

                {/* 2. JOB DETAILS TAB */}
                {activeTab === "job" && (
                  <div className="info-fields-grid fade-in">
                    <div className="detail-field">
                      <label>{t("fields.employeeId")}</label>
                      <p className="emp-id-badge">{profile?.employee_id || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.jobTitle")}</label>
                      <p>{profile?.job_title || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.department")}</label>
                      <p>{profile?.department?.name || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.startDate")}</label>
                      <p>{profile?.start_date || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.branch")}</label>
                      <p>{profile?.branch || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.grade")}</label>
                      <p className="grade-badge">{profile?.grade || "-"}</p>
                    </div>

                    <div className="detail-field">
                      <label>{t("fields.manager")}</label>
                      {profile?.manager ? (
                        <div className="manager-badge">
                          <span className="material-symbols-outlined">
                            account_circle
                          </span>
                          <p>{profile.manager.full_name}</p>
                        </div>
                      ) : (
                        <p>-</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. FINANCIAL DETAILS TAB */}
                {activeTab === "financial" && (
                  <div className="info-fields-grid financial-tab fade-in">
                    <div className="detail-field financial-card highlight">
                      <label>{t("fields.salary")}</label>
                      <p className="salary-amount">
                        {formatCurrency(profile?.salary)}
                      </p>
                    </div>

                    <div className="detail-field financial-card">
                      <label>{t("fields.allowances")}</label>
                      <p>{formatCurrency(profile?.allowances)}</p>
                    </div>

                    <div className="detail-field financial-card">
                      <label>{t("fields.taxPercent")}</label>
                      <p className="tax-value">
                        {profile?.tax_percent ? `${profile.tax_percent}%` : "-"}
                      </p>
                    </div>

                    <div className="detail-field financial-card">
                      <label>{t("fields.insurance")}</label>
                      <p>{formatCurrency(profile?.insurance_amount)}</p>
                    </div>
                  </div>
                )}

                {/* 4. EMERGENCY CONTACTS TAB */}
                {activeTab === "emergency" && (
                  <div className="emergency-contacts-view fade-in">
                    <h3 className="section-subtitle">
                      {t("fields.emergencyContacts")}
                    </h3>
                    {profile?.emergency_contacts ? (
                      <div className="emergency-contact-box">
                        <span className="material-symbols-outlined contact-box-icon">
                          contact_phone
                        </span>
                        <p className="emergency-contacts-text">
                          {profile.emergency_contacts}
                        </p>
                      </div>
                    ) : (
                      <div className="no-data-alert">
                        <span className="material-symbols-outlined">info</span>
                        <p>{t("fields.noEmergency")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
