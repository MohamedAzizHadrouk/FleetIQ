import { cn } from '@/lib/utils';
import type { BiPeriod } from '../../mocks/mockBiKpis';

const PERIODS: { id: BiPeriod; label: string }[] = [
  { id: 'jour', label: 'Jour' },
  { id: 'semaine', label: 'Semaine' },
  { id: 'mois', label: 'Mois' },
];

interface BiPeriodFilterProps {
  value: BiPeriod;
  onChange: (period: BiPeriod) => void;
  className?: string;
}

export function BiPeriodFilter({ value, onChange, className }: BiPeriodFilterProps) {
  return (
    <div
      className={cn('inline-flex rounded-lg p-0.5', className)}
      style={{ background: '#F1F5F9' }}
      role="tablist"
      aria-label="Période BI"
    >
      {PERIODS.map((period) => {
        const selected = value === period.id;
        return (
          <button
            key={period.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(period.id)}
            className="rounded-md px-3 py-1.5 text-[11.5px] font-bold transition-colors"
            style={{
              background: selected ? '#fff' : 'transparent',
              color: selected ? '#0F172A' : '#64748B',
            }}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
