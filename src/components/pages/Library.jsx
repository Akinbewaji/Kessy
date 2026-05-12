import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

export default function Library() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchBooks() {
      if (!currentUser) return;
      try {
        const q = query(collection(db, "books"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedBooks = [];
        querySnapshot.forEach((doc) => {
          fetchedBooks.push({ id: doc.id, ...doc.data() });
        });
        setBooks(fetchedBooks.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Error fetching books: ", error);
      }
      setLoading(false);
    }

    fetchBooks();
  }, [currentUser]);

  return (
    <div className="animate-in" style={{ padding: '8rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <p className="dk-body" style={{ color: 'var(--accent-light)', letterSpacing: '0.4em', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>PERSONAL ARCHIVE</p>
          <h1 className="dk-title premium-gradient-text" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', margin: 0 }}>Your Library</h1>
          <p className="dk-body" style={{ color: '#a1a1aa', marginTop: '1rem', fontSize: '1.1rem', fontWeight: 300 }}>All your generated stories and drafts in one place.</p>
        </div>
        <Link to="/writer" className="btn-accent dk-body" style={{ textDecoration: 'none', padding: '1rem 2rem' }}>+ NEW STORY</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '10rem', color: '#666' }} className="dk-body">Loading your masterpieces...</div>
      ) : books.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '8rem 2rem', border: '1px solid var(--glass-border)' }}>
          <p className="dk-body" style={{ color: '#888', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Your library is currently empty.</p>
          <Link to="/writer" className="btn-accent outline dk-body" style={{ textDecoration: 'none' }}>Start writing now</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem' }}>
          {books.map(book => (
            <Link key={book.id} to={`/library/${book.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ 
                overflow: 'hidden',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {book.coverUrl ? (
                  <div style={{ height: '350px', width: '100%', backgroundImage: `url(${book.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--glass-border)' }} />
                ) : (
                  <div style={{ height: '350px', width: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ color: '#333', fontSize: '3rem' }}>📖</span>
                  </div>
                )}
                <div style={{ padding: '2rem' }}>
                  <h3 className="dk-title" style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.75rem' }}>{book.title || 'Untitled Story'}</h3>
                  <div className="dk-body" style={{ color: '#666', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{book.hero} × {book.heroine}</span>
                  </div>
                  <div className="dk-body" style={{ color: book.genreColor || 'var(--accent)', fontSize: '0.75rem', marginTop: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                    {book.genreName}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
