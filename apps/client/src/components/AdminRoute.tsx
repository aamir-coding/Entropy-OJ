import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-cyan)' }} />
          <p>Verifying administrative privileges...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <ShieldAlert size={42} style={{ color: '#fbbf24', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            You must be signed in with an administrator account to access the Problem Studio.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button onClick={() => openAuthModal('login')} className="btn btn-primary">
              Sign In as Admin
            </button>
            <Link to="/" className="btn btn-outline">
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <ShieldAlert size={42} style={{ color: 'var(--verdict-wa)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Your account (<code>{user.email}</code>) does not have administrator privileges. Please sign in with an authorized admin account.
          </p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Problems Catalog
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
