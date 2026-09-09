import React, { useState, useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STAR_CLUSTERS, TOTAL_GALAXY_PROBLEMS } from '../../data/galaxyData';

// 5 representative clusters across the 3 sectors placed on the preview canvas
interface DisplayNode {
  clusterId: string;
  x: number; // percentage across canvas width
  y: number; // percentage down canvas height
}

const PREVIEW_NODES: DisplayNode[] = [
  { clusterId: 'arrays-hashing', x: 18, y: 35 },
  { clusterId: 'binary-search', x: 42, y: 22 },
  { clusterId: 'trees', x: 48, y: 72 },
  { clusterId: '1d-dp', x: 78, y: 32 },
  { clusterId: 'graphs', x: 82, y: 75 },
];

const CONNECTIONS = [
  { from: 'arrays-hashing', to: 'binary-search', dash: '3 3', color: 'rgba(255, 255, 255, 0.22)' },
  { from: 'binary-search', to: 'trees', dash: '3 3', color: 'rgba(255, 255, 255, 0.22)' },
  { from: 'binary-search', to: '1d-dp', dash: '3 3', color: 'rgba(255, 255, 255, 0.22)' },
  { from: 'trees', to: 'graphs', dash: '3 3', color: 'rgba(255, 255, 255, 0.22)' },
  { from: '1d-dp', to: 'graphs', dash: '3 3', color: 'rgba(255, 255, 255, 0.22)' },
];

