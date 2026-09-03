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
    document.title = 'Galaxy Node Map | Anti Online Judge';
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
          gap: '1.25rem',
        }}
      >
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent-cyan)' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em' }}>
          Calibrating Interstellar Star Systems...
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
        backgroundColor: '#05070d',
        overflowX: 'hidden',
      }}
    >
      {/* Background Canvas Starfield */}
      <StarfieldBackground />

      {/* Dynamic Shifting Nebula Gradients (Shifts as you scroll) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 30% 5%, rgba(56, 189, 248, 0.16) 0%, transparent 45%),
            radial-gradient(ellipse at 80% 20%, rgba(96, 165, 250, 0.14) 0%, transparent 45%),
            radial-gradient(ellipse at 20% 45%, rgba(167, 139, 250, 0.16) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 95%, rgba(251, 191, 36, 0.18) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 1,
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
            marginBottom: '4.5rem',
            padding: '2.2rem 2rem',
            borderRadius: '28px',
            background: 'rgba(11, 16, 26, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 16px 45px rgba(0, 0, 0, 0.6)',
            maxWidth: '820px',
            margin: '0 auto 4.5rem auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.12em',
              color: '#38bdf8',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              background: 'rgba(56, 189, 248, 0.1)',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <Sparkles size={13} />
            INTERSTELLAR CURRICULUM • 18 SYSTEMS • 150 STARS
          </div>

          <h1
            style={{
              margin: '0 0 0.6rem 0',
              fontSize: '2.5rem',
              fontWeight: 900,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            The Galaxy Node Map
          </h1>

          <p
            style={{
              margin: '0 auto',
              maxWidth: '620px',
              fontSize: '0.94rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
            }}
          >
            A non-linear cosmic odyssey through 18 algorithmic star systems. Hover over any solar core to preview its
            orbital constellation, or click to lock orbit.
          </p>
        </div>

        {/* ── THE 15 STAR SYSTEMS IN A LAZY ZIG-ZAG ────────────────────────── */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {STAR_CLUSTERS.map((cluster, index) => {
            const horizontalOffset = getClusterHorizontalOffset(index, STAR_CLUSTERS.length);

            return (
              <React.Fragment key={cluster.id}>
                {/* Sector Transition Waypoint Dividers */}
                {index === 3 && (
                  <div
                    style={{
                      margin: '5rem 0 3rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                      opacity: 0.85,
                    }}
                  >
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.4))' }} />
                    <div
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '999px',
                        background: 'rgba(167, 139, 250, 0.1)',
                        border: '1px solid rgba(167, 139, 250, 0.35)',
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        color: '#c4b5fd',
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Radio size={14} color="#a78bfa" />
                      SECTOR II • THE QUANTUM RIFT // DEPTH: 1,400 LY
                    </div>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.4), transparent)' }} />
                  </div>
                )}

                {index === 9 && (
                  <div
                    style={{
                      margin: '5rem 0 3rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                      opacity: 0.85,
                    }}
                  >
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(244, 63, 94, 0.4))' }} />
                    <div
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '999px',
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.35)',
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        color: '#fda4af',
                        letterSpacing: '0.08em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <ShieldAlert size={14} color="#f43f5e" />
                      SECTOR III • THE EVENT HORIZON // CRITICAL VELOCITY
                    </div>
                    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.4), transparent)' }} />
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
