import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, CheckCircle2, Terminal } from 'lucide-react';

type SandboxStatus = 'idle' | 'running' | 'completed';

interface LogEntry {
  time: string;
  tag: string;
  tagColor: string;
  message: string;
}

const LOG_SEQUENCE: LogEntry[] = [
  {
    time: '[19:37:01.002]',
    tag: 'INIT',
    tagColor: '#38bdf8',
    message: 'spawned disposable container (id: entropy-run-8f2e)',
  },
  {
    time: '[19:37:01.005]',
    tag: 'SEC',
    tagColor: '#05df72',
    message: 'jails locked: uid=1001 cap_drop=ALL rofs=true net=none',
  },
  {
    time: '[19:37:01.008]',
    tag: 'CGROUP',
    tagColor: '#38bdf8',
    message: 'cgroup v2 enforced: memory.max=256M, pids.max=64, cpu=0.5',
  },
  {
    time: '[19:37:01.011]',
    tag: 'EXEC',
    tagColor: '#f59e0b',
    message: 'evaluating solution.cpp against test cases (15/15)...',
  },
  {
    time: '[19:37:01.024]',
    tag: 'RUSAGE',
    tagColor: '#a78bfa',
    message: 'getrusage: user=10.8ms sys=1.6ms peak_rss=8,412KB',
  },
  {
    time: '[19:37:01.027]',
    tag: 'DONE',
    tagColor: '#05df72',
    message: 'verdict=ACCEPTED (all 15 test cases passed)',
  },
  {
    time: '[19:37:01.030]',
    tag: 'EXIT',
    tagColor: '#05df72',
    message: 'container purged in 3.8ms (0 byte host leak)',
  },
];

