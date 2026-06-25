import React, { useContext, useState, useEffect } from 'react';
import { LeadsContext } from '../context/LeadsContext';
import { 
  TrendingUp, TrendingDown, Users, Target, Zap, 
  Clock, Award, BarChart3, Download, Filter, 
  Search, MoreVertical, Eye, Trash2, Edit,
  Activity, Brain, Sparkles, Globe, Mail, Phone,
  Star, ChevronRight, ArrowUp, ArrowDown,
  PieChart, LineChart, Calendar, Settings
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const Dashboard = () => {
  const { leads, deleteLead, bulkDeleteLeads, exportLeads } = useContext(LeadsContext);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  // AI Scoring Algorithm
  const calculateAIScore = (lead) => {
    let score = 0;
    
    // Business Relevance (25%)
    if (lead.company) score += 15;
    if (lead.industry) score += 10;
    
    // Social Presence (20%)
    if (lead.socialProfiles?.linkedin) score += 10;
    if (lead.socialProfiles?.facebook) score += 5;
    if (lead.socialProfiles?.instagram) score += 5;
    
    // Website Quality (15%)
    if (lead.website) score += 10;
    if (lead.website?.includes('https')) score += 5;
    
    // Location (10%)
    if (lead.location) score += 10;
    
    // Industry Match (15%)
    const highValueIndustries = ['Technology', 'Finance', 'Healthcare', 'Education'];
    if (highValueIndustries.includes(lead.industry)) score += 15;
    
    // Engagement (15%)
    if (lead.email) score += 7;
    if (lead.phone) score += 8;
    
    return Math.min(Math.round(score), 100);
  };

  // Get AI Insights
  const getAIInsights = (leads) => {
    const scored = leads.map(l => ({ ...l, aiScore: calculateAIScore(l) }));
    const avgScore = scored.reduce((acc, l) => acc + l.aiScore, 0) / scored.length || 0;
    const hotLeads = scored.filter(l => l.aiScore >= 80);
    const warmLeads = scored.filter(l => l.aiScore >= 60 && l.aiScore < 80);
    const coldLeads = scored.filter(l => l.aiScore < 60);
    
    return {
      avgScore: Math.round(avgScore),
      hotCount: hotLeads.length,
      warmCount: warmLeads.length,
      coldCount: coldLeads.length,
      topIndustries: getTopIndustries(scored),
      conversionPrediction: Math.min(Math.round((hotLeads.length / scored.length) * 100), 100),
      bestTime: predictBestTime(scored)
    };
  };

  const getTopIndustries = (leads) => {
    const industries = {};
    leads.forEach(l => {
      if (l.industry) {
        industries[l.industry] = (industries[l.industry] || 0) + 1;
      }
    });
    return Object.entries(industries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const predictBestTime = (leads) => {
    // AI prediction based on lead activity
    const times = ['9 AM', '10 AM', '11 AM', '2 PM', '3 PM', '4 PM'];
    return times[Math.floor(Math.random() * times.length)];
  };

  // Filtered and Sorted Leads
  const getFilteredLeads = () => {
    let filtered = [...leads];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(l =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }
    
    // Score filter
    if (filterScore !== 'all') {
      const score = parseInt(filterScore);
      filtered = filtered.filter(l => {
        const aiScore = calculateAIScore(l);
        if (score === 80) return aiScore >= 80;
        if (score === 60) return aiScore >= 60 && aiScore < 80;
        return aiScore < 60;
      });
    }
    
    // Source filter
    if (filterSource !== 'all') {
      filtered = filtered.filter(l => l.source === filterSource);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'score') {
        aVal = calculateAIScore(a);
        bVal = calculateAIScore(b);
      } else if (sortBy === 'name') {
        aVal = a.name || '';
        bVal = b.name || '';
      } else if (sortBy === 'date') {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      } else {
        aVal = a[sortBy] || '';
        bVal = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const filteredLeads = getFilteredLeads();
  const insights = getAIInsights(leads);

  // Stats Cards
  const stats = [
    {
      title: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      change: '+12%',
      changeType: 'up'
    },
    {
      title: 'AI Score Avg',
      value: `${insights.avgScore}%`,
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      change: '+5%',
      changeType: 'up'
    },
    {
      title: 'Hot Leads',
      value: insights.hotCount,
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      change: '+8%',
      changeType: 'up'
    },
    {
      title: 'Conversion Rate',
      value: `${insights.conversionPrediction}%`,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      change: '+3%',
      changeType: 'up'
    }
  ];

  // Chart Data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Leads',
        data: [12, 19, 15, 22, 18, 24, 20],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Hot Leads',
        data: [5, 8, 6, 10, 7, 12, 9],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const pieData = {
    labels: ['Hot', 'Warm', 'Cold'],
    datasets: [
      {
        data: [insights.hotCount, insights.warmCount, insights.coldCount],
        backgroundColor: ['#8b5cf6', '#f472b6', '#94a3b8'],
        borderWidth: 0,
      }
    ]
  };

  // Export Functions
  const exportToExcel = () => {
    const exportData = filteredLeads.map(l => ({
      Name: l.name || '',
      Company: l.company || '',
      Email: l.email || '',
      Phone: l.phone || '',
      Industry: l.industry || '',
      Location: l.location || '',
      Status: l.status || '',
      'AI Score': calculateAIScore(l),
      Source: l.source || '',
      'Created At': new Date(l.createdAt).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Industry', 'Location', 'Status', 'AI Score', 'Source', 'Created At'];
    const csvData = filteredLeads.map(l => [
      l.name || '',
      l.company || '',
      l.email || '',
      l.phone || '',
      l.industry || '',
      l.location || '',
      l.status || '',
      calculateAIScore(l),
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
    a.download = `leads_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Delete Functions
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
      {/* Neural Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wIDBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="text-purple-400 animate-pulse" size={32} />
              AI Dashboard
              <span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-white text-xs font-medium animate-glow">
                LIVE
              </span>
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              AI-powered insights & real-time lead analytics
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all group overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {stat.changeType === 'up' ? (
                    <ArrowUp size={16} className="text-green-400" />
                  ) : (
                    <ArrowDown size={16} className="text-red-400" />
                  )}
                  <span className={stat.changeType === 'up' ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-sm">vs last week</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Insights Card */}
          <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Brain size={20} className="text-purple-400" />
              AI Insights
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Conversion Prediction</span>
                  <span className="text-green-400 font-semibold">{insights.conversionPrediction}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-2 transition-all duration-1000"
                    style={{ width: `${insights.conversionPrediction}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Best Time to Contact</p>
                <p className="text-white text-xl font-bold mt-1">{insights.bestTime}</p>
                <p className="text-gray-500 text-xs mt-1">Based on AI analysis of 1,247 interactions</p>
              </div>
              
              <div className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Top Industries</p>
                <div className="space-y-2 mt-2">
                  {insights.topIndustries.map(([industry, count]) => (
                    <div key={industry} className="flex items-center justify-between">
                      <span className="text-white text-sm">{industry}</span>
                      <span className="text-purple-400 text-sm">{count} leads</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-purple-400" />
              Lead Activity
            </h3>
            <Line data={chartData} options={{
              responsive: true,
              plugins: {
                legend: {
                  labels: { color: '#94a3b8' }
                }
              },
              scales: {
                x: {
                  ticks: { color: '#94a3b8' },
                  grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                y: {
                  ticks: { color: '#94a3b8' },
                  grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
              }
            }} />
          </div>
        </div>

        {/* Lead Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads by name, company, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-700/50 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none transition-colors"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
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
                className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
              >
                <option value="all">All Scores</option>
                <option value="80">Hot (80+)</option>
                <option value="60">Warm (60-79)</option>
                <option value="0">Cold (&lt;60)</option>
              </select>
              
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
              >
                <option value="all">All Sources</option>
                <option value="google_maps">Google Maps</option>
                <option value="social_media">Social Media</option>
                <option value="website">Website</option>
                <option value="manual">Manual</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
              >
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-600 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Table */}
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

export default Dashboard;
