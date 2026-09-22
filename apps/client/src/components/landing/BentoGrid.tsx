import React from 'react';
import {
  Layers,
  Cpu,
  Terminal,
  Activity,
  ShieldCheck,
  LucideIcon,
  EyeOff,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';

interface BentoItem {
  id: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  accent: string;
  badge: string;
  highlights: string[];
  visualType: 'queue' | 'blind' | 'security' | 'compiler';
  colSpan: number; // For asymmetrical CSS Grid
}

const BENTO_ITEMS: BentoItem[] = [
  {
    id: 'queue',
    icon: Layers,
    tag: 'DISTRIBUTED QUEUE',
    title: 'BullMQ & Redis Asynchronous Pipeline',
    description:
      'Decouples heavy compilation and sandboxed process execution from HTTP API threads. Provides dedicated priority queues, bounded worker concurrency, and resilient exponential-backoff polling.',
    accent: '#ff6568',
    badge: 'BullMQ 5 · Redis 7',
    highlights: [
      'Worker concurrency limits (c: 2 per node)',
      'Exponential backoff polling with smart jitter',
      'Zero HTTP thread blocking during compile',
    ],
    visualType: 'queue',
    colSpan: 2,
  },
  {
    id: 'blind',
    icon: EyeOff,
    tag: 'EVALUATION ENVIRONMENT',
    title: 'Blind Interview and Competitive Programming Mode',
    description:
      'Replicates authentic technical interview and competitive programming pressure. Conceals problem tags and hidden test data while enforcing a focused Monaco environment with live stopwatch timing.',
    accent: '#fbbf24',
    badge: 'Interview Simulator',
    highlights: [
      'Hidden problem tags & algorithms',
      'Concealed testcase failure payloads',
      'Precision synchronized stopwatch',
    ],
    visualType: 'blind',
    colSpan: 1,
  },
  {
    id: 'security',
    icon: ShieldCheck,
    tag: 'KERNEL HARDENING',
    title: 'Linux Defense-in-Depth Primitives',
    description:
      'Submissions execute via runner_process.sh under unprivileged runner UID 1001 with strict POSIX resource quotas, fork-bomb immunity, and filesystem size ceilings.',
    accent: '#05df72',
    badge: 'ulimit & rusage',
    highlights: [
      'Unprivileged runner user (UID 1001)',
      'ulimit -u 64 fork-bomb protection',
      'ulimit -f 131072 (64MB file quota)',
    ],
    visualType: 'security',
    colSpan: 1,
  },
  {
    id: 'compiler',
    icon: Terminal,
    tag: 'DUAL RUNTIMES',
    title: 'C++17 & Python 3.11 Execution Matrix',
    description:
      'Native GCC 12 compiler with -O2 optimization and Python 3.11 runtimes configured with fast I/O optimizations, memory ceiling enforcement, and microsecond Linux kernel rusage telemetry.',
    accent: '#4dabf7',
    badge: 'GCC 12 & Python 3.11',
    highlights: [
      'Fast I/O template support (ios_base::sync_with_stdio)',
      'Strict 64-PID & 64MB ulimit resource quotas',
      'Microsecond Linux rusage user+sys telemetry',
    ],
    visualType: 'compiler',
    colSpan: 2,
  },
];

export const BentoGrid: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        marginTop: '2.5rem',
        marginBottom: '3.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '680px' }}>
        <span
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: '#bababa',
            textTransform: 'uppercase',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          System Architecture Capabilities
        </span>
        <h3
          style={{
            margin: '0.8rem 0 0.4rem 0',
            fontSize: '1.9rem',
            fontWeight: 500,
            color: '#f7f7f7',
            letterSpacing: '-0.02em',
            fontFamily: "var(--font-display, 'Geist', sans-serif)",
          }}
        >
          Built for Scalability, Security & Rigor
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.88rem',
            color: 'rgba(255, 255, 255, 0.45)',
          }}
        >
          Explore the low-level concurrency and isolation primitives powering the evaluation pipeline.
        </p>
      </div>

      {/* True Asymmetrical CSS Grid Layout */}
      <div
        className="bento-grid-container"
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          position: 'relative',
        }}
      >
        <style>{`
          @media (max-width: 900px) {
            .bento-grid-container {
              display: flex !important;
              flex-direction: column !important;
            }
          }
          @media (max-width: 768px) {
            .bento-card-inner {
              flex-direction: column !important;
              gap: 1.25rem !important;
              padding: 1.25rem !important;
            }
            .bento-card-text-panel {
              min-width: 100% !important;
            }
          }
          .bento-card-hover {
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .bento-card-hover:hover {
            transform: translateY(-4px);
          }
        `}</style>

        {BENTO_ITEMS.map((item, idx) => {
          const IconComponent = item.icon;
          const isWide = item.colSpan === 2;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bento-card-hover bento-card-inner"
              style={{
                gridColumn: `span ${item.colSpan}`,
                backgroundColor: '#070707',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: isWide ? 'row' : 'column',
                gap: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${item.accent}50`;
                e.currentTarget.style.boxShadow = `0 10px 30px -10px ${item.accent}30, 0 4px 12px rgba(0,0,0,0.5)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
              }}
            >
              {/* Left/Top Panel: Information */}
              <div
                className="bento-card-text-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  flex: 1,
                  minWidth: isWide ? '50%' : '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: `${item.accent}15`,
                        border: `1px solid ${item.accent}35`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={16} style={{ color: item.accent }} />
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        color: item.accent,
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: '0.62rem',
                      color: 'rgba(255, 255, 255, 0.45)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {item.badge}
                  </span>
                </div>

                <h4
                  style={{
                    margin: '0.4rem 0 0.2rem 0',
                    fontSize: isWide ? '1.35rem' : '1.2rem',
                    fontWeight: 500,
                    color: '#f7f7f7',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.25,
                    fontFamily: "var(--font-display, 'Geist', sans-serif)",
                  }}
                >
                  {item.title}
                </h4>

                <p
                  style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    lineHeight: '1.6',
                    color: 'rgba(255, 255, 255, 0.55)',
                  }}
                >
                  {item.description}
                </p>

                {/* Highlights */}
                <div
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '0.8rem',
                  }}
                >
                  {item.highlights.map((h, hIdx) => (
                    <div
                      key={hIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.72rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      <span style={{ color: item.accent, fontSize: '0.8rem' }}>•</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right/Bottom Panel: Architecture Visualizer */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: '0.7rem',
                  lineHeight: '1.6',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {item.visualType === 'queue' && (
                  <div>
                    <div
                      style={{
                        color: 'rgba(255,255,255,0.4)',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Activity size={12} style={{ color: '#ff6568' }} />
                      <span>BullMQ Queue Telemetry</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <span style={{ color: '#ff6568' }}>QUEUE:</span> judge-submissions<br />
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Status: Active · Concurrency: 2</span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem' }}>
                        → [POST /api/submissions]<br />
                        → [Worker dequeues & spawns Process]<br />
                        <span style={{ color: '#05df72' }}>→ [Client polling: 200 OK (Accepted)]</span>
                      </div>
                    </div>
                  </div>
                )}

                {item.visualType === 'blind' && (
                  <div>
                    <div
                      style={{
                        color: 'rgba(255,255,255,0.4)',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Lock size={12} style={{ color: '#fbbf24' }} />
                      <span>Blind Mode Environment</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.65rem' }}>
                      <div
                        style={{
                          backgroundColor: 'rgba(251, 191, 36, 0.08)',
                          padding: '0.45rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(251, 191, 36, 0.2)',
                          color: '#fde047',
                        }}
                      >
                        ● LIVE TIMER: 00:45:00
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        ✓ Hidden tag labels masked<br />
                        ✓ Output diffs sanitized<br />
                        ✓ Monitored tab blur events
                      </div>
                    </div>
                  </div>
                )}

                {item.visualType === 'security' && (
                  <div>
                    <div
                      style={{
                        color: 'rgba(255,255,255,0.4)',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <ShieldCheck size={12} style={{ color: '#05df72' }} />
                      <span>Linux Isolation Matrix</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.2rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>user:</span>
                        <span style={{ color: '#05df72' }}>runner (UID 1001)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.2rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>pids:</span>
                        <span style={{ color: '#38bdf8' }}>max 64 (ulimit -u)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>fsize:</span>
                        <span style={{ color: '#a78bfa' }}>64 MB (ulimit -f)</span>
                      </div>
                    </div>
                  </div>
                )}

                {item.visualType === 'compiler' && (
                  <div>
                    <div
                      style={{
                        color: 'rgba(255,255,255,0.4)',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Terminal size={12} style={{ color: '#4dabf7' }} />
                      <span>Dual Runtime Configuration</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.45rem', borderRadius: '4px' }}>
                        <span style={{ color: '#4dabf7' }}>C++17:</span> g++ -O2 -std=c++17 -Wall<br />
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Fast I/O & bits/stdc++.h</span>
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.45rem', borderRadius: '4px' }}>
                        <span style={{ color: '#05df72' }}>Python 3.11:</span> cpython-3.11.8<br />
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Standard library bounds</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
