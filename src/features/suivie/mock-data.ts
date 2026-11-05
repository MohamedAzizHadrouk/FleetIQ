import type { Vehicle } from '@/types';
import {
  SUIVIE_DEPARTMENTS,
  type SuivieAction,
  type SuivieDepartment,
} from './column-defs';
import {
  dashboardSortLabel,
  EMPTY_FLEET_REMINDERS,
  type FleetReminderFlags,
} from './fleet-reminders';

/** Deterministic PRNG from string seed */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0');
}

function formatDisplay(date: Date): string {
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function parseSuivieDate(value: string): Date | null {
  if (!value?.trim()) return null;
  // Expected: YYYY/MM/DD HH:mm:ss or ISO-ish
  const normalized = value.replace(/\//g, '-').replace(' ', 'T');
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function hoursAgo(rand: () => number, maxHours: number): Date {
  const ms = Math.floor(rand() * maxHours * 3600_000);
  return new Date(Date.now() - ms);
}

function computeHorodatage(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return minutes <= 1 ? '1 mn' : `${minutes} mn`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.floor(hours / 24)} j`;
}

export function assignDepartment(vehicle: Vehicle, index: number): SuivieDepartment {
  if (vehicle.departmentId && SUIVIE_DEPARTMENTS.includes(vehicle.departmentId as SuivieDepartment)) {
    return vehicle.departmentId as SuivieDepartment;
  }
  return SUIVIE_DEPARTMENTS[index % SUIVIE_DEPARTMENTS.length];
}

export const ALERT_TYPES = [
  'Toutes les alertes',
  'Dépassement de vitesse',
  'Tous les geofences',
  'Sortie/entrée du pays',
  "Entrée/Sortie de l'itineraire",
  'Remorquage',
  'Batterie débranchée',
  'Message reçue',
  'Alerte de température',
  'Alerte de carburant',
  'Conduite agressive',
  'SOS',
  'Taxi libre/occupé',
  'Contact On/Off',
  'Malle ouverte/fermée',
  'Capot ouvert/fermé',
  'Porte ouverte/fermée',
  'Alerte de maintenance',
  'Stop',
  'Signal GPS détecté/perdu',
  'Stop de longue durée',
  'Dépassement temps de conduite',
  'Identification du conducteur',
  'Alerte de parc',
  'Photo reçue',
  'Enlèvement',
  'Inconnu',
] as const;

const COMMAND_TYPES = [
  'Demande position',
  'Arrêt à distance',
  'Activation contact',
  'Demande photo',
  'Réinitialisation GPS',
] as const;

const COMMAND_STATUSES = ['Exécutée', 'En attente', 'Échouée', 'Expirée'] as const;

export interface SuivieRowBase {
  id: string;
  vehicleId: string;
  vehicleName: string;
  department: SuivieDepartment;
  /** ISO used for date filtering */
  filterDate: string;
  [key: string]: string | number | boolean | FleetReminderFlags | undefined;
}

export type TrackingRow = SuivieRowBase & {
  name: string;
  positionAddress: string;
  date: string;
  horodatage: string;
  speed: string;
  Mileage: string;
  engineHours: string;
  LastAlert: string;
  Contact: string;
  engine: string;
  FuelLevel: string;
  Temperature: string;
  EngineTemperature: string;
  driver: string;
  Department: string;
  Equipment: string;
  SimCardNumber: string;
  ChassisNumber: string;
  BatteryLevel: string;
  HumidityLevel: string;
  ElockBattery: string;
  LockStatus: string;
  SealStatus: string;
  TearDownStatus: string;
  TotalFuel: string;
  Latitude: string;
  Longitude: string;
  CardId: string;
  waterdetected1: string;
  SNSonde1: string;
  VolumeSonde1: string;
  TemperatureSonde1: string;
  BatteryLevelSonde1: string;
  StatusConnectedSonde1: string;
  AdBlueLevel: string;
  AxleWeight1st: string;
  AxleWeight: string;
  AxleWeight3rd: string;
  AxleWeight4th: string;
  RapidBrackings: string;
  RapidAccelerations: string;
  SpecialityName: string;
  Dashboard: string;
  fleetReminders: FleetReminderFlags;
};

export type AlertRow = SuivieRowBase & {
  Vehicle: string;
  Date: string;
  Type: string;
  Address: string;
  Speed: string;
  Mileage: string;
  Chassis: string;
  Action: string;
};

export type RunStopRow = SuivieRowBase & {
  Status: string;
  Matricule: string;
  Place: string;
  Distance: string;
  Period: string;
  StartDate: string;
  AvgSpeed: string;
  Action: string;
};

export type TrajectoryRow = SuivieRowBase & {
  StopRun: string;
  AlertIcon: string;
  OtherInfo: string;
  StartDate: string;
  Period: string;
  Speed: string;
  Distance: string;
  Place: string;
  Fuel: string;
  BatteryLevel: string;
  IgnOn: string;
  FuelConsumptionAvgInL100Km: string;
  Direction: string;
  CentralLock: string;
  Temperature: string;
  EngineHours: string;
  EngineTemperature: string;
  RPM: string;
  Latitude: string;
  Longitude: string;
  Report_Reason: string;
  LockStatus: string;
  SealStatus: string;
  ElockBattery: string;
  Mileage: string;
  AxleWeight1st: string;
  AxleWeight: string;
  AxleWeight3rd: string;
  AxleWeight4th: string;
  RapidBrackings: string;
  RapidAccelerations: string;
  AdBlueLevel: string;
  HumidityLevel: string;
  SNSonde1: string;
  VolumeSonde1: string;
  TemperatureSonde1: string;
  BatteryLevelSonde1: string;
  StatusConnectedSonde1: string;
  waterdetected1: string;
};

export type CommandRow = SuivieRowBase & {
  SendDate: string;
  Vehicle: string;
  CommandType: string;
  Status: string;
};

export type SuivieRow =
  | TrackingRow
  | AlertRow
  | RunStopRow
  | TrajectoryRow
  | CommandRow;

export interface AppliedSuivieFilters {
  action: SuivieAction;
  vehicleIds: Set<string>;
  departments: Set<string>;
  startDate: string;
  endDate: string;
  alertTypes: Set<string>;
}

function enrichVehicleMeta(vehicle: Vehicle, index: number) {
  const department = assignDepartment(vehicle, index);
  const rand = seededRandom(`meta-${vehicle.id}`);
  const acquisition = hoursAgo(rand, 20);
  return { department, rand, acquisition };
}

function vehicleSpeedKmh(vehicle: Vehicle, rand: () => number): number {
  if (vehicle.status === 'offline' || vehicle.status === 'idle') return 0;
  if (vehicle.speed > 0) return vehicle.speed;
  return 20 + Math.floor(rand() * 80);
}

function lastAlertForVehicle(vehicle: Vehicle, speedVal: number, rand: () => number): string {
  if (vehicle.status === 'offline') {
    return pick(rand, ['Signal GPS détecté/perdu', 'Batterie débranchée', 'Stop de longue durée']);
  }
  if (vehicle.status === 'idle') {
    return pick(rand, ['Stop', 'Stop de longue durée', '—', 'Contact On/Off']);
  }
  if (speedVal >= 110) return 'Dépassement de vitesse';
  if (vehicle.batteryLevel > 0 && vehicle.batteryLevel < 25) return 'Batterie débranchée';
  return pick(rand, ['—', '—', 'Conduite agressive', 'Alerte de carburant']);
}

function alertTypesForVehicle(vehicle: Vehicle, speedVal: number): readonly string[] {
  if (vehicle.status === 'offline') {
    return ['Signal GPS détecté/perdu', 'Batterie débranchée', 'Stop de longue durée', 'Enlèvement'];
  }
  if (vehicle.status === 'idle') {
    return ['Stop', 'Stop de longue durée', 'Contact On/Off', 'Alerte de parc'];
  }
  const types = [
    'Conduite agressive',
    'Alerte de carburant',
    'Alerte de température',
    'Tous les geofences',
    "Entrée/Sortie de l'itineraire",
  ];
  if (speedVal >= 90) return ['Dépassement de vitesse', ...types];
  return types;
}

function commandStatusForVehicle(
  vehicle: Vehicle,
  rand: () => number
): (typeof COMMAND_STATUSES)[number] {
  if (vehicle.status === 'offline') {
    return pick(rand, ['Échouée', 'Expirée', 'En attente'] as const);
  }
  if (vehicle.status === 'idle') {
    return pick(rand, ['Exécutée', 'Exécutée', 'En attente'] as const);
  }
  return pick(rand, ['Exécutée', 'Exécutée', 'Exécutée', 'En attente'] as const);
}

export function buildTrackingRows(vehicles: Vehicle[]): TrackingRow[] {
  return vehicles.map((vehicle, index) => {
    const { department, rand, acquisition } = enrichVehicleMeta(vehicle, index);
    const speedVal = vehicleSpeedKmh(vehicle, rand);
    const mileage = Math.floor(rand() * 80000) + 12000;
    const engineH = Math.floor(rand() * 3000) + 300;
    const fuel =
      vehicle.status === 'offline'
        ? Math.floor(rand() * 40)
        : Math.floor(25 + rand() * 75);
    const [lat, lng] = vehicle.coordinates;
    const contactOn = vehicle.status === 'active' || (vehicle.status === 'idle' && rand() > 0.35);
    const engineOn = vehicle.status === 'active' || (vehicle.status === 'idle' && rand() > 0.5);

    return {
      id: `trk-${vehicle.id}`,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      department,
      filterDate: acquisition.toISOString(),
      name: vehicle.matricule || vehicle.name,
      positionAddress: vehicle.location,
      date: formatDisplay(acquisition),
      horodatage: vehicle.lastUpdate || computeHorodatage(acquisition),
      speed: `${speedVal} km/h`,
      Mileage: `${mileage} km`,
      engineHours: `${engineH}:${pad(Math.floor(rand() * 60))}:${pad(Math.floor(rand() * 60))}`,
      LastAlert: lastAlertForVehicle(vehicle, speedVal, rand),
      Contact: contactOn ? 'ON' : 'OFF',
      engine: engineOn ? 'ON' : 'OFF',
      FuelLevel: `${fuel}%`,
      Temperature: `${(15 + rand() * 20).toFixed(1)} °C`,
      EngineTemperature: `${Math.floor(
        engineOn ? 70 + rand() * 40 : 25 + rand() * 20
      )} °C`,
      driver: vehicle.driver || '—',
      Department: department,
      Equipment: `EQ-${pad(Number(vehicle.id.replace(/\D/g, '')) || index + 1, 4)}`,
      SimCardNumber: `216${Math.floor(10000000 + rand() * 89999999)}`,
      ChassisNumber: `VIN${pad(1000 + index, 4)}`,
      BatteryLevel: `${vehicle.batteryLevel}%`,
      HumidityLevel: `${Math.floor(30 + rand() * 50)}%`,
      ElockBattery: `${Math.floor(rand() * 100)}%`,
      LockStatus: rand() > 0.5 ? 'Verrouillé' : 'Déverrouillé',
      SealStatus: rand() > 0.3 ? 'Intact' : 'Rompu',
      TearDownStatus: rand() > 0.9 ? 'Oui' : 'Non',
      TotalFuel: `${(fuel * 0.8).toFixed(1)} L`,
      Latitude: lat.toFixed(6),
      Longitude: lng.toFixed(6),
      CardId: `CARD-${pad(index + 1, 3)}`,
      waterdetected1: rand() > 0.85 ? 'Oui' : 'Non',
      SNSonde1: `SN${Math.floor(100000 + rand() * 900000)}`,
      VolumeSonde1: `${(rand() * 200).toFixed(1)} L`,
      TemperatureSonde1: `${(10 + rand() * 15).toFixed(1)} °C`,
      BatteryLevelSonde1: `${Math.floor(rand() * 100)}%`,
      StatusConnectedSonde1:
        vehicle.status === 'offline'
          ? 'Déconnectée'
          : rand() > 0.15
            ? 'Connectée'
            : 'Déconnectée',
      AdBlueLevel: `${Math.floor(rand() * 100)}%`,
      AxleWeight1st: `${Math.floor(2000 + rand() * 3000)} kg`,
      AxleWeight: `${Math.floor(3000 + rand() * 4000)} kg`,
      AxleWeight3rd: `${Math.floor(2500 + rand() * 3500)} kg`,
      AxleWeight4th: `${Math.floor(2000 + rand() * 3000)} kg`,
      RapidBrackings: String(
        vehicle.status === 'active' ? Math.floor(rand() * 12) : Math.floor(rand() * 3)
      ),
      RapidAccelerations: String(
        vehicle.status === 'active' ? Math.floor(rand() * 15) : Math.floor(rand() * 3)
      ),
      SpecialityName: pick(rand, ['Livraison', 'Transport', 'Frigo', 'Benne']),
      ...(() => {
        const fleetReminders =
          vehicle.status === 'offline'
            ? { ...EMPTY_FLEET_REMINDERS }
            : {
                maintenance: rand() < 0.3,
                document: rand() < 0.25,
                damage: rand() < 0.2,
                payment: rand() < 0.28,
                expiredContract: rand() < 0.22,
              };
        return {
          fleetReminders,
          Dashboard: dashboardSortLabel(fleetReminders),
        };
      })(),
    };
  });
}

export function buildAlertRows(vehicles: Vehicle[]): AlertRow[] {
  const rows: AlertRow[] = [];
  vehicles.forEach((vehicle, index) => {
    const { department, rand } = enrichVehicleMeta(vehicle, index);
    const speedVal = vehicleSpeedKmh(vehicle, rand);
    const types = alertTypesForVehicle(vehicle, speedVal);
    const count =
      vehicle.status === 'offline'
        ? 1 + Math.floor(rand() * 2)
        : 1 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      const when =
        vehicle.status === 'offline' ? hoursAgo(rand, 48) : hoursAgo(rand, 20);
      const type =
        i === 0 && vehicle.status === 'active'
          ? 'Dépassement de vitesse'
          : pick(rand, types);
      const speed =
        type === 'Dépassement de vitesse'
          ? Math.max(speedVal, 110 + Math.floor(rand() * 40))
          : speedVal;
      rows.push({
        id: `alt-${vehicle.id}-${i}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        department,
        filterDate: when.toISOString(),
        Vehicle: vehicle.matricule || vehicle.name,
        Date: formatDisplay(when),
        Type: type,
        Address: vehicle.location,
        Speed: `${speed} km/h`,
        Mileage: `${Math.floor(10000 + rand() * 70000)} km`,
        Chassis: `VIN${pad(1000 + index, 4)}`,
        Action: 'Carte',
      });
    }
  });
  return rows;
}

