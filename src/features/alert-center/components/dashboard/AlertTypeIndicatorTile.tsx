import { getAlertTypeIconConfigWithFallback } from '@/design-system/alert-type-icons';
import { getTaxonomyEntry } from '../../constants/alert-taxonomy';
import type { AlertType } from '@/types/alerts';

interface AlertTypeIndicatorTileProps {
  alertType: AlertType;
  vehicleCount: number;
  showBiTag?: boolean;
  onClick: () => void;
}

/** Webtrace `.alert-type-card` — horizontal row with circular icon + blue badge. */
export function AlertTypeIndicatorTile({
  alertType,
  vehicleCount,
  showBiTag = false,
  onClick,
}: AlertTypeIndicatorTileProps) {
  const entry = getTaxonomyEntry(alertType);
  const iconConfig = getAlertTypeIconConfigWithFallback(alertType, entry.defaultSeverity);
  const Icon = iconConfig.icon;
  const biTag =
    entry.defaultSeverity === 'critical'
      ? { label: 'Critique', background: '#FEE2E2', color: '#DC2626' }
      : { label: 'Non critique', background: '#F1F5F9', color: '#64748B' };

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-h-[4.1rem] w-full items-center gap-3 rounded-xl border bg-white px-4 py-[0.85rem] text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
      style={{ borderColor: '#e8edf3' }}
    >
      {vehicleCount > 0 ? (
        <span
          className="absolute right-[0.4rem] top-[0.4rem] inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.7rem] font-bold text-white"
          style={{ background: '#2563eb' }}
        >
          {vehicleCount}
        </span>
      ) : null}
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: '#f1f5f9' }}
      >
        <Icon className="h-5 w-5 text-slate-600" aria-hidden />
      </span>
      <span className="min-w-0 pr-5">
        <span
          className="block text-[0.8125rem] font-semibold leading-tight"
          style={{ color: '#1e293b' }}
        >
          {entry.label}
        </span>
        {showBiTag ? (
          <span
            className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[9.5px] font-bold"
            style={{ background: biTag.background, color: biTag.color }}
          >
            {biTag.label}
          </span>
        ) : null}
      </span>
    </button>
  );
}
