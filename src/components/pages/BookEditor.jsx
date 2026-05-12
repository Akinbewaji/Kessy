import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function BookEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [book, setBook] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  if (loading) return <div style={{ textAlign: 'center', padding: '10rem', color: '#666' }} className="dk-body">Loading manuscript...</div>;
  if (error) return <div className="error-msg animate-in" style={{ margin: '4rem auto', maxWidth: '600px' }}>{error}</div>;
  if (!book) return null;

  return (
    <div className="animate-in" style={{ padding: '4rem 2rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
      
      {/* Sidebar / Meta */}
      <div style={{ flex: '1 1 300px' }}>
        <button onClick={() => navigate('/library')} className="btn-ghost dk-body" style={{ padding: '0.6rem 1.2rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>←</span> Back to Library
        </button>
        
        <div className="glass-card" style={{ padding: '2.5rem', position: 'sticky', top: '120px', border: `1px solid ${book.genreColor}33` }}>
          {book.coverUrl && (
            <img src={book.coverUrl} alt="Cover" style={{ width: '100%', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
          )}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={handleSave} disabled={saving} className="btn-accent dk-body">
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
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
          <textarea
            className="dk-input"
            style={{ 
              width: '100%', 
              minHeight: '85vh', 
              resize: 'none',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.25rem',
              lineHeight: 1.8,
              padding: '4rem',
              background: 'transparent !important',
              border: 'none !important',
              boxShadow: 'none !important'
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Your story starts here..."
          />
        </div>
      </div>
    </div>
  );
}
