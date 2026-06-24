// frontend/src/pages/EmailExtractor.jsx
import { useState } from 'react';
import { useLeads } from '../context/LeadsContext.jsx';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  FaSearch, FaSpinner, FaEnvelope, FaSave, FaDownload, 
  FaTrash, FaLink, FaCheckCircle, FaCopy, FaGlobe
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const EmailExtractor = () => {
  const { addLeads } = useLeads();
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [deep, setDeep] = useState(false);
  const [extractSocial, setExtractSocial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleExtract = async () => {
    if (!singleUrl && !bulkUrls) {
      toast.error('🔗 Please enter at least one URL');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('🔍 Scanning for emails...');

    try {
      let response;
      if (bulkUrls) {
        const urls = bulkUrls.split('\n').filter(u => u.trim());
        if (!urls.length) throw new Error('No valid URLs');
        response = await api.post('/email/bulk-extract', {
          urls,
          deep,
          extractSocial
        });
      } else {
        response = await api.post('/email/extract', {
          url: singleUrl,
          deep,
          extractSocial
        });
      }

      setResults(response.data.leads || []);
      setSelected([]);
      setCurrentPage(1);
      toast.success(`📧 Found ${response.data.count} emails`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Extraction failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!results.length) {
      toast.error('No emails to save');
      return;
    }

    setSaving(true);
    const toastId = toast.loading(`💾 Saving ${results.length} leads...`);

    try {
      await addLeads(results);
      setResults([]);
      setSelected([]);
      toast.success(`✅ ${results.length} leads saved!`, { id: toastId });
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
    if (!results.length) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Email', 'Phone', 'Source', 'Verified'];
    const rows = results.map(l => [
      l.email || '',
      l.phone || '',
      l.source || '',
      l.verified ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emails_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📄 CSV exported');
  };

  const exportExcel = () => {
    if (!results.length) {
      toast.error('No data');
      return;
    }

    const data = results.map(l => ({
      Email: l.email || '',
      Phone: l.phone || '',
      Source: l.source || '',
      Verified: l.verified ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Emails');
    XLSX.writeFile(wb, `emails_${Date.now()}.xlsx`);
    toast.success('📊 Excel exported');
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = results.slice(indexOfFirst, indexOfLast);

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

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <FaEnvelope className="text-secondary-500" />
          Email Extractor
        </h1>
        <p className="text-gray-500 mt-1">Extract emails and phone numbers from websites</p>
      </div>

      {/* Input Section */}
      <div className="glass-card p-6 rounded-2xl mb-6 border border-white/20">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Single URL</label>
            <input
              type="text"
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              placeholder="https://example.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Bulk URLs (one per line)</label>
            <textarea
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder="https://site1.com\nhttps://site2.com"
              className="input-field h-[72px] resize-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} className="w-4 h-4 accent-primary-500" />
            <span className="text-sm text-gray-600">Deep Crawl</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={extractSocial} onChange={(e) => setExtractSocial(e.target.checked)} className="w-4 h-4 accent-primary-500" />
            <span className="text-sm text-gray-600">Extract from Social Links</span>
          </label>
          <button
            onClick={handleExtract}
            disabled={loading}
            className="btn-primary ml-auto flex items-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            {loading ? 'Scanning...' : '🔍 Extract Emails'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-3">
              <button onClick={handleSaveAll} disabled={saving} className="btn-success flex items-center gap-2">
                <FaSave /> Save All
              </button>
              <button onClick={handleSaveSelected} disabled={saving || !selected.length} className="btn-primary flex items-center gap-2">
                <FaSave /> Save Selected ({selected.length})
              </button>
              <button onClick={handleDeleteSelected} className="btn-danger flex items-center gap-2">
                <FaTrash /> Delete
              </button>
              <button onClick={exportCSV} className="btn-outline flex items-center gap-2">
                <FaDownload /> CSV
              </button>
              <button onClick={exportExcel} className="btn-outline flex items-center gap-2">
                <FaDownload /> Excel
              </button>
            </div>
            <span className="text-sm text-gray-500 bg-white/80 px-4 py-2 rounded-xl shadow-card">
              <span className="font-semibold text-primary-500">{results.length}</span> emails found
            </span>
          </div>

          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header w-10"><input type="checkbox" onChange={toggleSelectAll} checked={selected.length === currentLeads.length && currentLeads.length > 0} className="w-4 h-4 accent-primary-500" /></th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Source</th>
                  <th className="table-header">Verified</th>
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
                      <td className="table-cell font-medium text-primary-500">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-secondary-500 text-xs" />
                          {lead.email}
                          <button onClick={() => copyToClipboard(lead.email)} className="text-gray-400 hover:text-primary-500 transition">
                            <FaCopy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="table-cell">
                        {lead.phone ? (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">{lead.phone}</span>
                            <button onClick={() => copyToClipboard(lead.phone)} className="text-gray-400 hover:text-primary-500 transition">
                              <FaCopy size={12} />
                            </button>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="table-cell">
                        <a href={lead.source} target="_blank" rel="noopener" className="text-primary-500 hover:underline flex items-center gap-1 truncate max-w-[200px]">
                          <FaGlobe size={12} /> {lead.source}
                        </a>
                      </td>
                      <td className="table-cell">
                        {lead.verified ? (
                          <span className="badge-success flex items-center gap-1 w-fit">
                            <FaCheckCircle size={12} /> Verified
                          </span>
                        ) : (
                          <span className="badge-warning flex items-center gap-1 w-fit">Unverified</span>
                        )}
                      </td>
                      <td className="table-cell text-center">
                        <div className="flex items-center justify-center gap-2">
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="text-secondary-500 hover:text-secondary-700 transition" title="Send Email">
                              <FaEnvelope size={14} />
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="text-success hover:text-success/70 transition" title="Call">
                              <FaSearch size={14} />
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-card border border-white/20 text-gray-600 disabled:opacity-50 hover:bg-primary-50 transition"
              >
                ◀ Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
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

export default EmailExtractor;
