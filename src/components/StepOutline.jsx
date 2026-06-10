import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function StepOutline() {
  const { 
    genre, characters, plot, outline, setOutline,
    dualPov, setDualPov 
  } = useContext(AppContext);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!genre) {
      navigate('/writer');
    }
  }, [genre, navigate]);

  const handleBack = () => {
    navigate('/writer/plot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCover = () => {
    navigate('/writer/cover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePovChange = (chapterNum, newPov) => {
    const updatedOutline = outline.map(ch => 
      ch.chapter === chapterNum ? { ...ch, pov: newPov } : ch
    );
    setOutline(updatedOutline);
  };

  const handleToggleDualPov = () => {
    const isNowDual = !dualPov;
    setDualPov(isNowDual);
    
    // Automatically alternate POVs if turned on
    if (isNowDual) {
      const updatedOutline = outline.map((ch, idx) => ({
        ...ch,
        pov: idx % 2 === 0 ? characters.femaleName : characters.maleName
      }));
      setOutline(updatedOutline);
    }
  };

  if (!outline) return null;

  return (
    <div id="step-4" className="animate-in">
      <p className="step-eyebrow dk-body" style={{ color: 'var(--accent)' }}>STEP 04</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="step-title dk-title" style={{ marginBottom: 0 }}>Your Story Outline</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <span className="dk-body" style={{ fontSize: '0.9rem', color: dualPov ? genre.color : '#a1a1aa' }}>
            Dual POV Engine {dualPov ? 'ON' : 'OFF'}
          </span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={dualPov} 
              onChange={handleToggleDualPov}
            />
            <span className="slider round" style={{ backgroundColor: dualPov ? genre.color : '#4B5563' }}></span>
          </label>
        </div>
      </div>
      
      <div className="outline-meta">
        <p className="dk-body" style={{ color: '#6B7280', fontSize: '0.85rem' }}>
          {characters.maleName} × {characters.femaleName} · {genre.name} · {plot.setting}
        </p>
        <p className="dk-body" style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: genre.color }}>
          {plot.trope} — {plot.conflict}
        </p>
      </div>
      
      <div className="outline-list">
        {outline.map((ch) => (
          <div key={ch.chapter} className="outline-item" style={{ position: 'relative' }}>
            <div className="ch-num dk-body" style={{ color: genre.color }}>CH {ch.chapter}</div>
            <div style={{ flex: 1 }}>
              <p className="ch-title dk-title">{ch.title}</p>
              <p className="ch-summary dk-body">{ch.summary}</p>
            </div>
            
            {dualPov && (
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <select 
                  className="dk-input" 
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', height: 'auto', background: 'rgba(0,0,0,0.3)' }}
                  value={ch.pov || 'Third Person'}
                  onChange={(e) => handlePovChange(ch.chapter, e.target.value)}
                >
                  <option value={characters.maleName}>{characters.maleName}'s POV</option>
                  <option value={characters.femaleName}>{characters.femaleName}'s POV</option>
                  <option value="Third Person">Third Person</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="btn-row">
        <button className="btn-ghost dk-body" onClick={handleBack}>← Edit Plot</button>
        <button className="btn-accent dk-body" onClick={handleCover}>Generate Cover Art →</button>
      </div>

      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        .slider.round {
          border-radius: 24px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
