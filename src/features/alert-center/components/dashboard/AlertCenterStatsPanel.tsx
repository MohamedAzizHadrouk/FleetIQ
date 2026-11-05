import { useState } from 'react';
import { Ban, Car, ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAlertCenterSummary } from '../../hooks/useAlertQueries';
import { Skeleton } from '@/components/ui/skeleton';

const CRITICAL_VEHICLES = [
  { plate: '216 TU 4521', alert: 'Indicateur de panne ABS' },
  { plate: '089 TU 6602', alert: 'SOS / Appel de service' },
  { plate: '302 TU 1147', alert: 'Batterie débranchée' },
];

interface AlertCenterStatsPanelProps {
  className?: string;
  onSosClick?: () => void;
  onInspectVehicle?: (plate: string) => void;
}

function vehicleUnit(count: number): string {
  return count <= 1 ? 'véhicule' : 'véhicules';
}

/** Webtrace `.alert-kpi` horizontal cards. */
export function AlertCenterStatsPanel({
  className,
  onSosClick,
  onInspectVehicle,
}: AlertCenterStatsPanelProps) {
  const { data: summary, isLoading } = useAlertCenterSummary();
  const [listOpen, setListOpen] = useState(false);

  if (isLoading || !summary) {
    return (
      <div className={cn('grid w-full grid-cols-1 gap-4 md:grid-cols-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[5.5rem] rounded-[0.9rem]" />
        ))}
      </div>
    );
  }

  const sosCount = summary.activeSosVehicles;

  return (
    <div className={cn('grid w-full grid-cols-1 gap-4 md:grid-cols-3', className)}>
      <div className="relative min-w-0">
        <button
          type="button"
          onClick={() => setListOpen((open) => !open)}
          aria-expanded={listOpen}
          className="flex w-full items-center gap-4 rounded-[0.9rem] border bg-white px-5 py-[1.15rem] text-left shadow-sm"
          style={{ borderColor: '#e8edf3' }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ background: '#dbeafe', color: '#2563eb' }}
          >
            <Car className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[1.875rem] font-bold leading-tight" style={{ color: '#0f172a' }}>
              {summary.vehiclesInAlert}
              <span className="ml-1 text-sm font-semibold" style={{ color: '#64748b' }}>
                {vehicleUnit(summary.vehiclesInAlert)}
              </span>
            </p>
            <p
              className="mt-0.5 text-[0.7rem] font-bold uppercase tracking-wider"
              style={{ color: '#64748b' }}
            >
              Véhicules concernés
            </p>
          </div>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', listOpen && 'rotate-180')}
            aria-hidden
          />
        </button>
        {listOpen ? (
          <div
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 rounded-xl border bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
            style={{ borderColor: '#E5E7EB' }}
          >
            <p className="px-2 pb-1 pt-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
              Véhicules avec alerte critique
            </p>
            {CRITICAL_VEHICLES.map((vehicle) => (
              <button
                key={vehicle.plate}
                type="button"
                onClick={() => {
                  setListOpen(false);
                  onInspectVehicle?.(vehicle.plate);
                }}
                className="flex w-full items-center justify-between gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-bold" style={{ color: '#0F172A' }}>
                    {vehicle.plate}
                  </span>
                  <span className="mt-px block text-[11px]" style={{ color: '#64748B' }}>
                    {vehicle.alert}
                  </span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
              </button>
            ))}
            <p className="mt-1 border-t px-2 pb-0.5 pt-1.5 text-[10.5px] text-slate-400" style={{ borderColor: '#F1F5F9' }}>
              Cliquez un véhicule pour ouvrir son inspection 3D
            </p>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onSosClick}
        className="flex w-full items-center gap-4 rounded-[0.9rem] border bg-white px-5 py-[1.15rem] text-left shadow-sm transition-colors hover:border-red-300"
        style={{ borderColor: '#e8edf3' }}
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ background: '#fee2e2', color: '#dc2626' }}
        >
          <ShieldAlert className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="text-[1.875rem] font-bold leading-tight" style={{ color: '#0f172a' }}>
            {sosCount}
            <span className="ml-1 text-sm font-semibold" style={{ color: '#64748b' }}>
              {vehicleUnit(sosCount)}
            </span>
          </p>
          <p
            className="mt-0.5 text-[0.7rem] font-bold uppercase tracking-wider"
            style={{ color: '#64748b' }}
          >
            SOS actifs
          </p>
        </div>
      </button>

      <div
        className="flex w-full items-center gap-4 rounded-[0.9rem] border bg-white px-5 py-[1.15rem] shadow-sm"
        style={{ borderColor: '#e8edf3' }}
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ background: '#f1f5f9', color: '#64748b' }}
        >
          <Ban className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="text-[1.875rem] font-bold leading-tight" style={{ color: '#0f172a' }}>
            {summary.vehiclesOffline}
            <span className="ml-1 text-sm font-semibold" style={{ color: '#64748b' }}>
              {vehicleUnit(summary.vehiclesOffline)}
            </span>
          </p>
          <p
            className="mt-0.5 text-[0.7rem] font-bold uppercase tracking-wider"
            style={{ color: '#64748b' }}
          >
            Véhicules hors ligne
          </p>
        </div>
      </div>
    </div>
  );
}
