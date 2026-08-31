import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { VerdictBadge } from '../components/VerdictBadge';
import { ViewCodeModal } from '../components/ViewCodeModal';
import { ISubmissionHistoryItem, Verdicts, Verdict } from '@anti-oj/shared';
import {
  Mail,
  Calendar,
  Trophy,
  CheckCircle2,
  Clock,
  HardDrive,
  Terminal,
  Loader2,
  FileCode,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, stats, loading: authLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<ISubmissionHistoryItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerdictFilter, setSelectedVerdictFilter] = useState<string>('All');

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
    document.title = 'Profile & History | Anti Online Judge';
  }, []);

  const fetchSubmissionHistory = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingSubmissions(true);
      setError(null);
      const res = await api.get(`/submissions/user/${user._id}`);
      if (res.data.success) {
        setSubmissions(res.data.data.submissions);
      }
    } catch (err: any) {
      console.error('Failed to fetch user submissions:', err);
      setError(err.message || 'Failed to load submission history.');
    } finally {
      setLoadingSubmissions(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSubmissionHistory();
    }
  }, [user, fetchSubmissionHistory]);

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
              You must be signed in to view your solved stats and submission history.
            </p>
            <button onClick={() => openAuthModal('login')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const verdictFilters: { label: string; value: string }[] = [
    { label: 'All', value: 'All' },
    { label: 'Accepted', value: Verdicts.ACCEPTED },
    { label: 'Wrong Answer', value: Verdicts.WRONG_ANSWER },
    { label: 'Time Limit', value: Verdicts.TIME_LIMIT_EXCEEDED },
    { label: 'Compilation Error', value: Verdicts.COMPILATION_ERROR },
  ];

  const filteredSubmissions = submissions.filter((sub) => {
    if (selectedVerdictFilter === 'All') return true;
    return sub.verdict === selectedVerdictFilter;
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

            {/* Details */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                {user.fullName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={15} /> {user.email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} /> Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            {/* Solved Problems Summary */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Solved Problems
                </span>
                <Trophy size={20} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {stats.solvedProblemsCount}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Unique problems solved
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Difficulty Breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

        {/* Submission History Table */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {/* Table Header & Verdict Filter */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Submission History</h2>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              {verdictFilters.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setSelectedVerdictFilter(v.value)}
                  style={{
                    background: selectedVerdictFilter === v.value ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: selectedVerdictFilter === v.value ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: `1px solid ${selectedVerdictFilter === v.value ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-full)',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {v.label}
                </button>
              ))}
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
                onClick={() => fetchSubmissionHistory()}
                className="btn btn-outline"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--verdict-wa-border)', color: 'var(--verdict-wa)' }}
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Submissions List */}
          {loadingSubmissions ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
                <Loader2 size={24} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Loading submission records...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FileCode size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--text-faint)' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>No submissions found</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {selectedVerdictFilter !== 'All' ? 'No submissions match this filter.' : 'You have not submitted any solutions yet.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Time</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Problem</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Verdict</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Language</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Runtime</th>
                    <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Memory</th>
                    <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Code</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub._id}
                      style={{
                        borderBottom: '1px solid var(--border-faint)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Submitted At */}
                      <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>

                      {/* Problem Title */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <Link
                          to={`/problems/${sub.problem.problemCode}`}
                          style={{
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <span>{sub.problem.name}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                            #{sub.problem.problemCode}
                          </span>
                        </Link>
                      </td>

                      {/* Verdict Badge */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <VerdictBadge verdict={sub.verdict} />
                      </td>

                      {/* Language */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                          {sub.language}
                        </span>
                      </td>

                      {/* Runtime CPU */}
                      <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {sub.executionTime !== undefined ? `${sub.executionTime} ms` : '—'}
                      </td>

                      {/* Memory RSS */}
                      <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {sub.memoryUsed !== undefined ? `${Math.round(sub.memoryUsed / 1024)} MB` : '—'}
                      </td>

                      {/* View Code CTA */}
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                        {sub.code ? (
                          <button
                            onClick={() =>
                              setViewCodeModal({
                                open: true,
                                code: sub.code || '',
                                language: sub.language,
                                problemName: sub.problem.name,
                                verdict: sub.verdict,
                              })
                            }
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                          >
                            <FileCode size={12} />
                            <span>View</span>
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
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
