import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function Profile() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [libraryCount, setLibraryCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const q = query(collection(db, 'library'), where('userId', '==', currentUser.uid));
      getDocs(q).then((snapshot) => {
        setLibraryCount(snapshot.size);
      }).catch(console.error);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="animate-in standard-section" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 className="dk-title premium-gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Your Profile</h1>
      
      <div className="glass-card" style={{ padding: '3rem', marginTop: '3rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 'bold', color: '#fff'
          }}>
            {currentUser.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="dk-title" style={{ fontSize: '2rem', margin: 0 }}>{currentUser.email}</h2>
            <p className="dk-body" style={{ color: '#a1a1aa', margin: '0.5rem 0 0 0' }}>
              Member since {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'recently'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <p className="field-label" style={{ color: 'var(--accent-light)' }}>CREDIT BALANCE</p>
            <div className="dk-title" style={{ fontSize: '3rem', color: '#fff' }}>
              {userData?.credits || 0} <span style={{ fontSize: '1.2rem', color: '#666' }}>🪙</span>
            </div>
          </div>
          
          <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <p className="field-label">SAVED MANUSCRIPTS</p>
            <div className="dk-title" style={{ fontSize: '3rem', color: '#fff' }}>
              {libraryCount} <span style={{ fontSize: '1.2rem', color: '#666' }}>📚</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <Link to="/pricing" className="btn-accent dk-body" style={{ textDecoration: 'none', textAlign: 'center', flex: 1 }}>
            Top Up Credits
          </Link>
          <Link to="/library" className="btn-accent outline dk-body" style={{ textDecoration: 'none', textAlign: 'center', flex: 1 }}>
            View Library
          </Link>
          <button onClick={handleLogout} className="btn-ghost dk-body" style={{ width: '100%', marginTop: '1rem' }}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
