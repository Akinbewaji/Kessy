import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/writer');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <section className="auth-section animate-in">
      <div style={{ background: '#080808', padding: '3rem', borderRadius: '12px', border: '1px solid #1a1a1a', width: '100%', maxWidth: '400px' }}>
        <h2 className="dk-title" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Join Kessy.</h2>
        <p className="dk-body" style={{ color: '#a1a1aa', textAlign: 'center', marginBottom: '2rem' }}>Create an account to save your stories.</p>
        
        {error && <div className="error-msg animate-in">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="field-label">Email</label>
            <input 
              type="email" 
              className="dk-input" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="field-label">Password</label>
            <input 
              type="password" 
              className="dk-input" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label className="field-label">Confirm Password</label>
            <input 
              type="password" 
              className="dk-input" 
              required 
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>
          <button disabled={loading} className="btn-accent dk-body" style={{ width: '100%', marginBottom: '1.5rem' }}>
            Sign Up
          </button>
        </form>
        
        <div className="dk-body" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Log In</Link>
        </div>
      </div>
    </section>
  );
}
