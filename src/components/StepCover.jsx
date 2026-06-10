import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { callClaude, callStabilityImage } from '../api/groq';
import { useAuth } from '../context/AuthContext';

export default function StepCover() {
  const { genre, characters, plot, coverUrl, setCoverUrl, outline } = useContext(AppContext);
  const { userData } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'series'

  // Generation controls
  const [userIdea, setUserIdea] = useState('');
  const [engine, setEngine] = useState('stability'); // 'stability' | 'pollinations'
  const [stylePreset, setStylePreset] = useState('none');
  const [isSeedLocked, setIsSeedLocked] = useState(false);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2147483647));
  const [refFacePreviewUrl, setRefFacePreviewUrl] = useState(null);

  // Typography state (Single Cover)
  const [titleText, setTitleText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [taglineText, setTaglineText] = useState('A DARK ROMANCE NOVEL');
  const [badgeEnabled, setBadgeEnabled] = useState(true);
  const [textColor, setTextColor] = useState('#D4AF37'); // Gold default
  const [titleFont, setTitleFont] = useState('Cormorant Garamond');

  // AI Taglines
  const [suggestedTaglines, setSuggestedTaglines] = useState([]);
  const [isGeneratingTaglines, setIsGeneratingTaglines] = useState(false);

  // Series states
  const [seriesCovers, setSeriesCovers] = useState([
    { volume: 1, title: 'The Dark Secret', rawBgUrl: null, bakedUrl: null },
    { volume: 2, title: 'The Silent Prey', rawBgUrl: null, bakedUrl: null },
    { volume: 3, title: 'The Crimson Crown', rawBgUrl: null, bakedUrl: null }
  ]);

  // General loading/error
  const [isLoading, setIsLoading] = useState(false);
  const [isBaking, setIsBaking] = useState(false);
  const [error, setError] = useState('');

  // Local state to hold the raw background image URL before baking
  const [rawBgUrl, setRawBgUrl] = useState(null);

  // Sync default title & author
  useEffect(() => {
    if (outline && outline[0] && !titleText) {
      setTitleText(outline[0].title || 'Untitled Masterpiece');
    }
    if (currentUser && !authorName) {
      const name = currentUser.email ? currentUser.email.split('@')[0] : 'Kessy Knight';
      setAuthorName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [outline]);

  const { currentUser } = useAuth();

  useEffect(() => {
    if (!genre) {
      navigate('/writer');
    }
  }, [genre, navigate]);

  // Bake cover logic (merges text & badges onto rawBgUrl using canvas)
  const bakeSingleCover = (bgUrl, customTitle, customAuthor, customTagline, showBadge, colorVal, fontVal) => {
    if (!bgUrl) return;
    setIsBaking(true);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 1. Draw background image
      ctx.drawImage(img, 0, 0, 512, 768);

      // 2. Add subtle vignette/shadow layer to make text readable
      const grad = ctx.createLinearGradient(0, 0, 0, 768);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      grad.addColorStop(0.2, 'rgba(0, 0, 0, 0.1)');
      grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 768);

      // 3. Draw Bestseller Badge
      if (showBadge) {
        ctx.save();
        ctx.translate(256, 55);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#D4AF37';
        ctx.font = '6px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('USA TODAY', 0, -4);
        ctx.font = 'bold 6px Montserrat, sans-serif';
        ctx.fillText('BESTSELLER', 0, 4);
        ctx.font = '5px Montserrat, sans-serif';
        ctx.fillText('★ ★ ★', 0, 11);
        ctx.restore();
      }

      // 4. Draw Tagline
      if (customTagline) {
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '500 10px Montserrat, sans-serif';
        ctx.letterSpacing = '3px';
        ctx.textAlign = 'center';
        ctx.fillText(customTagline.toUpperCase(), 256, 120);
      }

      // 5. Draw Title (with word wrapping)
      ctx.fillStyle = colorVal;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      ctx.font = `italic 38px ${fontVal === 'Cinzel' ? 'Cinzel, serif' : fontVal === 'Cormorant Garamond' ? 'Cormorant Garamond, serif' : 'Montserrat, sans-serif'}`;
      ctx.textAlign = 'center';

      const words = customTitle.split(' ');
      let lines = [];
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const width = ctx.measureText(currentLine + ' ' + words[i]).width;
        if (width < 430) {
          currentLine += ' ' + words[i];
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);

      const titleStartY = 380 - (lines.length - 1) * 25;
      lines.forEach((line, idx) => {
        ctx.fillText(line, 256, titleStartY + idx * 48);
      });
      
      // Reset shadow
      ctx.shadowColor = 'transparent';

      // 6. Draw Author Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 14px Montserrat, sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText(customAuthor.toUpperCase(), 256, 700);

      const bakedDataUrl = canvas.toDataURL('image/png');
      setCoverUrl(bakedDataUrl);
      setIsBaking(false);
    };
    img.src = bgUrl;
  };

  // Re-bake when typography changes
  useEffect(() => {
    if (rawBgUrl && activeTab === 'single') {
      const timeout = setTimeout(() => {
        bakeSingleCover(rawBgUrl, titleText, authorName, taglineText, badgeEnabled, textColor, titleFont);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [rawBgUrl, titleText, authorName, taglineText, badgeEnabled, textColor, titleFont, activeTab]);

  const handleBack = () => {
    navigate('/writer/outline');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    navigate('/writer/write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFaceUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setRefFacePreviewUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePromptWithPresetStyle = (basePrompt) => {
    let styledPrompt = basePrompt;
    if (stylePreset === 'oil_painting') {
      styledPrompt += ", in a dark romance oil painting style with thick visible brushstrokes, high contrast chiaroscuro lighting, dramatic shadows, moody and classical atmosphere";
    } else if (stylePreset === 'gothic') {
      styledPrompt += ", a gothic photography piece, low-key lighting, dark moody vignette, high detail, haunting romantic atmosphere, shadow play";
    } else if (stylePreset === 'illustrated') {
      styledPrompt += ", a modern illustrated book cover design, dark graphic romance illustration, minimal clean lines, deep crimson and obsidian color palette, dramatic flat art style";
    } else if (stylePreset === 'foil_stamp') {
      styledPrompt += ", dark gothic book cover with a foil-stamp effect, metallic gold and silver details embossed on black leather texture, luxury vintage romance design";
    }
    return styledPrompt;
  };

  // Tagline suggestions
  const handleGenerateTaglines = async () => {
    setIsGeneratingTaglines(true);
    setError('');
    try {
      const prompt = `Based on this dark romance story:
Genre: ${genre.name}
Trope: ${plot.trope}
Core Conflict: ${plot.conflict}
Hero: ${characters.maleName}
Heroine: ${characters.femaleName}
Setting: ${plot.setting}

Suggest 4 short, highly evocative, high-tension marketing taglines (under 10 words each) for the book cover. Return them as a simple bulleted list. No explanation, just the list.`;

      const system = "You are a branding expert specializing in bestselling dark romance books.";
      const result = await callClaude(prompt, system);
      const lines = result.split('\n')
        .map(line => line.replace(/^[-*•\d.\s]+/, '').trim())
        .filter(line => line.length > 3);
      setSuggestedTaglines(lines);
    } catch (e) {
      console.error(e);
      setError("Failed to generate taglines. Please try again.");
    } finally {
      setIsGeneratingTaglines(false);
    }
  };

  // Main generator trigger
  const handleGenerate = async () => {
    // Check credits for Stability
    if (engine === 'stability') {
      const cost = activeTab === 'series' ? 3 : 1;
      if (!userData || ((userData.credits || 0) < cost && userData.role !== 'admin' && !userData.permissions?.canBypassCredits)) {
        navigate('/pricing', { state: { from: '/writer/cover' } });
        return;
      }
    }

    setIsLoading(true);
    setError('');

    // Generate prompt text via Groq
    let rawPrompt = '';
    try {
      const promptText = `Write a highly descriptive, comma-separated visual prompt for an AI image generator to create a dark romance cover for this book.
Genre: ${genre.name} Dark Romance
Setting: ${plot.setting}
Hero: ${characters.maleName} (${genre.leads.male})
Heroine: ${characters.femaleName} (${genre.leads.female})
User idea: ${userIdea || 'atmospheric and intense visual'}

IMPORTANT: Avoid any text, lettering, borders, frames, or layouts. Do NOT use explicit, NSFW, or filter-triggering terms (like blood, naked, sex). Return ONLY the 150-character prompt.`;

      const system = "You are an expert prompt engineer. You output only raw visual image generator prompts under 150 characters.";
      rawPrompt = await callClaude(promptText, system);
    } catch (e) {
      console.error(e);
      setError("Failed to prepare image generator prompt.");
      setIsLoading(false);
      return;
    }

    const currentSeed = isSeedLocked ? seed : Math.floor(Math.random() * 2147483647);
    if (!isSeedLocked) setSeed(currentSeed);

    const styledPrompt = generatePromptWithPresetStyle(rawPrompt);

    if (activeTab === 'single') {
      try {
        let finalBg = '';
        if (engine === 'pollinations') {
          finalBg = `https://image.pollinations.ai/prompt/${encodeURIComponent(styledPrompt)}?width=512&height=768&nologo=true&private=true&enhance=false&seed=${currentSeed}`;
        } else {
          const base64Str = await callStabilityImage(styledPrompt, 1, currentSeed);
          finalBg = `data:image/png;base64,${base64Str}`;
        }
        setRawBgUrl(finalBg);
        bakeSingleCover(finalBg, titleText, authorName, taglineText, badgeEnabled, textColor, titleFont);
      } catch (e) {
        console.error(e);
        setError(`Failed to generate cover: ${e.message || 'Server error'}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Trilogy series generation
      setIsLoading(true);
      const updatedSeries = [...seriesCovers];

      for (let i = 0; i < 3; i++) {
        const bookSeed = currentSeed + i;
        const bookTitle = updatedSeries[i].title;
        const volumePrompt = `${styledPrompt}, representing volume ${i+1} of a series, matching theme`;

        try {
          let bookBg = '';
          if (engine === 'pollinations') {
            bookBg = `https://image.pollinations.ai/prompt/${encodeURIComponent(volumePrompt)}?width=512&height=768&nologo=true&private=true&enhance=false&seed=${bookSeed}`;
          } else {
            const base64Str = await callStabilityImage(volumePrompt, 1, bookSeed);
            bookBg = `data:image/png;base64,${base64Str}`;
          }
          updatedSeries[i].rawBgUrl = bookBg;
          updatedSeries[i].bakedUrl = await bakeSeriesCoverPromise(bookBg, bookTitle, authorName, taglineText, badgeEnabled, textColor, titleFont, i + 1);
        } catch (e) {
          console.error(e);
          setError(`Trilogy generation failed on Book ${i+1}`);
          break;
        }
      }
      setSeriesCovers(updatedSeries);
      setIsLoading(false);
    }
  };

  // Promise wrapper to bake series covers cleanly in sequence
  const bakeSeriesCoverPromise = (bgUrl, customTitle, customAuthor, customTagline, showBadge, colorVal, fontVal, volume) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 768;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 512, 768);

        // Vignette
        const grad = ctx.createLinearGradient(0, 0, 0, 768);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        grad.addColorStop(0.2, 'rgba(0, 0, 0, 0.1)');
        grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.15)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 768);

        // Bestseller Badge
        if (showBadge) {
          ctx.save();
          ctx.translate(256, 55);
          ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#D4AF37';
          ctx.font = '6px Montserrat, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('USA TODAY', 0, -4);
          ctx.font = 'bold 6px Montserrat, sans-serif';
          ctx.fillText('BESTSELLER', 0, 4);
          ctx.font = '5px Montserrat, sans-serif';
          ctx.fillText('★ ★ ★', 0, 11);
          ctx.restore();
        }

        // Volume header
        ctx.fillStyle = '#a1a1aa';
        ctx.font = '600 9px Montserrat, sans-serif';
        ctx.letterSpacing = '5px';
        ctx.textAlign = 'center';
        ctx.fillText(`VOLUME 0${volume}`, 256, 120);

        // Title
        ctx.fillStyle = colorVal;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;
        ctx.font = `italic 36px ${fontVal === 'Cinzel' ? 'Cinzel, serif' : fontVal === 'Cormorant Garamond' ? 'Cormorant Garamond, serif' : 'Montserrat, sans-serif'}`;
        ctx.textAlign = 'center';

        const words = customTitle.split(' ');
        let lines = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
          const width = ctx.measureText(currentLine + ' ' + words[i]).width;
          if (width < 430) {
            currentLine += ' ' + words[i];
          } else {
            lines.push(currentLine);
            currentLine = words[i];
          }
        }
        lines.push(currentLine);

        const titleStartY = 380 - (lines.length - 1) * 25;
        lines.forEach((line, idx) => {
          ctx.fillText(line, 256, titleStartY + idx * 48);
        });

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Author
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 14px Montserrat, sans-serif';
        ctx.letterSpacing = '4px';
        ctx.fillText(customAuthor.toUpperCase(), 256, 700);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = bgUrl;
    });
  };

  const handleDownload = () => {
    if (!coverUrl) return;
    const a = document.createElement('a');
    a.href = coverUrl;
    a.download = `${titleText.replace(/\s+/g, '_')}_Cover.png`;
    a.click();
  };

  const handleDownloadBook = (book) => {
    if (!book.bakedUrl) return;
    const a = document.createElement('a');
    a.href = book.bakedUrl;
    a.download = `${book.title.replace(/\s+/g, '_')}_Cover.png`;
    a.click();
  };

  const handleUseAsMain = (book) => {
    setRawBgUrl(book.rawBgUrl);
    setCoverUrl(book.bakedUrl);
    setTitleText(book.title);
    setActiveTab('single');
  };

  return (
    <div id="step-cover" className="animate-in" style={{ maxWidth: '1250px', margin: '0 auto' }}>
      <p className="step-eyebrow dk-body" style={{ color: 'var(--accent)' }}>STEP 05</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="step-title dk-title" style={{ marginBottom: 0 }}>Advanced Cover Studio</h2>
          <p className="step-sub dk-body" style={{ margin: 0 }}>Create premium typography covers and matching trilogies.</p>
        </div>

        {/* Tab switcher */}
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`} onClick={() => setActiveTab('single')}>
            Single Cover Studio
          </button>
          <button className={`tab-btn ${activeTab === 'series' ? 'active' : ''}`} onClick={() => { setActiveTab('series'); setCoverUrl(null); }}>
            Trilogy Series Generator
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid var(--glass-border)' }}>
          <div className="control-section">
            <h3 className="section-header dk-title" style={{ color: 'var(--accent-light)', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              🎨 Image Engine & Style
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">ENGINE</label>
                <select className="dk-input" style={{ width: '100%' }} value={engine} onChange={(e) => setEngine(e.target.value)}>
                  <option value="stability">Stability AI (1 Credit)</option>
                  <option value="pollinations">Pollinations.ai (Free)</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label className="field-label">STYLE PRESET</label>
                <select className="dk-input" style={{ width: '100%' }} value={stylePreset} onChange={(e) => setStylePreset(e.target.value)}>
                  <option value="none">Atmospheric Romance</option>
                  <option value="oil_painting">Dark Oil Painting</option>
                  <option value="gothic">Gothic Photography</option>
                  <option value="illustrated">Illustrated Cover</option>
                  <option value="foil_stamp">Foil-stamp Effect</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="field-label">VISUAL DESCRIPTION</label>
              <textarea
                className="dk-input"
                style={{ width: '100%', resize: 'none' }}
                rows={2}
                placeholder="e.g. A masked nobleman holding a candle in a dark ballroom..."
                value={userIdea}
                onChange={(e) => setUserIdea(e.target.value)}
              />
            </div>

            {/* Consistency Seed */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="field-label" style={{ margin: 0 }}>CHARACTER FACE CONSISTENCY</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer', color: '#a1a1aa' }}>
                  <input type="checkbox" checked={isSeedLocked} onChange={(e) => setIsSeedLocked(e.target.checked)} />
                  Lock Seed
                </label>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.5rem' }}>Locking the seed keeps character models consistent across multi-cover generations.</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  className="dk-input"
                  style={{ flex: 1, padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto' }}
                  disabled={!isSeedLocked}
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                />
                <button className="btn-ghost" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }} onClick={() => setSeed(Math.floor(Math.random() * 2147483647))}>
                  🎲 Roll
                </button>
              </div>
            </div>

            {/* Reference Face Inspiration */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
              <label className="field-label" style={{ marginBottom: '0.4rem' }}>FACE REFERENCE INSPIRATION</label>
              <input type="file" accept="image/*" onChange={handleFaceUpload} style={{ display: 'none' }} id="face-uploader" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label htmlFor="face-uploader" className="btn-ghost" style={{ cursor: 'pointer', padding: '0.4rem 1rem', fontSize: '0.75rem', display: 'inline-block' }}>
                  Upload Reference File
                </label>
                {refFacePreviewUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img src={refFacePreviewUrl} alt="Face ref" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent)' }} />
                    <button onClick={() => setRefFacePreviewUrl(null)} style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', border: 'none', borderRadius: '50%', width: '14px', height: '14px', color: '#fff', fontSize: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: '#666' }}>No reference face locked</span>
                )}
              </div>
            </div>
          </div>

          {activeTab === 'single' ? (
            <div className="control-section animate-in">
              <h3 className="section-header dk-title" style={{ color: 'var(--accent-light)', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                ✍ Book Typography
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="field-label">BOOK TITLE</label>
                <input type="text" className="dk-input" style={{ width: '100%' }} value={titleText} onChange={(e) => setTitleText(e.target.value)} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="field-label">AUTHOR NAME</label>
                <input type="text" className="dk-input" style={{ width: '100%' }} value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="field-label" style={{ margin: 0 }}>TAGLINE</label>
                  <button className="btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} disabled={isGeneratingTaglines} onClick={handleGenerateTaglines}>
                    {isGeneratingTaglines ? 'Generating...' : '🪄 AI Suggestions'}
                  </button>
                </div>
                <input type="text" className="dk-input" style={{ width: '100%' }} value={taglineText} onChange={(e) => setTaglineText(e.target.value)} />
                
                {suggestedTaglines.length > 0 && (
                  <div className="tagline-suggestions animate-in" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {suggestedTaglines.map((tag, idx) => (
                      <div key={idx} className="tagline-option dk-body" style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.75rem', color: '#a1a1aa', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setTaglineText(tag)}>
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label">TITLE FONT</label>
                  <select className="dk-input" style={{ width: '100%' }} value={titleFont} onChange={(e) => setTitleFont(e.target.value)}>
                    <option value="Cormorant Garamond">Cormorant Garamond</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label className="field-label">TITLE COLOR</label>
                  <select className="dk-input" style={{ width: '100%' }} value={textColor} onChange={(e) => setTextColor(e.target.value)}>
                    <option value="#D4AF37">Gold</option>
                    <option value="#E5E7EB">Silver</option>
                    <option value="#C53030">Crimson Red</option>
                    <option value="#FFFFFF">White</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="badge-check" checked={badgeEnabled} onChange={(e) => setBadgeEnabled(e.target.checked)} />
                <label htmlFor="badge-check" style={{ fontSize: '0.85rem', cursor: 'pointer', color: '#a1a1aa' }} className="dk-body">Include "Bestseller" Stamp Badge</label>
              </div>
            </div>
          ) : (
            <div className="control-section animate-in">
              <h3 className="section-header dk-title" style={{ color: 'var(--accent-light)', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                📚 Series Volume Titles
              </h3>
              {seriesCovers.map((book, idx) => (
                <div key={idx} style={{ marginBottom: '1.2rem' }}>
                  <label className="field-label">BOOK 0{book.volume} TITLE</label>
                  <input
                    type="text"
                    className="dk-input"
                    style={{ width: '100%' }}
                    value={book.title}
                    onChange={(e) => {
                      const updated = [...seriesCovers];
                      updated[idx].title = e.target.value;
                      setSeriesCovers(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '2.5rem' }}>
            <button className="btn-accent btn-full" disabled={isLoading} onClick={handleGenerate}>
              {isLoading ? 'Generating Artwork...' : activeTab === 'series' ? 'Generate Trilogy Series Covers' : 'Generate Cover Art'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {activeTab === 'single' ? (
            <div className="preview-container animate-in">
              {isLoading || isBaking ? (
                <div className="book-card-mockup placeholder-mockup">
                  <div className="dots">
                    <div className="dot" style={{ backgroundColor: 'var(--accent)' }}></div>
                    <div className="dot" style={{ backgroundColor: 'var(--accent)' }}></div>
                    <div className="dot" style={{ backgroundColor: 'var(--accent)' }}></div>
                  </div>
                  <p className="dk-body" style={{ color: '#666', fontSize: '0.8rem', marginTop: '1rem' }}>
                    {isLoading ? 'Weaving the digital canvas...' : 'Baking covers...'}
                  </p>
                </div>
              ) : coverUrl ? (
                <div className="book-card-mockup" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.8)', border: `1px solid ${genre.color}33` }}>
                  <div className="book-spine" />
                  <div className="book-highlight" />
                  <img src={coverUrl} alt="Baked Book Cover" className="book-image" />
                </div>
              ) : (
                <div className="book-card-mockup placeholder-mockup">
                  <span className="genre-emoji">📖</span>
                  <p className="dk-title" style={{ fontSize: '1.25rem', marginTop: '1rem', color: '#888' }}>Mockup Studio</p>
                  <p className="dk-body" style={{ fontSize: '0.8rem', color: '#555', textAlign: 'center', padding: '0 2rem' }}>Fill in details and click generate to visualize your romance masterpiece.</p>
                </div>
              )}

              {coverUrl && !isLoading && !isBaking && (
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn-ghost dk-body" onClick={handleDownload}>
                    📥 Download PNG
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Trilogy View
            <div className="trilogy-grid animate-in">
              {seriesCovers.map((book, idx) => (
                <div key={idx} className="series-book-item">
                  <h4 className="dk-title text-center" style={{ fontSize: '1.1rem', color: 'var(--accent-light)', marginBottom: '1rem' }}>Book {book.volume}</h4>
                  
                  {isLoading ? (
                    <div className="series-book-mockup placeholder-mockup">
                      <div className="dot" />
                    </div>
                  ) : book.bakedUrl ? (
                    <div className="series-book-mockup">
                      <div className="book-spine" />
                      <div className="book-highlight" />
                      <img src={book.bakedUrl} alt={book.title} className="book-image" />
                    </div>
                  ) : (
                    <div className="series-book-mockup placeholder-mockup">
                      <span style={{ color: '#444' }}>Empty</span>
                    </div>
                  )}

                  {book.bakedUrl && !isLoading && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button className="btn-accent outline dk-body" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleUseAsMain(book)}>
                        Set as Main Cover
                      </button>
                      <button className="btn-ghost dk-body" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleDownloadBook(book)}>
                        Download
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-msg animate-in" style={{ marginTop: '2rem' }}>{error}</div>}

      <div className="btn-row" style={{ marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
        <button className="btn-ghost dk-body" onClick={handleBack} disabled={isLoading}>← Back to Outline</button>
        <button className="btn-accent dk-body" onClick={handleNext} disabled={isLoading}>
          {coverUrl ? 'Write Full Manuscript →' : 'Skip Cover & Write Manuscript →'}
        </button>
      </div>

      <style>{`
        .tab-container {
          display: flex;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          padding: 0.3rem;
          border-radius: 8px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          color: #a1a1aa;
          padding: 0.6rem 1.2rem;
          font-family: Montserrat, sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.25s;
        }
        .tab-btn.active {
          background: var(--accent);
          color: white;
        }
        .control-section {
          margin-bottom: 2.5rem;
        }
        .control-section:last-child {
          margin-bottom: 0;
        }
        .preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: sticky;
          top: 100px;
        }
        .book-card-mockup {
          position: relative;
          width: 300px;
          height: 450px;
          border-radius: 4px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .book-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .placeholder-mockup {
          background: rgba(255,255,255,0.01);
          border: 1px dashed rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .book-spine {
          position: absolute;
          top: 0;
          left: 0;
          width: 10px;
          height: 100%;
          background: linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(255,255,255,0.22) 50%, rgba(0,0,0,0.55) 100%);
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
          z-index: 5;
        }
        .book-highlight {
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0.2) 40.1%, rgba(0,0,0,0) 100%);
          pointer-events: none;
          z-index: 6;
          border-radius: 4px;
        }
        .trilogy-grid {
          display: grid;
          grid-template-columns: repeat(3, 180px);
          gap: 1.5rem;
          justify-content: center;
          margin-top: 1rem;
        }
        @media (max-width: 768px) {
          .trilogy-grid {
            grid-template-columns: 1fr;
          }
        }
        .series-book-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .series-book-mockup {
          position: relative;
          width: 180px;
          height: 270px;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.6);
        }
        .text-center {
          text-align: center;
        }
        .tagline-option:hover {
          background: rgba(255,255,255,0.08) !important;
          color: white !important;
          border-color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
