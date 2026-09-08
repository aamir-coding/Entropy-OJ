import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import { SPRING_PRESS } from '../../lib/ease';

export interface CopyButtonProps {
  text: string;
  className?: string;
  size?: number;
  label?: string;
  onCopy?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className,
  size = 14,
  label,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      if (onCopy) onCopy();

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.warn('Clipboard write failed', err);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      whileTap={SPRING_PRESS}
      className={cn('motion-copy-btn', copied && 'copied', className)}
      title={copied ? 'Copied to clipboard' : 'Copy code'}
      aria-label={copied ? 'Copied' : 'Copy'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--verdict-ac)' }}
          >
            <Check size={size} />
            {label && <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Copied!</span>}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Copy size={size} />
            {label && <span style={{ fontSize: '0.75rem' }}>{label}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