export function buildRunStopRows(vehicles: Vehicle[]): RunStopRow[] {
  const rows: RunStopRow[] = [];
  vehicles.forEach((vehicle, index) => {
    const { department, rand } = enrichVehicleMeta(vehicle, index);
    const speedVal = vehicleSpeedKmh(vehicle, rand);
    const count = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < count; i++) {
      const begin = hoursAgo(rand, 20);
      // Latest segment matches current status; older ones may vary for history
      const isRun =
        i === 0
          ? vehicle.status === 'active'
          : vehicle.status === 'offline'
            ? false
            : rand() > 0.45;
      const periodMin = isRun
        ? 15 + Math.floor(rand() * 120)
        : 20 + Math.floor(rand() * 180);
      let status: string;
      if (i === 0 && vehicle.status === 'idle') status = 'Ralenti';
      else if (isRun) status = 'Circulation';
      else if (rand() < 0.15) status = 'Ralenti';
      else status = 'Stop';
      const avgSpeed =
        status === 'Circulation'
          ? Math.max(
              15,
              Math.floor(speedVal * (0.7 + rand() * 0.4)) ||
                20 + Math.floor(rand() * 50)
            )
          : status === 'Ralenti'
            ? 3 + Math.floor(rand() * 8)
            : 0;
      rows.push({
        id: `rs-${vehicle.id}-${i}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        department,
        filterDate: begin.toISOString(),
        Status: status,
        Matricule: vehicle.matricule || vehicle.name,
        Place: vehicle.location,
        Distance: `${
          status === 'Circulation'
            ? Math.floor(5 + rand() * 400)
            : Math.floor(rand() * 3)
        } km`,
        Period: `${periodMin} min`,
        StartDate: formatDisplay(begin),
        AvgSpeed: `${avgSpeed} km/h`,
        Action: 'Zoom',
      });
    }
  });
  return rows;
}

export function buildTrajectoryRows(vehicles: Vehicle[]): TrajectoryRow[] {
  const rows: TrajectoryRow[] = [];
  vehicles.forEach((vehicle, index) => {
    const { department, rand } = enrichVehicleMeta(vehicle, index);
    const speedVal = vehicleSpeedKmh(vehicle, rand);
    const count = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      const begin = hoursAgo(rand, 20);
      const isRun =
        i === 0
          ? vehicle.status === 'active'
          : vehicle.status === 'offline'
            ? false
            : rand() > 0.4;
      const [lat, lng] = vehicle.coordinates;
      const fuelLow = vehicle.status === 'offline' ? rand() > 0.5 : rand() > 0.85;
      const fuelPct = fuelLow ? Math.floor(rand() * 15) : Math.floor(20 + rand() * 80);
      const battery =
        vehicle.status === 'offline'
          ? 0
          : Math.max(5, Math.min(100, vehicle.batteryLevel + Math.floor((rand() - 0.5) * 10)));
      rows.push({
        id: `trj-${vehicle.id}-${i}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        department,
        filterDate: begin.toISOString(),
        StopRun: isRun ? 'Circulation' : 'Stop',
        AlertIcon:
          vehicle.status === 'offline' || (isRun && speedVal >= 110) || fuelLow
            ? '⚠'
            : rand() > 0.85
              ? '⚠'
              : '—',
        OtherInfo:
          vehicle.status === 'offline'
            ? 'GPS perdu'
            : isRun
              ? pick(rand, ['GPS OK', 'Ignition', 'En route'])
              : pick(rand, ['Idle', 'Stop', 'Ignition']),
        StartDate: formatDisplay(begin),
        Period: `${10 + Math.floor(rand() * 120)} min`,
        Speed: `${isRun ? (i === 0 ? speedVal : Math.floor(20 + rand() * 80)) : 0} km/h`,
        Distance: `${(isRun ? rand() * 50 : rand() * 2).toFixed(1)} km`,
        Place: vehicle.location,
        Fuel: fuelLow ? `${fuelPct}% ↓` : `${fuelPct}%`,
        BatteryLevel: `${battery}%`,
        IgnOn: isRun || vehicle.status === 'idle' ? 'ON' : 'OFF',
        FuelConsumptionAvgInL100Km: `${(5 + rand() * 12).toFixed(1)}`,
        Direction: `${Math.floor(vehicle.heading ?? rand() * 360)}°`,
        CentralLock: rand() > 0.5 ? 'ON' : 'OFF',
        Temperature: `${(12 + rand() * 25).toFixed(1)} °C`,
        EngineHours: `${Math.floor(200 + rand() * 2000)} h`,
        EngineTemperature: `${Math.floor(isRun ? 70 + rand() * 40 : 25 + rand() * 20)} °C`,
        RPM: String(isRun ? Math.floor(800 + rand() * 3200) : Math.floor(rand() * 200)),
        Latitude: (lat + (rand() - 0.5) * 0.02).toFixed(6),
        Longitude: (lng + (rand() - 0.5) * 0.02).toFixed(6),
        Report_Reason: pick(rand, ['Timer', 'Ignition', 'Distance', 'Alert']),
        LockStatus: rand() > 0.5 ? 'Verrouillé' : 'Déverrouillé',
        SealStatus: rand() > 0.3 ? 'Intact' : 'Rompu',
        ElockBattery: `${Math.floor(rand() * 100)}%`,
        Mileage: `${Math.floor(10000 + rand() * 70000)} km`,
        AxleWeight1st: `${Math.floor(2000 + rand() * 3000)} kg`,
        AxleWeight: `${Math.floor(3000 + rand() * 4000)} kg`,
        AxleWeight3rd: `${Math.floor(2500 + rand() * 3500)} kg`,
        AxleWeight4th: `${Math.floor(2000 + rand() * 3000)} kg`,
        RapidBrackings: String(isRun ? Math.floor(rand() * 8) : 0),
        RapidAccelerations: String(isRun ? Math.floor(rand() * 10) : 0),
        AdBlueLevel: `${Math.floor(rand() * 100)}%`,
        HumidityLevel: `${Math.floor(30 + rand() * 50)}%`,
        SNSonde1: `SN${Math.floor(100000 + rand() * 900000)}`,
        VolumeSonde1: `${(rand() * 200).toFixed(1)} L`,
        TemperatureSonde1: `${(10 + rand() * 15).toFixed(1)} °C`,
        BatteryLevelSonde1: `${Math.floor(rand() * 100)}%`,
        StatusConnectedSonde1:
          vehicle.status === 'offline'
            ? 'Déconnectée'
            : rand() > 0.2
              ? 'Connectée'
              : 'Déconnectée',
        waterdetected1: rand() > 0.85 ? 'Oui' : 'Non',
      });
    }
  });
  return rows;
}

