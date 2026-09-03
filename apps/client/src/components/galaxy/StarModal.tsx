import React, { useEffect } from 'react';
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
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
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
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
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(13, 18, 30, 0.96)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.2)',
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
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <X size={16} />
        </button>

        {/* Top Designation Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '0.15rem 0.55rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Orbit size={13} />
            STAR #{problem.order}
          </span>

          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: diffColor,
              background: `${diffColor}18`,
              border: `1px solid ${diffColor}40`,
              padding: '0.15rem 0.55rem',
              borderRadius: '6px',
            }}
          >
            {problem.difficulty}
          </span>

          <span
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '0.15rem 0.55rem',
              borderRadius: '6px',
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
              fontSize: '1.45rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            {problem.title}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Designation Key: <code style={{ color: '#38bdf8' }}>{problem.code}</code>
          </span>
        </div>

        {/* Stellar Status Banner */}
        <div
          style={{
            borderRadius: '14px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            background: isSolved
              ? 'rgba(52, 211, 153, 0.08)'
              : isAttempted
              ? 'rgba(251, 191, 36, 0.08)'
              : 'rgba(56, 189, 248, 0.06)',
            border: `1px solid ${
              isSolved
                ? 'rgba(52, 211, 153, 0.3)'
                : isAttempted
                ? 'rgba(251, 191, 36, 0.3)'
                : 'rgba(56, 189, 248, 0.2)'
            }`,
          }}
        >
          {isSolved ? (
            <>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(52, 211, 153, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 16px rgba(52, 211, 153, 0.4)',
                }}
              >
                <Sparkles size={20} color="#34d399" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.88rem' }}>
                  Supernova Ignited (Solved)
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  This celestial node has been conquered with an Accepted verdict. Constellation energy line is fully illuminated.
                </div>
              </div>
            </>
          ) : isAttempted ? (
            <>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(251, 191, 36, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 16px rgba(251, 191, 36, 0.4)',
                }}
              >
                <AlertCircle size={20} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.88rem' }}>
                  Protostar (In-Progress)
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  You have active submissions recorded for this trial. Resume coding to ignite this star into a supernova!
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)',
                }}
              >
                <Play size={18} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.88rem' }}>
                  Dim Star (Uncharted)
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  A dormant star in this constellation. Warp to the IDE to initialize testing.
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
                padding: '0.8rem 1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 26px rgba(56, 189, 248, 0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(56, 189, 248, 0.4)';
              }}
            >
              <ExternalLink size={18} />
              {isSolved ? 'Warp to Review Solution' : 'Warp to Problem Workspace'}
            </button>
          ) : (
            <button
              disabled
              style={{
                width: '100%',
                padding: '0.8rem 1.25rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Lock size={16} />
              Awaiting Seeder Telemetry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
