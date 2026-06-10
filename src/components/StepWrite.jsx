import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { callClaudeStream } from '../api/groq';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function StepWrite() {
  const { 
    genre, characters, plot, outline, coverUrl, 
    chapters, setChapters, resetApp,
    darknessLevel, heatLevel, possessivenessLevel, dualPov 
  } = useContext(AppContext);
  
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  // Which chapter is actively generating right now
  const [activeGeneratingChapter, setActiveGeneratingChapter] = useState(null);
  // Is a batch generation process currently running
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [savingToLib, setSavingToLib] = useState(false);
  const [error, setError] = useState('');
  const [isWide, setIsWide] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Trigger Warning states
  const [triggerWarnings, setTriggerWarnings] = useState('');
  const [isGeneratingTW, setIsGeneratingTW] = useState(false);
  const [showTWModal, setShowTWModal] = useState(false);

  // Track if we should stop batch generation
  const stopBatchRef = useRef(false);

  useEffect(() => {
    if (!genre) {
      navigate('/writer');
      return;
    }
  }, [genre, navigate]);

  if (!genre || !outline) return null;

  const generateSingleChapter = async (chapterObj, isBatch = false) => {
    const chIndex = chapterObj.chapter;
    
    // Check credits before starting
    if (!userData || ((userData.credits || 0) < 2 && userData.role !== 'admin' && !userData.permissions?.canBypassCredits)) {
      navigate('/pricing', { state: { from: '/writer/write' } });
      return false; // Return false to indicate failure/interruption
    }

    setActiveGeneratingChapter(chIndex);
    setError('');
    
    try {
      const opener = genre.openers[Math.floor(Math.random() * genre.openers.length)];
      let previousContext = '';
      if (chIndex > 1) {
        const prevText = chapters[chIndex - 1];
        if (prevText && prevText.length > 50) {
          const tail = prevText.slice(-1500);
          previousContext = `\n---\nPREVIOUS CHAPTER ENDING:\n"...${tail}"\n---\nCRITICAL INSTRUCTION: DO NOT re-introduce the characters or repeat the setting. DO NOT repeat the events from the previous chapter. Pick up the story seamlessly exactly where the previous chapter ended and immediately advance the plot.`;
        }
      }

      const prompt = `Write Chapter ${chIndex} of this dark romance story.

Title: ${chapterObj.title}
Summary: ${chapterObj.summary}
Hero: ${characters.maleName}
Heroine: ${characters.femaleName}
Setting: ${plot.setting}
${dualPov && chapterObj.pov ? `Point of View (POV): Write this entire chapter strictly from the perspective and inner voice of ${chapterObj.pov}.\n` : ''}
${chIndex === 1 ? `Suggested opener style: "${opener}"\n` : ''}${previousContext}

Intensity & Themes:
- Darkness Level: ${darknessLevel}/5
- Heat Level: ${heatLevel}/5
- Possessiveness/Jealousy: ${possessivenessLevel}/5

Write 800-1000 words. Fast-paced, short paragraphs, 70% dialogue. Show don't tell. Make it INTENSE and ensure the prose matches the requested intensity levels.`;

      const system = `You are a dark romance author specializing in ${genre.name} fiction. Your style: cinematic, emotionally raw, fast-paced with short punchy paragraphs. Heavy dialogue. Forbidden tension. Every scene pushes the story forward.`;
      
      let tempText = '';
      
      await callClaudeStream(prompt, system, (fullText) => {
        tempText = fullText;
      }, 2); // 2 credits per generation

      // Final update to show the completely finished text
      setChapters(prev => ({
        ...prev,
        [chIndex]: tempText
      }));

      return true;
    } catch(e) {
      console.error(e);
      setError(`Failed to generate Chapter ${chIndex}. Please try again.`);
      return false;
    } finally {
      setActiveGeneratingChapter(null);
    }
  };

  const handleGenerateChapter = async (chapterObj) => {
    setIsBatchGenerating(false);
    stopBatchRef.current = true;
    await generateSingleChapter(chapterObj);
  };

  const generateRemainingChapters = async () => {
    setIsBatchGenerating(true);
    stopBatchRef.current = false;
    
    for (let i = 0; i < outline.length; i++) {
      if (stopBatchRef.current) break;
      
      const ch = outline[i];
      // Skip if already generated
      if (chapters[ch.chapter] && chapters[ch.chapter].length > 100) continue;
      
      // Find the chapter element to scroll into view
      setTimeout(() => {
        const el = document.getElementById(`chapter-box-${ch.chapter}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      const success = await generateSingleChapter(ch, true);
      if (!success) break; // Stop batch if a chapter failed or ran out of credits
    }
    
    setIsBatchGenerating(false);
  };

  const handleStopBatch = () => {
    stopBatchRef.current = true;
    setIsBatchGenerating(false);
  };

  const getCombinedManuscriptText = () => {
    let combined = '';
    outline.forEach(ch => {
      if (chapters[ch.chapter]) {
        combined += `Chapter ${ch.chapter}: ${ch.title}\n\n${chapters[ch.chapter]}\n\n\n`;
      }
    });
    return combined.trim();
  };

  const handleGenerateTriggerWarnings = async () => {
    const text = getCombinedManuscriptText();
    if (!text || text.length < 500) {
      setError("Please generate at least one full chapter before extracting trigger warnings.");
      return;
    }
    
    if (!userData || ((userData.credits || 0) < 1 && userData.role !== 'admin' && !userData.permissions?.canBypassCredits)) {
      navigate('/pricing', { state: { from: '/writer/write' } });
      return;
    }

    setShowTWModal(true);
    setIsGeneratingTW(true);
    setTriggerWarnings('');

    try {
      const prompt = `Read the following dark romance manuscript and generate a comprehensive Trigger Warning / Content Warning page for the author to use. Focus on identifying common dark themes like violence, dubious consent, psychological manipulation, etc. Format it clearly as a bulleted list. Keep it concise but thorough.
      
      Manuscript:
      ${text}
      `;
      
      const system = "You are an expert editor who accurately identifies trigger warnings and content warnings for dark romance novels.";
      
      await callClaudeStream(prompt, system, (fullText) => {
        setTriggerWarnings(fullText);
      }, 1); // 1 credit for trigger warnings
    } catch(e) {
      setTriggerWarnings("Failed to generate trigger warnings. Please try again.");
    } finally {
      setIsGeneratingTW(false);
    }
  };

  const downloadChapter = () => {
    const text = getCombinedManuscriptText();
    if (!text) {
      setError("No chapters generated yet.");
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${characters.maleName}-${characters.femaleName}-story.txt`;
    a.click();
  };

  const handleBack = () => {
    navigate('/writer/cover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToLibrary = async () => {
    if (!currentUser) {
      setError("You must be logged in to save to library.");
      return;
    }
    
    // Combine chapters into HTML for Quill
    let htmlContent = '';
    
    // Insert Trigger Warnings if they exist
    if (triggerWarnings) {
      htmlContent += `<h2>Trigger Warnings</h2>`;
      const twParagraphs = triggerWarnings.split(/\n\n+/);
      twParagraphs.forEach(p => {
        htmlContent += `<p>${p.replace(/\n/g, '<br/>')}</p>`;
      });
      htmlContent += `<hr/>`;
    }

    outline.forEach(ch => {
      if (chapters[ch.chapter]) {
        htmlContent += `<h2>Chapter ${ch.chapter}: ${ch.title}</h2>`;
        // Split by newlines and wrap in <p> tags
        const paragraphs = chapters[ch.chapter].split(/\n\n+/);
        paragraphs.forEach(p => {
          htmlContent += `<p>${p.replace(/\n/g, '<br/>')}</p>`;
        });
      }
    });

    if (!htmlContent) {
      setError("Please generate at least one chapter before saving.");
      return;
    }

    setSavingToLib(true);
    try {
      const docRef = await addDoc(collection(db, "books"), {
        userId: currentUser.uid,
        title: outline[0]?.title || 'Untitled',
        content: htmlContent,
        coverUrl: coverUrl,
        genreName: genre.name,
        genreColor: genre.color,
        hero: characters.maleName,
        heroine: characters.femaleName,
        setting: plot.setting,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        resetApp();
        navigate('/library');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 800);
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

  // Check if all chapters are generated
  const allGenerated = outline.every(ch => chapters[ch.chapter] && chapters[ch.chapter].length > 100);

  return (
    <div id="step-6" className="animate-in" style={{ paddingBottom: '100px' }}>
      {isSuccess && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(5,0,5,0.9)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)'
        }} className="animate-in">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✨</div>
          <h2 className="dk-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Masterpiece Saved!</h2>
          <p className="dk-body" style={{ color: '#a1a1aa' }}>Opening your editor...</p>
        </div>
      )}

      {showTWModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(5,0,5,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)'
        }} className="animate-in">
          <div className="glass-card" style={{ width: '90%', maxWidth: '600px', padding: '2rem', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={() => setShowTWModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
            <h3 className="dk-title" style={{ marginBottom: '1rem', color: '#ef4444' }}>⚠️ Trigger Warnings</h3>
            
            {isGeneratingTW && !triggerWarnings ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: genre.color }} className="dk-body">
                <span className="dot" style={{ background: genre.color, width: '8px', height: '8px', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                Analyzing manuscript for dark themes...
              </div>
            ) : (
              <div className="dk-body" style={{ whiteSpace: 'pre-wrap', color: '#e4e4e7', lineHeight: '1.6' }}>
                {triggerWarnings}
              </div>
            )}
            
            {!isGeneratingTW && (
              <button className="btn-accent dk-body" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setShowTWModal(false)}>
                Done
              </button>
            )}
          </div>
        </div>
      )}
      
      <p className="step-eyebrow dk-body" style={{ color: 'var(--accent)' }}>STEP 06</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h2 className="step-title dk-title">Your Manuscript</h2>
        {Object.keys(chapters).length > 0 && (
          <button 
            className="btn-accent outline dk-body" 
            style={{ borderColor: '#ef4444', color: '#ef4444' }}
            onClick={handleGenerateTriggerWarnings}
          >
            ⚠️ Auto-Generate Trigger Warnings
          </button>
        )}
      </div>
      
      {error && <div className="error-msg animate-in">{error}</div>}

      <div className={`animate-in ${isWide ? 'full-width' : ''}`} style={{ maxWidth: isWide ? '100%' : '1100px', margin: '0 auto', marginTop: '1rem' }}>
        
        <div className="btn-row" style={{ marginBottom: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             {!allGenerated && !isBatchGenerating && (
               <button className="btn-accent dk-body" onClick={generateRemainingChapters}>
                 ✦ Generate All Remaining Chapters
               </button>
             )}
             {isBatchGenerating && (
               <button className="btn-accent outline dk-body" onClick={handleStopBatch} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                 ⏹ Stop Generating
               </button>
             )}
           </div>
           <div style={{ display: 'flex', gap: '1rem' }}>
             <button className="btn-ghost dk-body" onClick={() => setIsWide(!isWide)}>
               {isWide ? '⊙ Normal View' : '⊚ Wide View'}
             </button>
             <button className="btn-ghost dk-body" onClick={toggleFullScreen}>
               ⛶ Full Screen
             </button>
           </div>
        </div>

        {coverUrl && (
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <img src={coverUrl} alt="Cover" style={{ maxWidth: '250px', width: '100%', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} />
          </div>
        )}

        <div className="manuscript-chapters" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {outline.map((ch) => {
            const isGenerated = chapters[ch.chapter] && chapters[ch.chapter].length > 0;
            const isGenerating = activeGeneratingChapter === ch.chapter;
            
            return (
              <div 
                id={`chapter-box-${ch.chapter}`}
                key={ch.chapter} 
                className="glass-card" 
                style={{ 
                  padding: '2.5rem', 
                  border: isGenerating ? `1px solid ${genre.color}` : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: isGenerating ? `0 0 20px ${genre.color}33` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 className="dk-title" style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>Chapter {ch.chapter}: {ch.title}</h3>
                    <p className="dk-body" style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0, maxWidth: '600px' }}>
                      {dualPov && ch.pov && <span style={{ color: genre.color, marginRight: '0.5rem', fontWeight: 'bold' }}>[{ch.pov}'s POV]</span>}
                      {ch.summary}
                    </p>
                  </div>
                  
                  <div>
                    {isGenerating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: genre.color }} className="dk-body font-bold">
                        <span className="dot" style={{ background: genre.color, width: '8px', height: '8px', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                        Writing...
                      </div>
                    ) : isGenerated ? (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="dk-body font-bold">
                          ✓ Complete
                        </span>
                        {!isBatchGenerating && (
                           <button className="btn-ghost dk-body" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleGenerateChapter(ch)}>
                             Regenerate (2 Credits)
                           </button>
                        )}
                      </div>
                    ) : (
                      <button 
                        className="btn-accent outline dk-body" 
                        onClick={() => handleGenerateChapter(ch)}
                        disabled={isBatchGenerating || activeGeneratingChapter !== null}
                      >
                        Generate (2 Credits)
                      </button>
                    )}
                  </div>
                </div>

                {isGenerated && !isGenerating && (
                  <div className="chapter-content dk-body" style={{ 
                    marginTop: '2rem', 
                    paddingTop: '2rem', 
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.8',
                    fontSize: '1.1rem',
                    color: '#e4e4e7'
                  }}>
                    {chapters[ch.chapter]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="btn-row" style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button className="btn-ghost dk-body" onClick={handleBack} disabled={isBatchGenerating || activeGeneratingChapter !== null}>← Back</button>
          <button className="btn-accent outline dk-body" onClick={downloadChapter} disabled={isBatchGenerating || activeGeneratingChapter !== null || Object.keys(chapters).length === 0}>
            Download TXT
          </button>
          <button className="btn-accent dk-body" onClick={handleSaveToLibrary} disabled={isBatchGenerating || activeGeneratingChapter !== null || Object.keys(chapters).length === 0 || savingToLib}>
            {savingToLib ? 'Saving...' : 'Save to Library'}
          </button>
          <button className="btn-ghost dk-body" onClick={() => { resetApp(); navigate('/'); }} disabled={isBatchGenerating || activeGeneratingChapter !== null} style={{ color: '#ef4444' }}>Discard Story</button>
        </div>
      </div>
    </div>
  );
}
