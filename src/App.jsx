import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LeadsProvider } from './context/LeadsContext';
import Dashboard from './pages/Dashboard';
import LeadFinder from './pages/LeadFinder';
import CampaignOutreach from './pages/CampaignOutreach';
import LeadManager from './pages/LeadManager';
import Navigation from './components/Navigation';

function App() {
  return (
    <BrowserRouter>
      <LeadsProvider>
        <div className="min-h-screen">
          <Navigation />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lead-finder" element={<LeadFinder />} />
            <Route path="/campaign-outreach" element={<CampaignOutreach />} />
            <Route path="/lead-manager" element={<LeadManager />} />
          </Routes>
        </div>
      </LeadsProvider>
    </BrowserRouter>
  );
}

export default App;
