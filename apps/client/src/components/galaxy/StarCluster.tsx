import React, { useState, useMemo } from 'react';
import { IStarCluster, IStarProblem } from '../../data/galaxyData';
import { StarNode } from './StarNode';
import { Sparkles } from 'lucide-react';

interface StarClusterProps {
  cluster: IStarCluster;
  isExpanded: boolean;
  onToggleExpand: () => void;
  solvedCodes: Set<string>;
  attemptedCodes: Set<string>;
  availableCodes: Set<string>;
  horizontalOffsetPercent: number;
  onSelectProblem: (problem: IStarProblem) => void;
}

// Clean, professional black lock & unlock cursors with subtle white contour for universal visibility
const lockCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4' fill='none' stroke='%23ffffff' stroke-width='3.2' stroke-linecap='round'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 10 0v4' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round'/%3E%3Crect x='4' y='11' width='16' height='11' rx='2.5' fill='%23000000' stroke='%23ffffff' stroke-width='1.2'/%3E%3Ccircle cx='12' cy='15.5' r='1.2' fill='%23ffffff'/%3E%3Cpath d='M12 16.7v2' stroke='%23ffffff' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E") 12 12, pointer`;

const unlockCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7 11V7a5 5 0 0 1 9.8-1.5' fill='none' stroke='%23ffffff' stroke-width='3.2' stroke-linecap='round'/%3E%3Cpath d='M7 11V7a5 5 0 0 1 9.8-1.5' fill='none' stroke='%23000000' stroke-width='2' stroke-linecap='round'/%3E%3Crect x='4' y='11' width='16' height='11' rx='2.5' fill='%23000000' stroke='%23ffffff' stroke-width='1.2'/%3E%3Ccircle cx='12' cy='15.5' r='1.2' fill='%23ffffff'/%3E%3Cpath d='M12 16.7v2' stroke='%23ffffff' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E") 12 12, pointer`;

