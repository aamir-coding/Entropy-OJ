import React from 'react';

interface ClusterCoreReticleProps {
  clusterId: string;
  isHovered: boolean;
  isBlossomed: boolean;
  isMastered: boolean;
}

export const ClusterCoreReticle: React.FC<ClusterCoreReticleProps> = ({
  clusterId,
  isHovered,
  isBlossomed,
  isMastered,
}) => {
  const active = isHovered || isBlossomed || isMastered;
  const strokeColor = isMastered
    ? 'rgba(255, 255, 255, 0.95)'
    : active
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(255, 255, 255, 0.28)';

  const strokeWidth = 1;

  const renderReticlePattern = () => {
    switch (clusterId) {
      // 01: Arrays & Hashing (SOLARIS PRIME - Chronograph Compass Bezel)
      case 'arrays-hashing':
        return (
          <>
            <circle cx="0" cy="0" r="14" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="2 4" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="0"
                y1="-16"
                x2="0"
                y2={deg % 90 === 0 ? '-20' : '-18'}
                stroke={strokeColor}
                strokeWidth={deg % 90 === 0 ? 1.4 : strokeWidth}
                transform={`rotate(${deg})`}
              />
            ))}
          </>
        );

      // 02: Two Pointers (GEMINI BINARY - Binary Singularity Foci)
      case 'two-pointers':
        return (
          <>
            <ellipse cx="0" cy="0" rx="16" ry="7" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} transform="rotate(-25)" strokeDasharray="3 3" />
            <line x1="-11" y1="0" x2="11" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="2 3" />
            <circle cx="-11" cy="0" r="2.2" fill={strokeColor} />
            <circle cx="11" cy="0" r="2.2" fill={strokeColor} />
          </>
        );

      // 03: Sliding Window (VELA TORRENT - Dynamic Framing Brackets)
      case 'sliding-window':
        return (
          <>
            <line x1="-18" y1="0" x2="18" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="2 3" />
            {/* Left Bracket */}
            <path d="M -7,-10 L -12,-10 L -12,10 L -7,10" fill="none" stroke={strokeColor} strokeWidth={1.2} />
            {/* Right Bracket */}
            <path d="M 7,-10 L 12,-10 L 12,10 L 7,10" fill="none" stroke={strokeColor} strokeWidth={1.2} />
            <line x1="0" y1="-14" x2="0" y2="-11" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="11" x2="0" y2="14" stroke={strokeColor} strokeWidth={strokeWidth} />
          </>
        );

      // 04: Stack (MONOLITH VAULT - Vertical Shelves)
      case 'stack':
        return (
          <>
            <rect x="-10" y="-15" width="20" height="30" rx="1" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="-7" y1="-6" x2="7" y2="-6" stroke={strokeColor} strokeWidth={1.2} />
            <line x1="-7" y1="0" x2="7" y2="0" stroke={strokeColor} strokeWidth={1.2} />
            <line x1="-7" y1="6" x2="7" y2="6" stroke={strokeColor} strokeWidth={1.2} />
            <path d="M -3,-11 L 0,-8 L 3,-11" fill="none" stroke={strokeColor} strokeWidth={1.2} />
          </>
        );

      // 05: Binary Search (PULSAR PRISM - Radio Telescope Split Crosshairs)
      case 'binary-search':
        return (
          <>
            <circle cx="0" cy="0" r="15" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="3 4" />
            <line x1="-19" y1="0" x2="-6" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="6" y1="0" x2="19" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="-19" x2="0" y2="-6" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="6" x2="0" y2="19" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Split bisector indicator */}
            <circle cx="0" cy="-6" r="1.5" fill={strokeColor} />
            <circle cx="0" cy="6" r="1.5" fill={strokeColor} />
          </>
        );

      // 06: Linked List (HELIOS STRAND - Orbital Pointer Loop)
      case 'linked-list':
        return (
          <>
            <circle cx="0" cy="0" r="12" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="8 6" />
            {[0, 120, 240].map((deg) => (
              <g key={deg} transform={`rotate(${deg})`}>
                <circle cx="0" cy="-12" r="2.2" fill={strokeColor} />
                <path d="M -2,-8 L 0,-5 L 2,-8" fill="none" stroke={strokeColor} strokeWidth={1} />
              </g>
            ))}
          </>
        );

      // 07: Trees & BST (YGGDRASIL CANOPY - Hierarchical Dendrogram)
      case 'trees':
        return (
          <>
            <line x1="0" y1="-11" x2="-10" y2="7" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="0" y1="-11" x2="10" y2="7" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="-10" y1="7" x2="10" y2="7" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="2 3" />
            <circle cx="0" cy="-11" r="2.4" fill={strokeColor} />
            <circle cx="-10" cy="7" r="2" fill={strokeColor} />
            <circle cx="10" cy="7" r="2" fill={strokeColor} />
          </>
        );

      // 08: Tries (ORACLE NEXUS - Hexagonal Prefix Mesh)
      case 'tries':
        return (
          <>
            <polygon
              points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line
                key={deg}
                x1="0"
                y1="-16"
                x2="0"
                y2="-7"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                transform={`rotate(${deg})`}
              />
            ))}
          </>
        );

      // 09: Heap / Priority Queue (TITAN GRAVITY WELL - Priority Triangle)
      case 'heap':
        return (
          <>
            <polygon points="0,-16 15,10 -15,10" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="-8" y1="-2" x2="8" y2="-2" stroke={strokeColor} strokeWidth={1.2} />
            <circle cx="0" cy="-16" r="2.2" fill={strokeColor} />
          </>
        );

      // 10: Backtracking (MIRROR DIMENSION - Recursive Labyrinth)
      case 'backtracking':
        return (
          <>
            <path d="M -16,0 A 16,16 0 0,1 0,-16" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 0,-16 A 16,16 0 0,1 16,0" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="3 3" />
            <path d="M 16,0 A 16,16 0 0,1 0,16" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M 0,16 A 16,16 0 0,1 -16,0" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="3 3" />
            <path d="M -9,0 A 9,9 0 0,1 0,-9 L 0,-4" fill="none" stroke={strokeColor} strokeWidth={1.2} />
            <path d="M 0,9 A 9,9 0 0,1 -9,0" fill="none" stroke={strokeColor} strokeWidth={1.2} />
          </>
        );

      // 11: Graphs (SYNAPSE NEBULA - Adjacency Pentagram)
      case 'graphs':
        return (
          <>
            {/* 5 orbital nodes forming a geometric network */}
            {[0, 72, 144, 216, 288].map((deg) => (
              <circle key={deg} cx="0" cy="-13" r="1.8" fill={strokeColor} transform={`rotate(${deg})`} />
            ))}
            <polygon
              points="0,-13 12.36,-4 7.64,10.5 -7.64,10.5 -12.36,-4"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray="3 3"
            />
            {/* Cross-chords */}
            <line x1="0" y1="-13" x2="7.64" y2="10.5" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} />
            <line x1="0" y1="-13" x2="-7.64" y2="10.5" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} />
          </>
        );

      // 12: Advanced Graphs (STORM SINGULARITY - Octagram Flow Network)
      case 'advanced-graphs':
        return (
          <>
            <circle cx="0" cy="0" r="16" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="0" cy="0" r="9" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="2 3" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="0"
                y1="-12"
                x2="0"
                y2="-16"
                stroke={strokeColor}
                strokeWidth={1.2}
                transform={`rotate(${deg})`}
              />
            ))}
          </>
        );

      // 13: 1-D Dynamic Programming (AETHELGARD FORGE - State Transition Ray)
      case '1d-dp':
        return (
          <>
            <line x1="-18" y1="0" x2="18" y2="0" stroke={strokeColor} strokeWidth={strokeWidth} />
            {[-15, -10, -5, 0, 5, 10, 15].map((x) => (
              <line key={x} x1={x} y1="-3.5" x2={x} y2="3.5" stroke={strokeColor} strokeWidth={1} />
            ))}
            {/* Recurrence transition arcs */}
            <path d="M -10,-3.5 Q -5,-11 0,-3.5" fill="none" stroke={strokeColor} strokeWidth={1.2} strokeDasharray="2 2" />
            <path d="M 0,-3.5 Q 5,-11 10,-3.5" fill="none" stroke={strokeColor} strokeWidth={1.2} />
          </>
        );

      // 14: 2-D Dynamic Programming (CHRONOS CITADEL - Tesseract / Hypercube Diamond)
      case '2d-dp':
        return (
          <>
            <rect x="-13" y="-13" width="26" height="26" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <rect
              x="-8"
              y="-8"
              width="16"
              height="16"
              transform="rotate(45)"
              fill="none"
              stroke={strokeColor}
              strokeWidth={1.2}
              strokeDasharray="2 2"
            />
            {/* Corner projection lines */}
            <line x1="-13" y1="-13" x2="-5.6" y2="-5.6" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="13" y1="-13" x2="5.6" y2="-5.6" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="13" y1="13" x2="5.6" y2="5.6" stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1="-13" y1="13" x2="-5.6" y2="5.6" stroke={strokeColor} strokeWidth={strokeWidth} />
          </>
        );

      // 15: Greedy (PHOENIX ASCENT - Apex Yield Chevron)
      case 'greedy':
        return (
          <>
            <path d="M -12,8 L 0,-3 L 12,8" fill="none" stroke={strokeColor} strokeWidth={1.2} />
            <path d="M -12,2 L 0,-9 L 12,2" fill="none" stroke={strokeColor} strokeWidth={1.2} />
            <path d="M -12,-4 L 0,-15 L 12,-4" fill="none" stroke={strokeColor} strokeWidth={1.2} strokeDasharray="2 2" />
            <circle cx="0" cy="-15" r="1.8" fill={strokeColor} />
          </>
        );

      // 16: Intervals (CHRONO NEXUS - Overlapping Timeline Bounds)
      case 'intervals':
        return (
          <>
            {/* Segment A */}
            <line x1="-16" y1="-6" x2="3" y2="-6" stroke={strokeColor} strokeWidth={1.4} />
            <circle cx="-16" cy="-6" r="1.5" fill={strokeColor} />
            <circle cx="3" cy="-6" r="1.5" fill={strokeColor} />
            {/* Segment B */}
            <line x1="-3" y1="6" x2="16" y2="6" stroke={strokeColor} strokeWidth={1.4} />
            <circle cx="-3" cy="6" r="1.5" fill={strokeColor} />
            <circle cx="16" cy="6" r="1.5" fill={strokeColor} />
            {/* Intersection Window */}
            <line x1="-3" y1="-9" x2="-3" y2="9" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="2 2" />
            <line x1="3" y1="-9" x2="3" y2="9" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="2 2" />
          </>
        );

      // 17: Math & Geometry (CELESTIAL MATRIX - Euclidean Inscribed Diagram)
      case 'math-geometry':
        return (
          <>
            <circle cx="0" cy="0" r="16" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <polygon points="0,-16 13.86,8 -13.86,8" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx="0" cy="0" r="8" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="2 3" />
            <polygon points="0,8 6.93,-4 -6.93,-4" fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} />
          </>
        );

      // 18: Bit Manipulation (QUANTUM SINGULARITY - Byte Register Kernel)
      case 'bit-manipulation':
        return (
          <>
            {/* 8-bit register points around circumference */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <circle
                key={deg}
                cx="0"
                cy="-14"
                r={i % 2 === 0 ? 1.8 : 1.2}
                fill={i % 2 === 0 ? strokeColor : 'none'}
                stroke={strokeColor}
                strokeWidth={1}
                transform={`rotate(${deg})`}
              />
            ))}
            <circle cx="0" cy="0" r="9.5" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="3 3" />
            {/* Bit crosshairs */}
            <line x1="-5" y1="0" x2="-2" y2="0" stroke={strokeColor} strokeWidth={1} />
            <line x1="2" y1="0" x2="5" y2="0" stroke={strokeColor} strokeWidth={1} />
            <line x1="0" y1="-5" x2="0" y2="-2" stroke={strokeColor} strokeWidth={1} />
            <line x1="0" y1="2" x2="0" y2="5" stroke={strokeColor} strokeWidth={1} />
          </>
        );

      default:
        return (
          <circle cx="0" cy="0" r="12" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="3 3" />
        );
    }
  };

  return (
    <svg
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '48px',
        height: '48px',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 5,
        transition: 'all 0.3s ease',
      }}
      viewBox="-24 -24 48 48"
    >
      {renderReticlePattern()}
    </svg>
  );
};
