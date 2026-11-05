import { useState, type ComponentType } from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Fuel,
  Gauge,
  MapPin,
  RadioTower,
  Route,
  Thermometer,
  UserRound,
  Waves,
  Wrench,
  X,
} from 'lucide-react';
import type { Vehicle } from '@/types';
import { vehicleIcon3dMarkup } from '@/features/parc/vehicle-icons-3d';
import type { VehicleIconType } from '@/features/parc/vehicle-types';
import { withVehiclePopupDemo } from '@/data/vehicle-popup-demo';

type PopupInfo = {
  equipmentId: string;
  address: string;
  gpsPosition: string;
  mileage: string;
  speed: string;
  engineHours: string;
  engineTemp: string;
  fuelLevel: string;
  fuelVolume: string;
  fuelConsumption: string;
  driver: string;
  driverId: string;
  drivingTime: string;
  batteryLevel: string;
  serialNumber: string;
  chipNumber: string;
  temperature: string;
  probeState: string;
  waterPresence: string;
  dateTime: string;
  lastUpdate: string;
  cardId: string;
};

function metric(value: number | string | undefined, unit = ''): string {
  if (value === undefined || value === null || value === '') return '—';
  const formatted =
    typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
  return unit ? `${formatted} ${unit}` : String(formatted);
}

function buildInfo(vehicle: Vehicle): PopupInfo {
  const latitude = vehicle.coordinates?.[0] ?? 0;
  const longitude = vehicle.coordinates?.[1] ?? 0;
  const dateTime = vehicle.timestamp
    ? new Date(vehicle.timestamp).toLocaleString('fr-FR', { timeZone: 'Africa/Tunis' })
    : vehicle.lastUpdate || '—';

  return {
    equipmentId: vehicle.imei || '—',
    address: vehicle.location || '—',
    gpsPosition: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    mileage: metric(vehicle.mileage, 'km'),
    speed: metric(vehicle.speed, 'km/h'),
    engineHours: metric(vehicle.engineHours, 'h'),
    engineTemp: metric(vehicle.engineTemperature, '°C'),
    fuelLevel: metric(vehicle.fuelLevel, '%'),
    fuelVolume: metric(vehicle.fuelVolume, 'L'),
    fuelConsumption: metric(vehicle.fuelConsumption, 'L/100 km'),
    driver: vehicle.driver || 'Non affecté',
    driverId: vehicle.driverId || '—',
    drivingTime: vehicle.drivingTime || '—',
    batteryLevel: metric(vehicle.batteryLevel, '%'),
    serialNumber: vehicle.serialNumber || '—',
    chipNumber: vehicle.chipNumber || '—',
    temperature: metric(vehicle.temperature, '°C'),
    probeState: vehicle.probeState || '—',
    waterPresence:
      vehicle.waterPresence === undefined
        ? '—'
        : vehicle.waterPresence
          ? "Présence d'eau"
          : "Pas de présence d'eau",
    dateTime,
    lastUpdate: vehicle.lastUpdate || '—',
    cardId: vehicle.cardId || '—',
  };
}

function IconAvatar3d({
  iconType,
  size = 64,
}: {
  iconType?: VehicleIconType;
  size?: number;
}) {
  return (
    <div
      className="rounded-full border-[3px] border-white shadow-md flex items-center justify-center shrink-0 bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{
        __html: vehicleIcon3dMarkup(iconType, Math.round(size * 0.76)),
      }}
    />
  );
}

type InfoField = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
};

type InfoSection = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  fields: InfoField[];
};

function MetricCard({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-blue-100 bg-white px-3 py-3 flex items-center gap-2.5 shadow-[0_4px_16px_rgba(30,64,175,0.04)]">
      <span className="h-9 w-9 rounded-full bg-blue-50 text-blue-950 inline-flex items-center justify-center shrink-0">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-blue-950 truncate">{value}</p>
        <p className="text-[11px] font-medium text-blue-700/65 leading-4">
          {label}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  value,
  label,
  detailLabel,
  detailValue,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
  detailLabel: string;
  detailValue: string;
}) {
  return (
    <div className="w-full min-w-0 px-3 py-3 flex items-center gap-3">
      <span className="h-9 w-9 rounded-full bg-blue-50 text-blue-950 inline-flex items-center justify-center shrink-0">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold text-blue-950 leading-5 break-words">
          {value}
        </span>
        <span className="block text-[11px] font-medium text-blue-700/60">
          {label}
        </span>
        <span className="mt-1 block text-[11px] font-medium leading-4 text-blue-700/60">
          {detailLabel}{' '}
          <span className="font-semibold text-blue-950">{detailValue}</span>
        </span>
      </span>
    </div>
  );
}

