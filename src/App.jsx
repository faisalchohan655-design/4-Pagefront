import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// ✅ Yeh import sahi hai - Named export se
import { LeadsProvider } from './context/LeadsContext.jsx';
// OR
// import LeadsProvider from './context/LeadsContext.jsx'; // Agar default export use karna hai toh

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard.jsx';
import LeadFinder from './pages/LeadFinder.jsx';
import EmailExtractor from './pages/EmailExtractor.jsx';
import CampaignHub from './pages/CampaignHub.jsx';
import LeadManager from './pages/LeadManager.jsx';

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
            <Route path="/leads" element={<LeadManager />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </LeadsProvider>
  );
}

export default App;
