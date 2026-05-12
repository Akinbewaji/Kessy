import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function StepCharacters() {
  const { genre, characters, setCharacters } = useContext(AppContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!characters.maleName.trim() || !characters.femaleName.trim()) {
      setError('Please provide names for both characters to continue.');
      return;
    }
    setError('');
    navigate('/writer/plot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    navigate('/writer/genre');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="step-2" className="animate-in">
      <p className="step-eyebrow dk-body" style={{ color: 'var(--accent)' }}>STEP 02</p>
      <h2 className="step-title dk-title">Build Your Characters</h2>
      <p className="step-sub dk-body">Name them. Define them. They'll carry your story.</p>
      
      {error && <div className="error-msg animate-in">{error}</div>}
      
      <div id="char-grid">
        <div className="char-card" id="male-card" style={{ border: `1px solid ${genre.color}44` }}>
          <p className="char-label dk-body" style={{ color: 'var(--accent)' }}>
            {genre.leads.male.toUpperCase()}
          </p>
          <label className="field-label">Name</label>
          <input 
            className="dk-input" 
            placeholder={genre.maleNames[0]}
            value={characters.maleName}
            onChange={(e) => setCharacters({ ...characters, maleName: e.target.value })}
          />
          <div className="name-chips">
            {genre.maleNames.map(n => (
              <span 
                key={n} 
                className="name-chip dk-body"
                onClick={() => setCharacters({ ...characters, maleName: n })}
              >
                {n}
              </span>
            ))}
          </div>
          <label className="field-label" style={{ marginTop: '1rem' }}>Role / Personality (optional)</label>
          <input 
            className="dk-input" 
            placeholder="e.g. Cold, obsessive, ruthless"
            value={characters.maleRole}
            onChange={(e) => setCharacters({ ...characters, maleRole: e.target.value })}
          />
        </div>

        <div className="char-card" id="female-card" style={{ border: `1px solid ${genre.color}44` }}>
          <p className="char-label dk-body" style={{ color: 'var(--accent)' }}>
            {genre.leads.female.toUpperCase()}
          </p>
          <label className="field-label">Name</label>
          <input 
            className="dk-input" 
            placeholder={genre.femaleNames[0]}
            value={characters.femaleName}
            onChange={(e) => setCharacters({ ...characters, femaleName: e.target.value })}
          />
          <div className="name-chips">
            {genre.femaleNames.map(n => (
              <span 
                key={n} 
                className="name-chip dk-body"
                onClick={() => setCharacters({ ...characters, femaleName: n })}
              >
                {n}
              </span>
            ))}
          </div>
          <label className="field-label" style={{ marginTop: '1rem' }}>Role / Personality (optional)</label>
          <input 
            className="dk-input" 
            placeholder="e.g. Fierce, independent, broken"
            value={characters.femaleRole}
            onChange={(e) => setCharacters({ ...characters, femaleRole: e.target.value })}
          />
        </div>
      </div>

      <div className="btn-row">
        <button className="btn-ghost dk-body" onClick={handleBack}>← Back</button>
        <button className="btn-accent dk-body" onClick={handleNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}
