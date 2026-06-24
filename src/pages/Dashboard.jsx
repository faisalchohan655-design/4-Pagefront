// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useLeads } from '../context/LeadsContext.jsx';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { 
  FaUsers, FaEnvelope, FaPhone, FaGlobe, FaChartLine,
  FaRocket, FaTrophy, FaArrowUp, FaStar, FaUserPlus
} from 'react-icons/fa';

const Dashboard = () => {
  const { leads, stats, loading } = useLeads();
  const [chartData, setChartData] = useState([]);
  const [ratingData, setRatingData] = useState([]);

  useEffect(() => {
    // Last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = leads.filter(l => 
        l.createdAt?.split('T')[0] === dateStr
      ).length;
      days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      });
    }
    setChartData(days);

    // Rating distribution
    const ratings = [1, 2, 3, 4, 5].map(r => ({
      name: `${r}★`,
      count: leads.filter(l => Math.floor(l.rating || 0) === r).length
    }));
    setRatingData(ratings);
  }, [leads]);

  const COLORS = ['#6C3CE1', '#E83E8C', '#00D4FF', '#00E676', '#FFB300'];
  const pieColors = ['#6C3CE1', '#E83E8C'];

  const statCards = [
    { 
      title: 'Total Leads', 
      value: stats.total, 
      icon: FaUsers, 
      color: 'from-primary-500 to-secondary-500',
      bg: 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10'
    },
    { 
      title: 'With Email', 
      value: stats.withEmail, 
      icon: FaEnvelope, 
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
    },
    { 
      title: 'With Phone', 
      value: stats.withPhone, 
      icon: FaPhone, 
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10'
    },
    { 
      title: 'With Website', 
      value: stats.withWebsite, 
      icon: FaGlobe, 
      color: 'from-orange-500 to-yellow-500',
      bg: 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10'
    }
  ];

  const pieData = [
    { name: 'With Phone', value: stats.withPhone },
    { name: 'No Phone', value: stats.total - stats.withPhone }
  ];

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-500 mt-1">Smart insights for your lead generation</p>
        </div>
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-card border border-white/20">
          <FaRocket className="text-primary-500" />
          <span className="text-sm font-medium text-gray-700">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card ${stat.bg} border border-white/20`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-dark mt-1">{loading ? '...' : stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                <FaArrowUp size={10} />
                <span>12% this week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark flex items-center gap-2">
              <FaChartLine className="text-primary-500" />
              Leads (Last 7 Days)
            </h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Trending</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#6C3CE1" 
                strokeWidth={3}
                dot={{ fill: '#6C3CE1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-semibold text-dark flex items-center gap-2 mb-4">
            <FaPhone className="text-secondary-500" />
            Phone Availability
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-semibold text-dark flex items-center gap-2 mb-4">
          <FaStar className="text-warning" />
          Rating Distribution
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ratingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {ratingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
