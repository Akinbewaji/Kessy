import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="animate-in">
      {/* Hero Section */}
      <section className="hero-section" style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none' }}></div>
        
        <p className="dk-body" style={{ letterSpacing: '0.4em', fontSize: '0.8rem', color: 'var(--accent-light)', marginBottom: '1.5rem', fontWeight: 600 }}>PREMIER DARK ROMANCE HUB</p>
        <h1 className="dk-title premium-gradient-text" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginBottom: '1.5rem', maxWidth: '900px', margin: '0 auto 1.5rem', lineHeight: 1.1 }}>
          Craft Stories That <br/> Stay in the Shadows
        </h1>
        <p className="dk-body" style={{ fontSize: '1.2rem', color: '#a1a1aa', maxWidth: '650px', margin: '0 auto 3.5rem', lineHeight: 1.8, fontWeight: 300 }}>
          From bespoke ghostwriting for bestsellers to advanced AI tools for independent authors. Elevate your dark romance fiction to professional heights.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/services" className="btn-accent dk-body" style={{ textDecoration: 'none', padding: '1rem 3rem' }}>
            HIRE A GHOSTWRITER
          </Link>
          <Link to="/writer" className="btn-accent outline dk-body" style={{ textDecoration: 'none', padding: '1rem 3rem' }}>
            EXPLORE AI TOOLS
          </Link>
        </div>
      </section>

      {/* Stats/Trust Bar */}
      <section style={{ padding: '2rem', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
          {[
            { label: 'WORDS WRITTEN', value: '5M+' },
            { label: 'HAPPY CLIENTS', value: '200+' },
            { label: 'TOP 100 RANKINGS', value: '15' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div className="dk-title" style={{ fontSize: '2rem', color: '#fff' }}>{stat.value}</div>
              <div className="dk-body" style={{ fontSize: '0.7rem', color: '#666', letterSpacing: '0.2em', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Snapshot */}
      <section className="standard-section" style={{ background: '#070007' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 className="dk-title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Expert Ghostwriting</h2>
            <p className="dk-body" style={{ color: '#a1a1aa', maxWidth: '500px', margin: '0 auto' }}>Billionaire, Mafia, Werewolf. I breathe life into your darkest tropes with professional precision.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
            {[
              { title: 'Full Novels', desc: 'Complete, plot-driven, tension-filled manuscripts ready for Amazon KDP.', icon: '📖' },
              { title: 'Detailed Outlines', desc: 'Stuck on your structure? I\'ll design a high-stakes, 20-chapter plot map.', icon: '🗺️' },
              { title: 'Developmental Polish', desc: 'Elevate your existing draft with better chemistry and professional pacing.', icon: '✨' },
            ].map((service, i) => (
              <div key={i} className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{service.icon}</div>
                <h3 className="dk-title" style={{ color: 'var(--accent-light)', fontSize: '1.8rem', marginBottom: '1rem' }}>{service.title}</h3>
                <p className="dk-body" style={{ color: '#888', lineHeight: 1.6, fontSize: '0.95rem' }}>{service.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '4rem', textAlign: 'center' }}>
             <Link to="/services" className="dk-body" style={{ color: 'var(--accent-light)', textDecoration: 'none', letterSpacing: '0.1em', fontWeight: 600 }}>VIEW FULL SERVICE CATALOGUE →</Link>
          </div>
        </div>
      </section>

      {/* AI Tools Promo - Dynamic Section */}
      <section className="promo-section" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '0', right: '0', width: '500px', height: '500px', background: 'var(--accent)', filter: 'blur(200px)', opacity: 0.05, pointerEvents: 'none' }}></div>
        
        <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '6rem 3rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <h2 className="dk-title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>The Dark Romance AI Engine</h2>
          <p className="dk-body" style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto 3.5rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
            I built the tool I wanted to use. Access proprietary algorithms fine-tuned on top-selling dark romance structures. Generate plots, write chapters, and design covers in seconds.
          </p>
          <Link to="/writer" className="btn-accent dk-body" style={{ textDecoration: 'none', padding: '1.2rem 4rem', fontSize: '1rem' }}>
            LAUNCH WRITER HUB
          </Link>
        </div>
      </section>

      {/* Course Promo */}
      <section className="standard-section" style={{ background: 'linear-gradient(180deg, #050005 0%, #0f0a1c 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p className="dk-body" style={{ color: 'var(--accent-light)', letterSpacing: '0.3em', fontSize: '0.75rem', marginBottom: '1.5rem', fontWeight: 600 }}>THE ACADEMY</p>
          <h2 className="dk-title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Ghostwriting Mastery</h2>
          <p className="dk-body" style={{ color: '#d1d1d6', marginBottom: '3.5rem', fontSize: '1.2rem', lineHeight: 1.8, fontWeight: 300 }}>
            Stop dreaming and start earning. Learn the exact systems I use to charge premium rates for dark romance fiction and build a sustainable writing career.
          </p>
          <Link to="/course" className="btn-accent outline dk-body" style={{ textDecoration: 'none', padding: '1rem 3.5rem', border: '1px solid #fff', color: '#fff' }}>
            EXPLORE THE CURRICULUM
          </Link>
        </div>
      </section>

    </div>
  );
}
