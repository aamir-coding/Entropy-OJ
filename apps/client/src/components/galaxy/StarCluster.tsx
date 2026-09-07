import React, { useState, useMemo } from 'react';
import { IStarCluster, IStarProblem } from '../../data/galaxyData';
import { StarNode } from './StarNode';
import { Sparkles } from 'lucide-react';

interface StellarPhysics {
  baseSize: number;
  blossomSize: number;
  coreGradient: string;
  coronaInset: string;
  coronaBlur: string;
  pulseDuration: string;
  pipScale: string;
}

const getStellarPhysics = (cluster: IStarCluster): StellarPhysics => {
  const { id, spectralColor } = cluster;
  switch (id) {
    case 'arrays-hashing':
      return {
        baseSize: 82,
        blossomSize: 98,
        coreGradient: `radial-gradient(circle, #ffffff 0%, ${spectralColor} 50%, #050b18 80%, #000000 100%)`,
        coronaInset: '-12px',
        coronaBlur: '14px',
        pulseDuration: '4.8s',
        pipScale: '28%',
      };
    case 'two-pointers':
      return {
        baseSize: 80,
        blossomSize: 96,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #a5f3fc 35%, ${spectralColor} 65%, #05141e 100%)`,
        coronaInset: '-10px',
        coronaBlur: '12px',
        pulseDuration: '3.6s',
        pipScale: '26%',
      };
    case 'sliding-window':
      return {
        baseSize: 76,
        blossomSize: 92,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #93c5fd 40%, ${spectralColor} 70%, #030712 100%)`,
        coronaInset: '-8px',
        coronaBlur: '10px',
        pulseDuration: '3.2s',
        pipScale: '25%',
      };
    case 'stack':
      return {
        baseSize: 74,
        blossomSize: 90,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #c4b5fd 42%, ${spectralColor} 68%, #0d091a 100%)`,
        coronaInset: '-8px',
        coronaBlur: '9px',
        pulseDuration: '3.0s',
        pipScale: '24%',
      };
    case 'binary-search':
      return {
        baseSize: 72,
        blossomSize: 88,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #67e8f9 35%, ${spectralColor} 62%, #02121c 100%)`,
        coronaInset: '-8px',
        coronaBlur: '10px',
        pulseDuration: '2.2s',
        pipScale: '22%',
      };
    case 'linked-list':
      return {
        baseSize: 78,
        blossomSize: 94,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #6ee7b7 40%, ${spectralColor} 70%, #02180e 100%)`,
        coronaInset: '-10px',
        coronaBlur: '12px',
        pulseDuration: '3.8s',
        pipScale: '27%',
      };
    case 'trees':
      return {
        baseSize: 82,
        blossomSize: 98,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #86efac 42%, ${spectralColor} 70%, #041a09 100%)`,
        coronaInset: '-12px',
        coronaBlur: '14px',
        pulseDuration: '4.2s',
        pipScale: '30%',
      };
    case 'tries':
      return {
        baseSize: 76,
        blossomSize: 92,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #5eead4 40%, ${spectralColor} 68%, #031816 100%)`,
        coronaInset: '-8px',
        coronaBlur: '10px',
        pulseDuration: '3.4s',
        pipScale: '26%',
      };
    case 'heap':
      return {
        baseSize: 78,
        blossomSize: 94,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #fde047 40%, ${spectralColor} 70%, #1f1200 100%)`,
        coronaInset: '-10px',
        coronaBlur: '12px',
        pulseDuration: '3.6s',
        pipScale: '27%',
      };
    case 'backtracking':
      return {
        baseSize: 76,
        blossomSize: 92,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #fdba74 40%, ${spectralColor} 68%, #1c0800 100%)`,
        coronaInset: '-9px',
        coronaBlur: '11px',
        pulseDuration: '2.8s',
        pipScale: '25%',
      };
    case 'graphs':
      return {
        baseSize: 80,
        blossomSize: 96,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #7dd3fc 40%, ${spectralColor} 68%, #021220 100%)`,
        coronaInset: '-11px',
        coronaBlur: '13px',
        pulseDuration: '4.0s',
        pipScale: '28%',
      };
    case 'advanced-graphs':
      return {
        baseSize: 78,
        blossomSize: 94,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #a5b4fc 42%, ${spectralColor} 70%, #0b0d26 100%)`,
        coronaInset: '-10px',
        coronaBlur: '12px',
        pulseDuration: '3.5s',
        pipScale: '26%',
      };
    case '1d-dp':
      return {
        baseSize: 84,
        blossomSize: 100,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #fda4af 38%, ${spectralColor} 66%, #1a0208 100%)`,
        coronaInset: '-14px',
        coronaBlur: '16px',
        pulseDuration: '5.2s',
        pipScale: '32%',
      };
    case '2d-dp':
      return {
        baseSize: 80,
        blossomSize: 96,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #f472b6 40%, ${spectralColor} 68%, #1c0210 100%)`,
        coronaInset: '-11px',
        coronaBlur: '13px',
        pulseDuration: '3.8s',
        pipScale: '28%',
      };
    case 'greedy':
      return {
        baseSize: 86,
        blossomSize: 102,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #fde68a 35%, ${spectralColor} 65%, #241300 100%)`,
        coronaInset: '-16px',
        coronaBlur: '18px',
        pulseDuration: '4.6s',
        pipScale: '34%',
      };
    case 'intervals':
      return {
        baseSize: 78,
        blossomSize: 94,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #5eead4 40%, ${spectralColor} 70%, #021815 100%)`,
        coronaInset: '-10px',
        coronaBlur: '12px',
        pulseDuration: '3.6s',
        pipScale: '27%',
      };
    case 'math-geometry':
      return {
        baseSize: 82,
        blossomSize: 98,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #a5b4fc 42%, ${spectralColor} 70%, #0b0c2a 100%)`,
        coronaInset: '-12px',
        coronaBlur: '14px',
        pulseDuration: '4.4s',
        pipScale: '29%',
      };
    case 'bit-manipulation':
      return {
        baseSize: 72,
        blossomSize: 88,
        coreGradient: `radial-gradient(circle, #ffffff 0%, #fda4af 35%, ${spectralColor} 65%, #22040c 100%)`,
        coronaInset: '-8px',
        coronaBlur: '10px',
        pulseDuration: '2.0s',
        pipScale: '22%',
      };
    default:
      return {
        baseSize: 78,
        blossomSize: 94,
        coreGradient: `radial-gradient(circle, #ffffff 0%, ${spectralColor} 65%, #0f172a 100%)`,
        coronaInset: '-8px',
        coronaBlur: '10px',
        pulseDuration: '3.6s',
        pipScale: '28%',
      };
  }
};

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
  const physics = useMemo(() => getStellarPhysics(cluster), [cluster]);

  // Multi-tier Concentric Orbit Engine for decluttering large problem sets
  const { orbitalRings, orbitalNodes, svgDims, maxRadius } = useMemo(() => {
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
      maxRadius,
    };
  }, [cluster.problems]);

  // Side-docking telemetry logic:
  // If the star system is on the right side of the page (offset >= 50%), slide to the LEFT (inward).
  // If on the left side (offset < 50%), slide to the RIGHT (inward).
  const isRightSide = horizontalOffsetPercent >= 50;
  const sideDistance = maxRadius + 42;

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
      style={{
        position: 'relative',
        left: `${horizontalOffsetPercent}%`,
        transform: 'translateX(-50%)',
        margin: isBlossomed ? '5.5rem 0' : '4.25rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'margin 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: isBlossomed ? 30 : 10,
      }}
    >
      {/* Volumetric Starlight & Atmospheric Sector Glow Aura */}
      <div
        style={{
          position: 'absolute',
          width: isBlossomed ? `${svgDims.width * 0.9}px` : '320px',
          height: isBlossomed ? `${svgDims.height * 0.9}px` : '260px',
          borderRadius: '50%',
          background: isBlossomed
            ? cluster.bgGlow
            : `radial-gradient(circle, ${cluster.coronaGlow} 0%, transparent 70%)`,
          filter: 'blur(42px)',
          opacity: isBlossomed ? 0.85 : 0.55,
          pointerEvents: 'none',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 1,
        }}
      />


      {/* ── CENTRAL SOLAR ANCHOR CONTAINER ──────────────────────────────────
          Unifies Core Sun, SVG lines, and StarNodes with pixel-perfect center alignment */}
      <div
        className="cluster-solar-anchor"
        style={{
          position: 'relative',
          width: isBlossomed ? `${physics.blossomSize}px` : `${physics.baseSize}px`,
          height: isBlossomed ? `${physics.blossomSize}px` : `${physics.baseSize}px`,
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
            {/* Concentric Orbital Ellipse Rings (Delicate Astrometric Coordinate Rings) */}
            {orbitalRings.map((ring, rIdx) => (
              <ellipse
                key={`ring-${rIdx}`}
                cx="0"
                cy="0"
                rx={ring.radius}
                ry={ring.radius * 0.72}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
                strokeDasharray="2 4"
              />
            ))}

            {/* Constellation Vectors: CAD Astrometry Vectors radiating from Center of Singularity */}
            {orbitalNodes.map(({ prob, x, y }) => {
              const isSolved = solvedCodes.has(prob.code);
              return (
                <line
                  key={`line-core-${prob.id}`}
                  x1="0"
                  y1="0"
                  x2={x}
                  y2={y}
                  stroke={isSolved ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth={isSolved ? 1.4 : 1}
                  strokeDasharray={isSolved ? 'none' : '2 4'}
                  style={{
                    filter: isSolved ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))' : 'none',
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

        {/* Central Celestial Orb (Authentic Organic Stellar Core) */}
        <div
          onClick={handleCoreClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setHoverSuppressed(false);
          }}
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
              pointerEvents: 'none',
            }}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="3.5" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={isMastered ? '#fbbf24' : cluster.spectralColor}
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeDasharray="276"
              strokeDashoffset={276 * (1 - progressRatio)}
              style={{
                filter: `drop-shadow(0 0 8px ${cluster.spectralColor})`,
                transition: 'stroke-dashoffset 0.6s ease',
              }}
            />
          </svg>

          {/* Coronal Solar Flare: Soft Atmospheric Aura */}
          <div
            className="solar-coronal-flare"
            style={{
              position: 'absolute',
              inset: physics.coronaInset,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${cluster.coronaGlow} 0%, transparent 70%)`,
              filter: `blur(${physics.coronaBlur})`,
              pointerEvents: 'none',
              animation: `stellarBreathingGlow ${physics.pulseDuration} ease-in-out infinite`,
            }}
          />

          {/* Inner Star Body: Volumetric Glowing Celestial Orb */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: isMastered
                ? 'radial-gradient(circle, #ffffff 0%, #fbbf24 60%, #b45309 100%)'
                : physics.coreGradient,
              boxShadow: isMastered
                ? '0 0 32px rgba(251, 191, 36, 0.7), inset 0 0 16px rgba(255, 255, 255, 0.9)'
                : `0 0 28px ${cluster.coronaGlow}, inset 0 0 14px rgba(255, 255, 255, 0.75)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isMastered ? '2px solid rgba(255, 255, 255, 0.95)' : '2px solid rgba(255, 255, 255, 0.6)',
              position: 'relative',
              transition: 'box-shadow 0.4s ease, border 0.4s ease',
            }}
          >
            {isMastered ? (
              <Sparkles size={24} color="#0f172a" strokeWidth={2.5} />
            ) : (
              <div
                style={{
                  width: physics.pipScale,
                  height: physics.pipScale,
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: `0 0 12px #ffffff, 0 0 20px ${cluster.spectralColor}99`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Cluster Label & Info: Glides smoothly to the side when blossomed */}
      <div
        className="cluster-label-telemetry"
        onClick={handleCoreClick}
        style={{
          position: 'relative',
          marginTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isBlossomed ? (isRightSide ? 'flex-end' : 'flex-start') : 'center',
          textAlign: isBlossomed ? (isRightSide ? 'right' : 'left') : 'center',
          cursor: isExpanded ? unlockCursor : lockCursor,
          zIndex: 35,
          width: 'max-content',
          maxWidth: isBlossomed ? '280px' : '220px',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
          transform: isBlossomed
            ? isRightSide
              ? `translate(calc(-50% - ${sideDistance}px), calc(-50% - ${(physics.blossomSize / 2) + 14}px))`
              : `translate(calc(50% + ${sideDistance}px), calc(-50% - ${(physics.blossomSize / 2) + 14}px))`
            : 'translate(0, 0)',
          transition: 'transform 0.48s cubic-bezier(0.16, 1, 0.3, 1), max-width 0.4s ease',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        {/* Designation Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: cluster.spectralColor,
              boxShadow: `0 0 8px ${cluster.spectralColor}`,
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.95)',
            }}
          >
            {cluster.designation}
          </span>
        </div>

        {/* System Name */}
        <h3
          style={{
            margin: '0.25rem 0 0.35rem 0',
            fontSize: isBlossomed ? '1.25rem' : '1.05rem',
            fontWeight: 500,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.025em',
            color: 'var(--brand-white)',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 0, 0, 0.75)',
            transition: 'font-size 0.3s ease',
            lineHeight: 1.2,
          }}
        >
          {cluster.name}
        </h3>

        {/* Solved Progress Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              color: isMastered ? 'var(--brand-white)' : 'var(--text-secondary)',
              background: isMastered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(20, 20, 25, 0.65)',
              padding: '0.12rem 0.55rem',
              borderRadius: 'var(--radius-xs)',
              border: `1px solid ${isMastered ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.12)'}`,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {solvedCount} / {totalCount} Solved
          </span>
        </div>

        {/* Sector Brief Description (Revealed directly on the stars when blossomed) */}
        {isBlossomed && (
          <p
            style={{
              margin: '0.45rem 0 0 0',
              fontSize: '0.75rem',
              color: 'rgba(226, 232, 240, 0.8)',
              fontFamily: 'var(--font-sans)',
              lineHeight: 1.45,
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.95)',
              animation: 'fadeIn 0.3s ease',
              maxWidth: '260px',
            }}
          >
            {cluster.sectorDescription}
          </p>
        )}
      </div>
    </div>
  );
};
