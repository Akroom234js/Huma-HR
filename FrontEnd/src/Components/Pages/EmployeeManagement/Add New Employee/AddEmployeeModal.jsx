import React, { useState, useEffect } from "react";
import "./AddEmployeeModal.css";
import apiClient from "../../../../apiConfig";

const AddEmployeeModal = ({ isOpen, onClose, onSave, editingEmployee, departmentOptions, positionOptions, managerOptions }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    // تم حذف idNumber من هنا
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
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    if (!formData.department) {
      setFilteredPositions(positionOptions || []);
      setFilteredManagers(managerOptions || []);
      return;
    }

    let isMounted = true;

    // Fetch positions for the selected department
    apiClient.get(`/positions?department_id=${formData.department}&per_page=100`)
      .then(res => {
        if (!isMounted) return;
        const fetchedPositions = [
          { value: "", label: "Select Position" },
          ...(res.data?.data?.positions?.map(p => ({
            value: p.id,
            label: p.title,
            min_salary: p.min_salary,
            max_salary: p.max_salary,
            tax_percent: p.tax_percent,
            allowances: p.allowances,
            insurance_amount: p.insurance_amount
          })) || [])
        ];
        setFilteredPositions(fetchedPositions);

        // Clear job title if it is no longer valid in the restricted list
        setFormData(prev => {
          const isValid = fetchedPositions.some(pos => pos.value == prev.jobTitle);
          if (!isValid && prev.jobTitle !== "") {
            return { ...prev, jobTitle: "" };
          }
          return prev;
        });
      })
      .catch(err => console.error("Failed to fetch positions for department", err));

    // Fetch managers/employees for the selected department
    apiClient.get(`/employees/managers?department_id=${formData.department}`)
      .then(res => {
        if (!isMounted) return;
        const fetchedManagers = [
          { value: "", label: "Select Supervisor" },
          ...(res.data?.data?.map(m => ({ value: m.id, label: m.full_name })) || [])
        ];
        setFilteredManagers(fetchedManagers);

        // Clear direct supervisor if they are no longer valid in the restricted list
        setFormData(prev => {
          const isValid = fetchedManagers.some(m => m.value == prev.directManager);
          if (!isValid && prev.directManager !== "") {
            return { ...prev, directManager: "" };
          }
          return prev;
        });
      })
      .catch(err => console.error("Failed to fetch managers for department", err));

    return () => {
      isMounted = false;
    };
  }, [formData.department, isOpen, positionOptions, managerOptions]);

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        email: editingEmployee.email || "",
        password: "",
        fullName: editingEmployee.fullName || editingEmployee.name || "",
        // تم حذف idNumber من هنا أيضاً
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
      // عرض الصورة الحالية إن وجدت
      setPreviewImage(editingEmployee.profilePicUrl || null);
    } else {
      setFormData({
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
      });
      setPreviewImage(null);
    }
  }, [editingEmployee, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      // معاينة الصورة الجديدة
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="header-title">
            <span>
              Employee Management / {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </span>
            <h2>{editingEmployee ? "Edit Employee" : "Add New Employee"}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-scroll-area">

            {/* Section 1: Personal Information */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="section-text">
                  <h3>Personal Information</h3>
                  <p>Basic details and login credentials.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group">
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

                {/* تم حذف حقل الـ National ID من هنا */}

                <div className="input-group">
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
                <div className="input-group">
                  <label>
                    Password
                    {editingEmployee && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginInlineStart: '6px' }}>
                        (اتركه فارغاً إذا لا تريد تغييره)
                      </span>
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
                <div className="input-group full-width">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Street address, City, State, Zip"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 234 567 890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group full-width">
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

            {/* Section 2: Employment & Contract */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-icon">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div className="section-text">
                  <h3>Employment & Contract</h3>
                  <p>Role definition and organizational placement.</p>
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    required
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>Job Title</label>
                  <select
                    name="jobTitle"
                    value={formData.jobTitle}
                    required
                    onChange={handleChange}
                  >
                    <option value="">Select Position</option>
                    {filteredPositions && filteredPositions.map(pos => (
                      pos.value && (
                        <option key={pos.value} value={pos.value}>
                          {pos.label}
                        </option>
                      )
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    {departmentOptions && departmentOptions.map(dept => (
                      dept.value && (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      )
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Direct Supervisor</label>
                  <select
                    name="directManager"
                    value={formData.directManager}
                    onChange={handleChange}
                  >
                    <option value="">Select Supervisor</option>
                    {filteredManagers && filteredManagers.map(m => (
                      m.value && (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      )
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    placeholder="Auto-generated if left blank"
                    value={formData.employeeId}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label>
                    Basic Salary
                    {(() => {
                      const selectedPosition = filteredPositions?.find(p => p.value == formData.jobTitle);
                      if (selectedPosition && selectedPosition.value) {
                        return (
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 500, marginInlineStart: '6px' }}>
                            (Range: ${selectedPosition.min_salary} - ${selectedPosition.max_salary})
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </label>
                  <input
                    type="number"
                    name="basicSalary"
                    placeholder="Enter amount"
                    value={formData.basicSalary}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group full-width">
                  <label>Profile Picture</label>
                  {previewImage && (
                    <div style={{ marginBottom: '8px' }}>
                      <img
                        src={previewImage}
                        alt="Profile Preview"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--primary-color)'
                        }}
                      />
                    </div>
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

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <span className="material-symbols-outlined">check_circle</span>
              {editingEmployee ? "Update Employee" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;