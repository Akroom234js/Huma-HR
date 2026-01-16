import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './Components/Sidebar/Sidebar';

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ marginLeft: '260px', width: 'calc(100% - 260px)' }}>
          {/* المحتوى هنا */}
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;