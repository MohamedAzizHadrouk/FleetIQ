import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BatteryCharging,
  CalendarClock,
  Clock,
  Compass,
  Cpu,
  CreditCard,
  Droplet,
  Droplets,
  Fuel,
  Gauge,
  Hash,
  History,
  MapPin,
  Navigation,
  Plug,
  RadioTower,
  Route,
  Thermometer,
  ThermometerSun,
  Timer,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import type { Vehicle } from '@/types';
import { headingToCompass, normalizeHeading } from './vehicle-sprite';

/**
 * Every piece of information the vehicle card can show, grouped by section.
 * The user chooses which ones are visible (saved per browser).
 */

export type FieldSection = 'position' | 'moteur' | 'carburant' | 'chauffeur' | 'equipement' | 'capteurs';

export const FIELD_SECTIONS: { id: FieldSection; label: string }[] = [
  { id: 'position', label: 'Position' },
  { id: 'moteur', label: 'Véhicule & moteur' },
  { id: 'carburant', label: 'Carburant' },
  { id: 'chauffeur', label: 'Chauffeur' },
  { id: 'equipement', label: 'Équipement GPS' },
  { id: 'capteurs', label: 'Capteurs' },
];

export interface VehicleField {
  id: string;
  label: string;
  section: FieldSection;
  icon: LucideIcon;
  value: (v: Vehicle) => string;
  /** Show a copy button (identifiers) */
  copy?: boolean;
}

const EMPTY = '—';

function num(n: number | undefined | null, unit = '', digits = 0) {
  if (n === undefined || n === null || Number.isNaN(n)) return EMPTY;
  const s = n.toLocaleString('fr-FR', { maximumFractionDigits: digits });
  return unit ? `${s} ${unit}` : s;
}

function text(s: string | undefined | null) {
  return s && String(s).trim() ? String(s) : EMPTY;
}

