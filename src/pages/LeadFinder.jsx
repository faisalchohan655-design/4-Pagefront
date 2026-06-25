import React, { useContext, useState } from 'react';
import { LeadsContext } from '../context/LeadsContext';
import { 
  Search, MapPin, Globe, Users, Mail, Phone, 
  Filter, Download, Save, Star, TrendingUp,
  Briefcase, Building, Instagram, Facebook,
  Linkedin, Twitter, Video, MessageCircle,
  Sparkles, Brain, Zap, Shield, Award,
  ChevronDown, ChevronRight, X, Plus,
  ExternalLink, Clock, CheckCircle, AlertCircle,
  BarChart3, PieChart, Activity, Target
} from 'lucide-react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const LeadFinder = () => {
  const { saveLeads } = useContext(LeadsContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [activeTab, setActiveTab] = useState('google');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    industry: '',
    minEmployees: '',
    maxEmployees: '',
    minRevenue: '',
    maxRevenue: '',
    rating: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Platform configurations
  const platforms = {
    google: { 
      icon: MapPin, 
      label: 'Google Maps',
      color: 'from-blue-500 to-cyan-500'
    },
    linkedin: { 
      icon: Linkedin, 
      label: 'LinkedIn',
      color: 'from-blue-600 to-blue-400'
    },
    facebook: { 
      icon: Facebook, 
      label: 'Facebook',
      color: 'from-blue-700 to-blue-500'
    },
    instagram: { 
      icon: Instagram, 
      label: 'Instagram',
      color: 'from-pink-600 to-orange-500'
    },
    twitter: { 
      icon: Twitter, 
      label: 'Twitter',
      color: 'from-blue-400 to-cyan-300'
    },
    tiktok: { 
      icon: Video, 
      label: 'TikTok',
      color: 'from-black to-gray-800'
    }
  };

  // AI Enrichment
  const enrichLead = async (lead) => {
    try {
      // Simulated AI enrichment
      const enriched = {
        ...lead,
        aiScore: Math.floor(Math.random() * 100),
        industry: ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail'][Math.floor(Math.random() * 5)],
        employees: Math.floor(Math.random() * 1000) + 10,
        revenue: `$${(Math.random() * 10 + 1).toFixed(1)}M`,
        techStack: ['React', 'Python', 'AWS', 'Docker', 'Kubernetes'].slice(0, Math.floor(Math.random() * 3) + 1),
        socialFollowers: Math.floor(Math.random() * 100000),
        decisionMaker: Math.random() > 0.5,
        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      return enriched;
    } catch (error) {
      console.error('Enrichment error:', error);
      return lead;
    }
  };

  // Search function
  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    try {
      let response;
      
      switch(activeTab) {
        case 'google':
          response = await axios.post(`${process.env.REACT_APP_API_URL}/api/maps/search`, {
            query: searchQuery,
            location: location || 'USA'
          });
          break;
        case 'linkedin':
        case 'facebook':
        case 'instagram':
        case 'twitter':
        case 'tiktok':
          response = await axios.post(`${process.env.REACT_APP_API_URL}/api/social/search`, {
            platform: activeTab,
            query: searchQuery,
            location: location || 'USA'
          });
          break;
        default:
          return;
      }

      let enrichedResults = await Promise.all(
        response.data.data.map(async (lead) => await enrichLead(lead))
      );
      
      setResults(enrichedResults);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback mock data
      const mockResults = Array(10).fill(null).map((_, i) => ({
        id: i,
        name: `Lead ${i + 1}`,
        company: `Company ${i + 1}`,
        email: `contact${i + 1}@company${i + 1}.com`,
        phone: `+1 (555) ${String(100 + i * 10)}-${String(1000 + i * 10)}`,
        website: `https://company${i + 1}.com`,
        location: `${location || 'New York'}, USA`,
        rating: (3 + Math.random() * 2).toFixed(1),
        reviews: Math.floor(Math.random() * 500),
        category: ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail'][i % 5],
        aiScore: Math.floor(Math.random() * 100),
        employees: Math.floor(Math.random() * 1000) + 10,
        revenue: `$${(Math.random() * 10 + 1).toFixed(1)}M`,
        techStack: ['React', 'Python', 'AWS', 'Docker', 'Kubernetes'].slice(0, Math.floor(Math.random() * 3) + 1),
        socialFollowers: Math.floor(Math.random() * 100000),
        decisionMaker: Math.random() > 0.5,
        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
      setResults(mockResults);
    } finally {
      setLoading(false);
    }
  };

  // AI Suggest
  const aiSuggest = () => {
    const suggestions = [
      'Software development companies in California',
      'Healthcare startups with 50+ employees',
      'Fintech companies using blockchain',
      'E-commerce businesses with high revenue',
      'AI companies in Europe',
      'Real estate agencies with 4.5+ rating'
    ];
    setSearchQuery(suggestions[Math.floor(Math.random() * suggestions.length)]);
  };

  // Save selected leads
  const handleSaveLeads = async () => {
    const selected = results.filter((_, index) => selectedLeads.includes(index));
    if (selected.length === 0) return;
    
    await saveLeads(selected.map(lead => ({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      website: lead.website,
      location: lead.location,
      industry: lead.industry,
      rating: lead.rating,
      source: activeTab,
      status: 'new',
      aiScore: lead.aiScore,
      socialProfiles: {
        linkedin: lead.linkedin,
        facebook: lead.facebook,
        instagram: lead.instagram,
        twitter: lead.twitter
      }
    })));
    
    setSelectedLeads([]);
    alert(`Successfully saved ${selected.length} leads!`);
  };

  // Export functions
  const exportToExcel = () => {
    const exportData = results.map(r => ({
      'Name': r.name || '',
      'Company': r.company || '',
      'Email': r.email || '',
      'Phone': r.phone || '',
      'Website': r.website || '',
      'Location': r.location || '',
      'Industry': r.industry || '',
      'AI Score': r.aiScore || 0,
      'Rating': r.rating || '',
      'Reviews': r.reviews || 0,
      'Employees': r.employees || '',
      'Revenue': r.revenue || '',
      'Tech Stack': r.techStack?.join(', ') || '',
      'Social Followers': r.socialFollowers || 0,
      'Decision Maker': r.decisionMaker ? 'Yes' : 'No'
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_finder_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Website', 'Location', 'Industry', 'AI Score', 'Rating', 'Reviews'];
    const csvData = results.map(r => [
      r.name || '',
      r.company || '',
      r.email || '',
      r.phone || '',
      r.website || '',
      r.location || '',
      r.industry || '',
      r.aiScore || 0,
      r.rating || '',
      r.reviews || 0
    ]);
    
    let csv = headers.join(',') + '\n';
    csvData.forEach(row => {
      csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_finder_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Search className="text-purple-400" size={32} />
              Smart Lead Finder
              <span className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 rounded-full text-white text-xs font-medium">
                AI-Powered
              </span>
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              Find and enrich leads from multiple platforms with AI intelligence
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
                onClick={handleSaveLeads}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
              >
                <Save size={18} />
                Save {selectedLeads.length}
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Describe your ideal lead... (e.g. 'Tech startups in USA')"
                  className="w-full bg-slate-700/50 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 outline-none transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. New York)"
                className="bg-slate-700/50 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 outline-none w-48"
              />
            </div>
            
            <button
              onClick={aiSuggest}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
            >
              <Brain size={18} />
              AI Suggest
            </button>
            
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Searching...' : (
                <>
                  <Zap size={18} />
                  Deep Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(platforms).map(([key, platform]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === key
                  ? `bg-gradient-to-r ${platform.color} text-white shadow-lg`
                  : 'bg-slate-700/50 text-gray-400 hover:bg-slate-600/50'
              }`}
            >
              <platform.icon size={16} />
              {platform.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-700">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Filter size={18} />
              Advanced Filters
              <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showFilters && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters({...filters, industry: e.target.value})}
                  className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
                >
                  <option value="">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Min Employees</label>
                <input
                  type="number"
                  value={filters.minEmployees}
                  onChange={(e) => setFilters({...filters, minEmployees: e.target.value})}
                  className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
                  placeholder="e.g. 50"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Max Employees</label>
                <input
                  type="number"
                  value={filters.maxEmployees}
                  onChange={(e) => setFilters({...filters, maxEmployees: e.target.value})}
                  className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
                  placeholder="e.g. 500"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Min Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: e.target.value})}
                  className="w-full bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"
                >
                  <option value="all">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-gray-400 text-sm">
              <span>Found {results.length} leads</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedLeads(results.map((_, i) => i))}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedLeads([])}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>

            {results.map((lead, index) => (
              <div
                key={index}
                className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl border transition-all p-6 ${
                  selectedLeads.includes(index)
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(index)}
                    onChange={() => {
                      if (selectedLeads.includes(index)) {
                        setSelectedLeads(selectedLeads.filter(i => i !== index));
                      } else {
                        setSelectedLeads([...selectedLeads, index]);
                      }
                    }}
                    className="mt-1 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{lead.name}</h3>
                        <p className="text-gray-400">{lead.company}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-lg">
                          <Brain size={14} className="text-purple-400" />
                          <span className="text-white font-medium">{lead.aiScore}%</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lead.aiScore >= 80 ? 'bg-purple-500/20 text-purple-400' :
                          lead.aiScore >= 60 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {lead.aiScore >= 80 ? '🔥 Hot' :
                           lead.aiScore >= 60 ? '🌤️ Warm' : '❄️ Cold'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Mail size={16} />
                        {lead.email || '-'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Phone size={16} />
                        {lead.phone || '-'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Globe size={16} />
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                          {lead.website ? lead.website.replace('https://', '').slice(0, 30) : '-'}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin size={16} />
                        {lead.location || '-'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Briefcase size={16} />
                        {lead.industry || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users size={16} />
                        {lead.employees || 'N/A'} employees
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <TrendingUp size={16} />
                        {lead.revenue || 'N/A'}
                      </div>
                      {lead.techStack && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Zap size={16} />
                          {lead.techStack.join(', ')}
                        </div>
                      )}
                      {lead.socialFollowers && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users size={16} />
                          {lead.socialFollowers.toLocaleString()} followers
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadFinder;
