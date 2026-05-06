import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { callClaude } from '../api/groq';

export default function StepWrite() {
  const { genre, characters, plot, outline, coverUrl, chapter, setChapter, resetApp } = useContext(AppContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    // Only fetch if we haven't already generated the chapter
    if (!chapter && !isLoading && !hasFetched.current && outline) {
      hasFetched.current = true;
      generateAllChapters();
    }
  }, [chapter, isLoading, outline]);

  const generateAllChapters = async () => {
    setIsLoading(true);
    setError('');
    
    let currentManuscript = '';
    
    try {
      for (let i = 0; i < outline.length; i++) {
        const ch = outline[i];
        const opener = genre.openers[Math.floor(Math.random() * genre.openers.length)];
        
        const prompt = `Write Chapter ${ch.chapter} of this dark romance story.

Title: ${ch.title}
Summary: ${ch.summary}
Hero: ${characters.maleName}
Heroine: ${characters.femaleName}
Setting: ${plot.setting}
${i === 0 ? `Suggested opener style: "${opener}"\n` : ''}
Write 800-1000 words. Fast-paced, short paragraphs, 70% dialogue. Show don't tell. Make it INTENSE.`;

        const system = `You are a dark romance author specializing in ${genre.name} fiction. Your style: cinematic, emotionally raw, fast-paced with short punchy paragraphs. Heavy dialogue. Forbidden tension. Every scene pushes the story forward.`;
        
        const result = await callClaude(prompt, system);
        const formattedResult = `Chapter ${ch.chapter}: ${ch.title}\n\n${result}`;
        
        currentManuscript += (i > 0 ? '\n\n\n' : '') + formattedResult;
        setChapter(currentManuscript);
      }
    } catch(e) {
      setError('Could not generate all chapters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadChapter = () => {
    const blob = new Blob([chapter], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${characters.maleName}-${characters.femaleName}-full-story.txt`;
    a.click();
  };

  const handleBack = () => {
    navigate('/cover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="step-6" className="animate-in">
      <p className="step-eyebrow dk-body" style={{ color: 'var(--accent)' }}>STEP 06</p>
      <h2 className="step-title dk-title">Your Manuscript</h2>
      
      {isLoading && (
        <div id="loading-screen" className="animate-in">
          <p className="loading-title dk-title" style={{ color: 'var(--accent)' }}>Writing your story...</p>
          <div className="dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      )}
      
      {error && <div className="error-msg animate-in">{error}</div>}
      
      {chapter && (
        <div id="chapter-output" className="animate-in">
          <div className="chapter-box" style={{ border: `1px solid ${genre.color}33` }}>
            {coverUrl && (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <img src={coverUrl} alt="Cover" style={{ maxWidth: '300px', width: '100%', borderRadius: '4px' }} />
              </div>
            )}
            <p className="chapter-text">{chapter}</p>
          </div>
          <div className="btn-row">
            <button className="btn-ghost dk-body" onClick={handleBack} disabled={isLoading}>← Back to Cover</button>
            <button className="btn-accent dk-body" onClick={downloadChapter} disabled={isLoading}>
              {isLoading ? 'Writing...' : 'Download Full Story'}
            </button>
            <button className="btn-accent outline dk-body" onClick={() => { resetApp(); navigate('/'); }} disabled={isLoading}>Start New Story</button>
          </div>
        </div>
      )}
    </div>
  );
}