function engineHours(h: Vehicle['engineHours']) {
  if (h === undefined || h === null || h === '') return EMPTY;
  if (typeof h === 'string') return h;
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${hours.toLocaleString('fr-FR')} h ${String(minutes).padStart(2, '0')} min`;
}

export const VEHICLE_FIELDS: VehicleField[] = [
  // Position
  { id: 'adresse', label: 'Adresse', section: 'position', icon: MapPin, value: (v) => text(v.location) },
  {
    id: 'gps',
    label: 'Coordonnées GPS',
    section: 'position',
    icon: Navigation,
    value: (v) => `${v.coordinates[0].toFixed(6)}, ${v.coordinates[1].toFixed(6)}`,
    copy: true,
  },
  {
    id: 'dateHeure',
    label: 'Date / heure',
    section: 'position',
    icon: CalendarClock,
    value: (v) =>
      v.timestamp ? new Date(v.timestamp).toLocaleString('fr-FR', { timeZone: 'Africa/Tunis' }) : text(v.lastUpdate),
  },
  { id: 'horodatage', label: 'Horodatage', section: 'position', icon: History, value: (v) => text(v.lastUpdate) },
  { id: 'vitesse', label: 'Vitesse', section: 'position', icon: Gauge, value: (v) => num(v.speed, 'km/h') },
  {
    id: 'cap',
    label: 'Cap',
    section: 'position',
    icon: Compass,
    value: (v) => (typeof v.heading === 'number' ? `${Math.round(normalizeHeading(v.heading))}° ${headingToCompass(v.heading)}` : EMPTY),
  },
  // Véhicule & moteur
  { id: 'kilometrage', label: 'Kilométrage', section: 'moteur', icon: Route, value: (v) => num(v.mileage, 'km') },
  { id: 'heuresMoteur', label: 'Heures moteur', section: 'moteur', icon: Timer, value: (v) => engineHours(v.engineHours) },
  { id: 'tempMoteur', label: 'Température moteur', section: 'moteur', icon: Thermometer, value: (v) => num(v.engineTemperature, '°C') },
  // Carburant
  { id: 'niveauCarburant', label: 'Niveau du carburant', section: 'carburant', icon: Fuel, value: (v) => num(v.fuelLevel, '%') },
  { id: 'volumeCarburant', label: 'Volume', section: 'carburant', icon: Droplet, value: (v) => num(v.fuelVolume, 'L', 1) },
  { id: 'consommation', label: 'Consommation', section: 'carburant', icon: Gauge, value: (v) => num(v.fuelConsumption, 'L/100 km', 1) },
  // Chauffeur
  { id: 'chauffeur', label: 'Chauffeur', section: 'chauffeur', icon: UserRound, value: (v) => text(v.driver) },
  { id: 'carte', label: 'Identifiant de carte', section: 'chauffeur', icon: CreditCard, value: (v) => text(v.cardId), copy: true },
  { id: 'tempsConduite', label: 'Temps de conduite', section: 'chauffeur', icon: Clock, value: (v) => text(v.drivingTime) },
  // Équipement GPS
  { id: 'imei', label: 'IMEI équipement', section: 'equipement', icon: Hash, value: (v) => text(v.imei), copy: true },
  { id: 'numeroSerie', label: 'Numéro de série', section: 'equipement', icon: Cpu, value: (v) => text(v.serialNumber), copy: true },
  { id: 'numeroPuce', label: 'Numéro de puce', section: 'equipement', icon: RadioTower, value: (v) => text(v.chipNumber), copy: true },
  { id: 'batterie', label: 'Niveau de batterie', section: 'equipement', icon: BatteryCharging, value: (v) => num(v.batteryLevel, '%') },
  { id: 'alimentation', label: 'Alimentation', section: 'equipement', icon: Plug, value: (v) => num(v.powerVoltage, 'V', 1) },
  // Capteurs
  { id: 'temperature', label: 'Température', section: 'capteurs', icon: ThermometerSun, value: (v) => num(v.temperature, '°C', 1) },
  { id: 'sonde', label: 'État de la sonde', section: 'capteurs', icon: RadioTower, value: (v) => text(v.probeState) },
  {
    id: 'eau',
    label: "Présence d'eau",
    section: 'capteurs',
    icon: Droplets,
    value: (v) => (v.waterPresence === undefined ? EMPTY : v.waterPresence ? "Présence d'eau" : "Pas de présence d'eau"),
  },
];

export const FIELD_BY_ID = Object.fromEntries(VEHICLE_FIELDS.map((f) => [f.id, f])) as Record<string, VehicleField>;

/* ─────────────── user configuration (which fields are shown) ─────────────── */

const STORAGE_KEY = 'fiq.vehicleCard.hiddenFields.v1';
const EVENT = 'fiq-vehicle-fields-change';

function readHidden(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeHidden(hidden: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...hidden]));
  } catch {
    /* storage unavailable: keep the choice for this session only */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: [...hidden] }));
}

/** Visible-field preferences, shared by every open card and saved in the browser. */
export function useVehicleFieldConfig() {
  const [hidden, setHidden] = useState<Set<string>>(readHidden);
  // Latest value, so quick successive clicks build on each other (no stale closure)
  const hiddenRef = useRef(hidden);

  useEffect(() => {
    const sync = (e: Event) => {
      const next = new Set((e as CustomEvent<string[]>).detail);
      hiddenRef.current = next;
      setHidden(next);
    };
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const update = useCallback((change: (next: Set<string>) => void) => {
    const next = new Set(hiddenRef.current);
    change(next);
    hiddenRef.current = next;
    setHidden(next);
    writeHidden(next);
  }, []);

  const isVisible = useCallback((id: string) => !hidden.has(id), [hidden]);
  const toggle = useCallback(
    (id: string) => update((next) => (next.has(id) ? next.delete(id) : next.add(id))),
    [update]
  );
  const setSection = useCallback(
    (section: FieldSection, visible: boolean) =>
      update((next) =>
        VEHICLE_FIELDS.filter((f) => f.section === section).forEach((f) => (visible ? next.delete(f.id) : next.add(f.id)))
      ),
    [update]
  );
  /** Show or hide a list of ids at once (e.g. dashboard indicators "dash:<id>") */
  const setMany = useCallback(
    (ids: string[], visible: boolean) => update((next) => ids.forEach((id) => (visible ? next.delete(id) : next.add(id)))),
    [update]
  );
  const reset = useCallback(() => update((next) => next.clear()), [update]);
  const hiddenFieldCount = VEHICLE_FIELDS.filter((f) => hidden.has(f.id)).length;

  return { isVisible, toggle, setSection, setMany, reset, hiddenCount: hiddenFieldCount };
}
