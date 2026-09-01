import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Group, Panel, Separator, useDefaultLayout, usePanelRef } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { VerdictBadge } from '../components/VerdictBadge';
import { ViewCodeModal } from '../components/ViewCodeModal';
import {
  IProblem,
  SupportedLanguage,
  SupportedLanguages,
  LANGUAGE_CONFIGS,
  Verdicts,
  ISubmissionResponse,
  ISubmissionHistoryItem,
  ISampleCaseResult,
  ISampleRunResponse,
} from '@anti-oj/shared';
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Terminal,
  FileCode,
  FileText,
  History,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Maximize2,
  Minimize2,
  Lightbulb,
  Sparkles,
  Brain,
} from 'lucide-react';

export const ProblemDetailPage: React.FC = () => {
  const { code: problemCodeParam } = useParams<{ code: string }>();
  const { user, openAuthModal } = useAuth();

  // Layout persistence with react-resizable-panels
  const horizontalLayout = useDefaultLayout({
    id: 'anti-oj-workspace-layout-h-v3',
    storage: localStorage,
  });

  const verticalLayout = useDefaultLayout({
    id: 'anti-oj-workspace-layout-v-v3',
    storage: localStorage,
  });

  // Imperative panel ref for bottom console docking & resizing
  const consolePanelRef = usePanelRef();

  // Problem State
  const [problem, setProblem] = useState<IProblem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [problemError, setProblemError] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<'statement' | 'submissions'>('statement');
  const [copiedInputIdx, setCopiedInputIdx] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Editor State
  const [language, setLanguage] = useState<SupportedLanguage>(SupportedLanguages.CPP);
  const [editorCode, setEditorCode] = useState<string>(LANGUAGE_CONFIGS.cpp.starterCode);
  const [fontSize, setFontSize] = useState<number>(14);

  // Console / Testcase Navigation State
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [consoleTab, setConsoleTab] = useState<'testcases' | 'results' | 'compiler'>('testcases');
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [sampleRunning, setSampleRunning] = useState(false);
  const [sampleRunError, setSampleRunError] = useState<string | null>(null);

  // Live Submission Result
  const [activeSubmission, setActiveSubmission] = useState<ISubmissionResponse | null>(null);
  const [submissionTimeoutMsg, setSubmissionTimeoutMsg] = useState<string | null>(null);
  const [sampleResults, setSampleResults] = useState<ISampleCaseResult[]>([]);

  // AI Socratic Debug Hint State
  const [hintState, setHintState] = useState<{
    loading: boolean;
    hint: string | null;
    error: string | null;
    provider?: string;
    remainingDaily?: number;
    remainingHourly?: number;
  }>({
    loading: false,
    hint: null,
    error: null,
  });

  const handleRequestHint = async (submissionId: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setHintState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api.post('/ai/hints', { submissionId });
      if (res.data.success && isMountedRef.current) {
        setHintState({
          loading: false,
          hint: res.data.data.hint,
          error: null,
          provider: res.data.data.provider,
          remainingDaily: res.data.data.remainingDaily,
          remainingHourly: res.data.data.remainingHourly,
        });
      } else if (isMountedRef.current) {
        setHintState({
          loading: false,
          hint: null,
          error: res.data.error || 'Failed to generate hint.',
        });
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setHintState({
          loading: false,
          hint: null,
          error: err.message || 'Unable to fetch hint at this time.',
        });
      }
    }
  };

  // Submissions History for this problem
  const [pastSubmissions, setPastSubmissions] = useState<ISubmissionHistoryItem[]>([]);
  const [loadingPastSubmissions, setLoadingPastSubmissions] = useState(false);
  const [viewCodeModal, setViewCodeModal] = useState<{ open: boolean; code: string; language: string; verdict?: string }>({
    open: false,
    code: '',
    language: 'cpp',
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Update dynamic page title
  useEffect(() => {
    if (problem) {
      document.title = `${problem.name} | Anti Online Judge`;
    }
  }, [problem]);

  // Load problem details
  const loadProblem = useCallback(async () => {
    if (!problemCodeParam) return;
    try {
      setLoadingProblem(true);
      setProblemError(null);
      const res = await api.get(`/problems/${problemCodeParam}`);
      if (res.data.success && isMountedRef.current) {
        setProblem(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load problem:', err);
      if (isMountedRef.current) {
        setProblemError(err.message || 'Failed to load problem from server.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingProblem(false);
      }
    }
  }, [problemCodeParam]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  // Load problem submissions history
  const loadPastSubmissions = useCallback(async () => {
    if (!problem || !user) return;
    try {
      setLoadingPastSubmissions(true);
      const res = await api.get(`/submissions/problem/${problem._id}`);
      if (res.data.success && isMountedRef.current) {
        setPastSubmissions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load past submissions:', err);
    } finally {
      if (isMountedRef.current) {
        setLoadingPastSubmissions(false);
      }
    }
  }, [problem, user]);

  useEffect(() => {
    if (leftTab === 'submissions' && user && problem) {
      loadPastSubmissions();
    }
  }, [leftTab, user, problem, loadPastSubmissions]);

  // Console toggle / expand helpers
  const handleToggleConsole = () => {
    const panel = consolePanelRef.current;
    if (!panel) return;
    if (isConsoleCollapsed || panel.isCollapsed()) {
      panel.expand();
      setIsConsoleCollapsed(false);
    } else {
      panel.collapse();
      setIsConsoleCollapsed(true);
    }
  };

  const handleOpenConsoleTab = (tab: 'testcases' | 'results' | 'compiler') => {
    setConsoleTab(tab);
    const panel = consolePanelRef.current;
    if (panel && (isConsoleCollapsed || panel.isCollapsed())) {
      panel.expand();
      setIsConsoleCollapsed(false);
    }
  };

  // Handle language switch
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setEditorCode(LANGUAGE_CONFIGS[newLang].starterCode);
  };

  // Reset code
  const handleResetCode = () => {
    setEditorCode(LANGUAGE_CONFIGS[language].starterCode);
    setShowResetConfirm(false);
  };

  // Copy sample case input
  const handleCopyInput = async (input: string, idx: number) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(input);
        setCopiedInputIdx(idx);
        setTimeout(() => {
          if (isMountedRef.current) setCopiedInputIdx(null);
        }, 2000);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  // Real "Run Samples" using live backend evaluation
  const handleRunSampleCases = async () => {
    if (!problem) return;
    setSampleRunning(true);
    setSampleRunError(null);
    handleOpenConsoleTab('results');

    try {
      const res = await api.post('/submissions/run', {
        problemId: problem._id,
        language,
        code: editorCode,
      });

      if (res.data.success && isMountedRef.current) {
        const runResponse: ISampleRunResponse = res.data.data;
        setSampleResults(runResponse.sampleResults);
        setActiveCaseIndex(0);

        if (runResponse.verdict === Verdicts.COMPILATION_ERROR) {
          setConsoleTab('compiler');
        }
      }
    } catch (err: any) {
      console.error('Sample run failed:', err);
      if (isMountedRef.current) {
        setSampleRunError(err.message || 'Sample test run failed.');
      }
    } finally {
      if (isMountedRef.current) {
        setSampleRunning(false);
      }
    }
  };

  // Poll submission status until resolved
  const startPollingSubmission = (submissionId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    let attempts = 0;
    let postAcAttempts = 0;
    const maxAttempts = 30; // 30 seconds max polling
    const maxPostAcAttempts = 6; // Poll up to 6 seconds for async AI classification on Accepted
    let historyLoaded = false;
    setSubmissionTimeoutMsg(null);

    pollIntervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        return;
      }

      attempts++;
      try {
        const res = await api.get(`/submissions/${submissionId}`);
        if (res.data.success && isMountedRef.current) {
          const updated: ISubmissionResponse = res.data.data;
          setActiveSubmission(updated);

          if (updated.verdict !== Verdicts.PENDING) {
            setSubmitting(false);

            if (!historyLoaded) {
              historyLoaded = true;
              if (updated.verdict === Verdicts.COMPILATION_ERROR) {
                setConsoleTab('compiler');
              }
              loadPastSubmissions();
            }

            // If Accepted and awaiting async AI classification, keep polling for up to 6s
            if (updated.verdict === Verdicts.ACCEPTED && !updated.classification && postAcAttempts < maxPostAcAttempts) {
              postAcAttempts++;
            } else {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            }
          } else if (attempts >= maxAttempts) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setSubmitting(false);
            setSubmissionTimeoutMsg('Evaluation is taking longer than expected. Please check your submission history for final verdict.');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        if (isMountedRef.current) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setSubmitting(false);
        }
      }
    }, 1000);
  };

  // Submit code for full evaluation
  const handleSubmitCode = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!problem) return;

    try {
      setSubmitting(true);
      handleOpenConsoleTab('results');
      setActiveSubmission(null);
      setSubmissionTimeoutMsg(null);
      setHintState({ loading: false, hint: null, error: null });

      const res = await api.post('/submissions', {
        problemId: problem._id,
        language,
        code: editorCode,
      });

      if (res.data.success && isMountedRef.current) {
        const subData = res.data.data;
        setActiveSubmission(subData);
        startPollingSubmission(subData.submissionId);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      if (isMountedRef.current) {
        setSubmitting(false);
        setSubmissionTimeoutMsg(err.message || 'Failed to submit code.');
      }
    }
  };

  if (loadingProblem) {
    return (
      <div style={{ height: 'calc(100vh - var(--header-height))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-cyan)' }} />
          <p>Loading problem workspace...</p>
        </div>
      </div>
    );
  }

  if (problemError) {
    return (
      <div style={{ height: 'calc(100vh - var(--header-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <AlertCircle size={36} style={{ color: 'var(--verdict-wa)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Failed to Load Problem</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{problemError}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button onClick={() => loadProblem()} className="btn btn-primary">
              <RotateCcw size={14} /> Retry
            </button>
            <Link to="/" className="btn btn-outline">
              Back to Problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div style={{ height: 'calc(100vh - var(--header-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Problem Not Found</h2>
          <Link to="/" className="btn btn-primary">
            Back to Problems Catalog
          </Link>
        </div>
      </div>
    );
  }

  const diffClass =
    problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

  const currentSampleCase = problem.sampleCases[activeCaseIndex] || problem.sampleCases[0];
  const currentResultCase = sampleResults[activeCaseIndex] || sampleResults[0];

  return (
    <div
      style={{
        height: 'calc(100vh - var(--header-height))',
        maxHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Workspace Sub-Header Bar (Pinned to top of workspace) */}
      <div
        style={{
          padding: '0.5rem 1.25rem',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <Link
            to="/"
            className="btn btn-outline"
            style={{ padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
            aria-label="Back to problem catalog"
            title="Back to Catalog"
          >
            <ArrowLeft size={16} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{problem.name}</h1>
            <span className={`badge ${diffClass}`}>{problem.difficulty}</span>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                padding: '0.1rem 0.4rem',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              #{problem.problemCode}
            </span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button
            id="run-sample-cases-btn"
            onClick={handleRunSampleCases}
            disabled={submitting || sampleRunning}
            aria-label="Run sample test cases"
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.875rem', fontSize: '0.8125rem' }}
          >
            {sampleRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} style={{ color: 'var(--accent-cyan)' }} />}
            <span>{sampleRunning ? 'Running Samples...' : 'Run Samples'}</span>
          </button>

          <button
            id="submit-solution-btn"
            onClick={handleSubmitCode}
            disabled={submitting}
            aria-label="Submit solution for evaluation"
            className="btn btn-success"
            style={{ padding: '0.35rem 1.125rem', fontSize: '0.8125rem' }}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Submit Solution</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Viewport Workspace Split (Left: Problem Statement, Right: Monaco Editor + Bottom Console) */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }}>
        <Group orientation="horizontal" {...horizontalLayout} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          {/* LEFT PANEL: Problem Description & Submissions Tabs (Scrolls independently) */}
          <Panel id="problem-left-panel" defaultSize="45%" minSize="25%" maxSize="75%">
            <div
              style={{
                height: '100%',
                background: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Left Tabs Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 1rem',
                  background: 'rgba(15, 23, 42, 0.7)',
                  borderBottom: '1px solid var(--border-subtle)',
                  flexShrink: 0,
                }}
              >
                <button
                  id="tab-statement-btn"
                  onClick={() => setLeftTab('statement')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: `2px solid ${leftTab === 'statement' ? 'var(--accent-cyan)' : 'transparent'}`,
                    color: leftTab === 'statement' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  <FileText size={15} />
                  <span>Description</span>
                </button>

                <button
                  id="tab-submissions-btn"
                  onClick={() => setLeftTab('submissions')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: `2px solid ${leftTab === 'submissions' ? 'var(--accent-cyan)' : 'transparent'}`,
                    color: leftTab === 'submissions' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  <History size={15} />
                  <span>Submissions</span>
                  {pastSubmissions.length > 0 && (
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '10px',
                        padding: '0.1rem 0.4rem',
                        fontSize: '0.7rem',
                      }}
                    >
                      {pastSubmissions.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Left Pane Content (Independently scrollable) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {leftTab === 'statement' ? (
                  <div>
                    {/* Meta info chips */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      <span className="badge badge-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} /> Time Limit: {problem.timeLimitMs}ms
                      </span>
                      <span className="badge badge-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <HardDrive size={12} /> Memory Limit: {Math.round(problem.memoryLimitKb / 1024)}MB
                      </span>
                      {problem.tags.map((tag) => (
                        <span key={tag} className="badge badge-tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Problem Statement Content rendered via ReactMarkdown & KaTeX */}
                    <div className="markdown-statement">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {problem.statement}
                      </ReactMarkdown>
                    </div>

                    {/* Formatted Problem Examples Section */}
                    {problem.sampleCases && problem.sampleCases.length > 0 && (
                      <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileCode size={16} style={{ color: 'var(--accent-cyan)' }} />
                          <span>Examples</span>
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                          {problem.sampleCases.map((sc, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: '#111827',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.875rem 1rem',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                                  Example {idx + 1}
                                </span>
                                <button
                                  onClick={() => handleCopyInput(sc.input, idx)}
                                  className="btn btn-outline"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                                >
                                  {copiedInputIdx === idx ? <Check size={12} style={{ color: 'var(--verdict-ac)' }} /> : <Copy size={12} />}
                                  <span>{copiedInputIdx === idx ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>

                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                Input:
                              </div>
                              <pre
                                style={{
                                  background: '#090d16',
                                  padding: '0.4rem 0.6rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)',
                                  marginBottom: '0.5rem',
                                  overflowX: 'auto',
                                }}
                              >
                                {sc.input}
                              </pre>

                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                                Output:
                              </div>
                              <pre
                                style={{
                                  background: '#090d16',
                                  padding: '0.4rem 0.6rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--accent-cyan)',
                                  marginBottom: sc.explanation ? '0.5rem' : '0',
                                  overflowX: 'auto',
                                }}
                              >
                                {sc.output}
                              </pre>

                              {sc.explanation && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(77, 171, 247, 0.06)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-xs)', borderLeft: '3px solid var(--accent-cyan)' }}>
                                  <strong>Explanation:</strong> {sc.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Submissions History Tab */
                  <div>
                    {!user ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                          Sign in to view your past submissions for this problem.
                        </p>
                        <button onClick={() => openAuthModal('login')} className="btn btn-primary">
                          Sign In
                        </button>
                      </div>
                    ) : loadingPastSubmissions ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                        <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--accent-cyan)' }} />
                        <p>Loading submission history...</p>
                      </div>
                    ) : pastSubmissions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                        <History size={36} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                        <p>You haven't submitted any code for this problem yet.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pastSubmissions.map((sub) => (
                          <div
                            key={sub._id}
                            className="glass-card"
                            style={{
                              padding: '0.875rem 1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <VerdictBadge verdict={sub.verdict} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                                  {sub.language}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(sub.submittedAt).toLocaleString()}
                                {sub.executionTime !== undefined && (
                                  <span style={{ marginLeft: '0.5rem' }}>• {sub.executionTime}ms</span>
                                )}
                                {sub.memoryUsed !== undefined && (
                                  <span style={{ marginLeft: '0.5rem' }}>• {sub.memoryUsed}KB</span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                setViewCodeModal({
                                  open: true,
                                  code: sub.code || '',
                                  language: sub.language,
                                  verdict: sub.verdict,
                                })
                              }
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                            >
                              View Code
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Draggable Horizontal Gutter */}
          <Separator className="resize-handle-horizontal" />

          {/* RIGHT PANEL: Nested Vertical Split (Top: Monaco Editor, Bottom: Docked Console Drawer) */}
          <Panel id="workspace-right-panel" defaultSize="55%" minSize="25%" maxSize="75%">
            <Group orientation="vertical" {...verticalLayout} style={{ height: '100%', overflow: 'hidden' }}>
              {/* Top Vertical Panel: Monaco Code Editor */}
              <Panel id="editor-monaco-panel" minSize="50%" defaultSize="70%">
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflow: 'hidden' }}>
                  {/* Editor Header Toolbar */}
                  <div
                    style={{
                      padding: '0.4rem 1rem',
                      background: '#181818',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexShrink: 0,
                    }}
                  >
                    {/* Left: Language & Font Size */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <select
                        id="language-select"
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                        aria-label="Programming Language"
                        style={{
                          background: '#252526',
                          color: 'var(--text-primary)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.3rem 0.75rem',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value={SupportedLanguages.CPP}>C++ (GCC 12 / C++17)</option>
                        <option value={SupportedLanguages.PYTHON}>Python 3 (3.11)</option>
                      </select>

                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        aria-label="Editor Font Size"
                        style={{
                          background: '#252526',
                          color: 'var(--text-secondary)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.75rem',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value={12}>12px</option>
                        <option value={14}>14px</option>
                        <option value={16}>16px</option>
                        <option value={18}>18px</option>
                      </select>
                    </div>

                    {/* Right: Reset Action */}
                    {showResetConfirm ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Reset code?</span>
                        <button
                          onClick={handleResetCode}
                          className="btn btn-outline"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: 'var(--verdict-wa)', borderColor: 'var(--verdict-wa-border)' }}
                        >
                          Yes, Reset
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="btn btn-outline"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'transparent' }}
                        title="Reset code template"
                      >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  {/* Monaco Editor Instance */}
                  <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <Editor
                      height="100%"
                      language={LANGUAGE_CONFIGS[language].monacoLanguage}
                      theme="vs-dark"
                      value={editorCode}
                      onChange={(value) => setEditorCode(value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        padding: { top: 12, bottom: 12 },
                      }}
                    />
                  </div>
                </div>
              </Panel>

              {/* Draggable Vertical Gutter */}
              <Separator className="resize-handle-vertical" />

              {/* Bottom Vertical Panel: Docked Interactive Console Drawer (Capped at 50% max so it never stretches beyond content) */}
              <Panel
                id="console-bottom-panel"
                panelRef={consolePanelRef}
                collapsible={true}
                collapsedSize="38px"
                defaultSize="30%"
                minSize="140px"
                maxSize="50%"
                onResize={(size) => {
                  setIsConsoleCollapsed(size.inPixels <= 45);
                }}
              >
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#141414', overflow: 'hidden' }}>
                  {/* Console Header Docked Bar (Always 38px high and pinned) */}
                  <div
                    style={{
                      height: '38px',
                      minHeight: '38px',
                      maxHeight: '38px',
                      background: '#181818',
                      borderBottom: isConsoleCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 0.875rem',
                      flexShrink: 0,
                      userSelect: 'none',
                    }}
                  >
                    {/* Console Tabs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button
                        id="tab-console-testcases"
                        onClick={() => handleOpenConsoleTab('testcases')}
                        style={{
                          background: consoleTab === 'testcases' && !isConsoleCollapsed ? '#252526' : 'transparent',
                          color: consoleTab === 'testcases' && !isConsoleCollapsed ? 'var(--accent-cyan)' : 'var(--text-muted)',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <FileCode size={13} />
                        <span>Sample Cases</span>
                      </button>

                      <button
                        id="tab-console-results"
                        onClick={() => handleOpenConsoleTab('results')}
                        style={{
                          background: consoleTab === 'results' && !isConsoleCollapsed ? '#252526' : 'transparent',
                          color: consoleTab === 'results' && !isConsoleCollapsed ? 'var(--accent-cyan)' : 'var(--text-muted)',
                          border: 'none',
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Terminal size={13} />
                        <span>Verdict & Results</span>
                      </button>

                      {activeSubmission?.compileOutput && (
                        <button
                          id="tab-console-compiler"
                          onClick={() => handleOpenConsoleTab('compiler')}
                          style={{
                            background: consoleTab === 'compiler' && !isConsoleCollapsed ? '#252526' : 'transparent',
                            color: 'var(--verdict-wa)',
                            border: 'none',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                          }}
                        >
                          <AlertTriangle size={13} />
                          <span>Compiler Log</span>
                        </button>
                      )}
                    </div>

                    {/* Collapse / Expand Toggle */}
                    <button
                      onClick={handleToggleConsole}
                      aria-label="Toggle console drawer"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.25rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                      }}
                      title={isConsoleCollapsed ? 'Expand Console' : 'Collapse Console'}
                    >
                      {isConsoleCollapsed ? (
                        <>
                          <Maximize2 size={13} />
                          <span>Expand</span>
                        </>
                      ) : (
                        <>
                          <Minimize2 size={13} />
                          <span>Collapse</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Console Body Content (Visible only when expanded, clean vertical fit) */}
                  {!isConsoleCollapsed && (
                    <div style={{ flex: 1, minHeight: 0, padding: '0.75rem 1rem', overflowY: 'auto' }}>
                      {consoleTab === 'testcases' ? (
                        /* TAB 1: Interactive Sample Testcases Navigator */
                        <div>
                          {/* Case Selector Pills */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                            {problem.sampleCases.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveCaseIndex(idx)}
                                className={`case-pill-btn ${activeCaseIndex === idx ? 'active' : ''}`}
                              >
                                Case {idx + 1}
                              </button>
                            ))}
                          </div>

                          {/* Active Case Details */}
                          {currentSampleCase && (
                            <div className="glass-card" style={{ padding: '0.75rem 0.875rem', background: '#111827' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                  Input:
                                </span>
                                <button
                                  onClick={() => handleCopyInput(currentSampleCase.input, activeCaseIndex)}
                                  className="btn btn-outline"
                                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.6875rem' }}
                                >
                                  {copiedInputIdx === activeCaseIndex ? (
                                    <Check size={12} style={{ color: 'var(--verdict-ac)' }} />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                  <span>{copiedInputIdx === activeCaseIndex ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <pre
                                style={{
                                  background: '#090d16',
                                  padding: '0.4rem 0.6rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)',
                                  marginBottom: '0.5rem',
                                  maxHeight: '90px',
                                  overflowX: 'auto',
                                  overflowY: 'auto',
                                  lineHeight: 1.45,
                                }}
                              >
                                {currentSampleCase.input}
                              </pre>

                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                Expected Output:
                              </div>
                              <pre
                                style={{
                                  background: '#090d16',
                                  padding: '0.4rem 0.6rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--accent-cyan)',
                                  maxHeight: '90px',
                                  overflowX: 'auto',
                                  overflowY: 'auto',
                                  lineHeight: 1.45,
                                }}
                              >
                                {currentSampleCase.output}
                              </pre>

                              {currentSampleCase.explanation && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(77,171,247,0.06)', padding: '0.35rem 0.55rem', borderRadius: '4px' }}>
                                  <strong>Note:</strong> {currentSampleCase.explanation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : consoleTab === 'results' ? (
                        /* TAB 2: Live Execution Results / Verdict */
                        <div>
                          {sampleRunning ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-secondary)' }}>
                              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--accent-cyan)' }} />
                              <p style={{ fontSize: '0.8125rem' }}>Executing code against sample cases...</p>
                            </div>
                          ) : submitting ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-secondary)' }}>
                              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--verdict-ac)' }} />
                              <p style={{ fontSize: '0.8125rem' }}>Evaluating solution against hidden sandbox test cases...</p>
                            </div>
                          ) : sampleRunError ? (
                            <div
                              style={{
                                background: 'var(--verdict-wa-bg)',
                                border: '1px solid var(--verdict-wa-border)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.625rem 0.875rem',
                                fontSize: '0.8125rem',
                                color: 'var(--verdict-wa)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <AlertCircle size={15} />
                              <span>{sampleRunError}</span>
                            </div>
                          ) : activeSubmission ? (
                            /* Full Submission Verdict View */
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <VerdictBadge verdict={activeSubmission.verdict} />
                                </div>

                                {activeSubmission.verdict !== Verdicts.PENDING && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                                    {activeSubmission.executionTime !== undefined && (
                                      <span className="badge badge-tag">
                                        <Clock size={11} /> {activeSubmission.executionTime}ms
                                      </span>
                                    )}
                                    {activeSubmission.memoryUsed !== undefined && (
                                      <span className="badge badge-tag">
                                        <HardDrive size={11} /> {activeSubmission.memoryUsed}KB
                                      </span>
                                    )}
                                    {activeSubmission.totalTestCases !== undefined && (
                                      <span className="badge badge-tag">
                                        <CheckCircle2 size={11} style={{ color: 'var(--verdict-ac)' }} />
                                        {activeSubmission.passedTestCases}/{activeSubmission.totalTestCases} Passed
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {activeSubmission.failedTestCaseNumber && (
                                <div
                                  style={{
                                    background: 'var(--verdict-wa-bg)',
                                    border: '1px solid var(--verdict-wa-border)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.5rem 0.75rem',
                                    fontSize: '0.8125rem',
                                    color: 'var(--verdict-wa)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                  }}
                                >
                          <AlertTriangle size={15} />
                                  <span>
                                    Failed on <strong>Test Case #{activeSubmission.failedTestCaseNumber}</strong> (Evaluation halted).
                                  </span>
                                </div>
                              )}

                              {submissionTimeoutMsg && (
                                <div
                                  style={{
                                    marginTop: '0.5rem',
                                    background: 'rgba(251, 191, 36, 0.1)',
                                    border: '1px solid rgba(251, 191, 36, 0.3)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.5rem 0.75rem',
                                    fontSize: '0.8125rem',
                                    color: '#fbbf24',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                  }}
                                >
                                  <AlertCircle size={15} />
                                  <span>{submissionTimeoutMsg}</span>
                                </div>
                              )}

                              {/* Approach & Complexity Classification Badge (Post-AC) */}
                              {activeSubmission.verdict === Verdicts.ACCEPTED && activeSubmission.classification && (
                                <div
                                  style={{
                                    marginTop: '0.75rem',
                                    background: 'rgba(34, 197, 94, 0.08)',
                                    border: '1px solid rgba(34, 197, 94, 0.25)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.75rem 1rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--verdict-ac)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                      <Sparkles size={14} /> Approach Classification
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI Verified</span>
                                  </div>
                                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                    <strong>Pattern:</strong> {activeSubmission.classification.approach}
                                  </div>
                                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    <span><strong>Time:</strong> {activeSubmission.classification.timeComplexity}</span>
                                    <span><strong>Space:</strong> {activeSubmission.classification.spaceComplexity}</span>
                                  </div>
                                  {activeSubmission.classification.relatedProblemCode && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                                      <Link to={`/problems/${activeSubmission.classification.relatedProblemCode}`} style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
                                        Try harder related problem: {activeSubmission.classification.relatedProblemCode} &rarr;
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Socratic Hint Copilot Button & Card (Non-AC failures) */}
                              {activeSubmission.verdict !== Verdicts.ACCEPTED && activeSubmission.verdict !== Verdicts.PENDING && (
                                <div style={{ marginTop: '0.875rem' }}>
                                  {!hintState.hint && !hintState.loading && (
                                    <button
                                      id="btn-request-ai-hint"
                                      onClick={() => handleRequestHint(activeSubmission.submissionId)}
                                      className="btn btn-outline"
                                      style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        borderColor: 'rgba(234, 179, 8, 0.4)',
                                        background: 'rgba(234, 179, 8, 0.06)',
                                        color: '#eab308',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Lightbulb size={15} />
                                      <span>Get Socratic Debug Hint 💡</span>
                                    </button>
                                  )}

                                  {hintState.loading && (
                                    <div
                                      style={{
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(234, 179, 8, 0.05)',
                                        border: '1px solid rgba(234, 179, 8, 0.2)',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.6rem',
                                        color: '#eab308',
                                        fontSize: '0.8125rem',
                                      }}
                                    >
                                      <Loader2 size={16} className="animate-spin" />
                                      <span>Consulting Socratic Tutor...</span>
                                    </div>
                                  )}

                                  {hintState.error && (
                                    <div
                                      style={{
                                        marginTop: '0.5rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(239, 68, 68, 0.08)',
                                        border: '1px solid rgba(239, 68, 68, 0.25)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--verdict-wa)',
                                        fontSize: '0.8125rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                      }}
                                    >
                                      <AlertCircle size={14} />
                                      <span>{hintState.error}</span>
                                    </div>
                                  )}

                                  {hintState.hint && (
                                    <div
                                      className="glass-card"
                                      style={{
                                        marginTop: '0.5rem',
                                        padding: '0.875rem 1rem',
                                        background: 'rgba(30, 27, 20, 0.7)',
                                        border: '1px solid rgba(234, 179, 8, 0.3)',
                                        borderRadius: 'var(--radius-md)',
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          marginBottom: '0.4rem',
                                          paddingBottom: '0.35rem',
                                          borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#eab308', fontWeight: 700, fontSize: '0.8125rem' }}>
                                          <Lightbulb size={15} />
                                          <span>Socratic Debug Hint</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                          {hintState.remainingDaily !== undefined && (
                                            <span>{hintState.remainingDaily} hints left today</span>
                                          )}
                                          {hintState.provider && hintState.provider !== 'none' && (
                                            <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                                              {hintState.provider}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm, remarkMath]}
                                          rehypePlugins={[rehypeKatex]}
                                          components={{
                                            p: ({ node, ...props }) => <p style={{ margin: '0 0 0.35rem 0', lineHeight: 1.55 }} {...props} />,
                                            code: ({ node, inline: isInline, ...props }: any) =>
                                              isInline ? (
                                                <code
                                                  style={{
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    padding: '0.1rem 0.35rem',
                                                    borderRadius: '3px',
                                                    fontSize: '0.85em',
                                                    fontFamily: 'var(--font-mono)',
                                                    color: 'var(--accent-cyan)',
                                                  }}
                                                  {...props}
                                                />
                                              ) : (
                                                <pre style={{ background: '#090d16', padding: '0.4rem 0.6rem', borderRadius: '4px', margin: '0.35rem 0', fontSize: '0.78rem' }}>
                                                  <code {...props} />
                                                </pre>
                                              ),
                                          }}
                                        >
                                          {hintState.hint}
                                        </ReactMarkdown>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : sampleResults.length > 0 ? (
                            /* Live Sample Run Results Navigation */
                            <div>
                              {/* Case Results Selector Pills */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                {sampleResults.map((sr, idx) => (
                                  <button
                                    key={sr.caseIndex}
                                    onClick={() => setActiveCaseIndex(idx)}
                                    className={`case-pill-btn ${activeCaseIndex === idx ? 'active' : ''} ${sr.passed ? 'passed' : 'failed'}`}
                                  >
                                    <span>Case {sr.caseIndex}</span>
                                    {sr.passed ? (
                                      <Check size={12} style={{ color: 'var(--verdict-ac)' }} />
                                    ) : (
                                      <XCircle size={12} style={{ color: 'var(--verdict-wa)' }} />
                                    )}
                                  </button>
                                ))}
                              </div>

                              {/* Active Case Output Diff */}
                              {currentResultCase && (
                                <div className="glass-card" style={{ padding: '0.75rem 0.875rem', background: '#111827' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                                      Case {currentResultCase.caseIndex} Result
                                    </span>
                                    <span
                                      className={`badge ${currentResultCase.passed ? 'badge-easy' : 'badge-hard'}`}
                                      style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}
                                    >
                                      {currentResultCase.passed ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>

                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                                    Input:
                                  </div>
                                  <pre
                                    style={{
                                      fontSize: '0.75rem',
                                      background: '#090d16',
                                      padding: '0.35rem 0.55rem',
                                      borderRadius: '4px',
                                      marginBottom: '0.4rem',
                                      maxHeight: '80px',
                                      overflowX: 'auto',
                                      overflowY: 'auto',
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    {currentResultCase.input}
                                  </pre>

                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                                    Your Output:
                                  </div>
                                  <pre
                                    style={{
                                      fontSize: '0.75rem',
                                      background: '#090d16',
                                      padding: '0.35rem 0.55rem',
                                      borderRadius: '4px',
                                      color: currentResultCase.passed ? 'var(--verdict-ac)' : 'var(--verdict-wa)',
                                      marginBottom: '0.4rem',
                                      maxHeight: '80px',
                                      overflowX: 'auto',
                                      overflowY: 'auto',
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    {currentResultCase.actualOutput || '<empty>'}
                                  </pre>

                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                                    Expected Output:
                                  </div>
                                  <pre
                                    style={{
                                      fontSize: '0.75rem',
                                      background: '#090d16',
                                      padding: '0.35rem 0.55rem',
                                      borderRadius: '4px',
                                      color: 'var(--text-muted)',
                                      maxHeight: '80px',
                                      overflowX: 'auto',
                                      overflowY: 'auto',
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    {currentResultCase.expectedOutput}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '1.25rem 0' }}>
                              Click <strong>"Run Samples"</strong> to test code against public examples, or <strong>"Submit Solution"</strong> to evaluate against all test cases.
                            </div>
                          )}
                        </div>
                      ) : (
                        /* TAB 3: Compiler Diagnostic Tab */
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--verdict-wa)', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                            <AlertTriangle size={15} />
                            <span>Compiler Diagnostics / Error Output</span>
                          </div>
                          <pre
                            style={{
                              background: '#090d16',
                              padding: '0.625rem 0.875rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8125rem',
                              fontFamily: 'var(--font-mono)',
                              color: '#fda4af',
                              border: '1px solid rgba(244, 63, 94, 0.3)',
                              maxHeight: '180px',
                              overflowX: 'auto',
                              overflowY: 'auto',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {activeSubmission?.compileOutput || 'No compiler errors.'}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      {/* View Past Code Modal */}
      <ViewCodeModal
        isOpen={viewCodeModal.open}
        onClose={() => setViewCodeModal((prev) => ({ ...prev, open: false }))}
        code={viewCodeModal.code}
        language={viewCodeModal.language}
        problemName={problem.name}
        verdict={viewCodeModal.verdict}
      />
    </div>
  );
};
