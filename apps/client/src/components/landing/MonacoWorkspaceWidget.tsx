import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  Check,
  CheckCircle2,
  Terminal,
  FileCode,
  FileText,
  Sparkles,
  Clock,
  HardDrive,
  Loader2,
  RotateCcw,
  Timer,
  Minus,
  Plus,
  Smartphone,
  Monitor,
  ArrowLeft,
  Brain,
} from 'lucide-react';
import { EntropyAiIcon } from '../icons/EntropyAiIcon';
import { defineEntropyTheme } from '../../styles/monacoTheme';

const TWO_SUM_CPP = `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    long long target;
    if (!(cin >> n >> target)) return 0;

    vector<long long> nums(n);
    for (int i = 0; i < n; ++i) {
        cin >> nums[i];
    }

    unordered_map<long long, int> seen;
    for (int i = 0; i < n; ++i) {
        long long diff = target - nums[i];
        if (seen.find(diff) != seen.end()) {
            cout << seen[diff] << " " << i << "\\n";
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}`;

const TWO_SUM_PYTHON = `import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    target = int(raw[1])
    nums = [int(x) for x in raw[2:2 + n]]
    
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    solve()`;

const SAMPLES = [
  {
    input: '4 9\n2 7 11 15',
    output: '0 1',
    note: 'nums[0] + nums[1] == 2 + 7 == 9',
  },
  {
    input: '3 6\n3 2 4',
    output: '1 2',
    note: 'nums[1] + nums[2] == 2 + 4 == 6',
  },
];

type SimStatus = 'idle' | 'running_samples' | 'sample_success' | 'submitting' | 'submit_success';

