// import React from 'react';
import "./AllEmployees.css";
import FilterDropdown from "../../Recrutment/FilterDropdown/FilterDropdown";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
// import { useTranslation } from "react-i18next";
import { useState } from "react";
import AddEmployeeModal from "../Add New Employee/AddEmployeeModal";
const AllEmployees = () => {
  // const { t } = useTranslation("Sidebar/Sidebar");
  const [selectedDepartment1, setSelectedDepartment1] = useState("");
  const [EmpStatus, setEmpStatus] = useState("");
  const [EmpPosition, setEmpPosition] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employees, setEmployees] = useState([
    {
      name: "Olivia Rhye",
      id: "EMP-00123",
      department: "Engineering",
      job: "Frontend Developer",
      status: "Active",
    },
    {
      name: "Phoenix Baker",
      id: "EMP-00124",
      department: "Design",
      job: "Product Designer",
      status: "Active",
    },
    {
      name: "Lana Steiner",
      id: "EMP-00125",
      department: "Product",
      job: "Product Manager",
      status: "On Leave",
    },
    {
      name: "Candice Wu",
      id: "EMP-00126",
      department: "Engineering",
      job: "Backend Developer",
      status: "Active",
    },
  ]);
  const departmentOptions = [
    // { value: '', label: t('departmentOptions.all') },
    { value: "", label: "Department" },
    { value: "engineering", label: "Engineering" },
    { value: "design", label: "Design" },
    { value: "product", label: "Product Management" },
    { value: "marketing", label: "Marketing" },
  ];
  const StatusOptions = [
    { value: "", label: "Status" },
    { value: "New", label: "New" },
    { value: "Active", label: "Active" },
    { value: "Leave", label: "On Leave" },
  ];
  const positionOptions = [
    { value: "", label: "Positin" },
    { value: "Junior", label: "Junior" },
    { value: "Senior", label: "Senior" },
    { value: "Expert", label: " Expert" },
  ];
  function handleDeleteEmployee(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?",
    );
    if (confirmDelete) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  }

  function handleOpenEdit(employee) {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  }
  function handleSaveEmployee(data) {
    if (editingEmployee) {
      // for edite employee
      setEmployees(
        employees.map((emp) =>
          emp.id === editingEmployee.id
            ? {
                ...emp,
                name: data.fullName,
                id: data.employeeId,
                department: data.department,
                job: data.jobTitle,
              }
            : emp,
        ),
      );
    } else {
      // for add employee
      const newEmployee = {
        name: data.fullName,
        id: data.employeeId,
        department: data.department,
        job: data.jobTitle,
        status: "Active",
      };

      setEmployees([newEmployee, ...employees]);
    }

    setIsModalOpen(false);
    setEditingEmployee(null);
  }
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
      />
    </div>
  );
};

export default AllEmployees;
