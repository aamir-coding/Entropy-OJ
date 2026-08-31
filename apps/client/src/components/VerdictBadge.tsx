import React from 'react';
import { Verdict, Verdicts } from '@anti-oj/shared';
import {
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  AlertTriangle,
  FileCode,
  Loader2,
  HelpCircle,
} from 'lucide-react';

interface VerdictBadgeProps {
  verdict: Verdict | string;
  showIcon?: boolean;
  className?: string;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  showIcon = true,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (verdict) {
      case Verdicts.ACCEPTED:
        return {
          icon: <CheckCircle2 size={14} style={{ color: 'var(--verdict-ac)' }} />,
          styleClass: 'accepted',
          label: 'Accepted',
        };
      case Verdicts.WRONG_ANSWER:
        return {
          icon: <XCircle size={14} style={{ color: 'var(--verdict-wa)' }} />,
          styleClass: 'wrong-answer',
          label: 'Wrong Answer',
        };
      case Verdicts.TIME_LIMIT_EXCEEDED:
        return {
          icon: <Clock size={14} style={{ color: 'var(--verdict-tle)' }} />,
          styleClass: 'time-limit-exceeded',
          label: 'Time Limit Exceeded',
        };
      case Verdicts.MEMORY_LIMIT_EXCEEDED:
        return {
          icon: <HardDrive size={14} style={{ color: 'var(--verdict-mle)' }} />,
          styleClass: 'memory-limit-exceeded',
          label: 'Memory Limit Exceeded',
        };
      case Verdicts.RUNTIME_ERROR:
        return {
          icon: <AlertTriangle size={14} style={{ color: 'var(--verdict-rte)' }} />,
          styleClass: 'runtime-error',
          label: 'Runtime Error',
        };
      case Verdicts.COMPILATION_ERROR:
        return {
          icon: <FileCode size={14} style={{ color: 'var(--verdict-ce)' }} />,
          styleClass: 'compilation-error',
          label: 'Compilation Error',
        };
      case Verdicts.INTERNAL_ERROR:
        return {
          icon: <AlertTriangle size={14} style={{ color: 'var(--verdict-ie)' }} />,
          styleClass: 'internal-error',
          label: 'Internal Error',
        };
      case Verdicts.PENDING:
        return {
          icon: (
            <span className="animate-spin" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Loader2 size={14} style={{ color: 'var(--verdict-pending)' }} />
            </span>
          ),
          styleClass: 'pending',
          label: 'Running...',
        };
      default:
        return {
          icon: <HelpCircle size={14} style={{ color: 'var(--text-muted)' }} />,
          styleClass: 'unknown',
          label: verdict || 'Unknown',
        };
    }
  };

  const { icon, styleClass, label } = getBadgeConfig();

  return (
    <span className={`verdict-chip ${styleClass} ${className}`}>
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};
