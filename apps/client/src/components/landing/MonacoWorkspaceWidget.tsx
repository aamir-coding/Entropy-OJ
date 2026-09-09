import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  Check,
  CheckCircle2,
  Terminal,
  FileCode,
  Sparkles,
  Clock,
  HardDrive,
  Loader2,
  RotateCcw,
} from 'lucide-react';
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
        if (seen.count(diff)) {
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

  return (
    <div
      className="monaco-workspace-simulator"
      style={{
        backgroundColor: '#050505',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
        display: 'flex',
        flexDirection: 'column',
        height: '480px',
        position: 'relative',
      }}
    >
      {/* Suppress Monaco read-only tooltip / overlay messages completely */}
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
      {/* 1. Editor Header / Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.45rem 0.85rem',
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0,
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Problem Badge & Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.78rem' }}>Two Sum</span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                color: '#05df72',
                backgroundColor: 'rgba(5, 223, 114, 0.12)',
                border: '1px solid rgba(5, 223, 114, 0.3)',
                padding: '0.1rem 0.35rem',
                borderRadius: '3px',
              }}
            >
              Easy
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                color: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: '#111',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.1rem 0.35rem',
                borderRadius: '3px',
              }}
            >
              #two-sum
            </span>
          </div>

          {/* Language selector */}
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value as 'cpp' | 'python');
              handleReset();
            }}
            style={{
              backgroundColor: '#111',
              color: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '4px',
              padding: '0.2rem 0.45rem',
              fontSize: '0.68rem',
              outline: 'none',
              cursor: 'pointer',
              marginLeft: '0.25rem',
            }}
          >
            <option value="cpp">C++ (GCC 12 / C++17)</option>
            <option value="python">Python 3 (3.11)</option>
          </select>
        </div>

        {/* Right: Simulation Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {status !== 'idle' && (
            <button
              onClick={handleReset}
              title="Reset simulation"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '4px',
                padding: '0.22rem 0.45rem',
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
              padding: '0.25rem 0.6rem',
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
              padding: '0.25rem 0.75rem',
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

      {/* 2. Monaco Editor Container (Interactive Read-Only) */}
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
            padding: '0.25rem 0.85rem',
            backgroundColor: '#0a0a0a',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => setConsoleTab('cases')}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: consoleTab === 'cases' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: consoleTab === 'cases' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                color: consoleTab === 'cases' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                cursor: 'pointer',
                fontSize: '0.66rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <FileCode size={11} />
              <span>Sample Cases</span>
            </button>

            <button
              onClick={() => setConsoleTab('results')}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: consoleTab === 'results' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: consoleTab === 'results' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                color: consoleTab === 'results' ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                cursor: 'pointer',
                fontSize: '0.66rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Terminal size={11} />
              <span>Verdict & Results</span>
              {status === 'sample_success' && (
                <span style={{ color: '#05df72', fontSize: '0.62rem' }}>●</span>
              )}
              {status === 'submit_success' && (
                <span style={{ color: '#05df72', fontSize: '0.62rem' }}>● AC</span>
              )}
            </button>
          </div>

          <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.35)' }}>
            Sandbox Runner · Docker Isolated
          </span>
        </div>

        {/* Console Body */}
        <div style={{ flex: 1, padding: '0.6rem 0.85rem', overflowY: 'auto' }}>
          {consoleTab === 'cases' ? (
            /* TAB 1: Sample Cases Viewer */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {SAMPLES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCaseIdx(idx)}
                    style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '3px',
                      backgroundColor: activeCaseIdx === idx ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      border:
                        activeCaseIdx === idx
                          ? '1px solid rgba(255, 255, 255, 0.25)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                      color: activeCaseIdx === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
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
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '4px',
                  padding: '0.45rem 0.6rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.2rem' }}>
                    Input:
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      backgroundColor: '#000000',
                      padding: '0.25rem 0.45rem',
                      borderRadius: '3px',
                      fontSize: '0.68rem',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.45,
                    }}
                  >
                    {SAMPLES[activeCaseIdx].input}
                  </pre>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '0.2rem' }}>
                    Expected Output:
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      backgroundColor: '#000000',
                      padding: '0.25rem 0.45rem',
                      borderRadius: '3px',
                      fontSize: '0.68rem',
                      color: '#05df72',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.45,
                    }}
                  >
                    {SAMPLES[activeCaseIdx].output}
                  </pre>
                </div>
              </div>
              <div style={{ fontSize: '0.63rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                <strong>Note:</strong> {SAMPLES[activeCaseIdx].note}
              </div>
            </div>
          ) : (
            /* TAB 2: Live Execution / Verdict Results */
            <div>
              {status === 'idle' ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    padding: '0.75rem',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.4)',
                    gap: '0.35rem',
                  }}
                >
                  <Terminal size={18} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
                  <span style={{ fontSize: '0.7rem' }}>Console Ready</span>
                  <span style={{ fontSize: '0.64rem', color: 'rgba(255, 255, 255, 0.3)' }}>
                    Click "Run Samples" for quick test cases or "Submit" for full judge evaluation.
                  </span>
                </div>
              ) : status === 'running_samples' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.72rem',
                    padding: '1rem 0',
                  }}
                >
                  <Loader2 size={16} className="animate-spin" style={{ color: '#38bdf8' }} />
                  <span>Executing against sample cases in ephemeral container...</span>
                </div>
              ) : status === 'submitting' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.72rem',
                    padding: '1rem 0',
                  }}
                >
                  <Loader2 size={16} className="animate-spin" style={{ color: '#05df72' }} />
                  <span>Evaluating 15 test cases in sandbox judge...</span>
                </div>
              ) : status === 'sample_success' ? (
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
              ) : (
                /* Full Submission AC Verdict View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {/* Verdict Header Line */}
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
                        <Clock size={10} /> 12ms
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
  );
};
