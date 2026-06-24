// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LeadsProvider } from './context/LeadsContext.jsx';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LeadFinder from './pages/LeadFinder';
import EmailExtractor from './pages/EmailExtractor';
import CampaignHub from './pages/CampaignHub';

function App() {
  return (
    <LeadsProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/finder" element={<LeadFinder />} />
            <Route path="/extractor" element={<EmailExtractor />} />
            <Route path="/campaign" element={<CampaignHub />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            duration: 3000,
            style: {
              background: '#fff',
              border: '1px solid #f0f0f0',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }
          }} 
        />
      </BrowserRouter>
    </LeadsProvider>
  );
}

export default App;
