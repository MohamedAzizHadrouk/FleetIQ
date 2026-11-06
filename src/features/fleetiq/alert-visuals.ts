import {
  BatteryWarning,
  Camera,
  Car,
  CarTaxiFront,
  CircleHelp,
  Clock,
  DoorOpen,
  Fuel,
  Gauge,
  Globe,
  Hexagon,
  IdCard,
  MessageSquare,
  OctagonX,
  Package,
  ParkingSquare,
  Power,
  Route,
  SatelliteDish,
  ShieldAlert,
  Siren,
  Thermometer,
  Timer,
  TriangleAlert,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertVisual {
  Icon: LucideIcon;
  severity: AlertSeverity;
}

/** Icon and severity of each alert type of the tracking table */
const VISUALS: Record<string, AlertVisual> = {
  'Dépassement de vitesse': { Icon: Gauge, severity: 'critical' },
  'Tous les geofences': { Icon: Hexagon, severity: 'warning' },
  'Sortie/entrée du pays': { Icon: Globe, severity: 'warning' },
  "Entrée/Sortie de l'itineraire": { Icon: Route, severity: 'warning' },
  Remorquage: { Icon: Truck, severity: 'critical' },
  'Batterie débranchée': { Icon: BatteryWarning, severity: 'critical' },
  'Message reçue': { Icon: MessageSquare, severity: 'info' },
  'Alerte de température': { Icon: Thermometer, severity: 'warning' },
  'Alerte de carburant': { Icon: Fuel, severity: 'critical' },
  'Conduite agressive': { Icon: Zap, severity: 'warning' },
  SOS: { Icon: Siren, severity: 'critical' },
  'Taxi libre/occupé': { Icon: CarTaxiFront, severity: 'info' },
  'Contact On/Off': { Icon: Power, severity: 'info' },
  'Malle ouverte/fermée': { Icon: Package, severity: 'info' },
  'Capot ouvert/fermé': { Icon: Car, severity: 'warning' },
  'Porte ouverte/fermée': { Icon: DoorOpen, severity: 'info' },
  'Alerte de maintenance': { Icon: Wrench, severity: 'warning' },
  Stop: { Icon: OctagonX, severity: 'info' },
  'Signal GPS détecté/perdu': { Icon: SatelliteDish, severity: 'warning' },
  'Stop de longue durée': { Icon: Clock, severity: 'warning' },
  'Dépassement temps de conduite': { Icon: Timer, severity: 'warning' },
  'Identification du conducteur': { Icon: IdCard, severity: 'info' },
  'Alerte de parc': { Icon: ParkingSquare, severity: 'info' },
  'Photo reçue': { Icon: Camera, severity: 'info' },
  Enlèvement: { Icon: ShieldAlert, severity: 'critical' },
  Inconnu: { Icon: CircleHelp, severity: 'info' },
};

export const ALERT_SEVERITY_STYLE: Record<AlertSeverity, { color: string; soft: string; text: string; label: string }> = {
  critical: { color: '#E5484D', soft: '#FDECEC', text: '#9B1C22', label: 'Critique' },
  warning: { color: '#F59E0B', soft: '#FEF3C7', text: '#92400E', label: 'Avertissement' },
  info: { color: '#2F6BFF', soft: '#EAF1FF', text: '#1E40AF', label: 'Information' },
};

export function alertVisual(type: string): AlertVisual {
  return VISUALS[type] ?? { Icon: TriangleAlert, severity: 'warning' };
}
