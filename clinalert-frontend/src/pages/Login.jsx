import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Lock, Mail } from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/v1/auth/login', { email, password });
      const { access_token, user } = response.data;
      login(user, access_token);
      navigate('/dashboard');
    } catch (error) {
      toast.error("Login failed: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleForgot = () => {
    toast.success("Password reset link sent to your email.");
  };

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--medical-blue)' }}>Doctor Portal Login</h2>
          <p style={{ color: 'var(--text-slate)' }}>Access your clinical intelligence dashboard</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <Mail size={18} color="var(--text-slate)" style={styles.icon} />
            <input 
              type="email" 
              placeholder="Email Address" 
              style={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} color="var(--text-slate)" style={styles.icon} />
            <input 
              type="password" 
              placeholder="Password" 
              style={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-slate)', cursor: 'pointer' }}>
              <input type="checkbox" /> Remember Me
            </label>
            <span onClick={handleForgot} style={{ color: 'var(--medical-blue)', cursor: 'pointer', fontWeight: 500 }}>
              Forgot Password?
            </span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            style={styles.button}
          >
            Sign In
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-slate)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--medical-blue)', fontWeight: 600 }}>Apply for Access</Link>
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
    minHeight: '80vh'
  },
  card: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '3rem',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    position: 'absolute',
    left: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem 0.8rem 2.8rem',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    background: 'var(--medical-blue)',
    color: 'white',
    border: 'none',
    padding: '0.9rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem'
  }
};

export default Login;
