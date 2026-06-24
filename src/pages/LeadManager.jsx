// src/pages/LeadManager.jsx
import { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import toast from 'react-hot-toast';
import { FaSearch, FaTrash, FaDownload, FaCopy, FaEye } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const LeadManager = () => {
  const { leads, deleteBulk } = useLeads();
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter leads
  const filteredLeads = leads.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.email?.toLowerCase().includes(search.toLowerCase()) ||
    l.phone?.includes(search)
  );

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirst, indexOfLast);

  // Delete selected
  const handleDeleteSelected = async () => {
    if (!selected.length) {
      toast.error('No leads selected');
      return;
    }
    await deleteBulk(selected);
    setSelected([]);
  };

  // ✅ COPY URL
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied!');
  };

  // ✅ EXPORT EXCEL
  const exportExcel = () => {
    if (!filteredLeads.length) {
      toast.error('No data to export');
      return;
    }

    const data = filteredLeads.map(l => ({
      Name: l.name || '',
      Email: l.email || '',
      Phone: l.phone || '',
      Website: l.website || '',
      Address: l.address || '',
      Rating: l.rating || 0,
      Source: l.source || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_${Date.now()}.xlsx`);
    toast.success('📊 Excel exported');
  };

  // ✅ EXPORT CSV
  const exportCSV = () => {
    if (!filteredLeads.length) {
      toast.error('No data');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Website', 'Address', 'Rating', 'Source'];
    const rows = filteredLeads.map(l => [
      l.name || '',
      l.email || '',
      l.phone || '',
      l.website || '',
      l.address || '',
      l.rating || 0,
      l.source || ''
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

  const toggleSelectAll = () => {
    if (selected.length === currentLeads.length) setSelected([]);
    else setSelected(currentLeads.map(l => l._id));
  };

  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-3xl font-bold gradient-text mb-6 flex items-center gap-2">
        <FaEye className="text-primary-500" /> Lead Manager
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card border border-white/20">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold">{leads.length}</p>
        </div>
        <div className="stat-card border border-white/20">
          <p className="text-sm text-gray-500">Filtered</p>
          <p className="text-2xl font-bold">{filteredLeads.length}</p>
        </div>
        <div className="stat-card border border-white/20">
          <p className="text-sm text-gray-500">Selected</p>
          <p className="text-2xl font-bold">{selected.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 rounded-xl mb-4 border border-white/20">
        <div className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="input-field flex-1"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={handleDeleteSelected} className="btn-danger flex items-center gap-2">
          <FaTrash /> Delete Selected
        </button>
        <button onClick={exportCSV} className="btn-outline flex items-center gap-2">
          <FaDownload /> CSV
        </button>
        <button onClick={exportExcel} className="btn-primary flex items-center gap-2">
          <FaDownload /> Excel
        </button>
        <span className="text-sm text-gray-500 ml-auto">{filteredLeads.length} leads</span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header w-10">
                <input type="checkbox" onChange={toggleSelectAll} checked={selected.length === currentLeads.length && currentLeads.length > 0} />
              </th>
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Phone</th>
              <th className="table-header">Website</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.map((lead) => (
              <tr key={lead._id} className="hover:bg-primary-50/30 transition-colors">
                <td className="table-cell">
                  <input
                    type="checkbox"
                    checked={selected.includes(lead._id)}
                    onChange={() => toggleSelect(lead._id)}
                  />
                </td>
                <td className="table-cell font-medium">{lead.name || '-'}</td>
                <td className="table-cell text-primary-500">{lead.email || '-'}</td>
                <td className="table-cell">{lead.phone || '-'}</td>
                <td className="table-cell">
                  {lead.website ? (
                    <a href={lead.website} target="_blank" rel="noopener" className="text-primary-500 hover:underline">
                      Visit
                    </a>
                  ) : '-'}
                </td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    {/* ✅ COPY EMAIL */}
                    {lead.email && (
                      <button onClick={() => copyToClipboard(lead.email)} className="text-gray-400 hover:text-primary-500" title="Copy Email">
                        <FaCopy />
                      </button>
                    )}
                    {/* ✅ COPY PHONE */}
                    {lead.phone && (
                      <button onClick={() => copyToClipboard(lead.phone)} className="text-gray-400 hover:text-primary-500" title="Copy Phone">
                        <FaCopy />
                      </button>
                    )}
                    {/* ✅ COPY WEBSITE */}
                    {lead.website && (
                      <button onClick={() => copyToClipboard(lead.website)} className="text-gray-400 hover:text-primary-500" title="Copy Website">
                        <FaCopy />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">
            ◀ Prev
          </button>
          <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadManager;
