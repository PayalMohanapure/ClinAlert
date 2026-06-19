import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Activity, Bell, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, doctor, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.navContainer}>
      {/* Left: Brand */}
      <div style={styles.brand} onClick={() => navigate('/')}>
        <Activity size={28} color="var(--medical-blue)" />
        <span style={styles.brandText}>ClinAlert</span>
      </div>

      {/* Middle: Links */}
      <div style={styles.navLinks}>
        {!isAuthenticated ? (
          <>
            <NavLink to="/" style={({isActive}) => isActive ? styles.activeLink : styles.link}>Home</NavLink>
            <a href="#about" style={styles.link}>About</a>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" style={({isActive}) => isActive ? styles.activeLink : styles.link}>Dashboard</NavLink>
            <NavLink to="/patients" style={({isActive}) => isActive ? styles.activeLink : styles.link}>Patients</NavLink>
            <NavLink to="/upload" style={({isActive}) => isActive ? styles.activeLink : styles.link}>Upload</NavLink>
            <NavLink to="/drug-search" style={({isActive}) => isActive ? styles.activeLink : styles.link}>Drug Search</NavLink>
            <NavLink to="/analytics" style={({isActive}) => isActive ? styles.activeLink : styles.link}>Analytics</NavLink>
            <NavLink to="/assistant" style={({isActive}) => isActive ? styles.activeLink : styles.link}>Assistant</NavLink>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div style={styles.actions}>
        {!isAuthenticated ? (
          <button style={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
        ) : (
          <>
            <Bell size={20} color="var(--text-slate)" style={{ cursor: 'pointer' }} />
            <div style={styles.profileBox} onClick={() => navigate('/profile')}>
              <User size={18} color="var(--medical-blue)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{doctor?.name || "Dr. User"}</span>
            </div>
            <LogOut size={20} color="var(--status-rose)" style={{ cursor: 'pointer' }} onClick={handleLogout} />
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--glass-border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer'
  },
  brandText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-dark-navy)',
    letterSpacing: '-0.02em'
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem'
  },
  link: {
    color: 'var(--text-slate)',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  activeLink: {
    color: 'var(--medical-blue)',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  loginBtn: {
    background: 'var(--medical-blue)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  profileBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(37, 99, 235, 0.1)',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    cursor: 'pointer'
  }
};

export default Navbar;
