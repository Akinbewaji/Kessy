import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { callClaude } from '../../api/groq';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function BookEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const reactQuillRef = useRef(null);
  
  const [book, setBook] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [newCoverIdea, setNewCoverIdea] = useState('');
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverError, setCoverError] = useState('');

  useEffect(() => {
    async function fetchBook() {
      try {
        const docRef = doc(db, "books", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === currentUser.uid) {
          setBook({ id: docSnap.id, ...docSnap.data() });
          setContent(docSnap.data().content || '');
        } else {
          setError("Book not found or access denied.");
        }
      } catch (err) {
        setError("Error fetching book.");
      }
      setLoading(false);
    }
    fetchBook();
  }, [id, currentUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, "books", id);
      await updateDoc(docRef, {
        content: content,
        updatedAt: Date.now()
      });
    } catch (err) {
      setError("Failed to save changes.");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this book? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "books", id));
        navigate('/library');
      } catch (err) {
        setError("Failed to delete book.");
      }
    }
  };

  const handleRewrite = async (promptStyle) => {
    const editor = reactQuillRef.current.getEditor();
    const range = editor.getSelection();
    
    if (range && range.length > 0) {
      if (!userData || ((userData.credits || 0) < 1 && userData.role !== 'admin' && !userData.permissions?.canBypassCredits)) {
        navigate('/pricing', { state: { from: `/library/${id}` } });
        return;
      }

      const text = editor.getText(range.index, range.length);
      setSaving(true);
      setError('');
      
      const prompt = `Rewrite the following text to be ${promptStyle}. Keep the same tense and perspective. Make it seamless so it can replace the original text directly. Do not include any conversational filler, only return the rewritten text.\n\nOriginal Text:\n"${text}"`;
      
      try {
        const rewritten = await callClaude(prompt, "You are an expert dark romance author and editor.");
        // We delete the old text and insert the new text
        editor.deleteText(range.index, range.length);
        editor.insertText(range.index, rewritten);
      } catch (e) {
        setError("Failed to rewrite text.");
      }
      setSaving(false);
    } else {
      setError("Please highlight some text in the editor first.");
    }
  };

  const handleExportDOCX = async () => {
    setExporting(true);
    try {
      const token = currentUser ? await currentUser.getIdToken() : null;
      
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          html: content,
          title: book?.title || 'Manuscript'
        })
      });
      
      if (!res.ok) throw new Error('Export failed from server.');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book?.title || 'Manuscript'}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export DOCX: " + err.message);
    }
    setExporting(false);
  };

  const handleGenerateNewCover = async () => {
    if (!userData || ((userData.credits || 0) < 1 && userData.role !== 'admin' && !userData.permissions?.canBypassCredits)) {
      navigate('/pricing', { state: { from: `/library/${id}` } });
      return;
    }

    setGeneratingCover(true);
    setCoverError('');

    try {
      const prompt = `Write a highly descriptive, comma-separated visual prompt for an AI image generator (like Midjourney or DALL-E) to create a book cover for this story.
      
Genre: ${book.genreName} Dark Romance
Setting: ${book.setting}
Hero: ${book.hero}
Heroine: ${book.heroine}
User's specific cover idea: ${newCoverIdea || 'None provided, use best judgment based on genre'}

The prompt should focus on the aesthetic, mood, lighting, and visual elements. Do not include any text, typography, or titles. Focus purely on the art.
IMPORTANT: You MUST avoid any explicit, NSFW, overly violent, or gory words (e.g., blood, naked, torture, sex) as they will trigger safety filters and crash the image generator. Use safe, atmospheric metaphors instead (e.g., crimson mist, shadowed figures).
Return ONLY the prompt string, nothing else. KEEP IT CONCISE, UNDER 200 CHARACTERS.`;

      const system = `You are an expert AI art prompt engineer. You output only raw, concise, strictly PG-13 prompt strings optimized for cinematic book covers. NEVER EXCEED 200 CHARACTERS.`;

      // Automatically deducts 1 credit via groq.js (default cost: 1)
      const result = await callClaude(prompt, system);
      
      const seed = Math.floor(Math.random() * 1000000);
      const safePrompt = result.substring(0, 300);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=512&height=768&nologo=true&seed=${seed}`;
      
      // Update local state
      setBook(prev => ({ ...prev, coverUrl: imageUrl }));
      
      // Save directly to Firestore
      const docRef = doc(db, "books", id);
      await updateDoc(docRef, {
        coverUrl: imageUrl,
        updatedAt: Date.now()
      });
      
      setIsEditingCover(false);
      setNewCoverIdea('');
    } catch (e) {
      setCoverError('Failed to generate cover art. Please try again.');
    } finally {
      setGeneratingCover(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '10rem', color: '#666' }} className="dk-body">Loading manuscript...</div>;
  if (error) return <div className="error-msg animate-in" style={{ margin: '4rem auto', maxWidth: '600px' }}>{error}</div>;
  if (!book) return null;

  return (
    <div className="animate-in editor-section" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
      
      {/* Sidebar / Meta */}
      <div style={{ flex: '1 1 300px' }}>
        <button onClick={() => navigate('/library')} className="btn-ghost dk-body" style={{ padding: '0.6rem 1.2rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>←</span> Back to Library
        </button>
        
        <div className="glass-card" style={{ padding: '2.5rem', position: 'sticky', top: '120px', border: `1px solid ${book.genreColor}33` }}>
          {book.coverUrl ? (
            <img src={book.coverUrl} alt="Cover" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
          ) : (
            <div style={{ width: '100%', height: '250px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: `1px dashed ${book.genreColor}55` }}>
              <span className="dk-body" style={{ color: '#666' }}>No Cover</span>
            </div>
          )}
          
          <div style={{ marginBottom: '2rem' }}>
            {isEditingCover ? (
              <div className="animate-in" style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <textarea
                  className="dk-input"
                  style={{ marginBottom: '0.5rem', padding: '0.75rem', fontSize: '0.85rem' }}
                  rows={2}
                  placeholder="Cover idea (optional)..."
                  value={newCoverIdea}
                  onChange={(e) => setNewCoverIdea(e.target.value)}
                />
                {coverError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{coverError}</div>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleGenerateNewCover} disabled={generatingCover} className="btn-accent dk-body" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>
                    {generatingCover ? 'Generating...' : 'Generate (1 Credit)'}
                  </button>
                  <button onClick={() => setIsEditingCover(false)} disabled={generatingCover} className="btn-ghost dk-body" style={{ padding: '0.5rem', fontSize: '0.8rem' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsEditingCover(true)} className="btn-ghost dk-body" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                {book.coverUrl ? '✎ Change Cover' : '✨ Generate Cover'}
              </button>
            )}
          </div>

          <h2 className="dk-title" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{book.title || 'Untitled Story'}</h2>
          <p className="dk-body" style={{ color: book.genreColor, fontSize: '0.85rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{book.genreName}</p>
          
          <div style={{ marginBottom: '2.5rem', fontSize: '0.95rem', color: '#a1a1aa' }} className="dk-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <strong>Hero:</strong> <span>{book.hero}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <strong>Heroine:</strong> <span>{book.heroine}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Setting:</strong> <span>{book.setting}</span>
            </div>
          </div>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 className="dk-title" style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--accent-light)' }}>AI Editor Tools</h4>
            <p className="dk-body" style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1rem' }}>Highlight text in the editor, then choose an action:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => handleRewrite('more descriptive and immersive')} disabled={saving} className="btn-ghost dk-body" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>✨ Make Descriptive</button>
              <button onClick={() => handleRewrite('steamier and more tense')} disabled={saving} className="btn-ghost dk-body" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>🔥 Make Steamier</button>
              <button onClick={() => handleRewrite('darker and more dangerous')} disabled={saving} className="btn-ghost dk-body" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>🦇 Make Darker</button>
              <button onClick={() => handleRewrite('shorter and punchier')} disabled={saving} className="btn-ghost dk-body" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>✂️ Make Punchier</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={handleSave} disabled={saving} className="btn-accent dk-body">
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
            <button onClick={handleExportDOCX} disabled={exporting} className="btn-accent outline dk-body">
              {exporting ? 'EXPORTING...' : 'EXPORT TO DOCX'}
            </button>
            <button onClick={handleDelete} className="btn-ghost dk-body" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              DELETE BOOK
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: '3 1 600px' }}>
        <div className="glass-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
          <ReactQuill
            ref={reactQuillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Your story starts here..."
            className="dk-quill-editor"
          />
        </div>
      </div>
    </div>
  );
}
