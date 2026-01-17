// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './Components/Sidebar/Sidebar';
import Recruitment from './Components/Pages/Recrutment/Main-page/Recrutment';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/" element={<Recruitment />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;