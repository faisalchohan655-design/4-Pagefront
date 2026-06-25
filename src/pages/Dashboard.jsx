import React, { useContext, useState } from 'react';
import { LeadsContext } from '../context/LeadsContext';
import { Users, Brain, Zap, Target, Search, Download, Trash2, Eye, Edit, ArrowUp, ArrowDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const { leads, deleteLead, bulkDeleteLeads } = useContext(LeadsContext);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const getScore = (l) => {
    let s = 30;
    if (l.company) s += 15;
    if (l.email) s += 10;
    if (l.phone) s += 10;
    if (l.status === 'qualified') s += 15;
    if (l.status === 'proposal') s += 10;
    return Math.min(s, 100);
  };

  const filtered = leads.filter(l => {
    if (search && !l.name?.toLowerCase().includes(search.toLowerCase()) && !l.company?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && l.status !== filter) return false;
    return true;
  });

  const stats = [
    { title: 'Total', value: leads.length, icon: Users, color: 'from-purple-500 to-pink-500' },
    { title: 'Hot', value: leads.filter(l => getScore(l) >= 80).length, icon: Zap, color: 'from-orange-500 to-red-500' },
    { title: 'Avg Score', value: leads.length ? Math.round(leads.reduce((a, l) => a + getScore(l), 0) / leads.length) : 0 + '%', icon: Brain, color: 'from-blue-500 to-cyan-500' },
    { title: 'Conversion', value: '42%', icon: Target, color: 'from-green-500 to-emerald-500' },
  ];

  const exportExcel = () => {
    const data = filtered.map(l => ({ Name: l.name, Company: l.company, Email: l.email, Phone: l.phone, Status: l.status, 'AI Score': getScore(l) }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'AI Score'];
    const rows = filtered.map(l => [l.name, l.company, l.email, l.phone, l.status, getScore(l)]);
    let csv = headers.join(',') + '\n';
    rows.forEach(r => csv += r.join(',') + '\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getBadge = (s) => {
    const map = { new: 'bg-blue-500/20 text-blue-400', contacted: 'bg-yellow-500/20 text-yellow-400', qualified: 'bg-green-500/20 text-green-400', proposal: 'bg-orange-500/20 text-orange-400', closed: 'bg-pink-500/20 text-pink-400' };
    return map[s] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold text-white flex items-center gap-3"><Brain className="text-purple-400" size={32} />Dashboard<span className="text-sm bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-white text-xs font-medium animate-glow">LIVE</span></h1></div>
          <div className="flex gap-3">
            <button onClick={exportExcel} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Download size={18} />Excel</button>
            <button onClick={exportCSV} className="bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Download size={18} />CSV</button>
            {selected.length > 0 && <button onClick={() => { if (window.confirm('Delete?')) bulkDeleteLeads(selected); }} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Trash2 size={18} />Delete</button>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <div className="flex justify-between"><div><p className="text-gray-400 text-sm">{s.title}</p><p className="text-2xl font-bold text-white mt-1">{s.value}</p></div><div className={`p-3 rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}><s.icon size={20} className="text-white" /></div></div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative"><Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-700/50 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none" /></div>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-purple-500 outline-none"><option value="all">All</option><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="proposal">Proposal</option><option value="closed">Closed</option></select>
            <button onClick={() => { const all = filtered.map(l => l._id); setSelected(selected.length === all.length ? [] : all); }} className="text-purple-400 text-sm">{selected.length === filtered.length && filtered.length > 0 ? 'Deselect' : 'Select All'}</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/30"><tr><th className="px-4 py-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={() => { if (selected.length === filtered.length) setSelected([]); else setSelected(filtered.map(l => l._id)); }} className="rounded border-slate-600 bg-slate-700 text-purple-500" /></th><th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Name</th><th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Company</th><th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Email</th><th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Score</th><th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Status</th><th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Actions</th></tr></thead>
              <tbody>
                {filtered.map(l => {
                  const score = getScore(l);
                  return <tr key={l._id} className="border-t border-slate-700 hover:bg-slate-700/30"><td className="px-4 py-3"><input type="checkbox" checked={selected.includes(l._id)} onChange={() => { if (selected.includes(l._id)) setSelected(selected.filter(id => id !== l._id)); else setSelected([...selected, l._id]); }} className="rounded border-slate-600 bg-slate-700 text-purple-500" /></td><td className="px-4 py-3 text-white">{l.name || '-'}</td><td className="px-4 py-3 text-gray-300">{l.company || '-'}</td><td className="px-4 py-3 text-gray-300">{l.email || '-'}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-16 bg-slate-700 rounded-full h-2"><div className={`h-2 rounded-full ${score >= 80 ? 'bg-purple-500' : score >= 60 ? 'bg-blue-500' : 'bg-gray-500'}`} style={{ width: `${score}%` }}></div></div><span className={`text-sm ${score >= 80 ? 'text-purple-400' : score >= 60 ? 'text-blue-400' : 'text-gray-400'}`}>{score}%</span></div></td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${getBadge(l.status)}`}>{l.status || 'new'}</span></td><td className="px-4 py-3 flex gap-2"><button className="p-1 hover:bg-slate-600 rounded"><Eye size={16} className="text-gray-400" /></button><button className="p-1 hover:bg-slate-600 rounded"><Edit size={16} className="text-gray-400" /></button><button onClick={() => { if (window.confirm('Delete?')) deleteLead(l._id); }} className="p-1 hover:bg-red-500/20 rounded"><Trash2 size={16} className="text-gray-400 hover:text-red-400" /></button></td></tr>
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-700 text-gray-400 text-sm">{filtered.length} of {leads.length} leads</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
