import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ActivationType } from '@/types/alert-config';
import { cn } from '@/lib/utils';

interface ActivationModeControlProps {
  activationType: ActivationType;
  activationStart?: string;
  activationEnd?: string;
  onChange: (patch: {
    activationType: ActivationType;
    activationStart?: string;
    activationEnd?: string;
  }) => void;
  className?: string;
  compact?: boolean;
}

export function ActivationModeControl({
  activationType,
  activationStart,
  activationEnd,
  onChange,
  className,
  compact,
}: ActivationModeControlProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {!compact && (
        <Label className="text-xs text-muted-foreground">Mode d&apos;activation</Label>
      )}
      <div className="flex flex-wrap gap-2">
        {(['permanent', 'temporary'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange({ activationType: mode, activationStart, activationEnd })}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
              activationType === mode
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            {mode === 'permanent' ? 'Permanente' : 'Temporaire'}
          </button>
        ))}
      </div>
      {activationType === 'temporary' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">Début</Label>
            <Input
              type="date"
              value={activationStart ?? ''}
              onChange={(e) =>
                onChange({ activationType, activationStart: e.target.value, activationEnd })
              }
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-[10px]">Fin</Label>
            <Input
              type="date"
              value={activationEnd ?? ''}
              onChange={(e) =>
                onChange({ activationType, activationStart, activationEnd: e.target.value })
              }
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
