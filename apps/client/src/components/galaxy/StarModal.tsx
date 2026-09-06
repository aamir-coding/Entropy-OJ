import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IStarProblem } from '../../data/galaxyData';
import { X, ExternalLink, CheckCircle2, AlertCircle, Play, Sparkles, Orbit, Lock } from 'lucide-react';

interface StarModalProps {
  problem: IStarProblem | null;
  isSolved: boolean;
  isAttempted: boolean;
  isAvailable: boolean;
  onClose: () => void;
}

export const StarModal: React.FC<StarModalProps> = ({
  problem,
  isSolved,
  isAttempted,
  isAvailable,
  onClose,
}) => {
  const navigate = useNavigate();

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    // Focus first interactive element on open
    const focusable = modalElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Tab focus trap (Medium 7)
      if (e.key === 'Tab') {
        const currentFocusable = modalElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (currentFocusable.length === 0) return;

        const first = currentFocusable[0];
        const last = currentFocusable[currentFocusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!problem) return null;

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return '#34d399';
      case 'Medium':
        return '#fbbf24';
      case 'Hard':
        return '#fb7185';
      default:
        return '#94a3b8';
    }
  };

  const diffColor = getDifficultyColor(problem.difficulty);

  const handleWarp = () => {
    if (isAvailable) {
      onClose();
      navigate(`/problems/${problem.code}`);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Star Details"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-overlay)',
          padding: '1.75rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-hover)';
            e.currentTarget.style.color = 'var(--brand-white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <X size={14} />
        </button>

        {/* Top Designation Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              background: 'var(--bg-secondary)',
              color: 'var(--brand-white)',
              border: '1px solid var(--border-medium)',
              padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Orbit size={12} color="var(--brand-neutral-200)" />
            STAR #{problem.order}
          </span>

          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: diffColor,
              background: `${diffColor}18`,
              border: `1px solid ${diffColor}40`,
              padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {problem.difficulty}
          </span>

          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              padding: '0.15rem 0.55rem',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            {problem.category}
          </span>
        </div>

        {/* Problem Title */}
        <div>
          <h2
            style={{
              margin: '0 0 0.35rem 0',
              fontSize: '1.375rem',
              fontWeight: 500,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.025em',
              color: 'var(--brand-white)',
            }}
          >
            {problem.title}
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Designation Key:{' '}
            <code
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--brand-white)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                padding: '0.1rem 0.4rem',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {problem.code}
            </code>
          </span>
        </div>

        {/* Stellar Status Banner */}
        <div
          style={{
            borderRadius: 'var(--radius-xs)',
            padding: '0.875rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-medium)',
          }}
        >
          {isSolved ? (
            <>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(5, 223, 114, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--glass-shadow)',
                }}
              >
                <Sparkles size={16} color="var(--verdict-ac)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--verdict-ac)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                  Supernova Ignited (Solved)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                  Accepted verdict confirmed. Constellation energy vector is illuminated.
                </div>
              </div>
            </>
          ) : isAttempted ? (
            <>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--glass-shadow)',
                }}
              >
                <AlertCircle size={16} color="var(--verdict-tle)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--verdict-tle)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                  Protostar (In-Progress)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                  Submissions recorded. Resume coding to ignite this star into a supernova.
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: 'var(--glass-shadow)',
                }}
              >
                <Play size={15} color="var(--brand-neutral-200)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--brand-white)', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                  Dim Star (Uncharted)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                  Dormant celestial node. Warp to the workspace to initialize trial.
                </div>
              </div>
            </>
          )}
        </div>

        {/* Warp Button */}
        <div>
          {isAvailable ? (
            <button
              onClick={handleWarp}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--brand-white)',
                color: 'var(--brand-black)',
                border: '1px solid var(--brand-white)',
                fontWeight: 600,
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--glass-shadow)',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--brand-neutral-50)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--brand-white)';
              }}
            >
              <ExternalLink size={16} />
              {isSolved ? 'Warp to Review Solution' : 'Warp to Problem Workspace'}
            </button>
          ) : (
            <button
              disabled
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Lock size={15} />
              Awaiting Seeder Telemetry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
