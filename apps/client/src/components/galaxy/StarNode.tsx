import React, { useState } from 'react';
import { IStarProblem } from '../../data/galaxyData';
import { Sparkles, Check, Play, AlertCircle } from 'lucide-react';

interface StarNodeProps {
  problem: IStarProblem;
  isSolved: boolean;
  isAttempted: boolean;
  isAvailable: boolean;
  x: number; // coordinate relative to cluster center
  y: number;
  clusterColor: string;
  delayMs?: number;
  onClick: (problem: IStarProblem) => void;
}

export const StarNode: React.FC<StarNodeProps> = ({
  problem,
  isSolved,
  isAttempted,
  isAvailable,
  x,
  y,
  clusterColor,
  delayMs = 0,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return '#34d399'; // Emerald
      case 'Medium':
        return '#fbbf24'; // Amber
      case 'Hard':
        return '#fb7185'; // Rose
      default:
        return '#94a3b8';
    }
  };

  const diffColor = getDifficultyColor(problem.difficulty);

  const isHard = problem.difficulty === 'Hard';
  const isMedium = problem.difficulty === 'Medium';
  const isEasy = problem.difficulty === 'Easy';

  // Overall visual dimensions based on diffraction pattern
  // Easy: 2 horizontal spikes (36px wide)
  // Medium: 4 spikes in plus sign (46px wide & high)
  // Hard: 6 spikes in hexagonal spoke pattern (60px wide & high)
  const hitAreaSize = isHard ? 54 : isMedium ? 44 : 36;
  const coreRadius = isHard ? 7.5 : isMedium ? 5.5 : 4.2;

  // Starlight Diffraction Colors in Full Dark Minimal
  // Unsolved stars: crisp incandescent silver starlight
  let spikeColor = 'rgba(255, 255, 255, 0.4)';
  let coreFill = '#ffffff';
  let coreBorder = 'rgba(255, 255, 255, 0.6)';
  let glowFilter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.35))';

  if (isSolved) {
    // Supernova: Radiant Pure White Starlight Flare
    spikeColor = '#ffffff';
    coreFill = '#ffffff';
    coreBorder = '#ffffff';
    glowFilter = 'drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 14px rgba(255, 255, 255, 0.8))';
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
        zIndex: hovered ? 40 : isHard ? 28 : isSolved ? 25 : 20,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        animation: `starBlossomIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Precision Astronomical Targeting Reticle on Hover */}
      {hovered && (
        <div
          className="targeting-reticle"
          style={{
            position: 'absolute',
            inset: isHard ? '-14px' : '-10px',
            border: '1.2px dashed rgba(255, 255, 255, 0.45)',
            borderRadius: '50%',
            pointerEvents: 'none',
            animation: 'reticleSpin 6s linear infinite',
          }}
        />
      )}

      {/* Light pulsating white ring ONLY for Solved stars (unsolved stars remain clean & static) */}
      {isSolved && <div className="supernova-pulse-ring" style={{ inset: isHard ? '-8px' : '-6px' }} />}

      {/* The Celestial Star Node (SVG Diffraction Spikes + Circular Center) */}
      <button
        onClick={() => onClick(problem)}
        style={{
          width: `${hitAreaSize}px`,
          height: `${hitAreaSize}px`,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: hovered ? 'scale(1.35)' : 'scale(1)',
          position: 'relative',
          zIndex: 2,
        }}
        aria-label={`${problem.title} (${problem.difficulty})`}
      >
        {/* EASY: 2 Horizontal Spikes (Smallest overall diameter) */}
        {isEasy && (
          <svg
            width="40"
            height="20"
            viewBox="-20 -10 40 20"
            style={{ overflow: 'visible', filter: glowFilter }}
          >
            {/* Left and Right Horizontal Tapered Spikes */}
            <path
              d="M -18,0 Q -6,-2 0,0 Q -6,2 -18,0 Z"
              fill={spikeColor}
            />
            <path
              d="M 18,0 Q 6,-2 0,0 Q 6,2 18,0 Z"
              fill={spikeColor}
            />
            {/* Central Circular Orb */}
            <circle
              cx="0"
              cy="0"
              r={coreRadius}
              fill={isSolved ? '#ffffff' : '#f1f5f9'}
              stroke={coreBorder}
              strokeWidth="1.2"
            />
            {isSolved && <circle cx="0" cy="0" r="2" fill="#ffffff" />}
          </svg>
        )}

        {/* MEDIUM: 4 Spikes in a Plus Sign (+) (2nd largest diameter) */}
        {isMedium && (
          <svg
            width="48"
            height="48"
            viewBox="-24 -24 48 48"
            style={{ overflow: 'visible', filter: glowFilter }}
          >
            {/* Horizontal Axis */}
            <path
              d="M -22,0 Q -7,-2.4 0,0 Q -7,2.4 -22,0 Z"
              fill={spikeColor}
            />
            <path
              d="M 22,0 Q 7,-2.4 0,0 Q 7,2.4 22,0 Z"
              fill={spikeColor}
            />
            {/* Vertical Axis */}
            <path
              d="M 0,-22 Q -2.4,-7 0,0 Q 2.4,-7 0,-22 Z"
              fill={spikeColor}
            />
            <path
              d="M 0,22 Q -2.4,7 0,0 Q 2.4,7 0,22 Z"
              fill={spikeColor}
            />
            {/* Central Circular Orb */}
            <circle
              cx="0"
              cy="0"
              r={coreRadius}
              fill={isSolved ? '#ffffff' : '#f1f5f9'}
              stroke={coreBorder}
              strokeWidth="1.4"
            />
            {isSolved && <circle cx="0" cy="0" r="2.5" fill="#ffffff" />}
          </svg>
        )}

        {/* HARD: 6 Spikes in a Hexagonal Spoke Pattern (Largest diameter) */}
        {isHard && (
          <svg
            width="60"
            height="60"
            viewBox="-30 -30 60 60"
            style={{ overflow: 'visible', filter: glowFilter }}
          >
            {/* 3 Spoke Axes at 0°, 60°, and 120° (Hexagonal JWST Diffraction Pattern) */}
            {[0, 60, 120].map((angle) => (
              <g key={angle} transform={`rotate(${angle})`}>
                <path
                  d="M -28,0 Q -9,-2.8 0,0 Q -9,2.8 -28,0 Z"
                  fill={spikeColor}
                />
                <path
                  d="M 28,0 Q 9,-2.8 0,0 Q 9,2.8 28,0 Z"
                  fill={spikeColor}
                />
              </g>
            ))}
            {/* Central Circular Orb */}
            <circle
              cx="0"
              cy="0"
              r={coreRadius}
              fill={isSolved ? '#ffffff' : '#f1f5f9'}
              stroke={coreBorder}
              strokeWidth="1.8"
            />
            {isSolved && <circle cx="0" cy="0" r="3.2" fill="#ffffff" />}
          </svg>
        )}
      </button>

      {/* Hover Holographic Tooltip */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-10px)',
            background: 'rgba(10, 10, 10, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-overlay)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.4rem 0.65rem',
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            pointerEvents: 'none',
            animation: 'fadeIn 0.15s ease',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              #{problem.order}
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--brand-white)' }}>
              {problem.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: diffColor,
                background: `${diffColor}18`,
                border: `1px solid ${diffColor}40`,
                padding: '0.05rem 0.35rem',
                borderRadius: 'var(--radius-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {problem.difficulty}
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--border-strong)' }}>|</span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                color: isSolved ? 'var(--verdict-ac)' : isAttempted ? 'var(--verdict-tle)' : 'var(--text-muted)',
              }}
            >
              {isSolved ? 'Solved' : isAttempted ? 'In Progress' : 'Uncharted'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
