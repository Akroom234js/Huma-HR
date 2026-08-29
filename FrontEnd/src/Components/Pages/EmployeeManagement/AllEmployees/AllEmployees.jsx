import "./AllEmployees.css";
import FilterDropdown from "../../../FilterDropdown/FilterDropdown";
import ThemeToggle from "../../../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";
import AddEmployeeModal from "../Add New Employee/AddEmployeeModal";
import apiClient from "../../../../apiConfig";
import Avatar from "../../../Shared/Avatar/Avatar";
import DashboardLoader from "../../../Shared/DashboardLoader/DashboardLoader";
import { useNotification } from "../../../Notification/NotificationContext";
import { useLocation } from "react-router-dom";

const AllEmployees = () => {
  const { t, i18n } = useTranslation("AllEmployees/AllEmployees");
  const isAr = i18n?.language === "ar";
  const location = useLocation();
  const { showSuccess, showError, showWarning } = useNotification();

  const [selectedDepartment1, setSelectedDepartment1] = useState("");
  const [EmpStatus, setEmpStatus] = useState("");
  const [EmpPosition, setEmpPosition] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [StatusOptions, setStatusOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFilters = useCallback(async () => {
    // 1. جلب الأقسام
    apiClient.get('/departments')
      .then(res => {
        setDepartmentOptions([
          { value: "", label: t('filter-department') || "Department" },
          ...(res.data?.data?.map(d => ({ value: d.id, label: d.name })) || [])
        ]);
      })
      .catch(err => console.error("Failed to fetch departments", err));

    // 2. جلب الحالات (Statuses)
    apiClient.get('/employees/statuses')
      .then(res => {
        setStatusOptions([
          { value: "", label: t('filter-status') || "Status" },
          ...(res.data?.data?.map(s => ({
            value: s,
            label: t(`status-${s}`) || s
          })) || [])
        ]);
      })
      .catch(err => console.error("Failed to fetch statuses", err));

    // 3. جلب المناصب (Positions)
    apiClient.get('/positions', { params: { per_page: 100 } })
      .then(res => {
        setPositionOptions([
          { value: "", label: t('filter-position') || "Position" },
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
          { value: "", label: t('filter-supervisor') || "Direct Supervisor" },
          ...(res.data?.data?.map(m => ({ value: m.id, label: m.full_name })) || [])
        ]);
      })
      .catch(err => console.error("Failed to fetch managers", err));
  }, [t]);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedDepartment1) params.department_id = selectedDepartment1;
      if (EmpStatus) params.status = EmpStatus;
      if (EmpPosition) {
        params.position_id = EmpPosition;
        const matchedPos = positionOptions.find(p => String(p.value) === String(EmpPosition));
        if (matchedPos?.label) {
          params.job_title = matchedPos.label;
        }
      }

      const res = await apiClient.get('/employees', { params });
      setEmployees(res.data?.data?.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      showError(t('toast-load-error') || "Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedDepartment1, EmpStatus, EmpPosition, positionOptions, showError, t]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

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
        password: "",
        employeeId: "",
        directManager: "",
      });
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  async function handleDeleteEmployee(id) {
    const confirmDelete = window.confirm(t('toast-delete-confirm') || "Are you sure you want to delete this employee?");
    if (confirmDelete) {
      try {
        await apiClient.delete(`/employees/${id}`);
        showSuccess(t('toast-delete-success') || "Employee deleted successfully");
        fetchEmployees();
      } catch (error) {
        console.error("Failed to delete employee", error);
        showError(t('toast-delete-error') || "Error deleting employee");
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
        basicSalary: e.salary,
        directManager: e.manager_id,
        profilePicUrl: e.profile_pic,
        employmentStatus: e.employment_status || 'active',
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch employee details", error);
      showError(t('toast-load-error') || "Error loading employee data");
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

      if (data.employeeId) formData.append("employee_id", data.employeeId);
      if (data.phone) formData.append("phone_number", data.phone);
      if (data.dob) formData.append("date_of_birth", data.dob);
      if (data.address) formData.append("address", data.address);
      if (data.emergencyContact) formData.append("emergency_contacts", data.emergencyContact);
      if (data.jobTitle) {
        formData.append("position_id", data.jobTitle);
        const selectedPos = positionOptions.find(p => String(p.value) === String(data.jobTitle));
        if (selectedPos) formData.append("job_title", selectedPos.label);
      }
      if (data.department) formData.append("department_id", data.department);
      if (data.joiningDate) formData.append("start_date", data.joiningDate);
      if (data.profilePicture) formData.append("profile_pic", data.profilePicture);

      if (data.directManager && !isNaN(data.directManager)) {
        formData.append("manager_id", data.directManager);
      }

      if (data.basicSalary) formData.append("salary", data.basicSalary);
      formData.append("employment_status", data.employmentStatus || "active");

      if (editingEmployee) {
        formData.append("_method", "PUT");
        await apiClient.post(`/employees/${editingEmployee.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showSuccess(t('toast-update-success') || "Employee updated successfully");
      } else {
        await apiClient.post(`/auth/employees`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showSuccess(t('toast-save-success') || "Employee account created successfully");
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      console.error("Failed to save employee", error);
      if (error.response?.data?.errors) {
        const errorMsgs = Object.values(error.response.data.errors).flat().join('\n');
        showError(errorMsgs);
      } else {
        showError(error.response?.data?.message || t('toast-save-error') || "Error saving employee.");
      }
    }
  }

  return (
    <div className={`all-employees-page ${isAr ? 'rtl' : 'ltr'}`}>
      <header className="page-header">
        <div className="header-info">
          <h1>{t('page-title')}</h1>
        </div>
        <div className="sm-theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </header>
      <div className="con-filter">
        <div className="all-filt">
          <input
            type="text"
            placeholder={t('search-placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="con2-filter">
            <FilterDropdown
              value={selectedDepartment1}
              onChange={setSelectedDepartment1}
              options={departmentOptions}
              placeholder={t('filter-department')}
            />
            <FilterDropdown
              value={EmpStatus}
              onChange={setEmpStatus}
              options={StatusOptions}
              placeholder={t('filter-status')}
            />
            <FilterDropdown
              value={EmpPosition}
              onChange={setEmpPosition}
              options={positionOptions}
              placeholder={t('filter-position')}
            />
          </div>
        </div>
        <button
          type="button"
          className="add-emp-btn"
          onClick={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
        >
          {t('btn-add-employee')}
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('th-employee-name')}</th>
              <th>{t('th-employee-id')}</th>
              <th>{t('th-department')}</th>
              <th>{t('th-job-title')}</th>
              <th>{t('th-status')}</th>
              <th>{t('th-actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ padding: "3.5rem 1rem", textAlign: "center" }}>
                  <DashboardLoader text={t('loading-employees')} size="md" />
                </td>
              </tr>
            ) : employees.length > 0 ? (
              employees.map((e) => (
                <tr key={e.id}>
                  <td className="emp-name">
                    <Avatar user={e} size="sm" className="avatar" />
                    {e.full_name}
                  </td>
                  <td>{e.employee_id}</td>
                  <td>{e.department?.name || e.department}</td>
                  <td>{e.job_title}</td>
                  <td>
                    <span className={`status ${e.employment_status?.toLowerCase() || "active"}`}>
                      {t(`status-${e.employment_status?.toLowerCase()}`) || (e.employment_status ? e.employment_status.replace('_', ' ') : "Active")}
                    </span>
                  </td>
                  <td className="actions">
                    <button onClick={() => handleDeleteEmployee(e.id)} title={isAr ? "حذف الموظف" : "Delete Employee"}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                    <button onClick={() => handleOpenEdit(e)} title={isAr ? "تعديل الموظف" : "Edit Employee"}>
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary, #64748b)" }}>
                  {t('no-employees')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddEmployeeModal
        key={isModalOpen ? (editingEmployee ? `edit-${editingEmployee.id}` : 'create-new') : 'closed'}
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