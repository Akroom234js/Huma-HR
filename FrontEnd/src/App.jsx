// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Components/Sidebar/Sidebar'
import Recruitment from './Components/Pages/Recrutment/Main-page/Recrutment';
import ScheduleInterview from './Components/Pages/Recrutment/ScheduleInterview/ScheduleInterview';
import LanSw from './Components/LanSw'
import Home from './Components/Pages/Home/Home';
import Jops from './Components/Pages/Home/Jops';
import './App.css';
import ToScheduleInterview from './Components/Pages/Recrutment/ToScheduleInterview/ToScheduleInterview';
import InterviewHappening from './Components/Pages/Recrutment/InterviewHappening/InterviewHappening';
import ToMakeOffer from './Components/Pages/Recrutment/ToMakeOffer/ToMakeOffer';
import OpeningJobs from './Components/Pages/Recrutment/OpeningJobs/OpeningJobs';
import AddDepartment from './Components/Pages/Department/AddDepartment/AddDepartment';
import LeavesManagement from './Components/Pages/Leaves/LeavesManagement/LeavesManagement'
import DepartmentOverview from './Components/Pages/Department/DepartmentOverview/DepartmentOverview';
import OrganizationalChart from './Components/Pages/Department/OrganizationalChart/OrganizationalChart';
import PositionsRoles from './Components/Pages/Department/PositionsRoles/PositionsRoles';
import AddRole from './Components/Pages/Department/AddRole/AddRole';

import AllEmployees from './Components/Pages/EmployeeManagement/AllEmployees/AllEmployees';
import EmployeeMovement from './Components/Pages/EmployeeManagement/EmployeeMovement/EmployeeMovement';

import PayrollOverview from './Components/Pages/salaryMangement/PayrollOverview/PayrollOverview';
import SalaryStructure from './Components/Pages/salaryMangement/SalaryStructure/SalaryStructure';
import MonthlyPayroll from './Components/Pages/salaryMangement/MonthlyPayroll/MonthlyPayroll';
import SalaryAdjustments from './Components/Pages/salaryMangement/SalaryAdjustments/SalaryAdjustments';

// Dashboard Components
import General from './Components/Pages/Dashboard/General/General';
import EmployeeReports from './Components/Pages/Dashboard/EmployeeReports/EmployeeReports';
import Attendance from './Components/Pages/Dashboard/Attendance/Attendance';
import LeavesDashboard from './Components/Pages/Dashboard/Leaves/Leaves';
import SalariesDashboard from './Components/Pages/Dashboard/Salaries/Salaries';
import OverallPerformance from './Components/Pages/Dashboard/OverallPerformance/OverallPerformance';
import ImprovementStatistics from './Components/Pages/Dashboard/ImprovementStatistics/ImprovementStatistics';

// Reports Components
import PayrollReports from './Components/Pages/Reports/PayrollReports/PayrollReports';
import PerformanceReports from './Components/Pages/Reports/PerformanceReports/PerformanceReports';
import LeavesReports from './Components/Pages/Reports/LeavesReports/LeavesReports';
import AttendanceTracking from './Components/Pages/Reports/AttendanceTracking/AttendanceTracking';
import EmployeesReports from './Components/Pages/Reports/EmployeesReports/EmployeesReports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/jops" element={<Jops />} />

        {/* Dashboard Routes with Sidebar */}
        <Route
          path="/dashboard/*"
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="general" element={<General />} />
                  <Route path="employee-reports" element={<EmployeeReports />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="leaves" element={<LeavesDashboard />} />
                  <Route path="salaries" element={<SalariesDashboard />} />
                  <Route path="performance" element={<OverallPerformance />} />
                  <Route path="improvement" element={<ImprovementStatistics />} />
                </Routes>
              </main>
            </div>
          }
        />

        {/* Dashboard Routes with Sidebar */}
        <Route
          path="/department/*"
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="overview" element={<DepartmentOverview />} />
                  <Route path="org-chart" element={<OrganizationalChart />} />
                  <Route path="positions" element={<PositionsRoles />} />
                </Routes>
              </main>
            </div>
          }
        />
        <Route
          path="/employees/*"
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="all" element={<AllEmployees />} />
                  <Route path="movement" element={<EmployeeMovement />} />
                </Routes>
              </main>
            </div>
          }
        />
        <Route
          path="/salary/*"
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="payroll-overview" element={<PayrollOverview />} />
                  <Route path="salary-structure" element={<SalaryStructure />} />
                  <Route path="monthly-payroll" element={<MonthlyPayroll />} />
                  <Route path="salary-adjustments" element={<SalaryAdjustments />} />
                </Routes>
              </main>
            </div>
          }
        />
        <Route
          path="/recruitment/*"
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Recruitment />} />
                  <Route path="make-offer" element={<ToMakeOffer />} />
                  <Route path="opening-jobs" element={<OpeningJobs />} />
                  <Route path="schedule-interview" element={<ToScheduleInterview />} />
                  <Route path="interview-happening" element={<InterviewHappening />} />
                </Routes>
              </main>

            </div>
          }
        />

        <Route
          path="/leaves/*"
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<LeavesManagement />} />

                </Routes>
              </main>
            </div>
          }
        />
        <Route
          path="/reports/*"
          element={
            <div className="app-container">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="payroll" element={<PayrollReports />} />
                  <Route path="performance" element={<PerformanceReports />} />
                  <Route path="leaves" element={<LeavesReports />} />
                  <Route path="attendance" element={<AttendanceTracking />} />
                  <Route path="employees" element={<EmployeesReports />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>

    </BrowserRouter>
  );
}

export default App;