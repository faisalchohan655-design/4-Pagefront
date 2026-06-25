import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Search, Send, Users, 
  Brain, Sparkles 
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/lead-finder', icon: Search, label: 'Lead Finder' },
    { path: '/campaign-outreach', icon: Send, label: 'Campaign' },
    { path: '/lead-manager', icon: Users, label: 'Lead Manager' },
  ];

  return (
    <nav className="bg-slate-900/90 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Brain className="text-purple-400" size={28} />
            <span className="text-white font-bold text-xl">LeadAI</span>
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded text-xs text-white font-medium">
              PRO
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white">
              <Sparkles size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              JD
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
