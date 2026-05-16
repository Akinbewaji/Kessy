import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for actual form submission
    setStatus('Thanks for reaching out! I will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="animate-in standard-section" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <p className="dk-body" style={{ color: 'var(--accent-light)', letterSpacing: '0.4em', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>GET IN TOUCH</p>
        <h1 className="dk-title premium-gradient-text" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', marginBottom: '1.5rem' }}>Contact Me</h1>
        <p className="dk-body" style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: 1.8, fontWeight: 300 }}>
          Interested in hiring me for a ghostwriting project or have questions about the mastery course? I'd love to hear from you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '4rem 3rem', border: '1px solid var(--glass-border)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <label className="field-label">Full Name</label>
          <input 
            type="text" 
            className="dk-input" 
            required 
            placeholder="Jane Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label className="field-label">Email Address</label>
          <input 
            type="email" 
            className="dk-input" 
            required 
            placeholder="jane@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div style={{ marginBottom: '3rem' }}>
          <label className="field-label">Your Message</label>
          <textarea 
            className="dk-input" 
            rows="6" 
            required
            placeholder="Tell me about your project..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          ></textarea>
        </div>

        {status && (
          <div className="animate-in" style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '6px', color: 'var(--accent-light)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            {status}
          </div>
        )}

        <button type="submit" className="btn-accent dk-body" style={{ width: '100%', padding: '1.2rem', fontSize: '1rem' }}>SEND MESSAGE</button>
      </form>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <p className="dk-body" style={{ color: '#666', fontSize: '0.9rem' }}>Typically responds within 24-48 hours.</p>
      </div>
    </div>
  );
}
