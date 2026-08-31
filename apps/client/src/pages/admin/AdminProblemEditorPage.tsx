import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { api } from '../../api/client';
import {
  ProblemDifficulty,
  ALL_PROBLEM_DIFFICULTIES,
  ISampleTestCase,
  IAdminTestCaseInput,
  IAdminValidateSolutionResponse,
  SupportedLanguage,
} from '@anti-oj/shared';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  Lock,
  Layers,
  Code2,
  Loader2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const AdminProblemEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Active sub-tab in studio
  const [activeTab, setActiveTab] = useState<'statement' | 'samples' | 'judge' | 'validate'>('statement');

  // Problem Form State
  const [name, setName] = useState('');
  const [problemCode, setProblemCode] = useState('');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('Easy');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Array', 'Hash Table']);
  const [timeLimitMs, setTimeLimitMs] = useState(1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);
  const [statement, setStatement] = useState(`### Problem Description

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

---

### Input Format
- First line: Two space-separated integers $N$ and $target$.
- Second line: $N$ space-separated integers representing \`nums\`.

### Output Format
- Print the two indices separated by a space on a single line.

### Constraints
- $2 \\le N \\le 10^4$
- $-10^9 \\le nums[i] \\le 10^9$
- $-10^9 \\le target \\le 10^9$
`);

  // Sample Cases
  const [sampleCases, setSampleCases] = useState<ISampleTestCase[]>([
    {
      input: '4 9\n2 7 11 15',
      output: '0 1',
      explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.',
    },
  ]);

  // Hidden Judge Cases
  const [judgeCases, setJudgeCases] = useState<IAdminTestCaseInput[]>([
    {
      input: '5 10\n1 2 3 7 9',
      output: '2 3',
      isSample: false,
    },
  ]);

  // Batch import state
  const [batchRawInput, setBatchRawInput] = useState('');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Model Solution Validation State
  const [valLanguage, setValLanguage] = useState<SupportedLanguage>('python');
  const [valCode, setValCode] = useState<string>(`import sys

def solve():
    raw = sys.stdin.read().split()
    if not raw:
        return
    n = int(raw[0])
    target = int(raw[1])
    nums = [int(x) for x in raw[2:2+n]]
    
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    solve()
`);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<IAdminValidateSolutionResponse | null>(null);

  // Form saving state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing problem if in edit mode
  useEffect(() => {
    if (!id) return;
    const loadProblem = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/admin/problems/${id}`);
        if (res.data.success) {
          const p = res.data.data;
          setName(p.name);
          setProblemCode(p.problemCode);
          setDifficulty(p.difficulty);
          setTags(p.tags || []);
          setTimeLimitMs(p.timeLimitMs);
          setMemoryLimitMb(Math.round(p.memoryLimitKb / 1024));
          setStatement(p.statement);
          setSampleCases(p.sampleCases || []);

          // Filter out judge cases (both samples and hidden)
          const nonSampleCases = (p.testCases || []).filter((tc: any) => !tc.isSample);
          if (nonSampleCases.length > 0) {
            setJudgeCases(nonSampleCases);
          } else {
            setJudgeCases((p.testCases || []).filter((tc: any) => !tc.isSample));
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load problem.');
      } finally {
        setLoading(false);
      }
    };
    loadProblem();
  }, [id]);

  // Helper to auto-generate slug from name if new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode && !problemCode) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setProblemCode(slug);
    }
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Sample Case handlers
  const handleAddSampleCase = () => {
    setSampleCases([...sampleCases, { input: '', output: '', explanation: '' }]);
  };

  const handleUpdateSampleCase = (index: number, field: keyof ISampleTestCase, val: string) => {
    const updated = [...sampleCases];
    updated[index] = { ...updated[index], [field]: val };
    setSampleCases(updated);
  };

  const handleRemoveSampleCase = (index: number) => {
    setSampleCases(sampleCases.filter((_, i) => i !== index));
  };

  // Judge Case handlers
  const handleAddJudgeCase = () => {
    setJudgeCases([...judgeCases, { input: '', output: '', isSample: false }]);
  };

  const handleUpdateJudgeCase = (index: number, field: keyof IAdminTestCaseInput, val: string) => {
    const updated = [...judgeCases];
    updated[index] = { ...updated[index], [field]: val };
    setJudgeCases(updated);
  };

  const handleRemoveJudgeCase = (index: number) => {
    setJudgeCases(judgeCases.filter((_, i) => i !== index));
  };

  // Batch Import JSON or Raw lines
  const handleBatchImport = () => {
    try {
      const parsed = JSON.parse(batchRawInput);
      if (Array.isArray(parsed)) {
        const validCases = parsed.map((item) => ({
          input: String(item.input || item.in || ''),
          output: String(item.output || item.out || ''),
          isSample: false,
        }));
        setJudgeCases([...judgeCases, ...validCases]);
        setIsBatchModalOpen(false);
        setBatchRawInput('');
        return;
      }
    } catch {
      // If not JSON, parse by delimiter
      alert('Please paste a valid JSON array of test cases: [{"input": "...", "output": "..."}]');
    }
  };

  // Validate Model Solution
  const handleValidateSolution = async () => {
    if (!isEditMode) {
      alert('Please save the problem first before running sandbox validation.');
      return;
    }
    try {
      setIsValidating(true);
      setError(null);
      const res = await api.post(`/admin/problems/${id}/validate`, {
        language: valLanguage,
        code: valCode,
      });
      if (res.data.success) {
        setValidationResult(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Validation failed.');
    } finally {
      setIsValidating(false);
    }
  };

  // Save / Update Problem
  const handleSaveProblem = async () => {
    if (!name.trim()) {
      setError('Problem name is required.');
      return;
    }
    if (!problemCode.trim()) {
      setError('Problem slug code is required.');
      return;
    }
    if (sampleCases.length === 0) {
      setError('At least one sample test case is required.');
      return;
    }

    // Build unified test cases list: sample cases (isSample: true) + judge cases (isSample: false)
    const combinedTestCases = [
      ...sampleCases.map((s, idx) => ({
        input: s.input,
        output: s.output,
        isSample: true,
        order: idx + 1,
      })),
      ...judgeCases.map((j, idx) => ({
        input: j.input,
        output: j.output,
        isSample: false,
        order: sampleCases.length + idx + 1,
      })),
    ];

    const payload = {
      name: name.trim(),
      problemCode: problemCode.trim().toLowerCase(),
      statement: statement.trim(),
      difficulty,
      tags,
      timeLimitMs: Number(timeLimitMs),
      memoryLimitKb: Number(memoryLimitMb) * 1024,
      sampleCases,
      testCases: combinedTestCases,
    };

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      if (isEditMode) {
        const res = await api.put(`/admin/problems/${id}`, payload);
        if (res.data.success) {
          setSuccessMsg('Problem and test cases saved successfully!');
        }
      } else {
        const res = await api.post('/admin/problems', payload);
        if (res.data.success) {
          navigate(`/admin/problems/${res.data.data._id}/edit`);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save problem.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-cyan)' }} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))', overflow: 'hidden' }}>
      {/* Top Action Ribbon */}
      <div
        style={{
          padding: '0.75rem 1.5rem',
          background: 'var(--bg-glass)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/admin"
            className="btn btn-sm btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} /> Back to Studio
          </Link>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isEditMode ? `Edit Problem: ${name || 'Untitled'}` : 'Create New Problem'}
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                #{problemCode || 'slug'}
              </span>
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {successMsg && (
            <span style={{ fontSize: '0.8rem', color: 'var(--verdict-ac)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} /> {successMsg}
            </span>
          )}
          {error && (
            <span style={{ fontSize: '0.8rem', color: 'var(--verdict-wa)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertTriangle size={14} /> {error}
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveProblem}
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem' }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEditMode ? 'Save Changes' : 'Publish Problem'}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          padding: '0 1.5rem',
          background: 'rgba(15, 23, 42, 0.6)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '0.5rem',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setActiveTab('statement')}
          className="tab-button"
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: activeTab === 'statement' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'statement' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
          }}
        >
          <FileText size={15} /> Statement & Live Math Preview
        </button>

        <button
          onClick={() => setActiveTab('samples')}
          className="tab-button"
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: activeTab === 'samples' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'samples' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
          }}
        >
          <Eye size={15} /> Visible Sample Cases ({sampleCases.length})
        </button>

        <button
          onClick={() => setActiveTab('judge')}
          className="tab-button"
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: activeTab === 'judge' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'judge' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
          }}
        >
          <Lock size={15} /> Hidden Judge Cases ({judgeCases.length})
        </button>

        <button
          onClick={() => setActiveTab('validate')}
          className="tab-button"
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: activeTab === 'validate' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'validate' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
          }}
        >
          <Play size={15} /> Model Solution Validator
        </button>
      </div>

      {/* Main Studio Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {/* ======================================================== */}
        {/* TAB 1: STATEMENT & LIVE PREVIEW                          */}
        {/* ======================================================== */}
        {activeTab === 'statement' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', height: '100%' }}>
            {/* Left: Metadata & Markdown Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                  Problem Metadata
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      PROBLEM TITLE
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Two Sum"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      SLUG / CODE
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={problemCode}
                      onChange={(e) => setProblemCode(e.target.value)}
                      placeholder="e.g. two-sum"
                      style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      DIFFICULTY
                    </label>
                    <select
                      className="input"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}
                      style={{ width: '100%' }}
                    >
                      {ALL_PROBLEM_DIFFICULTIES.map((d) => (
                        <option key={d} value={d} style={{ background: '#1e293b' }}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      TIME LIMIT (MS)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={timeLimitMs}
                      onChange={(e) => setTimeLimitMs(Number(e.target.value))}
                      min={100}
                      max={10000}
                      step={100}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      MEMORY LIMIT (MB)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={memoryLimitMb}
                      onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                      min={16}
                      max={512}
                      step={16}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    TAGS & TOPICS
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="input"
                      placeholder="Add tag (e.g. Dynamic Programming)..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      style={{ flex: 1 }}
                    />
                    <button type="button" onClick={handleAddTag} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Statement Markdown Input */}
              <div className="glass-panel" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', margin: 0 }}>
                    Problem Statement (Markdown & LaTeX)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    LaTeX Math: $O(N)$ or $$1 \le N \le 10^5$$
                  </span>
                </div>
                <textarea
                  className="input"
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Write problem statement in Markdown..."
                  style={{
                    flex: 1,
                    minHeight: '320px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Right: Live KaTeX Math & Markdown Preview */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(15, 23, 42, 0.85)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)' }}>
                  Live Statement & Math Preview
                </span>
              </div>

              <div className="markdown-statement" style={{ flex: 1, overflowY: 'auto' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>{name || 'Untitled Problem'}</h1>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span className={`pill ${difficulty === 'Easy' ? 'pill-easy' : difficulty === 'Medium' ? 'pill-medium' : 'pill-hard'}`}>
                    {difficulty}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Limits: {timeLimitMs}ms / {memoryLimitMb}MB
                  </span>
                </div>
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {statement}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: VISIBLE SAMPLE CASES                              */}
        {/* ======================================================== */}
        {activeTab === 'samples' && (
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Visible Sample Test Cases</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                  These test cases are publicly visible in the problem description and executed when users click "Run Samples".
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSampleCase}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
              >
                <Plus size={15} /> Add Sample Case
              </button>
            </div>

            {sampleCases.map((sc, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
                    Sample Case #{idx + 1}
                  </span>
                  {sampleCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSampleCase(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--verdict-wa)', cursor: 'pointer' }}
                      title="Remove Case"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      SAMPLE INPUT (STDIN)
                    </label>
                    <textarea
                      className="input"
                      value={sc.input}
                      onChange={(e) => handleUpdateSampleCase(idx, 'input', e.target.value)}
                      placeholder="Input data..."
                      rows={3}
                      style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      EXPECTED OUTPUT (STDOUT)
                    </label>
                    <textarea
                      className="input"
                      value={sc.output}
                      onChange={(e) => handleUpdateSampleCase(idx, 'output', e.target.value)}
                      placeholder="Expected output..."
                      rows={3}
                      style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    EXPLANATION (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={sc.explanation || ''}
                    onChange={(e) => handleUpdateSampleCase(idx, 'explanation', e.target.value)}
                    placeholder="Explanation displayed below the example..."
                    style={{ width: '100%', fontSize: '0.825rem' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: HIDDEN JUDGE CASES                                */}
        {/* ======================================================== */}
        {activeTab === 'judge' && (
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Hidden Judge Test Cases</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                  These test cases are <strong>private and hidden</strong> from users, used to rigorously evaluate submissions against edge cases.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(true)}
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                >
                  <Layers size={15} /> Batch Import JSON
                </button>
                <button
                  type="button"
                  onClick={handleAddJudgeCase}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                >
                  <Plus size={15} /> Add Single Case
                </button>
              </div>
            </div>

            {judgeCases.map((jc, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Lock size={13} /> Hidden Judge Case #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveJudgeCase(idx)}
                    style={{ background: 'none', border: 'none', color: 'var(--verdict-wa)', cursor: 'pointer' }}
                    title="Remove Case"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      RAW INPUT (STDIN)
                    </label>
                    <textarea
                      className="input"
                      value={jc.input}
                      onChange={(e) => handleUpdateJudgeCase(idx, 'input', e.target.value)}
                      placeholder="Input data..."
                      rows={3}
                      style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      EXPECTED OUTPUT (STDOUT)
                    </label>
                    <textarea
                      className="input"
                      value={jc.output}
                      onChange={(e) => handleUpdateJudgeCase(idx, 'output', e.target.value)}
                      placeholder="Expected output..."
                      rows={3}
                      style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.825rem' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MODEL SOLUTION VALIDATOR                          */}
        {/* ======================================================== */}
        {activeTab === 'validate' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', height: '100%' }}>
            {/* Left: Code Editor for Reference Solution */}
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Code2 size={18} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Reference / Model Solution</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <select
                    className="input"
                    value={valLanguage}
                    onChange={(e) => setValLanguage(e.target.value as SupportedLanguage)}
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                  >
                    <option value="python" style={{ background: '#1e293b' }}>Python 3.11</option>
                    <option value="cpp" style={{ background: '#1e293b' }}>C++17 (g++)</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleValidateSolution}
                    className="btn btn-primary"
                    disabled={isValidating || !isEditMode}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                  >
                    {isValidating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                    Run Sandbox Validation
                  </button>
                </div>
              </div>

              {!isEditMode && (
                <div style={{ padding: '0.6rem 0.85rem', borderRadius: '6px', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
                  Please save the problem first before executing sandbox validation against all test cases.
                </div>
              )}

              <div style={{ flex: 1, minHeight: '380px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <Editor
                  height="100%"
                  language={valLanguage === 'cpp' ? 'cpp' : 'python'}
                  theme="vs-dark"
                  value={valCode}
                  onChange={(val) => setValCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: 'var(--font-mono)',
                    automaticLayout: true,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            {/* Right: Validation Diagnostic Results */}
            <div className="glass-panel" style={{ padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
                Sandbox Test Case Diagnostics
              </h3>

              {isValidating ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-cyan)' }} />
                  <p>Compiling and evaluating reference code against all test cases in Docker sandbox...</p>
                </div>
              ) : validationResult ? (
                <div>
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      background: validationResult.verdict === 'Accepted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${validationResult.verdict === 'Accepted' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {validationResult.verdict === 'Accepted' ? (
                        <CheckCircle2 size={24} style={{ color: 'var(--verdict-ac)' }} />
                      ) : (
                        <XCircle size={24} style={{ color: 'var(--verdict-wa)' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{validationResult.verdict}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Passed {validationResult.passedTestCases} of {validationResult.totalTestCases} Test Cases
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div>Max Time: {validationResult.executionTimeMs} ms</div>
                      <div>Max Memory: {Math.round(validationResult.memoryUsedKb / 1024)} MB</div>
                    </div>
                  </div>

                  {validationResult.compileOutput && (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--verdict-wa)' }}>COMPILER OUTPUT:</label>
                      <pre style={{ background: '#090d16', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--verdict-wa)', overflowX: 'auto' }}>
                        {validationResult.compileOutput}
                      </pre>
                    </div>
                  )}

                  {/* Individual Test Case Breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {validationResult.results.map((res, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${res.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                            {res.isSample ? 'Sample' : 'Judge'} Case #{res.testCaseIndex}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: res.passed ? 'var(--verdict-ac)' : 'var(--verdict-wa)' }}>
                            {res.verdict} ({res.executionTimeMs}ms)
                          </span>
                        </div>

                        {!res.passed && (
                          <div style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>
                            <div style={{ color: 'var(--text-muted)' }}>Expected: <code>{res.expectedOutput}</code></div>
                            <div style={{ color: 'var(--verdict-wa)' }}>Actual: <code>{res.actualOutput || '<empty>'}</code></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <HelpCircle size={32} style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>
                    Click <strong>"Run Sandbox Validation"</strong> to compile and verify your model solution against all sample and hidden judge test cases in Docker.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Batch Import JSON Modal */}
      {isBatchModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div className="glass-panel" style={{ maxWidth: '560px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Batch Import Test Cases</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Paste a JSON array containing your hidden test cases:
            </p>

            <textarea
              className="input"
              value={batchRawInput}
              onChange={(e) => setBatchRawInput(e.target.value)}
              placeholder={`[\n  { "input": "5 10\\n1 2 3 7 9", "output": "2 3" },\n  { "input": "4 6\\n1 2 3 3", "output": "2 3" }\n]`}
              rows={8}
              style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '1.25rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setIsBatchModalOpen(false)} className="btn btn-outline">
                Cancel
              </button>
              <button type="button" onClick={handleBatchImport} className="btn btn-primary">
                Import Cases
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
