import type { Vehicle } from '@/types';
import type { FleetAlert } from '@/types/alerts';

/**
 * FleetIQ vehicle dashboard indicator icons (37 warning / status lights).
 * 24×24 line icons drawn with currentColor, coloured by ISO dashboard
 * convention when active (red = danger, amber = warning, green = function on,
 * blue = high beam) and greyed out when inactive.
 * The same SVG markup is used in the app and exported to Figma.
 */

export type DashTone = 'red' | 'amber' | 'green' | 'blue';
export type DashGroup = 'access' | 'lighting' | 'driving' | 'mechanical' | 'energy' | 'other';

export const DASH_GROUPS: { id: DashGroup; label: string; en: string }[] = [
  { id: 'access', label: 'Accès & confort', en: 'Vehicle Access & Comfort' },
  { id: 'lighting', label: 'Éclairage & signalisation', en: 'Lighting & Signaling' },
  { id: 'driving', label: 'Conduite & pédales', en: 'Driving & Pedals' },
  { id: 'mechanical', label: 'Alertes mécaniques', en: 'Vehicle Alerts & Mechanical Indicators' },
  { id: 'energy', label: 'Carburant, énergie & équipements', en: 'Fuel, Energy & Special Equipment' },
  { id: 'other', label: 'Autres indicateurs', en: 'Other Indicators' },
];

export const DASH_TONE_COLOR: Record<DashTone, string> = {
  red: '#E5484D',
  amber: '#F59E0B',
  green: '#16A34A',
  blue: '#2F6BFF',
};
export const DASH_INACTIVE_COLOR = '#C9D1E0';

export interface DashIndicator {
  /** Same id as the dashboard alert type in the alert store */
  id: string;
  label: string;
  en: string;
  meaning: string;
  group: DashGroup;
  tone: DashTone;
  /** Inner SVG markup (viewBox 0 0 24 24, stroke = currentColor) */
  svg: string;
}

/* ───── shared shapes ───── */
const circleBrackets = '<circle cx="12" cy="12" r="6"/><path d="M4.6 6.6a8.5 8.5 0 0 0 0 10.8M19.4 6.6a8.5 8.5 0 0 1 0 10.8"/>';
const carTop = '<rect x="7.5" y="3" width="9" height="18" rx="3"/><path d="M9 7.5h6M9 16.5h6"/>';
const doorFL = '<path d="M7.5 8.5 3.5 11"/>';
const doorFR = '<path d="M16.5 8.5l4 2.5"/>';
const doorRL = '<path d="M7.5 13.5 3.5 16"/>';
const doorRR = '<path d="M16.5 13.5l4 2.5"/>';
const carSide =
  '<path d="M3 16.5v-2.8l2-.9 2.8-3.6h6.4l3.1 3.6 2.5.4A1.6 1.6 0 0 1 21 14.8v1.7z"/><circle cx="7.5" cy="16.8" r="1.7"/><circle cx="16.5" cy="16.8" r="1.7"/>';
const lampLeftFacing = '<path d="M14.5 5.5c3.6 0 6.5 2.9 6.5 6.5s-2.9 6.5-6.5 6.5h-1v-13z"/>';
const lampRightFacing = '<path d="M9.5 5.5C5.9 5.5 3 8.4 3 12s2.9 6.5 6.5 6.5h1v-13z"/>';
const fogWave = (x: number) =>
  `<path d="M${x} 4.5c-1.2 1.2 1.2 2.3 0 3.5s1.2 2.3 0 3.5 1.2 2.3 0 3.5 1.2 2.3 0 3.5 1.2 2.3 0 3.5"/>`;
const person =
  '<circle cx="9" cy="4.5" r="2"/><path d="M9 8.5v5.5h4.5l2 6"/><path d="M6.5 9v8h3"/>';
const pedal = '<path d="M12 3v9"/><path d="M7 13.5h10l-1.2 6.5H8.2z"/>';
const pump =
  '<path d="M4 20V5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 13 5v15"/><path d="M3 20.5h11"/><path d="M6.5 6.5h4v4h-4z"/><path d="M13 9.5h1.5a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-3-3"/>';
