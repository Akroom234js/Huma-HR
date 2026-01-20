// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './Components/Sidebar/sidebar';
import Recruitment from './Components/Pages/Recrutment/Main-page/Recrutment';
import Home from './Components/Pages/Home/Home';
import Jops from './Components/Pages/Home/Jops';
import './App.css';
import ToScheduleInterview from './Components/Pages/Recrutment/ToScheduleInterview/ToScheduleInterview';

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
                  <Route path="make-offer" element={<Recruitment />} />
                  <Route path="opening-jobs" element={<Recruitment />} />
                  <Route path="schedule-interview" element={<ToScheduleInterview />} />
                  <Route path="interview-happening" element={<Recruitment />} />
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