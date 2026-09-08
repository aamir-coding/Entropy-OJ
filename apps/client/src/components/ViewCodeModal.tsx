import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Verdicts } from '@anti-oj/shared';
import { ErrorBoundary } from './ErrorBoundary';
import { defineEntropyTheme } from '../styles/monacoTheme';
import { CopyButton } from './motion/copy-button';

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
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap & Escape listener (Issue M-5)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const monacoLang = language === 'cpp' ? 'cpp' : 'python';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="modal-backdrop"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="View submitted code"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
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
                background: '#080808',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Terminal size={17} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--brand-white)' }}>
                    {problemName ? `Submission: ${problemName}` : 'Submitted Code'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Language: <span style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>{language}</span>
                    {verdict && (
                      <span style={{ marginLeft: '0.75rem' }}>
                        Verdict:{' '}
                        <span
                          style={{
                            fontWeight: 600,
                            color: verdict === Verdicts.ACCEPTED ? 'var(--verdict-ac)' : 'var(--verdict-wa)',
                          }}
                        >
                          {verdict}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CopyButton text={code} label="Copy Code" />
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Editor Content with ErrorBoundary (Issue M-1) */}
            <div style={{ height: '450px', background: '#000000' }}>
              <ErrorBoundary
                fallback={
                  <div style={{ padding: '2rem', color: 'var(--verdict-wa)', textAlign: 'center' }}>
                    Failed to display Monaco Editor.
                  </div>
                }
              >
                <Editor
                  height="100%"
                  language={monacoLang}
                  theme="entropy-dark"
                  beforeMount={defineEntropyTheme}
                  value={code}
                  options={{
                    readOnly: true,
                    domReadOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
                    fontLigatures: true,
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    padding: { top: 12 },
                  }}
                />
              </ErrorBoundary>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

