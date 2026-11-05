import { cn } from '@/lib/utils';
import type { AlertSplitBar } from '../../mocks/mockBiKpis';

interface AlertSplitBiCardProps {
  bars: AlertSplitBar[];
  total: number;
  topShare: number;
  className?: string;
}

export function AlertSplitBiCard({
  bars,
  total,
  topShare,
  className,
}: AlertSplitBiCardProps) {
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
          Répartition des alertes
        </div>
        <div className="mt-0.5 text-[11px]" style={{ color: '#94A3B8' }}>
          30 derniers jours · par catégorie
        </div>
      </div>
      <div className="mt-3.5">
        {bars.map((bar) => (
          <div key={bar.label} className="mb-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10.5px] font-semibold" style={{ color: '#475569' }}>
                {bar.label}
              </span>
              <span className="whitespace-nowrap text-[10.5px]" style={{ color: '#94A3B8' }}>
                {bar.count} · {bar.pct}%
              </span>
            </div>
            <div className="mt-1 h-2 rounded-[5px]" style={{ background: '#F1F5F9' }}>
              <div
                className="h-full rounded-[5px]"
                style={{ width: `${bar.w}%`, background: bar.color }}
              />
            </div>
          </div>
        ))}
        <div
          className="mt-1.5 border-t border-dashed pt-2 text-[10.5px] leading-relaxed"
          style={{ borderColor: '#E5E7EB', color: '#64748B' }}
        >
          {total} alertes au total · {topShare}% sur une seule catégorie
        </div>
      </div>
    </div>
  );
}
