import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ShieldAlert, IndianRupee, Pill, AlertTriangle, FileText, Download, Printer } from 'lucide-react';

const Result = () => {
  const { analysisResult } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!analysisResult) {
      navigate('/upload');
    }
  }, [analysisResult, navigate]);

  if (!analysisResult) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-dark-navy)' }}>Analysis Report</h1>
          <p style={{ color: 'var(--text-slate)' }}>Scan ID: {analysisResult.id} | Generated: {analysisResult.date}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ ...styles.btn, background: 'white', color: 'var(--text-dark-navy)', border: '1px solid #E2E8F0' }} onClick={() => window.print()}>
            <Printer size={18} /> Print
          </button>
          <button style={{ ...styles.btn, background: 'var(--medical-blue)', color: 'white', border: 'none' }}>
            <Download size={18} /> Save PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Data Tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Extracted Medicines */}
          <div style={styles.card}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><Pill color="var(--medical-blue)" /> Extracted Medicines</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: 'var(--text-slate)' }}>
                  <th style={{ padding: '0.8rem 0' }}>Brand Name</th>
                  <th>Generic</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.medicines.map((med, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '1rem 0', fontWeight: 600 }}>{med.brand}</td>
                    <td style={{ color: 'var(--text-slate)' }}>{med.generic}</td>
                    <td>{med.dosage}</td>
                    <td>{med.freq}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: CDSCO Alerts */}
          {analysisResult.cdscoAlerts.length > 0 && (
            <div style={{ ...styles.card, borderLeft: '4px solid var(--status-rose)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-rose)', marginBottom: '1.5rem' }}>
                <ShieldAlert /> CDSCO Regulatory Alerts
              </h3>
              {analysisResult.cdscoAlerts.map((alert, i) => (
                <div key={i} style={{ padding: '1rem', background: 'rgba(225,29,72,0.05)', borderRadius: '8px', border: '1px solid rgba(225,29,72,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{alert.drug}</strong>
                    <span style={{ padding: '0.2rem 0.6rem', background: 'var(--status-rose)', color: 'white', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>{alert.severity}</span>
                  </div>
                  <p style={{ color: 'var(--text-slate)', fontSize: '0.9rem', margin: 0 }}>{alert.alert}</p>
                </div>
              ))}
            </div>
          )}

          {/* Section 3: PMBI Alternatives */}
          {analysisResult.pmbiAlternatives.length > 0 && (
            <div style={{ ...styles.card, borderLeft: '4px solid var(--status-emerald)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-emerald)', marginBottom: '1.5rem' }}>
                <IndianRupee /> PMBI Generic Alternatives
              </h3>
              {analysisResult.pmbiAlternatives.map((alt, i) => (
                <div key={i} style={{ padding: '1rem', background: 'rgba(16,185,129,0.05)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{alt.drug} (Jan Aushadhi)</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Original: ₹{alt.original} → PMBI: ₹{alt.pmbi}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', color: 'var(--status-emerald)', fontWeight: 700, fontSize: '1.2rem' }}>Save ₹{alt.savings}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column: Side Effects & Interactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={styles.card}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><FileText color="var(--accent-teal)" /> SIDER Side Effects</h3>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-slate)', marginBottom: '0.5rem' }}>Common</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {analysisResult.sideEffects.common.map((se, i) => (
                  <span key={i} style={{ padding: '0.3rem 0.8rem', background: '#F1F5F9', borderRadius: '16px', fontSize: '0.85rem' }}>{se}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--status-rose)', marginBottom: '0.5rem' }}>Serious (Monitor)</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {analysisResult.sideEffects.serious.map((se, i) => (
                  <span key={i} style={{ padding: '0.3rem 0.8rem', background: 'rgba(225,29,72,0.1)', color: 'var(--status-rose)', borderRadius: '16px', fontSize: '0.85rem' }}>{se}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><AlertTriangle color="#F59E0B" /> Interactions</h3>
            {analysisResult.interactions.length === 0 ? (
              <p style={{ color: 'var(--text-slate)', fontSize: '0.9rem', margin: 0 }}>No critical drug-drug interactions detected in this prescription.</p>
            ) : (
              <div>{/* Interaction Cards would map here */}</div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
};

const styles = {
  card: {
    background: 'var(--glass-bg)',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
  },
  btn: {
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'transform 0.2s'
  }
};

export default Result;
