import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, IndianRupee, Users, FileText, TrendingUp, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    metrics: {
      total_scans: "0",
      total_patients: "0",
      cdsco_alerts: "0",
      pmbi_savings: "₹0"
    },
    recent_scans: []
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await apiClient.get('/api/v1/dashboard/metrics');
        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader className="animate-spin" size={40} color="var(--medical-blue)" />
        <p style={{ color: 'var(--text-slate)' }}>Loading dashboard statistics...</p>
      </div>
    );
  }

  const metrics = [
    { title: "Total Scans", value: data.metrics.total_scans, icon: <FileText size={24} color="#2563EB" />, bg: "rgba(37,99,235,0.1)" },
    { title: "Total Patients", value: data.metrics.total_patients, icon: <Users size={24} color="#0D9488" />, bg: "rgba(13,148,136,0.1)" },
    { title: "CDSCO Alerts", value: data.metrics.cdsco_alerts, icon: <ShieldAlert size={24} color="#E11D48" />, bg: "rgba(225,29,72,0.1)" },
    { title: "PMBI Savings", value: data.metrics.pmbi_savings, icon: <IndianRupee size={24} color="#10B981" />, bg: "rgba(16,185,129,0.1)" }
  ];

  const recentScans = data.recent_scans;


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-dark-navy)' }}>Clinical Dashboard</h1>
          <p style={{ color: 'var(--text-slate)' }}>Overview of your hospital's AI diagnostics.</p>
        </div>
        <button onClick={() => navigate('/upload')} style={{ background: 'var(--medical-blue)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          + New Scan
        </button>
      </div>

      {/* AI Insights Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'linear-gradient(90deg, #2563EB 0%, #0D9488 100%)', padding: '1.5rem 2rem', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(37,99,235,0.3)' }}
      >
        <TrendingUp size={28} />
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>AI Insight</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>15 high-risk interactions detected this month. Consider reviewing prescriptions containing Warfarin.</p>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {metrics.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {m.icon}
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-slate)', fontSize: '0.9rem', fontWeight: 500 }}>{m.title}</p>
              <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-dark-navy)' }}>{m.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Scans Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '2rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Scans</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0', color: 'var(--text-slate)' }}>
              <th style={{ padding: '1rem 0' }}>Scan ID</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.map((scan, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '1rem 0', fontWeight: 600 }}>{scan.id}</td>
                <td>{scan.patient}</td>
                <td style={{ color: 'var(--text-slate)' }}>{scan.date}</td>
                <td>
                  <span style={{ 
                    padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                    background: scan.status === 'Clean' ? 'rgba(16,185,129,0.1)' : scan.status === 'Critical Alert' ? 'rgba(225,29,72,0.1)' : 'rgba(245,158,11,0.1)',
                    color: scan.status === 'Clean' ? 'var(--status-emerald)' : scan.status === 'Critical Alert' ? 'var(--status-rose)' : '#D97706'
                  }}>
                    {scan.status}
                  </span>
                </td>
                <td><button style={{ background: 'none', border: 'none', color: 'var(--medical-blue)', cursor: 'pointer', fontWeight: 600 }}>View Report</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Dashboard;
