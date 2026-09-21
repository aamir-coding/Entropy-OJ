import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import { katexSanitizeSchema } from '../utils/sanitizeSchema';
import {
  IProblem,
  SupportedLanguage,
  SupportedLanguages,
  LANGUAGE_CONFIGS,
  Verdicts,
  ISubmissionResponse,
  ISubmissionHistoryItem,
  ISampleCaseResult,
} from '@entropy-oj/shared';
import { StatefulButton, ButtonState } from './motion/button/stateful';
import { Tabs } from './motion/tabs';
import { VerdictBadge } from './VerdictBadge';
import { ProblemTimer } from './ProblemTimer';
import { ErrorBoundary } from './ErrorBoundary';
import { defineEntropyTheme } from '../styles/monacoTheme';
import {
  Play,
  Send,
  RotateCcw,
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
  Sparkles,
  Brain,
  Lightbulb,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { EntropyAiIcon } from './icons/EntropyAiIcon';

export interface MobileProblemWorkspaceProps {
  problem: IProblem;
  diffClass: string;
  user: any;
  problemCodeParam?: string;
  // Timer & Keystroke
  isProblemSolved: boolean;
  setIsProblemSolved: (val: boolean) => void;
  isTimerCompleted: boolean;
  setIsTimerCompleted: (val: boolean) => void;
  timerResetTrigger: number;
  editorKeystrokes: number;
  setEditorKeystrokes: React.Dispatch<React.SetStateAction<number>>;
  // Editor
  language: SupportedLanguage;
  handleLanguageChange: (lang: SupportedLanguage) => void;
  editorCode: string;
  setEditorCode: (code: string) => void;
  isCodeEmpty: boolean;
  handleResetCode: () => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (val: boolean) => void;
  saveDraft: (problemCode: string, lang: SupportedLanguage, code: string) => void;
  // Blind mode & tags
  blindMode: boolean;
  revealedTags: Set<string>;
  setRevealedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  // Submissions & Run
  submitting: boolean;
  sampleRunning: boolean;
  runButtonState: ButtonState;
  submitButtonState: ButtonState;
  handleRunSampleCases: () => void;
  handleSubmitCode: () => void;
  // Live results
  activeSubmission: ISubmissionResponse | null;
  submissionTimeoutMsg: string | null;
  sampleResults: ISampleCaseResult[];
  activeCaseIndex: number;
  setActiveCaseIndex: (idx: number) => void;
  resultView: 'submission' | 'sample';
  currentSampleCase?: any;
  currentResultCase?: any;
  copiedInputIdx: number | null;
  handleCopyInput: (text: string, idx: number) => void;
  // Console tabs
  consoleTab: 'testcases' | 'results' | 'compiler';
  handleOpenConsoleTab: (tab: 'testcases' | 'results' | 'compiler') => void;
  handleManualCheckStatus: () => void;
  // AI Hint
  hintState: {
    loading: boolean;
    hint: string | null;
    error: string | null;
    provider?: string;
    remainingDaily?: number;
    remainingHourly?: number;
  };
  handleRequestHint: (submissionId: string) => void;
  // AI Classification
  isClassifying: boolean;
  classifyError: string | null;
  handleClassifyApproach: (submissionId: string) => void;
  // Past submissions
  pastSubmissions: ISubmissionHistoryItem[];
  loadingPastSubmissions: boolean;
  openAuthModal: (mode: 'login' | 'register') => void;
  onViewCode: (sub: ISubmissionHistoryItem) => void;
}

export const MobileProblemWorkspace: React.FC<MobileProblemWorkspaceProps> = ({
  problem,
  diffClass,
  user,
  problemCodeParam,
  isProblemSolved,
  setIsProblemSolved,
  isTimerCompleted,
  setIsTimerCompleted,
  timerResetTrigger,
  editorKeystrokes,
  setEditorKeystrokes,
  language,
  handleLanguageChange,
  editorCode,
  setEditorCode,
  isCodeEmpty,
  handleResetCode,
  showResetConfirm,
  setShowResetConfirm,
  saveDraft,
  blindMode,
  revealedTags,
  setRevealedTags,
  submitting,
  sampleRunning,
  runButtonState,
  submitButtonState,
  handleRunSampleCases,
  handleSubmitCode,
  activeSubmission,
  submissionTimeoutMsg,
  sampleResults,
  activeCaseIndex,
  setActiveCaseIndex,
  resultView,
  currentSampleCase,
  currentResultCase,
  copiedInputIdx,
  handleCopyInput,
  consoleTab,
  handleOpenConsoleTab,
  handleManualCheckStatus,
  hintState,
  handleRequestHint,
  isClassifying,
  classifyError,
  handleClassifyApproach,
  pastSubmissions,
  loadingPastSubmissions,
  openAuthModal,
  onViewCode,
}) => {
  // Mobile active tab state
  const [activeTab, setActiveTab] = useState<'statement' | 'editor' | 'console'>('statement');
  const [statementSubTab, setStatementSubTab] = useState<'statement' | 'submissions'>('statement');

  const onMobileRun = () => {
    setActiveTab('console');
    handleRunSampleCases();
  };

  const onMobileSubmit = () => {
    setActiveTab('console');
    handleSubmitCode();
  };

  return (
    <div className="mobile-workspace-container" style={{ width: '100%' }}>
      {/* ── Mobile Sub-Header ── */}
      <div className="mobile-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <Link
            to="/problems"
            className="btn btn-outline"
            style={{ padding: '0.25rem 0.45rem', borderRadius: 'var(--radius-xs)', flexShrink: 0 }}
            aria-label="Back to problem catalog"
          >
            <ArrowLeft size={14} />
          </Link>
          <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '125px',
              }}
              title={problem.name}
            >
              {problem.name}
            </span>
            <span className={`badge ${diffClass}`} style={{ fontSize: '0.625rem', padding: '0.05rem 0.3rem', flexShrink: 0 }}>
              {problem.difficulty}
            </span>
            <span
              style={{
                fontSize: '0.625rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                padding: '0.05rem 0.3rem',
                background: 'var(--brand-neutral-600)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                flexShrink: 0,
              }}
              title="AI-Assisted: Socratic hints and approach classification"
            >
              <Brain size={10} style={{ color: 'var(--text-secondary)' }} />
              <span>AI</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <ProblemTimer
            difficulty={problem.difficulty}
            problemCode={problem.problemCode}
            userId={user?._id}
            isAccepted={isProblemSolved}
            editorKeystrokeTrigger={editorKeystrokes}
            resetTrigger={timerResetTrigger}
            onReset={() => setIsProblemSolved(false)}
            onCompletedChange={setIsTimerCompleted}
          />
        </div>
      </div>

      {/* ── Mobile Segmented Mode Nav ── */}
      <div className="mobile-segmented-tab-bar">
        <button
          id="mobile-tab-statement"
          onClick={() => setActiveTab('statement')}
          className={`mobile-segmented-tab-btn ${activeTab === 'statement' ? 'active' : ''}`}
        >
          <FileText size={13} />
          <span>Problem</span>
        </button>

        <button
          id="mobile-tab-editor"
          onClick={() => setActiveTab('editor')}
          className={`mobile-segmented-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
        >
          <FileCode size={13} />
          <span>Code ({language.toUpperCase()})</span>
        </button>

        <button
          id="mobile-tab-console"
          onClick={() => setActiveTab('console')}
          className={`mobile-segmented-tab-btn ${activeTab === 'console' ? 'active' : ''}`}
          style={{ position: 'relative' }}
        >
          <Terminal size={13} />
          <span>Console</span>
          {activeSubmission && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background:
                  activeSubmission.verdict === Verdicts.ACCEPTED
                    ? 'var(--verdict-ac)'
                    : activeSubmission.verdict === Verdicts.PENDING
                    ? 'var(--verdict-tle)'
                    : 'var(--verdict-wa)',
                marginLeft: '2px',
              }}
            />
          )}
        </button>
      </div>

      {/* ── Mobile Active Viewport ── */}
      <div className="mobile-viewport-content">
        {/* ── TAB 1: PROBLEM STATEMENT & SUBMISSIONS ── */}
        {activeTab === 'statement' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Sub-Tabs: Description / Submissions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem 0.875rem',
                background: '#050505',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <Tabs
                tabs={[
                  { id: 'statement', label: 'Description', icon: <FileText size={13} /> },
                  {
                    id: 'submissions',
                    label: 'Submissions',
                    icon: <History size={13} />,
                    badge: pastSubmissions.length > 0 ? (
                      <span
                        style={{
                          background: 'var(--brand-neutral-600)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-secondary)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '0.05rem 0.35rem',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                        }}
                      >
                        {pastSubmissions.length}
                      </span>
                    ) : null,
                  },
                ]}
                activeId={statementSubTab}
                onChange={(id) => setStatementSubTab(id as 'statement' | 'submissions')}
                layoutId="mobile-problem-left-tabs-indicator"
                variant="underline"
                size="sm"
              />
            </div>

            <div style={{ padding: '1rem' }}>
              {statementSubTab === 'statement' ? (
                <div>
                  {/* Meta Chips */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span className="badge badge-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem' }}>
                      <Clock size={11} /> Limit: {problem.timeLimitMs}ms
                    </span>
                    <span className="badge badge-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem' }}>
                      <HardDrive size={11} /> RAM: {Math.round(problem.memoryLimitKb / 1024)}MB
                    </span>

                    {/* Topic Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {problem.tags.map((tag) => {
                          const isBlurred = blindMode && !revealedTags.has(tag);
                          return (
                            <span
                              key={tag}
                              id={`mobile-problem-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() => {
                                if (blindMode) {
                                  setRevealedTags((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(tag)) next.delete(tag);
                                    else next.add(tag);
                                    return next;
                                  });
                                }
                              }}
                              className="badge badge-tag"
                              style={{
                                cursor: blindMode ? 'pointer' : 'default',
                                filter: isBlurred ? 'blur(4px)' : 'none',
                                userSelect: isBlurred ? 'none' : 'text',
                                transition: 'filter var(--transition-fast)',
                                fontSize: '0.68rem',
                              }}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Markdown Problem Statement with KaTeX */}
                  <div className="prose-dark" style={{ lineHeight: 1.7, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex, [rehypeSanitize, katexSanitizeSchema]]}
                    >
                      {problem.statement}
                    </ReactMarkdown>
                  </div>

                  {/* Sample Testcases */}
                  {problem.sampleCases && problem.sampleCases.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                        Sample Test Cases
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {problem.sampleCases.map((sc, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.75rem',
                              background: '#080808',
                              border: '1px solid var(--border-medium)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Example {idx + 1} Input:
                              </span>
                              <button
                                onClick={() => handleCopyInput(sc.input, idx)}
                                className="btn btn-outline"
                                style={{ padding: '0.15rem 0.4rem', fontSize: '0.68rem' }}
                              >
                                {copiedInputIdx === idx ? <Check size={11} style={{ color: 'var(--verdict-ac)' }} /> : <Copy size={11} />}
                                <span>{copiedInputIdx === idx ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <pre
                              style={{
                                background: '#000000',
                                border: '1px solid var(--border-subtle)',
                                padding: '0.4rem 0.55rem',
                                borderRadius: 'var(--radius-xs)',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-primary)',
                                marginBottom: '0.5rem',
                                maxHeight: '100px',
                                overflowX: 'auto',
                                overflowY: 'auto',
                              }}
                            >
                              {sc.input}
                            </pre>

                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                              Expected Output:
                            </div>
                            <pre
                              style={{
                                background: '#000000',
                                border: '1px solid var(--border-subtle)',
                                padding: '0.4rem 0.55rem',
                                borderRadius: 'var(--radius-xs)',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-primary)',
                                marginBottom: sc.explanation ? '0.5rem' : '0',
                                maxHeight: '100px',
                                overflowX: 'auto',
                                overflowY: 'auto',
                              }}
                            >
                              {sc.output}
                            </pre>

                            {sc.explanation && (
                              <div
                                style={{
                                  fontSize: '0.72rem',
                                  color: 'var(--text-secondary)',
                                  background: '#0c0c0c',
                                  border: '1px solid var(--border-medium)',
                                  padding: '0.4rem 0.55rem',
                                  borderRadius: 'var(--radius-xs)',
                                }}
                              >
                                <strong style={{ color: 'var(--text-primary)' }}>Explanation:</strong> {sc.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Submissions History */
                <div>
                  {!user ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.8125rem' }}>
                        Sign in to view your past submissions.
                      </p>
                      <button onClick={() => openAuthModal('login')} className="btn btn-primary">
                        Sign In
                      </button>
                    </div>
                  ) : loadingPastSubmissions ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
                      <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem', color: 'var(--accent-cyan)' }} />
                      <p style={{ fontSize: '0.8125rem' }}>Loading submission history...</p>
                    </div>
                  ) : pastSubmissions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
                      <History size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
                      <p style={{ fontSize: '0.8125rem' }}>No submissions yet for this problem.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {pastSubmissions.map((sub) => (
                        <div
                          key={sub._id}
                          className="glass-card"
                          style={{
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                              <VerdictBadge verdict={sub.verdict} />
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                                {sub.language}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {new Date(sub.submittedAt).toLocaleDateString()} {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {sub.executionTime !== undefined && <span style={{ marginLeft: '0.4rem' }}>• {sub.executionTime}ms</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => onViewCode(sub)}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: MOBILE MONACO CODE EDITOR ── */}
        {activeTab === 'editor' && (
          <div style={{ height: '100%', minHeight: '380px', display: 'flex', flexDirection: 'column', background: '#000000' }}>
            {/* Mobile Editor Toolbar */}
            <div
              style={{
                padding: '0.35rem 0.75rem',
                background: '#050505',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              {/* Language Selector */}
              <select
                id="mobile-language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                aria-label="Programming Language"
                style={{
                  background: '#0a0a0a',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value={SupportedLanguages.CPP}>C++ (GCC 12 / C++17)</option>
                <option value={SupportedLanguages.PYTHON}>Python 3 (3.11)</option>
              </select>

              {/* Reset Code Boilerplate */}
              {showResetConfirm ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <button
                    onClick={handleResetCode}
                    className="btn btn-outline"
                    style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', color: 'var(--verdict-wa)', borderColor: 'var(--verdict-wa-border)' }}
                  >
                    Reset?
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="btn btn-outline"
                    style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="btn btn-outline"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', borderColor: 'transparent' }}
                  aria-label="Reset starter code"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Mobile-Tuned Monaco Editor Instance */}
            <div style={{ flex: 1, minHeight: '340px', background: '#000000', overflow: 'hidden' }}>
              <ErrorBoundary
                fallback={
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--verdict-wa)', fontSize: '0.8125rem' }}>
                    Failed to load Monaco Editor. Please reload.
                  </div>
                }
              >
                <Editor
                  height="100%"
                  language={LANGUAGE_CONFIGS[language].monacoLanguage}
                  theme="entropy-dark"
                  beforeMount={defineEntropyTheme}
                  value={editorCode}
                  onChange={(val) => {
                    const nextVal = val || '';
                    setEditorCode(nextVal);
                    setEditorKeystrokes((prev) => prev + 1);
                    if (problemCodeParam) {
                      saveDraft(problemCodeParam, language, nextVal);
                    }
                  }}
                  options={{
                    fontSize: 14,
                    fontFamily: 'var(--font-mono)',
                    minimap: { enabled: false },
                    glyphMargin: false,
                    folding: false,
                    lineNumbers: 'on',
                    lineNumbersMinChars: 3,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'on',
                    padding: { top: 8, bottom: 8 },
                  }}
                />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {/* ── TAB 3: CONSOLE, TESTCASES & AI SOCRATIC HINTS ── */}
        {activeTab === 'console' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Console Sub-Tabs */}
            <div
              style={{
                height: '38px',
                minHeight: '38px',
                background: '#050505',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 0.75rem',
                flexShrink: 0,
              }}
            >
              <Tabs
                tabs={[
                  { id: 'testcases', label: 'Sample Cases', icon: <FileCode size={12} /> },
                  { id: 'results', label: 'Verdict & Results', icon: <Terminal size={12} /> },
                  ...(activeSubmission?.compileOutput
                    ? [
                        {
                          id: 'compiler',
                          label: 'Compiler Log',
                          icon: <AlertTriangle size={12} />,
                          activeColor: 'var(--verdict-wa)',
                        },
                      ]
                    : []),
                ]}
                activeId={consoleTab}
                onChange={(id) => handleOpenConsoleTab(id as 'testcases' | 'results' | 'compiler')}
                layoutId="mobile-problem-console-tabs-indicator"
                variant="pill"
                size="sm"
              />
            </div>

            {/* Console Body */}
            <div style={{ padding: '0.875rem' }}>
              {consoleTab === 'testcases' ? (
                /* Sub-Tab 1: Interactive Sample Testcases */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {problem.sampleCases.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveCaseIndex(idx)}
                        className={`case-pill-btn ${activeCaseIndex === idx ? 'active' : ''}`}
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {currentSampleCase && (
                    <div style={{ padding: '0.75rem', background: '#080808', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>Input:</span>
                        <button
                          onClick={() => handleCopyInput(currentSampleCase.input, activeCaseIndex)}
                          className="btn btn-outline"
                          style={{ padding: '0.15rem 0.4rem', fontSize: '0.68rem' }}
                        >
                          {copiedInputIdx === activeCaseIndex ? <Check size={11} style={{ color: 'var(--verdict-ac)' }} /> : <Copy size={11} />}
                          <span>{copiedInputIdx === activeCaseIndex ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre
                        style={{
                          background: '#000000',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.4rem 0.55rem',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-primary)',
                          marginBottom: '0.5rem',
                          maxHeight: '90px',
                          overflowX: 'auto',
                          overflowY: 'auto',
                        }}
                      >
                        {currentSampleCase.input}
                      </pre>

                      <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                        Expected Output:
                      </div>
                      <pre
                        style={{
                          background: '#000000',
                          border: '1px solid var(--border-subtle)',
                          padding: '0.4rem 0.55rem',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-primary)',
                          maxHeight: '90px',
                          overflowX: 'auto',
                          overflowY: 'auto',
                        }}
                      >
                        {currentSampleCase.output}
                      </pre>
                    </div>
                  )}
                </div>
              ) : consoleTab === 'results' ? (
                /* Sub-Tab 2: Execution Results & Verdict */
                <div>
                  {submitting ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                      <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.6rem', color: 'var(--accent-cyan)' }} />
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Evaluating code inside Docker sandbox...</p>
                    </div>
                  ) : sampleRunning ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                      <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.6rem', color: 'var(--accent-cyan)' }} />
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Running sample test cases...</p>
                    </div>
                  ) : activeSubmission ? (
                    /* Submission Result Card */
                    <div>
                      {/* Post-Submission AI Summary Banner */}
                      {activeSubmission.verdict !== Verdicts.PENDING && (
                        <div
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-faint)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.4rem 0.65rem',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontSize: '0.72rem',
                            color: 'var(--text-secondary)',
                            animation: 'fadeInDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          {activeSubmission.verdict === Verdicts.ACCEPTED ? (
                            <>
                              <EntropyAiIcon size={12} style={{ color: 'var(--verdict-ac)', flexShrink: 0 }} />
                              <span>
                                {activeSubmission.classification
                                  ? `Your ${activeSubmission.classification.approach} approach runs in ${activeSubmission.classification.timeComplexity} time.`
                                  : 'Accepted — classify your algorithmic approach below.'}
                              </span>
                            </>
                          ) : activeSubmission.verdict === Verdicts.WRONG_ANSWER ? (
                            <>
                              <Lightbulb size={12} style={{ color: 'var(--verdict-wa)', flexShrink: 0 }} />
                              <span>
                                {activeSubmission.failedTestCaseNumber
                                  ? `Failed on test case #${activeSubmission.failedTestCaseNumber}. Socratic hint available below.`
                                  : 'Failed on test case. Socratic hint available below.'}
                              </span>
                            </>
                          ) : activeSubmission.verdict === Verdicts.TIME_LIMIT_EXCEEDED ? (
                            <>
                              <Lightbulb size={12} style={{ color: 'var(--verdict-tle)', flexShrink: 0 }} />
                              <span>Time limit exceeded. Get an AI hint below to identify optimizations.</span>
                            </>
                          ) : activeSubmission.verdict === Verdicts.COMPILATION_ERROR ? (
                            <>
                              <Lightbulb size={12} style={{ color: 'var(--verdict-wa)', flexShrink: 0 }} />
                              <span>Compilation error detected. Request a debug hint below for guidance.</span>
                            </>
                          ) : (
                            <>
                              <Lightbulb size={12} style={{ color: 'var(--verdict-wa)', flexShrink: 0 }} />
                              <span>Runtime error detected. Request a debug hint below for guidance.</span>
                            </>
                          )}
                        </div>
                      )}

                      <div
                        style={{
                          padding: '0.875rem',
                          background: '#080808',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '0.875rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <VerdictBadge verdict={activeSubmission.verdict} />
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {activeSubmission.passedTestCases !== undefined && activeSubmission.totalTestCases !== undefined
                              ? `${activeSubmission.passedTestCases}/${activeSubmission.totalTestCases} cases passed`
                              : null}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.875rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {activeSubmission.executionTime !== undefined && (
                            <span>Time: <strong style={{ color: 'var(--text-primary)' }}>{activeSubmission.executionTime}ms</strong></span>
                          )}
                          {activeSubmission.memoryUsed !== undefined && (
                            <span>RAM: <strong style={{ color: 'var(--text-primary)' }}>{activeSubmission.memoryUsed}KB</strong></span>
                          )}
                        </div>

                        {submissionTimeoutMsg && (
                          <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--verdict-tle)' }}>
                            {submissionTimeoutMsg}
                            <button
                              onClick={handleManualCheckStatus}
                              className="btn btn-outline"
                              style={{ marginLeft: '0.5rem', padding: '0.15rem 0.4rem', fontSize: '0.68rem' }}
                            >
                              Check Status
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Entropy AI Insights Panel */}
                      {activeSubmission.verdict !== Verdicts.PENDING && (
                        <div
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderLeft: '2px solid var(--brand-neutral-200)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.75rem',
                            marginTop: '0.75rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '0.5rem',
                            }}
                          >
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                              }}
                            >
                              <EntropyAiIcon size={13} style={{ color: 'var(--text-muted)' }} />
                              <span>Entropy AI</span>
                            </div>
                          </div>

                          {/* AC: Classification or CTA to Classify */}
                          {activeSubmission.verdict === Verdicts.ACCEPTED && (
                            <div>
                              {activeSubmission.classification ? (
                                <div
                                  style={{
                                    background: '#000000',
                                    border: '1px solid rgba(5, 223, 114, 0.25)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.65rem 0.75rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--verdict-ac)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                      <EntropyAiIcon size={13} /> Approach Classification
                                    </span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                      <EntropyAiIcon size={10} /> ENTROPY AI
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                    <strong>Pattern:</strong> {activeSubmission.classification.approach}
                                  </div>
                                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                    <span><strong>Time:</strong> {activeSubmission.classification.timeComplexity}</span>
                                    <span><strong>Space:</strong> {activeSubmission.classification.spaceComplexity}</span>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                    Solution accepted. Classify your algorithmic pattern and computational complexity.
                                  </p>
                                  <button
                                    id="btn-classify-approach-mobile"
                                    onClick={() => handleClassifyApproach(activeSubmission.submissionId)}
                                    disabled={isClassifying}
                                    className="btn btn-sm"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      padding: '0.3rem 0.65rem',
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      background: 'rgba(56, 189, 248, 0.12)',
                                      color: 'var(--accent-cyan)',
                                      border: '1px solid rgba(56, 189, 248, 0.35)',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: isClassifying ? 'not-allowed' : 'pointer',
                                    }}
                                  >
                                    {isClassifying ? (
                                      <>
                                        <Loader2 size={12} className="animate-spin" />
                                        <span>Analyzing Approach...</span>
                                      </>
                                    ) : (
                                      <>
                                        <EntropyAiIcon size={12} />
                                        <span>Classify Approach & Complexity</span>
                                      </>
                                    )}
                                  </button>
                                  {classifyError && (
                                    <div
                                      style={{
                                        marginTop: '0.4rem',
                                        padding: '0.35rem 0.6rem',
                                        fontSize: '0.72rem',
                                        color: 'var(--verdict-wa)',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.25)',
                                        borderRadius: 'var(--radius-sm)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                      }}
                                    >
                                      <AlertCircle size={12} />
                                      <span>{classifyError}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Non-AC: Socratic Debug Copilot */}
                          {activeSubmission.verdict !== Verdicts.ACCEPTED && (
                            <div>
                              {!hintState.hint && !hintState.loading && (
                                <button
                                  id="btn-request-ai-hint-mobile"
                                  onClick={() => handleRequestHint(activeSubmission.submissionId)}
                                  className="btn btn-outline"
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.45rem',
                                    padding: '0.45rem 0.75rem',
                                    borderColor: 'rgba(234, 179, 8, 0.4)',
                                    background: 'rgba(234, 179, 8, 0.06)',
                                    color: '#eab308',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Lightbulb size={14} />
                                  <span>Get Socratic Debug Hint</span>
                                </button>
                              )}

                              {hintState.loading && (
                                <div
                                  style={{
                                    padding: '0.6rem 0.75rem',
                                    background: 'rgba(234, 179, 8, 0.05)',
                                    border: '1px solid rgba(234, 179, 8, 0.2)',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    color: '#eab308',
                                    fontSize: '0.78rem',
                                  }}
                                >
                                  <Loader2 size={14} className="animate-spin" />
                                  <span>Consulting Socratic Tutor...</span>
                                </div>
                              )}

                              {hintState.error && (
                                <div
                                  style={{
                                    padding: '0.4rem 0.6rem',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--verdict-wa)',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                  }}
                                >
                                  <AlertCircle size={13} />
                                  <span>{hintState.error}</span>
                                </div>
                              )}

                              {hintState.hint && (
                                <div
                                  style={{
                                    padding: '0.75rem',
                                    background: '#080808',
                                    border: '1px solid rgba(234, 179, 8, 0.25)',
                                    borderRadius: 'var(--radius-sm)',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginBottom: '0.35rem',
                                      paddingBottom: '0.3rem',
                                      borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#eab308', fontWeight: 600, fontSize: '0.78rem' }}>
                                        <Lightbulb size={14} />
                                        <span>Socratic Debug Hint</span>
                                      </div>
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                        <EntropyAiIcon size={10} /> ENTROPY AI
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                      {hintState.remainingDaily !== undefined && (
                                        <span>{hintState.remainingDaily} left</span>
                                      )}
                                      {hintState.provider && hintState.provider !== 'none' && (
                                        <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '0.05rem 0.3rem', fontSize: '0.62rem' }}>
                                          {hintState.provider}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '0.78rem', lineHeight: 1.55, color: 'var(--text-primary)' }}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {hintState.hint}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : sampleResults.length > 0 ? (
                    /* Sample Run Results Diff */
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {sampleResults.map((sr, idx) => (
                          <button
                            key={sr.caseIndex}
                            onClick={() => setActiveCaseIndex(idx)}
                            className={`case-pill-btn ${activeCaseIndex === idx ? 'active' : ''} ${sr.passed ? 'passed' : 'failed'}`}
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                          >
                            <span>Case {sr.caseIndex}</span>
                            {sr.passed ? (
                              <Check size={11} style={{ color: 'var(--verdict-ac)' }} />
                            ) : (
                              <XCircle size={11} style={{ color: 'var(--verdict-wa)' }} />
                            )}
                          </button>
                        ))}
                      </div>

                      {currentResultCase && (
                        <div style={{ padding: '0.75rem', background: '#080808', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              Case {currentResultCase.caseIndex} Result
                            </span>
                            <span
                              className={`badge ${currentResultCase.passed ? 'badge-easy' : 'badge-hard'}`}
                              style={{ padding: '0.1rem 0.35rem', fontSize: '0.62rem' }}
                            >
                              {currentResultCase.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Input:</div>
                          <pre
                            style={{
                              fontSize: '0.72rem',
                              background: '#000000',
                              border: '1px solid var(--border-subtle)',
                              padding: '0.35rem 0.5rem',
                              borderRadius: 'var(--radius-xs)',
                              color: 'var(--text-primary)',
                              fontFamily: 'var(--font-mono)',
                              marginBottom: '0.4rem',
                              maxHeight: '75px',
                              overflowX: 'auto',
                              overflowY: 'auto',
                            }}
                          >
                            {currentResultCase.input}
                          </pre>

                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Your Output:</div>
                          <pre
                            style={{
                              fontSize: '0.72rem',
                              background: '#000000',
                              border: '1px solid var(--border-subtle)',
                              padding: '0.35rem 0.5rem',
                              borderRadius: 'var(--radius-xs)',
                              color: currentResultCase.passed ? 'var(--verdict-ac)' : 'var(--verdict-wa)',
                              fontFamily: 'var(--font-mono)',
                              marginBottom: '0.4rem',
                              maxHeight: '75px',
                              overflowX: 'auto',
                              overflowY: 'auto',
                            }}
                          >
                            {currentResultCase.actualOutput || '<empty>'}
                          </pre>

                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Expected Output:</div>
                          <pre
                            style={{
                              fontSize: '0.72rem',
                              background: '#000000',
                              border: '1px solid var(--border-subtle)',
                              padding: '0.35rem 0.5rem',
                              borderRadius: 'var(--radius-xs)',
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)',
                              maxHeight: '75px',
                              overflowX: 'auto',
                              overflowY: 'auto',
                            }}
                          >
                            {currentResultCase.expectedOutput}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', padding: '1.5rem 0' }}>
                      Click <strong>"Run Samples"</strong> to test code, or <strong>"Submit Solution"</strong> for full evaluation.
                    </div>
                  )}
                </div>
              ) : (
                /* Sub-Tab 3: Compiler Diagnostics */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--verdict-wa)', fontWeight: 600, fontSize: '0.78rem', marginBottom: '0.4rem' }}>
                    <AlertTriangle size={14} />
                    <span>Compiler Diagnostics / Error</span>
                  </div>
                  <pre
                    style={{
                      background: '#050505',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#fda4af',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      maxHeight: '160px',
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
          </div>
        )}
      </div>

      {/* ── Mobile Persistent Floating Bottom Action Dock ── */}
      <div className="mobile-action-dock">
        <StatefulButton
          id="mobile-run-samples-btn"
          onClick={onMobileRun}
          disabled={submitting || sampleRunning || isCodeEmpty}
          state={runButtonState}
          loadingText="Running..."
          successText="Tested"
          errorText="Failed"
          icon={<Play size={12} />}
          aria-label="Run sample test cases"
          className="btn btn-secondary"
          style={{ flex: 1, padding: '0.45rem 0.5rem', fontSize: '0.8rem' }}
        >
          Run Samples
        </StatefulButton>

        <StatefulButton
          id="mobile-submit-solution-btn"
          onClick={onMobileSubmit}
          disabled={submitting || isCodeEmpty}
          state={submitButtonState}
          loadingText="Evaluating..."
          successText="Accepted"
          errorText={activeSubmission?.verdict || 'Failed'}
          icon={<Send size={12} />}
          aria-label="Submit solution for evaluation"
          className="btn btn-primary"
          style={{ flex: 1.25, padding: '0.45rem 0.5rem', fontSize: '0.8rem' }}
        >
          Submit Solution
        </StatefulButton>
      </div>
    </div>
  );
};
