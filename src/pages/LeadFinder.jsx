import React, { useState, useContext, useEffect } from 'react';
import { LeadsContext } from '../context/LeadsContext.jsx';
import { FaSearch, FaMapMarkerAlt, FaStar, FaCopy, FaSave, FaFileExport, FaWhatsapp, FaEnvelope, FaGlobe, FaPhone, FaBuilding, FaFilter, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import axios from 'axios';

const LeadFinder = () => {
  const { addLeads, leads } = useContext(LeadsContext);
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxReviews: 1000,
    hasPhone: false,
    hasWebsite: false
  });
  const [showFilters, setShowFilters] = useState(false);

  // ✅ COPY URL FUNCTION
  const copyToClipboard = (text) => {
    if (!text) {
      toast.error('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied!');
  };

  // ✅ EXPORT EXCEL FUNCTION
  const exportExcel = () => {
    if (!filteredResults.length) {
      toast.error('No data to export');
      return;
    }

    const data = filteredResults.map(l => ({
      Name: l.name || '',
      Phone: l.phone || '',
      Website: l.website || '',
      Address: l.address || '',
      Rating: l.rating || 0,
      Reviews: l.reviews || 0,
      Category: l.category || '',
      Email: l.email || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_${Date.now()}.xlsx`);
    toast.success('📊 Excel exported successfully!');
  };

  // ✅ SEARCH LEADS
  const searchLeads = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://your-backend-url.railway.app/api/scrape', {
        query: searchQuery,
        location: location || 'Pakistan'
      });

      if (response.data.success) {
        setResults(response.data.data);
        setFilteredResults(response.data.data);
        toast.success(`Found ${response.data.data.length} leads!`);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAVE SELECTED LEADS
  const saveSelectedLeads = async () => {
    if (!selectedLeads.length) {
      toast.error('Please select at least one lead');
      return;
    }

    try {
      const leadsToSave = selectedLeads.map(lead => ({
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        website: lead.website || '',
        address: lead.address || '',
        rating: lead.rating || 0,
        reviews: lead.reviews || 0,
        category: lead.category || '',
        source: 'Local Business',
        status: 'new'
      }));

      await addLeads(leadsToSave);
      toast.success(`✅ ${leadsToSave.length} leads saved successfully!`);
      setSelectedLeads([]);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save leads');
    }
  };

  // ✅ SAVE ALL LEADS
  const saveAllLeads = async () => {
    if (!filteredResults.length) {
      toast.error('No leads to save');
      return;
    }

    try {
      const leadsToSave = filteredResults.map(lead => ({
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        website: lead.website || '',
        address: lead.address || '',
        rating: lead.rating || 0,
        reviews: lead.reviews || 0,
        category: lead.category || '',
        source: 'Local Business',
        status: 'new'
      }));

      await addLeads(leadsToSave);
      toast.success(`✅ ${leadsToSave.length} leads saved successfully!`);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save leads');
    }
  };

  // ✅ FILTER LEADS
  const applyFilters = () => {
    let filtered = [...results];

    if (filters.minRating > 0) {
      filtered = filtered.filter(l => l.rating >= filters.minRating);
    }
    if (filters.maxReviews < 1000) {
      filtered = filtered.filter(l => l.reviews <= filters.maxReviews);
    }
    if (filters.hasPhone) {
      filtered = filtered.filter(l => l.phone);
    }
    if (filters.hasWebsite) {
      filtered = filtered.filter(l => l.website);
    }

    setFilteredResults(filtered);
    toast.success(`Filtered to ${filtered.length} leads`);
  };

  // ✅ SELECT/DESELECT LEAD
  const toggleSelectLead = (lead) => {
    setSelectedLeads(prev => {
      const exists = prev.find(l => l.website === lead.website);
      if (exists) {
        return prev.filter(l => l.website !== lead.website);
      } else {
        return [...prev, lead];
      }
    });
  };

  // ✅ SELECT ALL
  const selectAll = () => {
    if (selectedLeads.length === filteredResults.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads([...filteredResults]);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaMapMarkerAlt className="text-purple-500" />
            Local Business Finder
          </h1>
          <p className="text-gray-500 text-sm">Find and save local business leads</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
          >
            <FaFileExport /> Export
          </button>
          <button 
            onClick={saveAllLeads}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
          >
            <FaSave /> Save All
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 border border-gray-200">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses (e.g., restaurants, plumbers)"
              className="w-full px-3 py-2 bg-transparent outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLeads()}
            />
          </div>
          <div className="flex items-center bg-gray-50 rounded-lg px-3 border border-gray-200">
            <FaMapMarkerAlt className="text-gray-400" />
            <input
              type="text"
              placeholder="Location"
              className="w-40 px-3 py-2 bg-transparent outline-none text-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button 
            onClick={searchLeads}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Rating</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                value={filters.minRating}
                onChange={(e) => setFilters({...filters, minRating: Number(e.target.value)})}
              >
                <option value={0}>Any</option>
                <option value={3}>3+ ⭐</option>
                <option value={4}>4+ ⭐</option>
                <option value={4.5}>4.5+ ⭐</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Reviews</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                value={filters.maxReviews}
                onChange={(e) => setFilters({...filters, maxReviews: Number(e.target.value)})}
              >
                <option value={1000}>Any</option>
                <option value={50}>50+</option>
                <option value={100}>100+</option>
                <option value={500}>500+</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                checked={filters.hasPhone}
                onChange={(e) => setFilters({...filters, hasPhone: e.target.checked})}
                className="rounded border-gray-300 text-purple-600"
              />
              <label className="text-sm text-gray-700">Has Phone</label>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                checked={filters.hasWebsite}
                onChange={(e) => setFilters({...filters, hasWebsite: e.target.checked})}
                className="rounded border-gray-300 text-purple-600"
              />
              <label className="text-sm text-gray-700">Has Website</label>
            </div>
            <div className="col-span-4 flex justify-end gap-2">
              <button 
                onClick={applyFilters}
                className="bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 text-sm"
              >
                Apply Filters
              </button>
              <button 
                onClick={() => {
                  setFilters({minRating: 0, maxReviews: 1000, hasPhone: false, hasWebsite: false});
                  setFilteredResults(results);
                }}
                className="border border-gray-300 px-4 py-1.5 rounded-lg hover:bg-gray-50 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      {results.length > 0 && (
        <div className="flex items-center gap-6 mb-4 text-sm">
          <span className="text-gray-600">Total: <strong>{results.length}</strong></span>
          <span className="text-gray-600">Showing: <strong>{filteredResults.length}</strong></span>
          <span className="text-gray-600">Selected: <strong>{selectedLeads.length}</strong></span>
          <button 
            onClick={selectAll}
            className="text-purple-600 hover:text-purple-700 text-sm"
          >
            {selectedLeads.length === filteredResults.length ? 'Deselect All' : 'Select All'}
          </button>
          {selectedLeads.length > 0 && (
            <button 
              onClick={saveSelectedLeads}
              className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 text-sm flex items-center gap-1"
            >
              <FaSave size={12} /> Save Selected
            </button>
          )}
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === filteredResults.length && filteredResults.length > 0}
                      onChange={selectAll}
                      className="rounded border-gray-300 text-purple-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredResults.map((lead, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLeads.some(l => l.website === lead.website)}
                        onChange={() => toggleSelectLead(lead)}
                        className="rounded border-gray-300 text-purple-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-800">{lead.name || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{lead.category || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {lead.phone ? (
                        <div className="flex items-center gap-1">
                          <span>{lead.phone}</span>
                          <button 
                            onClick={() => copyToClipboard(lead.phone)}
                            className="text-gray-400 hover:text-purple-500"
                            title="Copy phone"
                          >
                            <FaCopy size={12} />
                          </button>
                        </div>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {lead.website ? (
                        <div className="flex items-center gap-1">
                          <a 
                            href={lead.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline truncate max-w-32"
                          >
                            {lead.website.replace('https://', '').replace('http://', '').slice(0, 20)}
                          </a>
                          <button 
                            onClick={() => copyToClipboard(lead.website)}
                            className="text-gray-400 hover:text-purple-500"
                            title="Copy website"
                          >
                            <FaCopy size={12} />
                          </button>
                        </div>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {lead.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400" size={14} />
                          <span>{lead.rating}</span>
                        </div>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">{lead.reviews || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => copyToClipboard(lead.website || lead.phone || lead.name)}
                          className="text-gray-400 hover:text-purple-500 p-1"
                          title="Copy"
                        >
                          <FaCopy size={14} />
                        </button>
                        <button 
                          onClick={() => toggleSelectLead(lead)}
                          className="text-gray-400 hover:text-purple-500 p-1"
                          title="Select"
                        >
                          <FaSave size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">No Leads Found</h3>
          <p className="text-gray-400 text-sm mt-1">Search for local businesses to get started</p>
        </div>
      )}
    </div>
  );
};

export default LeadFinder; // ✅ DEFAULT EXPORT - IMPORTANT!
