import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { callClaude } from '../api/groq';

export default function StepCover() {
  const { genre, characters, plot, coverUrl, setCoverUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [userIdea, setUserIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    navigate('/writer/outline');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    navigate('/writer/write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');

    try {
      const prompt = `Write a highly descriptive, comma-separated visual prompt for an AI image generator (like Midjourney or DALL-E) to create a book cover for this story.
      
Genre: ${genre.name} Dark Romance
Setting: ${plot.setting}
Core Conflict: ${plot.conflict}
Hero: ${characters.maleName} (${genre.leads.male})
Heroine: ${characters.femaleName} (${genre.leads.female})
User's specific cover idea: ${userIdea || 'None provided, use best judgment based on genre'}

The prompt should focus on the aesthetic, mood, lighting, and visual elements. Do not include any text, typography, or titles. Focus purely on the art.
Return ONLY the prompt string, nothing else. KEEP IT CONCISE, UNDER 200 CHARACTERS.`;

      const system = `You are an expert AI art prompt engineer. You output only raw, concise prompt strings optimized for cinematic book covers. NEVER EXCEED 200 CHARACTERS.`;

      const result = await callClaude(prompt, system);
      
      const seed = Math.floor(Math.random() * 1000000);
      // Safe guard the length of the string to avoid URL length limits
      const safePrompt = result.substring(0, 300);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
      
      setCoverUrl(imageUrl);
    } catch (e) {
      setError('Could not generate cover art. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="step-cover" className="animate-in">
      <p className="step-eyebrow dk-body" style={{ color: 'var(--accent)' }}>STEP 05</p>
      <h2 className="step-title dk-title">Design Your Cover</h2>
      <p className="step-sub dk-body">Describe your vision or let the AI design it based on your story.</p>

      <div className="field-group" style={{ marginBottom: '2rem' }}>
        <div>
          <label className="field-label">COVER IDEAS (OPTIONAL)</label>
          <textarea
            className="dk-input"
            rows={3}
            placeholder="e.g. A dark forest with red mist, a silhouette of a wolf and a girl in a torn dress..."
            value={userIdea}
            onChange={(e) => setUserIdea(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div id="loading-screen" className="animate-in" style={{ padding: '2rem 0' }}>
          <p className="loading-title dk-title" style={{ color: 'var(--accent)' }}>Conjuring the imagery...</p>
          <div className="dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      )}

      {error && <div className="error-msg animate-in">{error}</div>}

      {coverUrl && !isLoading && (
        <div className="cover-preview animate-in" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', border: `1px solid ${genre.color}44`, borderRadius: '4px', background: '#080808' }}>
            <img 
              src={coverUrl} 
              alt="Generated Cover" 
              style={{ width: '100%', maxWidth: '300px', borderRadius: '2px', display: 'block' }} 
            />
          </div>
        </div>
      )}

      <div className="btn-row">
        <button className="btn-ghost dk-body" onClick={handleBack} disabled={isLoading}>← Back</button>
        <button className="btn-accent outline dk-body" onClick={handleGenerate} disabled={isLoading}>
          {coverUrl ? 'Regenerate Cover' : 'Generate Cover'}
        </button>
        {coverUrl && (
          <button className="btn-accent dk-body" onClick={handleNext} disabled={isLoading}>
            Write Full Story →
          </button>
        )}
      </div>
    </div>
  );
}
