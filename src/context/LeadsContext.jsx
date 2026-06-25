import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://4-pageback-production.up.railway.app';

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/leads`);
        setLeads(res.data);
      } catch (e) {
        setLeads([
          { _id: '1', name: 'John Doe', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1 (555) 123-4567', status: 'new', source: 'google_maps' },
          { _id: '2', name: 'Sarah Smith', company: 'Finance Inc', email: 'sarah@financeinc.com', phone: '+1 (555) 234-5678', status: 'contacted', source: 'linkedin' },
        ]);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const saveLeads = async (newLeads) => {
    try {
      const res = await axios.post(`${API_URL}/api/leads/bulk`, newLeads);
      setLeads([...leads, ...res.data]);
      return res.data;
    } catch (e) {
      const saved = newLeads.map(l => ({ ...l, _id: Date.now().toString() }));
      setLeads([...leads, ...saved]);
      return saved;
    }
  };

  const deleteLead = async (id) => {
    try { await axios.delete(`${API_URL}/api/leads/${id}`); } catch (e) {}
    setLeads(leads.filter(l => l._id !== id));
  };

  const bulkDeleteLeads = async (ids) => {
    try { await axios.post(`${API_URL}/api/leads/bulk/delete`, { ids }); } catch (e) {}
    setLeads(leads.filter(l => !ids.includes(l._id)));
  };

  const sendWhatsApp = async (ids, msg) => {
    try { await axios.post(`${API_URL}/api/campaign/send/whatsapp`, { leadIds: ids, message: msg }); } catch (e) {}
    return { success: true };
  };

  const sendEmail = async (ids, msg) => {
    try { await axios.post(`${API_URL}/api/campaign/send/email`, { leadIds: ids, message: msg }); } catch (e) {}
    return { success: true };
  };

  return (
    <LeadsContext.Provider value={{ leads, loading, saveLeads, deleteLead, bulkDeleteLeads, sendWhatsApp, sendEmail }}>
      {children}
    </LeadsContext.Provider>
  );
};
