import { cn } from '@/lib/utils';
import type { TopCriticalAlertBar } from '../../mocks/mockBiKpis';

interface TopCriticalAlertsBiCardProps {
  bars: TopCriticalAlertBar[];
  topLabel: string;
  topCount: number;
  className?: string;
}

export function TopCriticalAlertsBiCard({
  bars,
  topLabel,
  topCount,
  className,
}: TopCriticalAlertsBiCardProps) {
  return (
    <div
      className={cn(
        'flex min-w-[230px] flex-[1.15] flex-col rounded-[14px] border bg-white p-[18px_20px]',
        className
      )}
      style={{ borderColor: '#E5E7EB' }}
    >
      <div>
        <div className="text-[12.5px] font-bold" style={{ color: '#1E293B' }}>
          Alertes critiques les plus fréquentes
        </div>
        <div className="mt-0.5 text-[11px]" style={{ color: '#94A3B8' }}>
          Top 6 · 30 derniers jours
        </div>
      </div>
      <div className="mt-3.5">
        {bars.map((bar) => (
          <div key={bar.label} className="mb-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <span
                className="truncate text-[10.5px] font-semibold"
                style={{ color: '#475569' }}
              >
                {bar.rank}. {bar.label}
              </span>
              <span className="whitespace-nowrap text-[10.5px] font-bold" style={{ color: '#DC2626' }}>
                {bar.count}
              </span>
            </div>
            <div className="mt-1 h-2 rounded-[5px]" style={{ background: '#FEE2E2' }}>
              <div
                className="h-full rounded-[5px]"
                style={{ width: `${bar.w}%`, background: '#DC2626' }}
              />
            </div>
          </div>
        ))}
        <div
          className="mt-1.5 border-t border-dashed pt-2 text-[10.5px] leading-relaxed"
          style={{ borderColor: '#E5E7EB', color: '#64748B' }}
        >
          {topLabel} · {topCount} occurrence(s) sur la période
        </div>
      </div>
    </div>
  );
}
