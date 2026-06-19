import React, { useState } from 'react';
import { Search, Info, ShieldAlert, IndianRupee, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../api/client';

const DrugSearch = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length > 2) {
      setLoading(true);
      try {
        const response = await apiClient.get(`/api/v1/drugs/search?q=${val}`);
        setResult(response.data);
      } catch (error) {
        console.error("Error searching drug:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setResult(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-dark-navy)' }}>Intelligence Search</h1>
      <p style={{ color: 'var(--text-slate)', marginBottom: '2rem' }}>Manually query CDSCO, PMBI, and SIDER databases.</p>

      <div style={{ position: 'relative', marginBottom: '3rem' }}>
        <Search size={24} color="var(--medical-blue)" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          value={query}
          onChange={handleSearch}
          placeholder="Type a drug name (e.g., Dolo)..." 
          style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', fontSize: '1.2rem', borderRadius: '12px', border: '2px solid #E2E8F0', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
        />
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{result.name}</h2>
            <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 600, background: result.status === 'Alert' ? 'rgba(225,29,72,0.1)' : 'rgba(16,185,129,0.1)', color: result.status === 'Alert' ? 'var(--status-rose)' : 'var(--status-emerald)' }}>
              {result.status === 'Alert' ? "CDSCO Warning" : "Clean"}
            </span>
          </div>

          {result.alert && (
            <div style={{ padding: '1rem', background: 'rgba(225,29,72,0.05)', borderRadius: '8px', border: '1px solid rgba(225,29,72,0.2)', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem' }}>
              <ShieldAlert color="var(--status-rose)" />
              <p style={{ margin: 0, color: 'var(--text-dark-navy)' }}>{result.alert}</p>
            </div>
          )}

          {result.pmbi && (
            <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem' }}>
              <IndianRupee color="var(--status-emerald)" />
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>PMBI Alternative Available</p>
                <p style={{ margin: 0, color: 'var(--text-slate)', fontSize: '0.9rem' }}>Market Price: ₹{result.pmbi.original} | Jan Aushadhi: ₹{result.pmbi.alt}</p>
              </div>
            </div>
          )}

          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}><Info size={18} color="var(--medical-blue)" /> Known Side Effects (SIDER)</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {result.sideEffects.map((se, i) => (
                <span key={i} style={{ padding: '0.4rem 0.8rem', background: '#F1F5F9', borderRadius: '8px', fontSize: '0.9rem' }}>{se}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DrugSearch;