const oilCan =
  '<path d="M2.5 10.5h3l2.5 2.5h7.5l4.5-3 1 1-5.5 6H8.5l-3-3.5h-3z"/><path d="M9.5 10.5v-2h3v2"/>';
const thermo = '<path d="M12 3.5v9.5"/><circle cx="12" cy="15.5" r="2.5"/>';
const waves = '<path d="M3 21c1.5-1 3 1 4.5 0s3 1 4.5 0 3 1 4.5 0 3 1 4.5 0"/>';
const txt = (s: string, size = 5.6, y = 14) =>
  `<text x="12" y="${y}" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="${size}" font-weight="800" fill="currentColor" stroke="none">${s}</text>`;

export const DASH_INDICATORS: DashIndicator[] = [
  // 1. Access & comfort
  { id: 'hood', label: 'Capot', en: 'Hood / Bonnet', meaning: 'Indique si le capot moteur est ouvert ou fermé.', group: 'access', tone: 'red',
    svg: `${carSide}<path d="M17.2 12.4 21 7.5"/>` },
  { id: 'trunk', label: 'Coffre', en: 'Trunk / Boot', meaning: 'Indique si le coffre est ouvert ou fermé.', group: 'access', tone: 'red',
    svg: `${carSide}<path d="M5 12.8 2.5 7.5"/>` },
  { id: 'seatbelt', label: 'Ceinture de sécurité conducteur', en: 'Driver Seatbelt', meaning: 'Indique si la ceinture du conducteur est bouclée.', group: 'access', tone: 'red',
    svg: `${person}<path d="M6 8.5l8 6.5" stroke-width="2.6"/>` },
  { id: 'ac', label: 'Climatisation', en: 'Air Conditioning (A/C)', meaning: 'Indique si la climatisation est active.', group: 'access', tone: 'green',
    svg: '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M10 4.5 12 6l2-1.5M10 19.5l2-1.5 2 1.5M4.5 10l2.1-.6-.6-2.1M18 7.3l-.6 2.1 2.1.6M4.5 14l2.1.6-.6 2.1M18 16.7l-.6-2.1 2.1-.6"/>' },
  { id: 'central_lock', label: 'Fermeture centrale', en: 'Central Locking', meaning: 'Indique l’état du verrouillage centralisé.', group: 'access', tone: 'green',
    svg: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.5v2.5"/>' },
  { id: 'door', label: 'Portes', en: 'Doors', meaning: 'État général d’ouverture des portes.', group: 'access', tone: 'red',
    svg: `${carTop}${doorFL}${doorFR}${doorRL}${doorRR}` },
  { id: 'front_right_door', label: 'Porte passager', en: 'Passenger Door', meaning: 'Indique l’état de la porte passager.', group: 'access', tone: 'red',
    svg: `${carTop}${doorFR}` },
  { id: 'driver_door', label: 'Porte du conducteur', en: 'Driver Door', meaning: 'Indique l’état de la porte conducteur.', group: 'access', tone: 'red',
    svg: `${carTop}${doorFL}` },
  { id: 'rear_left_door', label: 'Porte arrière gauche', en: 'Rear Left Door', meaning: 'Indique l’état de la porte arrière gauche.', group: 'access', tone: 'red',
    svg: `${carTop}${doorRL}` },
  { id: 'rear_right_door', label: 'Porte arrière droite', en: 'Rear Right Door', meaning: 'Indique l’état de la porte arrière droite.', group: 'access', tone: 'red',
    svg: `${carTop}${doorRR}` },
  { id: 'parking_heater', label: 'Chauffage de stationnement', en: 'Parking Heater', meaning: 'Indique si le chauffage auxiliaire de stationnement est actif.', group: 'access', tone: 'green',
    svg: '<path d="M3.5 20.5h17"/><path d="M8 17c-1.2-1.5 1.2-3 0-4.5s1.2-3 0-4.5M12 17c-1.2-1.5 1.2-3 0-4.5s1.2-3 0-4.5M16 17c-1.2-1.5 1.2-3 0-4.5s1.2-3 0-4.5"/>' },

  // 2. Lighting & signaling
  { id: 'position_lights', label: 'Feux de position', en: 'Position / Parking Lights', meaning: 'Indique que les feux de position sont allumés.', group: 'lighting', tone: 'green',
    svg: '<path d="M10 8c-2.2 0-4 1.8-4 4s1.8 4 4 4h.5V8zM14 8c2.2 0 4 1.8 4 4s-1.8 4-4 4h-.5V8z"/><path d="M3.8 8.5 2 7.5M3.5 12H1.5M3.8 15.5 2 16.5M20.2 8.5l1.8-1M20.5 12h2M20.2 15.5l1.8 1"/>' },
  { id: 'rear_fog', label: 'Feu brouillard arrière', en: 'Rear Fog Light', meaning: 'Indique que le feu de brouillard arrière est activé.', group: 'lighting', tone: 'amber',
    svg: `${lampRightFacing}<path d="M13.5 8h8M13.5 12h8M13.5 16h8"/>${fogWave(17.5)}` },
  { id: 'front_fog', label: 'Feu brouillard avant', en: 'Front Fog Light', meaning: 'Indique que les feux de brouillard avant sont activés.', group: 'lighting', tone: 'green',
    svg: `${lampLeftFacing}<path d="M10.5 8 3 9.5M10.5 12 3 13.5M10.5 16 3 17.5"/>${fogWave(6.5)}` },
  { id: 'low_beam', label: 'Feux de croisement', en: 'Low Beam Headlights', meaning: 'Indique que les feux de croisement sont allumés.', group: 'lighting', tone: 'green',
    svg: `${lampLeftFacing}<path d="M10.5 7.5 3.5 10M10.5 11 3.5 13.5M10.5 14.5 3.5 17"/>` },
  { id: 'turn_signals', label: 'Feux clignotants', en: 'Turn Signals / Indicators', meaning: 'Indique que les clignotants sont actifs.', group: 'lighting', tone: 'green',
    svg: '<path d="M2 12l6-5.5v3.3h2.5v4.4H8v3.3zM22 12l-6-5.5v3.3h-2.5v4.4H16v3.3z" fill="currentColor" stroke="none"/>' },
  { id: 'high_beam', label: 'Feux de route', en: 'High Beam Headlights', meaning: 'Indique que les feux de route sont allumés.', group: 'lighting', tone: 'blue',
    svg: `${lampLeftFacing}<path d="M10.5 7.5H3M10.5 10.5H3M10.5 13.5H3M10.5 16.5H3"/>` },

  // 3. Driving & pedals
  { id: 'handbrake', label: 'Frein à main', en: 'Parking Brake', meaning: 'Indique si le frein à main est serré.', group: 'driving', tone: 'red',
    svg: `${circleBrackets}<path d="M10.5 15V9h2.2a1.8 1.8 0 0 1 0 3.6h-2.2"/>` },
  { id: 'reverse_lights', label: 'Marche arrière', en: 'Reverse Gear', meaning: 'Indique que la marche arrière est engagée.', group: 'driving', tone: 'green',
    svg: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M10 16V8h2.6a2.2 2.2 0 0 1 0 4.4H10M12.6 12.4 15 16"/>' },
  { id: 'cruise_control', label: 'Régulateur de vitesse', en: 'Cruise Control', meaning: 'Indique si le régulateur de vitesse est actif.', group: 'driving', tone: 'green',
    svg: '<path d="M4.5 17.5a8.5 8.5 0 1 1 15 0"/><path d="M12 14l4-4.5"/><circle cx="12" cy="14.5" r="1.3"/><path d="M7 11.5h1M12 7v1M16.5 11.5h.5"/>' },
  { id: 'foot_brake', label: 'Frein à pied', en: 'Foot Brake', meaning: 'Indique que la pédale de frein est enfoncée.', group: 'driving', tone: 'green',
    svg: `${pedal}<path d="M9 16h6M9.5 18h5"/>` },
  { id: 'clutch', label: 'Pédale embrayage', en: 'Clutch Pedal', meaning: 'Indique que la pédale d’embrayage est enfoncée.', group: 'driving', tone: 'green',
    svg: `${pedal}${txt('C', 5.5, 19)}` },

  // 4. Mechanical alerts
  { id: 'brake_fluid_level', label: 'Liquide de frein', en: 'Brake Fluid Indicator', meaning: 'Niveau ou circuit de liquide de frein anormal.', group: 'mechanical', tone: 'red',
    svg: `${circleBrackets}<path d="M12 8.8v3.4M12 14.6v.1"/><path d="M8.5 20.5c1.2-.8 2.3.8 3.5 0s2.3.8 3.5 0"/>` },
  { id: 'coolant_level', label: 'Liquide de refroidissement bas', en: 'Low Coolant Level', meaning: 'Le niveau de liquide de refroidissement est trop bas.', group: 'mechanical', tone: 'amber',
    svg: `${thermo}${waves}<path d="M18.5 4v5M16.5 7l2 2 2-2"/>` },
  { id: 'battery', label: 'Batterie', en: 'Battery Indicator', meaning: 'État de la batterie ou alerte de charge.', group: 'mechanical', tone: 'red',
    svg: '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M6.5 7V5h2.5v2M15 7V5h2.5v2M6 13h3.5M7.75 11.25v3.5M14.5 13H18"/>' },
  { id: 'brake_system_failure', label: 'Panne système de freinage', en: 'Brake System Failure', meaning: 'Dysfonctionnement du système de freinage.', group: 'mechanical', tone: 'red',
    svg: `${circleBrackets}<path d="M12 8.5v4.2M12 15.4v.1"/>` },
  { id: 'oil_pressure', label: 'Pression huile', en: 'Oil Pressure Indicator', meaning: 'Pression d’huile moteur anormale ou basse.', group: 'mechanical', tone: 'red',
    svg: `${oilCan}<path d="M21 15.5c0 .9-.6 1.5-1.2 1.5s-1.2-.6-1.2-1.5 1.2-2.3 1.2-2.3 1.2 1.4 1.2 2.3z"/>` },
  { id: 'temperature', label: 'Moteur chaud', en: 'Engine Overheating', meaning: 'La température moteur est trop élevée.', group: 'mechanical', tone: 'red',
    svg: `${thermo}${waves}<path d="M13.5 6h2.5M13.5 9h2.5M13.5 12h2.5"/>` },
  { id: 'abs', label: 'Panne ABS', en: 'ABS Failure Indicator', meaning: 'Dysfonctionnement du système antiblocage (ABS).', group: 'mechanical', tone: 'amber',
    svg: `${circleBrackets}${txt('ABS', 4.6, 13.7)}` },
  { id: 'check_engine', label: 'Check Engine', en: 'Check Engine Light', meaning: 'Défaut moteur ou de gestion moteur.', group: 'mechanical', tone: 'amber',
    svg: '<path d="M6 9h2.5V7h6v2h1.5l2 2.5h2v6h-2l-2 2.5H8.5L7 17.5H6v-2H3.5v-4H6z"/><path d="M10 7V5h2.5"/>' },
  { id: 'airbag', label: 'Airbags', en: 'Airbag Indicator', meaning: 'Alerte ou défaut du système airbag.', group: 'mechanical', tone: 'red',
    svg: `${person}<circle cx="17.5" cy="9" r="3.5"/>` },
  { id: 'oil_level', label: 'Niveau huile bas', en: 'Low Engine Oil Level', meaning: 'Le niveau d’huile moteur est trop bas.', group: 'mechanical', tone: 'amber',
    svg: `${oilCan}${waves}` },

  // 5. Fuel, energy & equipment
  { id: 'fuel', label: 'Carburant bas', en: 'Low Fuel', meaning: 'Le niveau de carburant est bas.', group: 'energy', tone: 'amber', svg: pump },
  { id: 'ev_charging', label: 'Recharge véhicule électrique', en: 'EV Battery Charging', meaning: 'Le véhicule électrique est en charge.', group: 'energy', tone: 'green',
    svg: '<path d="M9 3v4M15 3v4"/><path d="M6.5 7h11v4a5.5 5.5 0 0 1-11 0z"/><path d="M12 16.5V21"/><path d="M12.6 8.5 10.8 11.3h2.4l-1.8 2.8"/>' },
  { id: 'fuel_source', label: 'Source de carburant', en: 'Fuel Source', meaning: 'Source ou circuit d’alimentation en carburant.', group: 'energy', tone: 'green',
    svg: `${pump}<path d="M16.5 2.5h4.5M19.5 1l1.5 1.5-1.5 1.5"/>` },
  { id: 'pto', label: 'Prise de force (PTO)', en: 'Power Take-Off (PTO)', meaning: 'Équipement auxiliaire entraîné par le moteur actif (ex. pompe hydraulique).', group: 'energy', tone: 'green',
    svg: `<circle cx="12" cy="12" r="8.5"/>${txt('PTO', 5.4, 14)}` },

  // 6. Other
  { id: 'maintenance', label: 'Appel de service', en: 'Service Call Indicator', meaning: 'Demande de service, d’assistance ou alerte d’entretien.', group: 'other', tone: 'amber',
    svg: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3.5 17.5l3 3 5.8-5.8a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>' },
];

export const DASH_BY_ID = Object.fromEntries(DASH_INDICATORS.map((d) => [d.id, d])) as Record<string, DashIndicator>;

/** Full standalone SVG for one indicator (used for Figma export). */
export function dashIndicatorSvg(d: DashIndicator, color: string, size = 24): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:${color}">${d.svg.replace(/currentColor/g, color)}</svg>`;
}

export function DashIcon({
  indicator,
  active,
  size = 24,
  className,
}: {
  indicator: DashIndicator;
  active: boolean;
  size?: number;
  className?: string;
}) {
  const color = active ? DASH_TONE_COLOR[indicator.tone] : DASH_INACTIVE_COLOR;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ color }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: indicator.svg }}
    />
  );
}

