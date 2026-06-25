import React, { useContext, useEffect, useState } from 'react';
import { LeadsContext } from '../context/LeadsContext.jsx';
import { FaUsers, FaUserPlus, FaChartLine, FaCheckCircle } from 'react-icons/fa';

const Dashboard = () => {
  const { leads, loading, fetchLeads } = useContext(LeadsContext);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (leads.length > 0) {
      const newLeads = leads.filter(l => l.status === 'new').length;
      const contacted = leads.filter(l => l.status === 'contacted').length;
      const converted = leads.filter(l => l.status === 'converted').length;
      
      setStats({
        total: leads.length,
        new: newLeads,
        contacted: contacted,
        converted: converted
      });
    }
  }, [leads]);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>
            {loading ? '...' : value}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${color}20` }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard</h1>
      <p className="text-gray-500 mt-1">Welcome to LeadConnect Pro!</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <StatCard 
          title="Total Leads"
          value={stats.total}
          icon={<FaUsers size={24} color="#7c3aed" />}
          color="#7c3aed"
        />
        <StatCard 
          title="New Leads"
          value={stats.new}
          icon={<FaUserPlus size={24} color="#3b82f6" />}
          color="#3b82f6"
        />
        <StatCard 
          title="Contacted"
          value={stats.contacted}
          icon={<FaChartLine size={24} color="#8b5cf6" />}
          color="#8b5cf6"
        />
        <StatCard 
          title="Converted"
          value={stats.converted}
          icon={<FaCheckCircle size={24} color="#22c55e" />}
          color="#22c55e"
        />
      </div>

      {/* Recent Leads Table */}
      {leads.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">Recent Leads</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.slice(0, 5).map((lead, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{lead.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-600' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-600' :
                        lead.status === 'converted' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {lead.status || 'new'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