export const StarCluster: React.FC<StarClusterProps> = ({
  cluster,
  isExpanded,
  onToggleExpand,
  solvedCodes,
  attemptedCodes,
  availableCodes,
  horizontalOffsetPercent,
  onSelectProblem,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  // Suppress hover immediately when user clicks the core to unlock,
  // so the zoom collapses back down without waiting for mouse to leave
  const [hoverSuppressed, setHoverSuppressed] = useState(false);

  // Active blossom state: active if locked OR if hovering (and hover not suppressed)
  const isBlossomed = isExpanded || (isHovered && !hoverSuppressed);

  const totalCount = cluster.problems.length;
  const solvedCount = useMemo(() => {
    return cluster.problems.filter((p) => solvedCodes.has(p.code)).length;
  }, [cluster.problems, solvedCodes]);

  const isMastered = solvedCount === totalCount && totalCount > 0;
  const progressRatio = totalCount > 0 ? solvedCount / totalCount : 0;

  // Multi-tier Concentric Orbit Engine for decluttering large problem sets
  const { orbitalRings, orbitalNodes, svgDims } = useMemo(() => {
    const N = cluster.problems.length;
    let ringConfigs: { radius: number; count: number }[] = [];

    if (N <= 7) {
      // 1 ring for compact clusters (Two Pointers, Sliding Window, Stack, etc.)
      ringConfigs = [{ radius: 165, count: N }];
    } else if (N <= 12) {
      // 2 concentric rings (Arrays & Hashing, 1D DP, 2D DP, Linked List)
      const inner = Math.ceil(N * 0.42);
      ringConfigs = [
        { radius: 140, count: inner },
        { radius: 215, count: N - inner },
      ];
    } else if (N <= 16) {
      // 2 spacious rings for dense clusters (Trees: 15, Graphs: 13)
      const inner = 6;
      ringConfigs = [
        { radius: 145, count: inner },
        { radius: 240, count: N - inner },
      ];
    } else {
      // 3 spacious rings for mega clusters (Celestial Apex: 28)
      ringConfigs = [
        { radius: 135, count: 8 },
        { radius: 205, count: 10 },
        { radius: 275, count: N - 18 },
      ];
    }

    let probIdx = 0;
    const nodes: { prob: IStarProblem; x: number; y: number; delayMs: number; ringRadius: number }[] = [];
    const rings: { radius: number }[] = [];

    ringConfigs.forEach((rc, rIdx) => {
      rings.push({ radius: rc.radius });
      const ringProblems = cluster.problems.slice(probIdx, probIdx + rc.count);
      const angleStep = 360 / rc.count;
      // Stagger angle phase between rings for organic cosmic distribution
      const phaseOffset = rIdx % 2 === 1 ? angleStep / 2 : 0;

      ringProblems.forEach((prob, i) => {
        const angleDeg = i * angleStep + phaseOffset;
        const rad = (angleDeg * Math.PI) / 180;
        const x = Math.cos(rad) * rc.radius;
        const y = Math.sin(rad) * (rc.radius * 0.72); // 2.5D perspective
        nodes.push({
          prob,
          x,
          y,
          delayMs: (probIdx + i) * 30,
          ringRadius: rc.radius,
        });
      });

      probIdx += rc.count;
    });

    const maxRadius = ringConfigs[ringConfigs.length - 1].radius;
    const svgWidth = Math.max(560, (maxRadius + 65) * 2);
    const svgHeight = Math.max(420, (maxRadius * 0.72 + 55) * 2);

    return {
      orbitalRings: rings,
      orbitalNodes: nodes,
      svgDims: {
        width: svgWidth,
        height: svgHeight,
        halfW: svgWidth / 2,
        halfH: svgHeight / 2,
      },
    };
  }, [cluster.problems]);

  const handleCoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpanded) {
      // Unlocking: suppress hover so the blossom immediately collapses back down
      setHoverSuppressed(true);
    }
    onToggleExpand();
  };

  return (
    <div
      id={`cluster-${cluster.id}`}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'relative',
        left: `${horizontalOffsetPercent}%`,
        transform: 'translateX(-50%)',
        margin: isBlossomed ? '7rem 0' : '4.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'margin 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: isBlossomed ? 30 : 10,
      }}
    >
      {/* Dynamic Ambient Sector Nebula Glow Backdrop */}
      <div
        style={{
          position: 'absolute',
          width: isBlossomed ? `${svgDims.width * 0.9}px` : '320px',
          height: isBlossomed ? `${svgDims.height * 0.9}px` : '260px',
          borderRadius: '50%',
          background: cluster.bgGlow,
          filter: 'blur(50px)',
          pointerEvents: 'none',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 1,
        }}
      />

      {/* ── CENTRAL SOLAR ANCHOR CONTAINER ──────────────────────────────────
          Unifies Core Sun, SVG lines, and StarNodes with pixel-perfect center alignment */}
      <div
        className="cluster-solar-anchor"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoverSuppressed(false);
        }}
        style={{
          position: 'relative',
          width: isBlossomed ? '94px' : '78px',
          height: isBlossomed ? '94px' : '78px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 20,
        }}
      >
        {/* SVG Constellation Energy Lines & Concentric Orbital Rings */}
        {isBlossomed && (
          <svg
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${svgDims.width}px`,
              height: `${svgDims.height}px`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              overflow: 'visible',
              zIndex: 10,
            }}
            viewBox={`-${svgDims.halfW} -${svgDims.halfH} ${svgDims.width} ${svgDims.height}`}
          >
            {/* Concentric Orbital Ellipse Rings */}
            {orbitalRings.map((ring, rIdx) => (
              <ellipse
                key={`ring-${rIdx}`}
                cx="0"
                cy="0"
                rx={ring.radius}
                ry={ring.radius * 0.72}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
              />
            ))}

            {/* Constellation Vectors: Originates directly at (0, 0) Center of Sun */}
            {orbitalNodes.map(({ prob, x, y }) => {
              const isSolved = solvedCodes.has(prob.code);
              return (
                <line
                  key={`line-core-${prob.id}`}
                  x1="0"
                  y1="0"
                  x2={x}
                  y2={y}
                  stroke={isSolved ? cluster.spectralColor : 'rgba(255, 255, 255, 0.14)'}
                  strokeWidth={isSolved ? 1.8 : 1}
                  strokeDasharray={isSolved ? 'none' : '2 4'}
                  style={{
                    filter: isSolved ? `drop-shadow(0 0 6px ${cluster.spectralColor})` : 'none',
                    transition: 'stroke 0.4s ease',
                  }}
                />
              );
            })}
          </svg>
        )}

        {/* Blossomed Problem Star Nodes (Origin at exact (0, 0) Center of Sun) */}
        {isBlossomed && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              overflow: 'visible',
              zIndex: 25,
            }}
          >
            {orbitalNodes.map(({ prob, x, y, delayMs }) => (
              <StarNode
                key={prob.id}
                problem={prob}
                isSolved={solvedCodes.has(prob.code)}
                isAttempted={attemptedCodes.has(prob.code)}
                isAvailable={availableCodes.has(prob.code)}
                x={x}
                y={y}
                clusterColor={cluster.spectralColor}
                delayMs={delayMs}
                onClick={onSelectProblem}
              />
            ))}
          </div>
        )}

        {/* Central Core Sun */}
        <div
          onClick={handleCoreClick}
          className="cluster-core-sun"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isExpanded ? unlockCursor : lockCursor,
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 20,
            userSelect: 'none',
          }}
          title={isExpanded ? 'Click core to unlock and collapse orbit' : 'Click core to lock orbit'}
        >
          {/* SVG Orbital Progress Arc around the Sun */}
          <svg
            style={{
              position: 'absolute',
              inset: '-12px',
              width: 'calc(100% + 24px)',
              height: 'calc(100% + 24px)',
              transform: 'rotate(-90deg)',
            }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="3.5"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={isMastered ? '#fbbf24' : cluster.spectralColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="276"
              strokeDashoffset={276 * (1 - progressRatio)}
              style={{
                filter: `drop-shadow(0 0 8px ${cluster.spectralColor})`,
                transition: 'stroke-dashoffset 0.6s ease',
              }}
            />
          </svg>

          {/* Coronal Solar Flare */}
          <div
            className="solar-coronal-flare"
            style={{
              position: 'absolute',
              inset: '-6px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${cluster.coronaGlow} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          {/* Inner Star Body: Pure glowing celestial orb (No zoom icons) */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: isMastered
                ? 'radial-gradient(circle, #ffffff 0%, #fbbf24 60%, #b45309 100%)'
                : `radial-gradient(circle, #ffffff 0%, ${cluster.spectralColor} 65%, #0f172a 100%)`,
              boxShadow: `0 0 28px ${cluster.coronaGlow}, inset 0 0 14px rgba(255, 255, 255, 0.75)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.6)',
              position: 'relative',
            }}
          >
            {isMastered ? (
              <Sparkles size={24} color="#0f172a" strokeWidth={2.5} />
            ) : (
              <div
                style={{
                  width: '28%',
                  height: '28%',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 0 12px #ffffff',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Cluster Label & Info under Sun (Clutter text removed to keep space clean) */}
      <div
        onClick={handleCoreClick}
        style={{
          marginTop: isBlossomed ? '18px' : '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: isExpanded ? unlockCursor : lockCursor,
          textAlign: 'center',
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontSize: '0.66rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: cluster.spectralColor,
            textTransform: 'uppercase',
          }}
        >
          {cluster.designation}
        </span>

        <h3
          style={{
            margin: '0.2rem 0 0.25rem 0',
            fontSize: isBlossomed ? '1.25rem' : '1.05rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            color: '#ffffff',
            transition: 'font-size 0.3s ease',
          }}
        >
          {cluster.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: isMastered ? '#fbbf24' : 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.1rem 0.55rem',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {solvedCount} / {totalCount} Solved
          </span>
        </div>
      </div>
    </div>
  );
};
