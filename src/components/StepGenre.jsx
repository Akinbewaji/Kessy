import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { GENRES } from '../data/genres';

export default function StepGenre() {
  const { setGenreId } = useContext(AppContext);
  const [hovered, setHovered] = useState(null);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestData, setSuggestData] = useState({ name: '', email: '', suggestion: '' });
  const [suggestStatus, setSuggestStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (id) => {
    setGenreId(id);
    navigate('/writer/characters');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    if (!suggestData.name || !suggestData.email || !suggestData.suggestion) {
      setSuggestStatus('Please fill in all fields.');
      return;
    }
    
    setIsSubmitting(true);
    setSuggestStatus('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suggestData.name,
          email: suggestData.email,
          message: `GENRE SUGGESTION: ${suggestData.suggestion}`
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      
      setSuggestStatus('Suggestion sent successfully! Thank you.');
      setSuggestData({ name: '', email: '', suggestion: '' });
      setTimeout(() => {
        setShowSuggestModal(false);
        setSuggestStatus('');
      }, 2000);
    } catch (err) {
      setSuggestStatus(err.message || 'Error sending suggestion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="step-1" className="animate-in">
      <p className="step-eyebrow dk-body" style={{ color: 'var(--accent)' }}>STEP 01</p>
      <h2 className="step-title dk-title">Choose Your Genre</h2>
      <p className="step-sub dk-body">Every dark romance starts with a world. Which one calls to you?</p>
      
      <div id="genre-grid">
        {GENRES.map((g) => {
          const isHovered = hovered === g.id;
          return (
            <div 
              key={g.id}
              className="genre-card"
              style={{ borderColor: isHovered ? g.color : '#1F2937' }}
              onMouseEnter={() => setHovered(g.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleSelect(g.id)}
            >
              <div className="genre-emoji">{g.emoji}</div>
              <div className="genre-name dk-title" style={{ color: g.color }}>{g.name}</div>
              <div className="genre-tagline dk-body">{g.tagline}</div>
              <div className="genre-tropes">
                {g.tropes.slice(0, 3).map((t, idx) => (
                  <span 
                    key={idx} 
                    className="trope-tag dk-body" 
                    style={{ color: g.accent, border: `1px solid ${g.color}44` }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {/* Suggest a Genre Card */}
        <div 
          className="genre-card"
          style={{ borderColor: hovered === 'suggest' ? '#8B5CF6' : '#1F2937', borderStyle: 'dashed', opacity: 0.8 }}
          onMouseEnter={() => setHovered('suggest')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setShowSuggestModal(true)}
        >
          <div className="genre-emoji">✨</div>
          <div className="genre-name dk-title" style={{ color: '#8B5CF6' }}>Suggest a Genre</div>
          <div className="genre-tagline dk-body">Don't see your favorite trope? Let us know what we should add next!</div>
        </div>
      </div>

      {showSuggestModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(5,0,5,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2.5rem', position: 'relative' }}>
            <button 
              onClick={() => setShowSuggestModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
            <h3 className="dk-title" style={{ marginBottom: '0.5rem', color: '#8B5CF6' }}>Suggest a New Genre</h3>
            <p className="dk-body" style={{ color: '#a1a1aa', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Have a specific dark romance niche in mind? Tell us the trope, setting, and vibes you want!
            </p>
            
            <form onSubmit={handleSuggestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="field-label">YOUR NAME</label>
                <input 
                  type="text" 
                  className="dk-input" 
                  value={suggestData.name}
                  onChange={e => setSuggestData({...suggestData, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="field-label">YOUR EMAIL</label>
                <input 
                  type="email" 
                  className="dk-input" 
                  value={suggestData.email}
                  onChange={e => setSuggestData({...suggestData, email: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label className="field-label">GENRE / TROPE IDEA</label>
                <textarea 
                  className="dk-input" 
                  rows="4"
                  placeholder="e.g. Alien Abduction, Post-Apocalyptic Warlord..."
                  value={suggestData.suggestion}
                  onChange={e => setSuggestData({...suggestData, suggestion: e.target.value})}
                  required 
                />
              </div>
              
              {suggestStatus && (
                <div style={{ 
                  color: suggestStatus.includes('success') ? '#10b981' : '#ef4444', 
                  fontSize: '0.9rem',
                  padding: '1rem',
                  background: suggestStatus.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  border: `1px solid ${suggestStatus.includes('success') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  textAlign: 'center'
                }}>
                  {suggestStatus}
                </div>
              )}
              
              <button type="submit" className="btn-accent dk-body" disabled={isSubmitting} style={{ marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Sending...' : 'Submit Suggestion'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
