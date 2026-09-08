import React from 'react';
import { motion } from 'motion/react';
import { SPRING_LAYOUT } from '../../lib/ease';
import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  activeColor?: string; // e.g. for Easy green, Medium amber, Hard red
  activeBg?: string;
  activeBorder?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  layoutId?: string;
  variant?: 'pill' | 'underline' | 'segmented';
  size?: 'sm' | 'md';
  tabIdPrefix?: string;
  className?: string;
  tabClassName?: string;
  indicatorClassName?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  onChange,
  layoutId = 'motion-tabs-indicator',
  variant = 'pill',
  size = 'md',
  tabIdPrefix = 'tab-item-',
  className,
  tabClassName,
  indicatorClassName,
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'motion-tabs-container',
        `motion-tabs-${variant}`,
        `motion-tabs-${size}`,
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;

        return (
          <button
            key={tab.id}
            id={`${tabIdPrefix}${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => {
              if (!tab.disabled) onChange(tab.id);
            }}
            className={cn(
              'motion-tab-item',
              `motion-tab-item-${size}`,
              isActive && 'motion-tab-active',
              tab.disabled && 'motion-tab-disabled',
              tabClassName
            )}
            style={{
              color: isActive && tab.activeColor ? tab.activeColor : undefined,
            }}
          >
            {/* Active Sliding Indicator */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={cn(
                  variant === 'underline'
                    ? 'motion-tab-indicator-underline'
                    : 'motion-tab-indicator-pill',
                  indicatorClassName
                )}
                style={{
                  backgroundColor: tab.activeBg || undefined,
                  borderColor: tab.activeBorder || undefined,
                  boxShadow: tab.activeColor
                    ? `0 0 12px ${tab.activeColor}20`
                    : undefined,
                }}
                transition={SPRING_LAYOUT}
              />
            )}

            {/* Tab Content */}
            <span className="motion-tab-content">
              {tab.icon && <span className="motion-tab-icon">{tab.icon}</span>}
              <span className="motion-tab-label">{tab.label}</span>
              {tab.badge && <span className="motion-tab-badge">{tab.badge}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
};
