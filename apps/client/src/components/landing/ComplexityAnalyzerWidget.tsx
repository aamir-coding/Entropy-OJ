import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, BarChart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ComplexityAnalyzerWidget: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalyzing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
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
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          backgroundColor: '#0c0c0c',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f7f7f7', fontWeight: 600 }}>
          <BarChart size={15} style={{ color: '#05df72' }} />
          <span>Post-AC Analytics</span>
        </div>
        <span
          style={{
            fontSize: '0.65rem',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          BullMQ Async Worker
        </span>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <Loader2 size={24} className="animate-spin" style={{ color: '#05df72' }} />
              <span>Analyzing AST and telemetry metrics...</span>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  marginBottom: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                <ShieldCheck size={14} style={{ color: '#05df72' }} />
                <span>Classification Report</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontFamily: "var(--font-mono, monospace)", fontSize: '0.82rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '0.6rem',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Time Complexity:</span>
                  <span style={{ color: '#05df72', fontWeight: 600, backgroundColor: 'rgba(5, 223, 114, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>O(N)</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '0.6rem',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Auxiliary Space:</span>
                  <span style={{ color: '#eab308', fontWeight: 600, backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>O(N) Map</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Detected Pattern:</span>
                  <span style={{ color: '#4dabf7', fontWeight: 600, backgroundColor: 'rgba(77, 171, 247, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Hash Map / 1-Pass</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* ── Footer ── */}
      <div
        style={{
          padding: '0.6rem 1.25rem',
          backgroundColor: '#040404',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontFamily: "var(--font-mono, monospace)",
          fontSize: '0.65rem',
          color: 'rgba(255, 255, 255, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>Two Sum - Sub ID: 893247</span>
        <button 
          onClick={() => setAnalyzing(true)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.65rem' }}>
          Re-Analyze
        </button>
      </div>
    </div>
  );
};
