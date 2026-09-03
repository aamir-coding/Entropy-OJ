import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (!this.props.fallback) {
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app, #0a0a0a)',
            color: 'var(--text-primary, #ffffff)',
            padding: '2rem',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              background: 'var(--bg-card, #141414)',
              border: '1px solid var(--border-medium, rgba(255,255,255,0.1))',
              borderRadius: 'var(--radius-xl, 16px)',
              boxShadow: 'var(--shadow-overlay, 0 20px 40px rgba(0,0,0,0.6))',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(251, 113, 133, 0.12)',
                border: '1px solid rgba(251, 113, 133, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: 'var(--verdict-wa, #fb7185)',
              }}
            >
              <AlertOctagon size={28} />
            </div>

            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Something went wrong
            </h1>
            <p style={{ color: 'var(--text-secondary, #a1a1aa)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              An unexpected client error occurred in the workspace. You can reload the application or return to the problem catalog.
            </p>

            {Boolean((import.meta as any).env?.DEV) && this.state.error && (
              <pre
                style={{
                  background: 'var(--bg-base, #0d0d0d)',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  color: 'var(--verdict-wa, #fb7185)',
                  overflowX: 'auto',
                  marginBottom: '1.5rem',
                  maxHeight: '160px',
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
              >
                <RotateCcw size={14} />
                <span>Reload Page</span>
              </button>
              <a
                href="/"
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.8125rem', textDecoration: 'none' }}
              >
                <Home size={14} />
                <span>Problem Catalog</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
