import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LeadsProvider } from './context/LeadsContext.jsx';

// ✅ Sirf Layout aur Pages import karo
import Dashboard from './pages/Dashboard.jsx';
import LeadFinder from './pages/LeadFinder.jsx';

function App() {
  return (
    <LeadsProvider>
      <BrowserRouter>
        <div>
          {/* Simple Navbar */}
          <nav style={{ background: '#7c3aed', padding: '15px', color: 'white' }}>
            <h1 style={{ fontSize: '24px' }}>🚀 LeadConnect Pro</h1>
          </nav>
          
          {/* Content */}
          <div style={{ padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/finder" element={<LeadFinder />} />
            </Routes>
          </div>
        </div>
        <Toaster />
      </BrowserRouter>
    </LeadsProvider>
  );
}

export default App;
