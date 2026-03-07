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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  ];

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
            {/* <div className="head"> */}
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
        <button onClick={() => setIsModalOpen(true)}>+ Add New Employee</button>
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
                  <button>
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                  <button>
                    {" "}
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => console.log("Sending to Laravel:", data)}
      />
    </div>
  );
};

export default AllEmployees;