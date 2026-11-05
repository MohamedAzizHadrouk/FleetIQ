import type { ReactNode } from 'react';
import type { AlertHistoryRow } from '../../api/alert-api';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function formatHistoryDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

interface AlertHistoryTableProps {
  rows: AlertHistoryRow[];
  isLoading?: boolean;
  footer?: ReactNode;
  onVehicleClick?: (vehicleId: string) => void;
}

/** Webtrace history table: white thead, zebra rows, clickable vehicle. */
export function AlertHistoryTable({
  rows,
  isLoading,
  footer,
  onVehicleClick,
}: AlertHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0 && !footer) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 py-16 text-center text-sm text-slate-500">
        Aucune alerte pour les filtres sélectionnés.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">
          Aucune alerte pour les filtres sélectionnés.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-left">
              <th className="px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">
                Date / Heure
              </th>
              <th className="px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">
                Véhicule
              </th>
              <th className="px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">
                Chauffeur
              </th>
              <th className="px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">
                Lieu ou zone
              </th>
              <th className="px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500">
                Type d&apos;alerte
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-slate-100 last:border-0',
                  idx % 2 === 1 && 'bg-[#f8fafc]'
                )}
              >
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {formatHistoryDateTime(row.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {onVehicleClick ? (
                    <button
                      type="button"
                      onClick={() => onVehicleClick(row.vehicleId)}
                      className="font-bold text-slate-900 hover:text-blue-600"
                      style={{ color: '#0f172a' }}
                    >
                      {row.vehicleName}
                    </button>
                  ) : (
                    <span className="font-bold text-slate-900">{row.vehicleName}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">{row.driverName}</td>
                <td className="px-4 py-3 text-slate-500">{row.locationOrZone}</td>
                <td className="px-4 py-3 text-slate-700">{row.alertTypeLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {footer}
    </div>
  );
}
