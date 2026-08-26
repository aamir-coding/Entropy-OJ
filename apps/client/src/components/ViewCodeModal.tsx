import React, { useState } from 'react';
import { X, Copy, Check, Terminal } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface ViewCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  problemName?: string;
  verdict?: string;
}

export const ViewCodeModal: React.FC<ViewCodeModalProps> = ({
  isOpen,
  onClose,
  code,
  language,
  problemName,
  verdict,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monacoLang = language === 'cpp' ? 'cpp' : 'python';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '800px', width: '90%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Terminal size={18} className="text-sky-400" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                {problemName ? `Submission: ${problemName}` : 'Submitted Code'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Language: <span style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{language}</span>
                {verdict && (
                  <span style={{ marginLeft: '0.75rem' }}>
                    Verdict: <span style={{ fontWeight: 600, color: verdict === 'Accepted' ? '#10b981' : '#f43f5e' }}>{verdict}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleCopy}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div style={{ height: '450px', background: '#1e1e1e' }}>
          <Editor
            height="100%"
            language={monacoLang}
            theme="vs-dark"
            value={code}
            options={{
              readOnly: true,
              domReadOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              padding: { top: 12 },
            }}
          />
        </div>
      </div>
    </div>
  );
};
