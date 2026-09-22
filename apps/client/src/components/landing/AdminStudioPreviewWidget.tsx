import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import {
  FileText,
  Play,
  Sparkles,
  CheckCircle2,
  Code2,
  ShieldCheck,
  Loader2,
  FileCheck2,
  Send,
  RotateCcw,
  Terminal,
} from 'lucide-react';

const VALIDATOR_TEST_CASES = [
  { id: 'TC #01', type: 'Sample 1', input: 'nums = [2, 7, 11, 15], target = 9', time: '12ms' },
  { id: 'TC #02', type: 'Negative Values', input: 'nums = [-3, 4, 3, 90], target = 0', time: '14ms' },
  { id: 'TC #03', type: 'Scale Boundary', input: 'Boundary stress suite (N = 10,000 elements)', time: '38ms' },
  { id: 'TC #04-15', type: 'Adversarial Suite', input: '11 hidden adversarial edge cases & duplicates', time: '42ms' },
];

const STATEMENT_MARKDOWN = `### Problem Description
Given an array of integers \`nums\` and an integer \`target\`, return indices of two numbers such that:
$$\\text{nums}[i] + \\text{nums}[j] = \\text{target} \\quad (i \\neq j)$$

You may assume that each input has **exactly one valid solution**.

### Mathematical Constraints
- Array length: $2 \\le N \\le 10^4$
- Value bounds: $-10^9 \\le \\text{nums}[i], \\text{target} \\le 10^9$
- Complexity ceiling: $\\mathcal{O}(N)$ single-pass hash map, CPU limit $\\le 1000\\text{ms}$
`;

const REFERENCE_PYTHON = `def solve(nums: list[int], target: int) -> list[int]:
    # Single-pass hash map: O(N) time and O(N) space
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []
`;

