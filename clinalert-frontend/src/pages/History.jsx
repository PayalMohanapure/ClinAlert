import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Eye } from 'lucide-react';

const History = () => {
  const [filter, setFilter] = useState('All');
  
  const historyData = [
    { id: "SCN-9092", patient: "Rahul Sharma", doctor: "Dr. Medical Professional", date: "2026-06-16", status: "Critical Alert" },
    { id: "SCN-9091", patient: "Priya Patel", doctor: "Dr. Medical Professional", date: "2026-06-16", status: "Clean" },
    { id: "SCN-9090", patient: "Amit Singh", doctor: "Dr. Ananya", date: "2026-06-15", status: "Clean" },
    { id: "SCN-9089", patient: "Neha Gupta", doctor: "Dr. Medical Professional", date: "2026-06-15", status: "Alternative Found" }
  ];

  const filtered = filter === 'All' ? historyData : historyData.filter(h => h.status.includes(filter) || (filter === 'Alert' && h.status === 'Critical Alert'));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-dark-navy)' }}>Scan History</h1>
          <p style={{ color: 'var(--text-slate)' }}>Comprehensive log of all AI prescription analyses.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Filter size={20} color="var(--text-slate)" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}>
            <option value="All">All Scans</option>
            <option value="Clean">Clean</option>
            <option value="Alert">Critical Alerts</option>
            <option value="Alternative Found">Alternatives</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '2rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0', color: 'var(--text-slate)' }}>
              <th style={{ padding: '1rem 0' }}>Scan ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((scan, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '1rem 0', fontWeight: 600 }}>{scan.id}</td>
                <td>{scan.patient}</td>
                <td style={{ color: 'var(--text-slate)' }}>{scan.doctor}</td>
                <td style={{ color: 'var(--text-slate)' }}>{scan.date}</td>
                <td>
                  <span style={{ 
                    padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                    background: scan.status === 'Clean' ? 'rgba(16,185,129,0.1)' : scan.status === 'Critical Alert' ? 'rgba(225,29,72,0.1)' : 'rgba(13,148,136,0.1)',
                    color: scan.status === 'Clean' ? 'var(--status-emerald)' : scan.status === 'Critical Alert' ? 'var(--status-rose)' : 'var(--accent-teal)'
                  }}>
                    {scan.status}
                  </span>
                </td>
                <td><button style={{ background: 'none', border: 'none', color: 'var(--medical-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Eye size={18}/> View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default History;
