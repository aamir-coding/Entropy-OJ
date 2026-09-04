import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ViewCodeModal } from '../components/ViewCodeModal';
import {
  Mail,
  Calendar,
  Trophy,
  CheckCircle2,
  Clock,
  HardDrive,
  Loader2,
  FileCode,
  AlertCircle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';

interface ISolvedProblemItem {
  _id: string;
  problem: {
    _id: string;
    problemCode: string;
    name: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tags?: string[];
  };
  language: string;
  executionTime?: number;
  memoryUsed?: number;
  code?: string;
  solvedAt: string | Date;
}

export const ProfilePage: React.FC = () => {
  const { user, stats, loading: authLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [solvedProblems, setSolvedProblems] = useState<ISolvedProblemItem[]>([]);
  const [loadingSolved, setLoadingSolved] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('All');

  const [viewCodeModal, setViewCodeModal] = useState<{
    open: boolean;
    code: string;
    language: string;
    problemName?: string;
    verdict?: string;
  }>({
    open: false,
    code: '',
    language: 'cpp',
  });

  useEffect(() => {
    document.title = 'Profile & Solved Problems | Anti Online Judge';
  }, []);

  const fetchSolvedProblems = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingSolved(true);
      setError(null);
      const res = await api.get(`/submissions/user/${user._id}/solved`);
      if (res.data.success) {
        setSolvedProblems(res.data.data.solvedProblems || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch solved problems:', err);
      setError(err.message || 'Failed to load solved problems list.');
    } finally {
      setLoadingSolved(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSolvedProblems();
    }
  }, [user, fetchSolvedProblems]);

  if (authLoading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrapper" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '480px' }}>
          <div className="glass-panel" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Please Sign In</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You must be signed in to view your solved stats and completed challenges.
            </p>
            <button onClick={() => openAuthModal('login')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const difficultyFilters = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredSolved = solvedProblems.filter((item) => {
    if (selectedDifficultyFilter === 'All') return true;
    return item.problem.difficulty === selectedDifficultyFilter;
  });

  return (
    <div className="page-wrapper" style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* User Profile Header Card */}
        <div
          className="glass-panel"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: '0 0 24px rgba(56, 189, 248, 0.3)',
              }}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </div>

            {/* Meta Info */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user.fullName}</h1>
                <span className={`badge ${user.role === 'admin' ? 'badge-hard' : 'badge-easy'}`} style={{ textTransform: 'uppercase' }}>
                  {user.role}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} style={{ color: 'var(--accent-cyan)' }} />
                  {user.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} style={{ color: 'var(--accent-cyan)' }} />
                  Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats Overview Grid */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Solved Problems Breakdown */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Solved Problems
                </span>
                <Trophy size={20} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '1rem' }}>
                {stats.solvedProblemsCount}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Easy */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--diff-easy)', fontWeight: 600 }}>Easy</span>
                  <span style={{ fontWeight: 700 }}>{stats.easySolved}</span>
                </div>
                {/* Medium */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--diff-medium)', fontWeight: 600 }}>Medium</span>
                  <span style={{ fontWeight: 700 }}>{stats.mediumSolved}</span>
                </div>
                {/* Hard */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--diff-hard)', fontWeight: 600 }}>Hard</span>
                  <span style={{ fontWeight: 700 }}>{stats.hardSolved}</span>
                </div>
              </div>
            </div>

            {/* Overall Accuracy */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Acceptance Rate
                </span>
                <CheckCircle2 size={20} style={{ color: 'var(--verdict-ac)' }} />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--verdict-ac)', marginBottom: '0.25rem' }}>
                {stats.acceptanceRate}%
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {stats.acceptedSubmissions} accepted of {stats.totalSubmissions} submissions
              </div>
            </div>
          </div>
        )}

        {/* Successfully Submitted Problems Table */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {/* Table Header & Difficulty Filter */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--verdict-ac)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Solved Problems</h2>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              {difficultyFilters.map((diff) => {
                const isSelected = selectedDifficultyFilter === diff;
                let activeColor = 'var(--accent-cyan)';
                if (diff === 'Easy') activeColor = 'var(--diff-easy)';
                if (diff === 'Medium') activeColor = 'var(--diff-medium)';
                if (diff === 'Hard') activeColor = 'var(--diff-hard)';

                return (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficultyFilter(diff)}
                    style={{
                      background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: isSelected ? activeColor : 'var(--text-muted)',
                      border: `1px solid ${isSelected ? activeColor : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-full)',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {diff}
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
                margin: '1rem 1.5rem',
                padding: '0.875rem 1.25rem',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.8125rem' }}>{error}</span>
              </div>
              <button
                onClick={() => fetchSolvedProblems()}
                className="btn btn-outline"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--verdict-wa-border)', color: 'var(--verdict-wa)' }}
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Solved Problems List */}
          {loadingSolved ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
                <Loader2 size={24} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Loading solved problems...</p>
            </div>
          ) : filteredSolved.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Trophy size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--text-faint)' }} />
              <p style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {solvedProblems.length === 0 ? 'No Solved Problems Yet' : `No ${selectedDifficultyFilter} problems solved yet`}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                {solvedProblems.length === 0
                  ? 'Tackle challenges in the problem catalog to see your successful completions here.'
                  : 'Try selecting another difficulty filter or solve more challenges.'}
              </p>
              {solvedProblems.length === 0 ? (
                <Link to="/" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                  Browse Problems
                </Link>
              ) : (
                <button
                  onClick={() => setSelectedDifficultyFilter('All')}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                >
                  Show All Solved Problems
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Problem</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Difficulty</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Language</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Runtime</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Memory</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Solved Date</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSolved.map((item) => {
                    const diffBadgeClass =
                      item.problem.difficulty === 'Easy'
                        ? 'badge-easy'
                        : item.problem.difficulty === 'Medium'
                        ? 'badge-medium'
                        : 'badge-hard';

                    return (
                      <tr
                        key={item._id}
                        style={{
                          borderBottom: '1px solid var(--border-faint)',
                          transition: 'background-color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Status Checkmark */}
                        <td style={{ padding: '0.875rem 1.25rem', width: '40px' }}>
                          <CheckCircle2 size={16} style={{ color: 'var(--verdict-ac)' }} />
                        </td>

                        {/* Problem Title & Code */}
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div>
                            <Link
                              to={`/problems/${item.problem.problemCode}`}
                              style={{
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <span>{item.problem.name}</span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                                #{item.problem.problemCode}
                              </span>
                            </Link>
                            {item.problem.tags && item.problem.tags.length > 0 && (
                              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                                {item.problem.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="badge badge-tag" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Difficulty */}
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span className={`badge ${diffBadgeClass}`}>{item.problem.difficulty}</span>
                        </td>

                        {/* Language */}
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                            {item.language}
                          </span>
                        </td>

                        {/* Runtime */}
                        <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {item.executionTime !== undefined ? `${item.executionTime} ms` : '—'}
                        </td>

                        {/* Memory */}
                        <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          {item.memoryUsed !== undefined ? `${Math.round(item.memoryUsed / 1024)} MB` : '—'}
                        </td>

                        {/* Solved Date */}
                        <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {new Date(item.solvedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            {item.code && (
                              <button
                                onClick={() =>
                                  setViewCodeModal({
                                    open: true,
                                    code: item.code || '',
                                    language: item.language,
                                    problemName: item.problem.name,
                                    verdict: 'Accepted',
                                  })
                                }
                                className="btn btn-outline"
                                style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                title="View Accepted Code"
                              >
                                <FileCode size={12} />
                                <span>Code</span>
                              </button>
                            )}
                            <Link
                              to={`/problems/${item.problem.problemCode}`}
                              className="btn btn-ghost"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                              title="Solve Problem Again"
                            >
                              <span>Solve</span>
                              <ChevronRight size={12} />
                            </Link>
                          </div>
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

      {/* Code Viewer Modal */}
      <ViewCodeModal
        isOpen={viewCodeModal.open}
        onClose={() => setViewCodeModal((prev) => ({ ...prev, open: false }))}
        code={viewCodeModal.code}
        language={viewCodeModal.language}
        problemName={viewCodeModal.problemName}
        verdict={viewCodeModal.verdict}
      />
    </div>
  );
};
