// beui.dev/components/motion/bounce-sidebar
import React, {
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { cn } from '../../lib/cn';

export interface BounceSidebarItem {
  id: string;
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  disabled?: boolean;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
}

export interface BounceSidebarProps {
  items: BounceSidebarItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
  listClassName?: string;
  itemClassName?: string;
  indicatorClassName?: string;
}

const DOT_SIZE = 5;

/**
 * Calculates smooth parabolic outward lateral arc for the bouncing dot.
 * Uses a half-sine curve with a gentle exponent (1.2) for a soft takeoff,
 * graceful apex at the midpoint, and silky touchdown at the landing target.
 */
function calculateArcWeight(flightProgress: number): number {
  if (flightProgress <= 0 || flightProgress >= 1) return 0;
  return Math.pow(Math.sin(Math.PI * flightProgress), 1.2);
}

export const BounceSidebar: React.FC<BounceSidebarProps> = ({
  items,
  value,
  defaultValue,
  onValueChange,
  ariaLabel = 'Sidebar navigation',
  className,
  listClassName,
  itemClassName,
  indicatorClassName,
}) => {
  const reduce = useReducedMotion();
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? items[0]?.id ?? ''
  );
  const requestedValue = value ?? internalValue;
  const selectedValue = items.some((item) => item.id === requestedValue)
    ? requestedValue
    : (items[0]?.id ?? '');
  const selectedIndex = items.findIndex((item) => item.id === selectedValue);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const selectedValueRef = useRef(selectedValue);
  const previousIndexRef = useRef(selectedIndex);
  const hasPositionRef = useRef(false);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  selectedValueRef.current = selectedValue;

  const snapIndicator = useCallback(() => {
    const selectedItem = itemRefs.current.get(selectedValueRef.current);
    if (!selectedItem) return;

    animationRef.current?.stop();
    x.set(0);
    y.set(
      selectedItem.offsetTop + (selectedItem.offsetHeight - DOT_SIZE) / 2
    );
    hasPositionRef.current = true;
  }, [x, y]);

  const positionIndicator = useCallback(
    (shouldAnimate: boolean) => {
      const selectedItem = itemRefs.current.get(selectedValue);
      if (!selectedItem) return;

      const destinationY =
        selectedItem.offsetTop + (selectedItem.offsetHeight - DOT_SIZE) / 2;

      animationRef.current?.stop();

      if (!hasPositionRef.current || reduce || !shouldAnimate) {
        x.set(0);
        y.set(destinationY);
        hasPositionRef.current = true;
        previousIndexRef.current = selectedIndex;
        return;
      }

      const startY = y.get();
      const startX = x.get();
      const distance = destinationY - startY;
      const travel = Math.abs(distance);

      if (travel < 1.5) {
        x.set(0);
        y.set(destinationY);
        previousIndexRef.current = selectedIndex;
        return;
      }

      // Proportional travel factor: 0 for 1 adjacent step (~35px), scaling up to 1 for long jumps (~145px)
      const longFactor = Math.min(1, Math.max(0, (travel - 35) / 110));

      // Dynamic duration: 0.44s for adjacent sections, smoothly extending up to 0.74s for far away jumps
      // (e.g. Sandboxing to Architecture) so the dot gracefully tracks alongside the page scroll
      const duration = 0.44 + 0.30 * longFactor;

      // Soft, elastic bounce: 0.22 for snappy short hops, gently cushioning down to 0.16 for long jumps
      const bounce = 0.22 - 0.06 * longFactor;

      // Lateral outward arc: -11px for adjacent steps, widening gracefully to -20px for far away jumps
      const arcPeakX = -(11 + 9 * longFactor);

      animationRef.current = animate(0, 1, {
        type: 'spring',
        duration,
        bounce,
        onUpdate: (progress) => {
          // Flight progress clamped between 0 and 1
          const flightP = Math.min(1, Math.max(0, progress));
          const arcWeight = calculateArcWeight(flightP);

          // If interrupted mid-flight, startX smoothly blends towards 0
          const baselineX = startX * (1 - flightP);
          x.set(baselineX + arcPeakX * arcWeight);

          // Vertical motion tracks the spring's physical progress, including subtle cushion bounce
          y.set(startY + distance * progress);
        },
        onComplete: () => {
          x.set(0);
          y.set(destinationY);
        },
      });

      previousIndexRef.current = selectedIndex;
    },
    [reduce, selectedIndex, selectedValue, x, y]
  );

  useLayoutEffect(() => {
    const selectedItem = itemRefs.current.get(selectedValue);
    if (!selectedItem) return;

    const destinationY =
      selectedItem.offsetTop + (selectedItem.offsetHeight - DOT_SIZE) / 2;

    if (!hasPositionRef.current) {
      x.set(0);
      y.set(destinationY);
      hasPositionRef.current = true;
      previousIndexRef.current = selectedIndex;
      return;
    }

    if (previousIndexRef.current !== selectedIndex) {
      positionIndicator(true);
    }
  }, [positionIndicator, selectedIndex, selectedValue, x, y]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(snapIndicator);
    observer.observe(list);
    return () => observer.disconnect();
  }, [snapIndicator]);

  useLayoutEffect(
    () => () => {
      animationRef.current?.stop();
    },
    []
  );

  const selectItem = (id: string) => {
    if (value === undefined) setInternalValue(id);
    onValueChange?.(id);
  };

  return (
    <nav aria-label={ariaLabel} className={cn('relative select-none', className)}>
      <ul
        ref={listRef}
        style={{
          listStyle: 'none',
          listStyleType: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          position: 'relative',
        }}
        className={listClassName}
      >
        {/* The single active animated bouncing dot */}
        {selectedIndex >= 0 ? (
          <li
            aria-hidden="true"
            role="presentation"
            style={{
              listStyle: 'none',
              listStyleType: 'none',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            <motion.span
              style={{
                x,
                y,
                position: 'absolute',
                top: 0,
                left: '4px',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.95), 0 0 2px #ffffff',
                pointerEvents: 'none',
              }}
              className={indicatorClassName}
            />
          </li>
        ) : null}

        {items.map((item) => {
          const active = item.id === selectedValue;
          const interactiveStyle: React.CSSProperties = {
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '0.3rem 0.6rem 0.3rem 22px', // 22px left padding guarantees dot is always to the left of text
            cursor: item.disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            display: 'inline-flex',
            alignItems: 'center',
            color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
            fontSize: '0.78rem',
            fontWeight: active ? 500 : 400,
            fontFamily: "var(--font-sans, 'Inter', sans-serif)",
            letterSpacing: '0.03em',
            transition: 'color 160ms ease',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            opacity: item.disabled ? 0.4 : 1,
            position: 'relative',
          };

          return (
            <li
              key={item.id}
              ref={(node) => {
                if (node) itemRefs.current.set(item.id, node);
                else itemRefs.current.delete(item.id);
              }}
              style={{
                listStyle: 'none',
                listStyleType: 'none',
                position: 'relative',
                margin: 0,
                padding: 0,
              }}
            >
              {item.href ? (
                <a
                  href={item.href}
                  target={item.target}
                  rel={
                    item.rel ??
                    (item.target === '_blank' ? 'noreferrer noopener' : undefined)
                  }
                  aria-current={active ? 'page' : undefined}
                  aria-disabled={item.disabled || undefined}
                  data-active={active ? 'true' : 'false'}
                  tabIndex={item.disabled ? -1 : undefined}
                  onClick={(event) => {
                    if (item.disabled) {
                      event.preventDefault();
                      return;
                    }
                    selectItem(item.id);
                  }}
                  style={interactiveStyle}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                  className={itemClassName}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      color: 'inherit',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled={item.disabled}
                  aria-current={active ? 'page' : undefined}
                  data-active={active ? 'true' : 'false'}
                  onClick={() => selectItem(item.id)}
                  style={interactiveStyle}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                  className={itemClassName}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      color: 'inherit',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
