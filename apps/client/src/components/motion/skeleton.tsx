import React from 'react';
import { cn } from '../../lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className,
  style,
  ...props
}) => {
  return (
    <div
      className={cn('motion-skeleton', className)}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

export interface TableSkeletonProps {
  rows?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 8 }) => {
  return (
    <div className="table-skeleton-container" aria-label="Loading problems..." role="status">
      <div className="table-skeleton-header">
        <div style={{ width: '40px' }}><Skeleton height="14px" width="30px" /></div>
        <div style={{ flex: 1 }}><Skeleton height="14px" width="120px" /></div>
        <div style={{ width: '90px' }}><Skeleton height="14px" width="60px" /></div>
        <div style={{ width: '110px' }}><Skeleton height="14px" width="70px" /></div>
        <div style={{ width: '180px' }}><Skeleton height="14px" width="100px" /></div>
      </div>
      <div className="table-skeleton-body">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="table-skeleton-row">
            {/* Status dot */}
            <div style={{ width: '40px', display: 'flex', alignItems: 'center' }}>
              <Skeleton width="14px" height="14px" borderRadius="50%" />
            </div>

            {/* Problem Title & Code */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Skeleton width="45px" height="16px" borderRadius="var(--radius-xs)" />
              <Skeleton width={`${Math.floor(140 + (i * 29) % 180)}px`} height="16px" borderRadius="var(--radius-xs)" />
            </div>

            {/* Difficulty Badge */}
            <div style={{ width: '90px', display: 'flex', alignItems: 'center' }}>
              <Skeleton width="55px" height="20px" borderRadius="var(--radius-xs)" />
            </div>

            {/* Acceptance Rate */}
            <div style={{ width: '110px', display: 'flex', alignItems: 'center' }}>
              <Skeleton width="48px" height="15px" borderRadius="var(--radius-xs)" />
            </div>

            {/* Tags */}
            <div style={{ width: '180px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Skeleton width="42px" height="18px" borderRadius="var(--radius-xs)" />
              <Skeleton width="52px" height="18px" borderRadius="var(--radius-xs)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
