import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING_LAYOUT } from '../lib/ease';
import { useAuth } from '../context/AuthContext';
import {
  User,
  LogOut,
  ChevronDown,
  Shield,
  Trophy,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, stats, isAdmin, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isProblems = location.pathname.startsWith('/problems') || location.pathname.startsWith('/problem');
  const isGalaxy = location.pathname === '/galaxy';

  // Mobile menu drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open to prevent background text scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
      <div className="container navbar-desktop">
        {/* ── Left Section: Navigation Links (Home, Problems, Galaxy) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', justifySelf: 'start' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link
              to="/"
              className={`navbar-nav-link ${isHome ? 'active' : ''}`}
            >
              <span>Home</span>
              {isHome && (
                <motion.div
                  layoutId="navbar-tab-indicator"
                  className="navbar-sliding-indicator"
                  transition={SPRING_LAYOUT}
                />
              )}
            </Link>
            <Link
              to="/problems"
              className={`navbar-nav-link ${isProblems ? 'active' : ''}`}
            >
              <span>Problems</span>
              {isProblems && (
                <motion.div
                  layoutId="navbar-tab-indicator"
                  className="navbar-sliding-indicator"
                  transition={SPRING_LAYOUT}
                />
              )}
            </Link>
            <Link
              to="/galaxy"
              className={`navbar-nav-link ${isGalaxy ? 'active' : ''}`}
            >
              <span>Galaxy</span>
              {isGalaxy && (
                <motion.div
                  layoutId="navbar-tab-indicator"
                  className="navbar-sliding-indicator"
                  transition={SPRING_LAYOUT}
                />
              )}
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
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, scale: 0.95, y: -6, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, y: -6, filter: 'blur(4px)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
                      transformOrigin: 'top right',
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
                        <div
                          style={{
                            marginTop: '0.45rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(234, 179, 8, 0.08)',
                            border: '1px solid rgba(234, 179, 8, 0.22)',
                            color: '#eab308',
                          }}
                        >
                          <Trophy size={11} style={{ color: '#eab308', flexShrink: 0 }} />
                          <span>
                            <strong style={{ color: '#fef08a', fontWeight: 700 }}>{stats.solvedProblemsCount}</strong>{' '}
                            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>problems solved</span>
                          </span>
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
                  </motion.div>
                )}
              </AnimatePresence>
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

      {/* ── Mobile Header Container (< 768px) ── */}
      <div className="container navbar-mobile">
        {/* Mobile Brand */}
        <Link
          to="/"
          aria-label="Entropy Homepage"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <img
            src="/logo.png"
            alt="Entropy Logo"
            style={{
              width: '24px',
              height: '24px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.2))',
            }}
          />
          <span
            style={{
              fontFamily: "'Inter', 'Outfit', sans-serif",
              fontWeight: 300,
              fontSize: '0.875rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#f7f7f7',
              paddingLeft: '0.15em',
            }}
          >
            ENTROPY
          </span>
        </Link>

        {/* Mobile Right Controls: Auth Profile / Sign In + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {user ? (
            <Link
              to="/profile"
              aria-label="User Profile"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--brand-neutral-600)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--brand-white)',
                textDecoration: 'none',
              }}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}
            >
              Sign In
            </button>
          )}

          <button
            id="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.35rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer (Rendered via Portal to break out of sticky header context) ── */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  className="mobile-nav-drawer-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                />
                <motion.div
                  className="mobile-nav-drawer"
                  style={{
                    backgroundColor: '#000000',
                    background: '#000000',
                  }}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <img src="/logo.png" alt="Logo" style={{ width: '22px', height: '22px' }} />
                      <span style={{ fontWeight: 300, letterSpacing: '0.25em', fontSize: '0.85rem', color: '#f7f7f7' }}>
                        ENTROPY
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Drawer Links */}
                  <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <Link
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`mobile-nav-drawer-link ${isHome ? 'active' : ''}`}
                    >
                      Home
                    </Link>
                    <Link
                      to="/problems"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`mobile-nav-drawer-link ${isProblems ? 'active' : ''}`}
                    >
                      Problems
                    </Link>
                    <Link
                      to="/galaxy"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`mobile-nav-drawer-link ${isGalaxy ? 'active' : ''}`}
                    >
                      Galaxy
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="mobile-nav-drawer-link"
                        style={{ marginTop: '0.5rem' }}
                      >
                        <Shield size={15} style={{ color: 'var(--brand-neutral-200)' }} />
                        <span>Problem Studio (Admin)</span>
                      </Link>
                    )}

                    {user && (
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="mobile-nav-drawer-link"
                        style={{ marginTop: '0.25rem' }}
                      >
                        <User size={15} style={{ color: 'var(--brand-neutral-200)' }} />
                        <span>My Profile & History</span>
                      </Link>
                    )}
                  </nav>

                  {/* Drawer Auth Footer */}
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto' }}>
                    {user ? (
                      <div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 500 }}>
                          {user.fullName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="btn btn-outline"
                          style={{ width: '100%', justifyContent: 'center', color: 'var(--verdict-wa)', borderColor: 'var(--verdict-wa-border)', backgroundColor: '#0d0d0d' }}
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            openAuthModal('login');
                          }}
                          className="btn btn-outline"
                          style={{ width: '100%', backgroundColor: '#0d0d0d' }}
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            openAuthModal('register');
                          }}
                          className="btn btn-primary"
                          style={{ width: '100%' }}
                        >
                          Create Account
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
};
