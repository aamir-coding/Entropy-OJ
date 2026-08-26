import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IProblemListItem, ProblemDifficulty } from '@anti-oj/shared';
import {
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  Code,
  Shield,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, stats } = useAuth();
  const [problems, setProblems] = useState<IProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (selectedTag !== 'All') params.tag = selectedTag;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/problems', { params });
      if (res.data.success) {
        setProblems(res.data.data.problems);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [selectedDifficulty, selectedTag, searchQuery, user]);

  const allTags = [
    'All',
    'Array',
    'Hash Table',
    'Stack',
    'String',
    'Two Pointers',
    'Dynamic Programming',
    'Sliding Window',
  ];

  return (
    <div className="page-wrapper" style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Hero Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem 2rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Background Glow Accent */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '650px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-tag" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                  <Shield size={12} /> Dockerized Isolation Engine
                </span>
                <span className="badge badge-tag" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--verdict-ac)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <Code size={12} /> C++17 & Python 3
                </span>
              </div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem' }}>
                Solve. Submit. <span style={{ color: 'var(--accent-cyan)' }}>Receive Live Verdicts.</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                Master algorithmic data structures with an isolated execution sandbox, microsecond CPU time measurement, and real-time judge feedback.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div
                className="glass-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  minWidth: '140px',
                  textAlign: 'center',
                  background: 'rgba(15, 23, 42, 0.8)',
                }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                  {problems.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Problems
                </div>
              </div>

              {user && stats && (
                <div
                  className="glass-card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    minWidth: '140px',
                    textAlign: 'center',
                    background: 'rgba(15, 23, 42, 0.8)',
                  }}
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--verdict-ac)' }}>
                    {stats.solvedProblemsCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Solved By You
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '420px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="search-problems-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problem title or code..."
                className="input-control"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {/* Difficulty Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
                const isActive = selectedDifficulty === diff;
                let activeStyle = {};
                if (isActive) {
                  if (diff === 'Easy') activeStyle = { background: 'var(--diff-easy-bg)', color: 'var(--diff-easy)', borderColor: 'var(--diff-easy)' };
                  else if (diff === 'Medium') activeStyle = { background: 'var(--diff-medium-bg)', color: 'var(--diff-medium)', borderColor: 'var(--diff-medium)' };
                  else if (diff === 'Hard') activeStyle = { background: 'var(--diff-hard-bg)', color: 'var(--diff-hard)', borderColor: 'var(--diff-hard)' };
                  else activeStyle = { background: 'var(--accent-cyan-glow)', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' };
                }

                return (
                  <button
                    key={diff}
                    id={`filter-diff-${diff.toLowerCase()}`}
                    onClick={() => setSelectedDifficulty(diff)}
                    className="btn btn-outline"
                    style={{
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.8125rem',
                      ...activeStyle,
                    }}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Chips Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
              <Filter size={12} /> Tags:
            </span>
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  id={`filter-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-full)',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Problem List Table */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <Clock size={32} className="text-sky-400" />
              </div>
              <p>Loading problem catalog...</p>
            </div>
          ) : problems.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <HelpCircle size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No matching problems found</h3>
              <p style={{ fontSize: '0.875rem' }}>Try clearing filters or search query.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.6)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.875rem 1.25rem', width: '60px' }}>Status</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Title</th>
                    <th style={{ padding: '0.875rem 1.25rem', width: '120px' }}>Difficulty</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Tags</th>
                    <th style={{ padding: '0.875rem 1.25rem', width: '160px' }}>Acceptance</th>
                    <th style={{ padding: '0.875rem 1.25rem', width: '120px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((prob) => {
                    const diffBadgeClass =
                      prob.difficulty === 'Easy'
                        ? 'badge-easy'
                        : prob.difficulty === 'Medium'
                        ? 'badge-medium'
                        : 'badge-hard';

                    return (
                      <tr
                        key={prob._id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(51, 65, 85, 0.2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Status Icon */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          {prob.userStatus === 'Solved' ? (
                            <CheckCircle size={18} className="text-emerald-400" />
                          ) : prob.userStatus === 'Attempted' ? (
                            <Clock size={18} className="text-amber-400" />
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>—</span>
                          )}
                        </td>

                        {/* Title & Code */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <Link
                            to={`/problems/${prob.problemCode}`}
                            id={`problem-link-${prob.problemCode}`}
                            style={{
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: '0.9375rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <span>{prob.name}</span>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              #{prob.problemCode}
                            </span>
                          </Link>
                        </td>

                        {/* Difficulty */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className={`badge ${diffBadgeClass}`}>{prob.difficulty}</span>
                        </td>

                        {/* Tags */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {prob.tags.map((tag) => (
                              <span key={tag} className="badge badge-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Acceptance */}
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div
                              style={{
                                flex: 1,
                                height: '6px',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '3px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${prob.acceptanceRate}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '42px' }}>
                              {prob.acceptanceRate}%
                            </span>
                          </div>
                        </td>

                        {/* Solve CTA */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <Link
                            to={`/problems/${prob.problemCode}`}
                            className="btn btn-outline"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <span>Solve</span>
                            <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