export const SandboxTelemetryWidget: React.FC = () => {
  const [status, setStatus] = useState<SandboxStatus>('idle');
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Blinking terminal cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Cleanup pending run timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleRun = () => {
    if (status === 'running') return;

    // Clear any previous execution timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setStatus('running');
    setVisibleLines(0);

    // Stream lines sequentially
    LOG_SEQUENCE.forEach((_, idx) => {
      const timer = setTimeout(() => {
        setVisibleLines(idx + 1);
      }, (idx + 1) * 150);
      timersRef.current.push(timer);
    });

    // Mark completion after all lines appear
    const completionTimer = setTimeout(() => {
      setStatus('completed');
    }, (LOG_SEQUENCE.length + 1) * 150);
    timersRef.current.push(completionTimer);
  };

  return (
    <div
      style={{
        backgroundColor: '#070707',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 24px 48px -18px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
        fontSize: '0.74rem',
        height: '340px',
        minHeight: '340px',
        maxHeight: '340px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Terminal Titlebar ── */}
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
        {/* Window controls & session tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f56', opacity: 0.85 }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbd2e', opacity: 0.85 }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27c93f', opacity: 0.85 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.68rem' }}>
            <Terminal size={11} style={{ color: 'rgba(255, 255, 255, 0.35)' }} />
            <span>entropy-worker · sandbox session</span>
          </div>
        </div>

        {/* Right Status Indicator & Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {status === 'idle' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.65rem',
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '0.04em',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
              READY
            </span>
          )}

          {status === 'running' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.65rem',
                color: '#f59e0b',
                letterSpacing: '0.04em',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#f59e0b', animation: 'pulse 1s infinite' }} />
              ISOLATING
            </span>
          )}

          {status === 'completed' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.65rem',
                color: '#05df72',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#05df72' }} />
              ACCEPTED
            </span>
          )}

          <button
            onClick={handleRun}
            disabled={status === 'running'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.22rem 0.65rem',
              borderRadius: '4px',
              backgroundColor: status === 'running' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.07)',
              border: `1px solid ${status === 'running' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.14)'}`,
              color: status === 'running' ? '#f59e0b' : '#ffffff',
              cursor: status === 'running' ? 'not-allowed' : 'pointer',
              fontSize: '0.68rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              if (status !== 'running') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (status !== 'running') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              }
            }}
          >
            {status === 'running' ? (
              <>
                <RotateCcw size={10} className="animate-spin" />
                <span>Running...</span>
              </>
            ) : status === 'completed' ? (
              <>
                <RotateCcw size={10} />
                <span>Re-run Test</span>
              </>
            ) : (
              <>
                <Play size={10} style={{ color: '#05df72' }} />
                <span>Run Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Terminal Body (Fixed Height, No Layout Shift) ── */}
      <div
        style={{
          height: '236px',
          padding: '1rem 1.1rem',
          backgroundColor: '#040404',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {status === 'idle' ? (
          /* ── Idle State: Clean Waiting Prompt ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', lineHeight: '1.6' }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              <span style={{ color: '#4dabf7' }}>$</span> entropy-judge --image entropy-runner:latest --isolate
            </div>

            <div style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '0.71rem' }}>
              Daemon ready · Linux kernel 6.6 · cgroup v2 · microsecond rusage
            </div>

            <div style={{ color: 'rgba(255, 255, 255, 0.45)', marginTop: '0.5rem', fontSize: '0.72rem' }}>
              Click <span style={{ color: '#05df72', fontWeight: 500 }}>"Run Test"</span> above to spawn an isolated container sandbox and stream execution telemetry.
              <span style={{ opacity: cursorVisible ? 1 : 0, color: '#4dabf7', marginLeft: '0.2rem' }}>_</span>
            </div>
          </div>
        ) : (
          /* ── Running & Completed State: Streaming Terminal ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', lineHeight: '1.5' }}>
            {/* Command line */}
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: '0.2rem', fontSize: '0.71rem' }}>
              <span style={{ color: '#4dabf7' }}>$</span> docker run --rm --network none --read-only -m 256m --pids-limit 64 oj-runner:latest
            </div>

            {/* Live streaming lines */}
            {LOG_SEQUENCE.slice(0, visibleLines).map((log, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.71rem' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.65rem', flexShrink: 0 }}>
                  {log.time}
                </span>
                <span
                  style={{
                    color: log.tagColor,
                    backgroundColor: `${log.tagColor}12`,
                    padding: '0.05rem 0.25rem',
                    borderRadius: '2px',
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                    flexShrink: 0,
                  }}
                >
                  {log.tag}
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.78)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {log.message}
                </span>
              </div>
            ))}

            {/* Trailing cursor while running */}
            {status === 'running' && (
              <div style={{ color: '#f59e0b', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                <span style={{ opacity: cursorVisible ? 1 : 0 }}>█</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>evaluating sandboxed process...</span>
              </div>
            )}
          </div>
        )}

        {/* Subtle Bottom Separator indicator */}
        <div />
      </div>

      {/* ── Status Bar (Vim/tmux-style minimalist 1-row HUD) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '36px',
          minHeight: '36px',
          maxHeight: '36px',
          padding: '0 1rem',
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.67rem',
          color: 'rgba(255, 255, 255, 0.45)',
          flexShrink: 0,
          gap: '0.5rem',
        }}
      >
        {status === 'completed' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: '#05df72', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={11} /> EXIT 0 (ACCEPTED)
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>│</span>
              <span>CPU: <strong style={{ color: '#f7f7f7', fontWeight: 500 }}>12.4ms</strong></span>
              <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>│</span>
              <span>RSS: <strong style={{ color: '#f7f7f7', fontWeight: 500 }}>8.4MB</strong> / 256MB</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>NET: <strong style={{ color: '#05df72', fontWeight: 500 }}>0 B</strong></span>
              <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>│</span>
              <span>PIDS: <strong style={{ color: '#f7f7f7', fontWeight: 500 }}>1</strong> / 64</span>
            </div>
          </>
        ) : status === 'running' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f59e0b' }}>
              <span>EXECUTING IN CGROUP...</span>
            </div>
            <div>
              <span>ISOLATING UID 1001</span>
            </div>
          </>
        ) : (
          /* Idle State Status Bar */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>STATUS: READY</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>│</span>
              <span>CGROUP: <strong style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 400 }}>256MB / 64 PIDs</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>ROOTFS: <strong style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 400 }}>EROFS (READ-ONLY)</strong></span>
              <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>│</span>
              <span>NET: <strong style={{ color: '#05df72', fontWeight: 400 }}>NONE</strong></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


