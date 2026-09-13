import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  forwardRef,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "../../../lib/ease";
import { useHoverCapable } from "../../../lib/hooks/use-hover-capable";
import { cn } from "../../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  /** Spawn a ripple from the press point. Off by default. */
  ripple?: boolean;
  children?: ReactNode;
}

export interface ButtonLinkProps extends Omit<
  HTMLMotionProps<"a">,
  "children"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  children?: ReactNode;
}

type Ripple = { id: number; x: number; y: number; size: number };

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "motion-btn-primary",
  secondary: "motion-btn-secondary",
  ghost: "motion-btn-ghost",
  outline: "motion-btn-outline",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "motion-btn-sm",
  md: "motion-btn-md",
  lg: "motion-btn-lg",
  icon: "motion-btn-icon",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      pressScale = 0.94,
      ripple = false,
      className,
      children,
      onPointerDown,
      whileHover,
      ...rest
    },
    ref,
  ) {
    const reduce = useReducedMotion();
    const canHover = useHoverCapable();
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const nextId = useRef(0);

    const handlePointerDown = useCallback(
      (event: PointerEvent<HTMLButtonElement>) => {
        if (ripple && !reduce) {
          const rect = event.currentTarget.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height) * 2;
          const id = nextId.current++;
          setRipples((prev) => [
            ...prev,
            {
              id,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              size,
            },
          ]);
        }
        onPointerDown?.(event);
      },
      [ripple, reduce, onPointerDown],
    );

    return (
      <motion.button
        ref={ref}
        type="button"
        whileTap={reduce || rest.disabled ? undefined : { scale: pressScale }}
        whileHover={whileHover !== undefined ? whileHover : (reduce || !canHover || rest.disabled ? undefined : { scale: 1.01 })}
        transition={SPRING_PRESS}
        onPointerDown={handlePointerDown}
        className={cn(
          "motion-btn",
          ripple && "motion-btn-ripple-container",
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          className,
        )}
        {...rest}
      >
        {ripple && !reduce ? (
          <span className="motion-btn-ripple-wrapper">
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  className="motion-btn-ripple"
                  style={{
                    left: r.x,
                    top: r.y,
                    width: r.size,
                    height: r.size,
                    x: "-50%",
                    y: "-50%",
                  }}
                  initial={{ scale: 0.05, opacity: 0.3 }}
                  animate={{ scale: 1, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: EASE_OUT }}
                  onAnimationComplete={() =>
                    setRipples((prev) => prev.filter((x) => x.id !== r.id))
                  }
                />
              ))}
            </AnimatePresence>
          </span>
        ) : null}
        {children}
      </motion.button>
    );
  },
);

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink(
    {
      variant = "primary",
      size = "md",
      pressScale = 0.94,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const reduce = useReducedMotion();
    const canHover = useHoverCapable();

    return (
      <motion.a
        ref={ref}
        whileTap={reduce ? undefined : { scale: pressScale }}
        whileHover={reduce || !canHover ? undefined : { scale: 1.01 }}
        transition={SPRING_PRESS}
        className={cn(
          "motion-btn",
          VARIANT_CLASS[variant],
          SIZE_CLASS[size],
          className,
        )}
        {...rest}
      >
        {children}
      </motion.a>
    );
  },
);
