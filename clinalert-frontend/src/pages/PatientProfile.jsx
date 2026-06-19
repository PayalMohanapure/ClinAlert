import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, ShieldAlert, FileText, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock Data
  const patient = { name: "Rahul Sharma", age: 45, gender: "Male", contact: "+91 9876543210" };
  const timeline = [
    { id: "SCN-9092", date: "2026-06-16", status: "Critical Alert", doctor: "Dr. Medical Professional" },
    { id: "SCN-8114", date: "2026-01-10", status: "Clean", doctor: "Dr. Ananya" }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/patients')} style={{ background: 'none', border: 'none', color: 'var(--medical-blue)', cursor: 'pointer', marginBottom: '1rem', fontWeight: 600 }}>
        &larr; Back to Directory
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Profile Card */}
        <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)', height: 'fit-content' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(37,99,235,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <User size={40} color="var(--medical-blue)" />
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>{patient.name}</h2>
          <p style={{ color: 'var(--text-slate)', marginBottom: '1.5rem' }}>{patient.age} Years • {patient.gender}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-slate)' }}>Patient ID</span> <strong>{id}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-slate)' }}>Contact</span> <strong>{patient.contact}</strong></div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar color="var(--medical-blue)"/> Prescription Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {timeline.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--medical-blue)', border: '4px solid #DBEAFE' }}></div>
                    {i !== timeline.length -1 && <div style={{ width: '2px', height: '100%', background: '#E2E8F0', marginTop: '0.5rem' }}></div>}
                  </div>
                  <div style={{ flex: 1, paddingBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong>{t.date}</strong>
                      <span style={{ fontSize: '0.85rem', color: t.status === 'Clean' ? 'var(--status-emerald)' : 'var(--status-rose)', fontWeight: 600 }}>{t.status}</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, color: 'var(--medical-blue)' }}>{t.id}</p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-slate)' }}>Prescribed by {t.doctor}</p>
                      </div>
                      <button style={{ background: 'none', border: '1px solid #CBD5E1', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={14}/> Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default PatientProfile;
