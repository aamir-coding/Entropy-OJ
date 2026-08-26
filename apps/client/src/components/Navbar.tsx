import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  User,
  LogOut,
  ChevronDown,
  Terminal,
  Activity,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, stats, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
              }}
            >
              <Code2 size={20} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>
                ANTI<span style={{ color: 'var(--accent-cyan)' }}>_OJ</span>
              </span>
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: '0.5rem',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.4rem',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-cyan)',
                  borderRadius: '4px',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  textTransform: 'uppercase',
                }}
              >
                v1.0 sandbox
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textDecoration: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Terminal size={15} className="text-sky-400" />
              <span>Problems</span>
            </Link>
          </nav>
        </div>

        {/* Right Section: System Status & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Judge Status Pulse */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.75rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#34d399',
            }}
          >
            <Activity size={12} className="animate-pulse" />
            <span>Judge Online</span>
          </div>

          {/* User Auth state */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                id="user-profile-menu-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.3rem 0.75rem 0.3rem 0.4rem',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                  }}
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.fullName.split(' ')[0]}</span>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '220px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    zIndex: 200,
                  }}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                    {stats && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        🏆 Solved: {stats.solvedProblemsCount} problems
                      </div>
                    )}
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                    }}
                    className="glass-card"
                  >
                    <User size={15} className="text-sky-400" />
                    <span>My Profile & History</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem',
                      color: '#fb7185',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                id="navbar-signin-btn"
                onClick={() => openAuthModal('login')}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.875rem' }}
              >
                Sign In
              </button>
              <button
                id="navbar-signup-btn"
                onClick={() => openAuthModal('register')}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.875rem' }}
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
