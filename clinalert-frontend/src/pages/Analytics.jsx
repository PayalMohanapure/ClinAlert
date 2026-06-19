import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const dailyScans = [
    { name: 'Mon', scans: 45 }, { name: 'Tue', scans: 52 }, { name: 'Wed', scans: 38 },
    { name: 'Thu', scans: 65 }, { name: 'Fri', scans: 48 }, { name: 'Sat', scans: 25 }, { name: 'Sun', scans: 20 }
  ];

  const alertsData = [
    { name: 'Week 1', alerts: 12 }, { name: 'Week 2', alerts: 19 }, { name: 'Week 3', alerts: 15 }, { name: 'Week 4', alerts: 22 }
  ];

  const sideEffects = [
    { name: 'Nausea', value: 400 }, { name: 'Dizziness', value: 300 },
    { name: 'Headache', value: 300 }, { name: 'Allergic', value: 100 }
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-dark-navy)' }}>Hospital Analytics</h1>
        <p style={{ color: 'var(--text-slate)' }}>Data-driven insights from AI prescription processing.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Daily Scans */}
        <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Daily Scan Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyScans}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(37,99,235,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="scans" fill="var(--medical-blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Over Time */}
        <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>CDSCO Alerts Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={alertsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="alerts" stroke="var(--status-rose)" strokeWidth={3} dot={{ r: 5, fill: 'var(--status-rose)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Side Effects Distribution */}
        <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Common SIDER Side Effects Detected</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={sideEffects} cx="50%" cy="50%" innerRadius={80} outerRadius={120} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                {sideEffects.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </motion.div>
  );
};

export default Analytics;
