import { cn } from '@/lib/utils';
import type { DriverRiskBar } from '../../mocks/mockBiKpis';

interface DriverRiskBiCardProps {
  avgScore: number;
  bars: DriverRiskBar[];
  className?: string;
}

export function DriverRiskBiCard({ avgScore, bars, className }: DriverRiskBiCardProps) {
  return (
    <div
      className={cn('min-w-[260px] flex-[1.3] rounded-[14px] border bg-white p-[18px_20px]', className)}
      style={{ borderColor: '#E5E7EB' }}
    >
      <div className="text-[12.5px] font-bold" style={{ color: '#1E293B' }}>
        Score de risque moyen — conducteurs
      </div>
      <div className="mt-0.5 text-[11px]" style={{ color: '#94A3B8' }}>
        Vitesse + conduite agressive + temps de conduite
      </div>
      <div className="mt-2.5 text-[30px] font-bold" style={{ color: '#4F46E5' }}>
        {avgScore}
        <span className="text-[15px] font-semibold" style={{ color: '#94A3B8' }}>
          /100
        </span>
      </div>
      <div className="mt-3.5">
        {bars.map((bar) => (
          <div key={bar.name} className="mb-2.5 flex items-center gap-2">
            <div className="w-[66px] shrink-0 text-[10.5px]" style={{ color: '#334155' }}>
              {bar.name}
            </div>
            <div className="h-[9px] flex-1 rounded-md" style={{ background: '#F1F5F9' }}>
              <div
                className="h-full rounded-md"
                style={{ width: `${bar.w}%`, background: bar.color }}
              />
            </div>
            <div
              className="w-5 text-right text-[10.5px] font-bold"
              style={{ color: bar.color }}
            >
              {bar.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
