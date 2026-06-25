import React from 'react';

const Dashboard = () => {
  return (
    <div>
      <h1 style={{ fontSize: '28px', color: '#7c3aed' }}>📊 Dashboard</h1>
      <p style={{ color: '#4b5563', marginTop: '10px' }}>Welcome to LeadConnect Pro!</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Total Leads</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>0</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>New Leads</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>0</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3>Conversions</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>0%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
