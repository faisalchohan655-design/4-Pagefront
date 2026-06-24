// src/context/LeadsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    withEmail: 0,
    withPhone: 0,
    withWebsite: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // ✅ FETCH LEADS
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/leads`);
      const data = res.data || [];
      setLeads(data);
      updateStats(data);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE STATS
  const updateStats = (data) => {
    setStats({
      total: data.length,
      withEmail: data.filter(l => l.email).length,
      withPhone: data.filter(l => l.phone).length,
      withWebsite: data.filter(l => l.website).length
    });
  };

  // ✅ ADD LEADS (BULK SAVE)
  const addLeads = async (newLeads) => {
    try {
      const toSave = Array.isArray(newLeads) ? newLeads : [newLeads];
      if (!toSave.length) {
        toast.error('No leads to save');
        return;
      }

      const res = await axios.post(`${API_URL}/leads/bulk`, { leads: toSave });
      await fetchLeads();
      toast.success(`✅ ${res.data.saved || toSave.length} leads saved!`);
      return res.data;
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.error || 'Failed to save');
      throw err;
    }
  };

  // ✅ DELETE SINGLE LEAD
  const deleteLead = async (id) => {
    try {
      await axios.delete(`${API_URL}/leads/${id}`);
      await fetchLeads();
      toast.success('Lead deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  // ✅ DELETE BULK LEADS
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

  // ✅ LOAD LEADS ON MOUNT
  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <LeadsContext.Provider value={{
      leads,
      loading,
      stats,
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
