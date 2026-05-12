import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function ToolStepper() {
  const { genre } = useContext(AppContext);
  const location = useLocation();
  const steps = ['Genre', 'Chars', 'Plot', 'Outline', 'Cover', 'Write'];
  
  const stepMap = {
    '/writer/genre': 1,
    '/writer/characters': 2,
    '/writer/plot': 3,
    '/writer/outline': 4,
    '/writer/cover': 5,
    '/writer/write': 6
  };
  const step = stepMap[location.pathname] || 0;

  if (step === 0) return null;

  return (
    <div id="writer-nav">
      <div id="nav-brand" className="dk-title" style={{ color: genre ? genre.color : 'var(--accent-light)', fontSize: '1.2rem', fontWeight: 600 }}>
        Digital Kessy
      </div>
      <div id="steps-bar" className="dk-body">
        {steps.map((s, i) => {
          const idx = i + 1;
          const isDone = idx < step;
          const isActive = idx === step;
          
          return (
            <React.Fragment key={s}>
              <div className={`step-dot ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                {isDone ? '✓' : idx}
              </div>
              {i < steps.length - 1 && (
                <div className={`step-line ${isDone ? 'done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
