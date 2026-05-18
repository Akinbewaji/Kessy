import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { callClaudeStream } from '../api/groq';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function StepWrite() {
  const { genre, characters, plot, outline, coverUrl, chapter, setChapter, resetApp } = useContext(AppContext);
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [savingToLib, setSavingToLib] = useState(false);
  const [error, setError] = useState('');
  const [isWide, setIsWide] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!genre) {
      navigate('/writer');
      return;
    }

    // Wait until userData is loaded (it might be null momentarily after login)
    if (currentUser && userData === undefined) return;

    // Only fetch if we haven't already generated the chapter
    if (!chapter && !isLoading && !hasFetched.current && outline) {
      if (!userData || ((userData.credits || 0) < 10 && userData.role !== 'admin' && !userData.permissions?.canBypassCredits)) {
        navigate('/pricing', { state: { from: '/writer/write' } });
        return;
      }
      hasFetched.current = true;
      generateAllChapters();
    }
  }, [chapter, isLoading, outline, userData, currentUser, navigate, genre]);

  if (!genre) return null;

  const generateAllChapters = async () => {
    // Only set loading if we haven't started. If we are streaming, we want to hide the spinner and show the text immediately.
    setIsLoading(true);
    setError('');
    
    let currentManuscript = '';
    setChapter('');
    
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
        
        const header = `Chapter ${ch.chapter}: ${ch.title}\n\n`;
        const prefix = currentManuscript + (i > 0 ? '\n\n\n' : '') + header;
        
        setIsLoading(false); // Hide spinner, let user watch the text stream
        
        const result = await callClaudeStream(prompt, system, (chunk) => {
          setChapter(prefix + chunk);
        });
        
        currentManuscript = prefix + result;
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

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSaveToLibrary = async () => {
    if (!currentUser) {
      setError("You must be logged in to save to library.");
      return;
    }
    setSavingToLib(true);
    try {
      console.log("Saving book to library...", { title: outline[0]?.title, userId: currentUser.uid });
      const docRef = await addDoc(collection(db, "books"), {
        userId: currentUser.uid,
        title: outline[0]?.title || 'Untitled',
        content: chapter,
        coverUrl: coverUrl,
        genreName: genre.name,
        genreColor: genre.color,
        hero: characters.maleName,
        heroine: characters.femaleName,
        setting: plot.setting,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      console.log("Book saved successfully!", docRef.id);
      
      setIsSuccess(true);
      // Fast transition
      setTimeout(() => {
        resetApp();
        navigate('/library');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 800); // Shorter duration for better UX
    } catch (err) {
      console.error("Firestore Save Error:", err);
      setError(`Failed to save: ${err.message || "Unknown error"}`);
    } finally {
      setSavingToLib(false);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderChapterContent = (text) => {
    if (!text) return null;
    
    // Split into segments by chapter headers
    // Using a regex to split and keep the delimiter if it matches Chapter X: Title
    const segments = text.split(/(?=Chapter \d+:)/g);
    
    return segments.map((segment, segIdx) => {
      // Find the header (first line) and content (rest)
      const lines = segment.trim().split('\n');
      const header = lines[0];
      const rest = lines.slice(1).join('\n').trim();
      
      const isHeader = header.startsWith('Chapter ');
      
      return (
        <React.Fragment key={segIdx}>
          {isHeader && (
            <h3 className="chapter-header dk-title">
              {header}
            </h3>
          )}
          
          {rest.split(/\n\n+/).map((para, paraIdx) => (
            <p key={paraIdx} className="chapter-paragraph">
              {para.split('\n').map((line, lineIdx) => (
                <React.Fragment key={lineIdx}>
                  {line}
                  {lineIdx < para.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          ))}
        </React.Fragment>
      );
    });
  };

  return (
    <div id="step-6" className="animate-in">
      {isSuccess && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,0,5,0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }} className="animate-in">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
          <h2 className="dk-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Masterpiece Saved!</h2>
          <p className="dk-body" style={{ color: '#a1a1aa' }}>Opening your editor...</p>
        </div>
      )}
      
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
        <div id="chapter-output" className={`animate-in ${isWide ? 'full-width' : ''}`}>
          <div className="btn-row" style={{ marginBottom: '1rem', justifyContent: 'center', gap: '1rem' }}>
             <button className="btn-ghost dk-body" onClick={() => setIsWide(!isWide)}>
               {isWide ? '⊙ Normal View' : '⊚ Wide View'}
             </button>
             <button className="btn-ghost dk-body" onClick={toggleFullScreen}>
               ⛶ Full Screen
             </button>
          </div>
          <div className="chapter-box" style={{ 
            border: `1px solid ${genre.color}33`,
            maxWidth: isWide ? '100%' : '1100px',
            padding: isWide ? '5rem 10%' : '5rem 6rem'
          }}>
            {coverUrl && (
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <img src={coverUrl} alt="Cover" style={{ maxWidth: '300px', width: '100%', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} />
              </div>
            )}
            <div className="manuscript-content">
              {renderChapterContent(chapter)}
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-ghost dk-body" onClick={handleBack} disabled={isLoading}>← Back to Cover</button>
            <button className="btn-accent dk-body" onClick={downloadChapter} disabled={isLoading}>
              {isLoading ? 'Writing...' : 'Download Full Story'}
            </button>
            <button className="btn-accent dk-body" onClick={handleSaveToLibrary} disabled={isLoading || savingToLib}>
              {savingToLib ? 'Saving...' : 'Save to Library'}
            </button>
            <button className="btn-accent outline dk-body" onClick={() => { resetApp(); navigate('/'); }} disabled={isLoading}>Start New Story</button>
          </div>
        </div>
      )}
    </div>
  );
}
