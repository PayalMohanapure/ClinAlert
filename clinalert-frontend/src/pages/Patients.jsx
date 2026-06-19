import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const patients = [
    { id: "P-1042", name: "Rahul Sharma", age: 45, gender: "Male", lastVisit: "2026-06-16" },
    { id: "P-1041", name: "Priya Patel", age: 32, gender: "Female", lastVisit: "2026-06-15" },
    { id: "P-1040", name: "Amit Singh", age: 58, gender: "Male", lastVisit: "2026-06-10" },
    { id: "P-1039", name: "Neha Gupta", age: 28, gender: "Female", lastVisit: "2026-06-02" }
  ];

  const filtered = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-dark-navy)' }}>Patient Directory</h1>
          <p style={{ color: 'var(--text-slate)' }}>Manage and view patient scan histories.</p>
        </div>
      </div>

      <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
        <div style={{ position: 'relative', marginBottom: '2rem', maxWidth: '400px' }}>
          <Search size={20} color="var(--text-slate)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search by Name or Patient ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0', color: 'var(--text-slate)' }}>
              <th style={{ padding: '1rem 0' }}>Patient ID</th>
              <th>Name</th>
              <th>Age/Gender</th>
              <th>Last Visit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '1rem 0', fontWeight: 600, color: 'var(--medical-blue)' }}>{p.id}</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={16} color="var(--text-slate)"/> {p.name}</div></td>
                <td>{p.age} Y, {p.gender}</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} color="var(--text-slate)"/> {p.lastVisit}</div></td>
                <td>
                  <button onClick={() => navigate(`/patients/${p.id}`)} style={{ background: 'var(--medical-blue)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Patients;
