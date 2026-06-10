import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    setIsError(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(data.message || 'Thanks for reaching out! Your message has been sent.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setIsError(true);
        setStatus(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setIsError(true);
      setStatus('A network error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="animate-in standard-section" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <Helmet>
        <title>Contact - DigitalKessy</title>
        <meta name="description" content="Get in touch for bespoke dark romance ghostwriting services or questions about the Ghostwriting Mastery course." />
      </Helmet>

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
          <div className="animate-in" style={{ 
            background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)', 
            padding: '1rem', 
            borderRadius: '6px', 
            color: isError ? '#f87171' : 'var(--accent-light)', 
            marginBottom: '2rem', 
            textAlign: 'center', 
            fontSize: '0.9rem', 
            border: isError ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(139, 92, 246, 0.2)' 
          }}>
            {status}
          </div>
        )}

        <button 
          type="submit" 
          className="btn-accent btn-large btn-full dk-body" 
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'SENDING...' : 'SEND MESSAGE'}
        </button>
      </form>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <p className="dk-body" style={{ color: '#666', fontSize: '0.9rem' }}>Typically responds within 24-48 hours.</p>
      </div>
    </div>
  );
}
