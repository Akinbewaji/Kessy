import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export default function Services() {
  return (
    <div className="animate-in standard-section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Helmet>
        <title>Ghostwriting Services - DigitalKessy</title>
        <meta name="description" content="Hire a master ghostwriter specializing in Mafia, Billionaire, and Werewolf dark romance. Get high-tension, addictive manuscripts." />
      </Helmet>

      <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <p className="dk-body" style={{ color: 'var(--accent-light)', letterSpacing: '0.4em', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>BESPOKE LITERARY SERVICES</p>
        <h1 className="dk-title premium-gradient-text" style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', marginBottom: '1.5rem' }}>Hire a Master Ghostwriter</h1>
        <p className="dk-body" style={{ color: '#a1a1aa', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.8, fontWeight: 300 }}>
          Specializing in the intense dynamics of Mafia, Billionaire, and Werewolf romance. I deliver high-tension, addictive manuscripts that keep your readers hooked until the final page.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginBottom: '8rem' }}>
        {/* Tier 1 */}
        <div className="glass-card" style={{ padding: '4rem 2.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 className="dk-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>The Spark</h2>
          <p className="dk-body" style={{ color: 'var(--accent-light)', marginBottom: '2rem', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 600 }}>OUTLINE & PLOTTING</p>
          <p className="dk-body" style={{ color: '#888', marginBottom: '3rem', flex: 1, lineHeight: 1.7, fontSize: '1rem' }}>
            Have a concept but no idea how to structure it? I will build a comprehensive, chapter-by-chapter outline with character arcs, pacing maps, and guaranteed tension points.
          </p>
          <Link to="/contact" className="btn-ghost btn-full dk-body" style={{ textDecoration: 'none' }}>INQUIRE FOR PRICING</Link>
        </div>

        {/* Tier 2 */}
        <div className="glass-card" style={{ padding: '4rem 2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid var(--accent)' }}>
          <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#fff', padding: '6px 18px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>MOST EXCLUSIVE</div>
          <h2 className="dk-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>The Manuscript</h2>
          <p className="dk-body" style={{ color: 'var(--accent-light)', marginBottom: '2rem', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 600 }}>FULL GHOSTWRITING</p>
          <p className="dk-body" style={{ color: '#d1d1d6', marginBottom: '3rem', flex: 1, lineHeight: 1.7, fontSize: '1rem' }}>
            You provide the trope, I provide the book. 50k to 100k word manuscripts written with my signature dark romance style, fast-paced dialogue, and unputdownable steamy tension.
          </p>
          <Link to="/contact" className="btn-accent btn-full dk-body" style={{ textDecoration: 'none' }}>BOOK YOUR SLOT</Link>
        </div>

        {/* Tier 3 */}
        <div className="glass-card" style={{ padding: '4rem 2.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 className="dk-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>The Polish</h2>
          <p className="dk-body" style={{ color: 'var(--accent-light)', marginBottom: '2rem', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 600 }}>DEVELOPMENTAL EDIT</p>
          <p className="dk-body" style={{ color: '#888', marginBottom: '3rem', flex: 1, lineHeight: 1.7, fontSize: '1rem' }}>
            Written a draft but it feels flat? I'll review your manuscript to inject more chemistry, fix structural pacing issues, and elevate the dark romance elements to a pro level.
          </p>
          <Link to="/contact" className="btn-ghost btn-full dk-body" style={{ textDecoration: 'none' }}>INQUIRE FOR PRICING</Link>
        </div>
      </div>

      <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 3rem', background: 'linear-gradient(rgba(139, 92, 246, 0.05), transparent)' }}>
        <h3 className="dk-title" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Prefer to write it yourself?</h3>
        <p className="dk-body" style={{ color: '#a1a1aa', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
          Access my proprietary AI tools designed specifically for the dark romance genre. The same frameworks I use, powered by AI.
        </p>
        <Link to="/writer" className="btn-accent outline btn-large dk-body" style={{ textDecoration: 'none' }}>GO TO AI WRITER TOOLS</Link>
      </div>
    </div>
  );
}
