import { cn } from '@/lib/utils';
import {
  STATUS_CARD_CLASS,
  STATUS_LABEL_ALL,
  STATUS_RAIL_CLASS,
  STATUS_TEXT_CLASS,
} from '../lib/status-colors';
import type { InsightItem, InsightTone } from '../types';

interface ExpensesInsightsProps {
  items: InsightItem[];
}

const toneMap: Record<InsightTone, 'ok' | 'warn' | 'info'> = {
  warn: 'warn',
  info: 'info',
  ok: 'ok',
};

export function ExpensesInsights({ items }: ExpensesInsightsProps) {
  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        À retenir
      </p>
      <div className="grid gap-2 md:grid-cols-3">
        {items.map((item) => {
          const tone = toneMap[item.tone];
          return (
            <div
              key={`${item.tone}-${item.title}`}
              className={cn(
                'relative overflow-hidden rounded-xl border px-3.5 py-3',
                STATUS_CARD_CLASS[tone]
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 w-1',
                  STATUS_RAIL_CLASS[tone]
                )}
                aria-hidden
              />
              <div className="pl-1.5">
                <span
                  className={cn(
                    'mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-black/5',
                    STATUS_TEXT_CLASS[tone]
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      STATUS_RAIL_CLASS[tone]
                    )}
                  />
                  {STATUS_LABEL_ALL[tone]}
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-slate-600">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
