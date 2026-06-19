import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader } from 'lucide-react';
import apiClient from '../api/client';

const Assistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello Dr. Medical Professional. I am the Agentic AI. How can I assist you with clinical intelligence today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await apiClient.post("/api/v1/chat", { message: input });
      setMessages(prev => [...prev, { role: 'ai', content: response.data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I am having trouble connecting to my servers right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-dark-navy)' }}>Agentic AI Assistant</h1>
        <p style={{ color: 'var(--text-slate)' }}>RAG-powered clinical guidance system.</p>
      </div>

      <div style={{ flex: 1, background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.02)' }}>
        
        {/* Chat History */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              {msg.role === 'ai' && <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--medical-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={20} color="white" /></div>}
              <div style={{ padding: '1rem 1.25rem', borderRadius: '16px', background: msg.role === 'user' ? 'var(--medical-blue)' : '#F1F5F9', color: msg.role === 'user' ? 'white' : 'var(--text-dark-navy)', borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px', borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px', lineHeight: 1.5 }}>
                {msg.content}
              </div>
              {msg.role === 'user' && <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="white" /></div>}
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--medical-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot size={20} color="white" /></div>
              <div style={{ padding: '1rem 1.25rem', borderRadius: '16px', background: '#F1F5F9', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} style={{ width: '6px', height: '6px', background: 'var(--text-slate)', borderRadius: '50%' }}></motion.div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} style={{ width: '6px', height: '6px', background: 'var(--text-slate)', borderRadius: '50%' }}></motion.div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} style={{ width: '6px', height: '6px', background: 'var(--text-slate)', borderRadius: '50%' }}></motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid #E2E8F0' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a drug interaction, alternative, or regulation..."
              style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem' }}
            />
            <button type="submit" style={{ background: 'var(--medical-blue)', border: 'none', width: '54px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Send size={20} color="white" />
            </button>
          </form>
        </div>

      </div>
    </motion.div>
  );
};

export default Assistant;