export function buildCommandRows(vehicles: Vehicle[]): CommandRow[] {
  const rows: CommandRow[] = [];
  vehicles.forEach((vehicle, index) => {
    const { department, rand } = enrichVehicleMeta(vehicle, index);
    const count = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < count; i++) {
      const when = hoursAgo(rand, 20);
      const status = commandStatusForVehicle(vehicle, rand);
      const type =
        vehicle.status === 'offline'
          ? pick(rand, ['Demande position', 'Réinitialisation GPS'] as const)
          : pick(rand, COMMAND_TYPES);
      rows.push({
        id: `cmd-${vehicle.id}-${i}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        department,
        filterDate: when.toISOString(),
        SendDate: formatDisplay(when),
        Vehicle: vehicle.matricule || vehicle.name,
        CommandType: type,
        Status: status,
      });
    }
  });
  return rows;
}

export function buildRowsForAction(
  action: SuivieAction,
  vehicles: Vehicle[]
): SuivieRow[] {
  switch (action) {
    case 'suivie_generale':
      return buildTrackingRows(vehicles);
    case 'alertes':
      return buildAlertRows(vehicles);
    case 'stop_circulation':
      return buildRunStopRows(vehicles);
    case 'trajectoire':
      return buildTrajectoryRows(vehicles);
    case 'commandes':
      return buildCommandRows(vehicles);
    default:
      return [];
  }
}

export function applySuivieFilters(
  rows: SuivieRow[],
  filters: AppliedSuivieFilters
): SuivieRow[] {
  const { vehicleIds, departments, startDate, endDate, alertTypes, action } =
    filters;

  const start = parseSuivieDate(startDate);
  const end = parseSuivieDate(endDate);

  const hasVehicleFilter = vehicleIds.size > 0;
  const hasDeptFilter = departments.size > 0;

  return rows.filter((row) => {
    // Vehicles OR departments: if both set, match either (union)
    if (hasVehicleFilter || hasDeptFilter) {
      const matchVehicle = hasVehicleFilter && vehicleIds.has(row.vehicleId);
      const matchDept = hasDeptFilter && departments.has(row.department);
      if (!matchVehicle && !matchDept) return false;
    }

    if (action !== 'suivie_generale' && (start || end)) {
      const rowDate = new Date(row.filterDate);
      if (Number.isNaN(rowDate.getTime())) return false;
      if (start && rowDate < start) return false;
      if (end && rowDate > end) return false;
    }

    if (action === 'alertes' && alertTypes.size > 0) {
      const concrete = [...alertTypes].filter((t) => t !== 'Toutes les alertes');
      if (concrete.length > 0) {
        const type = String((row as AlertRow).Type ?? '');
        if (!concrete.includes(type)) return false;
      }
    }

    return true;
  });
}

export function getFilteredVehicleIds(rows: SuivieRow[]): string[] {
  return [...new Set(rows.map((r) => r.vehicleId))];
}
