// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './Components/Sidebar/Sidebar';
import Recruitment from './Components/Pages/Recrutment/Main-page/Recrutment';
import ScheduleInterview from './Components/Pages/Recrutment/ScheduleInterview/ScheduleInterview';
import LanSw from './Components/LanSw'
import './App.css';
import ToScheduleInterview from './Components/Pages/Recrutment/ToScheduleInterview/ToScheduleInterview';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            {/* <Route path='/make-offer' element={<Recruitment />} /> */}
            <Route path={"/"} element={<Recruitment />} />
            <Route path='/schedule-interview' element={<ToScheduleInterview/>}/>
          </Routes>
        </main>
        {/* <ScheduleInterview/> */}
        {/* <LanSw/> */}
      </div>
    </BrowserRouter>
  );
}

export default App;