// frontend/src/pages/CampaignHub.jsx
import { useState } from 'react';
import { useLeads } from '../context/LeadsContext.jsx';
import toast from 'react-hot-toast';
import { 
  FaWhatsapp, FaEnvelope, FaCopy, FaUsers, FaTrash, 
  FaRocket, FaFileAlt, FaCheckCircle, FaClock, FaChartBar
} from 'react-icons/fa';

const CampaignHub = () => {
  const { leads, deleteBulk } = useLeads();
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');
  const [sending, setSending] = useState(false);

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

  const sendWhatsAppSingle = (phone, name) => {
    if (!phone) return toast.error('📱 No phone number');
    const msg = message.replace(/{{name}}/g, name).replace(/{{company}}/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    toast.success('💬 WhatsApp opened');
  };

  const sendWhatsAppBulk = () => {
    if (!selectedLeads.length) return toast.error('Select leads first');
    const selected = leads.filter(l => selectedLeads.includes(l._id));
    const withPhone = selected.filter(l => l.phone);
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
    if (!selectedLeads.length) return toast.error('Select leads first');
    const selected = leads.filter(l => selectedLeads.includes(l._id));
    const withEmail = selected.filter(l => l.email);
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

  const selected = leads.filter(l => selectedLeads.includes(l._id));
  const withPhone = selected.filter(l => l.phone).length;
  const withEmail = selected.filter(l => l.email).length;

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) setSelectedLeads([]);
    else setSelectedLeads(leads.map(l => l._id));
  };

  const toggleSelect = (id) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(i => i !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <FaRocket className="text-secondary-500" />
          Campaign Hub
        </h1>
        <p className="text-gray-500 mt-1">Send professional outreach campaigns via WhatsApp & Email</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
              <FaUsers size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Selected</p>
              <p className="text-xl font-bold text-dark">{selectedLeads.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <FaWhatsapp size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">With Phone</p>
              <p className="text-xl font-bold text-dark">{withPhone}</p>
            </div>
          </div>
        </div>
        <div className="stat-card border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-500/10 flex items-center justify-center text-secondary-500">
              <FaEnvelope size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400">With Email</p>
              <p className="text-xl font-bold text-dark">{withEmail}</p>
            </div>
          </div>
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
      <div className="glass-card p-5 rounded-2xl mb-6 border border-white/20">
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
          <button onClick={sendWhatsAppSingle} className="btn-primary flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 border-0">
            <FaWhatsapp /> WhatsApp (Single)
          </button>
          <button onClick={sendWhatsAppBulk} disabled={sending} className="btn-primary flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 border-0">
            <FaUsers /> WhatsApp (Bulk)
          </button>
          <button onClick={sendEmailSingle} className="btn-primary flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 border-0">
            <FaEnvelope /> Email (Single)
          </button>
          <button onClick={sendEmailBulk} className="btn-primary flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 border-0">
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

      {/* Leads Table */}
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header w-10"><input type="checkbox" onChange={toggleSelectAll} checked={selectedLeads.length === leads.length && leads.length > 0} className="w-4 h-4 accent-primary-500" /></th>
              <th className="table-header">Name</th>
              <th className="table-header">Email</th>
              <th className="table-header">Phone</th>
              <th className="table-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-primary-50/30 transition-colors">
                <td className="table-cell">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => toggleSelect(lead._id)}
                    className="w-4 h-4 accent-primary-500"
                  />
                </td>
                <td className="table-cell font-medium text-dark">{lead.name}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <FaEnvelope className="text-secondary-500 text-xs" />
                    <span className="text-gray-600">{lead.email || '-'}</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <FaWhatsapp className="text-success text-xs" />
                    <span className="text-gray-600">{lead.phone || '-'}</span>
                  </div>
                </td>
                <td className="table-cell text-center">
                  <div className="flex items-center justify-center gap-3">
                    {lead.phone && (
                      <button 
                        onClick={() => sendWhatsAppSingle(lead.phone, lead.name)} 
                        className="text-success hover:text-success/70 transition p-1.5 bg-success/5 rounded-lg hover:bg-success/10"
                        title="Send WhatsApp"
                      >
                        <FaWhatsapp size={16} />
                      </button>
                    )}
                    {lead.email && (
                      <button 
                        onClick={() => sendEmailSingle(lead.email, lead.name)} 
                        className="text-secondary-500 hover:text-secondary-700 transition p-1.5 bg-secondary-500/5 rounded-lg hover:bg-secondary-500/10"
                        title="Send Email"
                      >
                        <FaEnvelope size={16} />
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
