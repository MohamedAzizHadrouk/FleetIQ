import { FIQ, FIQ_STATUS_LABEL, type FleetiqMarkerStatus } from '@/features/fleetiq/vehicle-sprite';

const ITEMS: { label: string; color: string }[] = (
  ['moving', 'stopped', 'offline', 'alert'] as FleetiqMarkerStatus[]
).map((s) => ({
  label: FIQ_STATUS_LABEL[s],
  color: s === 'moving' ? FIQ.moving : s === 'stopped' ? FIQ.stopped : s === 'offline' ? FIQ.offline : FIQ.alert,
}));

/** Map legend — same status rings as the FleetIQ vehicle markers */
export function MapLegend() {
  return (
    <div className="fiq-font bg-white p-3 sm:p-4 rounded-2xl border border-[#E3E9F4] shadow-[0_10px_24px_rgba(15,27,61,0.14)] w-full max-w-[12rem] sm:w-48 text-sm text-[#0F1B3D]">
      <h3 className="font-extrabold mb-3">Légende</h3>

      <div className="space-y-2">
        {[...ITEMS, { label: 'Sélectionné', color: FIQ.selected }].map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <span
              className="w-3.5 h-3.5 rounded-full border-2 shrink-0"
              style={{ borderColor: it.color, background: `${it.color}29` }}
            />
            <span className="text-[#5B6B8C] font-medium">{it.label}</span>
          </div>
        ))}

        <div className="h-px bg-[#E3E9F4] my-2" />

        <div className="flex items-center gap-3">
          <span className="w-4 h-0.5 bg-red-500" />
          <span className="text-[#5B6B8C] font-medium">Autoroute</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-0.5 bg-amber-700" />
          <span className="text-[#5B6B8C] font-medium">Route</span>
        </div>
      </div>
    </div>
  );
}
