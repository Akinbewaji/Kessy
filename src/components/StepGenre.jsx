import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { GENRES } from '../data/genres';

export default function StepGenre() {
  const { setGenreId } = useContext(AppContext);
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (id) => {
    setGenreId(id);
    navigate('/writer/characters');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      </div>
    </div>
  );
}
