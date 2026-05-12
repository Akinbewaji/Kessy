import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/writer');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="animate-in" style={{ padding: '6rem 2rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: '#080808', padding: '3rem', borderRadius: '12px', border: '1px solid #1a1a1a', width: '100%', maxWidth: '400px' }}>
        <h2 className="dk-title" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
        <p className="dk-body" style={{ color: '#a1a1aa', textAlign: 'center', marginBottom: '2rem' }}>Log in to access your tools and library.</p>
        
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
          <div style={{ marginBottom: '2rem' }}>
            <label className="field-label">Password</label>
            <input 
              type="password" 
              className="dk-input" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button disabled={loading} className="btn-accent dk-body" style={{ width: '100%', marginBottom: '1.5rem' }}>
            Log In
          </button>
        </form>
        
        <div className="dk-body" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
          Need an account? <Link to="/signup" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
