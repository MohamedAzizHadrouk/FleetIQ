import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  size?: 'default' | 'compact';
  className?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function ModalHeader({
  title,
  subtitle,
  icon,
  onClose,
  size = 'default',
  className,
  children,
  actions,
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        'bg-primary flex items-center justify-between flex-shrink-0',
        size === 'compact' ? 'px-5 py-3.5' : 'px-6 py-4',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-primary-foreground truncate">{title}</h2>
          {subtitle && (
            <p className="text-sm text-primary-foreground/80 truncate">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <button
        type="button"
        onClick={onClose}
        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors shrink-0"
        aria-label="Fermer"
      >
        <X className="w-5 h-5 text-primary-foreground" />
      </button>
      </div>
    </div>
  );
}
