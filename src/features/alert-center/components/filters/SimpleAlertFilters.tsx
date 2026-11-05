import { RotateCcw } from 'lucide-react';
import type { AlertFilters, AlertSeverity } from '@/types/alerts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SEVERITIES: { id: AlertSeverity; label: string }[] = [
  { id: 'critical', label: 'Critique' },
  { id: 'warning', label: 'Avertissement' },
  { id: 'info', label: 'Info' },
];

interface SimpleAlertFiltersProps {
  filters: AlertFilters;
  onUpdate: <K extends keyof AlertFilters>(key: K, value: AlertFilters[K]) => void;
  onReset: () => void;
}

function toggleSeverity(severities: AlertSeverity[], severity: AlertSeverity): AlertSeverity[] {
  return severities.includes(severity)
    ? severities.filter((s) => s !== severity)
    : [...severities, severity];
}

export function SimpleAlertFilters({ filters, onUpdate, onReset }: SimpleAlertFiltersProps) {
  return (
    <div className="flex flex-col gap-3 px-6 py-4 border-b border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-2">
        {SEVERITIES.map((s) => {
          const active = filters.severities.includes(s.id);
          return (
            <Button
              key={s.id}
              size="sm"
              variant={active ? 'default' : 'outline'}
              className={cn('text-xs', active ? 'bg-blue-600' : 'text-slate-700')}
              onClick={() => onUpdate('severities', toggleSeverity(filters.severities, s.id))}
            >
              {s.label}
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-slate-500 ml-auto"
          onClick={onReset}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
}
