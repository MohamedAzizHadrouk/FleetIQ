import { ChevronRight, Clock, Gauge, MapPin, Power, X } from 'lucide-react';
import type { Vehicle } from '@/types';
import {
  FIQ_STATUS_COLOR,
  FIQ_STATUS_LABEL,
  toFleetiqStatus,
} from '@/features/fleetiq/vehicle-sprite';

/** Ignition state: a connected vehicle (moving or idle) has its contact on */
export function isContactOn(vehicle: Pick<Vehicle, 'status'>): boolean {
  return vehicle.status !== 'offline';
}

/** Small "Contact ON / OFF" tag shown under the vehicle's matricule */
export function ContactTag({ vehicle, size = 'md' }: { vehicle: Pick<Vehicle, 'status'>; size?: 'sm' | 'md' }) {
  const on = isContactOn(vehicle);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold whitespace-nowrap ${
        size === 'sm' ? 'px-2 py-[2px] text-[11px]' : 'px-[9px] py-[3px] text-xs'
      } ${on ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F0F3F9] text-[#5B6B8C]'}`}
      title={on ? 'Contact mis' : 'Contact coupé'}
    >
      <Power className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} strokeWidth={2.5} />
      {on ? 'Contact ON' : 'Contact OFF'}
    </span>
  );
}

function formatUpdate(value: string | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** Compact card shown above a vehicle clicked on the map: only the essentials */
export function VehicleQuickCard({
  vehicle,
  hasCriticalAlert = false,
  onClose,
  onDetails,
}: {
  vehicle: Vehicle;
  hasCriticalAlert?: boolean;
  onClose: () => void;
  onDetails: () => void;
}) {
  const status = toFleetiqStatus(vehicle.status, hasCriticalAlert);
  const title = vehicle.matricule || vehicle.name;
  const speed = vehicle.status === 'active' ? vehicle.speed : 0;

  return (
    <div
      role="dialog"
      aria-label={`Aperçu du véhicule ${title}`}
      className="fiq-font relative w-[264px] rounded-2xl bg-white text-[#0F1B3D] border border-[#E3E9F4] shadow-[0_12px_28px_rgba(15,27,61,0.16)]"
    >
      <div className="px-3.5 pt-3 pb-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-extrabold leading-tight truncate">{title}</div>
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <ContactTag vehicle={vehicle} size="sm" />
              <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#5B6B8C]">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: FIQ_STATUS_COLOR[status] }} />
                {FIQ_STATUS_LABEL[status]}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="w-7 h-7 -mr-1 -mt-0.5 rounded-lg inline-flex items-center justify-center text-[#8A94A6] hover:bg-[#F0F3F9] hover:text-[#0F1B3D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <dl className="mt-3 space-y-2 text-[12.5px]">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 mt-[2px] text-[#2F6BFF] shrink-0" />
            <dt className="sr-only">Position</dt>
            <dd className="text-[#0F1B3D] leading-snug line-clamp-2">{vehicle.location || '—'}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-[#2F6BFF] shrink-0" />
            <dt className="text-[#5B6B8C]">Vitesse</dt>
            <dd className="ml-auto font-bold tabular-nums">{speed} km/h</dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#2F6BFF] shrink-0" />
            <dt className="text-[#5B6B8C]">Mise à jour</dt>
            <dd className="ml-auto font-semibold tabular-nums text-[#5B6B8C]">
              {formatUpdate(vehicle.timestamp ?? vehicle.lastUpdate)}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onDetails}
          className="mt-3 w-full h-9 rounded-xl bg-[#EAF1FF] text-[#2F6BFF] text-[13px] font-bold inline-flex items-center justify-center gap-1 hover:bg-[#DCE8FF] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BFF]"
        >
          Plus de détails
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Pointer towards the vehicle */}
      <span className="absolute left-1/2 -bottom-[7px] w-3.5 h-3.5 -translate-x-1/2 rotate-45 bg-white border-r border-b border-[#E3E9F4]" />
    </div>
  );
}
