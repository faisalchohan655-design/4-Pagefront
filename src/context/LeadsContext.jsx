import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// ✅ APNI BACKEND URL YAHAN LAGAO
const API_URL = 'https://your-backend.railway.app'; // 👈 APNI URL DALO

export const LeadsContext = createContext(null);

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ LEADS FETCH KARO
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/leads`);
      if (response.data.success) {
        setLeads(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // ✅ LEADS ADD KARO
  const addLeads = async (newLeads) => {
    try {
      const response = await axios.post(`${API_URL}/api/leads/bulk`, {
        leads: newLeads
      });
      
      if (response.data.success) {
        await fetchLeads();
        toast.success(`✅ ${newLeads.length} leads added!`);
        return true;
      }
    } catch (error) {
      console.error('Error adding leads:', error);
      toast.error('Failed to add leads');
      return false;
    }
  };

  // ✅ LEAD DELETE KARO
  const deleteLead = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/leads/${id}`);
      if (response.data.success) {
        await fetchLeads();
        toast.success('Lead deleted!');
        return true;
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
      return false;
    }
  };

  // ✅ BULK DELETE KARO
  const bulkDelete = async (ids) => {
    try {
      const response = await axios.post(`${API_URL}/api/leads/bulk-delete`, {
        ids: ids
      });
      if (response.data.success) {
        await fetchLeads();
        toast.success(`${ids.length} leads deleted!`);
        return true;
      }
    } catch (error) {
      console.error('Error deleting leads:', error);
      toast.error('Failed to delete leads');
      return false;
    }
  };

  // ✅ GOOGLE MAPS SE LEADS FIND KARO
  const searchGoogleMaps = async (query, location) => {
    try {
      const response = await axios.post(`${API_URL}/api/scrape`, {
        query,
        location: location || 'Pakistan'
      });
      return response.data;
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Search failed');
      return null;
    }
  };

  // ✅ WHATSAPP SEND KARO
  const sendWhatsApp = async (leadId, message) => {
    try {
      const response = await axios.post(`${API_URL}/api/whatsapp/send`, {
        leadId,
        message
      });
      if (response.data.success) {
        toast.success('WhatsApp sent!');
        return true;
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast.error('Failed to send WhatsApp');
      return false;
    }
  };

  // Load leads on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const value = {
    leads,
    setLeads,
    loading,
    fetchLeads,
    addLeads,
    deleteLead,
    bulkDelete,
    searchGoogleMaps,
    sendWhatsApp
  };

  return (
    <LeadsContext.Provider value={value}>
      {children}
    </LeadsContext.Provider>
  );
};

export default LeadsProvider;
