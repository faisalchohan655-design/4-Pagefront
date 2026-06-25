import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LeadsProvider } from './context/LeadsContext.jsx';
import Layout from './components/layout/Layout';

// Import all pages
import Dashboard from './pages/Dashboard.jsx';
import LeadFinder from './pages/LeadFinder.jsx';
import EmailExtractor from './pages/EmailExtractor.jsx';
import CampaignHub from './pages/CampaignHub.jsx';
import LeadManager from './pages/LeadManager.jsx';
import SocialInsights from './pages/SocialInsights.jsx';
import DomainInsights from './pages/DomainInsights.jsx';
import WebsiteIntelligence from './pages/WebsiteIntelligence.jsx';

function App() {
  return (
    <LeadsProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Main Pages */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/finder" element={<LeadFinder />} />
            <Route path="/extractor" element={<EmailExtractor />} />
            <Route path="/campaign" element={<CampaignHub />} />
            <Route path="/leads" element={<LeadManager />} />
            
            {/* Phase 1 Pages */}
            <Route path="/social" element={<SocialInsights />} />
            <Route path="/domain" element={<DomainInsights />} />
            <Route path="/website-intelligence" element={<WebsiteIntelligence />} />
            
            {/* 404 - Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#7c3aed',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </LeadsProvider>
  );
}

export default App;
