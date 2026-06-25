import React from 'react';

const LeadFinder = () => {
  return (
    <div>
      <h1 style={{ fontSize: '28px', color: '#7c3aed' }}>🔍 Lead Finder</h1>
      <p style={{ color: '#4b5563', marginTop: '10px' }}>Find local business leads</p>
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '10px', 
        marginTop: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <input 
          type="text" 
          placeholder="Search businesses..."
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
        <p style={{ marginTop: '10px', color: '#6b7280' }}>Search results will appear here</p>
      </div>
    </div>
  );
};

export default LeadFinder;
