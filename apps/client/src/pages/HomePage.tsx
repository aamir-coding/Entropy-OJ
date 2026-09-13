import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api, isCancel } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { IProblemListItem } from '@entropy-oj/shared';
import { Tabs, TabItem } from '../components/motion/tabs';
import { NumberTicker } from '../components/motion/number-ticker';
import { TableSkeleton } from '../components/motion/skeleton';
import { Tooltip } from '../components/motion/tooltip';
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
  Eye,
  EyeOff,
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
  const [blindMode, setBlindMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('entropy_blind_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleBlindMode = () => {
    setBlindMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('entropy_blind_mode', String(next));
      } catch {}
      return next;
    });
  };

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

  // Set page title
  useEffect(() => {
    document.title = 'Problems | Entropy';
  }, []);

  // Debounce search query input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [retryTrigger, setRetryTrigger] = useState(0);

  // Consolidated filter-reset and data fetching (High 1: eliminates duplicate requests on page reset)
  const filterKey = `${selectedDifficulty}|${selectedTags.slice().sort().join(',')}|${debouncedSearchQuery}`;
  const prevFilterKeyRef = useRef(filterKey);

  // Fetch problems with request cancellation to prevent race conditions (Issue H-2, Low 3)
  useEffect(() => {
    // If filters or search changed while on page > 1, reset page synchronously and skip fetching with old page index
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    const controller = new AbortController();

    const loadProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: Record<string, any> = {
          page: String(page),
          limit: String(limit),
        };
        if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
        if (selectedTags.length > 0) params.tags = selectedTags;
        if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();

        const res = await api.get('/problems', {
          params,
          paramsSerializer: {
            indexes: null,
          },
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
  }, [filterKey, user?._id, page, limit, retryTrigger]);

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
            padding: '1.75rem 2rem',
            marginBottom: '1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <span className="badge badge-tag">
                  <Shield size={10} /> Docker Sandbox
                </span>
                <span className="badge badge-tag">
                  <Code size={10} /> C++17 & Python 3
                </span>
              </div>
              <h1 className="text-gradient" style={{ fontSize: '1.875rem', fontWeight: 400, lineHeight: 1.15, marginBottom: '0.5rem', letterSpacing: '-0.035em' }}>
                Solve. Submit. Live Verdicts.
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '520px' }}>
                Master algorithmic data structures with an isolated execution sandbox, microsecond CPU timing, and real-time judge feedback.
              </p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <div
                style={{
                  padding: '0.875rem 1.25rem',
                  minWidth: '120px',
                  textAlign: 'center',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--brand-white)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  <NumberTicker value={totalCatalogCount || 150} />
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.35rem' }}>
                  Problems
                </div>
              </div>

              {user && stats && (
                <Tooltip content="View your solved problems in Profile" side="bottom">
                  <Link
                    to="/profile"
                    id="home-solved-stat-link"
                    style={{
                      padding: '0.875rem 1.25rem',
                      minWidth: '120px',
                      textAlign: 'center',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      textDecoration: 'none',
                      display: 'block',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-medium)';
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--verdict-ac)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      <NumberTicker value={stats.solvedProblemsCount} />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.35rem' }}>
                      Solved
                    </div>
                  </Link>
                </Tooltip>
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
            <Tabs
              tabs={[
                { id: 'All', label: 'All', activeColor: 'var(--brand-black)', activeBg: 'var(--brand-white)', activeBorder: 'var(--brand-white)' },
                { id: 'Easy', label: 'Easy', activeColor: 'var(--diff-easy)', activeBg: 'var(--diff-easy-bg)', activeBorder: 'rgba(5, 223, 114, 0.5)' },
                { id: 'Medium', label: 'Medium', activeColor: 'var(--diff-medium)', activeBg: 'var(--diff-medium-bg)', activeBorder: 'rgba(245, 158, 11, 0.5)' },
                { id: 'Hard', label: 'Hard', activeColor: 'var(--diff-hard)', activeBg: 'var(--diff-hard-bg)', activeBorder: 'rgba(255, 101, 104, 0.5)' },
              ]}
              activeId={selectedDifficulty}
              onChange={(id) => setSelectedDifficulty(id)}
              layoutId="home-difficulty-tabs-indicator"
              tabIdPrefix="filter-diff-"
              variant="pill"
              size="sm"
            />
          </div>

          {/* Tags Chips Bar - disappears in blind mode with no resize or layout shift */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexWrap: 'wrap',
              paddingTop: '0.625rem',
              borderTop: '1px solid var(--border-faint)',
              visibility: blindMode ? 'hidden' : 'visible',
              opacity: blindMode ? 0 : 1,
              pointerEvents: blindMode ? 'none' : 'auto',
              transition: 'opacity 0.2s ease, visibility 0.2s ease',
            }}
          >
            <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                    background: isSelected ? 'var(--brand-neutral-600)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--brand-white)' : 'var(--text-muted)',
                    border: `1px solid ${isSelected ? 'var(--border-strong)' : 'var(--border-faint)'}`,
                    borderRadius: 'var(--radius-xs)',
                    padding: '0.15rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: isSelected ? 500 : 400,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    letterSpacing: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
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
            <TableSkeleton rows={Math.min(limit, 10)} />
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
                  <tr style={{ background: '#080808', borderBottom: '1px solid var(--border-medium)' }}>
                    <th style={{ padding: '0.65rem 1rem', width: '54px', color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                    <th style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</th>
                    <th style={{ padding: '0.65rem 1rem', width: '110px', color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Difficulty</th>
                    <th style={{ padding: '0.65rem 1rem', width: '230px', minWidth: '230px', color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span>Tags</span>
                        <Tooltip
                          content={blindMode ? 'Tags are hidden (Blind Mode). Click to Unhide.' : 'Turn on Blind Mode (Hide tags)'}
                          side="top"
                        >
                          <button
                            type="button"
                            id="toggle-blind-mode"
                            onClick={handleToggleBlindMode}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem',
                              padding: '0.15rem 0.45rem',
                              width: '68px',
                              boxSizing: 'border-box',
                              fontSize: '0.625rem',
                              fontFamily: 'var(--font-mono)',
                              borderRadius: '9999px',
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              outline: 'none',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-medium)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-subtle)';
                              e.currentTarget.style.color = 'var(--text-muted)';
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '13px',
                                height: '13px',
                                borderRadius: '50%',
                                background: 'transparent',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {blindMode ? <EyeOff size={10} style={{ color: 'var(--text-muted)' }} /> : <Eye size={10} style={{ color: 'var(--text-muted)' }} />}
                            </span>
                            <span style={{ fontSize: '0.625rem', letterSpacing: '0.02em', textTransform: 'none', fontWeight: 500, color: 'var(--text-muted)' }}>
                              {blindMode ? 'Unhide' : 'Hide'}
                            </span>
                          </button>
                        </Tooltip>
                      </div>
                    </th>
                    <th style={{ padding: '0.65rem 1rem', width: '150px', color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Acceptance</th>
                    <th style={{ padding: '0.65rem 1rem', width: '90px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action</th>
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
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Status Icon */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {prob.userStatus === 'Solved' ? (
                            <Tooltip content="Solved (Accepted)" side="right">
                              <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                <CheckCircle size={15} style={{ color: 'var(--verdict-ac)' }} />
                              </span>
                            </Tooltip>
                          ) : prob.userStatus === 'Attempted' ? (
                            <Tooltip content="Attempted (Unsolved)" side="right">
                              <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                <Clock size={15} style={{ color: 'var(--verdict-tle)' }} />
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip content="Not attempted" side="right">
                              <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem', cursor: 'default' }}>—</span>
                            </Tooltip>
                          )}
                        </td>

                        {/* Title & Code */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <Link
                            to={`/problems/${prob.problemCode}`}
                            id={`problem-link-${prob.problemCode}`}
                            style={{
                              color: 'var(--brand-white)',
                              fontWeight: 500,
                              textDecoration: 'none',
                              fontSize: '0.8125rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              letterSpacing: '-0.015em',
                            }}
                          >
                            <span>{prob.name}</span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 400,
                              }}
                            >
                              #{prob.problemCode}
                            </span>
                          </Link>
                        </td>

                        {/* Difficulty */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className={`badge ${diffBadgeClass}`}>{prob.difficulty}</span>
                        </td>

                        {/* Tags */}
                        <td style={{ padding: '0.75rem 1rem', width: '230px' }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: '0.25rem',
                              flexWrap: 'wrap',
                              filter: blindMode ? 'blur(4.5px)' : 'none',
                              userSelect: blindMode ? 'none' : 'auto',
                              pointerEvents: blindMode ? 'none' : 'auto',
                              transition: 'filter 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                              willChange: 'filter',
                            }}
                          >
                            {prob.tags.map((tag) => (
                              <span key={tag} className="badge badge-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Acceptance */}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {prob.totalSubmissions === 0 ? (
                            <Tooltip content="No submissions yet" side="top">
                              <span style={{ color: 'var(--text-faint)', fontSize: '0.875rem', cursor: 'default', paddingLeft: '0.25rem' }}>
                                —
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip content={`Acceptance: ${prob.acceptanceRate}% (${prob.acceptedSubmissions}/${prob.totalSubmissions})`} side="top">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default' }}>
                                <div
                                  style={{
                                    flex: 1,
                                    height: '3px',
                                    background: 'var(--brand-neutral-600)',
                                    borderRadius: '1px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${prob.acceptanceRate}%`,
                                      height: '100%',
                                      background: 'var(--brand-white)',
                                      borderRadius: '1px',
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)', minWidth: '34px', fontFamily: 'var(--font-mono)' }}>
                                  {prob.acceptanceRate}%
                                </span>
                              </div>
                            </Tooltip>
                          )}
                        </td>

                        {/* Solve CTA */}
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <Link
                            to={`/problems/${prob.problemCode}`}
                            className="btn btn-outline"
                            style={{
                              padding: '0.25rem 0.55rem',
                              fontSize: '0.72rem',
                              borderRadius: 'var(--radius-xs)',
                              border: '1px solid var(--border-medium)',
                            }}
                          >
                            <span>Solve</span>
                            <ChevronRight size={11} />
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
                  padding: '0.75rem 1.25rem',
                  borderTop: '1px solid var(--border-medium)',
                  background: '#080808',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                {/* Left: Range Info */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Showing{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  –{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {pagination.total}
                  </span>
                </div>

                {/* Center: Page Controls */}
                {pagination.totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Tooltip content="Previous Page" side="top">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.page <= 1}
                        className="btn btn-outline"
                        style={{
                          padding: '0.25rem 0.55rem',
                          fontSize: '0.75rem',
                          borderRadius: 'var(--radius-xs)',
                          opacity: pagination.page <= 1 ? 0.35 : 1,
                          cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <ChevronLeft size={13} />
                        <span>Prev</span>
                      </button>
                    </Tooltip>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          minWidth: '26px',
                          height: '26px',
                          padding: '0 0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: p === pagination.page ? 600 : 400,
                          borderRadius: 'var(--radius-xs)',
                          border: p === pagination.page ? '1px solid var(--brand-white)' : '1px solid var(--border-medium)',
                          background: p === pagination.page ? 'var(--brand-white)' : 'transparent',
                          color: p === pagination.page ? 'var(--brand-black)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {p}
                      </button>
                    ))}

                    <Tooltip content="Next Page" side="top">
                      <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="btn btn-outline"
                        style={{
                          padding: '0.25rem 0.55rem',
                          fontSize: '0.75rem',
                          borderRadius: 'var(--radius-xs)',
                          opacity: pagination.page >= pagination.totalPages ? 0.35 : 1,
                          cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <span>Next</span>
                        <ChevronRight size={13} />
                      </button>
                    </Tooltip>
                  </div>
                )}

                {/* Right: Per-Page Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
                      background: '#0a0a0a',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value={10} style={{ background: '#0a0a0a', color: '#f7f7f7' }}>10</option>
                    <option value={20} style={{ background: '#0a0a0a', color: '#f7f7f7' }}>20 (Default)</option>
                    <option value={30} style={{ background: '#0a0a0a', color: '#f7f7f7' }}>30</option>
                    <option value={50} style={{ background: '#0a0a0a', color: '#f7f7f7' }}>50</option>
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
