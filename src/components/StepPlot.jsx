import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { callClaude } from '../api/groq';
import { useAuth } from '../context/AuthContext';

export default function StepPlot() {
  const { genre, characters, plot, setPlot, setOutline } = useContext(AppContext);
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!genre) {
      navigate('/writer');
    }
  }, [genre, navigate]);

  if (!genre) return null;
  const [isLoading, setIsLoading] = useState(false);
  const [customConflict, setCustomConflict] = useState('');

  const handleNext = async () => {
    const activeConflict = customConflict || plot.conflict;
    
    if (!plot.trope || !activeConflict || !plot.setting) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');

    // Save active conflict back to state
    setPlot({ ...plot, conflict: activeConflict });

    if (!userData || ((userData.credits || 0) < 1 && userData.role !== 'admin' && !userData.permissions?.canBypassCredits)) {
      navigate('/pricing', { state: { from: '/writer/plot' } });
      return;
    }

    setIsLoading(true);

    try {
      const prompt = `Generate a 10-chapter dark romance outline for a ${genre.name} story.
Hero: ${characters.maleName} (${genre.leads.male})
Heroine: ${characters.femaleName} (${genre.leads.female})
Setting: ${plot.setting}
Trope: ${plot.trope}
Core conflict: ${activeConflict}

Return ONLY a JSON array of 10 objects like:
[{"chapter":1,"title":"Chapter title","summary":"2-sentence chapter summary"}]
No markdown, no explanation. Pure JSON only.`;

      const system = `You are a dark romance story expert specializing in ${genre.name} romance. You write fast-paced, emotionally intense outlines with strong hooks. Return ONLY valid JSON arrays, nothing else.`;
      
      const result = await callClaude(prompt, system);
      const clean = result.replace(/```json|```/g, '').trim();
      setOutline(JSON.parse(clean));
      navigate('/writer/outline');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch(e) {
      setError('Could not generate outline. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/writer/characters');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="step-3" className="animate-in">
      <p className="step-eyebrow dk-body" style={{ color: 'var(--accent)' }}>STEP 03</p>
      <h2 className="step-title dk-title">Shape the Story</h2>
      <p className="step-sub dk-body">Pick your trope, conflict and setting — or type your own.</p>
      
      <div className="field-group">
        <div>
          <label className="field-label">TROPE</label>
          <select 
            className="dk-input" 
            value={plot.trope}
            onChange={(e) => setPlot({ ...plot, trope: e.target.value })}
          >
            <option value="">Choose a trope...</option>
            {genre.tropes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        
        <div>
          <label className="field-label">CORE CONFLICT</label>
          <select 
            className="dk-input" 
            value={plot.conflict}
            onChange={(e) => {
              setPlot({ ...plot, conflict: e.target.value });
              if (e.target.value) setCustomConflict('');
            }}
          >
            <option value="">Choose a conflict...</option>
            {genre.conflicts.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input 
            className="dk-input" 
            style={{ marginTop: '0.5rem' }} 
            placeholder="...or type your own conflict"
            value={customConflict}
            onChange={(e) => {
              setCustomConflict(e.target.value);
              if (e.target.value) setPlot({ ...plot, conflict: '' });
            }}
          />
        </div>
        
        <div>
          <label className="field-label">SETTING</label>
          <div className="setting-chips">
            {genre.settings.map(s => {
              const isSelected = plot.setting === s;
              return (
                <span 
                  key={s} 
                  className={`setting-chip dk-body ${isSelected ? 'selected' : ''}`}
                  style={isSelected ? { borderColor: genre.color, background: `${genre.color}22`, color: '#fff' } : {}}
                  onClick={() => setPlot({ ...plot, setting: s })}
                >
                  {s}
                </span>
              );
            })}
          </div>
          <input 
            className="dk-input" 
            placeholder="Or type a custom setting..."
            value={plot.setting}
            onChange={(e) => setPlot({ ...plot, setting: e.target.value })}
          />
        </div>
      </div>
      
      {error && <div className="error-msg animate-in">{error}</div>}
      
      <div className="btn-row">
        <button className="btn-ghost dk-body" onClick={handleBack} disabled={isLoading}>← Back</button>
        <button className="btn-accent dk-body" onClick={handleNext} disabled={isLoading}>
          {isLoading ? 'Generating Outline...' : 'Generate Outline →'}
        </button>
      </div>
    </div>
  );
}
