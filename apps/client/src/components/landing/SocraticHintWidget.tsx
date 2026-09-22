import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lightbulb,
  Loader2,
  ShieldCheck,
  RotateCcw,
  XCircle,
  Terminal,
} from 'lucide-react';
import { EntropyAiIcon } from '../icons/EntropyAiIcon';

const SAMPLE_SOCRATIC_HINT =
  'Your solution returned identical indices [0, 0]. Notice your map lookup order: if you insert nums[i] into the map before checking if target - nums[i] exists, what happens when target = 6 and nums[i] = 3? Can an element match against itself?';

export const SocraticHintWidget: React.FC = () => {
  const [hintState, setHintState] = useState<'unrun' | 'loading' | 'delivered'>('unrun');

  const handleRequestHint = () => {
    setHintState('loading');
    setTimeout(() => {
      setHintState('delivered');
    }, 750);
  };

  const handleReset = () => {
    setHintState('unrun');
  };

  return (
    <div
      className="socratic-hint-container"
      style={{
        backgroundColor: '#070707',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 24px 48px -18px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        fontFamily: "var(--font-sans, 'Inter', sans-serif)",
        fontSize: '0.78rem',
        height: '350px',
        minHeight: '350px',
        maxHeight: '350px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @media (max-width: 600px) {
          .socratic-hint-container {
            height: auto !important;
            max-height: none !important;
            min-height: 340px !important;
          }
          .socratic-diagnostic-strip {
            grid-template-columns: 1fr !important;
            gap: 0.45rem !important;
          }
        }
      `}</style>

      {/* ── Console Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1rem',
          backgroundColor: '#0c0c0c',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f56', opacity: 0.85 }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbd2e', opacity: 0.85 }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27c93f', opacity: 0.85 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.68rem', fontFamily: "var(--font-mono, 'Geist Mono', monospace)" }}>
            <Terminal size={11} style={{ color: 'rgba(255, 255, 255, 0.35)' }} />
            <span>Test Runner · Two Sum · Testcase #4</span>
          </div>
        </div>

        {/* Verdict Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          <XCircle size={11} />
          <span>WRONG ANSWER</span>
        </div>
      </div>

      {/* ── Testcase Diagnostic Failure Strip ── */}
      <div
        className="socratic-diagnostic-strip"
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: '#040404',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
          fontSize: '0.7rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.6rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.62rem' }}>INPUT</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>nums = [2, 7, 11, 15], target = 9</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.62rem' }}>OUTPUT MISMATCH</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: '#ef4444' }}>Actual: [0, 0]</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>/</span>
            <span style={{ color: '#05df72' }}>Expected: [0, 1]</span>
          </div>
        </div>
      </div>

      {/* ── Socratic Copilot Interactive Area ── */}
      <div style={{ flex: 1, minHeight: 0, padding: '0.85rem 1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {hintState === 'unrun' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
            <button
              id="btn-request-ai-hint"
              onClick={handleRequestHint}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                backgroundColor: 'rgba(234, 179, 8, 0.06)',
                color: '#eab308',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.4)';
              }}
            >
              <Lightbulb size={16} />
              <span>Get Socratic Debug Hint 💡</span>
            </button>

            <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.68rem', textAlign: 'center' }}>
              Unlike ChatGPT, Entropy will not spoil the code. It guides your diagnosis using progressive Socratic inquiry.
            </div>
          </div>
        )}

        {hintState === 'loading' && (
          <div
            style={{
              padding: '1.2rem',
              backgroundColor: 'rgba(234, 179, 8, 0.04)',
              border: '1px solid rgba(234, 179, 8, 0.2)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              color: '#eab308',
              fontSize: '0.82rem',
              fontWeight: 500,
            }}
          >
            <Loader2 size={18} className="animate-spin" />
            <span>Consulting Socratic Tutor...</span>
          </div>
        )}

        {hintState === 'delivered' && (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                backgroundColor: '#080808',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                borderRadius: '6px',
                padding: '0.85rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {/* In-app Socratic Card Titlebar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.45rem',
                  borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#eab308', fontWeight: 600, fontSize: '0.8rem' }}>
                  <Lightbulb size={15} />
                  <span>Socratic Debug Hint</span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.62rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '3px',
                      marginLeft: '0.2rem',
                    }}
                  >
                    <EntropyAiIcon size={10} /> ENTROPY AI
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                  <span>19 hints left today</span>
                  <span
                    style={{
                      backgroundColor: 'rgba(234, 179, 8, 0.14)',
                      color: '#eab308',
                      border: '1px solid rgba(234, 179, 8, 0.25)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '3px',
                      fontSize: '0.62rem',
                      fontFamily: "var(--font-mono, monospace)",
                      fontWeight: 600,
                    }}
                  >
                    Powered by Groq
                  </span>
                </div>
              </div>

              {/* Socratic Hint Text */}
              <div
                style={{
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  color: '#f0f0f0',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '4px',
                  padding: '0.75rem 0.85rem',
                }}
              >
                {SAMPLE_SOCRATIC_HINT}
              </div>

              {/* AST Code-Stripping Security Guarantee Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.35rem',
                  fontSize: '0.65rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#05df72' }}>
                  <ShieldCheck size={12} />
                  <span>AST Code Stripper: 0 syntax blocks emitted</span>
                </div>

                <button
                  onClick={handleReset}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.35)',
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.35)')}
                >
                  <RotateCcw size={10} />
                  <span>Re-test</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

