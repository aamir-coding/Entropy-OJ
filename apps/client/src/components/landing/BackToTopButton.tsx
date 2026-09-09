import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';

export interface BackToTopButtonProps {
  onScrollToTop?: () => void;
  className?: string;
}

export const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  onScrollToTop,
  className,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [translateY, setTranslateY] = useState(14);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateVisibility = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      // Start appearing when button top enters viewport, fully visible at vh - 130px or when hitting the bottom
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll =
        Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - vh;
      const isAtBottom = maxScroll > 50 && scrollY >= maxScroll - 30;

      if (isAtBottom) {
        setOpacity(1);
        setTranslateY(0);
        return;
      }

      const enterDistance = vh - rect.top;
      if (enterDistance <= 0) {
        setOpacity(0);
        setTranslateY(14);
      } else {
        const progress = Math.min(1, Math.max(0, enterDistance / 130));
        setOpacity(progress);
        setTranslateY(Math.round((1 - progress) * 14));
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateVisibility();
    const timer = setTimeout(updateVisibility, 150);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleClick = () => {
    if (onScrollToTop) {
      onScrollToTop();
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const isClickable = opacity > 0.15;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Back to top"
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.55rem 1.1rem',
        backgroundColor:
          isHovered && isClickable
            ? 'rgba(25, 25, 25, 0.95)'
            : 'rgba(12, 12, 12, 0.85)',
        border: `1px solid ${
          isHovered && isClickable
            ? 'rgba(255, 255, 255, 0.38)'
            : 'rgba(255, 255, 255, 0.18)'
        }`,
        borderRadius: '9999px',
        color: '#f7f7f7',
        cursor: isClickable ? 'pointer' : 'default',
        pointerEvents: isClickable ? 'auto' : 'none',
        boxShadow:
          isHovered && isClickable
            ? '0 12px 30px -4px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 255, 255, 0.15)'
            : '0 8px 24px -4px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        fontFamily: "var(--font-sans, 'Inter', sans-serif)",
        fontSize: '0.78rem',
        fontWeight: 500,
        letterSpacing: '0.02em',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        opacity,
        transform: `translateY(${
          translateY + (isHovered && isClickable ? -2 : 0)
        }px)`,
        transition:
          'opacity 150ms ease-out, transform 150ms ease-out, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
        userSelect: 'none',
      }}
    >
      <ArrowUp size={13} style={{ color: '#ffffff' }} />
      <span>Back to Top</span>
    </button>
  );
};


