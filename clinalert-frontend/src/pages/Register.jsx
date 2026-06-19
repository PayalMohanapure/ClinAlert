import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const Register = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/v1/auth/register', formData);
      setSubmitted(true);
      toast.success("Registration successful!");
    } catch (error) {
      toast.error("Registration failed: " + (error.response?.data?.detail || error.message));
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.card}>
          <div style={{ textAlign: 'center', color: 'var(--status-emerald)' }}>
            <h2 style={{ marginBottom: '1rem' }}>Registration Submitted!</h2>
            <p style={{ color: 'var(--text-slate)', marginBottom: '2rem' }}>
              Your application is pending verification. You will receive an email once your medical license is approved.
            </p>
            <button onClick={() => navigate('/')} style={styles.button}>Return to Home</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ ...styles.card, maxWidth: '600px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--medical-blue)' }}>Doctor Registration</h2>
          <p style={{ color: 'var(--text-slate)' }}>Step {step} of 4</p>
        </div>

        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}>
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit" style={styles.formGrid}>
                <h3 style={{ gridColumn: '1 / -1' }}>Personal Information</h3>
                <input type="text" placeholder="Full Name" required style={styles.input} value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                <select required style={styles.input}><option value="">Gender</option><option>Male</option><option>Female</option></select>
                <input type="date" required style={styles.input} />
                <input type="tel" placeholder="Phone Number" required style={styles.input} />
                <input type="email" placeholder="Email Address" required style={styles.input} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                <input type="password" placeholder="Password" required style={styles.input} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={{ gridColumn: '1 / -1' }} />
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Upload Profile Photo</label>
                  <input type="file" accept="image/*" style={styles.input} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit" style={styles.formGrid}>
                <h3 style={{ gridColumn: '1 / -1' }}>Professional Details</h3>
                <input type="text" placeholder="NMC Registration No." required style={styles.input} />
                <input type="text" placeholder="State Medical Council" required style={styles.input} />
                <select required style={styles.input}>
                  <option value="">Qualification</option>
                  <option>MBBS</option><option>MD</option><option>MS</option>
                </select>
                <select required style={styles.input}>
                  <option value="">Specialization</option>
                  <option>General Medicine</option><option>Cardiology</option><option>Pediatrics</option>
                </select>
                <input type="number" placeholder="Years of Experience" required style={styles.input} style={{ gridColumn: '1 / -1' }} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit" style={styles.formGrid}>
                <h3 style={{ gridColumn: '1 / -1' }}>Hospital Affiliation</h3>
                <input type="text" placeholder="Hospital Name" required style={styles.input} style={{ gridColumn: '1 / -1' }} />
                <input type="text" placeholder="Department" required style={styles.input} />
                <input type="text" placeholder="Employee ID" required style={styles.input} />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={formVariants} initial="hidden" animate="visible" exit="exit" style={styles.formGrid}>
                <h3 style={{ gridColumn: '1 / -1' }}>Document Upload</h3>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Medical License (PDF/Image)</label>
                  <input type="file" required style={styles.input} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Government ID</label>
                  <input type="file" required style={styles.input} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} style={{ ...styles.button, background: '#cbd5e1', color: 'var(--text-dark-navy)' }}>
                Back
              </button>
            )}
            <button type="submit" style={{ ...styles.button, marginLeft: 'auto' }}>
              {step === 4 ? "Submit Registration" : "Next"}
            </button>
          </div>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-slate)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--medical-blue)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '2rem'
  },
  card: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '3rem',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    background: 'var(--medical-blue)',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s'
  }
};

export default Register;
