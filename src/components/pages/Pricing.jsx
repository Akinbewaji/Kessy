import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Pricing() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const config = {
    reference: (new Date()).getTime().toString(),
    email: currentUser?.email || 'user@example.com',
    amount: 20000 * 100, // 20,000 NGN in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
  };

  const onSuccess = async (reference) => {
    // Payment complete! Update Firestore.
    setLoading(true);
    try {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          subscriptionStatus: 'active',
          updatedAt: Date.now()
        });
        alert('Payment successful! Your subscription is now active.');
        navigate('/writer');
      }
    } catch (e) {
      console.error(e);
      setError('Payment successful, but failed to update your profile. Please contact support.');
    }
    setLoading(false);
  };

  const onClose = () => {
    console.log('Payment closed.');
  };

  const initializePayment = usePaystackPayment(config);

  const handleSubscribe = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    initializePayment(onSuccess, onClose);
  };

  return (
    <div className="animate-in standard-section" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 className="dk-title premium-gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Upgrade to Pro</h1>
      <p className="dk-body" style={{ color: '#a1a1aa', marginBottom: '4rem', fontSize: '1.1rem' }}>
        Unlock unlimited AI generation, premium features, and take your dark romance writing to the next level.
      </p>

      {error && <div className="error-msg">{error}</div>}

      <div className="glass-card" style={{ padding: '4rem', border: '1px solid var(--accent)' }}>
        <h2 className="dk-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Monthly Subscription</h2>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-light)', marginBottom: '2rem' }} className="dk-body">
          ₦20,000 <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal' }}>/ month</span>
        </div>
        
        <ul className="dk-body" style={{ listStyle: 'none', padding: 0, margin: '0 auto 3rem', maxWidth: '340px', textAlign: 'left' }}>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Unlimited Manuscript Generation</li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> AI Editor Tools (Rewrite, Steamier, etc.)</li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Save Unlimited Projects to Library</li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Priority Email Support</li>
        </ul>

        <button onClick={handleSubscribe} disabled={loading} className="btn-main dk-body">
          {loading ? 'PROCESSING...' : 'SUBSCRIBE NOW'}
        </button>
      </div>
    </div>
  );
}
