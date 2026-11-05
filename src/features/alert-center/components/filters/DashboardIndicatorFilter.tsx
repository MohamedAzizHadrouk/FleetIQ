import { CARD_DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DashboardIndicatorFilterProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

function toggleItem(arr: string[], id: string): string[] {
  return arr.includes(id) ? arr.filter((i) => i !== id) : [...arr, id];
}

export function DashboardIndicatorFilter({ selected, onChange }: DashboardIndicatorFilterProps) {
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}
    >
      {CARD_DASHBOARD_INDICATORS.map((config) => {
        const isSelected = selected.includes(config.id);
        const Icon = config.icon;

        return (
          <Tooltip key={config.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={config.label}
                onClick={() => onChange(toggleItem(selected, config.id))}
                className={cn(
                  'flex items-center justify-center rounded-md p-1.5 transition-colors border',
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-medium">{config.label}</p>
              <p className="text-muted-foreground">Filtrer par {config.label.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
