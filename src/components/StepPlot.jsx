import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { callClaude } from '../api/groq';
import { useAuth } from '../context/AuthContext';

export default function StepPlot() {
  const { 
    genre, characters, plot, setPlot, setOutline, 
    darknessLevel, setDarknessLevel,
    heatLevel, setHeatLevel,
    possessivenessLevel, setPossessivenessLevel,
    heaGuarantee, setHeaGuarantee,
    chapterCount, setChapterCount
  } = useContext(AppContext);
  
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customConflict, setCustomConflict] = useState('');

  useEffect(() => {
    if (!genre) {
      navigate('/writer');
    }
  }, [genre, navigate]);

  if (!genre) return null;

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
      const prompt = `Generate a ${chapterCount}-chapter dark romance outline for a ${genre.name} story.
Hero: ${characters.maleName} (${genre.leads.male})
Heroine: ${characters.femaleName} (${genre.leads.female})
Setting: ${plot.setting}
Trope: ${plot.trope}
Core conflict: ${activeConflict}

Intensity Settings:
- Darkness Level: ${darknessLevel}/5 (1=Mild Angst, 5=Pitch Black/Traumatic)
- Heat Level: ${heatLevel}/5 (1=Slow Burn, 5=Explicit/Erotica)
- Possessiveness/Jealousy: ${possessivenessLevel}/5 (1=Mild, 5=Unhinged/Stalker)
- Ending Guarantee: ${heaGuarantee}

Create a specialized Dark Romance Save the Cat-style beat sheet adapted into ${chapterCount} chapters. 
Ensure the story beats reflect the chosen intensity settings and ending guarantee.
For each chapter, suggest the best Point of View (either "${characters.maleName}" or "${characters.femaleName}").

Return ONLY a JSON array of ${chapterCount} objects exactly matching this format:
[{"chapter":1,"title":"Chapter title","summary":"2-sentence chapter summary","pov":"${characters.maleName}"}]
No markdown, no explanation. Pure JSON only.
IMPORTANT: Ensure the response is valid, parsable JSON. If you include any quotes inside the chapter titles or summaries, escape them properly with a backslash (e.g. \\"). Do not include any trailing commas.`;

      const system = `You are a dark romance story expert specializing in ${genre.name} romance. You write fast-paced, emotionally intense outlines with strong hooks. Return ONLY valid JSON arrays, nothing else.`;
      
      const result = await callClaude(prompt, system);
      
      let clean = result;
      const startIdx = result.indexOf('[');
      const endIdx = result.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        clean = result.slice(startIdx, endIdx + 1);
      } else {
        clean = result.replace(/```json|```/g, '').trim();
      }

      setOutline(JSON.parse(clean));
      navigate('/writer/outline');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch(e) {
      console.error("Outline generation/parsing error:", e);
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
      <p className="step-sub dk-body">Pick your trope, conflict, setting, and dial in the intensity.</p>
      
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

        <div>
          <label className="field-label">NUMBER OF CHAPTERS</label>
          <select 
            className="dk-input" 
            value={chapterCount}
            onChange={(e) => setChapterCount(parseInt(e.target.value))}
          >
            <option value={5}>5 Chapters</option>
            <option value={10}>10 Chapters (Recommended)</option>
            <option value={15}>15 Chapters</option>
            <option value={20}>20 Chapters</option>
          </select>
        </div>
      </div>

      <div className="field-group" style={{ marginTop: '3rem', padding: '2rem', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
        <h3 className="dk-title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: genre.color }}>Intensity & Themes</h3>
        
        <div>
          <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>DARKNESS LEVEL</span>
            <span style={{ color: genre.color }}>{darknessLevel}/5</span>
          </label>
          <input 
            type="range" 
            min="1" max="5" 
            value={darknessLevel} 
            onChange={e => setDarknessLevel(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: genre.color }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginTop: '0.2rem' }}>
            <span>Mild Angst</span>
            <span>Pitch Black</span>
          </div>
        </div>

        <div>
          <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>HEAT LEVEL</span>
            <span style={{ color: genre.color }}>{heatLevel}/5</span>
          </label>
          <input 
            type="range" 
            min="1" max="5" 
            value={heatLevel} 
            onChange={e => setHeatLevel(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: genre.color }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginTop: '0.2rem' }}>
            <span>Slow Burn</span>
            <span>Explicit</span>
          </div>
        </div>

        <div>
          <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>POSSESSIVENESS / JEALOUSY</span>
            <span style={{ color: genre.color }}>{possessivenessLevel}/5</span>
          </label>
          <input 
            type="range" 
            min="1" max="5" 
            value={possessivenessLevel} 
            onChange={e => setPossessivenessLevel(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: genre.color }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginTop: '0.2rem' }}>
            <span>Protective</span>
            <span>Unhinged/Stalker</span>
          </div>
        </div>

        <div>
          <label className="field-label">ENDING GUARANTEE</label>
          <select 
            className="dk-input" 
            value={heaGuarantee}
            onChange={(e) => setHeaGuarantee(e.target.value)}
          >
            <option value="HEA">HEA (Happily Ever After)</option>
            <option value="HFN">HFN (Happy For Now)</option>
            <option value="Tragic">Tragic / Dark Ending</option>
          </select>
        </div>
      </div>
      
      {error && <div className="error-msg animate-in">{error}</div>}
      
      <div className="btn-row" style={{ marginTop: '2rem' }}>
        <button className="btn-ghost dk-body" onClick={handleBack} disabled={isLoading}>← Back</button>
        <button className="btn-accent dk-body" onClick={handleNext} disabled={isLoading}>
          {isLoading ? 'Generating Outline...' : 'Generate Outline →'}
        </button>
      </div>
    </div>
  );
}
