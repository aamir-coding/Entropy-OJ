import React, { Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDown,
  Layers,
  Sparkles,
  Cpu,
  ShieldCheck,
  Code2,
  FileCheck2,
  Lightbulb,
  BarChart2,
  Orbit,
} from 'lucide-react';
import { FeatureCard } from '../components/landing/FeatureCard';
import { MonacoWorkspaceWidget } from '../components/landing/MonacoWorkspaceWidget';
import { AdminStudioPreviewWidget } from '../components/landing/AdminStudioPreviewWidget';
import { SocraticHintWidget } from '../components/landing/SocraticHintWidget';
import { ComplexityAnalyzerWidget } from '../components/landing/ComplexityAnalyzerWidget';
import { GalaxyPreviewWidget } from '../components/landing/GalaxyPreviewWidget';
import { SandboxTelemetryWidget } from '../components/landing/SandboxTelemetryWidget';
import { BentoGrid } from '../components/landing/BentoGrid';
import { BackToTopButton } from '../components/landing/BackToTopButton';
import { BounceSidebar, BounceSidebarItem } from '../components/motion/bounce-sidebar';

const HeroScene = React.lazy(() =>
  import('../components/landing/HeroScene').then((m) => ({ default: m.HeroScene }))
);

const LANDING_NAV_ITEMS: BounceSidebarItem[] = [
  { id: 'chapter-workspace', label: 'Workspace' },
  { id: 'chapter-admin', label: 'Admin Studio' },
  { id: 'chapter-ai', label: 'AI Engine' },
  { id: 'chapter-galaxy', label: 'Galaxy' },
  { id: 'chapter-sandboxing', label: 'Sandboxing' },
  { id: 'chapter-architecture', label: 'Architecture' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('chapter-workspace');
  const [showSidebar, setShowSidebar] = useState(false);
  const [aiActiveTab, setAiActiveTab] = useState('copilot');
  const isClickScrollingRef = React.useRef(false);
  const clickTimeoutRef = React.useRef<number | null>(null);

  useEffect(() => {
    document.title = 'Entropy — Sandboxed Competitive Programming & Algorithmic Universe';
  }, []);

  useEffect(() => {
    const sectionIds = [
      'chapter-workspace',
      'chapter-admin',
      'chapter-ai',
      'chapter-galaxy',
      'chapter-sandboxing',
      'chapter-architecture',
    ];

    const updateScrollState = () => {
      // 1. Hero visibility check: gradual appearance of floating sidebar
      const firstChapterEl = document.getElementById('chapter-workspace');
      const heroEl = document.getElementById('hero');

      let inHero = true;
      if (firstChapterEl) {
        const top = firstChapterEl.getBoundingClientRect().top;
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

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.addEventListener('wheel', unlockScrollSpy, { passive: true });
    window.addEventListener('touchmove', unlockScrollSpy, { passive: true });

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

    setShowSidebar(false);
    setActiveSection('chapter-workspace');

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    clickTimeoutRef.current = window.setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 1000);
  };

  const handleExplore = () => {
    isClickScrollingRef.current = true;
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    const target = document.getElementById('chapter-workspace');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    clickTimeoutRef.current = window.setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 1000);
  };

  return (
    <div style={styles.root}>
      {/* Subtle radial ambient glow at top */}
      <div style={styles.ambientGlow} />

      {/* ── 1. HERO VIEWPORT (100vh) — PRESERVED 100% ── */}
      <div id="hero" style={styles.heroSection}>
        {/* Brand Section */}
        <div style={styles.brandSection}>
          <h1 className="hero-logo-text" style={styles.logoText}>ENTROPY</h1>
          <div style={styles.versionBadge}>online judge</div>
        </div>

        {/* Tagline */}
        <p style={styles.tagline}>Navigate the algorithmic universe</p>

        {/* 3D Hero Element */}
        <div className="landing-hero-container" style={styles.heroContainer}>
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

        {/* Explore Features CTA */}
        <button
          id="hero-explore-btn"
          onClick={handleExplore}
          style={styles.ctaButton}
          aria-label="Explore platform architecture below"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-1px)';
            const icon = e.currentTarget.querySelector('.cta-arrow-icon') as HTMLElement | null;
            if (icon) icon.style.transform = 'translateY(2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
            e.currentTarget.style.transform = 'translateY(0)';
            const icon = e.currentTarget.querySelector('.cta-arrow-icon') as HTMLElement | null;
            if (icon) icon.style.transform = 'translateY(0)';
          }}
        >
          <span>Explore Features</span>
          <ArrowDown size={14} className="cta-arrow-icon" style={{ marginLeft: '0.5rem', transition: 'transform 200ms ease' }} />
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

      {/* ── 2. FULL SEQUENTIAL CHAPTERS ── */}
      <main className="landing-features-section" style={styles.featuresSection}>
        {/* Section Header */}
        <div className="landing-section-header" style={styles.sectionHeader}>
          <span style={styles.sectionPill}>Engineering Architecture</span>
          <h2 className="landing-section-heading" style={styles.sectionHeading}>
            Built from the Kernel Up for Code Execution
          </h2>
          <p style={styles.sectionSubheading}>
            A sandboxed judge designed for rigorous competitive programming, high-concurrency microservice scaling, and pedagogical AI debugging.
          </p>
        </div>

        {/* ── CHAPTER 01: Problem Arena & Monaco Workspace ── */}
        <FeatureCard
          id="chapter-workspace"
          tag="CHAPTER 01 · CANDIDATE ENVIRONMENT"
          title="Interactive Problem Arena & IDE"
          subtitle="Monaco Editor, Gesture-Driven Mobile Drawer & Technical Interview Timer"
          description="A responsive IDE experience that adapts to your device. Features a full Monaco editor for desktop, an authentic gesture-driven tabbed drawer for mobile, and a precision synced stopwatch to simulate live technical interviews."
          icon={Code2}
          accentColor="#38bdf8"
          specs={[
            { label: 'Editor Core', value: 'Monaco (VS Code Engine)' },
            { label: 'Mobile UX', value: 'Gesture-driven Tabbed Drawer' },
            { label: 'Execution', value: 'Sample Runner & Host Judge' },
            { label: 'Simulation', value: 'Precision Synced Stopwatch' },
          ]}
          widget={<MonacoWorkspaceWidget />}
          reversed={false}
        />

        {/* ── CHAPTER 02: Admin Problem Studio & QA Engine (Full-Width Studio Showcase) ── */}
        <motion.section
          id="chapter-admin"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: '100%',
            padding: '2.5rem 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            scrollMarginTop: '80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Top Header Block & Specs */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            {/* Tag Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(167, 139, 250, 0.15)',
                }}
              >
                <FileCheck2 size={16} style={{ color: '#a78bfa' }} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: '#a78bfa',
                  textTransform: 'uppercase',
                }}
              >
                CHAPTER 02 · AUTHORING SUITE
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h3
                className="feature-card-title"
                style={{
                  margin: 0,
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  fontFamily: "var(--font-display, 'Geist', sans-serif)",
                }}
              >
                Admin Problem Studio
              </h3>
              <div
                style={{
                  marginTop: '0.45rem',
                  fontSize: '0.98rem',
                  fontWeight: 500,
                  color: '#a78bfa',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.45,
                  fontFamily: "var(--font-sans, 'Inter', sans-serif)",
                }}
              >
                Live KaTeX LaTeX Rendering, Pre-Flight Sandbox & Gemini 2.5 Flash QA
              </div>
            </div>

            {/* Description Paragraph */}
            <div
              style={{
                margin: 0,
                fontSize: '0.88rem',
                lineHeight: 1.68,
                color: 'rgba(255, 255, 255, 0.55)',
                fontFamily: "var(--font-sans, 'Inter', sans-serif)",
                maxWidth: '900px',
              }}
            >
              Full-lifecycle problem authoring suite for contest administrators and problem setters. Authors compose mathematical statements with real-time KaTeX rendering, validate reference solutions against hidden test suites inside the execution sandbox, and trigger automated Gemini 2.5 Flash QA audits to detect edge-case oversights before publishing.
            </div>

            {/* Technical Specification Chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.45rem',
                marginTop: '0.2rem',
              }}
            >
              {[
                { label: 'Math Engine', value: 'KaTeX LaTeX Rendering' },
                { label: 'Pre-Flight', value: 'Sandbox Author Validator' },
                { label: 'QA Auditor', value: 'Gemini 2.5 Flash (~1M Context)' },
                { label: 'Privacy', value: 'Read-only Deterministic Review' },
              ].map((spec, i) => (
                <div
                  key={i}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.22rem 0.55rem',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.7rem',
                    fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                  }}
                >
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>{spec.label}:</span>
                  <span style={{ color: '#f7f7f7', fontWeight: 500 }}>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full-Width Workbench Frame */}
          <div style={{ width: '100%' }}>
            <AdminStudioPreviewWidget />
          </div>
        </motion.section>

        {/* ── CHAPTER 03: Socratic AI & Complexity Classifier ── */}
        <FeatureCard
          id="chapter-ai"
          tag="CHAPTER 03 · PEDAGOGICAL AI"
          title="AI Socratic Debugger & Analytics"
          subtitle="Zero-Leakage Socratic Copilot & Asynchronous Big-O Complexity Classifier"
          description={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ lineHeight: 1.68 }}>
                {aiActiveTab === 'copilot'
                  ? 'On non-AC submissions, the Socratic Copilot generates targeted, pedagogical debugging hints without leaking code via an AST stripper.'
                  : 'After solving (Accepted), an asynchronous BullMQ worker analyzes your solution to classify the algorithmic pattern and Big-O time/space complexity.'}
              </div>

              {/* High-Affordance Interactive Simulation Mode Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div
                  style={{
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontWeight: 600,
                    fontFamily: "var(--font-mono, monospace)",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>Interactive Demo Mode</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.25)' }}>·</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.35)', textTransform: 'none', letterSpacing: 'normal' }}>Click to switch simulation</span>
                </div>

                <div
                  className="ai-demo-mode-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '0.65rem',
                  }}
                >
                  {/* Option 1: Socratic Copilot */}
                  <button
                    type="button"
                    onClick={() => setAiActiveTab('copilot')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: aiActiveTab === 'copilot' ? 'rgba(234, 179, 8, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: aiActiveTab === 'copilot' ? '1px solid rgba(234, 179, 8, 0.7)' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: aiActiveTab === 'copilot' ? '0 0 16px rgba(234, 179, 8, 0.12)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Lightbulb size={15} style={{ color: aiActiveTab === 'copilot' ? '#eab308' : 'rgba(255, 255, 255, 0.4)' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: aiActiveTab === 'copilot' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)' }}>
                          Socratic Copilot
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.6rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(234, 179, 8, 0.15)',
                          color: '#eab308',
                          border: '1px solid rgba(234, 179, 8, 0.3)',
                          fontWeight: 600,
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        NON-AC
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.4 }}>
                      Pedagogical hints without code leaks
                    </span>
                  </button>

                  {/* Option 2: Post-AC Analytics */}
                  <button
                    type="button"
                    onClick={() => setAiActiveTab('analytics')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: aiActiveTab === 'analytics' ? 'rgba(5, 223, 114, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: aiActiveTab === 'analytics' ? '1px solid rgba(5, 223, 114, 0.7)' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: aiActiveTab === 'analytics' ? '0 0 16px rgba(5, 223, 114, 0.12)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <BarChart2 size={15} style={{ color: aiActiveTab === 'analytics' ? '#05df72' : 'rgba(255, 255, 255, 0.4)' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: aiActiveTab === 'analytics' ? '#ffffff' : 'rgba(255, 255, 255, 0.7)' }}>
                          Post-AC Analytics
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.6rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(5, 223, 114, 0.15)',
                          color: '#05df72',
                          border: '1px solid rgba(5, 223, 114, 0.3)',
                          fontWeight: 600,
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        ACCEPTED
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.4 }}>
                      Asynchronous Big-O complexity classifier
                    </span>
                  </button>
                </div>
              </div>
            </div>
          }
          icon={Lightbulb}
          accentColor={aiActiveTab === 'copilot' ? '#eab308' : '#05df72'}
          specs={
            aiActiveTab === 'copilot'
              ? [
                  { label: 'Guardrail', value: '0% Code Leakage (AST Stripper)' },
                  { label: 'Inference', value: 'Groq LLaMA 3.3 70B & Gemini' },
                ]
              : [
                  { label: 'Asynchronous', value: 'BullMQ Complexity Classifier' },
                  { label: 'Diagnostics', value: 'Big-O Time & Space Bounds' },
                ]
          }
          widget={
            aiActiveTab === 'copilot' ? <SocraticHintWidget /> : <ComplexityAnalyzerWidget />
          }
          reversed={false}
        />

        {/* ── CHAPTER 04: Algorithmic Galaxy Map ── */}
        <FeatureCard
          id="chapter-galaxy"
          tag="CHAPTER 04 · CURRICULUM ROADMAP"
          title="The Algorithmic Galaxy"
          subtitle="Interactive Canvas Star Map Across 18 Thematic Constellations & 150 Problems"
          description="A gamified, HTML5 Canvas-powered roadmap replacing monotonous lists. Navigate 150 curated challenges grouped into specialized constellations—from Arrays to Dynamic Programming—all unlocked on demand across 3 cosmic sectors."
          icon={Orbit}
          accentColor="#38bdf8"
          specs={[
            { label: 'Star Systems', value: '18 Thematic Clusters' },
            { label: 'Cosmic Sectors', value: '3 Interstellar Sectors' },
            { label: 'Total Catalog', value: '150 Handcrafted Tasks' },
            { label: 'Renderer', value: 'Canvas High-DPI Engine' },
          ]}
          widget={<GalaxyPreviewWidget />}
          reversed={true}
        />

        {/* ── CHAPTER 05: Direct Process Sandboxing & Watchdog ── */}
        <FeatureCard
          id="chapter-sandboxing"
          tag="CHAPTER 05 · EXECUTION ENGINE"
          title="Sub-Millisecond Linux Sandbox"
          subtitle="Direct Process Isolation, Resource Limits & Execution Watchdog"
          description="Untrusted submissions bypass container launch overhead, running natively on the host via runner_process.sh under unprivileged runner UID 1001. Strict defense-in-depth security enforces POSIX resource quotas, fork-bomb immunity, and microsecond rusage telemetry."
          icon={ShieldCheck}
          accentColor="#05df72"
          specs={[
            { label: 'Privilege', value: 'Unprivileged runner (UID 1001)' },
            { label: 'Process Ceiling', value: '64 PIDs (ulimit -u)' },
            { label: 'File Quota', value: '64 MB (ulimit -f)' },
            { label: 'Telemetry', value: 'GNU time (Microsecond RSS & CPU)' },
          ]}
          widget={<SandboxTelemetryWidget />}
          reversed={false}
        />

        {/* ── CHAPTER 06: Systems Architecture Capabilities Bento Grid ── */}
        <section id="chapter-architecture" style={{ width: '100%', scrollMarginTop: '80px', marginBottom: '3rem' }}>
          <BentoGrid />
        </section>

        {/* ── PRODUCTION TECH STACK STRIP ── */}
        <section style={{ width: '100%', scrollMarginTop: '80px' }}>
          <div style={styles.techStrip}>
            <div style={styles.techStripTitle}>PRODUCTION TECH STACK & SYSTEM ARCHITECTURE</div>
            <div style={styles.techBadges}>
              {[
                'TypeScript 5.7',
                'React 19 SPA',
                'Direct Process Sandboxing',
                'Redis 7 & BullMQ Active Locks',
                'Node.js v22',
                'MongoDB 7',
                'Monaco Editor',
                'KaTeX LaTeX',
                'Gemini 2.5 Flash',
                'Linux ulimit & rusage',
                'Three.js & Canvas',
              ].map((tech, i) => (
                <span key={i} style={styles.techBadge}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Final Call to Action */}
          <div style={styles.finalCta}>
            <h3 className="landing-cta-heading" style={styles.finalCtaHeading}>
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
      </main>

      {/* Floating Minimal Section Navigation (beUI Bounce Sidebar) */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            key="entropy-bounce-sidebar"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="entropy-bounce-sidebar-container"
            aria-label="Chapter navigation"
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
    overflowX: 'clip' as const,
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
  },

  versionBadge: {
    fontSize: '0.62rem',
    letterSpacing: '0.22em',
    padding: '0.12rem 0.5rem',
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1,
  },

  sectionHeader: {
    textAlign: 'center' as const,
    marginBottom: '2.5rem',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  sectionPill: {
    display: 'inline-block',
    fontFamily: "var(--font-mono, monospace)",
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    color: '#05df72',
    textTransform: 'uppercase' as const,
    backgroundColor: 'rgba(5, 223, 114, 0.08)',
    border: '1px solid rgba(5, 223, 114, 0.25)',
    padding: '0.2rem 0.65rem',
    borderRadius: '4px',
    marginBottom: '0.8rem',
  },

  sectionHeading: {
    margin: '0 0 0.6rem 0',
    fontSize: '2.1rem',
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
    fontFamily: "var(--font-mono, monospace)",
    fontSize: '0.72rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: '0.02em',
  },

  /* ── 5. FINAL CTA ── */
  finalCta: {
    width: '100%',
    padding: '4.5rem 1.5rem',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.25rem',
  },

  finalCtaHeading: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 500,
    color: '#f7f7f7',
    letterSpacing: '-0.025em',
    fontFamily: "var(--font-display, 'Geist', sans-serif)",
  },

  finalCtaSubheading: {
    margin: 0,
    fontSize: '0.92rem',
    color: 'rgba(255, 255, 255, 0.45)',
    maxWidth: '560px',
    lineHeight: 1.6,
  },

  ctaButtonGroup: {
    display: 'flex',
    gap: '0.85rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },

  primaryCta: {
    padding: '0.75rem 1.75rem',
    fontSize: '0.84rem',
    fontWeight: 600,
    color: '#000000',
    backgroundColor: '#f7f7f7',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    letterSpacing: '-0.01em',
    fontFamily: "var(--font-sans, 'Inter', sans-serif)",
  },

  secondaryCta: {
    padding: '0.75rem 1.75rem',
    fontSize: '0.84rem',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.85)',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 200ms ease',
    letterSpacing: '-0.01em',
    fontFamily: "var(--font-sans, 'Inter', sans-serif)",
  },

  /* ── 6. FOOTER ── */
  footer: {
    width: '100%',
    padding: '2.5rem 0 1rem 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },

  footerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    textAlign: 'center' as const,
  },
};
