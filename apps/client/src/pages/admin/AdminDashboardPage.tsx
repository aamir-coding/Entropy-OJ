import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { IAdminProblemListItem, ProblemDifficulty, ALL_PROBLEM_DIFFICULTIES } from '@entropy-oj/shared';
import { Tooltip } from '../../components/motion/tooltip';
import {
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Code2,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileCode,
  Lock,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<IAdminProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [deletingProblem, setDeletingProblem] = useState<IAdminProblemListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedDifficulty]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/problems');
      if (res.data.success) {
        setProblems(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Failed to load administrative problems list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleDeleteProblem = async () => {
    if (!deletingProblem) return;
    try {
      setIsDeleting(true);
      const res = await api.delete(`/admin/problems/${deletingProblem._id}`);
      if (res.data.success) {
        setProblems((prev) => prev.filter((p) => p._id !== deletingProblem._id));
        setDeletingProblem(null);
      }
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Failed to delete problem.');
      setDeletingProblem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (prob.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (prob.problemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (prob.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ?? false);

      const matchesDifficulty =
        selectedDifficulty === 'All' || prob.difficulty === selectedDifficulty;

      return matchesSearch && matchesDifficulty;
    });
  }, [problems, searchQuery, selectedDifficulty]);

  const totalPages = Math.max(1, Math.ceil(filteredProblems.length / limit));

  const paginatedProblems = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredProblems.slice(start, start + limit);
  }, [filteredProblems, page, limit]);

  const totalHiddenCases = useMemo(
    () => problems.reduce((acc, p) => acc + (p.hiddenCasesCount || 0), 0),
    [problems]
  );
  const totalSampleCases = useMemo(
    () => problems.reduce((acc, p) => acc + (p.sampleCasesCount || 0), 0),
    [problems]
  );

  return (
    <div className="container" style={{ flex: 1, padding: '2rem 1.5rem', width: '100%' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Problem Studio & Admin Hub
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <Shield size={12} /> ADMIN ACCESS
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Create, edit, delete, and test problems with full management of visible sample cases and hidden judge test cases.
          </p>
        </div>

        <Link
          to="/admin/problems/new"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          <Plus size={18} />
          Create New Problem
        </Link>
      </div>

      {/* Error Alert Banner (Issue L-1) */}
      {error && (
        <div
          role="alert"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '0.875rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#f87171',
            fontSize: '0.875rem',
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Problems
            </span>
            <Code2 size={18} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{problems.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Sample Test Cases
            </span>
            <Eye size={18} style={{ color: '#38bdf8' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalSampleCases}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Hidden Judge Cases
            </span>
            <Lock size={18} style={{ color: '#a78bfa' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalHiddenCases}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Test Cases
            </span>
            <Layers size={18} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalSampleCases + totalHiddenCases}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '450px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="input"
            placeholder="Search problems by name, slug, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Difficulty:</span>
          {['All', ...ALL_PROBLEM_DIFFICULTIES].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className="btn btn-sm"
              style={{
                background: selectedDifficulty === diff ? 'var(--accent-cyan)' : 'var(--bg-glass)',
                color: selectedDifficulty === diff ? '#000' : 'var(--text-secondary)',
                borderColor: selectedDifficulty === diff ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Data Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-cyan)' }} />
          <p>Loading problems and test case diagnostics...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--verdict-wa)' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 0.75rem' }} />
          <p>{error}</p>
          <button onClick={fetchProblems} className="btn btn-outline" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <FileCode size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            No problems found
          </p>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {searchQuery ? 'Try adjusting your search criteria or filters.' : 'Get started by creating your first problem.'}
          </p>
          <Link to="/admin/problems/new" className="btn btn-primary">
            <Plus size={16} /> Create Problem
          </Link>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    PROBLEM
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    DIFFICULTY
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    TAGS
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    SAMPLE CASES
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    HIDDEN CASES
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    STATS
                  </th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProblems.map((prob) => {
                  const difficultyClass =
                    prob.difficulty === 'Easy'
                      ? 'pill-easy'
                      : prob.difficulty === 'Medium'
                      ? 'pill-medium'
                      : 'pill-hard';

                  return (
                    <tr
                      key={prob._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <Link
                            to={`/problems/${prob.problemCode}`}
                            target="_blank"
                            style={{
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              textDecoration: 'none',
                              fontSize: '0.95rem',
                            }}
                          >
                            {prob.name}
                            <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
                          </Link>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            #{prob.problemCode}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span className={`pill ${difficultyClass}`}>{prob.difficulty}</span>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {(prob.tags || []).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {(prob.tags?.length || 0) > 3 && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              +{(prob.tags?.length || 0) - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <Tooltip content={`${prob.sampleCasesCount} sample test case${prob.sampleCasesCount === 1 ? '' : 's'}`} side="top">
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#38bdf8',
                              background: 'rgba(56, 189, 248, 0.1)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'default',
                            }}
                          >
                            <Eye size={12} /> {prob.sampleCasesCount}
                          </span>
                        </Tooltip>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <Tooltip content={`${prob.hiddenCasesCount} hidden test case${prob.hiddenCasesCount === 1 ? '' : 's'}`} side="top">
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#a78bfa',
                              background: 'rgba(167, 139, 250, 0.1)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'default',
                            }}
                          >
                            <Lock size={12} /> {prob.hiddenCasesCount}
                          </span>
                        </Tooltip>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {prob.acceptedSubmissions} / {prob.totalSubmissions}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {prob.acceptanceRate}% AC
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <Tooltip content="Edit problem & test cases" side="top">
                            <button
                              onClick={() => navigate(`/admin/problems/${prob._id}/edit`)}
                              className="btn btn-sm btn-outline"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                            >
                              <Edit size={13} /> Edit
                            </button>
                          </Tooltip>
                          <Tooltip content="Delete problem" side="top">
                            <button
                              onClick={() => setDeletingProblem(prob)}
                              className="btn btn-sm"
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--verdict-wa)',
                                borderColor: 'rgba(239, 68, 68, 0.25)',
                                fontSize: '0.75rem',
                                padding: '0.35rem 0.6rem',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </Tooltip>
                        </div>
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
                  {filteredProblems.length === 0 ? 0 : (page - 1) * limit + 1}
                </span>{' '}
                –{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {Math.min(page * limit, filteredProblems.length)}
                </span>{' '}
                of{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {filteredProblems.length}
                </span>{' '}
                problems
              </div>

              {/* Center: Page Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Tooltip content="Previous page" side="top">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="btn btn-outline"
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.75rem',
                        opacity: page <= 1 ? 0.4 : 1,
                        cursor: page <= 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronLeft size={14} />
                      <span>Prev</span>
                    </button>
                  </Tooltip>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
                        border: p === page ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        background: p === page ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        color: p === page ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <Tooltip content="Next page" side="top">
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="btn btn-outline"
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.75rem',
                        opacity: page >= totalPages ? 0.4 : 1,
                        cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </Tooltip>
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProblem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--verdict-wa)',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Delete Problem?</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  This action is permanent and cannot be undone.
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong>{deletingProblem.name}</strong> (<code>#{deletingProblem.problemCode}</code>)?
              <br /><br />
              This will <strong>permanently cascade delete</strong> all {deletingProblem.totalCasesCount} associated test cases and all user submissions for this problem.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeletingProblem(null)}
                className="btn btn-outline"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProblem}
                className="btn"
                disabled={isDeleting}
                style={{
                  background: 'var(--verdict-wa)',
                  color: '#fff',
                  borderColor: 'var(--verdict-wa)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
