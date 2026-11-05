import { Activity, AlertTriangle, ChevronDown, ChevronRight, Navigation, Square, WifiOff, X } from 'lucide-react';
import type { ComponentType } from 'react';
import type { VehicleStatus } from '@/types';
import { FIQ, FIQ_STATUS_LABEL, type FleetiqMarkerStatus } from '@/features/fleetiq/vehicle-sprite';

/**
 * Floating fleet summary on the tracking map. Uses the same statuses, colours and
 * labels as the FleetIQ vehicle markers and card so the map reads as one system.
 */

const ROWS: {
  status: VehicleStatus;
  marker: FleetiqMarkerStatus;
  hint: string;
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  tint: string;
}[] = [
  { status: 'active', marker: 'moving', hint: 'Vitesse > 0 km/h', icon: Navigation, tint: '#DCFCE7' },
  { status: 'idle', marker: 'stopped', hint: 'Contact ou arrêt prolongé', icon: Square, tint: '#FEF3C7' },
  { status: 'offline', marker: 'offline', hint: 'Aucune position récente', icon: WifiOff, tint: '#EEF1F7' },
];

export function MonitoringCenterCard({
  isCollapsed,
  onToggleCollapse,
  statusCounts,
  statusFilter,
  onToggleStatusFilter,
  onClearStatusFilter,
  shownOnMap,
  criticalCount,
  onOpenAlerts,
}: {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  statusCounts: Record<VehicleStatus, number>;
  statusFilter: Set<VehicleStatus>;
  onToggleStatusFilter: (status: VehicleStatus) => void;
  onClearStatusFilter: () => void;
  /** Vehicles currently drawn on the map (after list + status filters) */
  shownOnMap: number;
  /** Vehicles with an unread critical alert (red markers) */
  criticalCount: number;
  onOpenAlerts: () => void;
}) {
  const total = statusCounts.active + statusCounts.idle + statusCounts.offline;
  const pct = (n: number) => (total ? (n / total) * 100 : 0);

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-expanded={false}
        aria-label="Ouvrir le Monitoring Center"
        className="fiq-font group flex items-center gap-2.5 h-12 pl-3 pr-3.5 rounded-2xl bg-white text-[#0F1B3D] border border-[#E3E9F4] shadow-[0_10px_24px_rgba(15,27,61,0.16)] hover:shadow-[0_12px_28px_rgba(15,27,61,0.22)] transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BFF]"
      >
        <span className="w-8 h-8 rounded-[10px] bg-[#EAF1FF] text-[#2F6BFF] flex items-center justify-center">
          <Activity className="w-4 h-4" />
        </span>
        <span className="text-[15px] font-extrabold tabular-nums">{total}</span>
        <span className="flex items-center gap-1.5" aria-hidden>
          {ROWS.map((r) => (
            <span key={r.status} className="flex items-center gap-1 text-xs font-bold text-[#5B6B8C] tabular-nums">
              <span className="w-2 h-2 rounded-full" style={{ background: statusColor(r.marker) }} />
              {statusCounts[r.status]}
            </span>
          ))}
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-[#9B1C22] tabular-nums">
              <span className="w-2 h-2 rounded-full" style={{ background: FIQ.alert }} />
              {criticalCount}
            </span>
          )}
        </span>
      </button>
    );
  }

  const filtering = statusFilter.size > 0;

  return (
    <section
      aria-label="Monitoring Center"
      className="fiq-font w-[min(320px,calc(100vw-2rem))] rounded-[22px] bg-white text-[#0F1B3D] border border-[#E3E9F4] shadow-[0_24px_48px_rgba(15,27,61,0.18)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <span className="w-9 h-9 rounded-xl bg-[#EAF1FF] text-[#2F6BFF] flex items-center justify-center shrink-0">
          <Activity className="w-[18px] h-[18px]" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-extrabold leading-tight">Monitoring Center</h2>
          <p className="text-xs text-[#5B6B8C]">
            <span className="font-bold text-[#0F1B3D] tabular-nums">{shownOnMap}</span> / {total} sur la carte
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded
          aria-label="Réduire le Monitoring Center"
          className="w-9 h-9 rounded-xl bg-[#F0F3F9] text-[#0F1B3D] flex items-center justify-center hover:bg-[#E3E9F4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BFF]"
        >
          <ChevronDown className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Distribution bar */}
      <div className="px-4">
        <div className="flex h-2 rounded-full overflow-hidden bg-[#EEF1F7]" role="img" aria-label="Répartition des statuts">
          {ROWS.map((r) => (
            <span key={r.status} style={{ width: `${pct(statusCounts[r.status])}%`, background: statusColor(r.marker) }} />
          ))}
        </div>
      </div>

      {/* Status filters */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-xs font-extrabold text-[#5B6B8C] tracking-[0.04em] uppercase">Statuts</span>
        {filtering && (
          <button
            type="button"
            onClick={onClearStatusFilter}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2F6BFF] hover:underline"
          >
            <X className="w-3 h-3" /> Tout afficher
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 px-4">
        {ROWS.map((r) => {
          const on = statusFilter.has(r.status);
          const dim = filtering && !on;
          const color = statusColor(r.marker);
          const Icon = r.icon;
          return (
            <button
              key={r.status}
              type="button"
              aria-pressed={on}
              onClick={() => onToggleStatusFilter(r.status)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BFF] ${
                on ? 'bg-white shadow-[0_2px_8px_rgba(15,27,61,0.08)]' : 'border-[#E3E9F4] hover:bg-[#F7F9FF]'
              } ${dim ? 'opacity-55' : ''}`}
              style={on ? { borderColor: color, boxShadow: `0 0 0 3px ${color}22` } : undefined}
            >
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: r.tint }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold">{FIQ_STATUS_LABEL[r.marker]}</span>
                <span className="block text-xs text-[#5B6B8C] truncate">{r.hint}</span>
              </span>
              <span className="text-xl font-extrabold tabular-nums">{statusCounts[r.status]}</span>
            </button>
          );
        })}
      </div>

      {/* Critical alerts → Alerts module */}
      <div className="p-4">
        <button
          type="button"
          onClick={onOpenAlerts}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-left transition-colors ${
            criticalCount ? 'bg-[#FDECEC] border-[#F8C9CB] hover:bg-[#FBE0E1]' : 'border-[#E3E9F4] hover:bg-[#F7F9FF]'
          }`}
        >
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              criticalCount ? 'bg-[#E5484D] text-white' : 'bg-[#F0F3F9] text-[#5B6B8C]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </span>
          <span className="flex-1 min-w-0">
            <span className={`block text-sm font-bold ${criticalCount ? 'text-[#9B1C22]' : ''}`}>
              {criticalCount ? `${criticalCount} véhicule${criticalCount > 1 ? 's' : ''} en alerte` : 'Aucune alerte critique'}
            </span>
            <span className={`block text-xs ${criticalCount ? 'text-[#B4343A]' : 'text-[#5B6B8C]'}`}>
              Centre d’alertes
            </span>
          </span>
          <ChevronRight className={`w-4 h-4 ${criticalCount ? 'text-[#9B1C22]' : 'text-[#5B6B8C]'}`} />
        </button>
      </div>
    </section>
  );
}

function statusColor(s: FleetiqMarkerStatus) {
  return s === 'moving' ? FIQ.moving : s === 'stopped' ? FIQ.stopped : s === 'offline' ? FIQ.offline : FIQ.alert;
}
