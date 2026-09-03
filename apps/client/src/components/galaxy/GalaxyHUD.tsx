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
        background: 'rgba(8, 12, 20, 0.85)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
                color: '#fff',
                flexShrink: 0,
              }}
            >
              <Orbit size={20} />
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>GALAXY NODE MAP</span>
                <span style={{ color: '#38bdf8', fontWeight: 800 }}>{percentage}% IGNITED</span>
              </div>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '-0.02em',
                }}
              >
                {totalSolved} <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>/ {totalProblems} Stars</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '160px',
              height: '7px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              display: 'flex',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #34d399 100%)',
                borderRadius: '999px',
                boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
                transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>

          {/* Difficulty Counters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399', boxShadow: '0 0 6px #34d399' }} />
              {easySolved} Easy
            </span>
            <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }} />
              {medSolved} Med
            </span>
            <span style={{ color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fb7185', boxShadow: '0 0 6px #fb7185' }} />
              {hardSolved} Hard
            </span>
          </div>
        </div>

        {/* Right: Sector Teleporter Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '0.45rem 0.85rem',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s',
            }}
          >
            <Compass size={16} color="#38bdf8" />
            <span>Sector Teleport (18 Systems)</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '300px',
                maxHeight: '420px',
                overflowY: 'auto',
                background: 'rgba(11, 16, 26, 0.98)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 20px rgba(56, 189, 248, 0.15)',
                padding: '0.6rem',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div
                style={{
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
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
                    borderRadius: '8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        backgroundColor: c.spectralColor,
                        boxShadow: `0 0 8px ${c.spectralColor}`,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.designation}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
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
