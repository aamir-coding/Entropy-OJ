import React, { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Layers, Sparkles, Cpu } from 'lucide-react';

const HeroScene = React.lazy(() =>
  import('../components/landing/HeroScene').then((m) => ({ default: m.HeroScene }))
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Entropy — Navigate the Algorithmic Universe';
  }, []);

  const handleEnter = () => {
    navigate('/problems');
  };

  return (
    <div style={styles.root}>
      {/* Subtle radial ambient glow */}
      <div style={styles.ambientGlow} />

      {/* ── MAIN CONTENT ── */}
      <div style={styles.content}>
        {/* Logo / Brand */}
        <div style={styles.brandSection}>
          <h1 style={styles.logoText}>
            ENTROPY
          </h1>
          <div style={styles.versionBadge}>
            online judge
          </div>
        </div>

        {/* Tagline */}
        <p style={styles.tagline}>
          Navigate the algorithmic universe
        </p>

        {/* 3D Hero Element */}
        <div style={styles.heroContainer}>
          <Suspense
            fallback={
              <div style={styles.heroFallback}>
                <div style={styles.fallbackPulse} />
              </div>
            }
          >
            <HeroScene />
          </Suspense>
        </div>

        {/* CTA */}
        <button
          onClick={handleEnter}
          style={styles.ctaButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          Enter the Arena
          <ArrowRight size={14} style={{ marginLeft: '0.5rem' }} />
        </button>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <Layers size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span style={styles.statNumber}>150</span>
            <span style={styles.statLabel}>Problems</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <Sparkles size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span style={styles.statNumber}>18</span>
            <span style={styles.statLabel}>Star Systems</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <Cpu size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span style={styles.statNumber}>Sandboxed</span>
            <span style={styles.statLabel}>Evaluation</span>
          </div>
        </div>

        {/* Minimal footer */}
        <div style={styles.footer}>
          <span>DSA · Competitive Programming · Interactive Galaxy Map</span>
        </div>
      </div>
    </div>
  );
};

/* ─── STYLES ──────────────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  ambientGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(77,171,247,0.04) 0%, transparent 60%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    maxWidth: '720px',
    width: '100%',
    gap: '0',
  },

  brandSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.5rem',
  },

  logoText: {
    margin: 0,
    fontSize: '2.8rem',
    fontWeight: 200,
    letterSpacing: '0.35em',
    color: '#f7f7f7',
    fontFamily: "'Inter', 'Outfit', sans-serif",
    textTransform: 'uppercase' as const,
    // Text gradient — center bright, edges subtly dimmed
    background: 'linear-gradient(270deg, rgba(247,247,247,0.65) 0%, #f7f7f7 30%, #f7f7f7 70%, rgba(247,247,247,0.65) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  versionBadge: {
    padding: '0.2rem 0.7rem',
    fontSize: '0.6rem',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.4)',
    border: '1px dashed rgba(255,255,255,0.12)',
    borderRadius: '2px',
  },

  tagline: {
    margin: '0 0 1rem 0',
    fontSize: '0.95rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.02em',
    textAlign: 'center' as const,
  },

  heroContainer: {
    width: '100%',
    maxWidth: '400px',
    marginBottom: '1.5rem',
  },

  heroFallback: {
    width: '100%',
    aspectRatio: '1',
    maxHeight: '420px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fallbackPulse: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.08)',
    animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
  },

  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.6rem 1.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '2px',
    cursor: 'pointer',
    letterSpacing: '0.03em',
    transition: 'all 200ms ease',
    marginBottom: '2.5rem',
    fontFamily: "'Inter', sans-serif",
  },

  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  },

  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },

  statNumber: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '-0.01em',
  },

  statLabel: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.01em',
  },

  statDivider: {
    width: '1px',
    height: '14px',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  footer: {
    fontSize: '0.65rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
  },
};
