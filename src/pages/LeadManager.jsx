import React, { useContext, useState } from 'react';
import { LeadsContext } from '../context/LeadsContext';
import {
  Users, Search, Filter, Download, Trash2,
  Edit, Eye, MoreVertical, Plus, X,
  ChevronDown, ChevronRight, Clock, Calendar,
  Star, Award, Brain, TrendingUp, TrendingDown,
  Mail, Phone, Globe, MapPin, Briefcase,
  CheckCircle, AlertCircle, Zap, Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';

const LeadManager = () => {
  const { leads, deleteLead, bulkDeleteLeads } = useContext(LeadsContext);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // AI Score calculation
  const calculateAIScore = (lead) => {
    let score = 0;
    if (lead.company) score += 15;
    if (lead.industry) score += 10;
    if (lead.socialProfiles?.linkedin) score += 10;
    if (lead.socialProfiles?.facebook) score += 5;
    if (lead.website) score += 10;
    if (lead.location) score += 10;
    if (lead.email) score += 7;
    if (lead.phone) score += 8;
    const highValueIndustries = ['Technology', 'Finance', 'Healthcare', 'Education'];
    if (highValueIndustries.includes(lead.industry)) score += 15;
    return Math.min(Math.round(score), 100);
  };

  // Filter leads
  const getFilteredLeads = () => {
    let filtered = [...leads];
    
    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }
    
    if (filterScore !== 'all') {
      const minScore = parseInt(filterScore);
      filtered = filtered.filter(l => calculateAIScore(l) >= minScore);
    }
    
    if (filterSource !== 'all') {
      filtered = filtered.filter(l => l.source === filterSource);
    }
    
    return filtered;
  };

  const filteredLeads = getFilteredLeads();

  // Export functions
  const exportToExcel = () => {
    const exportData = filteredLeads.map(l => ({
      Name: l.name || '',
      Company: l.company || '',
      Email: l.email || '',
      Phone: l.phone || '',
      Website: l.website || '',
      Location: l.location || '',
      Industry: l.industry || '',
      'AI Score': calculateAIScore(l),
      Status: l.status || '',
      Source: l.source || '',
      LinkedIn: l.socialProfiles?.linkedin || '',
      Facebook: l.socialProfiles?.facebook || '',
      Instagram: l.socialProfiles?.instagram || '',
      Twitter: l.socialProfiles?.twitter || '',
      'Created At': new Date(l.createdAt).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_manager_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Website', 'Location', 'Industry', 'AI Score', 'Status', 'Source', 'LinkedIn', 'Facebook', 'Instagram', 'Twitter', 'Created At'];
    const csvData = filteredLeads.map(l => [
      l.name || '',
      l.company || '',
      l.email || '',
      l.phone || '',
      l.website || '',
      l.location || '',
      l.industry || '',
      calculateAIScore(l),
      l.status || '',
      l.source || '',
      l.socialProfiles?.linkedin || '',
      l.socialProfiles?.facebook || '',
      l.socialProfiles?.instagram || '',
      l.socialProfiles?.twitter || '',
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
    a.download = `leads_manager_${new Date().toISOString().split('T')[0]}.csv`;
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

  // Pipeline stages
  const stages = [
    { id: 'new', label: 'New', color: 'blue', icon: '🆕' },
    { id: 'contacted', label: 'Contacted', color: 'yellow', icon: '📞' },
    { id: 'qualified', label: 'Qualified', color: 'green', icon: '✅' },
    { id: 'proposal', label: 'Proposal', color: 'orange', icon: '📄' },
    { id: 'closed', label: 'Closed', color: 'pink', icon: '🏆' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="text-purple-400" size={32} />
              Lead Manager
              <span className="text-sm bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1 rounded-full text-white text-xs font-medium">
                {leads.length} Total
              </span>
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              AI-powered lead management with smart pipeline
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Add Lead
            </button>
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

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/20 mb-6">
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
            
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none text-sm"
            >
              <option value="all">All Sources</option>
              <option value="google_maps">Google Maps</option>
              <option value="social_media">Social Media</option>
              <option value="website">Website</option>
              <option value="manual">Manual</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
                }`}
              >
                Kanban
              </button>
            </div>
          </div>
        </div>

        {/* View Mode */}
        {viewMode === 'list' ? (
          // List View
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
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
                    <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">AI Score</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Source</th>
                    <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => {
                    const aiScore = calculateAIScore(lead);
                    return (
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
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  aiScore >= 80 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                  aiScore >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                  'bg-gradient-to-r from-gray-500 to-slate-500'
                                }`}
                                style={{ width: `${aiScore}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${
                              aiScore >= 80 ? 'text-purple-400' :
                              aiScore >= 60 ? 'text-blue-400' :
                              'text-gray-400'
                            }`}>
                              {aiScore}%
                            </span>
                          </div>
                        </td>
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
                        <td className="px-4 py-3 text-gray-400 text-sm">{lead.source || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-slate-600 rounded-lg transition-colors">
                              <Eye size={16} className="text-gray-400 hover:text-white" />
                            </button>
                            <button className="p-1 hover:bg-slate-600 rounded-lg transition-colors">
                              <Edit size={16} className="text-gray-400 hover:text-white" />
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
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-700 flex justify-between items-center">
              <span className="text-gray-400 text-sm">
                Showing {filteredLeads.length} of {leads.length} leads
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm">
                  Previous
                </button>
                <button className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                  1
                </button>
                <button className="px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm">
                  2
                </button>
                <button className="px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm">
                  3
                </button>
                <button className="px-3 py-1 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Kanban View
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageLeads = filteredLeads.filter(l => l.status === stage.id);
              return (
                <div key={stage.id} className="min-w-[280px] flex-1">
                  <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{stage.icon}</span>
                        <h3 className="text-white font-medium">{stage.label}</h3>
                        <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs text-gray-300">
                          {stageLeads.length}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-white">
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {stageLeads.map((lead) => (
                        <div key={lead._id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600 hover:border-purple-500 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-white font-medium text-sm">{lead.name || 'Unnamed'}</h4>
                              <p className="text-gray-400 text-xs">{lead.company || ''}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Brain size={14} className="text-purple-400" />
                              <span className="text-white text-xs font-medium">{calculateAIScore(lead)}%</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-600">
                            {lead.email && (
                              <div className="flex items-center gap-1 text-gray-400 text-xs">
                                <Mail size={12} />
                                {lead.email.slice(0, 15)}...
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1 text-gray-400 text-xs">
                                <Phone size={12} />
                                {lead.phone}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-gray-500 text-xs">
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex gap-1">
                              <button className="p-1 hover:bg-slate-600 rounded transition-colors">
                                <Edit size={12} className="text-gray-400" />
                              </button>
                              <button 
                                onClick={() => handleDeleteSingle(lead._id)}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border border-purple-500/20 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-bold">Add New Lead</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Name *</label>
                  <input type="text" className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Company</label>
                  <input type="text" className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email</label>
                  <input type="email" className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Phone</label>
                  <input type="tel" className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Industry</label>
                  <select className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none">
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Status</label>
                  <select className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Location</label>
                <input type="text" className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none" />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Notes</label>
                <textarea rows="3" className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none resize-none"></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManager;
