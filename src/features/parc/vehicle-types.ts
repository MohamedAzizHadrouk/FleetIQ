export type FleetVehicleStatus = 'active' | 'maintenance' | 'inactive';

export type VehicleIconType =
  | 'voiture'
  | 'moto'
  | 'fourgon'
  | 'pickup'
  | 'camion'
  | 'bus'
  | 'taxi'
  | 'tracteur'
  | 'ambulance'
  | 'police'
  | 'camion_pompier'
  | 'livraison';

export interface FleetVehicle {
  id: string;
  matricule: string;
  departmentId: string;
  departmentName: string;
  driverId: string;
  driverName: string;
  speciality: string;
  brand: string;
  model: string;
  year: number | '';
  commissioningDate: string;
  retirementDate: string;
  chassisNumber: string;
  fuelType: string;
  seats: number | '';
  fiscalPower: number | '';
  realPower: number | '';
  displacement: number | '';
  tankCapacity: number | '';
  fuelEstimate: number | '';
  iconType: VehicleIconType;
  photoUrl?: string;
  registrationDocUrl?: string;
  registrationDocName?: string;
  mileage: number;
  status: FleetVehicleStatus;
}

export interface VehicleIconOption {
  id: VehicleIconType;
  label: string;
  color: string;
  /** Inline SVG path content for map markers (24x24 viewBox) */
  svgInner: string;
}

export const VEHICLE_ICON_OPTIONS: VehicleIconOption[] = [
  {
    id: 'voiture',
    label: 'Voiture',
    color: '#ef4444',
    svgInner:
      '<path d="M5 17a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0"/><path d="M5 17H3v-4l2-5h10l3 5h1v4h-2"/><path d="M7 8V6h6"/>',
  },
  {
    id: 'moto',
    label: 'Moto',
    color: '#ef4444',
    svgInner:
      '<circle cx="6.5" cy="16.5" r="2.5"/><circle cx="17.5" cy="16.5" r="2.5"/><path d="M10 16h4l2-6H9l1 6"/><path d="M12 10V7h3"/>',
  },
  {
    id: 'fourgon',
    label: 'Fourgon',
    color: '#38bdf8',
    svgInner:
      '<path d="M3 17h2a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0h2"/><path d="M5 17V7h9l4 4v6"/><path d="M14 7v4h4"/>',
  },
  {
    id: 'pickup',
    label: 'Pick-up',
    color: '#ef4444',
    svgInner:
      '<path d="M3 17h2a2 2 0 0 0 4 0h4a2 2 0 0 0 4 0h2"/><path d="M5 17V11h7V7h3l3 4v6"/><path d="M5 11h7"/>',
  },
  {
    id: 'camion',
    label: 'Camion',
    color: '#f97316',
    svgInner:
      '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  },
  {
    id: 'bus',
    label: 'Bus',
    color: '#3b82f6',
    svgInner:
      '<path d="M4 17h2a2 2 0 0 0 4 0h4a2 2 0 0 0 4 0h2"/><rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 10h16"/><path d="M8 4v2m8-2v2"/>',
  },
  {
    id: 'taxi',
    label: 'Taxi',
    color: '#eab308',
    svgInner:
      '<path d="M5 17a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0"/><path d="M5 17H3v-4l2-5h10l3 5h1v4h-2"/><path d="M10 6h4"/><rect x="10" y="3" width="4" height="2" rx="0.5"/>',
  },
  {
    id: 'tracteur',
    label: 'Tracteur',
    color: '#22c55e',
    svgInner:
      '<circle cx="7" cy="17" r="3"/><circle cx="18" cy="17" r="2"/><path d="M10 17h5"/><path d="M4 14h6l2-6h4l2 4"/><path d="M14 8V5h3"/>',
  },
  {
    id: 'ambulance',
    label: 'Ambulance',
    color: '#f87171',
    svgInner:
      '<path d="M3 17h2a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0h2"/><path d="M5 17V8h9l4 4v5"/><path d="M14 8v4h4"/><path d="M9 11h4M11 9v4"/>',
  },
  {
    id: 'police',
    label: 'Police',
    color: '#2563eb',
    svgInner:
      '<path d="M5 17a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0"/><path d="M5 17H3v-4l2-5h10l3 5h1v4h-2"/><path d="M9 6h6l-1 2H10z"/>',
  },
  {
    id: 'camion_pompier',
    label: 'Camion pompier',
    color: '#dc2626',
    svgInner:
      '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M6 9h4"/>',
  },
  {
    id: 'livraison',
    label: 'Livraison',
    color: '#a16207',
    svgInner:
      '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/>',
  },
];

export const VEHICLE_ICON_IDS = VEHICLE_ICON_OPTIONS.map((o) => o.id);

export function getVehicleIconOption(
  id?: VehicleIconType | string | null
): VehicleIconOption {
  return (
    VEHICLE_ICON_OPTIONS.find((o) => o.id === id) ?? VEHICLE_ICON_OPTIONS[4]
  );
}

export function emptyFleetVehicle(): FleetVehicle {
  return {
    id: '',
    matricule: '',
    departmentId: '',
    departmentName: '',
    driverId: '',
    driverName: '',
    speciality: '',
    brand: '',
    model: '',
    year: '',
    commissioningDate: '',
    retirementDate: '',
    chassisNumber: '',
    fuelType: '',
    seats: '',
    fiscalPower: '',
    realPower: '',
    displacement: '',
    tankCapacity: '',
    fuelEstimate: '',
    iconType: 'camion',
    mileage: 0,
    status: 'active',
  };
}

/** SVG markup suitable for Leaflet divIcon (white stroke on colored circle) */
export function vehicleIconSvgMarkup(
  iconType: VehicleIconType | undefined,
  size = 16,
  stroke = 'white'
): string {
  const opt = getVehicleIconOption(iconType);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${opt.svgInner}</svg>`;
}
