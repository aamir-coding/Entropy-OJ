import React, { useState } from 'react';
import { STAR_CLUSTERS } from '../../data/galaxyData';
import { Sparkles, Compass, ChevronDown, Orbit, Zap } from 'lucide-react';

interface GalaxyHUDProps {
  totalSolved: number;
  totalProblems: number;
  easySolved: number;
  medSolved: number;
  hardSolved: number;
  onTeleportToCluster: (clusterId: string) => void;
}

export const GalaxyHUD: React.FC<GalaxyHUDProps> = ({
  totalSolved,
  totalProblems,
  easySolved,
  medSolved,
  hardSolved,
  onTeleportToCluster,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const percentage = Math.round((totalSolved / totalProblems) * 100) || 0;

  return (
    <header
      style={{
        position: 'sticky',
        top: 'var(--header-height, 58px)',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.65rem 0',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Universe Ignition Metric */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--glass-shadow)',
                color: 'var(--brand-white)',
                flexShrink: 0,
              }}
            >
              <Orbit size={16} />
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>GALAXY NODE MAP</span>
                <span
                  style={{
                    color: 'var(--brand-white)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '0.05rem 0.35rem',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                  }}
                >
                  {percentage}% IGNITED
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'var(--brand-white)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '-0.02em',
                }}
              >
                {totalSolved} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {totalProblems} Stars</span>
              </div>
            </div>
          </div>

          {/* Precision Progress Bar */}
          <div
            style={{
              width: '140px',
              height: '3px',
              background: 'var(--border-subtle)',
              borderRadius: '1px',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percentage}%`,
                background: 'var(--brand-white)',
                borderRadius: '1px',
                transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          {/* Difficulty Counters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--diff-easy)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--diff-easy)' }} />
              {easySolved} Easy
            </span>
            <span style={{ color: 'var(--diff-medium)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--diff-medium)' }} />
              {medSolved} Med
            </span>
            <span style={{ color: 'var(--diff-hard)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--diff-hard)' }} />
              {hardSolved} Hard
            </span>
          </div>
        </div>

        {/* Right: Sector Teleporter Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.45rem 0.85rem',
              color: 'var(--brand-white)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--glass-shadow)',
              transition: 'border-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-medium)')}
          >
            <Compass size={15} color="var(--brand-neutral-200)" />
            <span>Sector Teleport (18 Systems)</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                background: 'rgba(10, 10, 10, 0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-overlay)',
                padding: '0.5rem',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
              }}
            >
              <div
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--font-mono)',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '0.25rem',
                }}
              >
                Available Star Systems
              </div>

              {STAR_CLUSTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onTeleportToCluster(c.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0.5rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: c.spectralColor,
                        boxShadow: `0 0 6px ${c.spectralColor}`,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--brand-white)', fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.designation}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    {c.problems.length} Stars
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
