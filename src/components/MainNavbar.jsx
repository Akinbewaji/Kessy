import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainNavbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Failed to log out", e);
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="main-navbar" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.5rem 2rem',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(8, 8, 8, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="nav-brand dk-title" style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '2px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>KESSY<span style={{ color: 'var(--accent)' }}>.</span></Link>
      </div>

      <div className="nav-links dk-body" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Link to="/services" style={{ color: isActive('/services') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>Services</Link>
        <Link to="/course" style={{ color: isActive('/course') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>Course</Link>
        <Link to="/writer" style={{ color: isActive('/writer') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>AI Tools</Link>
        <Link to="/contact" style={{ color: isActive('/contact') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</Link>
        
        {currentUser && (
          <Link to="/library" style={{ color: isActive('/library') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>Library</Link>
        )}
      </div>

      <div className="nav-auth dk-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {currentUser ? (
          <>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>{currentUser.email}</span>
            <button onClick={handleLogout} className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem' }}>Login</Link>
            <Link to="/signup" className="btn-accent" style={{ padding: '0.5rem 1.5rem', textDecoration: 'none', fontSize: '0.9rem' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
