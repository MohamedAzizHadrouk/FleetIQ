import { cn } from '@/lib/utils';

interface BiLayerToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

export function BiLayerToggle({ enabled, onChange, className }: BiLayerToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-[10px] border bg-white px-3.5 py-2',
        className
      )}
      style={{ borderColor: '#E5E7EB' }}
    >
      <span className="text-[13px] font-semibold" style={{ color: '#1E293B' }}>
        Couche BI
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Activer la couche BI"
        onClick={() => onChange(!enabled)}
        className="relative h-[22px] w-[38px] shrink-0 rounded-[11px] transition-colors"
        style={{ background: enabled ? '#2563EB' : '#CBD5E1' }}
      >
        <span
          className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-[left]"
          style={{ left: enabled ? 18 : 2 }}
        />
      </button>
    </div>
  );
}
