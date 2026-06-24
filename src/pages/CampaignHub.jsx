// src/pages/CampaignHub.jsx
import { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import toast from 'react-hot-toast';
import { 
  FaWhatsapp, FaEnvelope, FaCopy, FaUsers, FaTrash, 
  FaRocket, FaFileAlt, FaDownload, FaFilter, FaSearch,
  FaPhone, FaAt, FaGlobe
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const CampaignHub = () => {
  const { leads, deleteBulk } = useLeads();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');
  const [sending, setSending] = useState(false);
  
  // ✅ ADVANCED FILTERS
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHasPhone, setFilterHasPhone] = useState(false);
  const [filterHasEmail, setFilterHasEmail] = useState(false);

  const templates = {
    welcome: { 
      subject: 'Welcome to Our Platform!', 
      message: 'Hi {{name}},\n\nWelcome to our platform! We\'re excited to have you on board.\n\nBest regards,\nTeam LeadConnect' 
    },
    followup: { 
      subject: 'Following Up', 
      message: 'Hi {{name}},\n\nI hope this email finds you well. Just following up on our previous conversation.\n\nWould you be available for a quick chat?\n\nBest,\nTeam LeadConnect' 
    },
    proposal: { 
      subject: 'Proposal for {{company}}', 
      message: 'Hi {{name}},\n\nHere\'s the proposal we discussed for {{company}}. Please review and let us know your thoughts.\n\nLooking forward to working together!\n\nBest regards,\nTeam LeadConnect' 
    }
  };

  const applyTemplate = (name) => {
    const t = templates[name];
    if (t) {
      setSubject(t.subject);
      setMessage(t.message);
      setTemplate(name);
    }
  };

  // ✅ FILTER LEADS
  const filteredLeads = leads.filter(lead => {
    // Search filter
    const matchesSearch = 
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Source filter
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    
    // Phone filter
    const matchesPhone = !filterHasPhone || (lead.phone && lead.phone.trim());
    
    // Email filter
    const matchesEmail = !filterHasEmail || (lead.email && lead.email.trim());
    
    return matchesSearch && matchesSource && matchesStatus && matchesPhone && matchesEmail;
  });

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
      Company: l.company || '',
      Website: l.website || '',
      Source: l.source || '',
      Status: l.status || '',
      Rating: l.rating || 0
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CampaignLeads');
    XLSX.writeFile(wb, `campaign_leads_${Date.now()}.xlsx`);
    toast.success('📊 Excel exported');
  };

  // ✅ EXPORT CSV
  const exportCSV = () => {
    if (!filteredLeads.length) {
      toast.error('No data');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Website', 'Source', 'Status', 'Rating'];
    const rows = filteredLeads.map(l => [
      l.name || '',
      l.email || '',
      l.phone || '',
      l.company || '',
      l.website || '',
      l.source || '',
      l.status || '',
      l.rating || 0
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign_leads_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📄 CSV exported');
  };

  // ✅ COPY TO CLIPBOARD
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied!');
  };

  // ✅ SEND FUNCTIONS
  const sendWhatsAppSingle = (phone, name) => {
    if (!phone) return toast.error('📱 No phone number');
    const msg = message.replace(/{{name}}/g, name).replace(/{{company}}/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    toast.success('💬 WhatsApp opened');
  };

  const sendWhatsAppBulk = () => {
    const withPhone = filteredLeads.filter(l => l.phone);
    if (!withPhone.length) return toast.error('No leads with phone numbers');

    setSending(true);
    withPhone.forEach((lead, i) => {
      setTimeout(() => {
        const msg = message.replace(/{{name}}/g, lead.name).replace(/{{company}}/g, lead.company || '');
        window.open(`https://wa.me/${lead.phone}?text=${encodeURIComponent(msg)}`, '_blank');
      }, i * 2000);
    });
    toast.success(`💬 Opening ${withPhone.length} WhatsApp chats`);
    setSending(false);
  };

  const sendEmailSingle = (email, name) => {
    if (!email) return toast.error('📧 No email');
    const msg = message.replace(/{{name}}/g, name).replace(/{{company}}/g, '');
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`, '_blank');
    toast.success('📧 Email opened');
  };

  const sendEmailBulk = () => {
    const withEmail = filteredLeads.filter(l => l.email);
    if (!withEmail.length) return toast.error('No leads with emails');

    const emails = withEmail.map(l => l.email).join(',');
    const msg = message.replace(/{{name}}/g, 'there').replace(/{{company}}/g, '');
    window.open(`mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`, '_blank');
    toast.success(`📧 Opening email for ${withEmail.length} recipients`);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('📋 Message copied!');
  };

  const handleDeleteSelected = async () => {
    if (!selectedLeads.length) return toast.error('Select leads first');
    await deleteBulk(selectedLeads);
    setSelectedLeads([]);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) setSelectedLeads([]);
    else setSelectedLeads(filteredLeads.map(l => l._id));
  };

  const toggleSelect = (id) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(i => i !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const selected = leads.filter(l => selectedLeads.includes(l._id));
  const withPhone = selected.filter(l => l.phone).length;
  const withEmail = selected.filter(l => l.email).length;

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-3xl font-bold gradient-text mb-6 flex items-center gap-2">
        <FaRocket className="text-secondary-500" /> Campaign Hub
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="stat-card border border-white/20">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{filteredLeads.length}</p>
        </div>
        <div className="stat-card border border-white/20">
          <p className="text-sm text-gray-500">Selected</p>
          <p className="text-2xl font-bold text-primary-500">{selectedLeads.length}</p>
        </div>
        <div className="stat-card border border-white/20">
          <p className="text-sm text-gray-500">With Phone</p>
          <p className="text-2xl font-bold text-green-600">{withPhone}</p>
        </div>
        <div className="stat-card border border-white/20">
          <p className="text-sm text-gray-500">With Email</p>
          <p className="text-2xl font-bold text-blue-600">{withEmail}</p>
        </div>
      </div>

      {/* Templates */}
      <div className="glass-card p-4 rounded-xl mb-4 border border-white/20">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <FaFileAlt className="text-primary-500" /> Templates:
          </span>
          {Object.keys(templates).map(name => (
            <button
              key={name}
              onClick={() => applyTemplate(name)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                template === name 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-glow' 
                  : 'bg-white/80 text-gray-600 hover:bg-primary-50 border border-white/20'
              }`}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Message Editor */}
      <div className="glass-card p-5 rounded-2xl mb-4 border border-white/20">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field"
              placeholder="Email subject..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="Type your message... Use {{name}}, {{company}}"
            />
            <div className="text-xs text-gray-400 mt-1">
              💡 Variables: {'{{name}}'} {'{{company}}'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="glass-card p-4 rounded-2xl mb-6 border border-white/20">
        <div className="flex flex-wrap gap-3">
          <button onClick={sendWhatsAppSingle} className="btn-primary bg-gradient-to-r from-green-500 to-green-600 border-0 flex items-center gap-2">
            <FaWhatsapp /> WhatsApp (Single)
          </button>
          <button onClick={sendWhatsAppBulk} disabled={sending} className="btn-primary bg-gradient-to-r from-green-600 to-green-700 border-0 flex items-center gap-2">
            <FaUsers /> WhatsApp (Bulk)
          </button>
          <button onClick={sendEmailSingle} className="btn-primary bg-gradient-to-r from-blue-500 to-blue-600 border-0 flex items-center gap-2">
            <FaEnvelope /> Email (Single)
          </button>
          <button onClick={sendEmailBulk} className="btn-primary bg-gradient-to-r from-blue-600 to-blue-700 border-0 flex items-center gap-2">
            <FaUsers /> Email (Bulk)
          </button>
          <button onClick={copyMessage} className="btn-outline flex items-center gap-2">
            <FaCopy /> Copy
          </button>
          <button onClick={handleDeleteSelected} className="btn-danger flex items-center gap-2">
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* ✅ EXPORT BUTTONS */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={exportCSV} className="btn-outline flex items-center gap-2">
          <FaDownload /> CSV
        </button>
        <button onClick={exportExcel} className="btn-primary flex items-center gap-2">
          <FaDownload /> Excel
        </button>
        <span className="text-sm text-gray-500 ml-auto">{filteredLeads.length} leads</span>
      </div>

      {/* ✅ ADVANCED FILTERS */}
      <div className="glass-card p-4 rounded-xl mb-4 border border-white/20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[150px]">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="input-field py-2"
            />
          </div>
          
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="select-field py-2 w-auto min-w-[120px]"
          >
            <option value="all">All Sources</option>
            <option value="google_maps">Google Maps</option>
            <option value="social">Social</option>
            <option value="domain">Domain</option>
            <option value="email_extracted">Email</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="select-field py-2 w-auto min-w-[120px]"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>

          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={filterHasPhone}
              onChange={(e) => setFilterHasPhone(e.target.checked)}
              className="accent-primary-500"
            />
            <FaPhone className="text-green-500" size={12} /> Has Phone
          </label>

          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={filterHasEmail}
              onChange={(e) => setFilterHasEmail(e.target.checked)}
              className="accent-primary-500"
            />
            <FaAt className="text-blue-500" size={12} /> Has Email
          </label>
        </div>
      </div>

      {/* Leads Table */}
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header w-10">
                <input type="checkbox" onChange={toggleSelectAll} checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0} />
              </th>
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Phone</th>
              <th className="table-header">Company</th>
              <th className="table-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead._id} className="hover:bg-primary-50/30 transition-colors">
                <td className="table-cell">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => toggleSelect(lead._id)}
                  />
                </td>
                <td className="table-cell font-medium">{lead.name || '-'}</td>
                <td className="table-cell text-primary-500">{lead.email || '-'}</td>
                <td className="table-cell text-green-600">{lead.phone || '-'}</td>
                <td className="table-cell">{lead.company || '-'}</td>
                <td className="table-cell text-center">
                  <div className="flex items-center justify-center gap-2">
                    {lead.phone && (
                      <button onClick={() => sendWhatsAppSingle(lead.phone, lead.name)} className="text-green-600 hover:text-green-800 p-1.5 bg-green-50 rounded-lg hover:bg-green-100" title="WhatsApp">
                        <FaWhatsapp size={14} />
                      </button>
                    )}
                    {lead.email && (
                      <button onClick={() => sendEmailSingle(lead.email, lead.name)} className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100" title="Email">
                        <FaEnvelope size={14} />
                      </button>
                    )}
                    {(lead.website || lead.phone || lead.email) && (
                      <button onClick={() => copyToClipboard(lead.website || lead.phone || lead.email)} className="text-gray-400 hover:text-primary-500 p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100" title="Copy">
                        <FaCopy size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignHub;
