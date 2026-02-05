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
    </BrowserRouter>
  );
}

export default App;