export const AdminStudioPreviewWidget: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'statement' | 'validator' | 'qa'>('statement');
  const [valState, setValState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [valStep, setValStep] = useState<number>(0);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  React.useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  const handleRunValidation = () => {
    clearAllTimers();
    setValState('running');
    setValStep(0);

    const t1 = setTimeout(() => {
      setValStep(1);
    }, 320);

    const t2 = setTimeout(() => {
      setValStep(2);
    }, 640);

    const t3 = setTimeout(() => {
      setValStep(3);
    }, 1000);

    const t4 = setTimeout(() => {
      setValStep(4);
      setValState('completed');
    }, 1400);

    timersRef.current = [t1, t2, t3, t4];
  };

  return (
    <div
      className="admin-studio-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '480px',
        backgroundColor: '#070707',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        overflow: 'hidden',
        fontFamily: "var(--font-sans, 'Inter', sans-serif)",
        color: '#f7f7f7',
        boxShadow: '0 24px 48px -18px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.04)',
      }}
    >
      <style>{`
        @media (max-width: 800px) {
          .admin-studio-container {
            height: auto !important;
            min-height: 0 !important;
          }
          .admin-studio-viewport {
            height: auto !important;
            overflow: visible !important;
            padding: 0.85rem 0.75rem !important;
          }
          .admin-studio-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            min-height: 0 !important;
            gap: 1rem !important;
            overflow: visible !important;
          }
          .admin-studio-qa-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            min-height: 0 !important;
            overflow-y: visible !important;
          }
          .admin-studio-header-wrap {
            flex-wrap: wrap !important;
            gap: 0.6rem !important;
            padding: 0.5rem 0.85rem !important;
          }
        }
        @media (max-width: 640px) {
          .admin-studio-hide-mobile {
            display: none !important;
          }
          .desktop-tab-label {
            display: none !important;
          }
          .mobile-tab-label {
            display: inline !important;
          }
        }
        @media (min-width: 641px) {
          .mobile-tab-label {
            display: none !important;
          }
        }
      `}</style>

      {/* ── 1. STUDIO HEADER & UNBROKEN NAVIGATION ── */}
      <div
        className="admin-studio-header-wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.25rem',
          backgroundColor: '#0c0c0c',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          gap: '1rem',
        }}
      >
        {/* Left: Problem Identity & Categorization */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(167, 139, 250, 0.12)',
              border: '1px solid rgba(167, 139, 250, 0.25)',
              color: '#a78bfa',
            }}
          >
            <FileCheck2 size={15} />
          </div>

          <span style={{ fontWeight: 600, fontSize: '0.92rem', letterSpacing: '-0.01em', color: '#ffffff' }}>
            Two Sum
          </span>

          <span
            className="admin-studio-hide-mobile"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: '0.72rem',
              color: 'rgba(255, 255, 255, 0.4)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              padding: '0.1rem 0.4rem',
              borderRadius: '3px',
            }}
          >
            two-sum
          </span>

          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 600,
              padding: '0.12rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(5, 223, 114, 0.12)',
              color: '#05df72',
              border: '1px solid rgba(5, 223, 114, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Easy
          </span>

          <span
            className="admin-studio-hide-mobile"
            style={{
              fontSize: '0.68rem',
              padding: '0.12rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'rgba(255, 255, 255, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            Array · Hash Table
          </span>
        </div>

        {/* Center: Spacious Workspace Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '3px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            onClick={() => setActiveSubTab('statement')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.35rem 0.8rem',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              backgroundColor: activeSubTab === 'statement' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'statement' ? '#000000' : 'rgba(255, 255, 255, 0.65)',
            }}
          >
            <FileText size={13} />
            <span className="desktop-tab-label">KaTeX Statement</span>
            <span className="mobile-tab-label">KaTeX</span>
          </button>

          <button
            onClick={() => setActiveSubTab('validator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.35rem 0.8rem',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              backgroundColor: activeSubTab === 'validator' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'validator' ? '#000000' : 'rgba(255, 255, 255, 0.65)',
            }}
          >
            <Play size={13} />
            <span className="desktop-tab-label">Pre-Flight Sandbox</span>
            <span className="mobile-tab-label">Sandbox</span>
          </button>

          <button
            onClick={() => setActiveSubTab('qa')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.35rem 0.8rem',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              backgroundColor: activeSubTab === 'qa' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'qa' ? '#000000' : 'rgba(255, 255, 255, 0.65)',
            }}
          >
            <Sparkles size={13} style={{ color: activeSubTab === 'qa' ? '#7c3aed' : '#a78bfa' }} />
            <span className="desktop-tab-label">Gemini Flash QA</span>
            <span className="mobile-tab-label">Gemini QA</span>
          </button>
        </div>

        {/* Right: Authoring Pipeline Status & Publish */}
        <div className="admin-studio-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#05df72' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#05df72' }} />
            <span style={{ fontWeight: 500 }}>Ready to Publish</span>
          </div>

          <button
            type="button"
            title="Demo button: Problem authoring completed"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 500,
              cursor: 'default',
            }}
          >
            <Send size={11} />
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* ── 2. TAB CONTENT VIEWPORTS ── */}
      <div
        className="admin-studio-viewport"
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem 1.25rem',
          overflow: 'hidden',
        }}
      >
        {/* ── SUBTAB 1: KaTeX Statement & Live Math Rendering ── */}
        {activeSubTab === 'statement' && (
          <div
            className="admin-studio-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '1rem',
              height: '100%',
              minHeight: 0,
            }}
          >
            {/* Left Pane: Raw LaTeX Input */}
            <div
              style={{
                backgroundColor: '#090909',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.45)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Raw Markdown + LaTeX Input
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  remark-math / KaTeX
                </span>
              </div>

              <pre
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  lineHeight: 1.6,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: "var(--font-mono, monospace)",
                  overflowY: 'auto',
                  flex: 1,
                  minHeight: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {STATEMENT_MARKDOWN}
              </pre>
            </div>

            {/* Right Pane: Live KaTeX Output */}
            <div
              style={{
                backgroundColor: '#090909',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    color: '#05df72',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  Live Rendered View (KaTeX Math)
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                  <span>1000ms CPU</span>
                  <span>·</span>
                  <span>256MB RAM</span>
                </div>
              </div>

              <div
                className="markdown-statement"
                style={{
                  fontSize: '0.84rem',
                  lineHeight: 1.6,
                  color: '#e5e5e5',
                  overflowY: 'auto',
                  flex: 1,
                  minHeight: 0,
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {STATEMENT_MARKDOWN}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBTAB 2: Pre-Flight Sandbox Validator ── */}
        {activeSubTab === 'validator' && (
          <div
            className="admin-studio-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '1rem',
              height: '100%',
              minHeight: 0,
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Left Pane: Model Solution Code */}
            <div
              style={{
                backgroundColor: '#090909',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                minWidth: 0,
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.65rem',
                  flexShrink: 0,
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                  <Code2 size={14} style={{ color: '#38bdf8', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Reference Model Solution (Python 3.11)
                  </span>
                </div>

                <button
                  onClick={handleRunValidation}
                  disabled={valState === 'running'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.28rem 0.65rem',
                    borderRadius: '4px',
                    backgroundColor: valState === 'running' ? 'rgba(56, 189, 248, 0.15)' : '#05df72',
                    color: valState === 'running' ? '#38bdf8' : '#000000',
                    border: valState === 'running' ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
                    cursor: valState === 'running' ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  {valState === 'running' ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Sandboxing ({valStep + 1}/4)...</span>
                    </>
                  ) : valState === 'completed' ? (
                    <>
                      <RotateCcw size={12} />
                      <span>Re-Run Validation</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} fill="#000000" />
                      <span>Run Pre-Flight Validation</span>
                    </>
                  )}
                </button>
              </div>

              <pre
                style={{
                  margin: 0,
                  fontSize: '0.78rem',
                  lineHeight: 1.55,
                  color: '#94a3b8',
                  fontFamily: "var(--font-mono, monospace)",
                  overflowX: 'auto',
                  overflowY: 'auto',
                  flex: 1,
                  minHeight: '120px',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {REFERENCE_PYTHON}
              </pre>
            </div>

            {/* Right Pane: Direct Process Sandbox Diagnostics */}
            <div
              style={{
                backgroundColor: '#090909',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                minHeight: 0,
                minWidth: 0,
                maxWidth: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.4rem',
                  flexShrink: 0,
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.72rem',
                    color: 'rgba(255, 255, 255, 0.45)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Sandbox Execution Diagnostics
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: valState === 'running' ? '#38bdf8' : valState === 'completed' ? '#05df72' : 'rgba(255, 255, 255, 0.45)',
                    fontFamily: 'var(--font-mono, monospace)',
                    flexShrink: 0,
                  }}
                >
                  {valState === 'running' ? '● Sandbox Active (UID 1001)' : valState === 'completed' ? '● Sandbox Verified (UID 1001)' : 'Sandbox Standby (UID 1001)'}
                </span>
              </div>

              {/* Verdict Summary Card */}
              {valState === 'idle' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    flexShrink: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: '1 1 200px' }}>
                    <Terminal size={20} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ffffff' }}>
                        PRE-FLIGHT VALIDATOR READY
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.4 }}>
                        Click &quot;Run Pre-Flight Validation&quot; to execute reference solution in isolated runner
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)', flexShrink: 0 }}>
                    <div>CPU Limit: <strong style={{ color: '#ffffff' }}>1000 ms</strong></div>
                    <div>Memory Limit: <strong style={{ color: '#ffffff' }}>256 MB</strong></div>
                  </div>
                </div>
              )}

              {valState === 'running' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    flexShrink: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: '1 1 200px' }}>
                    <Loader2 size={20} className="animate-spin" style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#38bdf8' }}>
                        EXECUTING TEST SUITES ({valStep}/4 Passed)...
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.4 }}>
                        Evaluating reference solution in unprivileged runner sandbox (UID 1001)
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)', flexShrink: 0 }}>
                    <div>Sandbox: <strong style={{ color: '#38bdf8' }}>Isolated (PID 4821)</strong></div>
                    <div>Status: <strong style={{ color: '#38bdf8' }}>Testing TC #{Math.min(valStep + 1, 4)}</strong></div>
                  </div>
                </div>
              )}

              {valState === 'completed' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.65rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(5, 223, 114, 0.08)',
                    border: '1px solid rgba(5, 223, 114, 0.25)',
                    flexShrink: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: '1 1 200px' }}>
                    <CheckCircle2 size={20} style={{ color: '#05df72', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#05df72' }}>
                        ACCEPTED · All 15 Test Cases Passed
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.4 }}>
                        Zero runtime errors, time limit violations, or memory leaks
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)', flexShrink: 0 }}>
                    <div>Max CPU Time: <strong style={{ color: '#ffffff' }}>42 ms</strong></div>
                    <div>Peak Memory: <strong style={{ color: '#ffffff' }}>18.2 MB</strong></div>
                  </div>
                </div>
              )}

              {/* Spacious Test Case Rows */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  flex: 1,
                  minHeight: '120px',
                  overflowY: 'auto',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {VALIDATOR_TEST_CASES.map((tc, idx) => {
                  let statusBadge: React.ReactNode;
                  let timeBadge: React.ReactNode = (
                    <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'var(--font-mono, monospace)' }}>--</span>
                  );
                  let rowBg = 'rgba(255, 255, 255, 0.025)';
                  let rowBorder = 'rgba(255, 255, 255, 0.06)';

                  if (valState === 'idle') {
                    statusBadge = (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          color: 'rgba(255, 255, 255, 0.4)',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                        }}
                      >
                        Queued
                      </span>
                    );
                  } else if (valState === 'running') {
                    if (idx < valStep) {
                      statusBadge = <span style={{ color: '#05df72', fontWeight: 600 }}>Passed</span>;
                      timeBadge = (
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-mono, monospace)' }}>
                          {tc.time}
                        </span>
                      );
                    } else if (idx === valStep) {
                      rowBg = 'rgba(56, 189, 248, 0.06)';
                      rowBorder = 'rgba(56, 189, 248, 0.25)';
                      statusBadge = (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontWeight: 600 }}>
                          <Loader2 size={11} className="animate-spin" />
                          <span>Testing...</span>
                        </div>
                      );
                      timeBadge = (
                        <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.68rem' }}>
                          evaluating...
                        </span>
                      );
                    } else {
                      statusBadge = (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          Queued
                        </span>
                      );
                    }
                  } else {
                    statusBadge = <span style={{ color: '#05df72', fontWeight: 600 }}>Passed</span>;
                    timeBadge = (
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'var(--font-mono, monospace)' }}>
                        {tc.time}
                      </span>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '5px',
                        backgroundColor: rowBg,
                        border: `1px solid ${rowBorder}`,
                        fontSize: '0.72rem',
                        transition: 'all 150ms ease',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', color: '#38bdf8', fontWeight: 600, flexShrink: 0 }}>
                          {tc.id}
                        </span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0 }}>({tc.type})</span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.input}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                        {statusBadge}
                        {timeBadge}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── SUBTAB 3: Gemini 2.5 Flash QA Audit (3-Column Spacious Grid) ── */}
        {activeSubTab === 'qa' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              height: '100%',
              minHeight: 0,
            }}
          >
            {/* Top Auditor Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(167, 139, 250, 0.08)',
                border: '1px solid rgba(167, 139, 250, 0.2)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <Sparkles size={16} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3e8ff' }}>
                  Gemini 2.5 Flash Problem Quality Auditor
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.72rem' }}>
                <span style={{ color: '#05df72', fontWeight: 600 }}>Problem Quality Score: 98/100</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>·</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Deterministic Read-only Review</span>
              </div>
            </div>

            {/* 3 Spacious Side-by-Side Audit Cards */}
            <div
              className="admin-studio-qa-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '1rem',
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* Card 1: LaTeX Syntax */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#090909',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#05df72' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#05df72' }}>
                    LaTeX Math Syntax
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.76rem', lineHeight: 1.55, color: 'rgba(255, 255, 255, 0.7)' }}>
                  All formula delimiters ($..$, $$..$$) are properly closed and valid under KaTeX grammar. Equations render cleanly across high-DPI displays.
                </p>
                <div style={{ marginTop: 'auto', fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-mono, monospace)' }}>
                  ✓ 0 parsing warnings detected
                </div>
              </div>

              {/* Card 2: Constraint Boundary */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#090909',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckCircle2 size={16} style={{ color: '#38bdf8' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8' }}>
                    Constraint Boundaries
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.76rem', lineHeight: 1.55, color: 'rgba(255, 255, 255, 0.7)' }}>
                  The upper bound $N \le 10^4$ ensures an $O(N)$ single-pass solution executes in ~42ms, well within the 1000ms CPU limit with a 20x safety margin.
                </p>
                <div style={{ marginTop: 'auto', fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-mono, monospace)' }}>
                  ✓ Time limit calibration: Optimal
                </div>
              </div>

              {/* Card 3: Adversarial Coverage */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: '#090909',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={16} style={{ color: '#a78bfa' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a78bfa' }}>
                    Adversarial Edge Cases
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.76rem', lineHeight: 1.55, color: 'rgba(255, 255, 255, 0.7)' }}>
                  Test suites explicitly include identical values (e.g. <code>[3, 3], target=6</code> to verify no element index self-reuse), negative numbers, and 32-bit limits.
                </p>
                <div style={{ marginTop: 'auto', fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-mono, monospace)' }}>
                  ✓ Comprehensive suite coverage
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. FOOTER TELEMETRY ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.55rem 1.25rem',
          backgroundColor: '#090909',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.7rem',
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'var(--font-mono, monospace)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: valState === 'running' ? '#38bdf8' : '#05df72' }}>●</span>
          <span>{valState === 'running' ? 'SANDBOX: EXECUTING PRE-FLIGHT' : 'ADMIN_PIPELINE: READY'}</span>
          <span>·</span>
          <span>AUTOSAVE: DETERMINISTIC REVIEW</span>
        </div>
        <div>
          <span>{valState === 'running' ? 'REVISION: v2.4-PRE-FLIGHT-IN-PROGRESS' : 'REVISION: v2.4-PRE-FLIGHT-VALIDATED'}</span>
        </div>
      </div>
    </div>
  );
};
