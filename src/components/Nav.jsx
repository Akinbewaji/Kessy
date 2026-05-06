import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Nav() {
  const { genre } = useContext(AppContext);
  const location = useLocation();
  const steps = ['Genre', 'Chars', 'Plot', 'Outline', 'Cover', 'Write'];
  
  const stepMap = {
    '/genre': 1,
    '/characters': 2,
    '/plot': 3,
    '/outline': 4,
    '/cover': 5,
    '/write': 6
  };
  const step = stepMap[location.pathname] || 1;

  return (
    <div id="nav">
      <div id="nav-brand" className="dk-title" style={{ color: genre ? genre.color : '#fff' }}>
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
