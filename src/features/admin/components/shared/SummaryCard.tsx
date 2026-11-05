import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SummaryVariant = 'default' | 'success' | 'info';

interface SummaryCardProps {
  label: string;
  value: number | string;
  variant?: SummaryVariant;
  icon?: ReactNode;
}

const valueClass: Record<SummaryVariant, string> = {
  default: 'text-slate-800 dark:text-slate-100',
  success: 'text-emerald-600 dark:text-emerald-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export function SummaryCard({
  label,
  value,
  variant = 'default',
  icon,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className={cn('mt-2 text-3xl font-bold', valueClass[variant])}>{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
