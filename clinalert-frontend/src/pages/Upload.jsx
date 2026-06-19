import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileUp, FileImage, ShieldAlert, BadgeCheck, Activity, Loader } from 'lucide-react';
import { useStore } from '../store/useStore';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing with AI...");
  const [quality, setQuality] = useState(null);
  const navigate = useNavigate();
  const setAnalysisResult = useStore(state => state.setAnalysisResult);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setQuality(85); // Mock quality score
  };

  const handleScan = async () => {
    if (!file) return;
    setIsScanning(true);
    
    // Cycle loading text to make latency feel faster
    const texts = [
      "Reading doctor's handwriting...",
      "Extracting chemical compounds...",
      "Cross-referencing CDSCO databases...",
      "Finding cheaper PMBI alternatives...",
      "Finalizing report..."
    ];
    let i = 0;
    const intervalId = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 1500);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post("/api/v1/prescription/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const results = response.data.database_results || [];
      
      const mappedMedicines = results.map(r => ({
        name: r.generic_name,
        brand: r.matched_brand || r.generic_name
      }));
      
      const mappedAlerts = [];
      const mappedAlternatives = [];
      const mappedCommonSideEffects = [];
      const mappedSeriousSideEffects = [];
      
      results.forEach(r => {
        if (r.alerts) {
           r.alerts.forEach(a => mappedAlerts.push({ 
             drug: r.generic_name, 
             issue: a.alert_title, 
             severity: "High" 
           }));
        }
        if (r.cheaper_alternatives) {
           r.cheaper_alternatives.forEach(alt => mappedAlternatives.push({
             original: r.matched_brand,
             alternative: alt.brand_name,
             savings: "Rs." + alt.mrp
           }));
        }
        if (r.side_effects) {
           r.side_effects.forEach(se => {
             if (se.severity === "Serious") mappedSeriousSideEffects.push(se.side_effect_name);
             else mappedCommonSideEffects.push(se.side_effect_name);
           });
        }
      });
      
      setAnalysisResult({
        id: response.data.scan_id || "SCN-" + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().split('T')[0],
        patient: "Unknown Patient",
        medicines: mappedMedicines,
        cdscoAlerts: mappedAlerts,
        pmbiAlternatives: mappedAlternatives,
        sideEffects: { 
          common: [...new Set(mappedCommonSideEffects)], 
          serious: [...new Set(mappedSeriousSideEffects)] 
        },
        interactions: [] // Mock or fetch interactions
      });
      
      toast.success("Analysis complete!");
      navigate('/result/scan-result');
    } catch (error) {
      console.error("Error analyzing prescription:", error);
      toast.error("Backend Error: " + (error.response?.data?.detail || error.message));
    } finally {
      clearInterval(intervalId);
      setIsScanning(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-dark-navy)' }}>Scan Prescription</h1>
        <p style={{ color: 'var(--text-slate)' }}>Upload a digital or handwritten prescription for AI analysis.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left: Uploader */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}
        >
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{ 
              border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '3rem', textAlign: 'center',
              background: '#F8FAFC', cursor: 'pointer', transition: 'border-color 0.2s'
            }}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input type="file" id="file-upload" hidden accept="image/*" onChange={handleChange} />
            <FileUp size={48} color="var(--medical-blue)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-dark-navy)', marginBottom: '0.5rem' }}>Click or Drag Image Here</h3>
            <p style={{ color: 'var(--text-slate)', fontSize: '0.9rem' }}>Supports JPG, PNG (Max 50MB)</p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Patient Details (Optional)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input type="text" placeholder="Patient ID" style={styles.input} />
              <input type="text" placeholder="Name" style={styles.input} />
              <input type="number" placeholder="Age" style={styles.input} />
              <select style={styles.input}><option>Gender</option><option>M</option><option>F</option></select>
            </div>
            <textarea placeholder="Clinical Notes..." style={{ ...styles.input, width: '100%', marginTop: '1rem', height: '80px', resize: 'none' }} />
          </div>
        </motion.div>

        {/* Right: Preview & Action */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}
        >
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Document Preview</h3>
          
          <div style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            {!preview ? (
              <div style={{ textAlign: 'center', color: 'var(--text-slate)' }}>
                <FileImage size={40} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                <p>No document selected</p>
              </div>
            ) : (
              <>
                <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                {isScanning && (
                  <motion.div 
                    initial={{ top: '0%' }} animate={{ top: '100%' }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    style={{ position: 'absolute', left: 0, width: '100%', height: '4px', background: 'var(--medical-blue)', boxShadow: '0 0 15px var(--medical-blue)', zIndex: 10 }}
                  />
                )}
              </>
            )}
          </div>

          {quality && !isScanning && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#F0FDF4', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #BBF7D0' }}>
              <span style={{ color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BadgeCheck size={18}/> Quality Check Passed</span>
              <span style={{ color: '#166534', fontWeight: 700 }}>{quality}% Match</span>
            </div>
          )}

          <button 
            onClick={handleScan}
            disabled={!file || isScanning}
            style={{ 
              background: (!file || isScanning) ? '#CBD5E1' : 'var(--medical-blue)', 
              color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '8px', 
              fontSize: '1.1rem', fontWeight: 600, cursor: (!file || isScanning) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s',
              width: '100%', justifyContent: 'center', marginTop: '1.5rem'
            }}
          >
            {isScanning ? (
              <>
                <Loader size={20} className="spin" />
                {loadingText}
              </>
            ) : (
              <>
                <Activity size={20} />
                Start AI Analysis
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  input: {
    padding: '0.8rem',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '0.95rem'
  }
};

export default Upload;
