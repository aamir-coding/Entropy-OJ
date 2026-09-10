import React, { Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Layers,
  Sparkles,
  Cpu,
  ShieldCheck,
  BrainCircuit,
  Orbit,
  Code2,
  Terminal,
  ExternalLink,
  Lightbulb,
} from 'lucide-react';
import { FeatureCard } from '../components/landing/FeatureCard';
import { SandboxTelemetryWidget } from '../components/landing/SandboxTelemetryWidget';
import { SocraticHintWidget } from '../components/landing/SocraticHintWidget';
import { GalaxyPreviewWidget } from '../components/landing/GalaxyPreviewWidget';
import { MonacoWorkspaceWidget } from '../components/landing/MonacoWorkspaceWidget';
import { BentoGrid } from '../components/landing/BentoGrid';
import { BackToTopButton } from '../components/landing/BackToTopButton';
import { BounceSidebar, BounceSidebarItem } from '../components/motion/bounce-sidebar';

const HeroScene = React.lazy(() =>
  import('../components/landing/HeroScene').then((m) => ({ default: m.HeroScene }))
);

const LANDING_NAV_ITEMS: BounceSidebarItem[] = [
  { id: 'feature-sandboxing', label: 'Sandboxing' },
  { id: 'feature-copilot', label: 'Copilot' },
  { id: 'feature-galaxy', label: 'Galaxy' },
  { id: 'feature-monaco', label: 'Monaco' },
  { id: 'feature-matrix', label: 'Architecture' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('feature-sandboxing');
  const [showSidebar, setShowSidebar] = useState(false);
  const isClickScrollingRef = React.useRef(false);
  const clickTimeoutRef = React.useRef<number | null>(null);

  useEffect(() => {
    document.title = 'Entropy — Sandboxed Competitive Programming & Algorithmic Universe';
  }, []);

  useEffect(() => {
    const sectionIds = [
      'feature-sandboxing',
      'feature-copilot',
      'feature-galaxy',
      'feature-monaco',
      'feature-matrix',
    ];

    const updateScrollState = () => {
      // 1. Hero visibility check: clean gradual appearance/disappearance
      // The hero section occupies the top viewport. When feature-sandboxing enters 60% of viewport, show the sidebar.
      const sandboxingEl = document.getElementById('feature-sandboxing');
      const heroEl = document.getElementById('hero');

      let inHero = true;
      if (sandboxingEl) {
        const top = sandboxingEl.getBoundingClientRect().top;
        inHero = top > window.innerHeight * 0.60;
      } else if (heroEl) {
        inHero = heroEl.getBoundingClientRect().bottom > window.innerHeight * 0.40;
      } else {
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
        inHero = scrollY < 300;
      }

      setShowSidebar(!inHero);

      if (isClickScrollingRef.current) return;

      // 2. Focal line: 40% from top of viewport using getBoundingClientRect
      const focalLine = window.innerHeight * 0.40;
      let currentSection = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= focalLine) {
            currentSection = id;
          }
        }
      }

      setActiveSection((prev) => (prev !== currentSection ? currentSection : prev));
    };

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollState();
          ticking = false;
        });
        ticking = true;
      }
    };

    const unlockScrollSpy = () => {
      isClickScrollingRef.current = false;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };

    // Use capture: true on window and document so scroll is caught regardless of scrolling container
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.addEventListener('wheel', unlockScrollSpy, { passive: true });
    window.addEventListener('touchmove', unlockScrollSpy, { passive: true });

    // Initial check
    updateScrollState();
    const initTimer = setTimeout(updateScrollState, 150);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('wheel', unlockScrollSpy);
      window.removeEventListener('touchmove', unlockScrollSpy);
      clearTimeout(initTimer);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const handleNavChange = (id: string) => {
    // Lock scroll-spy from interrupting the smooth spring bounce jump
    isClickScrollingRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    setActiveSection(id);

    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    clickTimeoutRef.current = window.setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 1000);
  };

  const handleBackToTop = () => {
    isClickScrollingRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    // Smoothly transition sidebar out and reset section to first feature
    setShowSidebar(false);
    setActiveSection('feature-sandboxing');

    // Scroll directly to absolute top of the page
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    clickTimeoutRef.current = window.setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 1000);
  };

  const handleEnter = () => {
    navigate('/problems');
  };

  return (
    <div style={styles.root}>
      {/* Subtle radial ambient glow at top */}
      <div style={styles.ambientGlow} />

      {/* ── 1. HERO VIEWPORT (100vh) ── */}
      <div id="hero" style={styles.heroSection}>
        {/* Brand Section */}
        <div style={styles.brandSection}>
          <h1 style={styles.logoText}>ENTROPY</h1>
          <div style={styles.versionBadge}>online judge</div>
        </div>

        {/* Tagline */}
        <p style={styles.tagline}>Navigate the algorithmic universe</p>

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
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Enter the Arena
          <ArrowRight size={14} style={{ marginLeft: '0.5rem' }} />
        </button>

        {/* High-Level Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <Layers size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span style={styles.statNumber}>150</span>
            <span style={styles.statLabel}>Problems</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <Sparkles size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span style={styles.statNumber}>18</span>
            <span style={styles.statLabel}>Star Systems</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <Cpu size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span style={styles.statNumber}>Sandboxed</span>
            <span style={styles.statLabel}>Evaluation</span>
          </div>
        </div>
      </div>

      {/* ── 2. FEATURE DEEP-DIVES SECTION ── */}
      <section id="features-section" style={styles.featuresSection}>
        {/* Section Header */}
        <div style={styles.sectionHeader}>
          <span style={styles.sectionPill}>Engineering Architecture</span>
          <h2 style={styles.sectionHeading}>
            Built from the Kernel Up for Code Execution
          </h2>
          <p style={styles.sectionSubheading}>
            A sandboxed judge designed for rigorous competitive programming, high-concurrency microservice scaling, and pedagogical AI debugging.
          </p>
        </div>

        {/* Feature 01: Ephemeral Docker Micro-Sandboxing */}
        <FeatureCard
          id="feature-sandboxing"
          tag="SYS-ISOLATION-01"
          title="Zero-Trust Ephemeral Container Sandboxing"
          description="Untrusted user submissions run inside isolated, disposable Linux containers with non-root UID 1001, --network none egress isolation, read-only root filesystems, and strict 64-process ceilings to eliminate fork bombs. CPU and RSS memory consumption are measured at microsecond precision via Linux kernel rusage."
          icon={ShieldCheck}
          accentColor="#05df72"
          specs={[
            { label: 'Network', value: 'None (--network none)' },
            { label: 'Root FS', value: 'Read-Only (EROFS)' },
            { label: 'Process Ceiling', value: '64 PIDs' },
            { label: 'Memory Ceiling', value: '256 MB cgroup' },
            { label: 'Telemetry', value: 'Linux rusage (User+Sys)' },
          ]}
          widget={<SandboxTelemetryWidget />}
          reversed={false}
        />

        {/* Feature 02: Socratic AI Debug Copilot */}
        <FeatureCard
          id="feature-copilot"
          tag="AI-GUARDRAIL-02"
          title="Socratic Debug Copilot with Strict Code Stripping"
          description="Unlike standard LLM interfaces that spoil answers and defeat learning, Entropy provides structured 3-tier hints: conceptual patterns, edge/boundary constraints, and targeted logic diagnosis. An AST code-fence stripper forcefully removes any syntax blocks before delivery to the browser, while hidden test cases are never transmitted in prompts."
          icon={Lightbulb}
          accentColor="#eab308"
          specs={[
            { label: 'Hint Structure', value: '3 Progressive Tiers' },
            { label: 'Code Leakage', value: '0% (AST Stripper)' },
            { label: 'Privacy', value: 'Zero Hidden Test Data' },
            { label: 'Rate Limiting', value: 'Token Bucket (10 req/min)' },
            { label: 'Model Fallback', value: 'Gemini 2.5 Flash / Groq' },
          ]}
          widget={<SocraticHintWidget />}
          reversed={true}
        />

        {/* Feature 03: Interactive Algorithmic Galaxy Map */}
        <FeatureCard
          id="feature-galaxy"
          tag="GRAPH-VIS-03"
          title="The Algorithmic Galaxy: 18 Thematic Star Systems"
          description="Replaces monotonous problem lists with an explorable deep-space constellation map built on HTML5 Canvas. 150 curated DSA challenges are grouped into 18 specialized star systems across 3 cosmic sectors—from foundational Arrays & Hashing to Trees, Graphs, and Dynamic Programming. All 18 systems are completely open and accessible at any time without artificial lockouts, letting you tackle any topic on demand."
          icon={Orbit}
          accentColor="#38bdf8"
          specs={[
            { label: 'Star Systems', value: '18 Thematic Clusters' },
            { label: 'Cosmic Sectors', value: '3 Interstellar Sectors' },
            { label: 'Total Catalog', value: '150 Handcrafted Tasks' },
            { label: 'System Access', value: 'All 18 Systems Open' },
            { label: 'Renderer', value: 'Canvas High-DPI Engine' },
          ]}
          widget={<GalaxyPreviewWidget />}
          reversed={false}
        />

        {/* Feature 04: Monaco Workspace & Dual-Execution Engine */}
        <FeatureCard
          id="feature-monaco"
          tag="STUDENT-IDE-04"
          title="Monaco Workspace & Dual-Execution Engine"
          description="Full VS Code Monaco editor workspace with custom Entropy dark syntax themes, keyboard-driven navigation, and KaTeX mathematical proofs. Run lightweight sample cases instantaneously in the interactive docked console, or dispatch full submissions to ephemeral Docker sandboxes with comprehensive multi-case evaluation and AI approach classification."
          icon={Code2}
          accentColor="#38bdf8"
          specs={[
            { label: 'Editor Core', value: 'Monaco (VS Code Engine)' },
            { label: 'Supported Runtimes', value: 'C++17 (GCC 12) & Python 3.11' },
            { label: 'Execution Modes', value: 'Sample Runner & Ephemeral Judge' },
            { label: 'Post-AC Intelligence', value: 'AI Approach & Complexity (O(N))' },
            { label: 'Interview Simulation', value: 'Precision Timer & Blurred Tags' },
          ]}
          widget={<MonacoWorkspaceWidget />}
          reversed={true}
        />

        {/* ── 3. BENTO CAPABILITIES MATRIX ── */}
        <div id="feature-matrix" style={{ width: '100%', scrollMarginTop: '80px' }}>
          <BentoGrid />
        </div>

        {/* ── 4. ARCHITECTURE & TECH STACK STRIP ── */}
        <div style={styles.techStrip}>
          <div style={styles.techStripTitle}>PRODUCTION TECH STACK & SYSTEM ARCHITECTURE</div>
          <div style={styles.techBadges}>
            {[
              'TypeScript 5.7',
              'React 19 SPA',
              'Docker Ephemeral Containers',
              'Redis 7 & BullMQ',
              'Node.js v22',
              'MongoDB 7',
              'Monaco Editor',
              'KaTeX LaTeX',
              'Gemini 2.5 Flash',
              'Linux rusage',
              'Three.js & Canvas',
            ].map((tech, i) => (
              <span key={i} style={styles.techBadge}>
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* ── 5. FINAL CALL TO ACTION ── */}
        <div style={styles.finalCta}>
          <h3 style={styles.finalCtaHeading}>
            Ready to Navigate the Algorithmic Universe?
          </h3>
          <p style={styles.finalCtaSubheading}>
            Test your C++17 and Python 3.11 algorithms against our sandboxed judge, or explore the gamified galaxy node map.
          </p>

          <div style={styles.ctaButtonGroup}>
            <button
              onClick={() => navigate('/problems')}
              style={styles.primaryCta}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f7f7f7';
                e.currentTarget.style.color = '#000000';
              }}
            >
              Enter Problem Arena
            </button>

            <button
              onClick={() => navigate('/galaxy')}
              style={styles.secondaryCta}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Explore Galaxy Map
            </button>
          </div>
        </div>

        {/* Minimal Engineering Footer */}
        <footer style={styles.footer}>
          <BackToTopButton onScrollToTop={handleBackToTop} />

          <div style={styles.footerContent}>
            <div>
              <span style={{ color: '#f7f7f7', fontWeight: 500 }}>ENTROPY ONLINE JUDGE</span>
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.72rem' }}>
              Architected with defense-in-depth isolation, asynchronous queues, and pedagogy-first AI.
            </div>
          </div>
        </footer>
      </section>

      {/* Floating Minimal Section Navigation (beUI Bounce Sidebar) with clean gradual fade */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            key="entropy-bounce-sidebar"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="entropy-bounce-sidebar-container"
            aria-label="Section navigation"
          >
            <BounceSidebar
              items={LANDING_NAV_ITEMS}
              value={activeSection}
              onValueChange={handleNavChange}
              indicatorClassName="bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]"
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── STYLES ──────────────────────────────────────────────────────────── */

const styles: Record<string, React.CSSProperties> = {
  root: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#000000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflowX: 'hidden',
    fontFamily: "var(--font-sans, 'Inter', sans-serif)",
    color: '#f7f7f7',
  },

  ambientGlow: {
    position: 'absolute',
    top: '300px',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '900px',
    height: '700px',
    background: 'radial-gradient(circle, rgba(77,171,247,0.035) 0%, transparent 65%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* ── 1. HERO SECTION ── */
  heroSection: {
    minHeight: 'calc(100vh - var(--header-height, 56px))',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem 2.5rem 1.5rem',
    position: 'relative',
    zIndex: 1,
  },

  brandSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.4rem',
  },

  logoText: {
    margin: 0,
    fontSize: '3rem',
    fontWeight: 200,
    letterSpacing: '0.35em',
    color: '#f7f7f7',
    fontFamily: "var(--font-display, 'Geist', 'Outfit', sans-serif)",
    textTransform: 'uppercase' as const,
    background:
      'linear-gradient(270deg, rgba(247,247,247,0.65) 0%, #f7f7f7 30%, #f7f7f7 70%, rgba(247,247,247,0.65) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  versionBadge: {
    padding: '0.2rem 0.7rem',
    fontSize: '0.6rem',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.4)',
    border: '1px dashed rgba(255,255,255,0.14)',
    borderRadius: '3px',
    fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
  },

  tagline: {
    margin: '0 0 1rem 0',
    fontSize: '0.98rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.02em',
    textAlign: 'center' as const,
  },

  heroContainer: {
    width: '100%',
    maxWidth: '400px',
    marginBottom: '1.25rem',
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
    padding: '0.65rem 1.6rem',
    fontSize: '0.82rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.85)',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '4px',
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'all 200ms ease',
    marginBottom: '2.2rem',
    fontFamily: "var(--font-sans, 'Inter', sans-serif)",
  },

  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap' as const,
  },

  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },

  statNumber: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '-0.01em',
  },

  statLabel: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.01em',
  },

  statDivider: {
    width: '1px',
    height: '14px',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  /* ── 2. FEATURES SHOWCASE SECTION ── */
  featuresSection: {
    width: '100%',
    maxWidth: '1120px',
    padding: '3rem 1.5rem 5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  },

  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
    maxWidth: '680px',
  },

  sectionPill: {
    display: 'inline-block',
    fontFamily: "var(--font-mono, monospace)",
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    color: '#4dabf7',
    textTransform: 'uppercase' as const,
    backgroundColor: 'rgba(77, 171, 247, 0.08)',
    border: '1px solid rgba(77, 171, 247, 0.25)',
    padding: '0.2rem 0.65rem',
    borderRadius: '4px',
    marginBottom: '0.8rem',
  },

  sectionHeading: {
    margin: '0 0 0.6rem 0',
    fontSize: '2.2rem',
    fontWeight: 500,
    color: '#f7f7f7',
    letterSpacing: '-0.03em',
    lineHeight: 1.2,
    fontFamily: "var(--font-display, 'Geist', sans-serif)",
  },

  sectionSubheading: {
    margin: 0,
    fontSize: '0.92rem',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 1.6,
  },

  /* ── 4. TECH STRIP ── */
  techStrip: {
    width: '100%',
    marginTop: '2rem',
    padding: '2rem 1.5rem',
    backgroundColor: '#060606',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '10px',
    textAlign: 'center' as const,
  },

  techStripTitle: {
    fontFamily: "var(--font-mono, monospace)",
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: '1rem',
  },

  techBadges: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    gap: '0.5rem',
  },

  techBadge: {
    padding: '0.3rem 0.65rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '0.72rem',
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: "var(--font-mono, monospace)",
  },

  /* ── 5. FINAL CTA ── */
  finalCta: {
    width: '100%',
    marginTop: '4rem',
    marginBottom: '3rem',
    padding: '3.5rem 2rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: '#080808',
    backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(77, 171, 247, 0.08) 0%, transparent 70%)',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  finalCtaHeading: {
    margin: '0 0 0.6rem 0',
    fontSize: '2rem',
    fontWeight: 500,
    color: '#f7f7f7',
    letterSpacing: '-0.025em',
  },

  finalCtaSubheading: {
    margin: '0 0 2rem 0',
    fontSize: '0.92rem',
    color: 'rgba(255, 255, 255, 0.5)',
    maxWidth: '520px',
    lineHeight: 1.6,
  },

  ctaButtonGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },

  primaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.8rem',
    borderRadius: '6px',
    backgroundColor: '#f7f7f7',
    color: '#000000',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },

  secondaryCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.8rem',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#f7f7f7',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    fontWeight: 500,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },

  /* ── FOOTER ── */
  footer: {
    width: '100%',
    paddingTop: '2.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },

  footerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.55)',
    textAlign: 'center' as const,
  },
};
