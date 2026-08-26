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
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          styleClass: 'accepted',
          label: 'Accepted',
        };
      case Verdicts.WRONG_ANSWER:
        return {
          icon: <XCircle className="w-4 h-4 text-rose-400" />,
          styleClass: 'wrong-answer',
          label: 'Wrong Answer',
        };
      case Verdicts.TIME_LIMIT_EXCEEDED:
        return {
          icon: <Clock className="w-4 h-4 text-amber-400" />,
          styleClass: 'time-limit-exceeded',
          label: 'Time Limit Exceeded',
        };
      case Verdicts.MEMORY_LIMIT_EXCEEDED:
        return {
          icon: <HardDrive className="w-4 h-4 text-pink-400" />,
          styleClass: 'memory-limit-exceeded',
          label: 'Memory Limit Exceeded',
        };
      case Verdicts.RUNTIME_ERROR:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          styleClass: 'runtime-error',
          label: 'Runtime Error',
        };
      case Verdicts.COMPILATION_ERROR:
        return {
          icon: <FileCode className="w-4 h-4 text-rose-400" />,
          styleClass: 'compilation-error',
          label: 'Compilation Error',
        };
      case Verdicts.INTERNAL_ERROR:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          styleClass: 'internal-error',
          label: 'Internal Error',
        };
      case Verdicts.PENDING:
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-sky-400" />,
          styleClass: 'pending',
          label: 'Running...',
        };
      default:
        return {
          icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
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
