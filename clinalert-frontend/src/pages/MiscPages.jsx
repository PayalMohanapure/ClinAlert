import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Profile = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>Doctor Profile</h1>
      <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', marginTop: '2rem' }}>
        <p><strong>Name:</strong> Dr. Medical Professional</p>
        <p><strong>Email:</strong> dr@hospital.com</p>
        <p><strong>NMC Registration:</strong> NMC-12345</p>
        <button style={{ padding: '0.5rem 1rem', background: 'var(--medical-blue)', color: 'white', border: 'none', borderRadius: '8px', marginTop: '1rem' }}>Edit Profile</button>
      </div>
    </motion.div>
  );
};

export const Settings = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>System Settings</h1>
      <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', marginTop: '2rem' }}>
        <h3>Preferences</h3>
        <label style={{ display: 'block', marginTop: '1rem' }}><input type="checkbox" defaultChecked /> Receive Email Alerts for Critical Interactions</label>
        <label style={{ display: 'block', marginTop: '1rem' }}><input type="checkbox" defaultChecked /> Dark Mode Theme</label>
      </div>
    </motion.div>
  );
};

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--medical-blue)' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ color: 'var(--text-slate)', marginTop: '1rem' }}>The clinical route you requested does not exist.</p>
      <button onClick={() => navigate('/dashboard')} style={{ padding: '0.8rem 2rem', background: 'var(--medical-blue)', color: 'white', border: 'none', borderRadius: '8px', marginTop: '2rem', cursor: 'pointer' }}>Return to Dashboard</button>
    </div>
  );
};