export const MonacoWorkspaceWidget: React.FC = () => {
  const [lang, setLang] = useState<'cpp' | 'python'>('cpp');
  const [status, setStatus] = useState<SimStatus>('idle');
  const [consoleTab, setConsoleTab] = useState<'cases' | 'results'>('cases');
  const [activeCaseIdx, setActiveCaseIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'desktop';
  });
  const [mobileTab, setMobileTab] = useState<'problem' | 'code' | 'console'>('code');

  const handleRunSamples = () => {
    if (status === 'running_samples' || status === 'submitting') return;
    setStatus('running_samples');
    setConsoleTab('results');
    setTimeout(() => {
      setStatus('sample_success');
      setActiveCaseIdx(0);
    }, 650);
  };

  const handleSubmit = () => {
    if (status === 'running_samples' || status === 'submitting') return;
    setStatus('submitting');
    setConsoleTab('results');
    setTimeout(() => {
      setStatus('submit_success');
    }, 900);
  };

  const handleReset = () => {
    setStatus('idle');
    setConsoleTab('cases');
    setActiveCaseIdx(0);
  };

  const onMobileRun = () => {
    setMobileTab('console');
    handleRunSamples();
  };

  const onMobileSubmit = () => {
    setMobileTab('console');
    handleSubmit();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* ── View Mode Segmented Switcher ── */}
      <div
        className="monaco-switcher-wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.8rem',
          alignSelf: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontFamily: "var(--font-mono, monospace)" }}>
          Workspace Layout:
        </span>
        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.15rem' }}>
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'desktop' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: viewMode === 'desktop' ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: '0.65rem',
              fontWeight: viewMode === 'desktop' ? 600 : 400,
              transition: 'all 120ms ease',
            }}
          >
            <Monitor size={12} /> Desktop Workspace
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'mobile' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: viewMode === 'mobile' ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: '0.65rem',
              fontWeight: viewMode === 'mobile' ? 600 : 400,
              transition: 'all 120ms ease',
            }}
          >
            <Smartphone size={12} /> Mobile Drawer
          </button>
        </div>
      </div>

      {/* ── DESKTOP SIMULATOR VIEW ── */}
      {viewMode === 'desktop' ? (
        <div
          className="monaco-workspace-simulator"
          style={{
            width: '100%',
            height: '480px',
            backgroundColor: '#050505',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Suppress Monaco read-only tooltip / overlay messages */}
          <style>{`
            .monaco-workspace-simulator .monaco-editor-overlaymessage,
            .monaco-workspace-simulator .overlayWidgets .monaco-editor-overlaymessage,
            .monaco-editor-overlaymessage {
              display: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
          `}</style>

          {/* 1. Problem Top Bar: Problem Identity & Practice Interview Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.9rem',
              backgroundColor: '#0a0a0a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0,
              gap: '0.75rem',
            }}
          >
            {/* Left: Problem Title & Difficulty Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                Two Sum
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  color: '#05df72',
                  backgroundColor: 'rgba(5, 223, 114, 0.12)',
                  border: '1px solid rgba(5, 223, 114, 0.3)',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '3px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Easy
              </span>
            </div>

            {/* Right: Synced Practice Timer Widget */}
            <div
              title="Practice Timer & Stopwatch (Default: 20:00 for Easy problems)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '5px',
                padding: '0.15rem 0.45rem',
                gap: '0.25rem',
                userSelect: 'none',
                height: '1.65rem',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.45)', display: 'inline-flex', alignItems: 'center' }}>
                <Timer size={12} />
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.35)', display: 'inline-flex', alignItems: 'center' }}>
                <Minus size={10} />
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#ededed',
                  padding: '0 0.2rem',
                  letterSpacing: '-0.01em',
                  minWidth: '2.6rem',
                  textAlign: 'center',
                }}
              >
                20:00
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.35)', display: 'inline-flex', alignItems: 'center' }}>
                <Plus size={10} />
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  width: '1.25rem',
                  height: '1.15rem',
                  borderRadius: '3px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: '0.15rem',
                }}
                title="Start Timer"
              >
                <Play size={9} style={{ marginLeft: '1px' }} />
              </span>
              <span
                style={{ color: 'rgba(255, 255, 255, 0.35)', display: 'inline-flex', alignItems: 'center' }}
                title="Reset Timer"
              >
                <RotateCcw size={10} />
              </span>
            </div>
          </div>

          {/* 2. Editor Toolbar: Language Selector & Execution Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.35rem 0.9rem',
              backgroundColor: '#0d0d0d',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
              flexShrink: 0,
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Left: Language Selector */}
            <select
              value={lang}
              onChange={(e) => {
                setLang(e.target.value as 'cpp' | 'python');
                handleReset();
              }}
              style={{
                backgroundColor: '#151515',
                color: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '4px',
                padding: '0.22rem 0.5rem',
                fontSize: '0.68rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="cpp">C++ (GCC 12 / C++17)</option>
              <option value="python">Python 3 (3.11)</option>
            </select>

            {/* Right: Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {status !== 'idle' && (
                <button
                  onClick={handleReset}
                  title="Reset simulation"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '4px',
                    padding: '0.24rem 0.5rem',
                    fontSize: '0.68rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              )}

              {/* Run Samples Button */}
              <button
                onClick={handleRunSamples}
                disabled={status === 'running_samples' || status === 'submitting'}
                style={{
                  backgroundColor: status === 'sample_success' ? 'rgba(5, 223, 114, 0.15)' : '#171717',
                  border:
                    status === 'sample_success'
                      ? '1px solid rgba(5, 223, 114, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.16)',
                  color: status === 'sample_success' ? '#05df72' : '#ededed',
                  borderRadius: '4px',
                  padding: '0.26rem 0.65rem',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: status === 'running_samples' || status === 'submitting' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {status === 'running_samples' ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    <span>Running...</span>
                  </>
                ) : status === 'sample_success' ? (
                  <>
                    <Check size={11} />
                    <span>Tested</span>
                  </>
                ) : (
                  <>
                    <Play size={11} />
                    <span>Run Samples</span>
                  </>
                )}
              </button>

              {/* Submit Solution Button */}
              <button
                onClick={handleSubmit}
                disabled={status === 'running_samples' || status === 'submitting'}
                style={{
                  backgroundColor: status === 'submit_success' ? '#05df72' : '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.26rem 0.8rem',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: status === 'running_samples' || status === 'submitting' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(255, 255, 255, 0.15)',
                }}
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : status === 'submit_success' ? (
                  <>
                    <CheckCircle2 size={11} />
                    <span>Accepted</span>
                  </>
                ) : (
                  <>
                    <Send size={11} />
                    <span>Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Monaco Editor Container */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', background: '#000000' }}>
            <Editor
              height="100%"
              language={lang === 'cpp' ? 'cpp' : 'python'}
              theme="entropy-dark"
              beforeMount={defineEntropyTheme}
              onMount={(editor) => {
                const messageContribution = editor.getContribution('editor.contrib.messageController');
                editor.onDidAttemptReadOnlyEdit(() => {
                  if (messageContribution && typeof (messageContribution as any).closeMessage === 'function') {
                    (messageContribution as any).closeMessage();
                  }
                });
              }}
              value={lang === 'cpp' ? TWO_SUM_CPP : TWO_SUM_PYTHON}
              options={{
                readOnly: true,
                domReadOnly: true,
                readOnlyMessage: { value: '' },
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                padding: { top: 8, bottom: 8 },
                cursorBlinking: 'blink',
                renderLineHighlight: 'all',
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'auto',
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
              }}
              loading={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '0.75rem',
                  }}
                >
                  Loading Monaco Editor workspace...
                </div>
              }
            />
          </div>

          {/* 3. Docked Console Drawer */}
          <div
            style={{
              height: '175px',
              minHeight: '175px',
              maxHeight: '175px',
              backgroundColor: '#070707',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            {/* Console Header Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#0c0c0c',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '0.25rem 0.75rem',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  onClick={() => setConsoleTab('cases')}
                  style={{
                    background: consoleTab === 'cases' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: consoleTab === 'cases' ? '#fff' : 'rgba(255, 255, 255, 0.45)',
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.67rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FileCode size={11} />
                  <span>Testcases</span>
                </button>

                <button
                  onClick={() => setConsoleTab('results')}
                  style={{
                    background: consoleTab === 'results' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    color: consoleTab === 'results' ? '#fff' : 'rgba(255, 255, 255, 0.45)',
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.67rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Terminal size={11} />
                  <span>Results</span>
                  {status !== 'idle' && (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: status === 'sample_success' || status === 'submit_success' ? '#05df72' : '#f59e0b',
                      }}
                    />
                  )}
                </button>
              </div>

              <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.35)' }}>
                {status === 'idle' && 'Waiting for run or submit'}
                {status === 'running_samples' && 'Executing sample tests in sandbox...'}
                {status === 'sample_success' && 'Sample tests evaluated'}
                {status === 'submitting' && 'Running all 15 hidden testcases...'}
                {status === 'submit_success' && 'Solution verified and accepted'}
              </div>
            </div>

            {/* Console Body */}
            <div style={{ flex: 1, padding: '0.6rem 0.85rem', overflowY: 'auto', fontSize: '0.7rem' }}>
              {consoleTab === 'cases' ? (
                /* Testcases View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {SAMPLES.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveCaseIdx(idx)}
                        style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '3px',
                          backgroundColor: activeCaseIdx === idx ? 'rgba(255, 255, 255, 0.12)' : '#111',
                          border:
                            activeCaseIdx === idx
                              ? '1px solid rgba(255, 255, 255, 0.25)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                          color: activeCaseIdx === idx ? '#fff' : 'rgba(255, 255, 255, 0.45)',
                          fontSize: '0.64rem',
                          cursor: 'pointer',
                        }}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      backgroundColor: '#0a0a0a',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '4px',
                      padding: '0.45rem 0.6rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.58rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.1rem' }}>
                        Input Data (stdin):
                      </div>
                      <pre style={{ margin: 0, fontSize: '0.66rem', color: '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                        {SAMPLES[activeCaseIdx].input}
                      </pre>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.58rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.1rem' }}>
                        Expected Output:
                      </div>
                      <pre style={{ margin: 0, fontSize: '0.66rem', color: '#05df72', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                        {SAMPLES[activeCaseIdx].output}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                /* Results View */
                <div>
                  {status === 'idle' && (
                    <div style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', padding: '1.5rem 0' }}>
                      Click "Run Samples" or "Submit" to trigger the process sandbox.
                    </div>
                  )}

                  {(status === 'running_samples' || status === 'submitting') && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        color: '#f59e0b',
                        padding: '1.5rem 0',
                      }}
                    >
                      <Loader2 size={16} className="animate-spin" />
                      <span>
                        {status === 'running_samples'
                          ? 'Evaluating sample test cases in direct sandbox...'
                          : 'Evaluating 15 test cases against strict memory/time bounds...'}
                      </span>
                    </div>
                  )}

                  {status === 'sample_success' && (
                    /* Sample Results View */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {SAMPLES.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveCaseIdx(idx)}
                              style={{
                                padding: '0.12rem 0.45rem',
                                borderRadius: '3px',
                                backgroundColor: activeCaseIdx === idx ? 'rgba(5, 223, 114, 0.15)' : '#0a0a0a',
                                border:
                                  activeCaseIdx === idx
                                    ? '1px solid rgba(5, 223, 114, 0.4)'
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                                color: activeCaseIdx === idx ? '#05df72' : 'rgba(255, 255, 255, 0.5)',
                                fontSize: '0.64rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                cursor: 'pointer',
                              }}
                            >
                              <span>Case {idx + 1}</span>
                              <Check size={10} style={{ color: '#05df72' }} />
                            </button>
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            color: '#05df72',
                            backgroundColor: 'rgba(5, 223, 114, 0.1)',
                            border: '1px solid rgba(5, 223, 114, 0.25)',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                          }}
                        >
                          All 2 Samples Passed · 4ms
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '0.4rem',
                          backgroundColor: '#0a0a0a',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                          borderRadius: '4px',
                          padding: '0.4rem 0.55rem',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.58rem', color: 'rgba(255, 255, 255, 0.4)' }}>Input:</div>
                          <pre style={{ margin: 0, fontSize: '0.65rem', color: '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                            {SAMPLES[activeCaseIdx].input}
                          </pre>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.58rem', color: 'rgba(255, 255, 255, 0.4)' }}>Your Output:</div>
                          <pre style={{ margin: 0, fontSize: '0.65rem', color: '#05df72', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                            {SAMPLES[activeCaseIdx].output}
                          </pre>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.58rem', color: 'rgba(255, 255, 255, 0.4)' }}>Expected:</div>
                          <pre style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                            {SAMPLES[activeCaseIdx].output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {status === 'submit_success' && (
                    /* Full Submission AC Verdict View */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span
                            style={{
                              backgroundColor: 'rgba(5, 223, 114, 0.15)',
                              border: '1px solid rgba(5, 223, 114, 0.4)',
                              color: '#05df72',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              letterSpacing: '0.03em',
                            }}
                          >
                            <CheckCircle2 size={12} />
                            ACCEPTED
                          </span>

                          <span
                            style={{
                              fontSize: '0.62rem',
                              color: 'rgba(255, 255, 255, 0.65)',
                              backgroundColor: '#0e0e0e',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              padding: '0.12rem 0.4rem',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Check size={10} style={{ color: '#05df72' }} /> 15/15 Passed
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.62rem' }}>
                          <span
                            style={{
                              color: 'rgba(255, 255, 255, 0.65)',
                              backgroundColor: '#0e0e0e',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              padding: '0.12rem 0.4rem',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Clock size={10} /> 11ms
                          </span>
                          <span
                            style={{
                              color: 'rgba(255, 255, 255, 0.65)',
                              backgroundColor: '#0e0e0e',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              padding: '0.12rem 0.4rem',
                              borderRadius: '3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <HardDrive size={10} /> 8.4MB
                          </span>
                        </div>
                      </div>

                      {/* AI Approach Classification Badge */}
                      <div
                        style={{
                          backgroundColor: '#090909',
                          border: '1px solid rgba(5, 223, 114, 0.22)',
                          borderRadius: '4px',
                          padding: '0.4rem 0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                            <Sparkles size={11} style={{ color: '#38bdf8' }} />
                            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#ededed' }}>
                              Hash Map Frequency Counting
                            </span>
                            <span
                              style={{
                                fontSize: '0.56rem',
                                color: '#38bdf8',
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.25)',
                                padding: '0.05rem 0.25rem',
                                borderRadius: '2px',
                              }}
                            >
                              AI Verified
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            <span>
                              Time: <strong style={{ color: 'rgba(255, 255, 255, 0.85)' }}>O(N)</strong>
                            </span>
                            <span>
                              Space: <strong style={{ color: 'rgba(255, 255, 255, 0.85)' }}>O(N)</strong>
                            </span>
                          </div>
                        </div>

                        <span style={{ fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.35)' }}>
                          Optimal Linear Solution
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── AUTHENTIC MOBILE WORKSPACE SIMULATOR (Matches MobileProblemWorkspace.tsx) ── */
        <div
          className="mobile-workspace-mockup"
          style={{
            width: '100%',
            maxWidth: '360px',
            height: '620px',
            minHeight: '520px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#050505',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
          }}
        >
          {/* Phone Top Speaker Notch */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0.45rem 0 0.25rem 0', backgroundColor: '#080808' }}>
            <div style={{ width: '38px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
          </div>

          {/* 1. Mobile Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.4rem 0.75rem',
              backgroundColor: '#0a0a0a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <ArrowLeft size={11} />
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>
                Two Sum
              </span>
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 600,
                  color: '#05df72',
                  backgroundColor: 'rgba(5, 223, 114, 0.12)',
                  border: '1px solid rgba(5, 223, 114, 0.3)',
                  padding: '0.05rem 0.3rem',
                  borderRadius: '3px',
                }}
              >
                Easy
              </span>
              <span
                style={{
                  fontSize: '0.58rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  padding: '0.05rem 0.3rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <Brain size={10} style={{ color: '#38bdf8' }} />
                <span>AI</span>
              </span>
            </div>

            {/* Compact Mobile Timer */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                padding: '0.1rem 0.35rem',
                fontSize: '0.66rem',
                color: '#ededed',
              }}
            >
              <Timer size={10} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>20:00</span>
            </div>
          </div>

          {/* 2. Mobile Segmented Tab Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              backgroundColor: '#0c0c0c',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '0.25rem',
              gap: '0.25rem',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setMobileTab('problem')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.2rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: mobileTab === 'problem' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: mobileTab === 'problem' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                fontSize: '0.65rem',
                fontWeight: mobileTab === 'problem' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              <FileText size={11} />
              <span>Problem</span>
            </button>

            <button
              onClick={() => setMobileTab('code')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.2rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: mobileTab === 'code' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: mobileTab === 'code' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                fontSize: '0.65rem',
                fontWeight: mobileTab === 'code' ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              <FileCode size={11} />
              <span>Code ({lang.toUpperCase()})</span>
            </button>

            <button
              onClick={() => setMobileTab('console')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.2rem',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: mobileTab === 'console' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: mobileTab === 'console' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                fontSize: '0.65rem',
                fontWeight: mobileTab === 'console' ? 600 : 400,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Terminal size={11} />
              <span>Console</span>
              {status !== 'idle' && (
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor:
                      status === 'sample_success' || status === 'submit_success' ? '#05df72' : '#f59e0b',
                    marginLeft: '2px',
                  }}
                />
              )}
            </button>
          </div>

          {/* 3. Mobile Viewport Content Area */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {mobileTab === 'problem' && (
              /* Problem Statement Tab */
              <div
                style={{
                  padding: '0.85rem',
                  color: '#d4d4d4',
                  fontSize: '0.72rem',
                  lineHeight: 1.6,
                  overflowY: 'auto',
                  flex: 1,
                  fontFamily: "var(--font-sans, 'Inter', sans-serif)",
                }}
              >
                <p style={{ margin: '0 0 0.65rem 0', color: '#ededed' }}>
                  Given an array of integers{' '}
                  <code style={{ color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.05rem 0.3rem', borderRadius: '3px' }}>
                    nums
                  </code>{' '}
                  and an integer{' '}
                  <code style={{ color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.05rem 0.3rem', borderRadius: '3px' }}>
                    target
                  </code>
                  , return indices of the two numbers such that they add up to <em>target</em>.
                </p>
                <div
                  style={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '0.6rem',
                    marginBottom: '0.65rem',
                    fontSize: '0.66rem',
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>Example 1:</span>
                  <br />
                  <strong>Input:</strong> nums = [2, 7, 11, 15], target = 9<br />
                  <strong>Output:</strong> [0, 1]<br />
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Explanation: nums[0] + nums[1] == 9, return [0, 1].</span>
                </div>
                <div
                  style={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '6px',
                    padding: '0.6rem',
                    fontSize: '0.66rem',
                  }}
                >
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>Constraints:</span>
                  <ul style={{ margin: '0.3rem 0 0 1rem', padding: 0, color: 'rgba(255, 255, 255, 0.6)' }}>
                    <li>2 &lt;= nums.length &lt;= 10⁴</li>
                    <li>-10⁹ &lt;= nums[i] &lt;= 10⁹</li>
                    <li>Only one valid answer exists.</li>
                  </ul>
                </div>
              </div>
            )}

            {mobileTab === 'code' && (
              /* Code Editor Tab */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {/* Mobile Editor Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.35rem 0.65rem',
                    backgroundColor: '#080808',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <select
                    value={lang}
                    onChange={(e) => {
                      setLang(e.target.value as 'cpp' | 'python');
                      handleReset();
                    }}
                    style={{
                      backgroundColor: '#111',
                      color: '#ededed',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '3px',
                      padding: '0.15rem 0.35rem',
                      fontSize: '0.64rem',
                    }}
                  >
                    <option value="cpp">C++ (GCC 12)</option>
                    <option value="python">Python 3.11</option>
                  </select>

                  <button
                    onClick={handleReset}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: '0.64rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={10} /> Reset
                  </button>
                </div>

                {/* Monaco Editor Container */}
                <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                  <Editor
                    height="100%"
                    language={lang === 'cpp' ? 'cpp' : 'python'}
                    theme="entropy-dark"
                    beforeMount={defineEntropyTheme}
                    value={lang === 'cpp' ? TWO_SUM_CPP : TWO_SUM_PYTHON}
                    options={{
                      readOnly: true,
                      domReadOnly: true,
                      minimap: { enabled: false },
                      fontSize: 11,
                      fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 6, bottom: 6 },
                    }}
                  />
                </div>
              </div>
            )}

            {mobileTab === 'console' && (
              /* Console / Results Tab */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, padding: '0.65rem', overflowY: 'auto' }}>
                {status === 'idle' ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
                    Tap <strong>"Run Samples"</strong> or <strong>"Submit"</strong> below to run your code against test cases in the sandbox.
                  </div>
                ) : status === 'running_samples' || status === 'submitting' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#f59e0b', padding: '2rem 0', fontSize: '0.72rem' }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{status === 'running_samples' ? 'Running sample tests...' : 'Evaluating 15 test cases...'}</span>
                  </div>
                ) : status === 'sample_success' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#05df72' }}>
                        ✓ Samples Passed (4ms)
                      </span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {SAMPLES.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCaseIdx(i)}
                            style={{
                              padding: '0.1rem 0.35rem',
                              fontSize: '0.62rem',
                              borderRadius: '3px',
                              backgroundColor: activeCaseIdx === i ? 'rgba(5, 223, 114, 0.15)' : '#111',
                              border: activeCaseIdx === i ? '1px solid rgba(5, 223, 114, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                              color: activeCaseIdx === i ? '#05df72' : 'rgba(255,255,255,0.4)',
                            }}
                          >
                            Case {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.5rem', fontSize: '0.66rem' }}>
                      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '0.1rem' }}>Input:</div>
                      <pre style={{ margin: '0 0 0.35rem 0', color: '#fff' }}>{SAMPLES[activeCaseIdx].input}</pre>
                      <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '0.1rem' }}>Output:</div>
                      <pre style={{ margin: 0, color: '#05df72' }}>{SAMPLES[activeCaseIdx].output}</pre>
                    </div>
                  </div>
                ) : (
                  /* Accepted Full Submission */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(5, 223, 114, 0.1)', border: '1px solid rgba(5, 223, 114, 0.3)', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#05df72', fontWeight: 700, fontSize: '0.75rem' }}>
                        <CheckCircle2 size={13} />
                        <span>ACCEPTED</span>
                      </div>
                      <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.7)' }}>
                        15/15 Passed · 11ms · 8.4MB
                      </span>
                    </div>

                    {/* AI Classifier Card */}
                    <div style={{ backgroundColor: '#080808', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', padding: '0.6rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Sparkles size={11} /> Approach Classifier
                        </span>
                        <span style={{ fontSize: '0.55rem', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.12)', padding: '0.05rem 0.25rem', borderRadius: '2px' }}>
                          ENTROPY AI
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#fff', marginBottom: '0.2rem' }}>
                        <strong>Pattern:</strong> Hash Map Frequency Counting
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)' }}>
                        <span>Time: <strong style={{ color: '#05df72' }}>O(N)</strong></span>
                        <span>Space: <strong style={{ color: '#05df72' }}>O(N)</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Mobile Floating Bottom Action Dock */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: '#0a0a0a',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              flexShrink: 0,
            }}
          >
            <button
              onClick={onMobileRun}
              disabled={status === 'running_samples' || status === 'submitting'}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.45rem',
                borderRadius: '6px',
                backgroundColor: status === 'sample_success' ? 'rgba(5, 223, 114, 0.15)' : '#171717',
                border: status === 'sample_success' ? '1px solid rgba(5, 223, 114, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                color: status === 'sample_success' ? '#05df72' : '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Play size={11} />
              <span>Run Samples</span>
            </button>

            <button
              onClick={onMobileSubmit}
              disabled={status === 'running_samples' || status === 'submitting'}
              style={{
                flex: 1.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.45rem',
                borderRadius: '6px',
                backgroundColor: status === 'submit_success' ? '#05df72' : '#ffffff',
                border: 'none',
                color: '#000000',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Send size={11} />
              <span>Submit Solution</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
