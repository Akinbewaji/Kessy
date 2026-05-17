import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function StepOutline() {
  const { genre, characters, plot, outline, setChapter } = useContext(AppContext);
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

  if (!outline) return null;

  return (
    <div id="step-4" className="animate-in">
      <p className="step-eyebrow dk-body" style={{ color: 'var(--accent)' }}>STEP 04</p>
      <h2 className="step-title dk-title">Your Story Outline</h2>
      
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
          <div key={ch.chapter} className="outline-item">
            <div className="ch-num dk-body" style={{ color: genre.color }}>CH {ch.chapter}</div>
            <div style={{ flex: 1 }}>
              <p className="ch-title dk-title">{ch.title}</p>
              <p className="ch-summary dk-body">{ch.summary}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="btn-row">
        <button className="btn-ghost dk-body" onClick={handleBack}>← Edit Plot</button>
        <button className="btn-accent dk-body" onClick={handleCover}>Generate Cover Art →</button>
      </div>
    </div>
  );
}
