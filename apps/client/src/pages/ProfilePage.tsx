import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ViewCodeModal } from '../components/ViewCodeModal';
import { Tabs } from '../components/motion/tabs';
import { NumberTicker } from '../components/motion/number-ticker';
import { TableSkeleton } from '../components/motion/skeleton';
import { TiltCard } from '../components/motion/tilt-card';
import { ProgressBar, SegmentedProgressBar } from '../components/motion/progress';
import { CopyButton } from '../components/motion/copy-button';
import { Tooltip } from '../components/motion/tooltip';
import { STAR_CLUSTERS } from '../data/galaxyData';
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
  ChevronLeft,
  Search,
  X,
  Sparkles,
  Compass,
  Code2,
  Share2,
  ArrowUpDown,
  History,
  XCircle,
  AlertTriangle,
  Timer,
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

interface ISubmissionItem {
  _id: string;
  problem: {
    _id: string;
    problemCode: string;
    name: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  };
  language: string;
  verdict: string;
  classification?: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
  executionTime?: number;
  memoryUsed?: number;
  passedTestCases?: number;
  totalTestCases?: number;
  submittedAt: string | Date;
  code?: string;
}

interface RankTier {
  title: string;
  minSolved: number;
  color: string;
  glow: string;
}

const RANK_TIERS: RankTier[] = [
  { title: 'Entropy Grandmaster', minSolved: 120, color: '#ff6568', glow: 'rgba(255, 101, 104, 0.45)' },
  { title: 'Singularity Master', minSolved: 75, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)' },
  { title: 'Cosmic Voyager', minSolved: 30, color: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)' },
  { title: 'Orbital Specialist', minSolved: 10, color: '#818cf8', glow: 'rgba(129, 140, 248, 0.45)' },
  { title: 'Stellar Scout', minSolved: 1, color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { title: 'Uncharted Explorer', minSolved: 0, color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.35)' },
];

export const ProfilePage: React.FC = () => {
  const { user, stats, loading: authLoading, openAuthModal } = useAuth();

  // Active view tab: 'solved' or 'submissions'
  const [activeTab, setActiveTab] = useState<'solved' | 'submissions'>('solved');

  // Solved problems state
  const [solvedProblems, setSolvedProblems] = useState<ISolvedProblemItem[]>([]);
  const [approachDistribution, setApproachDistribution] = useState<{ approach: string; count: number }[]>([]);
  const [loadingSolved, setLoadingSolved] = useState(true);
  const [errorSolved, setErrorSolved] = useState<string | null>(null);

  // Submissions state
  const [submissions, setSubmissions] = useState<ISubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [errorSubmissions, setErrorSubmissions] = useState<string | null>(null);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsTotalPages, setSubmissionsTotalPages] = useState(1);
  const [submissionsTotalCount, setSubmissionsTotalCount] = useState(0);

  // Solved table controls: search, difficulty filter, sorting, pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'runtime_asc' | 'memory_asc' | 'name_asc'>('date_desc');
  const [solvedPage, setSolvedPage] = useState(1);
  const solvedPageSize = 10;

  // Practice & Workspace Preferences (user-scoped)
  const autostartStorageKey = user?._id ? `entropy_timer_autostart_${user._id}` : 'entropy_timer_autostart';

  const [autoStartTimer, setAutoStartTimer] = useState<boolean>(() => {
    try {
      return localStorage.getItem(autostartStorageKey) === 'true';
    } catch {
      return false;
    }
  });

  // Synchronize preference state when user logs in, loads, or switches accounts
  useEffect(() => {
    try {
      setAutoStartTimer(localStorage.getItem(autostartStorageKey) === 'true');
    } catch {}
  }, [autostartStorageKey]);

  const handleToggleAutoStartTimer = (checked: boolean) => {
    setAutoStartTimer(checked);
    try {
      localStorage.setItem(autostartStorageKey, String(checked));
    } catch {}
  };

  // Code Viewer Modal state
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
    document.title = 'Profile & Cosmic Analytics | Entropy';
  }, []);

  // Fetch Solved Problems
  const fetchSolvedProblems = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoadingSolved(true);
      setErrorSolved(null);
      const res = await api.get(`/submissions/user/${user._id}/solved`);
      if (res.data.success) {
        setSolvedProblems(res.data.data.solvedProblems || []);
        setApproachDistribution(res.data.data.approachDistribution || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch solved problems:', err);
      const msg = err.response?.data?.error || err.message;
      if (typeof msg === 'string' && msg.includes("reading '_id'")) {
        setErrorSolved(null);
      } else {
        setErrorSolved(msg || 'Failed to load solved problems list.');
      }
    } finally {
      setLoadingSolved(false);
    }
  }, [user]);

  const submissionsAbortControllerRef = useRef<AbortController | null>(null);
  const submissionsSeqRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (submissionsAbortControllerRef.current) {
        submissionsAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch Full Submission History (High 2: Request cancellation & sequence tracking)
  const fetchSubmissions = useCallback(async (page = 1) => {
    if (!user?._id) return;
    if (submissionsAbortControllerRef.current) {
      submissionsAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    submissionsAbortControllerRef.current = controller;
    const currentSeq = ++submissionsSeqRef.current;

    try {
      setLoadingSubmissions(true);
      setErrorSubmissions(null);
      const res = await api.get(`/submissions/user/${user._id}?page=${page}&limit=10`, {
        signal: controller.signal,
      });
      if (currentSeq === submissionsSeqRef.current && res.data.success) {
        setSubmissions(res.data.data.submissions || []);
        if (res.data.data.pagination) {
          setSubmissionsPage(res.data.data.pagination.page);
          setSubmissionsTotalPages(res.data.data.pagination.totalPages || 1);
          setSubmissionsTotalCount(res.data.data.pagination.total || 0);
        }
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return;
      }
      if (currentSeq === submissionsSeqRef.current) {
        console.error('Failed to fetch submissions:', err);
        const msg = err.response?.data?.error || err.message;
        if (typeof msg === 'string' && msg.includes("reading '_id'")) {
          setErrorSubmissions(null);
        } else {
          setErrorSubmissions(msg || 'Failed to load submission history.');
        }
      }
    } finally {
      if (currentSeq === submissionsSeqRef.current) {
        setLoadingSubmissions(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      fetchSolvedProblems();
    }
  }, [user?._id, fetchSolvedProblems]);

  useEffect(() => {
    if (user?._id && activeTab === 'submissions') {
      fetchSubmissions(submissionsPage);
    }
  }, [user?._id, activeTab, submissionsPage, fetchSubmissions]);

  // User Algorithmic Rank
  const userRank = useMemo(() => {
    const count = stats?.solvedProblemsCount ?? solvedProblems.length;
    return RANK_TIERS.find((t) => count >= t.minSolved) || RANK_TIERS[RANK_TIERS.length - 1];
  }, [stats?.solvedProblemsCount, solvedProblems.length]);

  // Galaxy Constellation Mastery Calculations
  const solvedProblemCodes = useMemo(() => {
    return new Set(solvedProblems.map((s) => s.problem?.problemCode?.toLowerCase()).filter(Boolean));
  }, [solvedProblems]);

  const { masteredClusters, totalGalaxySolved } = useMemo(() => {
    let mastered = 0;
    let galaxySolved = 0;
    for (const cluster of STAR_CLUSTERS) {
      let clusterAllSolved = true;
      for (const p of cluster.problems) {
        if (solvedProblemCodes.has(p.code.toLowerCase())) {
          galaxySolved++;
        } else {
          clusterAllSolved = false;
        }
      }
      if (clusterAllSolved) mastered++;
    }
    return { masteredClusters: mastered, totalGalaxySolved: galaxySolved };
  }, [solvedProblemCodes]);

  // Language Breakdown from solved problems
  const languageStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of solvedProblems) {
      const lang = (item.language || 'cpp').toLowerCase();
      map[lang] = (map[lang] || 0) + 1;
    }
    const total = solvedProblems.length || 1;
    return Object.entries(map)
      .map(([lang, count]) => ({
        lang: lang === 'cpp' ? 'C++' : lang === 'python' ? 'Python' : lang.toUpperCase(),
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [solvedProblems]);

  // Solved problems filtering & sorting
  const filteredAndSortedSolved = useMemo(() => {
    let list = [...solvedProblems];

    // Difficulty filter
    if (selectedDifficultyFilter !== 'All') {
      list = list.filter((item) => item.problem?.difficulty === selectedDifficultyFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.problem?.name?.toLowerCase().includes(q) ||
          item.problem?.problemCode?.toLowerCase().includes(q) ||
          item.problem?.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.solvedAt).getTime() - new Date(a.solvedAt).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime();
      }
      if (sortBy === 'runtime_asc') {
        return (a.executionTime ?? 99999) - (b.executionTime ?? 99999);
      }
      if (sortBy === 'memory_asc') {
        return (a.memoryUsed ?? 99999999) - (b.memoryUsed ?? 99999999);
      }
      if (sortBy === 'name_asc') {
        return (a.problem?.name || '').localeCompare(b.problem?.name || '');
      }
      return 0;
    });

    return list;
  }, [solvedProblems, selectedDifficultyFilter, searchQuery, sortBy]);

  // Pagination for solved table
  const totalSolvedPages = Math.ceil(filteredAndSortedSolved.length / solvedPageSize) || 1;
  const paginatedSolved = useMemo(() => {
    const start = (solvedPage - 1) * solvedPageSize;
    return filteredAndSortedSolved.slice(start, start + solvedPageSize);
  }, [filteredAndSortedSolved, solvedPage, solvedPageSize]);

  // Reset page when filter/search changes
  useEffect(() => {
    setSolvedPage(1);
  }, [selectedDifficultyFilter, searchQuery, sortBy]);

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
              You must be signed in to view your cosmic profile, solved star nodes, and constellation analytics.
            </p>
            <button onClick={() => openAuthModal('login')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Canonical NeetCode 150 Catalog totals
  const totalCatalogEasy = 45;
  const totalCatalogMedium = 80;
  const totalCatalogHard = 25;
  const totalCatalogProblems = 150;

  const easySolved = stats?.easySolved ?? solvedProblems.filter((p) => p.problem?.difficulty === 'Easy').length;
  const mediumSolved = stats?.mediumSolved ?? solvedProblems.filter((p) => p.problem?.difficulty === 'Medium').length;
  const hardSolved = stats?.hardSolved ?? solvedProblems.filter((p) => p.problem?.difficulty === 'Hard').length;
  const totalSolvedCount = stats?.solvedProblemsCount ?? solvedProblems.length;

  return (
    <div className="page-wrapper" style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* User Profile Header Card with 3D Tilt */}
        <TiltCard
          tiltIntensity={4}
          glareOpacity={0.08}
          containerStyle={{ marginBottom: '2rem' }}
          className="glass-panel"
          style={{
            padding: '2rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Avatar with Cosmic Rank Aura Ring */}
              <div
                style={{
                  position: 'relative',
                  width: '82px',
                  height: '82px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    background: `conic-gradient(from 0deg, ${userRank.color}, #38bdf8, #818cf8, ${userRank.color})`,
                    opacity: 0.85,
                    filter: 'blur(3px)',
                  }}
                />
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #090d16, #1e293b)',
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    position: 'relative',
                    zIndex: 2,
                    boxShadow: `0 0 20px ${userRank.glow}`,
                  }}
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* User Meta & Rank Title */}
              <div style={{ minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{user.fullName}</h1>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: `${userRank.color}18`,
                      borderColor: `${userRank.color}50`,
                      color: userRank.color,
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: `0 0 10px ${userRank.color}22`,
                    }}
                  >
                    <Sparkles size={11} />
                    <span>{userRank.title}</span>
                  </span>
                  <span
                    className="badge"
                    style={{
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: 'var(--text-secondary)',
                      borderColor: 'var(--border-subtle)',
                    }}
                  >
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

            {/* Quick Actions: Share Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <CopyButton
                text={typeof window !== 'undefined' ? window.location.href : ''}
                label="Share Profile"
                size={13}
                className="btn btn-outline"
              />
            </div>
          </div>
        </TiltCard>

        {/* Analytics & Mastery Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Card 1: Galaxy Constellation Mastery */}
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    <Compass size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Cosmic Constellation Mastery</h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NeetCode 150 Star Systems</span>
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    color: 'var(--accent-cyan)',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                  }}
                >
                  {Math.round((totalGalaxySolved / 150) * 100)}%
                </span>
              </div>

              {/* Galaxy Progress Bar */}
              <ProgressBar
                value={totalGalaxySolved}
                max={150}
                color="linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)"
                height={8}
                glow
                className="mb-4"
              />

              {/* Metrics Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-faint)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Star Systems Mastered</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    <NumberTicker value={masteredClusters} /> <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>/ 18</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-faint)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Nodes Unlocked</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    <NumberTicker value={totalGalaxySolved} /> <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>/ 150</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <Link
                to="/galaxy"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--accent-cyan)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <span>Navigate Stellar Constellations</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card 2: Solved Problems Breakdown & Catalog Progress */}
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(5, 223, 114, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--verdict-ac)',
                    }}
                  >
                    <Trophy size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Difficulty Spectrum</h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Progress by challenge tier</span>
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  <NumberTicker value={totalSolvedCount} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)', fontWeight: 500 }}> / {totalCatalogProblems}</span>
                </div>
              </div>

              {/* Segmented Progress Bar */}
              <div style={{ marginBottom: '1.25rem' }}>
                <SegmentedProgressBar
                  segments={[
                    { id: 'easy', label: 'Easy', value: easySolved, color: 'var(--diff-easy)' },
                    { id: 'medium', label: 'Medium', value: mediumSolved, color: 'var(--diff-medium)' },
                    { id: 'hard', label: 'Hard', value: hardSolved, color: 'var(--diff-hard)' },
                  ]}
                  total={totalCatalogProblems}
                  height={8}
                />
              </div>

              {/* Individual Progress Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Easy */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--diff-easy)', fontWeight: 600 }}>Easy</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {easySolved} / {totalCatalogEasy} ({Math.round((easySolved / totalCatalogEasy) * 100)}%)
                    </span>
                  </div>
                  <ProgressBar value={easySolved} max={totalCatalogEasy} color="var(--diff-easy)" height={5} />
                </div>

                {/* Medium */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--diff-medium)', fontWeight: 600 }}>Medium</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {mediumSolved} / {totalCatalogMedium} ({Math.round((mediumSolved / totalCatalogMedium) * 100)}%)
                    </span>
                  </div>
                  <ProgressBar value={mediumSolved} max={totalCatalogMedium} color="var(--diff-medium)" height={5} />
                </div>

                {/* Hard */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--diff-hard)', fontWeight: 600 }}>Hard</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {hardSolved} / {totalCatalogHard} ({Math.round((hardSolved / totalCatalogHard) * 100)}%)
                    </span>
                  </div>
                  <ProgressBar value={hardSolved} max={totalCatalogHard} color="var(--diff-hard)" height={5} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Accuracy & Language Proficiency */}
          <div
            className="glass-panel"
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                  }}
                >
                  <Code2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Accuracy & Languages</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Submission statistics</span>
                </div>
              </div>
            </div>

            {/* Acceptance Rate Callout */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.6rem',
                marginBottom: '0.35rem',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--verdict-ac)', fontFamily: 'var(--font-mono)' }}>
                <NumberTicker value={stats?.acceptanceRate ?? 0} suffix="%" decimalPlaces={1} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Acceptance Rate</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {stats?.acceptedSubmissions ?? 0} accepted of {stats?.totalSubmissions ?? 0} submissions
            </div>

            {/* Languages breakdown */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                Languages Used
              </div>
              {languageStats.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>No language data available yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {languageStats.map((item) => (
                    <div key={item.lang}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{item.lang}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {item.count} solved ({item.percentage}%)
                        </span>
                      </div>
                      <ProgressBar
                        value={item.percentage}
                        max={100}
                        color={item.lang === 'C++' ? 'var(--accent-cyan)' : '#818cf8'}
                        height={4}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Entropy AI: Algorithmic Approach Distribution Widget */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem 1.75rem',
            marginBottom: '1.5rem',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Approach Distribution
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Algorithmic patterns detected across your accepted solutions
                </span>
              </div>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.625rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Sparkles size={10} /> ENTROPY AI
            </span>
          </div>

          {approachDistribution.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                marginTop: '0.5rem',
              }}
            >
              {(() => {
                const maxCount = Math.max(...approachDistribution.map((a) => a.count), 1);
                return approachDistribution.map((item) => {
                  const percentage = Math.round((item.count / maxCount) * 100);
                  return (
                    <div
                      key={item.approach}
                      style={{
                        padding: '0.6rem 0.75rem',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-faint)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {item.approach}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {item.count} {item.count === 1 ? 'problem' : 'problems'}
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '5px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderRadius: 'var(--radius-xs)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--brand-neutral-400), var(--brand-neutral-200))',
                            borderRadius: 'var(--radius-xs)',
                            transition: 'width 0.4s ease-out',
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                background: 'rgba(255, 255, 255, 0.015)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <p style={{ margin: 0 }}>
                Solve problems and classify your accepted solutions to analyze your algorithmic pattern portfolio with Entropy AI.
              </p>
            </div>
          )}
        </div>

        {/* Practice Preferences */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <Timer size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Auto-Start Practice Timer
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Automatically start the problem timer on first keystroke in the code editor (Default: Off)
              </div>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={autoStartTimer}
            aria-label="Toggle auto-start practice timer"
            onClick={() => handleToggleAutoStartTimer(!autoStartTimer)}
            style={{
              width: '42px',
              height: '24px',
              borderRadius: '9999px',
              background: autoStartTimer ? 'var(--brand-white)' : 'var(--border-medium)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s ease',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: autoStartTimer ? 'var(--brand-black)' : 'var(--text-muted)',
                transform: autoStartTimer ? 'translateX(18px)' : 'translateX(0px)',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease',
                display: 'block',
              }}
            />
          </button>
        </div>

        {/* Primary View Tabs: Solved Problems vs Recent Submissions */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Tabs
            tabs={[
              {
                id: 'solved',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Trophy size={14} />
                    <span>Solved Problems ({solvedProblems.length})</span>
                  </span>
                ),
                activeColor: 'var(--brand-white)',
                activeBg: 'rgba(255, 255, 255, 0.08)',
                activeBorder: 'rgba(255, 255, 255, 0.2)',
              },
              {
                id: 'submissions',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <History size={14} />
                    <span>Recent Submissions {submissionsTotalCount > 0 ? `(${submissionsTotalCount})` : ''}</span>
                  </span>
                ),
                activeColor: 'var(--brand-white)',
                activeBg: 'rgba(255, 255, 255, 0.08)',
                activeBorder: 'rgba(255, 255, 255, 0.2)',
              },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as 'solved' | 'submissions')}
            layoutId="profile-primary-view-tab"
            variant="pill"
            size="md"
          />
        </div>

        {/* ── TAB 1: SOLVED PROBLEMS SHOWCASE ────────────────────────── */}
        {activeTab === 'solved' && (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            {/* Table Filter & Search Controls */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
                {/* Search Input with quick clear */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
                  <Search
                    size={14}
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search solved problems..."
                    style={{
                      width: '100%',
                      padding: '0.45rem 2rem 0.45rem 2.25rem',
                      fontSize: '0.8125rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Difficulty Filter Tabs */}
                <Tabs
                  tabs={[
                    { id: 'All', label: 'All', activeColor: 'var(--brand-black)', activeBg: 'var(--brand-white)', activeBorder: 'var(--brand-white)' },
                    { id: 'Easy', label: 'Easy', activeColor: 'var(--diff-easy)', activeBg: 'var(--diff-easy-bg)', activeBorder: 'rgba(5, 223, 114, 0.5)' },
                    { id: 'Medium', label: 'Medium', activeColor: 'var(--diff-medium)', activeBg: 'var(--diff-medium-bg)', activeBorder: 'rgba(245, 158, 11, 0.5)' },
                    { id: 'Hard', label: 'Hard', activeColor: 'var(--diff-hard)', activeBg: 'var(--diff-hard-bg)', activeBorder: 'rgba(255, 101, 104, 0.5)' },
                  ]}
                  activeId={selectedDifficultyFilter}
                  onChange={(id) => setSelectedDifficultyFilter(id)}
                  layoutId="profile-difficulty-indicator"
                  tabIdPrefix="profile-filter-diff-"
                  variant="pill"
                  size="sm"
                />
              </div>

              {/* Sort Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowUpDown size={13} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.78rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="date_desc">Newest Solved</option>
                  <option value="date_asc">Oldest Solved</option>
                  <option value="runtime_asc">Fastest Runtime</option>
                  <option value="memory_asc">Lowest Memory</option>
                  <option value="name_asc">Problem Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Error Banner */}
            {errorSolved && !errorSolved.includes("reading '_id'") && (
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
                  <span style={{ fontSize: '0.8125rem' }}>{errorSolved}</span>
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

            {/* Table or Empty State */}
            {loadingSolved ? (
              <TableSkeleton rows={5} />
            ) : filteredAndSortedSolved.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Trophy size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--text-faint)' }} />
                <p style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {solvedProblems.length === 0
                    ? 'No Solved Problems Yet'
                    : searchQuery
                    ? `No matches found for "${searchQuery}"`
                    : `No ${selectedDifficultyFilter} problems solved yet`}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  {solvedProblems.length === 0
                    ? 'Embark on your journey in the Galaxy Map to conquer algorithmic star systems.'
                    : 'Try clearing your filters or tackle new challenges.'}
                </p>
                {solvedProblems.length === 0 ? (
                  <Link to="/galaxy" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                    Launch Galaxy Map
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedDifficultyFilter('All');
                      setSearchQuery('');
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
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
                      {paginatedSolved.map((item) => {
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
                                <Tooltip content="View accepted code" side="top">
                                  <button
                                    onClick={async () => {
                                      if (item.code) {
                                        setViewCodeModal({
                                          open: true,
                                          code: item.code,
                                          language: item.language,
                                          problemName: item.problem?.name,
                                          verdict: 'Accepted',
                                        });
                                      } else {
                                        try {
                                          const res = await api.get(`/submissions/${item._id}`);
                                          if (res.data?.success && res.data?.data) {
                                            setViewCodeModal({
                                              open: true,
                                              code: res.data.data.code || '',
                                              language: res.data.data.language,
                                              problemName: item.problem?.name,
                                              verdict: 'Accepted',
                                            });
                                          }
                                        } catch (err) {
                                          console.error('Failed to fetch submission code:', err);
                                        }
                                      }
                                    }}
                                    className="btn btn-outline"
                                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                  >
                                    <FileCode size={12} />
                                    <span>Code</span>
                                  </button>
                                </Tooltip>
                                <Tooltip content="Solve problem again" side="top">
                                  <Link
                                    to={`/problems/${item.problem.problemCode}`}
                                    className="btn btn-ghost"
                                    style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                  >
                                    <span>Solve</span>
                                    <ChevronRight size={12} />
                                  </Link>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalSolvedPages > 1 && (
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <div>
                      Showing {(solvedPage - 1) * solvedPageSize + 1} to{' '}
                      {Math.min(solvedPage * solvedPageSize, filteredAndSortedSolved.length)} of {filteredAndSortedSolved.length} solved problems
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tooltip content="Previous page" side="top">
                        <button
                          disabled={solvedPage <= 1}
                          onClick={() => setSolvedPage((p) => Math.max(1, p - 1))}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <ChevronLeft size={13} />
                          <span>Prev</span>
                        </button>
                      </Tooltip>
                      <span style={{ padding: '0 0.5rem', fontFamily: 'var(--font-mono)' }}>
                        {solvedPage} / {totalSolvedPages}
                      </span>
                      <Tooltip content="Next page" side="top">
                        <button
                          disabled={solvedPage >= totalSolvedPages}
                          onClick={() => setSolvedPage((p) => Math.min(totalSolvedPages, p + 1))}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <span>Next</span>
                          <ChevronRight size={13} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: RECENT SUBMISSIONS AUDIT LOG ──────────────────────── */}
        {activeTab === 'submissions' && (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <History size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Submission History</h2>
              </div>
              <Tooltip content="Refresh submissions log" side="left">
                <button
                  onClick={() => fetchSubmissions(submissionsPage)}
                  className="btn btn-ghost"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                >
                  <RotateCcw size={13} />
                  <span>Refresh</span>
                </button>
              </Tooltip>
            </div>

            {/* Error Banner */}
            {errorSubmissions && !errorSubmissions.includes("reading '_id'") && (
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
                  <span style={{ fontSize: '0.8125rem' }}>{errorSubmissions}</span>
                </div>
                <button
                  onClick={() => fetchSubmissions(submissionsPage)}
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
              <TableSkeleton rows={5} />
            ) : submissions.length === 0 ? (
              <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <History size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--text-faint)' }} />
                <p style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  No Submissions Recorded
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Submit code on any problem to review evaluation logs, memory benchmarks, and verdict traces.
                </p>
                <Link to="/" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Verdict</th>
                        <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Approach</th>
                        <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Problem</th>
                        <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Test Cases</th>
                        <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Language</th>
                        <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Runtime</th>
                        <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Memory</th>
                        <th style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Submitted</th>
                        <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => {
                        const isAccepted = sub.verdict === 'Accepted';
                        const isWA = sub.verdict === 'Wrong Answer';
                        const isTLE = sub.verdict === 'Time Limit Exceeded';
                        const isPending = sub.verdict === 'Pending' || sub.verdict === 'Running';

                        const chipClass = isAccepted
                          ? 'verdict-chip accepted'
                          : isWA
                          ? 'verdict-chip wrong-answer'
                          : isTLE
                          ? 'verdict-chip time-limit-exceeded'
                          : isPending
                          ? 'verdict-chip pending'
                          : 'verdict-chip wrong-answer';

                        return (
                          <tr
                            key={sub._id}
                            style={{
                              borderBottom: '1px solid var(--border-faint)',
                              transition: 'background-color var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {/* Verdict Chip */}
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              <span className={chipClass} style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                {isAccepted ? (
                                  <CheckCircle2 size={12} />
                                ) : isWA ? (
                                  <XCircle size={12} />
                                ) : isTLE ? (
                                  <Clock size={12} />
                                ) : isPending ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <AlertTriangle size={12} />
                                )}
                                <span>{sub.verdict}</span>
                              </span>
                            </td>

                            {/* Algorithmic Approach Classification */}
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              {sub.classification?.approach ? (
                                <span
                                  className="badge badge-tag"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.72rem',
                                    padding: '0.15rem 0.5rem',
                                  }}
                                  title={`Time: ${sub.classification.timeComplexity || 'N/A'}, Space: ${sub.classification.spaceComplexity || 'N/A'}`}
                                >
                                  <Sparkles size={10} style={{ color: 'var(--text-muted)' }} />
                                  <span>{sub.classification.approach}</span>
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>—</span>
                              )}
                            </td>

                            {/* Problem Name & Code */}
                            <td style={{ padding: '0.875rem 1.25rem' }}>
                              <Link
                                to={`/problems/${sub.problem?.problemCode}`}
                                style={{
                                  color: 'var(--text-primary)',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                }}
                              >
                                <span>{sub.problem?.name || 'Problem'}</span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                                  #{sub.problem?.problemCode}
                                </span>
                              </Link>
                            </td>

                            {/* Test Cases Passed */}
                            <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {sub.totalTestCases !== undefined ? `${sub.passedTestCases ?? 0} / ${sub.totalTestCases}` : '—'}
                            </td>

                            {/* Language */}
                            <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
                              {sub.language}
                            </td>

                            {/* Runtime */}
                            <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                              {sub.executionTime !== undefined ? `${sub.executionTime} ms` : '—'}
                            </td>

                            {/* Memory */}
                            <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                              {sub.memoryUsed !== undefined ? `${Math.round(sub.memoryUsed / 1024)} MB` : '—'}
                            </td>

                            {/* Submitted Date */}
                            <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>

                            {/* Action Button */}
                            <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                              <Tooltip content="View submitted code" side="top">
                                <button
                                  onClick={async () => {
                                    if (sub.code) {
                                      setViewCodeModal({
                                        open: true,
                                        code: sub.code,
                                        language: sub.language,
                                        problemName: sub.problem?.name,
                                        verdict: sub.verdict,
                                      });
                                    } else {
                                      try {
                                        const res = await api.get(`/submissions/${sub._id}`);
                                        if (res.data?.success && res.data?.data) {
                                          setViewCodeModal({
                                            open: true,
                                            code: res.data.data.code || '',
                                            language: res.data.data.language,
                                            problemName: sub.problem?.name,
                                            verdict: sub.verdict,
                                          });
                                        }
                                      } catch (err) {
                                        console.error('Failed to fetch submission details:', err);
                                      }
                                    }
                                  }}
                                  className="btn btn-outline"
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                                >
                                  <FileCode size={12} />
                                  <span>Code</span>
                                </button>
                              </Tooltip>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Submissions Pagination */}
                {submissionsTotalPages > 1 && (
                  <div
                    style={{
                      padding: '1rem 1.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <div>
                      Page {submissionsPage} of {submissionsTotalPages} ({submissionsTotalCount} total submissions)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Tooltip content="Previous page" side="top">
                        <button
                          disabled={submissionsPage <= 1}
                          onClick={() => setSubmissionsPage((p) => Math.max(1, p - 1))}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <ChevronLeft size={13} />
                          <span>Prev</span>
                        </button>
                      </Tooltip>
                      <span style={{ padding: '0 0.5rem', fontFamily: 'var(--font-mono)' }}>
                        {submissionsPage} / {submissionsTotalPages}
                      </span>
                      <Tooltip content="Next page" side="top">
                        <button
                          disabled={submissionsPage >= submissionsTotalPages}
                          onClick={() => setSubmissionsPage((p) => Math.min(submissionsTotalPages, p + 1))}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          <span>Next</span>
                          <ChevronRight size={13} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
