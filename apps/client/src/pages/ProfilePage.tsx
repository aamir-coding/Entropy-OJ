import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { VerdictBadge } from '../components/VerdictBadge';
import { ViewCodeModal } from '../components/ViewCodeModal';
import { ISubmissionHistoryItem, Verdicts } from '@anti-oj/shared';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  CheckCircle2,
  Clock,
  HardDrive,
  Code2,
  Terminal,
  Loader2,
  FileCode,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, stats, loading: authLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<ISubmissionHistoryItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
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
    if (!authLoading && !user) {
      openAuthModal('login');
    }
  }, [authLoading, user]);

  useEffect(() => {
    const fetchSubmissionHistory = async () => {
      if (!user) return;
      try {
        setLoadingSubmissions(true);
        const res = await api.get(`/submissions/user/${user._id}`);
        if (res.data.success) {
          setSubmissions(res.data.data.submissions);
        }
      } catch (err) {
        console.error('Failed to fetch user submissions:', err);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchSubmissionHistory();
  }, [user]);

  if (authLoading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={36} className="animate-spin text-sky-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrapper" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Please Sign In</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          You must be logged in to view your profile and submission history.
        </p>
        <button onClick={() => openAuthModal('login')} className="btn btn-primary">
          Sign In
        </button>
      </div>
    );
  }

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
                <Trophy size={20} className="text-sky-400" />
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
                <CheckCircle2 size={20} className="text-emerald-400" />
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
              <Terminal size={18} className="text-sky-400" />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Submission History</h2>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              {['All', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error'].map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVerdictFilter(v)}
                  style={{
                    background: selectedVerdictFilter === v ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: selectedVerdictFilter === v ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: `1px solid ${selectedVerdictFilter === v ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-full)',
                    padding: '0.2rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Table Content */}
          {loadingSubmissions ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Loader2 size={32} className="animate-spin text-sky-400" style={{ margin: '0 auto 1rem' }} />
              <p>Loading submission records...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FileCode size={36} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
              <p>No matching submissions found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.6)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Submitted At</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Problem</th>
                    <th style={{ padding: '0.875rem 1.25rem', width: '100px' }}>Language</th>
                    <th style={{ padding: '0.875rem 1.25rem' }}>Verdict</th>
                    <th style={{ padding: '0.875rem 1.25rem', width: '120px' }}>CPU Time</th>
                    <th style={{ padding: '0.875rem 1.25rem', width: '120px' }}>Memory</th>
                    <th style={{ padding: '0.875rem 1.25rem', width: '120px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub._id}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
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
                          <span
                            className={`badge ${
                              sub.problem.difficulty === 'Easy'
                                ? 'badge-easy'
                                : sub.problem.difficulty === 'Medium'
                                ? 'badge-medium'
                                : 'badge-hard'
                            }`}
                            style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}
                          >
                            {sub.problem.difficulty}
                          </span>
                        </Link>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                          {sub.language}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <VerdictBadge verdict={sub.verdict} />
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {sub.executionTime !== undefined ? `${sub.executionTime}ms` : '—'}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {sub.memoryUsed !== undefined ? `${sub.memoryUsed}KB` : '—'}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
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
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          View Code
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* View Code Modal */}
      <ViewCodeModal
        isOpen={viewCodeModal.open}
        onClose={() => setViewCodeModal({ ...viewCodeModal, open: false })}
        code={viewCodeModal.code}
        language={viewCodeModal.language}
        problemName={viewCodeModal.problemName}
        verdict={viewCodeModal.verdict}
      />
    </div>
  );
};
