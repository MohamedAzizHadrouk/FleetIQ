import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  FileText,
  Fuel,
  Gauge,
  MapPin,
  Pencil,
  Phone,
  Route,
  ShieldAlert,
  Thermometer,
  Wrench,
  X,
} from 'lucide-react';
import type { Vehicle } from '@/types';
import { withVehiclePopupDemo } from '@/data/vehicle-popup-demo';
import {
  FIQ,
  FIQ_STATUS_COLOR,
  FIQ_STATUS_LABEL,
  FIQ_TYPE_LABEL,
  FleetiqVehicleIcon,
  toFleetiqStatus,
  toFleetiqType,
  type FleetiqMarkerStatus,
} from '@/features/fleetiq/vehicle-sprite';
import {
  CARD_ALERT_GROUP_LABEL,
  formatDuration,
  getDemoMaintenance,
  getDemoTrips,
  getVehicleCardAlerts,
  type CardAlert,
  type CardAlertGroup,
  type DemoTrip,
  type TripRange,
} from '@/features/fleetiq/vehicle-card-data';

/** Links from the map card to the other modules of the platform. */
export interface VehicleCardActions {
  /** Centre + zoom the map on the vehicle and keep it selected */
  onFollowLive?: (vehicle: Vehicle) => void;
  /** Draw the vehicle's recent GPS track on the map */
  onShowTrack?: (vehicle: Vehicle, trip?: DemoTrip) => void;
  /** Draw one trip of the Trajets tab on the map */
  onShowTrip?: (vehicle: Vehicle, trip: DemoTrip) => void;
  /** Animate the vehicle along a trip (replay simulation) */
  onReplayTrip?: (vehicle: Vehicle, trip: DemoTrip) => void;
  /** Rapports → rapport détaillé du véhicule */
  onOpenReport?: (vehicle: Vehicle) => void;
  /** Parc → Maintenance */
  onOpenMaintenance?: (vehicle: Vehicle) => void;
  /** Parc → Documents */
  onOpenDocuments?: (vehicle: Vehicle) => void;
  /** Parc → Véhicules (modifier type + photo) */
  onEditVehicle?: (vehicle: Vehicle) => void;
  /** Parc → Chauffeurs */
  onOpenDriver?: (vehicle: Vehicle) => void;
  /** Centre d'alertes */
  onOpenAlerts?: (vehicle: Vehicle) => void;
  /** Historique des alertes filtré sur ce véhicule */
  onOpenAlertHistory?: (vehicle: Vehicle) => void;
}

interface VehicleMapInfoCardProps {
  vehicle: Vehicle;
  onClose: () => void;
  actions?: VehicleCardActions;
}

type TabId = 'apercu' | 'trajets' | 'maintenance' | 'alertes';

const STATUS_CHIP: Record<FleetiqMarkerStatus, { bg: string; fg: string }> = {
  moving: { bg: '#DCFCE7', fg: '#166534' },
  stopped: { bg: '#FEF3C7', fg: '#92400E' },
  offline: { bg: '#EEF1F7', fg: '#475569' },
  alert: { bg: '#FDECEC', fg: '#9B1C22' },
};

export function VehicleMapInfoCard(props: VehicleMapInfoCardProps) {
  return <VehicleCard key={props.vehicle.id} {...props} />;
}

