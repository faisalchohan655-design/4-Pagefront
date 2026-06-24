// frontend/src/pages/LeadFinder.jsx
import { useState } from 'react';
import { useLeads } from '../context/LeadsContext.jsx';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  FaSearch, FaSpinner, FaMapMarkerAlt, FaSave, FaDownload, 
  FaTrash, FaStar, FaPhone, FaGlobe, FaFilter, FaCheckCircle,
  FaEye, FaCopy
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const LeadFinder = () => {
  const { addLeads } = useLeads();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('New York, New York, United States');
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filterRating, setFilterRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const locations = [
    'New York, New York, United States',
    'Los Angeles, California, United States',
    'Chicago, Illinois, United States',
    'Houston, Texas, United States',
    'Austin, Texas, United States',
    'Miami, Florida, United States',
    'London, England, United Kingdom',
    'Toronto, Ontario, Canada'
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('🔍 Enter a business type to search');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`🔍 Searching for ${query}...`);

    try {
      const res = await api.post('/maps/search', {
        query: query.trim(),
        location,
        limit
      });

      setResults(res.data.results || []);
      setSelected([]);
      setCurrentPage(1);
      toast.success(`🎯 Found ${res.data.count} businesses`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Search failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!filteredResults.length) {
      toast.error('No leads to save');
      return;
    }

    setSaving(true);
    const toastId = toast.loading(`💾 Saving ${filteredResults.length} leads...`);

    try {
      await addLeads(filteredResults);
      setResults([]);
      setSelected([]);
      toast.success(`✅ ${filteredResults.length} leads saved!`, { id: toastId });
    } catch (err) {
      toast.error('Failed to save', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSelected = async () => {
    if (!selected.length) {
      toast.error('No leads selected');
      return;
    }

    const leadsToSave = results.filter((_, idx) => selected.includes(idx));
    setSaving(true);
    const toastId = toast.loading(`💾 Saving ${leadsToSave.length} leads...`);

    try {
      await addLeads(leadsToSave);
      setResults(results.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      toast.success(`✅ ${leadsToSave.length} leads saved!`, { id: toastId });
    } catch (err) {
      toast.error('Failed to save', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = () => {
    if (!selected.length) {
      toast.error('No leads selected');
      return;
    }
    setResults(results.filter((_, idx) => !selected.includes(idx)));
    setSelected([]);
    toast.success(`🗑️ ${selected.length} leads removed`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied!');
  };

  const exportCSV = () => {
    if (!filteredResults.length) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Name', 'Phone', 'Website', 'Address', 'Rating', 'Reviews'];
    const rows = filteredResults.map(l => [
      l.name || '',
      l.phone || '',
      l.website || '',
      l.address || '',
      l.rating || 0,
      l.reviews || 0
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📄 CSV exported');
  };

  const exportExcel = () => {
    if (!filteredResults.length) {
      toast.error('No data');
      return;
    }

    const data = filteredResults.map(l => ({
      Name: l.name || '',
      Phone: l.phone || '',
      Website: l.website || '',
      Address: l.address || '',
      Rating: l.rating || 0,
      Reviews: l.reviews || 0
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_${Date.now()}.xlsx`);
    toast.success('📊 Excel exported');
  };

  const filteredResults = results.filter(l => (l.rating || 0) >= filterRating);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filteredResults.slice(indexOfFirst, indexOfLast);

  const toggleSelectAll = () => {
    if (selected.length === currentLeads.length) setSelected([]);
    else setSelected(currentLeads.map((_, idx) => indexOfFirst + idx));
  };

  const toggleSelect = (idx) => {
    const globalIdx = indexOfFirst + idx;
    if (selected.includes(globalIdx)) {
      setSelected(selected.filter(i => i !== globalIdx));
    } else {
      setSelected([...selected, globalIdx]);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return '—';
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} className={`text-xs ${i < Math.floor(rating) ? 'text-warning' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <FaMapMarkerAlt className="text-primary-500" />
          Lead Finder
        </h1>
        <p className="text-gray-500 mt-1">Discover high-quality leads from Google Maps</p>
      </div>

      {/* Search Section */}
      <div className="glass-card p-6 rounded-2xl mb-6 border border-white/20">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-gray-600 block mb-1">Business Type</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., coffee shop, dentist"
              className="input-field"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="select-field"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Max Results</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
              min="1"
              max="100"
              className="input-field"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          {loading ? 'Searching...' : '🔍 Find Leads'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="btn-success flex items-center gap-2"
              >
                <FaSave /> Save All
              </button>
              <button
                onClick={handleSaveSelected}
                disabled={saving || !selected.length}
                className="btn-primary flex items-center gap-2"
              >
                <FaSave /> Save Selected ({selected.length})
              </button>
              <button
                onClick={handleDeleteSelected}
                className="btn-danger flex items-center gap-2"
              >
                <FaTrash /> Delete
              </button>
              <button
                onClick={exportCSV}
                className="btn-outline flex items-center gap-2"
              >
                <FaDownload /> CSV
              </button>
              <button
                onClick={exportExcel}
                className="btn-outline flex items-center gap-2"
              >
                <FaDownload /> Excel
              </button>
            </div>
            <div className="text-sm text-gray-500 bg-white/80 px-4 py-2 rounded-xl shadow-card border border-white/20">
              <span className="font-semibold text-primary-500">{filteredResults.length}</span> leads found
            </div>
          </div>

          {/* Filter */}
          <div className="glass-card p-4 rounded-xl mb-4 border border-white/20 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Min Rating:</span>
            </div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(parseFloat(e.target.value))}
              className="select-field w-auto min-w-[120px]"
            >
              <option value="0">All</option>
              <option value="3">3+ ⭐</option>
              <option value="3.5">3.5+ ⭐</option>
              <option value="4">4+ ⭐</option>
              <option value="4.5">4.5+ ⭐</option>
            </select>
            <span className="text-xs text-gray-400 ml-auto">
              {filteredResults.length} of {results.length} shown
            </span>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header w-10"><input type="checkbox" onChange={toggleSelectAll} checked={selected.length === currentLeads.length && currentLeads.length > 0} className="w-4 h-4 accent-primary-500" /></th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Website</th>
                  <th className="table-header">Rating</th>
                  <th className="table-header">Reviews</th>
                  <th className="table-header text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead, idx) => {
                  const globalIdx = indexOfFirst + idx;
                  return (
                    <tr key={globalIdx} className="hover:bg-primary-50/30 transition-colors">
                      <td className="table-cell">
                        <input
                          type="checkbox"
                          checked={selected.includes(globalIdx)}
                          onChange={() => toggleSelect(idx)}
                          className="w-4 h-4 accent-primary-500"
                        />
                      </td>
                      <td className="table-cell font-medium text-dark">{lead.name}</td>
                      <td className="table-cell">
                        {lead.phone ? (
                          <div className="flex items-center gap-1">
                            <FaPhone className="text-success text-xs" />
                            <span className="text-gray-600">{lead.phone}</span>
                            <button onClick={() => copyToClipboard(lead.phone)} className="text-gray-400 hover:text-primary-500 transition">
                              <FaCopy size={12} />
                            </button>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="table-cell">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noopener" className="text-primary-500 hover:underline flex items-center gap-1">
                            <FaGlobe size={12} /> Visit
                          </a>
                        ) : '-'}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          {renderStars(lead.rating)}
                          <span className="text-xs text-gray-400 ml-1">{lead.rating || '-'}</span>
                        </div>
                      </td>
                      <td className="table-cell">{lead.reviews || 0}</td>
                      <td className="table-cell text-center">
                        <div className="flex items-center justify-center gap-2">
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="text-success hover:text-success/70 transition" title="Call">
                              <FaPhone size={14} />
                            </a>
                          )}
                          {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener" className="text-primary-500 hover:text-primary-700 transition" title="Visit Website">
                              <FaGlobe size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-card border border-white/20 text-gray-600 disabled:opacity-50 hover:bg-primary-50 transition"
              >
                ◀ Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-card border border-white/20 text-gray-600 disabled:opacity-50 hover:bg-primary-50 transition"
              >
                Next ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeadFinder;
