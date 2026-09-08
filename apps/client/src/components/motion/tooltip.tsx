import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/cn';

export interface TooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  delay?: number;
  offset?: number;
  shortcut?: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactElement<any>;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  side = 'top',
  align = 'center',
  delay = 140,
  offset = 6,
  shortcut,
  className,
  disabled = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; actualSide: 'top' | 'bottom' | 'left' | 'right' }>({
    top: 0,
    left: 0,
    actualSide: side,
  });

  const triggerRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let computedSide = side;
    // Boundary flipping if close to viewport edges
    if (side === 'top' && rect.top < 40) computedSide = 'bottom';
    else if (side === 'bottom' && rect.bottom > window.innerHeight - 40) computedSide = 'top';
    else if (side === 'left' && rect.left < 80) computedSide = 'right';
    else if (side === 'right' && rect.right > window.innerWidth - 80) computedSide = 'left';

    let top = 0;
    let left = 0;

    if (computedSide === 'top') {
      top = rect.top + scrollY - offset;
      left =
        align === 'start'
          ? rect.left + scrollX
          : align === 'end'
          ? rect.right + scrollX
          : rect.left + rect.width / 2 + scrollX;
    } else if (computedSide === 'bottom') {
      top = rect.bottom + scrollY + offset;
      left =
        align === 'start'
          ? rect.left + scrollX
          : align === 'end'
          ? rect.right + scrollX
          : rect.left + rect.width / 2 + scrollX;
    } else if (computedSide === 'left') {
      top = rect.top + rect.height / 2 + scrollY;
      left = rect.left + scrollX - offset;
    } else {
      // right
      top = rect.top + rect.height / 2 + scrollY;
      left = rect.right + scrollX + offset;
    }

    setCoords({ top, left, actualSide: computedSide });
  }, [side, align, offset]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Call original handler if present
    if (children.props.onMouseEnter) {
      children.props.onMouseEnter(e);
    }
    if (disabled || !content) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, delay);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (children.props.onMouseLeave) {
      children.props.onMouseLeave(e);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(false);
  };

  const handleFocus = (e: React.FocusEvent) => {
    if (children.props.onFocus) {
      children.props.onFocus(e);
    }
    if (disabled || !content) return;
    calculatePosition();
    setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (children.props.onBlur) {
      children.props.onBlur(e);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (children.props.onClick) {
      children.props.onClick(e);
    }
    // Dismiss on click (action triggered)
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(false);
  };

  // Close immediately on scroll or resize to prevent detached floating tooltips (High 4)
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => {
      setIsOpen(false);
    };
    // High 4: capture: true is required because scroll events on overflow containers do not bubble
    window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true } as any);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Determine transform offset based on side and align
  const getTransformOrigin = () => {
    if (coords.actualSide === 'top') {
      return align === 'center' ? '50% 100%' : align === 'start' ? '0% 100%' : '100% 100%';
    }
    if (coords.actualSide === 'bottom') {
      return align === 'center' ? '50% 0%' : align === 'start' ? '0% 0%' : '100% 0%';
    }
    if (coords.actualSide === 'left') {
      return '100% 50%';
    }
    return '0% 50%';
  };

  const getTranslate = () => {
    if (coords.actualSide === 'top') {
      return align === 'center' ? 'translate(-50%, -100%)' : align === 'start' ? 'translate(0%, -100%)' : 'translate(-100%, -100%)';
    }
    if (coords.actualSide === 'bottom') {
      return align === 'center' ? 'translate(-50%, 0%)' : align === 'start' ? 'translate(0%, 0%)' : 'translate(-100%, 0%)';
    }
    if (coords.actualSide === 'left') {
      return 'translate(-100%, -50%)';
    }
    return 'translate(0%, -50%)';
  };

  const initialOffset = coords.actualSide === 'top' ? 3 : coords.actualSide === 'bottom' ? -3 : 0;
  const initialOffsetX = coords.actualSide === 'left' ? 3 : coords.actualSide === 'right' ? -3 : 0;

  // Clone child with merged ref and event handlers
  const clonedChild = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      // Low 1: In React 19, ref was relocated from element.ref to element.props.ref
      const childRef = (children.props as any)?.ref || (children as any).ref;
      if (typeof childRef === 'function') {
        childRef(node);
      } else if (childRef && 'current' in childRef) {
        childRef.current = node;
      }
    },
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onClick: handleClick,
  } as any);

  return (
    <>
      {clonedChild}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && content && (
              <div
                style={{
                  position: 'absolute',
                  top: coords.top,
                  left: coords.left,
                  transform: getTranslate(),
                  transformOrigin: getTransformOrigin(),
                  zIndex: 99999,
                  pointerEvents: 'none',
                }}
              >
                <motion.div
                  role="tooltip"
                  initial={{
                    opacity: 0,
                    scale: 0.94,
                    y: initialOffset,
                    x: initialOffsetX,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                    transition: { duration: 0.1, ease: 'easeOut' },
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                    mass: 0.5,
                  }}
                  className={cn(className)}
                  style={{
                    background: 'rgba(12, 12, 12, 0.95)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.8), 0 2px 6px -1px rgba(0, 0, 0, 0.5)',
                    color: 'var(--brand-white)',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.28rem 0.6rem',
                    borderRadius: '5px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    lineHeight: 1.3,
                  }}
                >
                  <span>{content}</span>

                  {/* Optional Keyboard Shortcut Badge */}
                  {shortcut && (
                    <kbd
                      style={{
                        fontSize: '0.64rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.08rem 0.32rem',
                        borderRadius: '3px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.02em',
                        lineHeight: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {shortcut}
                    </kbd>
                  )}

                  {/* Directional Indicator Pip (Arrow) */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '6px',
                      height: '6px',
                      background: 'rgba(12, 12, 12, 0.95)',
                      borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                      transform: 'rotate(45deg)',
                      pointerEvents: 'none',
                      ...(coords.actualSide === 'top' && {
                        bottom: '-3px',
                        left: '50%',
                        marginLeft: '-3px',
                        borderTop: 'none',
                        borderLeft: 'none',
                      }),
                      ...(coords.actualSide === 'bottom' && {
                        top: '-3px',
                        left: '50%',
                        marginLeft: '-3px',
                        borderRight: 'none',
                        borderBottom: 'none',
                        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
                      }),
                      ...(coords.actualSide === 'left' && {
                        right: '-3px',
                        top: '50%',
                        marginTop: '-3px',
                        borderLeft: 'none',
                        borderBottom: 'none',
                        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                      }),
                      ...(coords.actualSide === 'right' && {
                        left: '-3px',
                        top: '50%',
                        marginTop: '-3px',
                        borderTop: 'none',
                        borderRight: 'none',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                      }),
                    }}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
