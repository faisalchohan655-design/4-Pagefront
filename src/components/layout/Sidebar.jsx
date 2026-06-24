// frontend/src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { 
  FaHome, FaMapMarkerAlt, FaEnvelope, FaRocket, 
  FaChartLine, FaCog, FaUsers
} from 'react-icons/fa';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/finder', icon: FaMapMarkerAlt, label: 'Lead Finder' },
    { path: '/extractor', icon: FaEnvelope, label: 'Email Extractor' },
    { path: '/campaign', icon: FaRocket, label: 'Campaign Hub' },
    { path: '/leads', icon: FaUsers, label: 'Lead Manager' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-card flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100/50">
        <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary-500 to-secondary-500 w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm">
            LP
          </span>
          LeadConnect
        </h1>
        <p className="text-xs text-gray-400 mt-1">Pro Edition v2.0</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/10 to-secondary-500/10 text-primary-600 shadow-glow border border-primary-500/20'
                    : 'text-gray-600 hover:bg-primary-500/5 hover:text-primary-500'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
              {item.path === '/' && (
                <span className="ml-auto text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full">Live</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100/50">
        <div className="bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-xl p-4 border border-primary-500/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">
              LP
            </div>
            <div>
              <p className="text-xs font-medium text-dark">Pro Account</p>
              <p className="text-[10px] text-gray-400">14 leads today</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
