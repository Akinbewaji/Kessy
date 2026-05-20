import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import { db } from '../../firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

export default function Pricing() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState({ id: 'pro', name: 'Pro', price: 20000, credits: 120 });

  const packages = [
    { id: 'starter', name: 'Starter', price: 15000, credits: 50 },
    { id: 'pro', name: 'Pro', price: 20000, credits: 120 },
    { id: 'master', name: 'Master', price: 30000, credits: 300 }
  ];

  const onSuccess = async (reference, pkg) => {
    setLoading(true);
    try {
      if (currentUser) {
        setSelectedPackage(pkg); // Just for the success modal UI to show the correct credits
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          email: currentUser.email, // Ensure email is there if creating for the first time
          credits: increment(pkg.credits),
          updatedAt: Date.now()
        }, { merge: true });
        setShowSuccessModal(true);
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

  const handleContinue = () => {
    const from = location.state?.from || '/writer';
    navigate(from);
  };

  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      timer = setTimeout(() => {
        handleContinue();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal]);

  return (
    <div className="animate-in standard-section" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      
      {showSuccessModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, 
          background: 'rgba(5,0,5,0.95)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }} className="animate-in">
          <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 20px var(--accent))' }}>🪙</div>
            <h2 className="dk-title premium-gradient-text" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Credits Added!</h2>
            <p className="dk-body" style={{ color: '#d1d1d6', fontSize: '1.2rem', marginBottom: '3.5rem', lineHeight: 1.8, fontWeight: 300 }}>
              Your account has been credited with {selectedPackage.credits} credits. Your dark romance journey awaits.
            </p>
            <p className="dk-body" style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Redirecting you back in a moment...
            </p>
            <button onClick={handleContinue} className="btn-accent btn-large dk-body">
              START WRITING NOW →
            </button>
          </div>
        </div>
      )}

      <h1 className="dk-title premium-gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Top Up Credits</h1>
      <p className="dk-body" style={{ color: '#a1a1aa', marginBottom: '4rem', fontSize: '1.1rem' }}>
        Purchase credits to generate outlines, covers, and full manuscripts.
      </p>

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
        {packages.map(pkg => (
          <div key={pkg.id} className="glass-card" style={{ padding: '3rem 2rem', flex: '1', minWidth: '280px', maxWidth: '350px', border: pkg.id === 'pro' ? '1px solid var(--accent)' : '1px solid var(--glass-border)' }}>
            <h2 className="dk-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>{pkg.name}</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: pkg.id === 'pro' ? 'var(--accent-light)' : '#fff', marginBottom: '0.5rem' }} className="dk-body">
              {pkg.credits} <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal' }}>Credits</span>
            </div>
            <div style={{ color: '#a1a1aa', marginBottom: '2rem' }}>₦{pkg.price.toLocaleString()}</div>
            
            <ul className="dk-body" style={{ listStyle: 'none', padding: 0, margin: '0 auto 2.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> {Math.floor(pkg.credits / 10)} Full Books</li>
              <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> AI Editor Tools</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Never Expires</li>
            </ul>

            {currentUser ? (
              <PaystackButton
                text={`BUY ${pkg.credits} CREDITS`}
                className={pkg.id === 'pro' ? 'btn-main dk-body' : 'btn-accent outline dk-body'}
                style={{ width: '100%' }}
                email={currentUser.email}
                amount={pkg.price * 100}
                publicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder'}
                reference={(new Date()).getTime().toString() + pkg.id}
                onSuccess={(ref) => onSuccess(ref, pkg)}
                onClose={onClose}
              />
            ) : (
              <button onClick={() => navigate('/login')} className={pkg.id === 'pro' ? 'btn-main dk-body' : 'btn-accent outline dk-body'} style={{ width: '100%' }}>
                LOGIN TO BUY
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
