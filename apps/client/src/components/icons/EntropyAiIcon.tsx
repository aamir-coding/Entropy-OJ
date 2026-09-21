import React from 'react';

export interface EntropyAiIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

/**
 * EntropyAiIcon — Hexagon with all diagonals (Complete graph K_6).
 *
 * Represents entropy, mathematical symmetry, and interconnected graph theory.
 * Formatted to match the 24x24 viewBox and API of Lucide icons.
 *
 * Geometry (pointy-topped regular hexagon centered at 12, 12, R = 9.2):
 * - 6 outer vertices & 6 perimeter edges
 * - 3 main diameter diagonals (crossing through center)
 * - 6 secondary diagonals (two interlocking equilateral triangles / hexagram)
 * Total 15 edges with subtle stroke-weight hierarchy for legibility at 10px-24px.
 */
export const EntropyAiIcon: React.FC<EntropyAiIconProps> = ({
  size = 14,
  color = 'currentColor',
  strokeWidth = 1.75,
  style,
  className,
  ...props
}) => {
  const numericWidth = typeof strokeWidth === 'number' ? strokeWidth : 1.75;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={numericWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {/* Outer Hexagon (100% opacity, primary stroke) */}
      <polygon points="12,2.8 20,7.4 20,16.6 12,21.2 4,16.6 4,7.4" />

      {/* 3 Main Diagonals (through center) */}
      <line
        x1="12"
        y1="2.8"
        x2="12"
        y2="21.2"
        strokeWidth={numericWidth * 0.85}
        opacity={0.75}
      />
      <line
        x1="20"
        y1="7.4"
        x2="4"
        y2="16.6"
        strokeWidth={numericWidth * 0.85}
        opacity={0.75}
      />
      <line
        x1="20"
        y1="16.6"
        x2="4"
        y2="7.4"
        strokeWidth={numericWidth * 0.85}
        opacity={0.75}
      />

      {/* 6 Secondary Diagonals (Interlocking Triangles / Hexagram) */}
      <polygon
        points="12,2.8 20,16.6 4,16.6"
        strokeWidth={numericWidth * 0.75}
        opacity={0.55}
      />
      <polygon
        points="20,7.4 12,21.2 4,7.4"
        strokeWidth={numericWidth * 0.75}
        opacity={0.55}
      />
    </svg>
  );
};

export default EntropyAiIcon;