function VehicleCard({ vehicle: rawVehicle, onClose, actions = {} }: VehicleMapInfoCardProps) {
  const vehicle = useMemo(() => withVehiclePopupDemo(rawVehicle), [rawVehicle]);
  const [tab, setTab] = useState<TabId>('apercu');
  const [alertFilter, setAlertFilter] = useState<'all' | CardAlertGroup>('all');
  const alerts = useMemo(() => getVehicleCardAlerts(vehicle.id), [vehicle.id]);
  const hasCritical = alerts.some((a) => a.critical);
  const status = toFleetiqStatus(vehicle.status, hasCritical);
  const type = toFleetiqType(vehicle.iconType);
  const title = vehicle.matricule || vehicle.name;
  const chip = STATUS_CHIP[status];

  const tabs: { id: TabId; label: string; grow?: number }[] = [
    { id: 'apercu', label: 'Aperçu' },
    { id: 'trajets', label: 'Trajets' },
    { id: 'maintenance', label: 'Maintenance', grow: 1.3 },
    { id: 'alertes', label: 'Alertes' },
  ];

  return (
    <div
      role="dialog"
      aria-label={`Véhicule ${title}`}
      className="fiq-font w-[408px] max-w-[calc(100vw-1rem)] h-[min(650px,calc(100vh-2rem))] flex flex-col overflow-hidden rounded-[24px] bg-white text-[#0F1B3D] shadow-[0_24px_48px_rgba(15,27,61,0.18)]"
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-3.5 px-[18px] pt-[18px] pb-3.5 shrink-0">
        <div className="w-16 h-16 rounded-[18px] border border-[#DCE6FB] bg-gradient-to-br from-[#EAF1FF] to-[#F7F9FF] flex items-center justify-center shrink-0">
          <FleetiqVehicleIcon type={type} size={56} />
        </div>
        <div className="flex flex-col gap-[5px] flex-1 min-w-0">
          <span className="text-[22px] font-extrabold leading-tight truncate">{title}</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="inline-flex items-center gap-[5px] px-[9px] py-[3px] rounded-full text-xs font-bold"
              style={{ background: chip.bg, color: chip.fg }}
            >
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: FIQ_STATUS_COLOR[status] }} />
              {FIQ_STATUS_LABEL[status]}
            </span>
            <span className="inline-flex items-center px-[9px] py-[3px] rounded-full bg-[#EAF1FF] text-[#1E40AF] text-xs font-bold">
              {FIQ_TYPE_LABEL[type]}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5 self-start shrink-0">
          {actions.onEditVehicle && (
            <IconButton label="Modifier le type et la photo" onClick={() => actions.onEditVehicle?.(vehicle)}>
              <Pencil className="w-4 h-4" />
            </IconButton>
          )}
          <IconButton label="Fermer" onClick={onClose}>
            <X className="w-[18px] h-[18px]" />
          </IconButton>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Sections du véhicule" className="flex gap-1 mx-[18px] p-1 rounded-[14px] bg-[#F0F3F9] shrink-0">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => {
                if (t.id === 'alertes') setAlertFilter('all');
                setTab(t.id);
              }}
              style={{ flex: t.grow ?? 1 }}
              className={`h-9 rounded-[10px] text-[13px] inline-flex items-center justify-center gap-[5px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BFF] ${
                active ? 'bg-white shadow-[0_1px_3px_rgba(15,27,61,0.12)] font-bold text-[#0F1B3D]' : 'font-semibold text-[#5B6B8C] hover:text-[#0F1B3D]'
              }`}
            >
              {t.label}
              {t.id === 'alertes' && alerts.length > 0 && (
                <span className="min-w-[18px] h-[18px] px-[5px] rounded-full bg-[#E5484D] text-white text-[11px] font-extrabold inline-flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === 'apercu' && (
          <OverviewTab vehicle={vehicle} alerts={alerts} actions={actions} onShowAlerts={(group) => {
              setAlertFilter(group ?? 'all');
              setTab('alertes');
            }}
          />
        )}
        {tab === 'trajets' && <TripsTab vehicle={vehicle} actions={actions} />}
        {tab === 'maintenance' && <MaintenanceTab vehicle={vehicle} actions={actions} />}
        {tab === 'alertes' && (
          <AlertsTab key={alertFilter} vehicle={vehicle} alerts={alerts} actions={actions} initialFilter={alertFilter} />
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── shared bits ───────────────────────── */

function IconButton({ label, onClick, children }: { label: string; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="w-9 h-9 rounded-xl bg-[#F0F3F9] text-[#0F1B3D] inline-flex items-center justify-center hover:bg-[#E3E9F4] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BFF]"
    >
      {children}
    </button>
  );
}

function Cta({
  primary,
  secondary,
}: {
  primary: { label: string; onClick?: () => void };
  secondary: { label: string; onClick?: () => void };
}) {
  return (
    <div className="grid grid-cols-[1.5fr_1fr] gap-2.5 px-[18px] pt-3.5 pb-[18px]">
      <button
        type="button"
        onClick={primary.onClick}
        disabled={!primary.onClick}
        className="h-[46px] rounded-[14px] bg-[#2F6BFF] text-white text-[14.5px] font-bold hover:bg-[#2459E0] disabled:opacity-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6BFF]"
      >
        {primary.label}
      </button>
      <button
        type="button"
        onClick={secondary.onClick}
        disabled={!secondary.onClick}
        className="h-[46px] rounded-[14px] border border-[#DCE3EF] bg-white text-[#0F1B3D] text-[14.5px] font-bold hover:bg-[#F7F9FF] disabled:opacity-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6BFF]"
      >
        {secondary.label}
      </button>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <span className="text-[13px] font-extrabold text-[#5B6B8C] tracking-[0.04em] uppercase">{children}</span>;
}

function DemoNote() {
  return <p className="text-[11.5px] text-[#8A94A6] text-center -mt-1 pb-3">Données de démonstration</p>;
}

function fmt(n: number | undefined, digits = 0) {
  if (n === undefined || n === null || Number.isNaN(n)) return '—';
  return n.toLocaleString('fr-FR', { maximumFractionDigits: digits });
}

function initials(name?: string) {
  if (!name) return '—';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/* ───────────────────────── Aperçu ───────────────────────── */

function OverviewTab({
  vehicle,
  alerts,
  actions,
  onShowAlerts,
}: {
  vehicle: Vehicle;
  alerts: CardAlert[];
  actions: VehicleCardActions;
  onShowAlerts: (group?: CardAlertGroup) => void;
}) {
  const [lat, lng] = vehicle.coordinates;
  const fuel = vehicle.fuelLevel ?? 0;
  const fuelColor = fuel < 20 ? FIQ.alert : fuel < 40 ? FIQ.stopped : FIQ.moving;
  const updated = vehicle.timestamp
    ? new Date(vehicle.timestamp).toLocaleString('fr-FR', { timeZone: 'Africa/Tunis' }).replace(' ', ' · ')
    : vehicle.lastUpdate;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 mx-[18px] mt-3.5 rounded-[18px] border border-[#E3E9F4]">
        <Stat icon={<Gauge className="w-[19px] h-[19px] text-[#2F6BFF]" />} value={fmt(vehicle.speed)} unit="km/h" label="Vitesse" />
        <Stat
          icon={<Fuel className="w-[19px] h-[19px]" style={{ color: fuelColor }} />}
          value={fmt(fuel)}
          unit="%"
          label="Carburant"
          bar={{ pct: fuel, color: fuelColor }}
          bordered
        />
        <Stat
          icon={<Thermometer className="w-[19px] h-[19px] text-[#F59E0B]" />}
          value={fmt(vehicle.engineTemperature)}
          unit="°C"
          label="Temp. moteur"
          bordered
        />
      </div>

      {/* Timeline */}
      <div className="flex flex-col px-[18px] pt-4 pb-0.5">
        <TimelineRow icon={<MapPin className="w-4 h-4 text-[#2F6BFF]" />} title={vehicle.location || '—'} sub={`${lat.toFixed(4)}, ${lng.toFixed(4)}`} line />
        <TimelineRow icon={<CalendarClock className="w-4 h-4 text-[#2F6BFF]" />} title={updated || '—'} sub={`Dernière mise à jour ${vehicle.lastUpdate || ''}`.trim()} line />
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-[#0F1B3D] text-white text-[11.5px] font-extrabold flex items-center justify-center shrink-0">
            {initials(vehicle.driver)}
          </div>
          <div className="flex flex-col gap-px flex-1 min-w-0 pb-2.5">
            <span className="text-[14.5px] font-bold truncate">{vehicle.driver || 'Non affecté'}</span>
            <span className="text-[12.5px] text-[#5B6B8C] truncate">
              {vehicle.driverId || '—'}
              {vehicle.drivingTime ? ` · ${vehicle.drivingTime} de conduite` : ''}
            </span>
          </div>
          {actions.onOpenDriver && (
            <button
              type="button"
              aria-label="Fiche chauffeur"
              title="Fiche chauffeur"
              onClick={() => actions.onOpenDriver?.(vehicle)}
              className="w-[34px] h-[34px] rounded-[11px] border border-[#DCE3EF] bg-white text-[#0F1B3D] flex items-center justify-center shrink-0 hover:bg-[#F7F9FF]"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Alert icons: documents · maintenance · moteur · chute carburant */}
      {alerts.length > 0 && <AlertIconRow alerts={alerts} onOpen={onShowAlerts} />}

      <Cta
        primary={{ label: 'Suivre en direct', onClick: actions.onFollowLive && (() => actions.onFollowLive?.(vehicle)) }}
        secondary={{ label: 'Historique', onClick: actions.onShowTrack && (() => actions.onShowTrack?.(vehicle)) }}
      />
    </>
  );
}

function Stat({
  icon,
  value,
  unit,
  label,
  bar,
  bordered,
}: {
  icon: ReactNode;
  value: string;
  unit: string;
  label: string;
  bar?: { pct: number; color: string };
  bordered?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 p-3 min-w-0 ${bordered ? 'border-l border-[#E3E9F4]' : ''}`}>
      {icon}
      <div className="truncate">
        <span className="text-[22px] font-extrabold">{value}</span>{' '}
        <span className="text-xs text-[#5B6B8C] font-semibold">{unit}</span>
      </div>
      {bar && (
        <div className="h-[5px] rounded-[3px] bg-[#E3E9F4]" role="progressbar" aria-valuenow={bar.pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
          <div className="h-[5px] rounded-[3px]" style={{ width: `${Math.min(100, Math.max(0, bar.pct))}%`, background: bar.color }} />
        </div>
      )}
      <span className="text-xs text-[#5B6B8C]">{label}</span>
    </div>
  );
}

function TimelineRow({ icon, title, sub, line }: { icon: ReactNode; title: string; sub: string; line?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#EAF1FF] flex items-center justify-center">{icon}</div>
        {line && <div className="w-0.5 flex-1 min-h-[10px] bg-[#E3E9F4]" />}
      </div>
      <div className="flex flex-col gap-px pb-3 min-w-0">
        <span className="text-[14.5px] font-bold truncate">{title}</span>
        <span className="text-[12.5px] text-[#5B6B8C] truncate">{sub}</span>
      </div>
    </div>
  );
}


/* ───────────────────────── Alert icon row ───────────────────────── */

function EngineIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M7 8h7l2 2h2v8h-2l-2 2H8l-2-2H4v-4h2v-4l1-2Z" />
      <path d="M9 5h4M11 5v3M18 12h2v4h-2M2 12v4" />
    </svg>
  );
}

function FuelDropIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M2 21h12M3 10h10" />
      <path d="M19 9v9M16.5 15.5 19 18l2.5-2.5" />
    </svg>
  );
}

const ICON_ALERTS: {
  group: CardAlertGroup;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Show the number of alerts as a badge (otherwise a status dot) */
  badge: boolean;
}[] = [
  { group: 'documents', label: 'Documents', icon: FileText, badge: true },
  { group: 'maintenance', label: 'Maintenance', icon: Wrench, badge: true },
  { group: 'moteur', label: 'Moteur', icon: EngineIcon, badge: false },
  { group: 'carburant', label: 'Chute carburant', icon: FuelDropIcon, badge: false },
];

function AlertIconRow({ alerts, onOpen }: { alerts: CardAlert[]; onOpen: (group?: CardAlertGroup) => void }) {
  return (
    <div className="mx-[18px]">
      <div className="flex items-center justify-between pb-2">
        <span className="text-[13px] font-extrabold text-[#5B6B8C] tracking-[0.04em] uppercase">Alertes</span>
        <button type="button" onClick={() => onOpen()} className="text-[13px] font-bold text-[#2F6BFF] hover:underline">
          Voir tout ({alerts.length})
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ICON_ALERTS.map(({ group, label, icon: Icon, badge }) => {
          const items = alerts.filter((a) => a.group === group);
          const count = items.length;
          const critical = items.some((a) => a.critical);
          const active = count > 0;
          const tone = critical
            ? { box: 'bg-[#E5484D] text-white', tile: 'border-[#F8C9CB] bg-[#FDECEC]', text: 'text-[#9B1C22]', dot: '#E5484D' }
            : { box: 'bg-[#FEF3C7] text-[#B45309]', tile: 'border-[#F8E2B0] bg-[#FFF7E6]', text: 'text-[#92400E]', dot: '#F59E0B' };
          return (
            <button
              key={group}
              type="button"
              disabled={!active}
              onClick={() => onOpen(group)}
              title={active ? `${label} : ${count} alerte${count > 1 ? 's' : ''}` : `${label} : aucune alerte`}
              aria-label={active ? `${label}, ${count} alerte${count > 1 ? 's' : ''}` : `${label}, aucune alerte`}
              className={`relative flex flex-col items-center gap-1.5 px-1 pt-2.5 pb-2 rounded-2xl border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BFF] ${
                active ? `${tone.tile} hover:brightness-[0.98]` : 'border-[#E3E9F4] bg-white cursor-default'
              }`}
            >
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? tone.box : 'bg-[#F0F3F9] text-[#B8C3DA]'}`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className={`text-[11px] font-bold leading-tight text-center ${active ? tone.text : 'text-[#8A94A6]'}`}>
                {label}
              </span>
              {active &&
                (badge ? (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full text-white text-[11px] font-extrabold inline-flex items-center justify-center border-2 border-white"
                    style={{ background: tone.dot }}
                  >
                    {count}
                  </span>
                ) : (
                  <span
                    className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                    style={{ background: tone.dot }}
                  />
                ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
/* ───────────────────────── Trajets ───────────────────────── */

const RANGES: { id: TripRange; label: string }[] = [
  { id: 'today', label: 'Aujourd’hui' },
  { id: 'yesterday', label: 'Hier' },
  { id: 'week', label: '7 jours' },
];

function TripsTab({ vehicle, actions }: { vehicle: Vehicle; actions: VehicleCardActions }) {
  const [range, setRange] = useState<TripRange>('today');
  const trips = useMemo(() => getDemoTrips(vehicle, range), [vehicle, range]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = trips.find((t) => t.id === selectedId) ?? trips[trips.length - 1];
  const totalKm = trips.reduce((s, t) => s + t.km, 0);
  const totalMin = trips.reduce((s, t) => s + t.durationMin, 0);

  // Show the selected trip on the map when the tab opens or the period changes
  const { onShowTrip } = actions;
  const defaultTrip = trips[trips.length - 1];
  useEffect(() => {
    if (defaultTrip) onShowTrip?.(vehicle, defaultTrip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, vehicle.id]);

  return (
    <>
      <div className="flex gap-2 px-[18px] pt-3.5" role="group" aria-label="Période">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={range === r.id}
            onClick={() => {
              setRange(r.id);
              setSelectedId(null);
            }}
            className={`h-8 px-3.5 rounded-full text-[13px] transition-colors ${
              range === r.id ? 'bg-[#0F1B3D] text-white font-bold' : 'border border-[#DCE3EF] bg-white text-[#5B6B8C] font-semibold hover:text-[#0F1B3D]'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 mx-[18px] mt-3.5 rounded-[18px] border border-[#E3E9F4]">
        <SummaryCell value={<>{fmt(totalKm)} <span className="text-xs text-[#5B6B8C] font-semibold">km</span></>} label="Distance" />
        <SummaryCell value={formatDuration(totalMin)} label="Conduite" bordered />
        <SummaryCell value={String(trips.length)} label="Trajets" bordered />
      </div>

      <ul className="flex flex-col gap-2.5 px-[18px] pt-3.5">
        {trips.map((t) => {
          const active = t.id === selected?.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSelectedId(t.id);
                  actions.onShowTrip?.(vehicle, t);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-colors ${
                  active ? 'border-[1.5px] border-[#2F6BFF] bg-[#F5F8FF]' : 'border border-[#E3E9F4] hover:bg-[#F7F9FF]'
                }`}
              >
                <Route className={`w-5 h-5 shrink-0 ${active ? 'text-[#2F6BFF]' : 'text-[#5B6B8C]'}`} />
                <span className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-bold truncate">
                    {t.from} → {t.to}
                  </span>
                  <span className="text-[12.5px] text-[#5B6B8C]">
                    {t.day ? `${t.day} · ` : ''}
                    {t.start} → {t.end} · {t.duration}
                  </span>
                </span>
                <span className="text-sm font-extrabold">{t.km} km</span>
              </button>
            </li>
          );
        })}
      </ul>

      <Cta
        primary={{
          label: 'Rejouer sur la carte',
          onClick: selected && actions.onReplayTrip ? () => actions.onReplayTrip?.(vehicle, selected) : undefined,
        }}
        secondary={{ label: 'Exporter', onClick: actions.onOpenReport && (() => actions.onOpenReport?.(vehicle)) }}
      />
      <p className="text-[11.5px] text-[#8A94A6] text-center -mt-1 pb-3">Itinéraires réels · horaires de démonstration</p>
    </>
  );
}

function SummaryCell({ value, label, bordered }: { value: ReactNode; label: string; bordered?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 px-3.5 py-3 min-w-0 ${bordered ? 'border-l border-[#E3E9F4]' : ''}`}>
      <span className="text-[22px] font-extrabold truncate">{value}</span>
      <span className="text-xs text-[#5B6B8C]">{label}</span>
    </div>
  );
}

/* ───────────────────────── Maintenance ───────────────────────── */

function MaintenanceTab({ vehicle, actions }: { vehicle: Vehicle; actions: VehicleCardActions }) {
  const { services, documents } = useMemo(() => getDemoMaintenance(vehicle), [vehicle]);
  const next = [...services].sort((a, b) => a.remainingKm - b.remainingKm)[0];
  const toRenew = documents.filter((d) => d.days < 30).length;
  const openMaintenance = actions.onOpenMaintenance && (() => actions.onOpenMaintenance?.(vehicle));
  const openDocuments = actions.onOpenDocuments && (() => actions.onOpenDocuments?.(vehicle));

  return (
    <>
      <div className="flex items-center gap-3.5 mx-[18px] mt-3.5 px-4 py-3.5 rounded-[18px] bg-gradient-to-br from-[#FFF7E6] to-[#FFFBF2] border border-[#F8E2B0]">
        <div className="w-11 h-11 rounded-[14px] bg-[#FDE9B8] flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 text-[#92400E]" />
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-[12.5px] text-[#92400E] font-bold">Prochain entretien</span>
          <span className="text-[15px] font-extrabold leading-snug">
            {next.label} · {fmt(next.remainingKm)} km
          </span>
        </div>
        <button
          type="button"
          onClick={openMaintenance}
          disabled={!openMaintenance}
          className="h-[34px] px-3 rounded-[11px] bg-[#0F1B3D] text-white text-[12.5px] font-bold hover:bg-[#1B2A57] disabled:opacity-50"
        >
          Planifier
        </button>
      </div>

      <div className="flex flex-col gap-3.5 px-[18px] pt-4">
        <SectionTitle>Entretien</SectionTitle>
        {services.map((s) => {
          const warn = s.used >= 0.8;
          const color = warn ? FIQ.stopped : s.used >= 0.5 ? FIQ.blue : FIQ.moving;
          return (
            <div key={s.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-bold">{s.label}</span>
                <span className={warn ? 'text-[#92400E] font-bold' : 'text-[#5B6B8C] font-semibold'}>{fmt(s.remainingKm)} km restants</span>
              </div>
              <div className="h-[7px] rounded bg-[#EEF1F7]" role="progressbar" aria-label={s.label} aria-valuenow={Math.round(s.used * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-[7px] rounded" style={{ width: `${Math.round(s.used * 100)}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2.5 px-[18px] pt-[18px]">
        <SectionTitle>Documents{toRenew ? ` · ${toRenew} à renouveler` : ''}</SectionTitle>
        {documents.map((d) => {
          const expired = d.days < 0;
          return (
            <div
              key={d.label}
              className={`flex items-center gap-3 px-3.5 py-[11px] rounded-[14px] border ${
                expired ? 'bg-[#FDECEC] border-[#F8C9CB]' : 'bg-[#FFF7E6] border-[#F8E2B0]'
              }`}
            >
              {expired ? <ShieldAlert className="w-5 h-5 text-[#E5484D] shrink-0" /> : <FileText className="w-5 h-5 text-[#F59E0B] shrink-0" />}
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-sm font-bold">{d.label}</span>
                <span className={`text-[12.5px] ${expired ? 'text-[#B4343A]' : 'text-[#92400E]'}`}>
                  {expired ? `Expirée depuis ${-d.days} jour${-d.days > 1 ? 's' : ''}` : `Expire dans ${d.days} jours`}
                </span>
              </div>
              <button
                type="button"
                onClick={openDocuments}
                disabled={!openDocuments}
                className={`h-8 px-3 rounded-[10px] border bg-white text-[12.5px] font-bold disabled:opacity-50 ${
                  expired ? 'border-[#F0A9AC] text-[#9B1C22] hover:bg-[#FDECEC]' : 'border-[#EBCB86] text-[#92400E] hover:bg-[#FFF7E6]'
                }`}
              >
                {expired ? 'Renouveler' : 'Voir'}
              </button>
            </div>
          );
        })}
      </div>

      <Cta primary={{ label: 'Ajouter un entretien', onClick: openMaintenance }} secondary={{ label: 'Historique', onClick: openMaintenance }} />
      <DemoNote />
    </>
  );
}

/* ───────────────────────── Alertes ───────────────────────── */

function AlertsTab({
  vehicle,
  alerts,
  actions,
  initialFilter = 'all',
}: {
  vehicle: Vehicle;
  alerts: CardAlert[];
  actions: VehicleCardActions;
  initialFilter?: 'all' | CardAlertGroup;
}) {
  const [filter, setFilter] = useState<'all' | CardAlertGroup>(initialFilter);
  // "Critique" counts critical alerts; every alert also counts in its own group,
  // so the chips match the icon tiles on the Aperçu tab.
  const counts = alerts.reduce<Partial<Record<CardAlertGroup, number>>>((acc, a) => {
    if (a.critical) acc.critique = (acc.critique ?? 0) + 1;
    acc[a.group] = (acc[a.group] ?? 0) + 1;
    return acc;
  }, {});
  const groups = (Object.keys(CARD_ALERT_GROUP_LABEL) as CardAlertGroup[]).filter((g) => counts[g]);
  const visible = alerts.filter((a) => filter === 'all' || (filter === 'critique' ? a.critical : a.group === filter));
  const hasCritical = !!counts.critique;

  if (alerts.length === 0) {
    return (
      <>
        <div className="mx-[18px] mt-4 px-4 py-6 rounded-[18px] border border-[#E3E9F4] text-center">
          <p className="text-sm font-bold">Aucune alerte active</p>
          <p className="text-[12.5px] text-[#5B6B8C] mt-1">Ce véhicule n’a pas d’alerte en cours.</p>
        </div>
        <Cta
          primary={{ label: 'Centre d’alertes', onClick: actions.onOpenAlerts && (() => actions.onOpenAlerts?.(vehicle)) }}
          secondary={{ label: 'Historique', onClick: actions.onOpenAlertHistory && (() => actions.onOpenAlertHistory?.(vehicle)) }}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 px-[18px] pt-3.5" role="group" aria-label="Filtrer les alertes">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label={`Toutes ${alerts.length}`} />
        {groups.map((g) => (
          <FilterChip
            key={g}
            active={filter === g}
            critical={g === 'critique'}
            onClick={() => setFilter(g)}
            label={`${CARD_ALERT_GROUP_LABEL[g]} ${counts[g]}`}
          />
        ))}
      </div>

      <ul className="flex flex-col gap-2.5 px-[18px] pt-3.5">
        {visible.map((a) => (
          <li
            key={a.id}
            className={`flex gap-3 px-3.5 py-3 rounded-2xl border ${a.critical ? 'bg-[#FDECEC] border-[#F8C9CB]' : 'border-[#E3E9F4]'}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                a.critical ? 'bg-[#E5484D] text-white' : a.group === 'documents' ? 'bg-[#EAF1FF] text-[#2F6BFF]' : 'bg-[#FEF3C7] text-[#B45309]'
              }`}
            >
              <AlertGlyph group={a.critical ? 'critique' : a.group} />
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <span className={`text-sm truncate ${a.critical ? 'font-extrabold text-[#9B1C22]' : 'font-bold'}`}>{a.title}</span>
                <span className={`text-xs shrink-0 ${a.critical ? 'text-[#B4343A]' : 'text-[#5B6B8C]'}`}>{a.when}</span>
              </div>
              <span className={`text-[12.5px] ${a.critical ? 'text-[#B4343A]' : 'text-[#5B6B8C]'}`}>{a.message}</span>
            </div>
          </li>
        ))}
      </ul>

      <Cta
        primary={{
          label: hasCritical ? 'Traiter l’alerte critique' : 'Ouvrir le centre d’alertes',
          onClick: actions.onOpenAlerts && (() => actions.onOpenAlerts?.(vehicle)),
        }}
        secondary={{ label: 'Tout lire', onClick: actions.onOpenAlertHistory && (() => actions.onOpenAlertHistory?.(vehicle)) }}
      />
    </>
  );
}

function AlertGlyph({ group }: { group: CardAlertGroup }) {
  const cls = 'w-[18px] h-[18px]';
  switch (group) {
    case 'critique':
      return <AlertTriangle className={cls} />;
    case 'maintenance':
      return <Wrench className={cls} />;
    case 'moteur':
      return <EngineIcon className={cls} />;
    case 'carburant':
      return <FuelDropIcon className={cls} />;
    case 'documents':
      return <FileText className={cls} />;
    case 'zone':
      return <MapPin className={cls} />;
    case 'conduite':
      return <Gauge className={cls} />;
    default:
      return <ShieldAlert className={cls} />;
  }
}

function FilterChip({ label, active, critical, onClick }: { label: string; active: boolean; critical?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-8 px-3 rounded-full text-[13px] inline-flex items-center gap-1 transition-colors ${
        active
          ? 'bg-[#0F1B3D] text-white font-bold'
          : critical
            ? 'border border-[#F8C9CB] bg-[#FDECEC] text-[#9B1C22] font-bold'
            : 'border border-[#DCE3EF] bg-white text-[#5B6B8C] font-semibold hover:text-[#0F1B3D]'
      }`}
    >
      {label}
    </button>
  );
}
