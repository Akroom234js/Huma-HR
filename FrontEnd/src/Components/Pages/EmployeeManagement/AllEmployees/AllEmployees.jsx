// import React from 'react';
import "./AllEmployees.css";
import FilterDropdown from "../../Recrutment/FilterDropdown/FilterDropdown";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
// import { useTranslation } from "react-i18next";
import { useState } from "react";
const AllEmployees = () => {
  // const { t } = useTranslation("Sidebar/Sidebar");
  const [selectedDepartment1, setSelectedDepartment1] = useState("");
  const [Delete, setDelete] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit
  const departmentOptions = [
    // { value: '', label: t('departmentOptions.all') },
    { value: "", label: "Department" },
    { value: "engineering", label: "Engineering" },
    { value: "design", label: "Design" },
    { value: "product", label: "Product Management" },
    { value: "marketing", label: "Marketing" },
  ];
  const employees = [
    {
      name: "Olivia Rhye",
      id: "EMP-00123",
      department: "Engineering",
      job: "Frontend Developer",
      status: "Active",
      password: "123456",
      address: "New York",
      supervisor: "Phoenix Baker",
    },
    {
      name: "Phoenix Baker",
      id: "EMP-00124",
      department: "Design",
      job: "Product Designer",
      status: "Active",
      password: "123456",
      address: "New York",
      supervisor: "Phoenix Baker",
    },
    {
      name: "Lana Steiner",
      id: "EMP-00125",
      department: "Product",
      job: "Product Manager",
      status: "On Leave",
      password: "123456",
      address: "New York",
      supervisor: "Phoenix Baker",
    },
    {
      name: "Candice Wu",
      id: "EMP-00126",
      department: "Engineering",
      job: "Backend Developer",
      status: "Active",
      password: "123456",
      address: "New York",
      supervisor: "Phoenix Baker",
    },
  ];
  const [formData, setFormData] = useState({
    idNumber: "",
    fullName: "",
    password: "",
    address: "",
    department: "",
    role: "",
    supervisor: "",
  });

  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form Submitted:", formData);
      setIsModalOpen(false);
    }
  };
  const validateForm = () => {
    let newErrors = {};

    if (!formData.idNumber) newErrors.idNumber = "ID Number is required";
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.address) newErrors.address = "Address is required";

    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.supervisor)
      newErrors.supervisor = "Direct Supervisor is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  return (
    <div className="all-employees-page">
      <header className="page-header">
        <div className="header-info">
          <h1>Employee Profile Management</h1>
        </div>
        <ThemeToggle />
      </header>
      <div className="con-filter">
        <div className="all-filt">
          <input type="text" placeholder="  🔍 Search by name or ID ..." />
          <div className="con2-filter">
            <FilterDropdown
              value={selectedDepartment1}
              onChange={setSelectedDepartment1}
              options={departmentOptions}
            />
            <FilterDropdown
              value={selectedDepartment1}
              onChange={setSelectedDepartment1}
              options={departmentOptions}
            />
            <FilterDropdown
              value={selectedDepartment1}
              onChange={setSelectedDepartment1}
              options={departmentOptions}
            />
          </div>
        </div>
        <button
          onClick={() => {
            setMode("add");

            setFormData({
              idNumber: "",
              fullName: "",
              password: "",
              address: "",
              department: "",
              role: "",
              supervisor: "",
            });

            setErrors({});
            setIsModalOpen(true);
          }}
        >
          + Add New Employee
        </button>
      </div>
      <div className="table-container">
        {Delete && (
          <div className="poop_create">
            <h2>Are you sure you want to delete this employee?</h2>
            <div className="con_ptn1">
              <button onClick={() => setDelete(false)}>cancle</button>
              <button>confirm</button>
            </div>
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>EMPLOYEE NAME</th>
              <th>EMPLOYEE ID</th>
              <th>DEPARTMENT</th>
              <th>JOB TITLE</th>
              <th>EMPLOYMENT STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((e, index) => (
              <tr key={index}>
                <td className="emp-name">
                  <div className="avatar"></div>
                  {e.name}
                </td>

                <td>{e.id}</td>
                <td>{e.department}</td>
                <td>{e.job}</td>

                <td>
                  <span
                    className={`status ${e.status === "Active" ? "active" : "leave"}`}
                  >
                    {e.status}
                  </span>
                </td>

                <td className="actions">
                  <button onClick={() => setDelete(true)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <button
                    onClick={() => {
                      setMode("edit");
                      setFormData({
                        idNumber: e.id,
                        fullName: e.name,
                        password: e.password,
                        address: e.address,
                        department: e.department,
                        role: e.job,
                        supervisor: e.supervisor,
                      });
                      setErrors({});
                      setIsModalOpen(true);
                    }}
                  >
                    {" "}
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{mode === "add" ? "Add New Employee" : "Edit Employee"}</h2>
            <form className="modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="idNumber"
                placeholder="ID Number"
                value={formData.idNumber}
                onChange={handleChange}
              />
              {errors.idNumber && (
                <span className="error">{errors.idNumber}</span>
              )}

              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && (
                <span className="error">{errors.fullName}</span>
              )}

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
              />
              {errors.address && (
                <span className="error">{errors.address}</span>
              )}

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option>Engineering</option>
                <option>Design</option>
              </select>
              {errors.department && (
                <span className="error">{errors.department}</span>
              )}

              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="">Select Role</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
              </select>
              {errors.role && <span className="error">{errors.role}</span>}

              <select
                name="supervisor"
                value={formData.supervisor}
                onChange={handleChange}
              >
                <option value="">Select Direct Supervisor</option>
                <option>Olivia Rhye</option>
                <option>Phoenix Baker</option>
              </select>
              {errors.supervisor && (
                <span className="error">{errors.supervisor}</span>
              )}

              <div className="modal-buttons">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEmployees;
