import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainNavbar() {
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
    } catch (e) {
      console.error("Failed to log out", e);
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

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
        <Link to="/" onClick={closeMenu} style={{ color: 'white', textDecoration: 'none' }}>DIGITALKESSY<span style={{ color: 'var(--accent)' }}>.</span></Link>
      </div>

      <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
        {menuOpen ? '✕' : '☰'}
      </button>

      <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
        <div className="nav-links dk-body">
          <Link to="/services" onClick={closeMenu} style={{ color: isActive('/services') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>Services</Link>
          <Link to="/course" onClick={closeMenu} style={{ color: isActive('/course') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>Course</Link>
          <Link to="/writer" onClick={closeMenu} style={{ color: isActive('/writer') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>AI Tools</Link>
          <Link to="/contact" onClick={closeMenu} style={{ color: isActive('/contact') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</Link>
          
          {currentUser && (
            <Link to="/library" onClick={closeMenu} style={{ color: isActive('/library') ? 'var(--accent)' : '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}>Library</Link>
          )}
        </div>

        <div className="nav-auth dk-body">
          {currentUser ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {userData && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: '0.9rem' }}>🪙</span>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{userData.credits || 0}</span>
                  </div>
                )}
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', color: '#fff',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
                    cursor: 'pointer'
                  }}>
                    {currentUser.email.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <button onClick={handleLogout} className="btn-ghost" style={{ padding: '0.5rem 1rem' }}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} style={{ color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem' }}>Login</Link>
              <Link to="/signup" onClick={closeMenu} className="btn-accent" style={{ padding: '0.5rem 1.5rem', textDecoration: 'none', fontSize: '0.9rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
