import React from 'react';
import { Helmet } from 'react-helmet';

export default function Course() {
  return (
    <div className="animate-in standard-section" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <Helmet>
        <title>Ghostwriting Mastery Course - DigitalKessy</title>
        <meta name="description" content="Unlock the secrets to building a lucrative career writing dark romance and fantasy fiction with the Ghostwriting Mastery course." />
      </Helmet>

      <p className="dk-body" style={{ color: 'var(--accent-light)', letterSpacing: '0.4em', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>THE GHOSTWRITING ACADEMY</p>
      <h1 className="dk-title premium-gradient-text" style={{ fontSize: 'clamp(3rem, 7vw, 4.5rem)', marginBottom: '1.5rem' }}>Ghostwriting Mastery</h1>
      <p className="dk-body" style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '5rem', lineHeight: 1.8, maxWidth: '800px', margin: '0 auto 5rem', fontWeight: 300 }}>
        Unlock the secrets to building a lucrative career writing dark romance and fantasy fiction. In this comprehensive course, I teach you my exact frameworks, plotting techniques, and client acquisition strategies that have earned me a high six-figure income.
      </p>

      <div className="glass-card" style={{ padding: '5rem 3rem', marginBottom: '5rem', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 20px 50px rgba(139, 92, 246, 0.1)' }}>
        <h2 className="dk-title" style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>The Curriculum</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'left' }}>
          {[
            { t: 'Master the Tropes', d: 'Billionaire, Mafia, Werewolf dynamics and expectations.' },
            { t: 'High-Tension Plotting', d: 'Frameworks that keep readers turning pages past midnight.' },
            { t: 'Steamy Chemistry', d: 'Writing magnetic attraction that feels raw and real.' },
            { t: 'The Business', d: 'How to find top-tier clients and price your services like a pro.' },
            { t: 'AI-Enhanced Writing', d: 'Ethically using AI to double your word count without losing soul.' },
            { t: 'Client Management', d: 'Contracts, revisions, and building long-term partnerships.' },
          ].map((item, i) => (
            <div key={i}>
              <h4 className="dk-title" style={{ color: 'var(--accent-light)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.t}</h4>
              <p className="dk-body" style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.6 }}>{item.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        <h3 className="dk-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Ready to start your journey?</h3>
        <a href="https://selar.com/1191v51k99" target="_blank" rel="noreferrer" className="btn-accent btn-large dk-body" style={{ textDecoration: 'none', display: 'inline-block' }}>
          ENROLL ON SELAR NOW
        </a>
        <p className="dk-body" style={{ color: '#666', marginTop: '1.5rem', fontSize: '0.85rem' }}>Limited slots available for personalized mentorship.</p>
      </div>
    </div>
  );
}
