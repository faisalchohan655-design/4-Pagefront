import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'https://4-pageback-production.up.railway.app';

  // Fetch leads
  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Create lead
  const createLead = async (leadData) => {
    try {
      const response = await axios.post(`${API_URL}/api/leads`, leadData);
      setLeads([...leads, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  };

  // Update lead
  const updateLead = async (id, leadData) => {
    try {
      const response = await axios.put(`${API_URL}/api/leads/${id}`, leadData);
      setLeads(leads.map(l => l._id === id ? response.data : l));
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  };

  // Delete lead
  const deleteLead = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/leads/${id}`);
      setLeads(leads.filter(l => l._id !== id));
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  };

  // Bulk delete
  const bulkDeleteLeads = async (ids) => {
    try {
      await axios.post(`${API_URL}/api/leads/bulk/delete`, { ids });
      setLeads(leads.filter(l => !ids.includes(l._id)));
    } catch (error) {
      console.error('Error bulk deleting leads:', error);
      throw error;
    }
  };

  // Save leads (from finder)
  const saveLeads = async (newLeads) => {
    try {
      const response = await axios.post(`${API_URL}/api/leads/bulk`, newLeads);
      setLeads([...leads, ...response.data]);
      return response.data;
    } catch (error) {
      console.error('Error saving leads:', error);
      throw error;
    }
  };

  // Send WhatsApp
  const sendWhatsApp = async (leadIds, message) => {
    try {
      const response = await axios.post(`${API_URL}/api/campaign/send/whatsapp`, {
        leadIds,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw error;
    }
  };

  // Send Email
  const sendEmail = async (leadIds, message) => {
    try {
      const response = await axios.post(`${API_URL}/api/campaign/send/email`, {
        leadIds,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };

  // Export leads
  const exportLeads = async (format = 'csv') => {
    try {
      const response = await axios.get(`${API_URL}/api/leads/export/${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting leads:', error);
      throw error;
    }
  };

  return (
    <LeadsContext.Provider value={{
      leads,
      loading,
      fetchLeads,
      createLead,
      updateLead,
      deleteLead,
      bulkDeleteLeads,
      saveLeads,
      sendWhatsApp,
      sendEmail,
      exportLeads
    }}>
      {children}
    </LeadsContext.Provider>
  );
};
