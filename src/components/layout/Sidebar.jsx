import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, Send, Users, Mail, Brain, Settings, HelpCircle, ChevronLeft, Menu, X, Zap, ChevronDown } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/lead-finder', icon: Search, label: 'Lead Finder' },
    { path: '/campaign-outreach', icon: Send, label: 'Campaigns' },
    { path: '/lead-manager', icon: Users, label: 'Lead Manager' },
    { path: '/email-extractor', icon: Mail, label: 'Email Extractor' },
  ];

  const isActive = (p) => location.pathname === p;

  return (
    <>
      <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg border border-purple-500/20 text-white">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)}></div>}

      <div className={`fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-purple-500/20 transition-all duration-300 z-40 flex flex-col ${collapsed ? 'w-20' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center p-4 border-b border-purple-500/20">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Brain className="text-purple-400" size={28} />
            {!collapsed && <span className="text-white font-bold text-lg">LeadAI</span>}
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1.5 rounded-lg hover:bg-slate-800 text-gray-400">
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Menu</p>}
          {items.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path) ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-slate-800'} ${collapsed ? 'justify-center' : 'justify-start'}`}>
              <item.icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </div>

        <div className="border-t border-purple-500/20 px-3 py-4">
          <Link to="/settings" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-slate-800 ${collapsed ? 'justify-center' : 'justify-start'}`}>
            <Settings size={18} />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
          <Link to="/help" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-slate-800 ${collapsed ? 'justify-center' : 'justify-start'}`}>
            <HelpCircle size={18} />
            {!collapsed && <span className="text-sm font-medium">Help</span>}
          </Link>
          {!collapsed && (
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">JD</div>
              <div><p className="text-white text-sm font-medium">John Doe</p><p className="text-gray-400 text-xs">Pro Plan</p></div>
              <ChevronDown size={16} className="text-gray-400 ml-auto" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
