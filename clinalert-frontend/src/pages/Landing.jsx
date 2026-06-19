import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Cpu, IndianRupee, Pill, Search, FileUp, Activity } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* 1. Hero Section */}
      <motion.section 
        variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
        style={{ textAlign: 'center', padding: '6rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(37,99,235,0.1)', color: 'var(--medical-blue)', borderRadius: '20px', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Activity size={16} /> ClinAlert v2.0 Live
        </div>
        <h1 style={{ fontSize: '4rem', maxWidth: '800px', lineHeight: '1.1', color: 'var(--text-dark-navy)', letterSpacing: '-0.03em' }}>
          Securing Every Prescription Through <span style={{ color: 'var(--medical-blue)' }}>Clinical AI</span>
        </h1>
        <p style={{ color: 'var(--text-slate)', fontSize: '1.25rem', maxWidth: '600px', margin: '1.5rem 0 3rem' }}>
          Automated handwriting extraction, real-time CDSCO regulatory alerts, and PMBI generic savings for modern hospitals.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/upload')} style={{ ...styles.btn, background: 'var(--medical-blue)', color: 'white' }}>
            Start Scanning <FileUp size={18} style={{ marginLeft: '0.5rem' }}/>
          </button>
          <a href="#features" style={{ ...styles.btn, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-dark-navy)' }}>
            Learn More
          </a>
        </div>
      </motion.section>

      {/* 2. Features Section */}
      <motion.section id="features" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ padding: '4rem 1rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>Enterprise Features</h2>
        <div style={styles.gridContainer}>
          {[
            { icon: <Cpu color="var(--medical-blue)" size={32} />, title: "AI Extraction", text: "State of the art Vision LLM accurately digitizes doctor handwriting instantly." },
            { icon: <ShieldCheck color="var(--status-rose)" size={32} />, title: "CDSCO Monitoring", text: "Automatic flagging of banned or sub-standard drugs in India." },
            { icon: <IndianRupee color="var(--status-emerald)" size={32} />, title: "PMBI Savings", text: "Recommends high-quality generic alternatives to save patient costs." },
            { icon: <Pill color="var(--accent-teal)" size={32} />, title: "Drug Interactions", text: "Cross-checks multiple medications for dangerous contraindications." }
          ].map((feat, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} style={styles.card}>
              <div style={{ marginBottom: '1rem' }}>{feat.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{feat.title}</h3>
              <p style={{ color: 'var(--text-slate)', lineHeight: 1.6 }}>{feat.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 3. How It Works */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ padding: '4rem 1rem', background: 'rgba(37,99,235,0.03)', borderRadius: '24px', margin: '2rem 0' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>How It Works</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { step: 1, icon: <FileUp size={40}/>, title: "1. Upload", text: "Scan or photograph physical prescriptions." },
            { step: 2, icon: <Search size={40}/>, title: "2. AI Analyzes", text: "Extracts medicines and queries databases." },
            { step: 3, icon: <ShieldCheck size={40}/>, title: "3. Get Alerts", text: "Receive critical clinical warnings." }
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center', maxWidth: '250px' }}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--medical-blue)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p style={{ color: 'var(--text-slate)' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 4. Tech Stack & 5. Contact */}
      <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem' }}>Powered By</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', opacity: 0.6, fontSize: '1.5rem', fontWeight: 600 }}>
          <span>OpenAI Vision</span>
          <span>CDSCO DB</span>
          <span>PMBI Jan Aushadhi</span>
          <span>SIDER 4.1</span>
        </div>
        
        <div style={{ marginTop: '5rem', maxWidth: '500px', margin: '5rem auto 0' }}>
          <h3>Request Enterprise Access</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input type="email" placeholder="hospital@example.com" style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
            <button style={{ ...styles.btn, background: 'var(--text-dark-navy)', color: 'white' }}>Contact Sales</button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

const styles = {
  btn: {
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem'
  },
  card: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.02)'
  }
};

export default Landing;