export const GalaxyPreviewWidget: React.FC = () => {
  const nodesWithCluster = useMemo(() => {
    return PREVIEW_NODES.map((node) => {
      const cluster = STAR_CLUSTERS.find((c) => c.id === node.clusterId) || STAR_CLUSTERS[0];
      return {
        ...node,
        cluster,
      };
    });
  }, []);

  const [selectedClusterId, setSelectedClusterId] = useState<string>('trees');

  const selectedCluster = useMemo(() => {
    return STAR_CLUSTERS.find((c) => c.id === selectedClusterId) || STAR_CLUSTERS[0];
  }, [selectedClusterId]);

  // Difficulty counts for the currently selected cluster
  const difficultyCounts = useMemo(() => {
    let easy = 0;
    let med = 0;
    let hard = 0;
    selectedCluster.problems.forEach((p) => {
      if (p.difficulty === 'Easy') easy++;
      else if (p.difficulty === 'Medium') med++;
      else if (p.difficulty === 'Hard') hard++;
    });
    return { easy, med, hard, total: selectedCluster.problems.length };
  }, [selectedCluster]);

  return (
    <div
      style={{
        backgroundColor: '#070707',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        position: 'relative',
        height: '430px',
        minHeight: '430px',
        maxHeight: '430px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Titlebar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          backgroundColor: '#0d0d0d',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ color: '#f7f7f7', fontSize: '0.75rem', fontWeight: 600 }}>
            Galaxy Node Canvas · 18 Star Systems
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              fontSize: '0.65rem',
              fontFamily: "var(--font-mono, monospace)",
              color: '#05df72',
              backgroundColor: 'rgba(5, 223, 114, 0.08)',
              border: '1px solid rgba(5, 223, 114, 0.22)',
              padding: '0.15rem 0.45rem',
              borderRadius: '3px',
              fontWeight: 500,
            }}
          >
            All 18 Systems Open
          </span>

          <Link
            to="/galaxy"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              padding: '0.18rem 0.5rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.68rem',
              fontWeight: 500,
              transition: 'all 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
            }}
          >
            <span>Open Galaxy Map</span>
            <ArrowUpRight size={11} />
          </Link>
        </div>
      </div>

      {/* Interactive Cosmos Map */}
      <div
        style={{
          position: 'relative',
          height: '220px',
          backgroundColor: '#030303',
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.2) 50%, transparent 100%),
            radial-gradient(1px 1px at 100px 160px, rgba(255,255,255,0.15) 50%, transparent 100%),
            radial-gradient(1.5px 1.5px at 220px 80px, rgba(77,171,247,0.25) 50%, transparent 100%),
            radial-gradient(1px 1px at 320px 190px, rgba(255,255,255,0.15) 50%, transparent 100%),
            radial-gradient(1px 1px at 420px 110px, rgba(255,255,255,0.18) 50%, transparent 100%)
          `,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Constellation Connection Vectors: dynamically anchored between exact node centers */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          {CONNECTIONS.map((conn, idx) => {
            const fromNode = PREVIEW_NODES.find((n) => n.clusterId === conn.from);
            const toNode = PREVIEW_NODES.find((n) => n.clusterId === conn.to);
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={idx}
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke={conn.color}
                strokeWidth="1.2"
                strokeDasharray={conn.dash === 'none' ? undefined : conn.dash}
              />
            );
          })}
        </svg>

        {/* Constellation Star Systems */}
        {nodesWithCluster.map((node) => {
          const isSelected = selectedClusterId === node.cluster.id;
          return (
            /* 
              Node Anchor: exactly 18px x 18px matching the core dimensions!
              Positioned at left: node.x%, top: node.y%, transform: translate(-50%, -50%).
              Its dead center is mathematically at (node.x%, node.y%).
            */
            <div
              key={node.cluster.id}
              onClick={() => setSelectedClusterId(node.cluster.id)}
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: isSelected ? 12 : 3,
              }}
            >
              {/* 
                Soft Coronal Glow: anchored directly to the 18px core perimeter with inset: -4px (or -7px when selected).
                Guarantees 100% concentric alignment on all 4 edges with zero 1px ring!
              */}
              <div
                style={{
                  position: 'absolute',
                  inset: isSelected ? '-7px' : '-4px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${node.cluster.coronaGlow} 0%, transparent 75%)`,
                  filter: 'blur(2px)',
                  pointerEvents: 'none',
                  transition: 'inset 220ms ease, opacity 220ms ease',
                  opacity: isSelected ? 1 : 0.65,
                }}
              />

              {/* Solid Celestial Core with inner specular highlight */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, #ffffff 0%, ${node.cluster.spectralColor} 55%, #000000 100%)`,
                  border: isSelected ? '1.5px solid #ffffff' : '1.5px solid rgba(255, 255, 255, 0.65)',
                  boxShadow: isSelected
                    ? `0 0 10px ${node.cluster.spectralColor}, inset 0 0 3px #ffffff`
                    : `0 0 5px ${node.cluster.spectralColor}95, inset 0 0 2px #ffffff`,
                  transition: 'all 200ms ease',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                }}
              />

              {/* 
                Cluster Name Label: positioned absolutely BELOW the core (top: 100%).
                Because it is position: absolute, it does NOT contribute to the outer div's height,
                preserving the core's center at exactly (node.x%, node.y%)!
              */}
              <span
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '0.45rem',
                  fontSize: '0.66rem',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                  backgroundColor: 'rgba(0, 0, 0, 0.88)',
                  padding: '0.12rem 0.42rem',
                  borderRadius: '3px',
                  border: isSelected
                    ? `1px solid ${node.cluster.spectralColor}80`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.02em',
                  transition: 'all 180ms ease',
                  pointerEvents: 'auto',
                }}
              >
                {node.cluster.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Selected Star System Telemetry Strip */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0.85rem 1rem',
          backgroundColor: '#090909',
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Cluster Name & Sector Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: selectedCluster.spectralColor,
                boxShadow: `0 0 8px ${selectedCluster.spectralColor}`,
              }}
            />
            <span style={{ color: '#f7f7f7', fontWeight: 600, fontSize: '0.82rem' }}>
              {selectedCluster.name}
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                fontFamily: "var(--font-mono, monospace)",
                color: 'rgba(255, 255, 255, 0.45)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                padding: '0.1rem 0.35rem',
                borderRadius: '2px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {selectedCluster.designation} · {selectedCluster.sectorName}
            </span>
          </div>
        </div>

        {/* Sector Topic Description */}
        <div style={{ fontSize: '0.72rem', lineHeight: 1.45, color: 'rgba(255, 255, 255, 0.5)' }}>
          {selectedCluster.sectorDescription}
        </div>

        {/* Difficulty Breakdown Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '0.5rem',
            fontSize: '0.68rem',
            fontFamily: "var(--font-mono, monospace)",
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Difficulties:</span>
            <span style={{ color: '#05df72' }}>Easy: {difficultyCounts.easy}</span>
            <span style={{ color: '#f59e0b' }}>Medium: {difficultyCounts.med}</span>
            <span style={{ color: '#ff6568' }}>Hard: {difficultyCounts.hard}</span>
          </div>

          <div style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
            <span style={{ color: selectedCluster.spectralColor, fontWeight: 600 }}>
              {difficultyCounts.total}
            </span>{' '}
            Problems in System
          </div>
        </div>
      </div>
    </div>
  );
};
