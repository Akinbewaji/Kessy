import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { callClaude } from '../api/groq';
import { useAuth } from '../context/AuthContext';

export default function StepCover() {
  const { genre, characters, plot, coverUrl, setCoverUrl } = useContext(AppContext);
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [userIdea, setUserIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!genre) {
      navigate('/writer');
    }
  }, [genre, navigate]);

  if (!genre) return null; // Prevent crash before redirect

  const handleBack = () => {
    navigate('/writer/outline');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    navigate('/writer/write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!userData || ((userData.credits || 0) < 1 && userData.role !== 'admin' && !userData.permissions?.canBypassCredits)) {
      navigate('/pricing', { state: { from: '/writer/cover' } });
      return;
    }

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
IMPORTANT: You MUST avoid any explicit, NSFW, overly violent, or gory words (e.g., blood, naked, torture, sex) as they will trigger safety filters and crash the image generator. Use safe, atmospheric metaphors instead (e.g., crimson mist, shadowed figures).
Return ONLY the prompt string, nothing else. KEEP IT CONCISE, UNDER 200 CHARACTERS.`;

      const system = `You are an expert AI art prompt engineer. You output only raw, concise, strictly PG-13 prompt strings optimized for cinematic book covers. NEVER EXCEED 200 CHARACTERS.`;

      const result = await callClaude(prompt, system);
      
      const seed = Math.floor(Math.random() * 1000000);
      // Safe guard the length of the string to avoid URL length limits
      const safePrompt = result.substring(0, 300);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
      
      setImageLoading(true); // Start image loading spinner
      setCoverUrl(imageUrl);
    } catch (e) {
      setError('Could not generate cover art. Please try again.');
    } finally {
      setIsLoading(false); // Hide the prompt-generation spinner
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

      {(isLoading || imageLoading) && (
        <div id="loading-screen" className="animate-in" style={{ padding: '2rem 0', textAlign: 'center' }}>
          <p className="loading-title dk-title" style={{ color: 'var(--accent)' }}>
            {isLoading ? 'Conjuring the imagery...' : 'Painting the final picture... (This takes a moment)'}
          </p>
          <div className="dots" style={{ justifyContent: 'center' }}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      )}

      {error && <div className="error-msg animate-in">{error}</div>}

      {coverUrl && !isLoading && (
        <div className="cover-preview animate-in" style={{ display: imageLoading ? 'none' : 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', border: `1px solid ${genre.color}44`, borderRadius: '4px', background: '#080808' }}>
            <img 
              src={coverUrl} 
              alt="Generated Cover" 
              style={{ width: '100%', maxWidth: '300px', borderRadius: '2px', display: 'block' }} 
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                setError('The AI failed to paint the image. It might have been blocked by safety filters. Please try a different prompt or idea.');
                setCoverUrl(null);
              }}
            />
          </div>
        </div>
      )}

      <div className="btn-row">
        <button className="btn-ghost dk-body" onClick={handleBack} disabled={isLoading || imageLoading}>← Back</button>
        <button className="btn-accent outline dk-body" onClick={handleGenerate} disabled={isLoading || imageLoading}>
          {coverUrl ? 'Regenerate Cover' : 'Generate Cover'}
        </button>
        {coverUrl && !imageLoading && (
          <button className="btn-accent dk-body" onClick={handleNext} disabled={isLoading || imageLoading}>
            Write Full Story →
          </button>
        )}
      </div>
    </div>
  );
}
