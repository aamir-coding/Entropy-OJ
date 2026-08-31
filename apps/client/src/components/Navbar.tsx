import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Code2,
  User,
  LogOut,
  ChevronDown,
  Terminal,
  Activity,
  Shield,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, stats, isAdmin, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'checking'>('checking');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Outside-click and Escape key handler for user dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  // System Health poll (every 60s)
  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        if (isMounted && res.data?.status === 'healthy') {
          setSystemHealth('healthy');
        } else if (isMounted) {
          setSystemHealth('degraded');
        }
      } catch {
        if (isMounted) {
          setSystemHealth('degraded');
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'rgba(13, 13, 13, 0.88)',
        backdropFilter: 'blur(20px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link
            to="/"
            aria-label="Anti Online Judge Homepage"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #4dabf7 0%, #818cf8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(77,171,247,0.35)',
                flexShrink: 0,
              }}
            >
              <Code2 size={17} color="#ffffff" strokeWidth={2.2} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                ANTI<span style={{ color: 'var(--accent-cyan)' }}>_OJ</span>
              </span>
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  padding: '0.05rem 0.35rem',
                  background: 'rgba(77,171,247,0.12)',
                  color: 'var(--accent-cyan)',
                  borderRadius: '3px',
                  border: '1px solid rgba(77,171,247,0.22)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginTop: '2px',
                  alignSelf: 'flex-start',
                }}
              >
                sandbox
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '0.35rem 0.7rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'color var(--transition-fast), background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Terminal size={13} />
              <span>Problems</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#60a5fa',
                  textDecoration: 'none',
                  padding: '0.35rem 0.7rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Shield size={13} />
                <span>Admin Studio</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section: System Status & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {/* Live Judge Health Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.2rem 0.625rem',
              background: systemHealth === 'healthy' ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.08)',
              border: `1px solid ${systemHealth === 'healthy' ? 'rgba(52,211,153,0.18)' : 'rgba(251,191,36,0.18)'}`,
              borderRadius: 'var(--radius-full)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: systemHealth === 'healthy' ? '#34d399' : '#fbbf24',
              letterSpacing: '0.02em',
            }}
          >
            <Activity size={11} className={systemHealth === 'healthy' ? 'animate-pulse' : ''} />
            <span>{systemHealth === 'healthy' ? 'Judge Online' : 'System Degraded'}</span>
          </div>

          {/* User Auth state */}
          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                id="user-profile-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-label="User profile and account settings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.6rem 0.25rem 0.3rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-overlay)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user.fullName.split(' ')[0]}</span>
                <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '228px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-overlay)',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    zIndex: 200,
                    animation: 'modal-scale-in 150ms var(--ease-smooth)',
                  }}
                >
                  <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.2rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                      {user.fullName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                      {user.email}
                    </div>
                    {isAdmin && (
                      <div style={{ marginTop: '0.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                        <Shield size={10} /> ADMIN
                      </div>
                    )}
                    {stats && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>🏆</span>
                        <span>{stats.solvedProblemsCount} problems solved</span>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.8125rem',
                        color: '#60a5fa',
                        textDecoration: 'none',
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                        transition: 'color var(--transition-fast), background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.18)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
                      }}
                    >
                      <Shield size={14} style={{ color: '#60a5fa' }} />
                      <span>Problem Studio (Admin)</span>
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast), background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <User size={14} style={{ color: 'var(--accent-cyan)' }} />
                    <span>My Profile & History</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: '0.8125rem',
                      color: 'var(--verdict-wa)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(251,113,133,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                id="navbar-signin-btn"
                onClick={() => openAuthModal('login')}
                className="btn btn-outline"
                style={{ padding: '0.35rem 0.875rem', fontSize: '0.8125rem' }}
              >
                Sign In
              </button>
              <button
                id="navbar-signup-btn"
                onClick={() => openAuthModal('register')}
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.875rem', fontSize: '0.8125rem' }}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
