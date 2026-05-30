// AllEmployees.jsx
import "./AllEmployees.css";
import FilterDropdown from "../../../FilterDropdown/FilterDropdown";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import AddEmployeeModal from "../Add New Employee/AddEmployeeModal";
import apiClient from "../../../../apiConfig";
import Avatar from "../../../Shared/Avatar/Avatar";

import { useLocation } from "react-router-dom";

const AllEmployees = () => {
  const { t } = useTranslation("Sidebar/Sidebar");
  const location = useLocation();
  const [selectedDepartment1, setSelectedDepartment1] = useState("");
  const [EmpStatus, setEmpStatus] = useState("");
  const [EmpPosition, setEmpPosition] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([{ value: "", label: "Department" }]);
  const [StatusOptions, setStatusOptions] = useState([{ value: "", label: "Status" }]);
  const [positionOptions, setPositionOptions] = useState([{ value: "", label: "Position" }]);
  const [managerOptions, setManagerOptions] = useState([{ value: "", label: "Direct Supervisor" }]);
  const [searchQuery, setSearchQuery] = useState("");


  const fetchFilters = async () => {
    // 1. جلب الأقسام
    apiClient.get('/departments')
      .then(res => {
        setDepartmentOptions([
          { value: "", label: "Department" },
          ...(res.data?.data?.map(d => ({ value: d.id, label: d.name })) || [])
        ]);
      })
      .catch(err => console.error("Failed to fetch departments", err));

    // 2. جلب الحالات (Statuses)
    apiClient.get('/employees/statuses')
      .then(res => {
        setStatusOptions([
          { value: "", label: "Status" },
          ...(res.data?.data?.map(s => ({ value: s, label: s })) || [])
        ]);
      })
      .catch(err => console.error("Failed to fetch statuses", err));

    // 3. جلب المناصب (Positions)
    apiClient.get('/positions')
      .then(res => {
        setPositionOptions([
          { value: "", label: "Position" },
          ...(res.data?.data?.positions?.map(p => ({ 
             value: p.id, 
             label: p.title,
             min_salary: p.min_salary,
             max_salary: p.max_salary,
             tax_percent: p.tax_percent,
             allowances: p.allowances,
             insurance_amount: p.insurance_amount
          })) || [])
        ]);
      })
      .catch(err => console.error("Failed to fetch positions", err));

    // 4. جلب المديرين (Managers)
    apiClient.get('/employees/managers')
      .then(res => {
        setManagerOptions([
          { value: "", label: "Direct Supervisor" },
          ...(res.data?.data?.map(m => ({ value: m.id, label: m.full_name })) || [])
        ]);
      })
      .catch(err => console.error("Failed to fetch managers", err));
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

  useEffect(() => {
    if (location.state?.prefillCandidate) {
      const c = location.state.prefillCandidate;
      setEditingEmployee({
        fullName: c.full_name || "",
        email: c.email || "",
        phone: c.phone || "",
        dob: c.date_of_birth || "",
        address: c.address || "",
        emergencyContact: c.emergency_contacts || "",
        jobTitle: c.job_posting?.position_id || "",
        department: c.job_posting?.department_id || "",
        joiningDate: new Date().toISOString().split('T')[0],
        // Omit / leave blank explicitly
        password: "",
        employeeId: "",
        directManager: "",
      });
      setIsModalOpen(true);
      
      // Clear location state after parsing to prevent launching modal again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);


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

  async function handleOpenEdit(employee) {
    try {
      const res = await apiClient.get(`/employees/${employee.id}`);
      const e = res.data?.data?.employee || res.data?.data || employee;

      setEditingEmployee({
        id: e.id,
        employeeId: e.employee_id,
        fullName: e.full_name,
        email: e.email,
        jobTitle: e.position_id || e.job_title,
        department: e.department?.id || e.department_id,
        dob: e.date_of_birth,
        phone: e.phone_number,
        address: e.address,
        emergencyContact: e.emergency_contacts,
        joiningDate: e.start_date,
        // التعديل هنا: قراءة 'salary' من الباك إند ووضعه في 'basicSalary' للواجهة
        basicSalary: e.salary,
        directManager: e.manager_id,
        profilePicUrl: e.profile_pic,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch employee details", error);
      alert("Error loading employee data");
    }
  }

  async function handleSaveEmployee(data) {
    try {
      const formData = new FormData();
      if (data.fullName) formData.append("full_name", data.fullName);
      if (data.email) formData.append("email", data.email);
      if (data.password) {
        formData.append("password", data.password);
        formData.append("password_confirmation", data.password);
      }

      // هنا نستخدم employeeId الذي يرسله المودال ليُخزن في employee_id
      if (data.employeeId) formData.append("employee_id", data.employeeId);

      if (data.phone) formData.append("phone_number", data.phone);
      if (data.dob) formData.append("date_of_birth", data.dob);
      if (data.address) formData.append("address", data.address);
      if (data.emergencyContact) formData.append("emergency_contacts", data.emergencyContact);
      if (data.jobTitle) {
        formData.append("position_id", data.jobTitle);
        const selectedPos = positionOptions.find(p => p.value == data.jobTitle);
        if (selectedPos) formData.append("job_title", selectedPos.label);
      }
      if (data.department) formData.append("department_id", data.department);
      if (data.joiningDate) formData.append("start_date", data.joiningDate);
      if (data.profilePicture) formData.append("profile_pic", data.profilePicture);

      if (data.directManager && !isNaN(data.directManager)) {
        formData.append("manager_id", data.directManager);
      }

      // التعديل هنا: إرسال القيمة باسم 'salary' لتطابق الموديل في Laravel
      if (data.basicSalary) formData.append("salary", data.basicSalary);

      formData.append("employment_status", "active");

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
            placeholder="   Search by name or ID ..."
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
                  <Avatar user={e} size="sm" className="avatar" />
                  {e.full_name}
                </td>
                <td>{e.employee_id}</td>
                <td>{e.department?.name || e.department}</td>
                <td>{e.job_title}</td>
                <td>
                  <span className={`status ${e.employment_status?.toLowerCase() === "active" ? "active" : "leave"}`}>
                    {e.employment_status || "Active"}
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
        positionOptions={positionOptions}
        managerOptions={managerOptions}
      />
    </div>
  );
};

export default AllEmployees;