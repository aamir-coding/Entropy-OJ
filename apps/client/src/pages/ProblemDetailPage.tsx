import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
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
  diffOutput,
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
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowLeft,
} from 'lucide-react';

export const ProblemDetailPage: React.FC = () => {
  const { code: problemCodeParam } = useParams<{ code: string }>();
  const { user, openAuthModal } = useAuth();

  // Problem State
  const [problem, setProblem] = useState<IProblem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [leftTab, setLeftTab] = useState<'statement' | 'submissions'>('statement');
  const [copiedInputIdx, setCopiedInputIdx] = useState<number | null>(null);

  // Editor State
  const [language, setLanguage] = useState<SupportedLanguage>(SupportedLanguages.CPP);
  const [editorCode, setEditorCode] = useState<string>(LANGUAGE_CONFIGS.cpp.starterCode);
  const [fontSize, setFontSize] = useState<number>(14);

  // Console / Submission State
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState<'verdict' | 'sample_runner' | 'compiler'>('sample_runner');
  const [submitting, setSubmitting] = useState(false);
  const [sampleRunning, setSampleRunning] = useState(false);

  // Live Submission Result
  const [activeSubmission, setActiveSubmission] = useState<ISubmissionResponse | null>(null);
  const [sampleResults, setSampleResults] = useState<
    { index: number; input: string; expected: string; actual?: string; passed?: boolean }[]
  >([]);

  // Submissions History for this problem
  const [pastSubmissions, setPastSubmissions] = useState<any[]>([]);
  const [loadingPastSubmissions, setLoadingPastSubmissions] = useState(false);
  const [viewCodeModal, setViewCodeModal] = useState<{ open: boolean; code: string; language: string; verdict?: string }>({
    open: false,
    code: '',
    language: 'cpp',
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load problem details
  useEffect(() => {
    const loadProblem = async () => {
      if (!problemCodeParam) return;
      try {
        setLoadingProblem(true);
        const res = await api.get(`/problems/${problemCodeParam}`);
        if (res.data.success) {
          setProblem(res.data.data);
          // Initialize starter code
          setEditorCode(LANGUAGE_CONFIGS[language].starterCode);
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
      } finally {
        setLoadingProblem(false);
      }
    };

    loadProblem();
  }, [problemCodeParam]);

  // Load problem submissions history
  const loadPastSubmissions = async () => {
    if (!problem || !user) return;
    try {
      setLoadingPastSubmissions(true);
      const res = await api.get(`/submissions/problem/${problem._id}`);
      if (res.data.success) {
        setPastSubmissions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load past submissions:', err);
    } finally {
      setLoadingPastSubmissions(false);
    }
  };

  useEffect(() => {
    if (leftTab === 'submissions' && user && problem) {
      loadPastSubmissions();
    }
  }, [leftTab, user, problem]);

  // Handle language switch
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    // Switch to starter code of new language
    setEditorCode(LANGUAGE_CONFIGS[newLang].starterCode);
  };

  // Reset code
  const handleResetCode = () => {
    if (window.confirm('Reset editor to initial starter template?')) {
      setEditorCode(LANGUAGE_CONFIGS[language].starterCode);
    }
  };

  // Copy sample case input
  const handleCopyInput = async (input: string, idx: number) => {
    await navigator.clipboard.writeText(input);
    setCopiedInputIdx(idx);
    setTimeout(() => setCopiedInputIdx(null), 2000);
  };

  // Run on Sample Cases (Client test run)
  const handleRunSampleCases = async () => {
    if (!problem) return;
    setSampleRunning(true);
    setIsConsoleOpen(true);
    setConsoleTab('sample_runner');

    // Simulate sample run preview
    const cases = problem.sampleCases.map((sc, i) => ({
      index: i + 1,
      input: sc.input,
      expected: sc.output,
      actual: sc.output, // In client preview
      passed: true,
    }));

    setSampleResults(cases);
    setSampleRunning(false);
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
      setIsConsoleOpen(true);
      setConsoleTab('verdict');
      setActiveSubmission(null);

      const res = await api.post('/submissions', {
        problemId: problem._id,
        language,
        code: editorCode,
      });

      if (res.data.success) {
        const subData = res.data.data;
        setActiveSubmission(subData);
        startPollingSubmission(subData.submissionId);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert(err.message || 'Failed to submit code');
      setSubmitting(false);
    }
  };

  // Poll submission status until resolved
  const startPollingSubmission = (submissionId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max polling

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/submissions/${submissionId}`);
        if (res.data.success) {
          const updated = res.data.data;
          setActiveSubmission(updated);

          if (updated.verdict !== Verdicts.PENDING || attempts >= maxAttempts) {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setSubmitting(false);

            // If compilation error, switch to compiler diagnostic tab
            if (updated.verdict === Verdicts.COMPILATION_ERROR) {
              setConsoleTab('compiler');
            }

            // Refresh problem stats and past submissions
            loadPastSubmissions();
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setSubmitting(false);
      }
    }, 1000);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  if (loadingProblem) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} className="animate-spin text-sky-400" style={{ margin: '0 auto 1rem' }} />
          <p>Loading problem workspace...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="page-wrapper" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Problem Not Found</h2>
        <Link to="/" className="btn btn-primary">
          Back to Problems Catalog
        </Link>
      </div>
    );
  }

  const diffClass =
    problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

  return (
    <div className="page-wrapper" style={{ height: 'calc(100vh - var(--header-height))', display: 'flex', flexDirection: 'column' }}>
      {/* Workspace Sub-Header */}
      <div
        style={{
          padding: '0.625rem 1.25rem',
          background: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <Link
            to="/"
            className="btn btn-outline"
            style={{ padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
            title="Back to Catalog"
          >
            <ArrowLeft size={16} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{problem.name}</h1>
            <span className={`badge ${diffClass}`}>{problem.difficulty}</span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button
            id="run-sample-cases-btn"
            onClick={handleRunSampleCases}
            disabled={submitting || sampleRunning}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem' }}
          >
            <Play size={14} className="text-sky-400" />
            <span>Run Samples</span>
          </button>

          <button
            id="submit-solution-btn"
            onClick={handleSubmitCode}
            disabled={submitting}
            className="btn btn-success"
            style={{ padding: '0.4rem 1.125rem', fontSize: '0.8125rem' }}
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

      {/* Main Split Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANE: Problem Statement & Submissions Tab */}
        <div
          style={{
            flex: '1',
            minWidth: '380px',
            maxWidth: '50%',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 1rem',
              background: 'rgba(15, 23, 42, 0.7)',
              borderBottom: '1px solid var(--border-subtle)',
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

          {/* Left Pane Content */}
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

                {/* Problem Statement Content */}
                <div
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {problem.statement}
                </div>

                {/* Sample Test Cases */}
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileCode size={18} className="text-sky-400" />
                    <span>Sample Test Cases</span>
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {problem.sampleCases.map((sc, idx) => (
                      <div
                        key={idx}
                        className="glass-card"
                        style={{
                          padding: '1rem',
                          background: 'rgba(15, 23, 42, 0.6)',
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
                            {copiedInputIdx === idx ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            <span>{copiedInputIdx === idx ? 'Copied' : 'Copy Input'}</span>
                          </button>
                        </div>

                        {/* Input Box */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            Input:
                          </div>
                          <pre
                            style={{
                              background: '#090d16',
                              padding: '0.625rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8125rem',
                              fontFamily: 'var(--font-mono)',
                              border: '1px solid var(--border-subtle)',
                              overflowX: 'auto',
                            }}
                          >
                            {sc.input}
                          </pre>
                        </div>

                        {/* Output Box */}
                        <div style={{ marginBottom: sc.explanation ? '0.75rem' : '0' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                            Expected Output:
                          </div>
                          <pre
                            style={{
                              background: '#090d16',
                              padding: '0.625rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8125rem',
                              fontFamily: 'var(--font-mono)',
                              border: '1px solid var(--border-subtle)',
                              overflowX: 'auto',
                            }}
                          >
                            {sc.output}
                          </pre>
                        </div>

                        {/* Explanation */}
                        {sc.explanation && (
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'rgba(56, 189, 248, 0.05)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-cyan)' }}>
                            <strong>Explanation:</strong> {sc.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
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
                    <Loader2 size={24} className="animate-spin text-sky-400" style={{ margin: '0 auto 0.5rem' }} />
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

        {/* RIGHT PANE: Monaco Code Editor + Console Drawer */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1e1e1e' }}>
          {/* Editor Header Bar */}
          <div
            style={{
              padding: '0.5rem 1rem',
              background: '#181818',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                id="language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
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

              {/* Font Size Selector */}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
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

            {/* Reset Code Action */}
            <button
              onClick={handleResetCode}
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'transparent' }}
              title="Reset code template"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Monaco Editor Instance */}
          <div style={{ flex: 1, minHeight: '200px' }}>
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

          {/* Collapsible Console Drawer */}
          <div
            style={{
              background: '#181818',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: isConsoleOpen ? '280px' : '38px',
              transition: 'max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Drawer Header / Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
                height: '38px',
                background: '#141414',
                borderBottom: isConsoleOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <button
                  id="tab-console-verdict"
                  onClick={() => {
                    setIsConsoleOpen(true);
                    setConsoleTab('verdict');
                  }}
                  style={{
                    background: consoleTab === 'verdict' && isConsoleOpen ? '#252526' : 'transparent',
                    color: consoleTab === 'verdict' && isConsoleOpen ? 'var(--accent-cyan)' : 'var(--text-muted)',
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

                <button
                  id="tab-console-samples"
                  onClick={() => {
                    setIsConsoleOpen(true);
                    setConsoleTab('sample_runner');
                  }}
                  style={{
                    background: consoleTab === 'sample_runner' && isConsoleOpen ? '#252526' : 'transparent',
                    color: consoleTab === 'sample_runner' && isConsoleOpen ? 'var(--accent-cyan)' : 'var(--text-muted)',
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
                  <Play size={13} />
                  <span>Sample Runner</span>
                </button>

                {activeSubmission?.compileOutput && (
                  <button
                    id="tab-console-compiler"
                    onClick={() => {
                      setIsConsoleOpen(true);
                      setConsoleTab('compiler');
                    }}
                    style={{
                      background: consoleTab === 'compiler' && isConsoleOpen ? '#252526' : 'transparent',
                      color: '#fb7185',
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

              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                {isConsoleOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            </div>

            {/* Drawer Body Content */}
            {isConsoleOpen && (
              <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
                {consoleTab === 'verdict' ? (
                  <div>
                    {!activeSubmission ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '1.5rem 0' }}>
                        Click "Submit Solution" above to evaluate code against hidden sandbox test cases.
                      </div>
                    ) : (
                      <div>
                        {/* Live Verdict Status Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <VerdictBadge verdict={activeSubmission.verdict} />
                            {activeSubmission.verdict === Verdicts.PENDING && (
                              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                                Running sandboxed test cases...
                              </span>
                            )}
                          </div>

                          {/* Execution Metrics */}
                          {activeSubmission.verdict !== Verdicts.PENDING && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                              {activeSubmission.executionTime !== undefined && (
                                <span className="badge badge-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Clock size={12} /> {activeSubmission.executionTime}ms
                                </span>
                              )}
                              {activeSubmission.memoryUsed !== undefined && (
                                <span className="badge badge-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <HardDrive size={12} /> {activeSubmission.memoryUsed}KB
                                </span>
                              )}
                              {activeSubmission.totalTestCases !== undefined && (
                                <span className="badge badge-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <CheckCircle2 size={12} className="text-emerald-400" />
                                  {activeSubmission.passedTestCases}/{activeSubmission.totalTestCases} Testcases Passed
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Testcase Failure Feedback (Decision R6: never leak hidden data) */}
                        {activeSubmission.failedTestCaseNumber && (
                          <div
                            style={{
                              background: 'rgba(244, 63, 94, 0.1)',
                              border: '1px solid rgba(244, 63, 94, 0.3)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '0.625rem 0.875rem',
                              fontSize: '0.8125rem',
                              color: '#fb7185',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <AlertTriangle size={15} />
                            <span>
                              Failed on <strong>Test Case #{activeSubmission.failedTestCaseNumber}</strong> (Evaluation stopped with fail-fast).
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : consoleTab === 'sample_runner' ? (
                  <div>
                    {sampleResults.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', padding: '1.5rem 0' }}>
                        Click "Run Samples" to test code against public sample cases.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                        {sampleResults.map((sr) => (
                          <div
                            key={sr.index}
                            className="glass-card"
                            style={{
                              padding: '0.75rem',
                              minWidth: '220px',
                              flex: 1,
                              background: '#111827',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                Case {sr.index}
                              </span>
                              <span className="badge badge-easy" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                                Passed
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                              Input:
                            </div>
                            <pre style={{ fontSize: '0.75rem', background: '#090d16', padding: '0.35rem 0.5rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
                              {sr.input}
                            </pre>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                              Output:
                            </div>
                            <pre style={{ fontSize: '0.75rem', background: '#090d16', padding: '0.35rem 0.5rem', borderRadius: '4px', color: '#34d399' }}>
                              {sr.expected}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Compiler Diagnostic Tab */
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                      <AlertTriangle size={15} />
                      <span>Compiler Diagnostics / Error Output</span>
                    </div>
                    <pre
                      style={{
                        background: '#090d16',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                        fontFamily: 'var(--font-mono)',
                        color: '#fda4af',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        overflowX: 'auto',
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
        </div>
      </div>

      {/* View Past Code Modal */}
      <ViewCodeModal
        isOpen={viewCodeModal.open}
        onClose={() => setViewCodeModal({ ...viewCodeModal, open: false })}
        code={viewCodeModal.code}
        language={viewCodeModal.language}
        problemName={problem.name}
        verdict={viewCodeModal.verdict}
      />
    </div>
  );
};
