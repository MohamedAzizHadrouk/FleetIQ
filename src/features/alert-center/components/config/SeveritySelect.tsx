import type { SeverityLevelId } from '@/types/alert-config';
import { useSeverityOptions } from '../../hooks/useSeverityOptions';
import { cn } from '@/lib/utils';

interface SeveritySelectProps {
  value: SeverityLevelId;
  disabled?: boolean;
  onChange: (value: SeverityLevelId) => void;
  className?: string;
}

export function SeveritySelect({ value, disabled, onChange, className }: SeveritySelectProps) {
  const { options, isLoading } = useSeverityOptions();

  if (isLoading) {
    return (
      <select disabled className={cn('mt-1 w-full h-8 text-xs rounded-md border border-slate-200 bg-white px-2', className)}>
        <option>Chargement...</option>
      </select>
    );
  }

  const builtins = options.filter((o) => !o.isCustom);
  const customs = options.filter((o) => o.isCustom);

  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn('mt-1 w-full h-8 text-xs rounded-md border border-slate-200 bg-white px-2', className)}
    >
      {builtins.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
      {customs.length > 0 && (
        <optgroup label="Niveaux personnalisés">
          {customs.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
