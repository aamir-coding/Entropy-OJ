import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, isCancel } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IProblemListItem } from '@anti-oj/shared';
import {
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  Code,
  Shield,
  ChevronRight,
  ChevronLeft,
  Filter,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, stats, refreshUser } = useAuth();
  const [problems, setProblems] = useState<IProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(0);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  // Refresh user stats upon navigating to Home
  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, [user?._id, refreshUser]);

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setPage(1);
  }, [selectedDifficulty, selectedTags, debouncedSearchQuery]);

  // Set page title
  useEffect(() => {
    document.title = 'Problems | Anti Online Judge';
  }, []);

  // Debounce search query input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [retryTrigger, setRetryTrigger] = useState(0);

  // Fetch problems with request cancellation to prevent race conditions (Issue H-2)
  useEffect(() => {
    const controller = new AbortController();

    const loadProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: Record<string, string> = {
          page: String(page),
          limit: String(limit),
        };
        if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
        if (selectedTags.length > 0) params.tags = selectedTags.join(',');
        if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();

        const res = await api.get('/problems', {
          params,
          signal: controller.signal,
        });
        if (res.data.success) {
          setProblems(res.data.data.problems);
          if (res.data.data.totalCatalogProblems !== undefined) {
            setTotalCatalogCount(res.data.data.totalCatalogProblems);
          } else if (res.data.data.pagination?.totalCatalog !== undefined) {
            setTotalCatalogCount(res.data.data.pagination.totalCatalog);
          }
          if (res.data.data.pagination) {
            setPagination(res.data.data.pagination);
          }
        }
      } catch (err: any) {
        if (
          controller.signal.aborted ||
          isCancel(err) ||
          err.name === 'CanceledError' ||
          err.name === 'AbortError' ||
          err.code === 'ERR_CANCELED' ||
          err.message === 'canceled'
        ) {
          return;
        }
        console.error('Failed to fetch problems:', err);
        setError(err.message || 'Unable to connect to the problem catalog. Please try again.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProblems();

    return () => {
      controller.abort();
    };
  }, [selectedDifficulty, selectedTags, debouncedSearchQuery, user?._id, retryTrigger, page, limit]);

  const handleTagClick = (tag: string) => {
    if (tag === 'All') {
      setSelectedTags([]);
    } else {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    }
  };

  const allTags = [
    'All',
    'Array',
    'Hash Table',
    'Two Pointers',
    'Sliding Window',
    'Stack',
    'Binary Search',
    'Linked List',
    'Tree',
    'Trie',
    'Heap',
    'Backtracking',
    'Graph',
    'Dynamic Programming',
    'Greedy',
    'Intervals',
    'Math',
    'Bit Manipulation',
    'String',
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
                  {totalCatalogCount || 150}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.3rem' }}>
                  Problems
                </div>
              </div>

              {user && stats && (
                <Link
                  to="/profile"
                  id="home-solved-stat-link"
                  style={{
                    padding: '1.125rem 1.375rem',
                    minWidth: '130px',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-faint)',
                    borderRadius: 'var(--radius-lg)',
                    textDecoration: 'none',
                    display: 'block',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(52, 211, 153, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-faint)';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  title="View your solved problems in Profile"
                >
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--verdict-ac)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {stats.solvedProblemsCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.3rem' }}>
                    Solved
                  </div>
                </Link>
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
                aria-label="Search problems by name or code"
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
              const isSelected = tag === 'All' ? selectedTags.length === 0 : selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  id={`filter-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleTagClick(tag)}
                  style={{
                    background: isSelected ? 'rgba(77,171,247,0.14)' : 'rgba(255,255,255,0.03)',
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: `1px solid ${isSelected ? 'rgba(77,171,247,0.4)' : 'var(--border-faint)'}`,
                    borderRadius: 'var(--radius-full)',
                    padding: '0.175rem 0.6rem',
                    fontSize: '0.7rem',
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    letterSpacing: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title={tag === 'All' ? 'Clear all tag filters' : isSelected ? `Click to remove ${tag} filter` : `Click to filter by ${tag}`}
                >
                  <span>{tag}</span>
                  {tag !== 'All' && isSelected && (
                    <span style={{ fontSize: '0.75rem', lineHeight: 1, opacity: 0.8 }}>&times;</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            style={{
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
              background: 'var(--verdict-wa-bg)',
              border: '1px solid var(--verdict-wa-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--verdict-wa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
            <button
              onClick={() => setRetryTrigger((c) => c + 1)}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderColor: 'var(--verdict-wa-border)', color: 'var(--verdict-wa)' }}
            >
              <RotateCcw size={13} />
              <span>Retry</span>
            </button>
          </div>
        )}

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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                No match found
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                {selectedTags.length > 0
                  ? 'No problems match the selected tags.'
                  : 'No problems match your current filters.'}
              </p>
              <button
                onClick={() => {
                  setSelectedTags([]);
                  setSelectedDifficulty('All');
                  setSearchQuery('');
                }}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.4rem 1.25rem' }}
              >
                Reset
              </button>
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

              {/* Pagination Controls Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1.25rem',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                {/* Left: Range Info */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Showing{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  –{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {pagination.total}
                  </span>{' '}
                  problems
                </div>

                {/* Center: Page Controls */}
                {pagination.totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page <= 1}
                      className="btn btn-outline"
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.75rem',
                        opacity: pagination.page <= 1 ? 0.4 : 1,
                        cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                      }}
                      title="Previous Page"
                    >
                      <ChevronLeft size={14} />
                      <span>Prev</span>
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          minWidth: '28px',
                          height: '28px',
                          padding: '0 0.4rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-sm)',
                          border: p === pagination.page ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                          background: p === pagination.page ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                          color: p === pagination.page ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.page >= pagination.totalPages}
                      className="btn btn-outline"
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.75rem',
                        opacity: pagination.page >= pagination.totalPages ? 0.4 : 1,
                        cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                      }}
                      title="Next Page"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* Right: Per-Page Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      width: 'auto',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value={10} style={{ background: '#18181b', color: '#f4f4f5' }}>10</option>
                    <option value={20} style={{ background: '#18181b', color: '#f4f4f5' }}>20 (Default)</option>
                    <option value={30} style={{ background: '#18181b', color: '#f4f4f5' }}>30</option>
                    <option value={50} style={{ background: '#18181b', color: '#f4f4f5' }}>50</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
