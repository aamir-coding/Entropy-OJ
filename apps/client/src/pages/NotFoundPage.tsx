import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '480px' }}>
        <Terminal size={48} className="text-sky-400" style={{ margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1, marginBottom: '0.5rem' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          The page or problem you're looking for does not exist in the judge registry.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Home size={16} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
