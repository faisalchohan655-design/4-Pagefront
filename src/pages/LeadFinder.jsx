import React, { useState, useContext } from 'react';
import { LeadsContext } from '../context/LeadsContext.jsx';
import { FaSearch, FaMapMarkerAlt, FaSave, FaCopy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const LeadFinder = () => {
  const { addLeads, searchGoogleMaps } = useContext(LeadsContext);
  
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Enter a search term');
      return;
    }

    setLoading(true);
    const data = await searchGoogleMaps(query, location);
    if (data && data.success) {
      setResults(data.data);
      toast.success(`Found ${data.data.length} leads!`);
    }
    setLoading(false);
  };

  const handleSaveAll = async () => {
    if (results.length === 0) {
      toast.error('No leads to save');
      return;
    }
    await addLeads(results);
    setResults([]);
  };

  const handleSaveSelected = async () => {
    if (selected.length === 0) {
      toast.error('Select at least one lead');
      return;
    }
    await addLeads(selected);
    setSelected([]);
  };

  const toggleSelect = (lead) => {
    setSelected(prev => {
      const exists = prev.find(l => l.website === lead.website);
      return exists ? prev.filter(l => l.website !== lead.website) : [...prev, lead];
    });
  };

  const exportExcel = () => {
    if (results.length === 0) {
      toast.error('No data to export');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_${Date.now()}.xlsx`);
    toast.success('Exported!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">🔍 Lead Finder</h1>
      <p className="text-gray-500 mt-1">Find local business leads from Google Maps</p>

      {/* Search Bar */}
      <div className="flex gap-3 mt-4">
        <input
          type="text"
          placeholder="Search businesses..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <input
          type="text"
          placeholder="Location"
          className="w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
        >
          <FaSearch /> {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Actions */}
      {results.length > 0 && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FaSave /> Save All ({results.length})
          </button>
          <button
            onClick={handleSaveSelected}
            disabled={selected.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <FaSave /> Save Selected ({selected.length})
          </button>
          <button
            onClick={exportExcel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Export Excel
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      checked={selected.length === results.length}
                      onChange={() => setSelected(selected.length === results.length ? [] : [...results])}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((lead, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.some(l => l.website === lead.website)}
                        onChange={() => toggleSelect(lead)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{lead.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-purple-600">
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {lead.website.replace('https://', '').slice(0, 20)}...
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.rating || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center py-12 bg-white rounded-xl border border-gray-100">
          <FaMapMarkerAlt className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Search for businesses to find leads</p>
        </div>
      )}
    </div>
  );
};

export default LeadFinder;
