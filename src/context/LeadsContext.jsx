// src/context/LeadsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://4-pageback-production.up.railway.app/api';

  // ✅ FETCH LEADS
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/leads`);
      console.log('✅ Fetched leads:', res.data?.length || 0);
      setLeads(res.data || []);
    } catch (err) {
      console.error('❌ Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD LEADS - WITH FORCE REFRESH
  const addLeads = async (newLeads) => {
    try {
      const toSave = Array.isArray(newLeads) ? newLeads : [newLeads];
      
      if (!toSave.length) {
        toast.error('No leads to save');
        return;
      }

      console.log('📝 Saving:', toSave.length, 'leads');
      
      const res = await axios.post(`${API_URL}/leads/bulk`, { leads: toSave });
      
      console.log('✅ Save response:', res.data);
      
      // ✅ FORCE REFRESH
      await fetchLeads();
      
      toast.success(`${toSave.length} leads saved!`);
      return res.data;
    } catch (err) {
      console.error('❌ Save error:', err);
      toast.error(err.response?.data?.error || 'Failed to save');
      throw err;
    }
  };

  // ✅ DELETE LEAD
  const deleteLead = async (id) => {
    try {
      await axios.delete(`${API_URL}/leads/${id}`);
      await fetchLeads();
      toast.success('Lead deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // ✅ DELETE BULK
  const deleteBulk = async (ids) => {
    try {
      if (!ids || !ids.length) return;
      await axios.delete(`${API_URL}/leads/bulk`, { data: { ids } });
      await fetchLeads();
      toast.success(`${ids.length} leads deleted`);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <LeadsContext.Provider value={{
      leads,
      loading,
      addLeads,
      deleteLead,
      deleteBulk,
      fetchLeads,
      setLeads
    }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};

export default LeadsContext;
