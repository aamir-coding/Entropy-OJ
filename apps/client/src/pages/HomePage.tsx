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
    <div className="page-wrapper" style={{ padding: '1.75rem 0 4rem' }}>
      <div className="container">
        {/* Hero Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem 2rem',
            marginBottom: '1.25rem',
            background: 'var(--bg-card)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-40px',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(77,171,247,0.10) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <span className="badge badge-tag" style={{ background: 'rgba(77,171,247,0.10)', color: 'var(--accent-cyan)', borderColor: 'rgba(77,171,247,0.22)' }}>
                  <Shield size={11} /> Dockerized Sandbox
                </span>
                <span className="badge badge-tag" style={{ background: 'rgba(52,211,153,0.10)', color: 'var(--verdict-ac)', borderColor: 'rgba(52,211,153,0.22)' }}>
                  <Code size={11} /> C++17 & Python 3
                </span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
                Solve. Submit.{' '}
                <span style={{ color: 'var(--accent-cyan)' }}>Live Verdicts.</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.65, maxWidth: '520px' }}>
                Master algorithmic data structures with an isolated execution sandbox, microsecond CPU timing, and real-time judge feedback.
              </p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '1.125rem 1.375rem',
                  minWidth: '130px',
                  textAlign: 'center',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-faint)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {problems.length}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.3rem' }}>
                  Problems
                </div>
              </div>

              {user && stats && (
                <div
                  style={{
                    padding: '1.125rem 1.375rem',
                    minWidth: '130px',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-faint)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--verdict-ac)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {stats.solvedProblemsCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.3rem' }}>
                    Solved
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
            padding: '1rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1', minWidth: '260px', maxWidth: '380px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
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
                placeholder="Search problems..."
                className="input-control"
                style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
              />
            </div>

            {/* Difficulty Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => {
                const isActive = selectedDifficulty === diff;
                let activeStyle = {};
                if (isActive) {
                  if (diff === 'Easy') activeStyle = { background: 'var(--diff-easy-bg)', color: 'var(--diff-easy)', borderColor: 'rgba(52,211,153,0.4)' };
                  else if (diff === 'Medium') activeStyle = { background: 'var(--diff-medium-bg)', color: 'var(--diff-medium)', borderColor: 'rgba(251,191,36,0.4)' };
                  else if (diff === 'Hard') activeStyle = { background: 'var(--diff-hard-bg)', color: 'var(--diff-hard)', borderColor: 'rgba(251,113,133,0.4)' };
                  else activeStyle = { background: 'var(--accent-cyan-glow)', color: 'var(--accent-cyan)', borderColor: 'rgba(77,171,247,0.4)' };
                }

                return (
                  <button
                    key={diff}
                    id={`filter-diff-${diff.toLowerCase()}`}
                    onClick={() => setSelectedDifficulty(diff)}
                    className="btn btn-outline"
                    style={{
                      padding: '0.3rem 0.75rem',
                      fontSize: '0.75rem',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.625rem', borderTop: '1px solid var(--border-faint)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginRight: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Filter size={11} /> Tags
            </span>
            {allTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  id={`filter-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    background: isSelected ? 'rgba(77,171,247,0.14)' : 'rgba(255,255,255,0.03)',
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: `1px solid ${isSelected ? 'rgba(77,171,247,0.35)' : 'var(--border-faint)'}`,
                    borderRadius: 'var(--radius-full)',
                    padding: '0.175rem 0.6rem',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    letterSpacing: 0,
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
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <Clock size={28} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading problem catalog...</p>
            </div>
          ) : problems.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <HelpCircle size={36} style={{ margin: '0 auto 1rem', color: 'var(--text-faint)' }} />
              <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>No matching problems</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Try clearing filters or your search query.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.75rem 1.125rem', width: '56px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '0.75rem 1.125rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                    <th style={{ padding: '0.75rem 1.125rem', width: '110px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</th>
                    <th style={{ padding: '0.75rem 1.125rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</th>
                    <th style={{ padding: '0.75rem 1.125rem', width: '150px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acceptance</th>
                    <th style={{ padding: '0.75rem 1.125rem', width: '100px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
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
                          borderBottom: '1px solid var(--border-faint)',
                          transition: 'background-color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Status Icon */}
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          {prob.userStatus === 'Solved' ? (
                            <CheckCircle size={16} style={{ color: 'var(--verdict-ac)' }} />
                          ) : prob.userStatus === 'Attempted' ? (
                            <Clock size={16} style={{ color: 'var(--verdict-tle)' }} />
                          ) : (
                            <span style={{ color: 'var(--text-faint)', fontSize: '1rem' }}>—</span>
                          )}
                        </td>

                        {/* Title & Code */}
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <Link
                            to={`/problems/${prob.problemCode}`}
                            id={`problem-link-${prob.problemCode}`}
                            style={{
                              color: 'var(--text-primary)',
                              fontWeight: 600,
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            <span>{prob.name}</span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: 'var(--text-faint)',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 500,
                              }}
                            >
                              #{prob.problemCode}
                            </span>
                          </Link>
                        </td>

                        {/* Difficulty */}
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <span className={`badge ${diffBadgeClass}`}>{prob.difficulty}</span>
                        </td>

                        {/* Tags */}
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {prob.tags.map((tag) => (
                              <span key={tag} className="badge badge-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Acceptance */}
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div
                              style={{
                                flex: 1,
                                height: '4px',
                                background: 'var(--bg-elevated)',
                                borderRadius: '2px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${prob.acceptanceRate}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, var(--accent-cyan), var(--verdict-ac))',
                                  borderRadius: '2px',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', minWidth: '38px', fontFamily: 'var(--font-mono)' }}>
                              {prob.acceptanceRate}%
                            </span>
                          </div>
                        </td>

                        {/* Solve CTA */}
                        <td style={{ padding: '0.875rem 1.125rem', textAlign: 'right' }}>
                          <Link
                            to={`/problems/${prob.problemCode}`}
                            className="btn btn-outline"
                            style={{
                              padding: '0.3rem 0.65rem',
                              fontSize: '0.72rem',
                              borderRadius: 'var(--radius-md)',
                            }}
                          >
                            <span>Solve</span>
                            <ChevronRight size={12} />
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
