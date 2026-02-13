// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

import DepartmentOverview from './Components/Pages/Department/DepartmentOverview/DepartmentOverview';
import OrganizationalChart from './Components/Pages/Department/OrganizationalChart/OrganizationalChart';
import PositionsRoles from './Components/Pages/Department/PositionsRoles/PositionsRoles';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/jops" element={<Jops />} />

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
              {/* <ScheduleInterview/> */}
              {/* <LanSw/> */}
            </div>
          }
        />
      </Routes>
      {/* <AddDepartment/> */}
    </BrowserRouter>
  );
}

export default App;