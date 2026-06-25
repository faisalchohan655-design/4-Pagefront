import React, { createContext, useState } from 'react';

export const LeadsContext = createContext(null);

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);

  const value = {
    leads,
    setLeads,
    addLeads: (newLeads) => {
      setLeads(prev => [...prev, ...newLeads]);
    }
  };

  return (
    <LeadsContext.Provider value={value}>
      {children}
    </LeadsContext.Provider>
  );
};

export default LeadsProvider;
