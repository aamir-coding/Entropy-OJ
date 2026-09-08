import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Group, Panel, Separator, useDefaultLayout, usePanelRef } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import { katexSanitizeSchema } from '../utils/sanitizeSchema';
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
import { StatefulButton, ButtonState } from '../components/motion/button/stateful';
import { Tabs } from '../components/motion/tabs';
import { Tooltip } from '../components/motion/tooltip';
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

import { ErrorBoundary } from '../components/ErrorBoundary';
import { defineEntropyTheme } from '../styles/monacoTheme';

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

const getDraftStorageKey = (problemCode: string, lang: string) => `entropy_draft_${problemCode}_${lang}`;

const getSavedDraft = (problemCode: string, lang: SupportedLanguage): string | null => {
  return safeStorage.getItem(getDraftStorageKey(problemCode, lang));
};

const saveDraft = (problemCode: string, lang: SupportedLanguage, code: string): void => {
  safeStorage.setItem(getDraftStorageKey(problemCode, lang), code);
};

export const ProblemDetailPage: React.FC = () => {
  const { code: problemCodeParam } = useParams<{ code: string }>();
  const { user, openAuthModal, notifyStatsUpdated } = useAuth();

  // Layout persistence with react-resizable-panels (Issue M-2: Safe Storage Adapter)
  const horizontalLayout = useDefaultLayout({
    id: 'anti-oj-workspace-layout-h-v3',
    storage: safeStorage,
  });

  const verticalLayout = useDefaultLayout({
    id: 'anti-oj-workspace-layout-v-v3',
    storage: safeStorage,
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

  // Blind Mode State (persisted via localStorage, initialized from 'entropy_blind_mode')
  const [blindMode] = useState<boolean>(() => safeStorage.getItem('entropy_blind_mode') === 'true');
  const [revealedTags, setRevealedTags] = useState<Set<string>>(new Set());

  // Reset revealed tag hints when navigating between problems
  useEffect(() => {
    setRevealedTags(new Set());
  }, [problemCodeParam]);

  // Editor State (persisted per problem and per language in safeStorage - Issue M-2)
  const [language, setLanguage] = useState<SupportedLanguage>(SupportedLanguages.CPP);
  const [editorCode, setEditorCode] = useState<string>(() => {
    if (problemCodeParam) {
      const saved = getSavedDraft(problemCodeParam, SupportedLanguages.CPP);
      if (saved !== null) return saved;
    }
    return LANGUAGE_CONFIGS.cpp.starterCode;
  });
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>(() => {
    const initialStarter = (problemCodeParam && getSavedDraft(problemCodeParam, SupportedLanguages.CPP)) || LANGUAGE_CONFIGS.cpp.starterCode;
    return {
      [SupportedLanguages.CPP]: initialStarter,
    };
  });
  const [fontSize, setFontSize] = useState<number>(14);

  // Responsive mobile workspace layout (<768px vertical split)
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Console / Testcase Navigation State
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [consoleTab, setConsoleTab] = useState<'testcases' | 'results' | 'compiler'>('testcases');
  const [resultView, setResultView] = useState<'submission' | 'sample'>('sample');
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [sampleRunning, setSampleRunning] = useState(false);
  const [sampleRunError, setSampleRunError] = useState<string | null>(null);
  const [runButtonState, setRunButtonState] = useState<ButtonState>('idle');
  const [submitButtonState, setSubmitButtonState] = useState<ButtonState>('idle');

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

  // Approach & Complexity Classification on-demand
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState<string | null>(null);

  const handleClassifyApproach = async (submissionId: string) => {
    try {
      setIsClassifying(true);
      setClassifyError(null);
      const res = await api.post('/ai/classify', { submissionId });
      if (res.data.success && isMountedRef.current) {
        const classification = res.data.data;
        setActiveSubmission((prev) => (prev ? { ...prev, classification } : prev));
      } else if (isMountedRef.current) {
        setClassifyError(res.data.error || 'Failed to classify approach.');
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setClassifyError(err.response?.data?.error || err.message || 'Classification failed. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsClassifying(false);
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

  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const loadPastSubmissionsRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const [activePollingId, setActivePollingId] = useState<string | null>(null);
  const pollingAbortControllerRef = useRef<AbortController | null>(null);
  const sampleAbortControllerRef = useRef<AbortController | null>(null);
  const activeProblemCodeRef = useRef<string | undefined>(problemCodeParam);

  // Keep activeProblemCodeRef continuously aligned
  useEffect(() => {
    activeProblemCodeRef.current = problemCodeParam;
  }, [problemCodeParam]);

  // Track component mount status and clean up all active timers & network requests (Issue L-2, Critical 1)
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (pollingAbortControllerRef.current) {
        pollingAbortControllerRef.current.abort();
        pollingAbortControllerRef.current = null;
      }
      if (sampleAbortControllerRef.current) {
        sampleAbortControllerRef.current.abort();
        sampleAbortControllerRef.current = null;
      }
    };
  }, []);

  // Debounced auto-save active code draft to localStorage (Issue M-2)
  useEffect(() => {
    if (!problemCodeParam) return;
    const timer = setTimeout(() => {
      saveDraft(problemCodeParam, language, editorCode);
    }, 400);

    return () => clearTimeout(timer);
  }, [editorCode, problemCodeParam, language]);

  // Synchronize and reset workspace when navigating between problems (Critical 1, Medium 2)
  useEffect(() => {
    if (pollingAbortControllerRef.current) {
      pollingAbortControllerRef.current.abort();
      pollingAbortControllerRef.current = null;
    }
    if (sampleAbortControllerRef.current) {
      sampleAbortControllerRef.current.abort();
      sampleAbortControllerRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    setActivePollingId(null);
    setActiveSubmission(null);
    setSampleResults([]);
    setSampleRunError(null);
    setSubmissionTimeoutMsg(null);
    setSubmitting(false);
    setSampleRunning(false);
    setActiveCaseIndex(0);
    setConsoleTab('testcases');
    setResultView('sample');
    setHintState({ loading: false, hint: null, error: null });

    // Restore saved draft or fallback to starter code for the active language
    const saved = problemCodeParam ? getSavedDraft(problemCodeParam, language) : null;
    const initialCode = saved !== null ? saved : (LANGUAGE_CONFIGS[language]?.starterCode || LANGUAGE_CONFIGS.cpp.starterCode);
    setEditorCode(initialCode);
    setCodeDrafts({ [language]: initialCode });
  }, [problemCodeParam]);

  // Update dynamic page title
  useEffect(() => {
    if (problem) {
      document.title = `${problem.name} | Entropy`;
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

  loadPastSubmissionsRef.current = loadPastSubmissions;

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

  // Handle language switch (Issue M-2: Save active draft and restore target draft)
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setCodeDrafts((prev) => ({
      ...prev,
      [language]: editorCode,
    }));
    if (problemCodeParam) {
      saveDraft(problemCodeParam, language, editorCode);
    }
    setLanguage(newLang);
    const existingDraft = codeDrafts[newLang];
    const savedStorageDraft = problemCodeParam ? getSavedDraft(problemCodeParam, newLang) : null;
    const starter = LANGUAGE_CONFIGS[newLang]?.starterCode || '';
    setEditorCode(existingDraft !== undefined ? existingDraft : (savedStorageDraft !== null ? savedStorageDraft : starter));
  };

  // Reset code (Preserves reset in active draft and safeStorage)
  const handleResetCode = () => {
    const starter = LANGUAGE_CONFIGS[language].starterCode;
    setEditorCode(starter);
    setCodeDrafts((prev) => ({
      ...prev,
      [language]: starter,
    }));
    if (problemCodeParam) {
      saveDraft(problemCodeParam, language, starter);
    }
    setShowResetConfirm(false);
  };

  // Copy sample case input (Issue L-2: tracked in copyTimeoutRef)
  const handleCopyInput = async (input: string, idx: number) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(input);
        setCopiedInputIdx(idx);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) setCopiedInputIdx(null);
        }, 2000);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  // Real "Run Samples" using live backend evaluation (Issue C-2: Explicit view state & activeSubmission reset)
  const handleRunSampleCases = async () => {
    if (!problem) return;
    if (sampleAbortControllerRef.current) {
      sampleAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    sampleAbortControllerRef.current = controller;
    const targetProblemCode = problemCodeParam;

    setResultView('sample');
    setActiveSubmission(null);
    setSampleRunning(true);
    setRunButtonState('loading');
    setSampleRunError(null);
    handleOpenConsoleTab('results');

    try {
      const res = await api.post(
        '/submissions/run',
        {
          problemId: problem._id,
          language,
          code: editorCode,
        },
        { signal: controller.signal }
      );

      if (res.data.success && isMountedRef.current && activeProblemCodeRef.current === targetProblemCode) {
        const runResponse: ISampleRunResponse = res.data.data;
        setSampleResults(runResponse.sampleResults);
        setActiveCaseIndex(0);
        setRunButtonState(runResponse.verdict === Verdicts.ACCEPTED ? 'success' : 'error');
        setTimeout(() => {
          if (isMountedRef.current) setRunButtonState('idle');
        }, 2500);

        if (runResponse.verdict === Verdicts.COMPILATION_ERROR) {
          setConsoleTab('compiler');
        }
      }
    } catch (err: any) {
      if (controller.signal.aborted || err?.name === 'CanceledError' || err?.name === 'AbortError' || activeProblemCodeRef.current !== targetProblemCode) return;
      console.error('Sample run failed:', err);
      if (isMountedRef.current && activeProblemCodeRef.current === targetProblemCode) {
        setSampleRunError(err.message || 'Sample test run failed.');
        setRunButtonState('error');
        setTimeout(() => {
          if (isMountedRef.current) setRunButtonState('idle');
        }, 2500);
      }
    } finally {
      if (isMountedRef.current && activeProblemCodeRef.current === targetProblemCode && !controller.signal.aborted) {
        setSampleRunning(false);
      }
    }
  };

  // Poll submission status until resolved (Critical 1: In-flight cancellation & problem matching)
  const startPollingSubmission = (submissionId: string) => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    if (pollingAbortControllerRef.current) {
      pollingAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    pollingAbortControllerRef.current = controller;
    const targetProblemCode = problemCodeParam;

    setActivePollingId(submissionId);

    let attempts = 0;
    let postAcAttempts = 0;
    let consecutiveErrors = 0;
    const maxAttempts = 50; // Chained polling up to ~90-120 seconds with backoff
    const maxPostAcAttempts = 6; // Poll up to 6 cycles for async AI classification on Accepted
    const maxConsecutiveErrors = 4; // Allow up to 4 consecutive transient errors
    let historyLoaded = false;
    setSubmissionTimeoutMsg(null);

    const scheduleNext = (delayMs: number, pollFn: () => void) => {
      if (!isMountedRef.current || controller.signal.aborted || activeProblemCodeRef.current !== targetProblemCode) return;
      pollTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current || controller.signal.aborted || activeProblemCodeRef.current !== targetProblemCode) return;
        pollFn();
      }, delayMs);
    };

    const pollClassification = () => {
      if (!isMountedRef.current || controller.signal.aborted || activeProblemCodeRef.current !== targetProblemCode) return;
      postAcAttempts++;
      api
        .get(`/submissions/${submissionId}`, { signal: controller.signal })
        .then((res) => {
          if (!isMountedRef.current || controller.signal.aborted || activeProblemCodeRef.current !== targetProblemCode) return;
          if (res.data?.success && res.data?.data) {
            const updated: ISubmissionResponse = res.data.data;
            setActiveSubmission(updated);
            if (updated.classification || postAcAttempts >= maxPostAcAttempts) {
              return;
            }
          }
          if (postAcAttempts < maxPostAcAttempts && !controller.signal.aborted && activeProblemCodeRef.current === targetProblemCode) {
            scheduleNext(1500, pollClassification);
          }
        })
        .catch((err) => {
          if (controller.signal.aborted || err?.name === 'CanceledError' || err?.name === 'AbortError' || activeProblemCodeRef.current !== targetProblemCode) return;
          console.warn('[Polling AI Classification] Transient error:', err);
        });
    };

    const pollTick = async () => {
      if (!isMountedRef.current || controller.signal.aborted || activeProblemCodeRef.current !== targetProblemCode) return;
      attempts++;

      try {
        const res = await api.get(`/submissions/${submissionId}`, { signal: controller.signal });
        if (!isMountedRef.current || controller.signal.aborted || activeProblemCodeRef.current !== targetProblemCode) return;

        if (res.data?.success && res.data?.data) {
          consecutiveErrors = 0;
          const updated: ISubmissionResponse = res.data.data;
          setActiveSubmission(updated);

          if (updated.verdict !== Verdicts.PENDING) {
            setSubmitting(false);
            setSubmitButtonState(updated.verdict === Verdicts.ACCEPTED ? 'success' : 'error');
            setTimeout(() => {
              if (isMountedRef.current) setSubmitButtonState('idle');
            }, 3000);

            if (updated.verdict === Verdicts.ACCEPTED) {
              notifyStatsUpdated();
              if (!updated.classification) {
                scheduleNext(1500, pollClassification);
              }
            }

            if (!historyLoaded) {
              historyLoaded = true;
              if (updated.verdict === Verdicts.COMPILATION_ERROR) {
                setConsoleTab('compiler');
              }
              loadPastSubmissionsRef.current();
            }
            return;
          } else if (attempts >= maxAttempts) {
            setSubmitting(false);
            setSubmissionTimeoutMsg('Evaluation is taking longer than expected. You can check status again or check your submission history.');
            return;
          }
        }
      } catch (err: any) {
        if (controller.signal.aborted || err?.name === 'CanceledError' || err?.name === 'AbortError' || activeProblemCodeRef.current !== targetProblemCode) return;
        consecutiveErrors++;
        console.warn(`[Polling] Transient network error (${consecutiveErrors}/${maxConsecutiveErrors}):`, err);
        if (consecutiveErrors >= maxConsecutiveErrors) {
          if (isMountedRef.current && !controller.signal.aborted && activeProblemCodeRef.current === targetProblemCode) {
            setSubmitting(false);
            setSubmissionTimeoutMsg('Network connection lost during evaluation. Click "Check Status" or verify in your submission history.');
          }
          return;
        }
      }

      if (!controller.signal.aborted && activeProblemCodeRef.current === targetProblemCode) {
        const delay = Math.min(1000 + attempts * 50, 2500);
        scheduleNext(delay, pollTick);
      }
    };

    scheduleNext(1000, pollTick);
  };

  const handleManualCheckStatus = () => {
    if (!activePollingId) return;
    setSubmitting(true);
    setSubmissionTimeoutMsg(null);
    startPollingSubmission(activePollingId);
  };

  // Submit code for full evaluation
  const handleSubmitCode = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!problem) return;

    try {
      setResultView('submission');
      setSampleResults([]);
      setSubmitting(true);
      setSubmitButtonState('loading');
      handleOpenConsoleTab('results');
      setActiveSubmission(null);
      setSubmissionTimeoutMsg(null);
      setHintState({ loading: false, hint: null, error: null });
      setIsClassifying(false);
      setClassifyError(null);

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
        setSubmitButtonState('error');
        setTimeout(() => {
          if (isMountedRef.current) setSubmitButtonState('idle');
        }, 2500);
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
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <Tooltip content="Back to Problems" side="bottom">
            <Link
              to="/problems"
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.55rem', borderRadius: 'var(--radius-xs)' }}
              aria-label="Back to problem catalog"
            >
              <ArrowLeft size={16} />
            </Link>
          </Tooltip>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 style={{ fontSize: '1.0625rem', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              {problem.name}
            </h1>
            <span className={`badge ${diffClass}`}>{problem.difficulty}</span>
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                padding: '0.1rem 0.4rem',
                background: 'var(--brand-neutral-600)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              #{problem.problemCode}
            </span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <StatefulButton
            id="run-sample-cases-btn"
            onClick={handleRunSampleCases}
            disabled={submitting || sampleRunning}
            state={runButtonState}
            loadingText="Running..."
            successText="Tested"
            errorText="Failed"
            icon={<Play size={13} />}
            aria-label="Run sample test cases"
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.875rem', fontSize: '0.8125rem' }}
          >
            Run Samples
          </StatefulButton>

          <StatefulButton
            id="submit-solution-btn"
            onClick={handleSubmitCode}
            disabled={submitting}
            state={submitButtonState}
            loadingText="Evaluating..."
            successText="Accepted"
            errorText={activeSubmission?.verdict || 'Failed'}
            icon={<Send size={13} />}
            aria-label="Submit solution for evaluation"
            className="btn btn-primary"
            style={{ padding: '0.35rem 1.125rem', fontSize: '0.8125rem' }}
          >
            Submit Solution
          </StatefulButton>
        </div>
      </div>

      {/* Main Viewport Workspace Split (Left: Problem Statement, Right: Monaco Editor + Bottom Console) */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex' }}>
        <Group orientation={isMobile ? 'vertical' : 'horizontal'} {...(isMobile ? verticalLayout : horizontalLayout)} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          {/* LEFT PANEL: Problem Description & Submissions Tabs (Scrolls independently) */}
          <Panel id="problem-left-panel" defaultSize="45%" minSize="25%" maxSize="75%">
            <div
              style={{
                height: '100%',
                background: 'var(--bg-primary)',
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
                  padding: '0.25rem 1rem',
                  background: '#050505',
                  borderBottom: '1px solid var(--border-subtle)',
                  flexShrink: 0,
                }}
              >
                <Tabs
                  tabs={[
                    { id: 'statement', label: 'Description', icon: <FileText size={14} /> },
                    {
                      id: 'submissions',
                      label: 'Submissions',
                      icon: <History size={14} />,
                      badge: pastSubmissions.length > 0 ? (
                        <span
                          style={{
                            background: 'var(--brand-neutral-600)',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--text-secondary)',
                            borderRadius: 'var(--radius-xs)',
                            padding: '0.1rem 0.4rem',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                          }}
                        >
                          {pastSubmissions.length}
                        </span>
                      ) : null,
                    },
                  ]}
                  activeId={leftTab}
                  onChange={(id) => setLeftTab(id as 'statement' | 'submissions')}
                  layoutId="problem-left-tabs-indicator"
                  variant="underline"
                  size="sm"
                />
              </div>

              {/* Left Pane Content (Independently scrollable) */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {leftTab === 'statement' ? (
                  <div>
                    {/* Meta info chips */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      <Tooltip content="Maximum CPU execution time allowed per testcase" side="top">
                        <span className="badge badge-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'default' }}>
                          <Clock size={12} /> Time Limit: {problem.timeLimitMs}ms
                        </span>
                      </Tooltip>
                      <Tooltip content="Maximum RAM memory allocation inside Docker sandbox" side="top">
                        <span className="badge badge-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'default' }}>
                          <HardDrive size={12} /> Memory Limit: {Math.round(problem.memoryLimitKb / 1024)}MB
                        </span>
                      </Tooltip>
                      {/* Problem Tags - Click individual tags to blur/unblur as hints */}
                      {problem.tags && problem.tags.length > 0 && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {problem.tags.map((tag) => {
                            const isBlurred = blindMode && !revealedTags.has(tag);
                            return (
                              <Tooltip
                                key={tag}
                                content={
                                  blindMode
                                    ? isBlurred
                                      ? 'Click to reveal this tag hint'
                                      : 'Click to blur this tag'
                                    : `Topic tag: ${tag}`
                                }
                                side="top"
                              >
                                <span
                                  id={`problem-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                                  onClick={() => {
                                    if (blindMode) {
                                      setRevealedTags((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(tag)) {
                                          next.delete(tag);
                                        } else {
                                          next.add(tag);
                                        }
                                        return next;
                                      });
                                    }
                                  }}
                                  className="badge badge-tag"
                                  style={{
                                    cursor: blindMode ? 'pointer' : 'default',
                                    filter: isBlurred ? 'blur(4.5px)' : 'none',
                                    userSelect: isBlurred ? 'none' : 'auto',
                                    transition: 'filter 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color var(--transition-fast), border-color var(--transition-fast)',
                                    willChange: 'filter',
                                  }}
                                >
                                  {tag}
                                </span>
                              </Tooltip>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Problem Statement Content rendered via ReactMarkdown, KaTeX & rehype-sanitize (Issue M-1, High 6) */}
                    <div className="markdown-statement">
                      <ErrorBoundary fallback={<div style={{ padding: '1rem', color: 'var(--verdict-wa)' }}>Failed to render problem math/markdown format.</div>}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex, [rehypeSanitize, katexSanitizeSchema]]}
                        >
                          {problem.statement}
                        </ReactMarkdown>
                      </ErrorBoundary>
                    </div>

                    {/* Formatted Problem Examples Section */}
                    {problem.sampleCases && problem.sampleCases.length > 0 && (
                      <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                          <FileCode size={15} style={{ color: 'var(--text-secondary)' }} />
                          <span>Examples</span>
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                          {problem.sampleCases.map((sc, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: '#080808',
                                border: '1px solid var(--border-medium)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.875rem 1rem',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
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

                              <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem', letterSpacing: '0.01em' }}>
                                Input:
                              </div>
                              <pre
                                style={{
                                  background: '#000000',
                                  border: '1px solid var(--border-subtle)',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: 'var(--radius-xs)',
                                  fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--text-primary)',
                                  marginBottom: '0.625rem',
                                  overflowX: 'auto',
                                }}
                              >
                                {sc.input}
                              </pre>

                              <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem', letterSpacing: '0.01em' }}>
                                Output:
                              </div>
                              <pre
                                style={{
                                  background: '#000000',
                                  border: '1px solid var(--border-subtle)',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: 'var(--radius-xs)',
                                  fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--brand-white)',
                                  marginBottom: sc.explanation ? '0.625rem' : '0',
                                  overflowX: 'auto',
                                }}
                              >
                                {sc.output}
                              </pre>

                              {sc.explanation && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#0c0c0c', border: '1px solid var(--border-medium)', borderLeft: '2px solid var(--border-hover)', padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-xs)' }}>
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
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000000', overflow: 'hidden' }}>
                  {/* Editor Header Toolbar */}
                  <div
                    style={{
                      padding: '0.4rem 1rem',
                      background: '#050505',
                      borderBottom: '1px solid var(--border-subtle)',
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
                          background: '#0a0a0a',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '0.3rem 0.75rem',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
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
                          background: '#0a0a0a',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
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

                    {/* Keyboard accessibility hint (Issue L-3) */}
                    <Tooltip content="Toggle Tab key trapping inside editor" shortcut="Ctrl+M" side="top">
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          marginLeft: 'auto',
                          marginRight: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          cursor: 'default',
                        }}
                      >
                        Tab Trap: <kbd style={{ background: '#111111', padding: '1px 5px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>Ctrl+M</kbd>
                      </span>
                    </Tooltip>

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
                      <Tooltip content="Reset code template to starter boilerplate" side="top">
                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderColor: 'transparent' }}
                        >
                          <RotateCcw size={13} />
                          <span>Reset</span>
                        </button>
                      </Tooltip>
                    )}
                  </div>

                  {/* Monaco Editor Instance with Localized ErrorBoundary (Issue M-1) */}
                  <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', background: '#000000' }}>
                    <ErrorBoundary
                      fallback={
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--verdict-wa)' }}>
                          Failed to load Monaco Editor runtime. Please reload the page.
                        </div>
                      }
                    >
                      <Editor
                        height="100%"
                        language={LANGUAGE_CONFIGS[language].monacoLanguage}
                        theme="entropy-dark"
                        beforeMount={defineEntropyTheme}
                        value={editorCode}
                        onChange={(value) => setEditorCode(value || '')}
                        options={{
                          minimap: { enabled: false },
                          fontSize,
                          fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
                          fontLigatures: true,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          tabSize: 4,
                          padding: { top: 12, bottom: 12 },
                        }}
                      />
                    </ErrorBoundary>
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
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000000', overflow: 'hidden' }}>
                  {/* Console Header Docked Bar (Always 38px high and pinned) */}
                  <div
                    style={{
                      height: '38px',
                      minHeight: '38px',
                      maxHeight: '38px',
                      background: '#050505',
                      borderBottom: isConsoleCollapsed ? 'none' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 0.875rem',
                      flexShrink: 0,
                      userSelect: 'none',
                    }}
                  >
                    {/* Console Tabs */}
                    <Tabs
                      tabs={[
                        { id: 'testcases', label: 'Sample Cases', icon: <FileCode size={13} /> },
                        { id: 'results', label: 'Verdict & Results', icon: <Terminal size={13} /> },
                        ...(activeSubmission?.compileOutput
                          ? [
                              {
                                id: 'compiler',
                                label: 'Compiler Log',
                                icon: <AlertTriangle size={13} />,
                                activeColor: 'var(--verdict-wa)',
                              },
                            ]
                          : []),
                      ]}
                      activeId={isConsoleCollapsed ? '' : consoleTab}
                      onChange={(id) => handleOpenConsoleTab(id as 'testcases' | 'results' | 'compiler')}
                      layoutId="problem-console-tabs-indicator"
                      variant="pill"
                      size="sm"
                    />

                    {/* Collapse / Expand Toggle */}
                    <Tooltip content={isConsoleCollapsed ? 'Expand Console' : 'Collapse Console'} side="top">
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
                    </Tooltip>
                  </div>

                  {/* Console Body Content (Visible only when expanded, clean vertical fit) */}
                  {!isConsoleCollapsed && (
                    <div style={{ flex: 1, minHeight: 0, padding: '0.75rem 1rem', overflowY: 'auto', background: '#000000' }}>
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
                            <div style={{ padding: '0.75rem 0.875rem', background: '#080808', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
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
                                  background: '#000000',
                                  border: '1px solid var(--border-subtle)',
                                  padding: '0.4rem 0.6rem',
                                  borderRadius: 'var(--radius-xs)',
                                  fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--text-primary)',
                                  marginBottom: '0.5rem',
                                  maxHeight: '90px',
                                  overflowX: 'auto',
                                  overflowY: 'auto',
                                  lineHeight: 1.45,
                                }}
                              >
                                {currentSampleCase.input}
                              </pre>

                              <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.25rem', letterSpacing: '0.01em' }}>
                                Expected Output:
                              </div>
                              <pre
                                style={{
                                  background: '#000000',
                                  border: '1px solid var(--border-subtle)',
                                  padding: '0.4rem 0.6rem',
                                  borderRadius: 'var(--radius-xs)',
                                  fontSize: '0.75rem',
                                  fontFamily: 'var(--font-mono)',
                                  color: 'var(--brand-white)',
                                  maxHeight: '90px',
                                  overflowX: 'auto',
                                  overflowY: 'auto',
                                  lineHeight: 1.45,
                                }}
                              >
                                {currentSampleCase.output}
                              </pre>

                              {currentSampleCase.explanation && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#0c0c0c', border: '1px solid var(--border-medium)', borderLeft: '2px solid var(--border-hover)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-xs)' }}>
                                  <strong style={{ color: 'var(--text-primary)' }}>Note:</strong> {currentSampleCase.explanation}
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
                          ) : resultView === 'submission' && activeSubmission ? (
                            /* Full Submission Verdict View */
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                                  <VerdictBadge verdict={activeSubmission.verdict} />
                                  {activeSubmission.verdict === Verdicts.ACCEPTED && !activeSubmission.classification && (
                                    <Tooltip content="Analyze algorithmic approach & Big-O complexity via AI" side="top">
                                      <button
                                        id="btn-classify-approach"
                                        onClick={() => handleClassifyApproach(activeSubmission.submissionId)}
                                        disabled={isClassifying}
                                        className="btn btn-sm"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.35rem',
                                          padding: '0.2rem 0.65rem',
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          background: 'rgba(56, 189, 248, 0.12)',
                                          color: 'var(--accent-cyan)',
                                          border: '1px solid rgba(56, 189, 248, 0.35)',
                                          borderRadius: 'var(--radius-sm)',
                                          cursor: isClassifying ? 'not-allowed' : 'pointer',
                                          transition: 'all 0.15s ease',
                                        }}
                                      >
                                        {isClassifying ? (
                                          <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Analyzing Approach...</span>
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles size={13} />
                                            <span>Classify Approach & Complexity</span>
                                          </>
                                        )}
                                      </button>
                                    </Tooltip>
                                  )}
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

                              {classifyError && (
                                <div
                                  style={{
                                    marginBottom: '0.75rem',
                                    padding: '0.4rem 0.75rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--verdict-wa)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    borderRadius: 'var(--radius-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                  }}
                                >
                                  <AlertCircle size={13} />
                                  <span>{classifyError}</span>
                                </div>
                              )}

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
                                    justifyContent: 'space-between',
                                    gap: '0.5rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={15} />
                                    <span>{submissionTimeoutMsg}</span>
                                  </div>
                                  {activePollingId && (
                                    <button
                                      onClick={handleManualCheckStatus}
                                      className="btn btn-outline"
                                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', borderColor: '#fbbf24', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                      <RotateCcw size={12} /> Check Status
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Approach & Complexity Classification Badge (Post-AC) */}
                              {activeSubmission.verdict === Verdicts.ACCEPTED && activeSubmission.classification && (
                                <div
                                  style={{
                                    marginTop: '0.75rem',
                                    background: '#080808',
                                    border: '1px solid rgba(5, 223, 114, 0.25)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.75rem 1rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--verdict-ac)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                                      style={{
                                        marginTop: '0.5rem',
                                        padding: '0.875rem 1rem',
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
                                          marginBottom: '0.4rem',
                                          paddingBottom: '0.35rem',
                                          borderBottom: '1px solid rgba(234, 179, 8, 0.15)',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#eab308', fontWeight: 600, fontSize: '0.8125rem' }}>
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
                                                    borderRadius: 'var(--radius-xs)',
                                                    fontSize: '0.85em',
                                                    fontFamily: 'var(--font-mono)',
                                                    color: 'var(--text-primary)',
                                                  }}
                                                  {...props}
                                                />
                                              ) : (
                                                <pre style={{ background: '#000000', border: '1px solid var(--border-subtle)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-xs)', margin: '0.35rem 0', fontSize: '0.78rem' }}>
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
                                <div style={{ padding: '0.75rem 0.875rem', background: '#080808', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                      Case {currentResultCase.caseIndex} Result
                                    </span>
                                    <span
                                      className={`badge ${currentResultCase.passed ? 'badge-easy' : 'badge-hard'}`}
                                      style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}
                                    >
                                      {currentResultCase.passed ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>

                                  <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.15rem', letterSpacing: '0.01em' }}>
                                    Input:
                                  </div>
                                  <pre
                                    style={{
                                      fontSize: '0.75rem',
                                      background: '#000000',
                                      border: '1px solid var(--border-subtle)',
                                      padding: '0.35rem 0.55rem',
                                      borderRadius: 'var(--radius-xs)',
                                      color: 'var(--text-primary)',
                                      fontFamily: 'var(--font-mono)',
                                      marginBottom: '0.4rem',
                                      maxHeight: '80px',
                                      overflowX: 'auto',
                                      overflowY: 'auto',
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    {currentResultCase.input}
                                  </pre>

                                  <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.15rem', letterSpacing: '0.01em' }}>
                                    Your Output:
                                  </div>
                                  <pre
                                    style={{
                                      fontSize: '0.75rem',
                                      background: '#000000',
                                      border: '1px solid var(--border-subtle)',
                                      padding: '0.35rem 0.55rem',
                                      borderRadius: 'var(--radius-xs)',
                                      color: currentResultCase.passed ? 'var(--verdict-ac)' : 'var(--verdict-wa)',
                                      fontFamily: 'var(--font-mono)',
                                      marginBottom: '0.4rem',
                                      maxHeight: '80px',
                                      overflowX: 'auto',
                                      overflowY: 'auto',
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    {currentResultCase.actualOutput || '<empty>'}
                                  </pre>

                                  <div style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.15rem', letterSpacing: '0.01em' }}>
                                    Expected Output:
                                  </div>
                                  <pre
                                    style={{
                                      fontSize: '0.75rem',
                                      background: '#000000',
                                      border: '1px solid var(--border-subtle)',
                                      padding: '0.35rem 0.55rem',
                                      borderRadius: 'var(--radius-xs)',
                                      color: 'var(--text-muted)',
                                      fontFamily: 'var(--font-mono)',
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
                              background: '#050505',
                              padding: '0.625rem 0.875rem',
                              borderRadius: 'var(--radius-xs)',
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
