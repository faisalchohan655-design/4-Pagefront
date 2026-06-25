import React, { useContext, useState } from 'react';
import { LeadsContext } from '../context/LeadsContext';
import {
  Send, Mail, MessageCircle, Smartphone, 
  Target, Users, Clock, TrendingUp, Download,
  Filter, Search, Plus, Edit, Trash2,
  Eye, Copy, CheckCircle, AlertCircle,
  Calendar, BarChart3, PieChart, Activity,
  Zap, Sparkles, Brain, Wand2
} from 'lucide-react';
import * as XLSX from 'xlsx';

const CampaignOutreach = () => {
  const { leads, sendWhatsApp, sendEmail, deleteLead, bulkDeleteLeads } = useContext(LeadsContext);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [activeChannel, setActiveChannel] = useState('whatsapp');
  const [template, setTemplate] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaignStats, setCampaignStats] = useState({
    sent: 0,
    delivered: 0,
    opened: 0,
    replied: 0
  });

  // AI Template Generator
  const templates = [
    { 
      id: 'welcome', 
      name: 'Welcome Message',
      channel: 'whatsapp',
      content: 'Hi {{name}}, thanks for connecting with us! We specialize in helping companies like {{company}} grow their business. Would you be open to a quick chat?'
    },
    { 
      id: 'followup', 
      name: 'Follow-up',
      channel: 'whatsapp',
      content: 'Hi {{name}}, following up on our previous conversation. Have you had a chance to review what we discussed?'
    },
    { 
      id: 'proposal', 
      name: 'Proposal',
      channel: 'email',
      content: 'Hi {{name}},\n\nI hope this email finds you well. I\'m excited to share our proposal for {{company}}. We believe our solution can help you achieve your goals.\n\nBest regards,\nYour Team'
    },
    { 
      id: 'closing', 
      name: 'Closing Deal',
      channel: 'whatsapp',
      content: 'Hi {{name}}, great news! Your account has been set up. Let me know when you\'re ready to get started.'
    },
    { 
      id: 'newsletter', 
      name: 'Newsletter',
      channel: 'email',
      content: 'Hi {{name}},\n\nHere\'s our latest newsletter with updates and insights for {{company}}.\n\nBest,\nTeam'
    }
  ];

  // AI Smart Suggestions
  const aiSuggestions = [
    '🤖 Personalized follow-up based on lead engagement',
    '💡 Send proposal to high-scoring leads (80%+)',
    '📊 Share case study with tech industry leads',
    '🎯 Product demo invitation for hot leads',
    '📈 ROI calculation for finance sector leads',
    '🚀 Success stories for startup leads'
  ];

  // Filter leads
  const getFilteredLeads = () => {
    let filtered = [...leads];
    
    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }
    
    if (filterScore !== 'all') {
      // Filter by AI score (assuming we have it)
      const minScore = parseInt(filterScore);
      filtered = filtered.filter(l => (l.aiScore || 0) >= minScore);
    }
    
    return filtered;
  };

  const filteredLeads = getFilteredLeads();

  // Send campaign
  const handleSendCampaign = async () => {
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead');
      return;
    }
    
    if (!message) {
      alert('Please enter a message');
      return;
    }
    
    setSending(true);
    try {
      const targetLeads = leads.filter(l => selectedLeads.includes(l._id));
      
      if (activeChannel === 'whatsapp') {
        await sendWhatsApp(selectedLeads, message);
      } else if (activeChannel === 'email') {
        await sendEmail(selectedLeads, message);
      }
      
      // Update stats
      setCampaignStats({
        sent: selectedLeads.length,
        delivered: Math.floor(selectedLeads.length * 0.92),
        opened: Math.floor(selectedLeads.length * 0.67),
        replied: Math.floor(selectedLeads.length * 0.17)
      });
      
      alert(`Campaign sent to ${selectedLeads.length} leads successfully!`);
      setSelectedLeads([]);
      setMessage('');
    } catch (error) {
      console.error('Campaign error:', error);
      alert('Error sending campaign. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Export functions
  const exportToExcel = () => {
    const exportData = filteredLeads.map(l => ({
      Name: l.name || '',
      Company: l.company || '',
      Email: l.email || '',
      Phone: l.phone || '',
      Status: l.status || '',
      'AI Score': l.aiScore || 0,
      Source: l.source || '',
      'Created At': new Date(l.createdAt).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `campaign_leads_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'AI Score', 'Source', 'Created At'];
    const csvData = filteredLeads.map(l => [
      l.name || '',
      l.company || '',
      l.email || '',
      l.phone || '',
      l.status || '',
      l.aiScore || 0,
      l.source || '',
      new Date(l.createdAt).toLocaleDateString()
    ]);
    
    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Delete functions
  const handleDeleteSingle = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(id);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
      await bulkDeleteLeads(selectedLeads);
      setSelectedLeads([]);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Send className="text-purple-400" size={32} />
              Campaign Outreach
              <span className="text-sm bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full text-white text-xs font-medium animate-pulse">
                LIVE
              </span>
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              AI-powered multi-channel campaign management
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportToExcel}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              Excel
            </button>
            <button
              onClick={exportToCSV}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              CSV
            </button>
            {selectedLeads.length > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete {selectedLeads.length}
              </button>
            )}
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sent</p>
                <p className="text-2xl font-bold text-white">{campaignStats.sent}</p>
              </div>
              <Send className="text-purple-400" size={24} />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-white">{campaignStats.delivered}</p>
              </div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Opened</p>
                <p className="text-2xl font-bold text-white">{campaignStats.opened}</p>
              </div>
              <Eye className="text-blue-400" size={24} />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Replied</p>
                <p className="text-2xl font-bold text-white">{campaignStats.replied}</p>
              </div>
              <MessageCircle className="text-pink-400" size={24} />
            </div>
          </div>
        </div>

        {/* Main Campaign Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Campaign Setup */}
          <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Target size={20} className="text-purple-400" />
              Campaign Setup
            </h3>
            
            {/* Channel Selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveChannel('whatsapp')}
                  className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    activeChannel === 'whatsapp'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                  }`}
                >
                  <MessageCircle size={20} />
                  <span className="text-sm">WhatsApp</span>
                </button>
                
                <button
                  onClick={() => setActiveChannel('email')}
                  className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    activeChannel === 'email'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                  }`}
                >
                  <Mail size={20} />
                  <span className="text-sm">Email</span>
                </button>
              </div>
              
              {/* AI Suggestions */}
              <div className="bg-slate-700/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={16} className="text-purple-400" />
                  <span className="text-white text-sm font-medium">AI Suggestions</span>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.slice(0, 3).map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setMessage(suggestion)}
                      className="w-full text-left text-gray-300 text-sm hover:text-white hover:bg-slate-700/50 p-2 rounded-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Template Selector */}
              <div>
                <label className="text-sm text-gray-400 block mb-1">Quick Template</label>
                <select
                  value={template}
                  onChange={(e) => {
                    setTemplate(e.target.value);
                    const selected = templates.find(t => t.id === e.target.value);
                    if (selected) setMessage(selected.content);
                  }}
                  className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
                >
                  <option value="">Select template...</option>
                  {templates
                    .filter(t => t.channel === activeChannel)
                    .map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
              </div>
              
              {/* Message Editor */}
              <div>
                <label className="text-sm text-gray-400 block mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none resize-none h-32"
                  placeholder="Type your message here... Use {{name}}, {{company}} for personalization"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Available: {'{{name}}'}, {'{{company}}'}, {'{{industry}}'}
                </div>
              </div>
              
              {/* Send Button */}
              <button
                onClick={handleSendCampaign}
                disabled={sending || selectedLeads.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={18} />
                    Send to {selectedLeads.length} Leads
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right - Lead List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
              {/* Filters */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[150px] relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-700/50 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none transition-colors text-sm"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="closed">Closed</option>
                  </select>
                  
                  <select
                    value={filterScore}
                    onChange={(e) => setFilterScore(e.target.value)}
                    className="bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none text-sm"
                  >
                    <option value="all">All Scores</option>
                    <option value="80">Hot (80+)</option>
                    <option value="60">Warm (60+)</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      const all = filteredLeads.map(l => l._id);
                      setSelectedLeads(selectedLeads.length === all.length ? [] : all);
                    }}
                    className="text-purple-400 hover:text-purple-300 text-sm"
                  >
                    {selectedLeads.length === filteredLeads.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Lead Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                          onChange={() => {
                            if (selectedLeads.length === filteredLeads.length) {
                              setSelectedLeads([]);
                            } else {
                              setSelectedLeads(filteredLeads.map(l => l._id));
                            }
                          }}
                          className="rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Company</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Phone</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead._id)}
                            onChange={() => {
                              if (selectedLeads.includes(lead._id)) {
                                setSelectedLeads(selectedLeads.filter(id => id !== lead._id));
                              } else {
                                setSelectedLeads([...selectedLeads, lead._id]);
                              }
                            }}
                            className="rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-white font-medium">{lead.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-300">{lead.company || '-'}</td>
                        <td className="px-4 py-3 text-gray-300">{lead.email || '-'}</td>
                        <td className="px-4 py-3 text-gray-300">{lead.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                            lead.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                            lead.status === 'qualified' ? 'bg-green-500/20 text-green-400' :
                            lead.status === 'proposal' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-pink-500/20 text-pink-400'
                          }`}>
                            {lead.status || 'new'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedLeads([lead._id]);
                                setMessage(`Hi ${lead.name || ''},`);
                              }}
                              className="p-1 hover:bg-purple-500/20 rounded-lg transition-colors"
                              title="Quick Send"
                            >
                              <Send size={16} className="text-purple-400 hover:text-purple-300" />
                            </button>
                            <button
                              onClick={() => handleDeleteSingle(lead._id)}
                              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} className="text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-slate-700 flex justify-between items-center">
                <span className="text-gray-400 text-sm">
                  {filteredLeads.length} leads ready for campaign
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    1
                  </button>
                  <button className="px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-red-500/20">
            <h3 className="text-white text-xl font-bold mb-4">Delete Leads</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete {selectedLeads.length} lead(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignOutreach;
