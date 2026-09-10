import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Timer,
  Check,
} from 'lucide-react';
import { Tooltip } from './motion/tooltip';
import { ProblemDifficulty } from '@anti-oj/shared';

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

const DIFFICULTY_DEFAULT_SECONDS: Record<string, number> = {
  Easy: 20 * 60, // 20m
  Medium: 35 * 60, // 35m
  Hard: 50 * 60, // 50m
};

const STEP_SECONDS = 5 * 60; // 5m
const MAX_TIMER_SECONDS = 3 * 60 * 60; // 3 hours (10,800s)

export interface ProblemTimerProps {
  difficulty?: ProblemDifficulty | string;
  problemCode?: string;
  userId?: string;
  isAccepted?: boolean;
  editorKeystrokeTrigger?: number;
  resetTrigger?: number;
  onReset?: () => void;
  onCompletedChange?: (completed: boolean) => void;
}

interface SavedTimerState {
  mode: 'countdown' | 'stopwatch';
  targetSeconds: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  isRunning: boolean;
  isOvertime: boolean;
  lastTimestamp: number;
  isHidden: boolean;
  isCompleted?: boolean;
  completedTimeFormatted?: string;
}

export const ProblemTimer: React.FC<ProblemTimerProps> = ({
  difficulty = 'Medium',
  problemCode,
  userId,
  isAccepted = false,
  editorKeystrokeTrigger = 0,
  resetTrigger = 0,
  onReset,
  onCompletedChange,
}) => {
  const defaultTarget = DIFFICULTY_DEFAULT_SECONDS[difficulty] || 35 * 60;

  const storageKey = problemCode ? `entropy_timer_${problemCode}` : null;

  // Initialize from safeStorage if available
  const [mode, setMode] = useState<'countdown' | 'stopwatch'>(() => {
    if (!storageKey) return 'countdown';
    const saved = safeStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedTimerState = JSON.parse(saved);
        return parsed.mode || 'countdown';
      } catch {}
    }
    return 'countdown';
  });

  const [targetSeconds, setTargetSeconds] = useState<number>(() => {
    if (!storageKey) return defaultTarget;
    const saved = safeStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedTimerState = JSON.parse(saved);
        if (typeof parsed.targetSeconds === 'number' && parsed.targetSeconds > 0) {
          return parsed.targetSeconds;
        }
      } catch {}
    }
    return defaultTarget;
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!storageKey) return defaultTarget;
    const saved = safeStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedTimerState = JSON.parse(saved);
        if (typeof parsed.remainingSeconds === 'number') {
          if (parsed.isRunning && parsed.lastTimestamp) {
            const elapsedSince = Math.floor((Date.now() - parsed.lastTimestamp) / 1000);
            return Math.max(-MAX_TIMER_SECONDS, parsed.remainingSeconds - elapsedSince);
          }
          return parsed.remainingSeconds;
        }
      } catch {}
    }
    return defaultTarget;
  });

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (!storageKey) return 0;
    const saved = safeStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedTimerState = JSON.parse(saved);
        if (typeof parsed.elapsedSeconds === 'number') {
          if (parsed.isRunning && parsed.lastTimestamp) {
            const elapsedSince = Math.floor((Date.now() - parsed.lastTimestamp) / 1000);
            return Math.min(MAX_TIMER_SECONDS, parsed.elapsedSeconds + elapsedSince);
          }
          return Math.min(MAX_TIMER_SECONDS, parsed.elapsedSeconds);
        }
      } catch {}
    }
    return 0;
  });

  const [isRunning, setIsRunning] = useState<boolean>(() => {
    if (!storageKey) return false;
    const saved = safeStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedTimerState = JSON.parse(saved);
        return Boolean(parsed.isRunning);
      } catch {}
    }
    return false;
  });

  const [isHidden, setIsHidden] = useState<boolean>(() => {
    if (!storageKey) return false;
    const saved = safeStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedTimerState = JSON.parse(saved);
        return Boolean(parsed.isHidden);
      } catch {}
    }
    return false;
  });

  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    if (!storageKey) return false;
    const saved = safeStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedTimerState = JSON.parse(saved);
        return Boolean(parsed.isCompleted);
      } catch {}
    }
    return false;
  });

  const [completedTimeFormatted, setCompletedTimeFormatted] = useState<string | null>(() => {
    if (!storageKey) return null;
    const saved = safeStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: SavedTimerState = JSON.parse(saved);
        return parsed.completedTimeFormatted || null;
      } catch {}
    }
    return null;
  });

  const [isPillHovered, setIsPillHovered] = useState<boolean>(false);

  // Notify parent of completion state changes
  useEffect(() => {
    onCompletedChange?.(isCompleted);
  }, [isCompleted, onCompletedChange]);

  // Sync with difficulty changes when no session is active or on problem switch
  const activeProblemRef = useRef<string | undefined>(problemCode);
  useEffect(() => {
    if (activeProblemRef.current !== problemCode) {
      activeProblemRef.current = problemCode;
      if (storageKey) {
        const saved = safeStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed: SavedTimerState = JSON.parse(saved);
            setMode(parsed.mode || 'countdown');
            setTargetSeconds(parsed.targetSeconds || defaultTarget);
            setRemainingSeconds(parsed.remainingSeconds ?? defaultTarget);
            setElapsedSeconds(parsed.elapsedSeconds ?? 0);
            setIsRunning(Boolean(parsed.isRunning));
            setIsHidden(Boolean(parsed.isHidden));
            setIsCompleted(Boolean(parsed.isCompleted));
            setCompletedTimeFormatted(parsed.completedTimeFormatted || null);
            return;
          } catch {}
        }
      }
      // Fresh problem initial state
      const initialTarget = DIFFICULTY_DEFAULT_SECONDS[difficulty] || 35 * 60;
      setTargetSeconds(initialTarget);
      setRemainingSeconds(initialTarget);
      setElapsedSeconds(0);
      setIsRunning(false);
      setIsCompleted(false);
      setCompletedTimeFormatted(null);
    }
  }, [problemCode, difficulty, defaultTarget, storageKey]);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (totalSec: number): string => {
    const absSec = Math.abs(totalSec);
    const hrs = Math.floor(absSec / 3600);
    const mins = Math.floor((absSec % 3600) / 60);
    const secs = absSec % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${hrs}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Check overtime state
  const isOvertime = mode === 'countdown' && remainingSeconds < 0;

  // Active interval loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= -MAX_TIMER_SECONDS) {
          setIsRunning(false);
          return -MAX_TIMER_SECONDS;
        }
        return prev - 1;
      });
      setElapsedSeconds((prev) => {
        if (prev >= MAX_TIMER_SECONDS) {
          setIsRunning(false);
          return MAX_TIMER_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Persistence to safeStorage
  useEffect(() => {
    if (!storageKey) return;
    const state: SavedTimerState = {
      mode,
      targetSeconds,
      remainingSeconds,
      elapsedSeconds,
      isRunning,
      isOvertime,
      lastTimestamp: Date.now(),
      isHidden,
      isCompleted,
      completedTimeFormatted: completedTimeFormatted || undefined,
    };
    safeStorage.setItem(storageKey, JSON.stringify(state));
  }, [
    storageKey,
    mode,
    targetSeconds,
    remainingSeconds,
    elapsedSeconds,
    isRunning,
    isOvertime,
    isHidden,
    isCompleted,
    completedTimeFormatted,
  ]);

  // Auto-stop on Accepted Verdict (rising edge: false -> true)
  const prevIsAcceptedRef = useRef<boolean>(isAccepted);
  useEffect(() => {
    if (isAccepted && !prevIsAcceptedRef.current && !isCompleted) {
      setIsRunning(false);
      setIsCompleted(true);
      const timeSpentSeconds =
        mode === 'countdown'
          ? Math.max(1, targetSeconds - remainingSeconds)
          : Math.max(1, elapsedSeconds);
      const formatted = formatTime(timeSpentSeconds);
      setCompletedTimeFormatted(formatted);
    }
    prevIsAcceptedRef.current = isAccepted;
  }, [isAccepted, isCompleted, mode, targetSeconds, remainingSeconds, elapsedSeconds]);

  // Auto-start on keystroke if user opted-in in preferences
  const prevKeystrokeRef = useRef<number>(editorKeystrokeTrigger);
  useEffect(() => {
    if (editorKeystrokeTrigger > 0 && editorKeystrokeTrigger !== prevKeystrokeRef.current) {
      prevKeystrokeRef.current = editorKeystrokeTrigger;
      const autostartKey = userId ? `entropy_timer_autostart_${userId}` : 'entropy_timer_autostart';
      const isAutoStartPrefEnabled = safeStorage.getItem(autostartKey) === 'true';
      if (isAutoStartPrefEnabled && !isRunning && !isCompleted) {
        setIsRunning(true);
      }
    }
  }, [editorKeystrokeTrigger, isRunning, isCompleted, userId]);

  // Button actions
  const handleTogglePlay = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(false);
    setCompletedTimeFormatted(null);
    setIsPillHovered(false);
    if (mode === 'countdown') {
      const freshTarget = DIFFICULTY_DEFAULT_SECONDS[difficulty] || 35 * 60;
      setTargetSeconds(freshTarget);
      setRemainingSeconds(freshTarget);
    } else {
      setElapsedSeconds(0);
    }
  }, [difficulty, mode]);

  // External reset trigger (e.g. from editor header reset code button)
  const prevResetTriggerRef = useRef<number>(resetTrigger);
  useEffect(() => {
    if (resetTrigger > 0 && resetTrigger !== prevResetTriggerRef.current) {
      prevResetTriggerRef.current = resetTrigger;
      handleReset();
    }
  }, [resetTrigger, handleReset]);

  const handleStepTime = useCallback(
    (delta: number) => {
      if (mode !== 'countdown' || isRunning) return;

      if (delta > 0) {
        // When stepping up from < 5m (e.g. 01:00), snap to 05:00 (300s) to keep clean 5-minute increments
        // Clamped to a maximum of 3 hours (MAX_TIMER_SECONDS = 10,800s)
        const calcNext = (prev: number) => {
          const next = prev < 300 ? 300 : prev % 300 !== 0 ? Math.ceil(prev / 300) * 300 : prev + delta;
          return Math.min(MAX_TIMER_SECONDS, next);
        };
        setTargetSeconds(calcNext);
        setRemainingSeconds(calcNext);
      } else {
        // When stepping down, clamp to minimum 1m (60s)
        setTargetSeconds((prev) => Math.max(60, prev + delta));
        setRemainingSeconds((prev) => Math.max(60, prev + delta));
      }
    },
    [mode, isRunning]
  );

  const handleToggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'countdown' ? 'stopwatch' : 'countdown';
      setIsRunning(false);
      setIsCompleted(false);
      if (next === 'countdown') {
        const freshTarget = DIFFICULTY_DEFAULT_SECONDS[difficulty] || 35 * 60;
        setTargetSeconds(freshTarget);
        setRemainingSeconds(freshTarget);
      } else {
        setElapsedSeconds(0);
      }
      return next;
    });
  }, [difficulty]);

  const handleToggleHide = useCallback(() => {
    setIsHidden((prev) => !prev);
  }, []);

  // Display value calculation
  const displayedTime =
    mode === 'countdown'
      ? isOvertime
        ? `+${formatTime(remainingSeconds)}`
        : formatTime(remainingSeconds)
      : formatTime(elapsedSeconds);

  // Styling based on urgency (countdown 00:00 & overtime is red; stopwatch 00:00 is white)
  const isCountdownZeroOrOvertime = mode === 'countdown' && remainingSeconds <= 0;
  const isUrgent = mode === 'countdown' && !isCountdownZeroOrOvertime && remainingSeconds <= 300 && remainingSeconds > 0;
  const isMinusDisabled = isRunning || (mode === 'countdown' && remainingSeconds <= 60);
  const isPlusDisabled = isRunning || (mode === 'countdown' && remainingSeconds >= MAX_TIMER_SECONDS);

  const timeColor = isCompleted
    ? 'var(--verdict-ac)'
    : isCountdownZeroOrOvertime
      ? 'var(--verdict-wa)'
      : isUrgent
        ? 'var(--verdict-tle)'
        : isRunning
          ? 'var(--text-primary)'
          : 'var(--text-secondary)';

  if (isCompleted) {
    const finalDisplayTime =
      completedTimeFormatted ||
      (mode === 'countdown'
        ? formatTime(Math.max(1, targetSeconds - remainingSeconds))
        : formatTime(Math.max(1, elapsedSeconds)));

    return (
      <motion.div
        key="timer-submitted-pill"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setIsPillHovered(true)}
        onMouseLeave={() => setIsPillHovered(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--verdict-ac-bg)',
          border: '1px solid var(--verdict-ac-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.2rem 0.65rem',
          gap: '0.35rem',
          userSelect: 'none',
          boxShadow: '0 0 12px rgba(5, 223, 114, 0.12)',
        }}
      >
        <Tooltip content={`Solved in ${finalDisplayTime}`} side="bottom">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 500, damping: 20 }}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <Check size={13} style={{ color: 'var(--verdict-ac)' }} strokeWidth={2.5} />
            </motion.span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--verdict-ac)',
                letterSpacing: '-0.02em',
              }}
            >
              {finalDisplayTime}
            </span>
          </div>
        </Tooltip>

        {/* Hover Restart Button to start fresh practice attempt */}
        <AnimatePresence>
          {isPillHovered && (
            <motion.div
              key="submitted-restart-btn"
              initial={{ opacity: 0, scale: 0.8, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto', marginLeft: '0.2rem' }}
              exit={{ opacity: 0, scale: 0.8, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              style={{ overflow: 'hidden', display: 'inline-flex', alignItems: 'center' }}
            >
              <Tooltip content="Practice again (Restart timer)" side="bottom">
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                    onReset?.();
                  }}
                  whileTap={{ scale: 0.85, rotate: -90 }}
                  aria-label="Restart timer"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--verdict-ac)',
                    cursor: 'pointer',
                    padding: '0.1rem',
                    width: '1.2rem',
                    height: '1.2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.8,
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                >
                  <RotateCcw size={12} />
                </motion.button>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.025)',
        border: `1px solid ${isCountdownZeroOrOvertime ? 'var(--verdict-wa-border)' : isUrgent ? 'var(--verdict-tle-border)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '0.15rem 0.35rem',
        gap: '0.2rem',
        userSelect: 'none',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
      }}
    >
      {/* Mode Switch Button */}
      <Tooltip content={mode === 'countdown' ? 'Stopwatch' : 'Countdown'} side="bottom">
        <motion.button
          type="button"
          onClick={handleToggleMode}
          whileTap={{ scale: 0.9 }}
          aria-label={mode === 'countdown' ? 'Switch to stopwatch' : 'Switch to countdown'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.2rem',
            width: '1.4rem',
            height: '1.4rem',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <Timer size={13} />
        </motion.button>
      </Tooltip>

      {/* Decrement Button (Countdown mode only) */}
      <AnimatePresence initial={false}>
        {mode === 'countdown' && (
          <motion.div
            key="btn-step-minus"
            initial={{ opacity: 0, scale: 0.8, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 'auto' }}
            exit={{ opacity: 0, scale: 0.8, width: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', display: 'inline-flex', flexShrink: 0 }}
          >
            <Tooltip content={isMinusDisabled ? undefined : "-5m"} disabled={isMinusDisabled} side="bottom">
              <motion.button
                type="button"
                disabled={isMinusDisabled}
                onClick={() => handleStepTime(-STEP_SECONDS)}
                whileTap={isMinusDisabled ? undefined : { scale: 0.88 }}
                aria-label="Subtract 5 minutes"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isMinusDisabled ? 'var(--text-faint)' : 'var(--text-muted)',
                  opacity: isMinusDisabled ? 0.3 : 1,
                  cursor: isMinusDisabled ? 'not-allowed' : 'pointer',
                  padding: '0.2rem',
                  width: '1.3rem',
                  height: '1.4rem',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-xs)',
                  transition: 'opacity 0.2s ease, color 0.2s ease',
                }}
              >
                <Minus size={12} />
              </motion.button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Display (Strict fixed width so numbers, signs, or hiding never shift layout) */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontVariantNumeric: 'tabular-nums',
          fontFeatureSettings: '"tnum" 1',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: timeColor,
          padding: '0.1rem 0.2rem',
          width: '4.5rem',
          minWidth: '4.5rem',
          maxWidth: '4.5rem',
          flexShrink: 0,
          textAlign: 'center',
          letterSpacing: '-0.02em',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.2rem',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {isCompleted && <Check size={12} style={{ color: 'var(--verdict-ac)', flexShrink: 0 }} />}
        <span
          style={{
            display: 'inline-block',
            textAlign: 'center',
            filter: isHidden ? 'blur(4px)' : 'none',
            userSelect: isHidden ? 'none' : 'auto',
            transition: 'filter 0.15s ease',
          }}
        >
          {isHidden ? '••:••' : displayedTime}
        </span>
      </div>

      {/* Increment Button (Countdown mode only) */}
      <AnimatePresence initial={false}>
        {mode === 'countdown' && (
          <motion.div
            key="btn-step-plus"
            initial={{ opacity: 0, scale: 0.8, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 'auto' }}
            exit={{ opacity: 0, scale: 0.8, width: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ overflow: 'hidden', display: 'inline-flex', flexShrink: 0 }}
          >
            <Tooltip content={isPlusDisabled ? undefined : "+5m"} disabled={isPlusDisabled} side="bottom">
              <motion.button
                type="button"
                disabled={isPlusDisabled}
                onClick={() => handleStepTime(STEP_SECONDS)}
                whileTap={isPlusDisabled ? undefined : { scale: 0.88 }}
                aria-label="Add 5 minutes"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isPlusDisabled ? 'var(--text-faint)' : 'var(--text-muted)',
                  opacity: isPlusDisabled ? 0.3 : 1,
                  cursor: isPlusDisabled ? 'not-allowed' : 'pointer',
                  padding: '0.2rem',
                  width: '1.3rem',
                  height: '1.4rem',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-xs)',
                  transition: 'opacity 0.2s ease, color 0.2s ease',
                }}
              >
                <Plus size={12} />
              </motion.button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play / Pause Button */}
      <Tooltip content={isRunning ? 'Pause' : 'Start'} side="bottom">
        <motion.button
          type="button"
          onClick={handleTogglePlay}
          whileTap={{ scale: 0.88 }}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          style={{
            background: isRunning ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-medium)',
            color: isRunning ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.2rem',
            width: '1.6rem',
            height: '1.4rem',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xs)',
            marginLeft: '0.1rem',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isRunning ? (
              <motion.span
                key="pause"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                style={{ display: 'inline-flex' }}
              >
                <Pause size={12} />
              </motion.span>
            ) : (
              <motion.span
                key="play"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.12 }}
                style={{ display: 'inline-flex' }}
              >
                <Play size={12} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </Tooltip>

      {/* Reset Button */}
      <Tooltip content="Reset" side="bottom">
        <motion.button
          type="button"
          onClick={handleReset}
          whileTap={{ scale: 0.88, rotate: -90 }}
          aria-label="Reset timer"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.2rem',
            width: '1.4rem',
            height: '1.4rem',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          <RotateCcw size={12} />
        </motion.button>
      </Tooltip>

      {/* Hide / Show Toggle */}
      <Tooltip content={isHidden ? 'Show' : 'Hide'} side="bottom">
        <motion.button
          type="button"
          onClick={handleToggleHide}
          whileTap={{ scale: 0.88 }}
          aria-label={isHidden ? 'Show timer digits' : 'Hide timer digits'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.2rem',
            width: '1.4rem',
            height: '1.4rem',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
        </motion.button>
      </Tooltip>
    </div>
  );
};