function AlertTile({
  icon: Icon,
  count,
  label,
  selected,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  count: number;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative rounded-xl border px-2 py-3 text-center min-w-0 ${
        selected
          ? 'border-rose-500 bg-white shadow-sm ring-2 ring-rose-200'
          : 'border-rose-100 bg-gradient-to-b from-rose-50/80 to-white'
      }`}
    >
      <span className="absolute right-2 top-2 h-5 min-w-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold inline-flex items-center justify-center">
        {count}
      </span>
      <Icon className="h-5 w-5 text-rose-500 mx-auto mt-2" />
      <p className="mt-2 text-[10px] font-semibold text-rose-500 truncate">
        {label}
      </p>
    </button>
  );
}

type VehicleAlertId = 'moteur' | 'documents' | 'carburant' | 'critique';

const VEHICLE_ALERTS: {
  id: VehicleAlertId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: string[];
}[] = [
  {
    id: 'moteur',
    label: 'Moteur',
    icon: Wrench,
    items: ['Température moteur élevée'],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    items: ['Assurance à renouveler', 'Contrôle technique expiré'],
  },
  {
    id: 'carburant',
    label: 'Carburant',
    icon: Fuel,
    items: ['Niveau de carburant bas'],
  },
  {
    id: 'critique',
    label: 'Critique',
    icon: AlertTriangle,
    items: ['Alerte critique non acquittée'],
  },
];

interface VehicleMapInfoCardProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export function VehicleMapInfoCard({
  vehicle,
  onClose,
}: VehicleMapInfoCardProps) {
  return <VehiclePopupPages key={vehicle.id} vehicle={vehicle} onClose={onClose} />;
}

function VehiclePopupPages({
  vehicle,
  onClose,
}: VehicleMapInfoCardProps) {
  const [page, setPage] = useState(0);
  const [openAlert, setOpenAlert] = useState<VehicleAlertId | null>(null);
  const info = buildInfo(withVehiclePopupDemo(vehicle));
  const title = vehicle.matricule || vehicle.name;
  const isMoving = vehicle.status === 'active';

  const sections: InfoSection[] = [
    {
      title: 'Véhicule',
      icon: Route,
      fields: [
        { label: 'Kilométrage', value: info.mileage, icon: Route },
        { label: 'Heures moteur', value: info.engineHours, icon: CalendarDays },
      ],
    },
    {
      title: 'Carburant',
      icon: Fuel,
      fields: [
        { label: 'Volume', value: info.fuelVolume, icon: Fuel },
        {
          label: 'Consommation de carburant',
          value: info.fuelConsumption,
          icon: Gauge,
        },
      ],
    },
    {
      title: 'Équipement / Batterie',
      icon: BatteryCharging,
      fields: [
        {
          label: 'Niveau de batterie',
          value: info.batteryLevel,
          icon: BatteryCharging,
        },
        { label: 'Numéro de série', value: info.serialNumber, icon: ClipboardList },
      ],
    },
    {
      title: 'Capteurs',
      icon: RadioTower,
      fields: [
        { label: 'Température', value: info.temperature, icon: Thermometer },
        { label: 'État de la sonde', value: info.probeState, icon: RadioTower },
        { label: "Présence d'eau", value: info.waterPresence, icon: Waves },
      ],
    },
    {
      title: 'Identification',
      icon: CreditCard,
      fields: [
        { label: 'Identifiant de carte', value: info.cardId, icon: CreditCard },
      ],
    },
  ];
  const section = page === 0 ? null : sections[page - 1];
  const pageTitle = section?.title ?? 'Vue d’ensemble';
  const pageCount = sections.length + 1;
  const selectedAlert = VEHICLE_ALERTS.find((alert) => alert.id === openAlert);

  return (
    <div
      className="w-[460px] max-w-[calc(100vw-1rem)] max-h-[calc(100vh-2rem)] overflow-hidden rounded-[22px] border border-blue-100 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.24)] backdrop-blur-xl flex flex-col text-blue-950"
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <div className="p-4 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <IconAvatar3d iconType={vehicle.iconType} />
          <div className="min-w-0 flex-1">
            <h3 className="text-[20px] font-bold tracking-tight truncate">
              {title}
            </h3>
            <p className="mt-1 text-[13px] font-semibold text-blue-700/55 truncate">
              {info.equipmentId}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-blue-950 truncate">
              <span className="font-medium text-blue-700/55">
                Numéro de puce{' '}
              </span>
              {info.chipNumber}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-400">Données de démonstration</p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold shrink-0 ${
              isMoving
                ? 'bg-emerald-50 text-emerald-700'
                : vehicle.status === 'idle'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isMoving
                  ? 'bg-emerald-500'
                  : vehicle.status === 'idle'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
              }`}
            />
            {isMoving
              ? 'En mouvement'
              : vehicle.status === 'idle'
                ? 'À l’arrêt'
                : 'Hors ligne'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-full inline-flex items-center justify-center text-blue-950/60 hover:bg-slate-100 hover:text-blue-950 transition-colors shrink-0"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MetricCard icon={Gauge} value={info.speed} label="Vitesse" />
          <MetricCard icon={Fuel} value={info.fuelLevel} label="Carburant" />
          <MetricCard
            icon={Thermometer}
            value={info.engineTemp}
            label="Temp. moteur"
          />
        </div>
      </div>

      <div className="mx-4 overflow-hidden rounded-xl border border-blue-100 bg-white">
      {selectedAlert ? (
        <section aria-label={selectedAlert.label}>
          <div className="flex items-center gap-2 border-b border-rose-100 bg-rose-50/70 px-3 py-2.5">
            <selectedAlert.icon className="h-4 w-4 text-rose-600" />
            <h4 className="text-xs font-bold text-rose-700">{selectedAlert.label}</h4>
          </div>
          <ul className="divide-y divide-rose-50">
            {selectedAlert.items.map((item) => (
              <li key={item} className="px-3 py-3 text-xs font-semibold text-blue-950">
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : section ? (
        <section aria-label={section.title}>
          <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50/60 px-3 py-2.5">
            <section.icon className="h-4 w-4 text-blue-700" />
            <h4 className="text-xs font-bold">{section.title}</h4>
          </div>
          <dl className="divide-y divide-blue-50">
            {section.fields.map((field) => (
              <div key={field.label} className="flex items-center gap-3 px-3 py-3">
                <field.icon className="h-4 w-4 shrink-0 text-blue-600" />
                <dt className="min-w-0 flex-1 text-[11px] font-medium text-slate-500">{field.label}</dt>
                <dd className="max-w-[58%] break-words text-right text-xs font-semibold">{field.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : (
        <div className="divide-y divide-blue-50">
          <SummaryRow
            icon={MapPin}
            value={info.address}
            label="Adresse"
            detailLabel="Position GPS"
            detailValue={info.gpsPosition}
          />
          <SummaryRow
            icon={CalendarDays}
            value={info.dateTime}
            label="Date / heure"
            detailLabel="Dernière mise à jour"
            detailValue={info.lastUpdate}
          />
          <SummaryRow
            icon={UserRound}
            value={`${info.driver} · ${info.driverId}`}
            label="Chauffeur / Identifiant"
            detailLabel="Temps de conduite"
            detailValue={info.drivingTime}
          />
        </div>
      )}
      </div>

      <nav aria-label="Pagination des informations véhicule" className="mx-4 mt-3 flex shrink-0 items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-2">
        <button type="button" aria-label="Page précédente" disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div aria-live="polite" aria-atomic="true" className="min-w-0 text-center">
          <p className="text-xs font-semibold">{pageTitle}</p>
          <p className="mt-0.5 text-[11px] tabular-nums text-blue-600">{page + 1} / {pageCount}</p>
        </div>
        <button type="button" aria-label="Page suivante" disabled={page === pageCount - 1} onClick={() => setPage((current) => current + 1)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>

      <div className="m-4 grid shrink-0 grid-cols-4 gap-2 rounded-xl border border-rose-100 bg-rose-50/30 p-2">
        {VEHICLE_ALERTS.map((alert) => (
          <AlertTile
            key={alert.id}
            icon={alert.icon}
            count={alert.items.length}
            label={alert.label}
            selected={openAlert === alert.id}
            onClick={() =>
              setOpenAlert((current) => (current === alert.id ? null : alert.id))
            }
          />
        ))}
      </div>
    </div>
  );
}