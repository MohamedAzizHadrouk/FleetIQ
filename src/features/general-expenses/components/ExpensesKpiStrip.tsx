import { cn } from '@/lib/utils';
import { formatDelta } from '../lib/format';
import type { KpiItem } from '../types';

interface ExpensesKpiStripProps {
  items: KpiItem[];
  onAction?: (kind: 'sub' | 'ent', value: string) => void;
}

export function ExpensesKpiStrip({ items, onAction }: ExpensesKpiStripProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((kpi) => {
        const clickable = Boolean(kpi.action);
        const delta =
          kpi.deltaPct !== undefined ? formatDelta(kpi.deltaPct) : null;
        return (
          <button
            key={kpi.id}
            type="button"
            disabled={!clickable}
            onClick={() => {
              if (kpi.action) onAction?.(kpi.action.kind, kpi.action.value);
            }}
            className={cn(
              'rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-colors',
              clickable
                ? 'cursor-pointer hover:border-slate-300 hover:bg-slate-50/80'
                : 'cursor-default'
            )}
          >
            <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {delta ? (
                <>
                  <span
                    className={cn(
                      'font-medium',
                      delta.up ? 'text-orange-700' : 'text-green-700'
                    )}
                  >
                    {delta.text}
                  </span>
                  <span className="text-slate-400"> vs N-1</span>
                </>
              ) : (
                kpi.detail
              )}
            </p>
          </button>
        );
      })}
    </div>
  );
}
