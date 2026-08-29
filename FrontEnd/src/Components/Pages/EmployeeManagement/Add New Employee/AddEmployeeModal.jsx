import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./AddEmployeeModal.css";
import { useTranslation } from "react-i18next";
import apiClient from "../../../../apiConfig";
import DashboardLoader from "../../../Shared/DashboardLoader/DashboardLoader";

const AddEmployeeModal = ({
  isOpen,
  onClose,
  onSave,
  editingEmployee,
  departmentOptions = [],
  positionOptions = [],
  managerOptions = [],
}) => {
  const { t, i18n } = useTranslation("AllEmployees/AllEmployees");
  const isAr = i18n?.language === "ar";
  const emptyForm = {
    email: "",
    password: "",
    fullName: "",
    phone: "",
    dob: "",
    address: "",
    emergencyContact: "",
    employeeId: "",
    jobTitle: "",
    department: "",
    joiningDate: "",
    basicSalary: "",
    directManager: "",
    employmentStatus: "active",
    profilePicture: null,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [previewImage, setPreviewImage] = useState(null);
  const [deptPositions, setDeptPositions] = useState([]);
  const [deptManagers, setDeptManagers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or editingEmployee changes
  useEffect(() => {
    if (!isOpen) return;
    if (editingEmployee) {
      setFormData({
        email: editingEmployee.email || "",
        password: "",
        fullName: editingEmployee.fullName || editingEmployee.name || "",
        phone: editingEmployee.phone || "",
        dob: editingEmployee.dob || "",
        address: editingEmployee.address || "",
        emergencyContact: editingEmployee.emergencyContact || "",
        employeeId: editingEmployee.employeeId || "",
        jobTitle: editingEmployee.jobTitle || editingEmployee.job || "",
        department: editingEmployee.department || "",
        joiningDate: editingEmployee.joiningDate || "",
        basicSalary: editingEmployee.basicSalary || "",
        directManager: editingEmployee.directManager || "",
        employmentStatus: editingEmployee.employmentStatus || editingEmployee.employment_status || "active",
        profilePicture: null,
      });
      setPreviewImage(editingEmployee.profilePicUrl || null);
    } else {
      setFormData(emptyForm);
      setPreviewImage(null);
    }
    setDeptPositions([]);
    setDeptManagers([]);
  }, [isOpen, editingEmployee]);

  // Fetch positions/managers for selected department
  useEffect(() => {
    if (!isOpen || !formData.department) return;
    let active = true;
    apiClient
      .get(`/positions?department_id=${formData.department}&per_page=100`)
      .then((res) => {
        if (!active) return;
        setDeptPositions(
          res.data?.data?.positions?.map((p) => ({
            value: p.id,
            label: p.title,
            min_salary: p.min_salary,
            max_salary: p.max_salary,
          })) || []
        );
      })
      .catch(() => {});
    apiClient
      .get(`/employees/managers?department_id=${formData.department}`)
      .then((res) => {
        if (!active) return;
        setDeptManagers(
          res.data?.data?.map((m) => ({ value: m.id, label: m.full_name })) ||
            []
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [formData.department, isOpen]);

  if (!isOpen) return null;

  const shownPositions =
    formData.department && deptPositions.length > 0
      ? deptPositions
      : positionOptions.filter((p) => p.value);

  const shownManagers =
    formData.department && deptManagers.length > 0
      ? deptManagers
      : managerOptions.filter((m) => m.value);

  const selectedPosition = shownPositions.find(
    (p) => String(p.value) === String(formData.jobTitle)
  );

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error("Failed to save employee", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className={`aem-overlay ${isAr ? 'rtl' : 'ltr'}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="aem-container">
        {/* Header */}
        <div className="aem-header">
          <div className="aem-header-title">
            <span className="aem-breadcrumb">
              {t('modal-breadcrumb')} &gt; {editingEmployee ? t('modal-edit-title') : t('modal-add-title')}
            </span>
            <h2>{editingEmployee ? t('modal-edit-title') : t('modal-add-title')}</h2>
          </div>
          <button type="button" className="aem-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="aem-form">
          <div className="aem-scroll-area">

            {/* --- Section 1: Personal Info --- */}
            <div className="aem-section">
              <div className="aem-section-header">
                <span className="material-symbols-outlined">person</span>
                <div>
                  <h3>{t('sec-personal-title')}</h3>
                  <p>{t('sec-personal-desc')}</p>
                </div>
              </div>
              <div className="aem-grid">
                <div className="aem-field">
                  <label>{t('field-fullname')}</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder={t('placeholder-fullname')}
                    value={formData.fullName}
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>{t('field-email')}</label>
                  <input
                    type="email"
                    name="email"
                    placeholder={t('placeholder-email')}
                    value={formData.email}
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>
                    {t('field-password')}
                    {editingEmployee && (
                      <span className="aem-label-hint">{isAr ? " (اتركه فارغاً إذا لا تريد تغييره)" : " (Leave blank to keep unchanged)"}</span>
                    )}
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder={editingEmployee ? "••••••••" : "••••••••"}
                    value={formData.password}
                    required={!editingEmployee}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field aem-full">
                  <label>{t('field-address')}</label>
                  <input
                    type="text"
                    name="address"
                    placeholder={t('placeholder-address')}
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>{t('field-phone')}</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder={t('placeholder-phone')}
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>{t('field-dob')}</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field aem-full">
                  <label>{t('field-emergency')}</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    placeholder={t('placeholder-emergency')}
                    value={formData.emergencyContact}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* --- Section 2: Employment --- */}
            <div className="aem-section">
              <div className="aem-section-header">
                <span className="material-symbols-outlined">badge</span>
                <div>
                  <h3>{t('sec-employment-title')}</h3>
                  <p>{t('sec-employment-desc')}</p>
                </div>
              </div>
              <div className="aem-grid">
                <div className="aem-field">
                  <label>{t('field-joining-date')}</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>{t('field-department')}</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">{t('placeholder-select-dept')}</option>
                    {departmentOptions
                      .filter((d) => d.value)
                      .map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="aem-field">
                  <label>{t('field-job-title')}</label>
                  <select
                    name="jobTitle"
                    value={formData.jobTitle}
                    required
                    onChange={handleChange}
                  >
                    <option value="">{t('placeholder-select-pos')}</option>
                    {shownPositions.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="aem-field">
                  <label>{t('field-supervisor')}</label>
                  <select
                    name="directManager"
                    value={formData.directManager}
                    onChange={handleChange}
                  >
                    <option value="">{t('placeholder-select-manager')}</option>
                    {shownManagers.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="aem-field">
                  <label>{t('field-employee-id')}</label>
                  <input
                    type="text"
                    name="employeeId"
                    placeholder={t('placeholder-employee-id')}
                    value={formData.employeeId}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>
                    {t('field-salary')}
                    {selectedPosition && (
                      <span className="aem-salary-hint">
                        ({isAr ? "النطاق:" : "Range:"} ${selectedPosition.min_salary} – ${selectedPosition.max_salary})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    name="basicSalary"
                    placeholder={t('placeholder-salary')}
                    value={formData.basicSalary}
                    onChange={handleChange}
                  />
                </div>

                {/* Employment Status Slider */}
                <div className="aem-field aem-full">
                  <div className="aem-status-header">
                    <span className="aem-status-title">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>badge</span>
                      {t('field-status')}
                    </span>
                    <span className={`aem-status-badge ${formData.employmentStatus || 'active'}`}>
                      {t(`status-${formData.employmentStatus || 'active'}`)}
                    </span>
                  </div>

                  <div className="aem-status-slider-track" role="radiogroup" aria-label="Employment Status">
                    {[
                      { id: 'active', label: t('status-active'), icon: 'check_circle' },
                      { id: 'on_leave', label: t('status-on_leave'), icon: 'flight_takeoff' },
                      { id: 'inactive', label: t('status-inactive'), icon: 'pause_circle' },
                      { id: 'terminated', label: t('status-terminated'), icon: 'cancel' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        className={`aem-status-slider-btn ${formData.employmentStatus === st.id ? `active ${st.id}-status` : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, employmentStatus: st.id }))}
                      >
                        <span className="material-symbols-outlined">{st.icon}</span>
                        <span>{st.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="aem-field aem-full">
                  <label>{t('field-profile-pic')}</label>
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="aem-preview-img"
                    />
                  )}
                  <input
                    type="file"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="aem-footer">
            <button type="button" className="aem-btn-cancel" onClick={onClose} disabled={isSubmitting}>
              {t('btn-cancel')}
            </button>
            <button type="submit" className="aem-btn-save" disabled={isSubmitting}>
              {isSubmitting ? (
                <DashboardLoader size="xs" inline />
              ) : (
                <span className="material-symbols-outlined">check_circle</span>
              )}
              {editingEmployee ? t('btn-save-update') : t('btn-save-create')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddEmployeeModal;