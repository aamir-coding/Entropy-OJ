import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export interface FeatureSpec {
  label: string;
  value: string;
}

export interface FeatureCardProps {
  id?: string;
  tag: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor?: string;
  specs?: FeatureSpec[];
  widget: React.ReactNode;
  reversed?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  id,
  tag,
  title,
  description,
  icon: Icon,
  accentColor = '#4dabf7',
  specs = [],
  widget,
  reversed = false,
}) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="feature-card-grid"
      style={{
        width: '100%',
        alignItems: 'start',
        padding: '2.5rem 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        scrollMarginTop: '80px',
      }}
    >
      {/* Text column (Order controlled via CSS for proper mobile-first hierarchy) */}
      <div
        className={`feature-card-text ${reversed ? 'reversed' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Top Tag & Icon Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 16px ${accentColor}15`,
            }}
          >
            <Icon size={16} style={{ color: accentColor }} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: accentColor,
              textTransform: 'uppercase',
            }}
          >
            {tag}
          </span>
        </div>

        {/* Feature Title */}
        <h3
          style={{
            margin: 0,
            fontSize: '1.65rem',
            fontWeight: 500,
            color: '#f7f7f7',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
            fontFamily: "var(--font-display, 'Geist', sans-serif)",
          }}
        >
          {title}
        </h3>

        {/* Crisp, Technical Description */}
        <p
          style={{
            margin: 0,
            fontSize: '0.88rem',
            lineHeight: 1.68,
            color: 'rgba(255, 255, 255, 0.55)',
            fontFamily: "var(--font-sans, 'Inter', sans-serif)",
          }}
        >
          {description}
        </p>

        {/* Technical Specification Chips */}
        {specs.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginTop: '0.4rem',
            }}
          >
            {specs.map((spec, i) => (
              <div
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.22rem 0.55rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.7rem',
                  fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                }}
              >
                <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>{spec.label}:</span>
                <span style={{ color: '#f7f7f7', fontWeight: 500 }}>{spec.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Widget Column */}
      <div
        className={`feature-card-widget ${reversed ? 'reversed' : ''}`}
        style={{
          width: '100%',
          minWidth: 0,
        }}
      >
        {widget}
      </div>
    </motion.div>
  );
};
