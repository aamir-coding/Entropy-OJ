import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layers,
  FileCheck2,
  Cpu,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Pause,
  Activity,
  Sparkles,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';

interface BentoItem {
  id: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  accent: string;
  badge: string;
  highlights: string[];
  visualType: 'queue' | 'auditor' | 'classifier' | 'compiler';
}

const BENTO_ITEMS: BentoItem[] = [
  {
    id: 'queue',
    icon: Layers,
    tag: 'DISTRIBUTED QUEUE',
    title: 'BullMQ & Redis Asynchronous Pipeline',
    description:
      'Decouples heavy compilation and Docker container lifecycles from HTTP API threads. Provides dedicated priority queues, bounded worker concurrency, and resilient exponential-backoff polling.',
    accent: '#ff6568',
    badge: 'BullMQ 5 · Redis 7',
    highlights: [
      'Worker concurrency limits (c: 2 per node)',
      'Exponential backoff polling with smart jitter',
      'Zero HTTP thread blocking during compile',
    ],
    visualType: 'queue',
  },
  {
    id: 'auditor',
    icon: FileCheck2,
    tag: 'ADMIN PROBLEM STUDIO',
    title: 'AI Problem Setter QA Auditor',
    description:
      'Audits statement clarity, constraints, and test suites using Gemini 2.5 Flash (~1M context window) to catch ambiguities, missing edge cases, and adversarial O(N²) stress tests before release.',
    accent: '#a78bfa',
    badge: 'Gemini 2.5 Flash · 1M Context',
    highlights: [
      'Automated anti-hash & O(N²) stress test injection',
      'LaTeX math syntax & formula repair engine',
      'Pre-flight Docker sandbox model validation',
    ],
    visualType: 'auditor',
  },
  {
    id: 'classifier',
    icon: Cpu,
    tag: 'BACKGROUND WORKER',
    title: 'Post-AC Algorithmic Pattern & Complexity Classifier',
    description:
      'Automatically triggers upon an Accepted verdict via an asynchronous BullMQ queue worker. Analyzes the submission to classify Big-O time/space complexity and algorithmic paradigm.',
    accent: '#05df72',
    badge: 'Automated Post-AC Analysis',
    highlights: [
      'Rigorous Big-O time & space breakdown',
      'Algorithmic paradigm identification',
      'Curated follow-up challenge recommendations',
    ],
    visualType: 'classifier',
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
      'Strict 256MB cgroup memory ceiling',
      'Microsecond Linux rusage user+sys telemetry',
    ],
    visualType: 'compiler',
  },
];

// Infinite track clone array: [Clone of 3, Item 0, Item 1, Item 2, Item 3, Clone of 0]
const EXTENDED_ITEMS: BentoItem[] = [
  BENTO_ITEMS[3],
  BENTO_ITEMS[0],
  BENTO_ITEMS[1],
  BENTO_ITEMS[2],
  BENTO_ITEMS[3],
  BENTO_ITEMS[0],
];

const AUTOPLAY_INTERVAL = 4500; // 4.5 seconds per card
const USER_PAUSE_RESUME_DELAY = 6000; // 6 seconds before resuming after manual interaction

