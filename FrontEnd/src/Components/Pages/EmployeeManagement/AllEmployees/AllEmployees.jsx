// import React from 'react';
import "./AllEmployees.css";
import FilterDropdown from "../../../FilterDropdown/FilterDropdown";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import AddEmployeeModal from "../Add New Employee/AddEmployeeModal";
import apiClient from "../../../../apiConfig";

const AllEmployees = () => {
  const { t } = useTranslation("Sidebar/Sidebar");
  const [selectedDepartment1, setSelectedDepartment1] = useState("");
  const [EmpStatus, setEmpStatus] = useState("");
  const [EmpPosition, setEmpPosition] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([{ value: "", label: "Department" }]);
  const [StatusOptions, setStatusOptions] = useState([{ value: "", label: "Status" }]);
  const [positionOptions, setPositionOptions] = useState([{ value: "", label: "Position" }]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFilters = async () => {
    try {
      const [deptRes, statsRes, posRes] = await Promise.all([
        apiClient.get('/departments'),
        apiClient.get('/employees/statuses'),
        apiClient.get('/positions') // Updated from /employees/positions
      ]);

      setDepartmentOptions([
        { value: "", label: "Department" },
        ...(deptRes.data?.data?.map(d => ({ value: d.id, label: d.name })) || [])
      ]);

      setStatusOptions([
        { value: "", label: "Status" },
        ...(statsRes.data?.data?.map(s => ({ value: s, label: s })) || [])
      ]);

      setPositionOptions([
        { value: "", label: "Position" },
        ...(posRes.data?.data?.positions?.map(p => ({ value: p.title, label: p.title })) || [])
      ]);
    } catch (error) {
      console.error("Failed to fetch filters", error);
    }
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedDepartment1) params.department_id = selectedDepartment1;
      if (EmpStatus) params.status = EmpStatus;
      if (EmpPosition) params.job_title = EmpPosition;

      const res = await apiClient.get('/employees', { params });
      setEmployees(res.data?.data?.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  }, [searchQuery, selectedDepartment1, EmpStatus, EmpPosition]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  async function handleDeleteEmployee(id) {
    const confirmDelete = window.confirm("Are you sure you want to delete this employee?");
    if (confirmDelete) {
      try {
        await apiClient.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (error) {
        console.error("Failed to delete employee", error);
        alert("Error deleting employee");
      }
    }
  }

  function handleOpenEdit(employee) {
    setEditingEmployee({
      ...employee,
      id: employee.id,
      employeeId: employee.employee_id,
      name: employee.full_name,
      job: employee.job_title,
      department: employee.department?.id || employee.department,
      status: employee.employment_status,
      dob: employee.date_of_birth,
      phone: employee.phone_number,
      address: employee.address,
      emergencyContact: employee.emergency_contacts,
      jobTitle: employee.job_title,
      joiningDate: employee.start_date,
      basicSalary: employee.basic_salary,
    });
    setIsModalOpen(true);
  }

  async function handleSaveEmployee(data) {
    try {
      const formData = new FormData();
      if (data.fullName) formData.append("full_name", data.fullName);
      if (data.email) formData.append("email", data.email);
      if (data.password) {
        formData.append("password", data.password);
        formData.append("password_confirmation", data.password); // Backend requires password_confirmation
      }
      if (data.idNumber) formData.append("employee_id", data.idNumber);
      if (data.phone) formData.append("phone_number", data.phone);
      if (data.dob) formData.append("date_of_birth", data.dob);
      if (data.address) formData.append("address", data.address);
      if (data.emergencyContact) formData.append("emergency_contacts", data.emergencyContact);
      if (data.jobTitle) formData.append("job_title", data.jobTitle);
      if (data.department) formData.append("department_id", data.department);
      if (data.joiningDate) formData.append("start_date", data.joiningDate);
      if (data.profilePicture) formData.append("profile_pic", data.profilePicture);
      
      // manager_id expects an integer user ID. If the frontend only has a string search input, we should only append it if it's a valid ID to prevent validation crashes.
      if (data.directManager && !isNaN(data.directManager)) {
          formData.append("manager_id", data.directManager);
      }
      if (data.basicSalary) formData.append("basic_salary", data.basicSalary);

      formData.append("employment_status", "active"); // default

      if (editingEmployee) {
        formData.append("_method", "PUT");
        await apiClient.post(`/employees/${editingEmployee.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await apiClient.post(`/auth/employees`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      console.error("Failed to save employee", error);
      if (error.response?.data?.errors) {
         const errorMsgs = Object.values(error.response.data.errors).flat().join('\n');
         alert("Validation Error:\n" + errorMsgs);
      } else {
         alert("Error saving employee.");
      }
    }
  }
  return (
    <div className="all-employees-page">
      <header className="page-header">
        <div className="header-info">
          <h1>Employee Profile Management</h1>
        </div>
        <div className="sm-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </header>
      <div className="con-filter">
        <div className="all-filt">
          <input
            type="text"
            placeholder="  🔍 Search by name or ID ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="con2-filter">
            <FilterDropdown
              value={selectedDepartment1}
              onChange={setSelectedDepartment1}
              options={departmentOptions}
              placeholder="Department"
            />
            <FilterDropdown
              value={EmpStatus}
              onChange={setEmpStatus}
              options={StatusOptions}
            />
            <FilterDropdown
              value={EmpPosition}
              onChange={setEmpPosition}
              options={positionOptions}
            />
          </div>
        </div>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
        >
          + Add New Employee
        </button>
      </div>
      <div className="table-container">
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
            {employees.map((e) => (
              <tr key={e.id}>
                <td className="emp-name">
                  <div className="avatar">
                    {e.profile_pic && <img src={e.profile_pic} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />}
                  </div>
                  {e.full_name}
                </td>

                <td>{e.employee_id}</td>
                <td>{e.department?.name || e.department}</td>
                <td>{e.job_title}</td>

                <td>
                  <span
                    className={`status ${e.employment_status?.toLowerCase() === "active" ? "active" : "leave"}`}
                  >
                    {e.employment_status || "Active"}
                  </span>
                </td>

                <td className="actions">
                  <button onClick={() => handleDeleteEmployee(e.id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                  <button onClick={() => handleOpenEdit(e)}>
                    {" "}
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        editingEmployee={editingEmployee}
        departmentOptions={departmentOptions}
      />
    </div>
  );
};

export default AllEmployees;
