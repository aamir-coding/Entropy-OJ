import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';
import { EASE_OUT } from '../../lib/ease';
import { Tooltip } from './tooltip';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  bgColor?: string;
  height?: number | string;
  className?: string;
  indicatorClassName?: string;
  glow?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'var(--accent-cyan)',
  bgColor = 'var(--bg-elevated)',
  height = 6,
  className,
  indicatorClassName,
  glow = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / (max || 1)) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('relative w-full rounded-full overflow-hidden', className)}
      style={{
        height,
        backgroundColor: bgColor,
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className={cn('h-full rounded-full', indicatorClassName)}
        style={{
          background: color,
          boxShadow: glow ? `0 0 10px ${color}` : undefined,
        }}
      />
    </div>
  );
};

export interface ProgressSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface SegmentedProgressProps {
  segments: ProgressSegment[];
  total: number;
  height?: number | string;
  className?: string;
}

export const SegmentedProgressBar: React.FC<SegmentedProgressProps> = ({
  segments,
  total,
  height = 8,
  className,
}) => {
  const safeTotal = Math.max(1, total);

  return (
    <div
      className={cn('relative w-full rounded-full overflow-hidden flex', className)}
      style={{
        height,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {segments.map((seg, idx) => {
        const pct = Math.min(100, Math.max(0, (seg.value / safeTotal) * 100));
        if (pct <= 0) return null;

        return (
          <Tooltip key={seg.id} content={`${seg.label}: ${seg.value}`} side="top">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: EASE_OUT }}
              className="h-full first:rounded-l-full last:rounded-r-full cursor-pointer"
              style={{
                background: seg.color,
                boxShadow: `0 0 8px ${seg.color}33`,
              }}
            />
          </Tooltip>
        );
      })}
    </div>
  );
};
