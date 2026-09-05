import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  STAR_CLUSTERS,
  ALL_GALAXY_PROBLEMS,
  TOTAL_GALAXY_PROBLEMS,
  IStarProblem,
} from '../data/galaxyData';
import { IGalaxyProgressResponse } from '@anti-oj/shared';
import { StarfieldBackground } from '../components/galaxy/StarfieldBackground';
import { StarCluster } from '../components/galaxy/StarCluster';
import { GalaxyHUD } from '../components/galaxy/GalaxyHUD';
import { StarModal } from '../components/galaxy/StarModal';
import { Loader2, Sparkles, Orbit, Compass, Radio, ShieldAlert } from 'lucide-react';

export const GalaxyPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [availableCodes, setAvailableCodes] = useState<Set<string>>(new Set());
  const [solvedCodes, setSolvedCodes] = useState<Set<string>>(new Set());
  const [attemptedCodes, setAttemptedCodes] = useState<Set<string>>(new Set());

  // Currently expanded/locked Star System ID
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);

  // Currently inspected Star problem for modal
  const [selectedProblem, setSelectedProblem] = useState<IStarProblem | null>(null);

  useEffect(() => {
    document.title = 'Galaxy Node Map | Entropy';
  }, []);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/problems/galaxy/progress');
      if (res.data?.success && res.data?.data) {
        const data: IGalaxyProgressResponse = res.data.data;
        setAvailableCodes(new Set(data.availableCodes || []));
        setSolvedCodes(new Set(data.solvedCodes || []));
        setAttemptedCodes(new Set(data.attemptedCodes || []));
      }
    } catch (err: any) {
      console.warn('Could not fetch live galaxy progress, fallback to local display:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress, user]);

  const handleToggleCluster = (clusterId: string) => {
    setExpandedClusterId((prev) => (prev === clusterId ? null : clusterId));
  };

  const handleTeleportToCluster = (clusterId: string) => {
    setExpandedClusterId(clusterId);
    setTimeout(() => {
      const elem = document.getElementById(`cluster-${clusterId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Lazy zig-zag positioning across wide horizontal cosmic space
  const getClusterHorizontalOffset = (index: number, total: number): number => {
    if (index === total - 1) return 50; // Grand apex finale at dead center!
    const isLeft = index % 2 === 0;
    const waveShift = Math.sin(index * 1.3) * 4; // subtle natural cosmic variation
    return isLeft ? 28 + waveShift : 72 + waveShift;
  };

  // Difficulty counts
  const easySolved = useMemo(() => {
    return ALL_GALAXY_PROBLEMS.filter((p) => p.difficulty === 'Easy' && solvedCodes.has(p.code)).length;
  }, [solvedCodes]);

  const medSolved = useMemo(() => {
    return ALL_GALAXY_PROBLEMS.filter((p) => p.difficulty === 'Medium' && solvedCodes.has(p.code)).length;
  }, [solvedCodes]);

  const hardSolved = useMemo(() => {
    return ALL_GALAXY_PROBLEMS.filter((p) => p.difficulty === 'Hard' && solvedCodes.has(p.code)).length;
  }, [solvedCodes]);

  if (loading) {
    return (
      <div
        className="page-wrapper"
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-neutral-200)' }} />
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
          CALIBRATING INTERSTELLAR STAR SYSTEMS...
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => setExpandedClusterId(null)}
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000000',
        overflowX: 'hidden',
      }}
    >
      {/* Background Canvas Starfield */}
      <StarfieldBackground />

      {/* Precision Astrometric Coordinate Grid */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Dynamic Shifting Deep-Space Gravitational Lensing & Luminance (Shifts across sectors) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 30% 4%, rgba(255, 255, 255, 0.055) 0%, transparent 48%),
            radial-gradient(ellipse at 80% 18%, rgba(241, 245, 249, 0.035) 0%, transparent 45%),
            radial-gradient(ellipse at 20% 42%, rgba(203, 213, 225, 0.045) 0%, transparent 52%),
            radial-gradient(ellipse at 80% 65%, rgba(148, 163, 184, 0.035) 0%, transparent 48%),
            radial-gradient(ellipse at 50% 90%, rgba(255, 255, 255, 0.065) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 99%, rgba(248, 250, 252, 0.045) 0%, transparent 45%)
          `,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Sticky Holographic Galaxy HUD */}
      <GalaxyHUD
        totalSolved={solvedCodes.size}
        totalProblems={TOTAL_GALAXY_PROBLEMS}
        easySolved={easySolved}
        medSolved={medSolved}
        hardSolved={hardSolved}
        onTeleportToCluster={handleTeleportToCluster}
      />

      {/* Main Galaxy Map Viewport (Expanded to 1240px wide for expansive cosmic zig-zag) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 10rem 1.5rem',
        }}
      >
        {/* Galaxy Map Intro Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '4rem',
            padding: '2rem 2.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-elevated)',
            maxWidth: '800px',
            margin: '0 auto 4rem auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.6875rem',
              fontWeight: 500,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              color: 'var(--brand-neutral-100)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              background: 'var(--bg-surface)',
              padding: '0.2rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Sparkles size={12} color="var(--brand-neutral-200)" />
            INTERSTELLAR CURRICULUM • 18 SYSTEMS • 150 STARS
          </div>

          <h1
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '2rem',
              fontWeight: 400,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.035em',
              color: 'var(--brand-white)',
              lineHeight: 1.2,
            }}
          >
            The Galaxy Node Map
          </h1>

          <p
            style={{
              margin: '0 auto 1.25rem auto',
              maxWidth: '580px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            A non-linear cosmic odyssey through 18 algorithmic star systems. Hover over any solar core to preview its
            orbital constellation, or click to lock orbit.
          </p>

          {/* Precision Controls Hint Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.15rem 0.5rem',
              }}
            >
              <strong style={{ color: 'var(--brand-neutral-100)' }}>HOVER</strong> PREVIEW ORBIT
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.15rem 0.5rem',
              }}
            >
              <strong style={{ color: 'var(--brand-neutral-100)' }}>CLICK CORE</strong> LOCK / UNLOCK
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.15rem 0.5rem',
              }}
            >
              <strong style={{ color: 'var(--brand-neutral-100)' }}>CLICK STAR</strong> INSPECT PROBLEM
            </span>
          </div>
        </div>

        {/* ── THE 18 STAR SYSTEMS IN A LAZY ZIG-ZAG ────────────────────────── */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {STAR_CLUSTERS.map((cluster, index) => {
            const horizontalOffset = getClusterHorizontalOffset(index, STAR_CLUSTERS.length);

            return (
              <React.Fragment key={cluster.id}>
                {/* Sector Transition Waypoint Dividers */}
                {index === 3 && (
                  <div
                    style={{
                      margin: '5rem 0 3.5rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-medium))' }} />
                    <div
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-xs)',
                        background: 'rgba(10, 10, 10, 0.95)',
                        border: '1px solid var(--border-medium)',
                        boxShadow: 'var(--glass-shadow)',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: 'var(--brand-neutral-100)',
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Radio size={13} color="var(--brand-neutral-200)" />
                      SECTOR II • THE QUANTUM RIFT // DEPTH: 1,400 LY
                    </div>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-medium), transparent)' }} />
                  </div>
                )}

                {index === 9 && (
                  <div
                    style={{
                      margin: '5rem 0 3.5rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-medium))' }} />
                    <div
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-xs)',
                        background: 'rgba(10, 10, 10, 0.95)',
                        border: '1px solid var(--border-medium)',
                        boxShadow: 'var(--glass-shadow)',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: 'var(--brand-neutral-100)',
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <ShieldAlert size={13} color="var(--diff-hard)" />
                      SECTOR III • THE EVENT HORIZON // CRITICAL VELOCITY
                    </div>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border-medium), transparent)' }} />
                  </div>
                )}

                {/* The Star System */}
                <StarCluster
                  cluster={cluster}
                  isExpanded={expandedClusterId === cluster.id}
                  onToggleExpand={() => handleToggleCluster(cluster.id)}
                  solvedCodes={solvedCodes}
                  attemptedCodes={attemptedCodes}
                  availableCodes={availableCodes}
                  horizontalOffsetPercent={horizontalOffset}
                  onSelectProblem={(p) => setSelectedProblem(p)}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Holographic Problem Inspection Modal */}
      <StarModal
        problem={selectedProblem}
        isSolved={selectedProblem ? solvedCodes.has(selectedProblem.code) : false}
        isAttempted={selectedProblem ? attemptedCodes.has(selectedProblem.code) : false}
        isAvailable={selectedProblem ? availableCodes.has(selectedProblem.code) : false}
        onClose={() => setSelectedProblem(null)}
      />
    </div>
  );
};
