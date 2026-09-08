import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react';
import { cn } from '../../lib/cn';

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  tiltIntensity?: number; // default 10
  glareOpacity?: number; // default 0.15
  bordered?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  containerClassName,
  containerStyle,
  tiltIntensity = 10,
  glareOpacity = 0.15,
  bordered = true,
  style,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse coordinates mapped to [-0.5, 0.5] range
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Glare position coordinates in percentage
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  // Dynamic glare background template
  const glareBackground = useMotionTemplate`radial-gradient(circle 350px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4), transparent 80%)`;

  // Spring physics for buttery organic rotation
  const springConfig = { damping: 20, stiffness: 220, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]), springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = x / width - 0.5;
    const normalizedY = y / height - 0.5;

    mouseX.set(normalizedX);
    mouseY.set(normalizedY);

    glareX.set((x / width) * 100);
    glareY.set((y / height) * 100);
  }, [mouseX, mouseY, glareX, glareY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      style={{ perspective: 1200, ...containerStyle }}
      className={cn('w-full', containerClassName)}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          ...style,
        }}
        className={cn(
          'relative rounded-2xl overflow-hidden transition-shadow duration-300',
          bordered && 'border border-[var(--border-subtle)]',
          className
        )}
        {...(props as any)}
      >
        {children}

        {/* Dynamic Specular Glare Sheen following cursor */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? glareOpacity : 0,
            background: glareBackground,
          }}
        />
      </motion.div>
    </div>
  );
};