export const BentoGrid: React.FC = () => {
  // Start at trackIndex 1 (corresponding to BENTO_ITEMS[0])
  const [trackIndex, setTrackIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const isMovingRef = useRef(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active display index in [0, 3] range
  const activeDisplayIndex =
    trackIndex === 0
      ? 3
      : trackIndex === 5
      ? 0
      : trackIndex - 1;

  const currentItem = BENTO_ITEMS[activeDisplayIndex];

  // Move to next slide (0ms instant transition trigger)
  const handleNext = useCallback(() => {
    if (isMovingRef.current) return;
    isMovingRef.current = true;
    setIsTransitioning(true);
    setTrackIndex((prev) => prev + 1);
    setProgress(0);
  }, []);

  // Move to previous slide
  const handlePrev = useCallback(() => {
    if (isMovingRef.current) return;
    isMovingRef.current = true;
    setIsTransitioning(true);
    setTrackIndex((prev) => prev - 1);
    setProgress(0);
  }, []);

  // Handle wrap-around when transition finishes
  const handleTransitionEnd = () => {
    isMovingRef.current = false;

    if (trackIndex === 5) {
      // Reached clone of Item 0 at end: snap to real Item 0 (index 1) without animation
      setIsTransitioning(false);
      setTrackIndex(1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    } else if (trackIndex === 0) {
      // Reached clone of Item 3 at start: snap to real Item 3 (index 4) without animation
      setIsTransitioning(false);
      setTrackIndex(4);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    }
  };

  // User manual interaction wrapper
  const handleUserInteraction = useCallback(
    (action: () => void) => {
      action();
      setIsUserPaused(true);

      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }

      pauseTimeoutRef.current = setTimeout(() => {
        setIsUserPaused(false);
      }, USER_PAUSE_RESUME_DELAY);
    },
    []
  );

  const goToSlide = (dotIndex: number) => {
    if (isMovingRef.current) return;
    isMovingRef.current = true;
    setIsTransitioning(true);
    setTrackIndex(dotIndex + 1);
    setProgress(0);
  };

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleUserInteraction(handleNext);
      } else if (e.key === 'ArrowLeft') {
        handleUserInteraction(handlePrev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleUserInteraction]);

  // Autoplay timer
  useEffect(() => {
    if (isHovered || isUserPaused) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    const stepMs = 50;
    const progressStep = (stepMs / AUTOPLAY_INTERVAL) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev + progressStep >= 100) {
          handleNext();
          return 0;
        }
        return prev + progressStep;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isHovered, isUserPaused, handleNext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        marginTop: '3rem',
        marginBottom: '3.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', maxWidth: '680px' }}>
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
          Explore the core engineering pillars powering the evaluation pipeline.
        </p>
      </div>

      {/* Carousel Outer Wrapper */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          maxWidth: '920px',
          position: 'relative',
        }}
      >
        {/* Navigation Bar / Controls Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            padding: '0 0.25rem',
          }}
        >
          {/* Active card indicator & pause status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: '0.72rem',
                color: '#f7f7f7',
                fontWeight: 600,
              }}
            >
              0{activeDisplayIndex + 1}{' '}
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>/ 0{BENTO_ITEMS.length}</span>
            </span>

            {(isHovered || isUserPaused) && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '3px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.62rem',
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                <Pause size={9} /> PAUSED
              </span>
            )}
          </div>

          {/* Left & Right Arrow Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => handleUserInteraction(handlePrev)}
              aria-label="Previous capability card"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f7f7f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => handleUserInteraction(handleNext)}
              aria-label="Next capability card"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f7f7f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Continuous Sliding Viewport */}
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            borderRadius: '12px',
            position: 'relative',
          }}
        >
          {/* Sliding Track */}
          <div
            onTransitionEnd={handleTransitionEnd}
            style={{
              display: 'flex',
              width: '100%',
              transform: `translate3d(-${trackIndex * 100}%, 0, 0)`,
              transition: isTransitioning
                ? 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)'
                : 'none',
              willChange: 'transform',
            }}
          >
            {EXTENDED_ITEMS.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  style={{
                    minWidth: '100%',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    onClick={() => handleUserInteraction(() => {})}
                    style={{
                      backgroundColor: '#070707',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '2rem',
                      boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 30px ${item.accent}10`,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                      gap: '2rem',
                      alignItems: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'default',
                    }}
                  >
                    {/* Left Panel: Information */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '8px',
                              backgroundColor: `${item.accent}15`,
                              border: `1px solid ${item.accent}35`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconComponent size={17} style={{ color: item.accent }} />
                          </div>
                          <span
                            style={{
                              fontFamily: "var(--font-mono, monospace)",
                              fontSize: '0.66rem',
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
                            fontSize: '0.65rem',
                            color: 'rgba(255, 255, 255, 0.45)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                        >
                          {item.badge}
                        </span>
                      </div>

                      <h4
                        style={{
                          margin: '0.2rem 0',
                          fontSize: '1.45rem',
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
                          fontSize: '0.85rem',
                          lineHeight: '1.65',
                          color: 'rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        {item.description}
                      </p>

                      {/* Highlights */}
                      <div
                        style={{
                          marginTop: '0.4rem',
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
                              fontSize: '0.74rem',
                              color: 'rgba(255, 255, 255, 0.55)',
                            }}
                          >
                            <span style={{ color: item.accent, fontSize: '0.8rem' }}>•</span>
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Panel: Architecture Visualizer */}
                    <div
                      style={{
                        backgroundColor: '#0a0a0a',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '1.25rem',
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: '0.72rem',
                        lineHeight: '1.6',
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
                              <span style={{ color: '#ff6568' }}>QUEUE:</span> judge-submissions
                              <br />
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                                Status: Active · Concurrency: 2
                              </span>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.68rem' }}>
                              → [POST /api/submissions]
                              <br />
                              → [Job enqueued with TTL 120s]
                              <br />
                              → [Worker dequeues & spawns Docker]
                              <br />
                              <span style={{ color: '#05df72' }}>→ [Client polling: 200 OK (Accepted)]</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {item.visualType === 'auditor' && (
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
                            <Sparkles size={12} style={{ color: '#a78bfa' }} />
                            <span>Gemini Flash QA Auditor Output</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            <div style={{ color: '#05df72' }}>✓ Constraint bounds validated (N ≤ 10^5)</div>
                            <div style={{ color: '#05df72' }}>✓ KaTeX formulas verified (O(N log N))</div>
                            <div style={{ color: '#f59e0b' }}>
                              ! Adversarial stress test added: [All duplicate elements]
                            </div>
                            <div
                              style={{
                                color: 'rgba(255,255,255,0.4)',
                                marginTop: '0.3rem',
                                fontSize: '0.65rem',
                              }}
                            >
                              Audited across statement, editorial & model code in 340ms
                            </div>
                          </div>
                        </div>
                      )}

                      {item.visualType === 'classifier' && (
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
                            <ShieldCheck size={12} style={{ color: '#05df72' }} />
                            <span>Post-AC Classification Dispatch</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                paddingBottom: '0.3rem',
                              }}
                            >
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Time Complexity:</span>
                              <span style={{ color: '#05df72', fontWeight: 600 }}>O(N log N)</span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                paddingBottom: '0.3rem',
                              }}
                            >
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Auxiliary Space:</span>
                              <span style={{ color: '#05df72', fontWeight: 600 }}>O(1) Auxiliary</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Detected Pattern:</span>
                              <span style={{ color: '#4dabf7' }}>Binary Search / Divide & Conquer</span>
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
                            <div
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                padding: '0.45rem',
                                borderRadius: '4px',
                              }}
                            >
                              <span style={{ color: '#4dabf7' }}>C++17:</span> g++ -O2 -std=c++17 -Wall
                              <br />
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Fast I/O & bits/stdc++.h</span>
                            </div>
                            <div
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                padding: '0.45rem',
                                borderRadius: '4px',
                              }}
                            >
                              <span style={{ color: '#05df72' }}>Python 3.11:</span> cpython-3.11.8
                              <br />
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                                Standard library + rusage bounds
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots & Progress Line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          {BENTO_ITEMS.map((item, idx) => {
            const isCurrent = idx === activeDisplayIndex;
            return (
              <button
                key={item.id}
                onClick={() => handleUserInteraction(() => goToSlide(idx))}
                aria-label={`Go to slide ${idx + 1}: ${item.title}`}
                style={{
                  position: 'relative',
                  width: isCurrent ? '48px' : '20px',
                  height: '5px',
                  borderRadius: '9999px',
                  backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  overflow: 'hidden',
                  transition: 'all 250ms ease',
                }}
              >
                {/* Active animated progress bar inside the pill */}
                {isCurrent && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${progress}%`,
                      backgroundColor: currentItem.accent,
                      borderRadius: '9999px',
                      transition: isHovered || isUserPaused ? 'none' : 'width 50ms linear',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
