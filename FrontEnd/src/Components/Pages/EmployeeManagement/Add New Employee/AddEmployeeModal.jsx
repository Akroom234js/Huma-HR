import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./AddEmployeeModal.css";
import apiClient from "../../../../apiConfig";

const AddEmployeeModal = ({
  isOpen,
  onClose,
  onSave,
  editingEmployee,
  departmentOptions = [],
  positionOptions = [],
  managerOptions = [],
}) => {
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
    profilePicture: null,
  };

  const [formData, setFormData] = useState(emptyForm);
  const [previewImage, setPreviewImage] = useState(null);
  const [deptPositions, setDeptPositions] = useState([]);
  const [deptManagers, setDeptManagers] = useState([]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="aem-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="aem-container">
        {/* Header */}
        <div className="aem-header">
          <div className="aem-header-title">
            <span className="aem-breadcrumb">
              Employee Management &gt; {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </span>
            <h2>{editingEmployee ? "Edit Employee" : "Add New Employee"}</h2>
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
                  <h3>Personal Information</h3>
                  <p>Basic details and login credentials.</p>
                </div>
              </div>
              <div className="aem-grid">
                <div className="aem-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john.doe@company.com"
                    value={formData.email}
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>
                    Password
                    {editingEmployee && (
                      <span className="aem-label-hint">(اتركه فارغاً إذا لا تريد تغييره)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder={editingEmployee ? "••••••••" : "Huma@2024!"}
                    value={formData.password}
                    required={!editingEmployee}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field aem-full">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Street address, City, State, Zip"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 234 567 890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field aem-full">
                  <label>Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    placeholder="Name - Phone Number"
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
                  <h3>Employment &amp; Contract</h3>
                  <p>Role definition and organizational placement.</p>
                </div>
              </div>
              <div className="aem-grid">
                <div className="aem-field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
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
                  <label>Job Title</label>
                  <select
                    name="jobTitle"
                    value={formData.jobTitle}
                    required
                    onChange={handleChange}
                  >
                    <option value="">Select Position</option>
                    {shownPositions.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="aem-field">
                  <label>Direct Supervisor</label>
                  <select
                    name="directManager"
                    value={formData.directManager}
                    onChange={handleChange}
                  >
                    <option value="">Select Supervisor</option>
                    {shownManagers.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="aem-field">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    placeholder="Auto-generated if left blank"
                    value={formData.employeeId}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field">
                  <label>
                    Basic Salary
                    {selectedPosition && (
                      <span className="aem-salary-hint">
                        (Range: ${selectedPosition.min_salary} – ${selectedPosition.max_salary})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    name="basicSalary"
                    placeholder="Enter amount"
                    value={formData.basicSalary}
                    onChange={handleChange}
                  />
                </div>
                <div className="aem-field aem-full">
                  <label>Profile Picture</label>
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
            <button type="button" className="aem-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="aem-btn-save">
              <span className="material-symbols-outlined">check_circle</span>
              {editingEmployee ? "Update Employee" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddEmployeeModal;