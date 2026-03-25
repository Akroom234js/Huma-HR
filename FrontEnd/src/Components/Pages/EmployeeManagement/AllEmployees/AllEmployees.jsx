import { useState, useEffect, useCallback } from "react";
import "./AllEmployees.css";
import FilterDropdown from "../../Recrutment/FilterDropdown/FilterDropdown";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import AddEmployeeModal from "../Add New Employee/AddEmployeeModal";
import apiClient from "../../../../apiConfig";

const AllEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [empStatus, setEmpStatus] = useState("");
  const [empPosition, setEmpPosition] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Fetch employees from backend
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        status: empStatus,
        job_title: empPosition,
      };

      // Only add department_id if it's a numeric value from the dropdown
      if (selectedDepartment) {
        params.department_id = selectedDepartment;
      }

      const response = await apiClient.get("/employees", { params });
      if (response.data.status === "success") {
        setEmployees(response.data.data.employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, empStatus, empPosition, selectedDepartment]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const departmentOptions = [
    { value: "", label: "Department" },
    { value: "1", label: "Engineering" },
    { value: "2", label: "Design" },
    { value: "3", label: "Marketing" },
    { value: "4", label: "HR" },
  ];

  const statusOptions = [
    { value: "", label: "Status" },
    { value: "active", label: "Active" },
    { value: "on_leave", label: "On Leave" },
    { value: "terminated", label: "Terminated" },
  ];

  const positionOptions = [
    { value: "", label: "Position" },
    { value: "Junior", label: "Junior" },
    { value: "Senior", label: "Senior" },
    { value: "Expert", label: "Expert" },
  ];

  async function handleDeleteEmployee(id) {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await apiClient.delete(`/employees/${id}`);
        fetchEmployees(); // Refresh list
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee.");
      }
    }
  }

  function handleOpenEdit(employee) {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  }

  async function handleSaveEmployee(data) {
    const formData = new FormData();
    // Base mapping
    formData.append("full_name", data.fullName);
    formData.append("email", data.email);
    formData.append("employee_id", data.employeeId);
    formData.append("job_title", data.jobTitle);
    formData.append("department_id", 1); // Mocked department ID for now
    formData.append("phone_number", data.phone);
    formData.append("address", data.address);
    formData.append("date_of_birth", data.dob);
    formData.append("emergency_contacts", data.emergencyContact);
    formData.append("start_date", data.joiningDate);
    
    // Add password for new accounts
    if (!editingEmployee) {
      formData.append("password", data.password);
      formData.append("password_confirmation", data.password);
    }

    if (data.profilePicture) {
      formData.append("profile_pic", data.profilePicture);
    }

    try {
      if (editingEmployee) {
        // Use POST with _method=PUT for multipart/form-data compatibility in Laravel
        formData.append("_method", "PUT");
        await apiClient.post(`/employees/${editingEmployee.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Employee updated successfully!");
      } else {
        await apiClient.post("/auth/employees", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Employee created successfully!");
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees(); // Refresh the dynamic table
    } catch (error) {
      console.error("Error saving employee:", error);
      const msg = error.response?.data?.message || "Operation failed.";
      alert(msg);
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
            placeholder=" 🔍 Search by name or ID ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="con2-filter">
            <FilterDropdown
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              options={departmentOptions}
            />
            <FilterDropdown
              value={empStatus}
              onChange={setEmpStatus}
              options={statusOptions}
            />
            <FilterDropdown
              value={empPosition}
              onChange={setEmpPosition}
              options={positionOptions}
            />
          </div>
        </div>
        <button onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}>
          + Add New Employee
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading employees...</div>
        ) : (
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
              {employees.length > 0 ? (
                employees.map((e) => (
                  <tr key={e.id}>
                    <td className="emp-name">
                      <div 
                        className="avatar" 
                        style={{ backgroundImage: e.profile_pic ? `url(${e.profile_pic})` : '' }}
                      ></div>
                      {e.full_name}
                    </td>
                    <td>{e.employee_id}</td>
                    <td>{e.department}</td>
                    <td>{e.job_title}</td>
                    <td>
                      <span className={`status ${e.employment_status === "active" ? "active" : "leave"}`}>
                        {e.employment_status}
                      </span>
                    </td>
                    <td className="actions">
                      <button onClick={() => handleDeleteEmployee(e.id)}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                      <button onClick={() => handleOpenEdit(e)}>
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEmployee(null); }}
        onSave={handleSaveEmployee}
        editingEmployee={editingEmployee}
      />
    </div>
  );
};

export default AllEmployees;
