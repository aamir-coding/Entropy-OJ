import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/cn';

export interface MotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  maxWidth?: string;
}

export const MotionModal: React.FC<MotionModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  style,
  ariaLabel,
  maxWidth = '600px',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-backdrop"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className={cn('modal-content', className)}
            style={{ maxWidth, width: '90%', ...style }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
