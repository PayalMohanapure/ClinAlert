import React, { useState } from 'react';
import { AlertTriangle, Plus, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';

const Interactions = () => {
  const [drugs, setDrugs] = useState(['', '']);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const addDrug = () => {
    if (drugs.length < 5) setDrugs([...drugs, '']);
  };

  const removeDrug = (index) => {
    if (drugs.length > 2) {
      setDrugs(drugs.filter((_, i) => i !== index));
    }
  };

  const updateDrug = (index, value) => {
    const newDrugs = [...drugs];
    newDrugs[index] = value;
    setDrugs(newDrugs);
  };

  const checkInteractions = async () => {
    const validDrugs = drugs.filter(d => d.trim().length > 0);
    if (validDrugs.length < 2) return;
    
    setLoading(true);
    try {
      const response = await apiClient.post("/api/v1/interactions", { drugs: validDrugs });
      setResults(response.data.interactions || []);
    } catch (error) {
      console.error("Error checking interactions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-dark-navy)' }}>Drug Interaction Checker</h1>
        <p style={{ color: 'var(--text-slate)' }}>Analyze multiple medications for contraindications.</p>
      </div>

      <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
        <AnimatePresence>
          {drugs.map((drug, i) => (
            <motion.div key={i} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                placeholder={`Drug ${i + 1}`} 
                value={drug}
                onChange={(e) => updateDrug(i, e.target.value)}
                style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem' }}
              />
              {drugs.length > 2 && (
                <button onClick={() => removeDrug(i)} style={{ background: '#F1F5F9', border: 'none', padding: '0 1rem', borderRadius: '8px', cursor: 'pointer', color: 'var(--status-rose)' }}>
                  <X size={20} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button onClick={addDrug} disabled={drugs.length >= 5} style={{ background: 'none', border: '2px dashed #CBD5E1', padding: '0.8rem 1.5rem', borderRadius: '8px', color: 'var(--text-slate)', cursor: drugs.length >= 5 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <Plus size={18} /> Add Drug
          </button>
          <button onClick={checkInteractions} disabled={loading} style={{ background: 'var(--medical-blue)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', gap: '0.5rem' }}>
            {loading ? <Loader size={18} className="spin" /> : "Check Interactions"}
          </button>
        </div>
      </div>

      {results && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {results.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16,185,129,0.1)', color: 'var(--status-emerald)', borderRadius: '16px', fontWeight: 600 }}>
              No critical interactions found for this combination.
            </div>
          ) : (
            results.map((res, i) => (
              <div key={i} style={{ padding: '1.5rem', background: 'rgba(225,29,72,0.05)', borderLeft: '4px solid var(--status-rose)', borderRadius: '8px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle color="var(--status-rose)" /> {res.pair}</h3>
                  <span style={{ padding: '0.3rem 0.8rem', background: 'var(--status-rose)', color: 'white', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>{res.severity}</span>
                </div>
                <p style={{ margin: 0, color: 'var(--text-dark-navy)' }}>{res.desc}</p>
              </div>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Interactions;
