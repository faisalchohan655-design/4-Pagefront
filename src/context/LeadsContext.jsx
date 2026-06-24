import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// ✅ Named Export - LeadsContext
export const LeadsContext = createContext(null);

// ✅ Named Export - LeadsProvider
export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLeads, setTotalLeads] = useState(0);

  // Fetch leads from backend
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://your-backend-url.railway.app/api/leads');
      if (response.data.success) {
        setLeads(response.data.data);
        setTotalLeads(response.data.data.length);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // Add leads
  const addLeads = async (newLeads) => {
    try {
      const response = await axios.post('https://your-backend-url.railway.app/api/leads/bulk', {
        leads: newLeads
      });
      
      if (response.data.success) {
        await fetchLeads(); // Refresh leads
        toast.success(`✅ ${newLeads.length} leads added!`);
        return true;
      }
    } catch (error) {
      console.error('Error adding leads:', error);
      toast.error('Failed to add leads');
      return false;
    }
  };

  // Delete lead
  const deleteLead = async (id) => {
    try {
      const response = await axios.delete(`https://your-backend-url.railway.app/api/leads/${id}`);
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

  // Bulk delete
  const bulkDelete = async (ids) => {
    try {
      const response = await axios.post('https://your-backend-url.railway.app/api/leads/bulk-delete', {
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

  // Update lead status
  const updateLeadStatus = async (id, status) => {
    try {
      const response = await axios.put(`https://your-backend-url.railway.app/api/leads/${id}`, {
        status: status
      });
      if (response.data.success) {
        await fetchLeads();
        toast.success('Status updated!');
        return true;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      return false;
    }
  };

  // WhatsApp send
  const sendWhatsApp = async (leadId, message) => {
    try {
      const response = await axios.post('https://your-backend-url.railway.app/api/whatsapp/send', {
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

  // Email send
  const sendEmail = async (leadId, subject, body) => {
    try {
      const response = await axios.post('https://your-backend-url.railway.app/api/email/send', {
        leadId,
        subject,
        body
      });
      if (response.data.success) {
        toast.success('Email sent!');
        return true;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
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
    totalLeads,
    fetchLeads,
    addLeads,
    deleteLead,
    bulkDelete,
    updateLeadStatus,
    sendWhatsApp,
    sendEmail
  };

  return (
    <LeadsContext.Provider value={value}>
      {children}
    </LeadsContext.Provider>
  );
};

// ✅ Custom hook for using context
export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within LeadsProvider');
  }
  return context;
};

// ✅ Default export (for backward compatibility)
export default LeadsProvider;
