import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '4rem 2rem',
      marginTop: '4rem',
      background: '#040404'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <div className="dk-title" style={{ fontSize: '1.5rem', marginBottom: '1rem', letterSpacing: '2px' }}>
            DIGITALKESSY<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <p className="dk-body" style={{ color: '#a1a1aa', lineHeight: 1.6, maxWidth: '300px' }}>
            Elevating dark romance. Professional ghostwriting services and advanced AI tools for writers who want to craft irresistible stories.
          </p>
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <h4 className="dk-body" style={{ color: '#fff', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="dk-body">
            <Link to="/" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Home</Link>
            <Link to="/services" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Services</Link>
            <Link to="/course" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Course</Link>
            <Link to="/writer" style={{ color: '#a1a1aa', textDecoration: 'none' }}>AI Tools</Link>
          </div>
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <h4 className="dk-body" style={{ color: '#fff', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Connect</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="dk-body">
            <Link to="/contact" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Contact</Link>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Twitter</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: '#a1a1aa', textDecoration: 'none' }}>Instagram</a>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '4rem', color: '#666', fontSize: '0.85rem' }} className="dk-body">
        &copy; {new Date().getFullYear()} DigitalKessy. All rights reserved.
      </div>
    </footer>
  );
}
