import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  LogOut,
  ChevronDown,
  Shield,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, stats, isAdmin, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Active route tracking for the underline indicator
  const isHome = location.pathname === '/';
  const isProblems = location.pathname.startsWith('/problems') || location.pathname.startsWith('/problem');
  const isGalaxy = location.pathname === '/galaxy';

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

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-faint)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="container"
        style={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* ── Left Section: Navigation Links (Home, Problems, Galaxy) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', justifySelf: 'start' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link
              to="/"
              className={`navbar-nav-link ${isHome ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/problems"
              className={`navbar-nav-link ${isProblems ? 'active' : ''}`}
            >
              Problems
            </Link>
            <Link
              to="/galaxy"
              className={`navbar-nav-link ${isGalaxy ? 'active' : ''}`}
            >
              Galaxy
            </Link>
          </nav>
        </div>

        {/* ── Center Section: Brand (Centered in Header) ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
          <Link
            to="/"
            aria-label="Entropy Homepage"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textDecoration: 'none',
              transition: 'opacity var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <img
              src="/logo.png"
              alt="Entropy Logo"
              style={{
                width: isHome ? '34px' : '26px',
                height: isHome ? '34px' : '26px',
                objectFit: 'contain',
                display: 'block',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))',
                transition: 'all var(--transition-fast)',
              }}
            />

            {!isHome && (
              <span
                style={{
                  fontFamily: "'Inter', 'Outfit', sans-serif",
                  fontWeight: 200,
                  fontSize: '0.95rem',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  color: '#f7f7f7',
                  background: 'linear-gradient(270deg, rgba(247,247,247,0.65) 0%, #f7f7f7 30%, #f7f7f7 70%, rgba(247,247,247,0.65) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1,
                  userSelect: 'none',
                  paddingLeft: '0.15em',
                }}
              >
                ENTROPY
              </span>
            )}
          </Link>
        </div>

        {/* ── Right Section: Profile & Auth Buttons ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', justifySelf: 'end' }}>
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
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.25rem 0.6rem 0.25rem 0.35rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--brand-neutral-600)',
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--brand-white)',
                    flexShrink: 0,
                  }}
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{user.fullName.split(' ')[0]}</span>
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
                    borderRadius: 'var(--radius-sm)',
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
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.8125rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-medium)',
                        transition: 'color var(--transition-fast), background-color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.borderColor = 'var(--border-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                        e.currentTarget.style.borderColor = 'var(--border-medium)';
                      }}
                    >
                      <Shield size={14} style={{ color: 'var(--brand-neutral-200)' }} />
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
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast), background-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <User size={14} style={{ color: 'var(--brand-neutral-200)' }} />
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
                      borderRadius: 'var(--radius-xs)',
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
