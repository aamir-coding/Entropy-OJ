import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LoginForm, type LoginStatus, type LoginValues } from './motion/login-form';
import { SignUpForm, type SignUpStatus, type SignUpValues } from './motion/signup-form';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register } = useAuth();

  // Login form status & error
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Animated Register form status & error
  const [registerStatus, setRegisterStatus] = useState<SignUpStatus>('idle');
  const [registerError, setRegisterError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetFields = () => {
    setLoginError(null);
    setRegisterError(null);
    setLoginStatus('idle');
    setRegisterStatus('idle');
  };

  const handleClose = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    resetFields();
    closeAuthModal();
  };

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  // Keyboard accessibility and focus trap (Issue M-5)
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
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
    const timer = setTimeout(() => {
      const firstInput = modalRef.current?.querySelector<HTMLElement>('input');
      firstInput?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isAuthModalOpen, authModalMode]);

  // Click outside backdrop to close
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleBackdropClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleBackdropClick);
    return () => document.removeEventListener('mousedown', handleBackdropClick);
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    resetFields();
    openAuthModal(newMode);
  };

  const handleLoginSubmit = async (values: LoginValues) => {
    setLoginError(null);
    setLoginStatus('loading');

    try {
      await login({ email: values.email, password: values.password });
      setLoginStatus('success');
      // High 1: Delay modal dismissal so the success animation can render
      dismissTimerRef.current = setTimeout(() => {
        handleClose();
      }, 400);
    } catch (err: any) {
      setLoginStatus('error');
      // High 3: Handle string backend error directly
      const backendError = err.response?.data?.error;
      const msg =
        (typeof backendError === 'string' ? backendError : backendError?.message) ||
        err.message ||
        'Authentication failed';
      setLoginError(msg);
      throw err;
    }
  };

  const handleRegisterSubmit = async (values: SignUpValues) => {
    setRegisterError(null);
    setRegisterStatus('loading');

    try {
      await register({
        fullName: values.name,
        email: values.email,
        password: values.password,
      });
      setRegisterStatus('success');
      // High 1: Delay modal dismissal so the success animation can render
      dismissTimerRef.current = setTimeout(() => {
        handleClose();
      }, 500);
    } catch (err: any) {
      setRegisterStatus('error');
      // High 3: Handle string backend error directly
      const backendError = err.response?.data?.error;
      const msg =
        (typeof backendError === 'string' ? backendError : backendError?.message) ||
        err.message ||
        'Registration failed. Please try again.';
      setRegisterError(msg);
      throw err;
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#080808',
          }}
        >
          <div>
            <h2 id="auth-modal-title" style={{ fontSize: '1.125rem', fontWeight: 500, letterSpacing: '-0.03em', color: 'var(--brand-white)' }}>
              {authModalMode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {authModalMode === 'login' ? 'Sign in to track your progress' : 'Start solving problems today'}
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close authentication modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.25rem',
              borderRadius: 'var(--radius-xs)',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body with Animated Mode Transition */}
        <div className="modal-content-body" style={{ padding: '1.375rem 1.5rem', background: '#050505' }}>
          <AnimatePresence mode="wait" initial={false}>
            {authModalMode === 'register' ? (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <SignUpForm
                  status={registerStatus}
                  errorMessage={registerError || undefined}
                  onSubmit={handleRegisterSubmit}
                  footer={
                    <p>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('login')}
                        className="motion-form-footer-link"
                      >
                        Sign In
                      </button>
                    </p>
                  }
                />
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <LoginForm
                  status={loginStatus}
                  errorMessage={loginError || undefined}
                  onSubmit={handleLoginSubmit}
                  footer={
                    <p>
                      No account?{' '}
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('register')}
                        className="motion-form-footer-link"
                      >
                        Create one
                      </button>
                    </p>
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