/* ───── live state per vehicle ───── */

function seedOf(id: string): number {
  return Array.from(id).reduce((v, ch) => (Math.imul(v, 31) + ch.charCodeAt(0)) >>> 0, 7);
}

/**
 * Indicators currently lit for a vehicle: active dashboard alerts from the
 * shared alert store, plus demo running state (lights while driving, lock and
 * handbrake when parked) until the tracker feed provides it.
 */
export function getActiveDashIndicators(vehicle: Vehicle, alerts: FleetAlert[]): Set<string> {
  const on = new Set<string>();
  for (const a of alerts) {
    if (a.vehicleId === vehicle.id && a.status !== 'resolved' && DASH_BY_ID[a.type]) on.add(a.type);
  }
  const s = seedOf(vehicle.id);
  if (vehicle.status === 'active') {
    on.add('position_lights');
    if (s % 2 === 0) on.add('low_beam');
    if (s % 5 === 0) on.add('cruise_control');
    if (s % 3 === 0) on.add('ac');
  } else if (vehicle.status === 'idle' || vehicle.status === 'stopped') {
    on.add('handbrake');
    if (s % 2 === 1) on.add('central_lock');
  } else {
    on.add('central_lock');
  }
  return on;
}

/**
 * Indicators lit during one trajectory segment (Stop / Circulation row).
 * Demo state derived from the row until the tracker feed provides it.
 */
export function getTrajectoryDashIndicators(rowId: string, isRun: boolean): Set<string> {
  const s = seedOf(rowId);
  const on = new Set<string>();
  if (isRun) {
    on.add('position_lights');
    if (s % 2 === 0) on.add('low_beam');
    if (s % 4 === 1) on.add('cruise_control');
    if (s % 3 === 0) on.add('ac');
    if (s % 7 === 0) on.add('seatbelt');
    if (s % 9 === 0) on.add('turn_signals');
  } else {
    on.add('handbrake');
    if (s % 2 === 1) on.add('central_lock');
    if (s % 5 === 0) on.add('driver_door');
  }
  if (s % 11 === 0) on.add('fuel');
  if (s % 13 === 0) on.add('check_engine');
  return on;
}
