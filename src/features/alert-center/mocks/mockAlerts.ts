import type { Vehicle } from '@/types';
import type { FleetAlert, AlertType } from '@/types/alerts';
import { getAlertTypeConfig } from '../constants/alert-type-registry';
import { getGeolocationAlertTypes } from '../constants/geolocation-alert-groups';
import { getAlertTypesForCenterSection } from '../constants/alert-config-sections';
import { MOCK_GEOFENCE_ZONES } from './mockGeofenceRules';
import { EXCLUDED_SECURITY_ALERT_TYPES } from '../constants/security-alert-types';

const EXCLUDED_SET = new Set<AlertType>(EXCLUDED_SECURITY_ALERT_TYPES);

const FLEETS = ['Flotte Nord', 'Flotte Sud', 'Flotte Express', 'Flotte Urbaine'];
const MISSIONS = ['Livraison Paris', 'Transport Lyon', 'Course urgente', 'Tournée matin', 'Retour dépôt'];
const LOCATIONS = [
  'Rue de Rivoli, Paris',
  'Avenue des Champs-Élysées',
  'Boulevard Haussmann',
  'Gare de Lyon',
  'Périphérique Nord',
  'Autoroute A6, Lyon',
];
const NOTIFIED_USERS = ['Admin Flotte', 'Gestionnaire Nord', 'Responsable Sécurité', 'Conducteur'];

const ALERT_TYPES = (
  [
    'sos', 'speeding', 'fuel', 'geofence', 'geofence_exit', 'towing', 'temperature', 'maintenance',
    'driver_door', 'gps_signal', 'route', 'stop', 'driving_time_exceeded',
    'battery_disconnected', 'ignition', 'long_stop', 'country_border', 'handbrake', 'trunk', 'seatbelt',
    'check_engine', 'abs', 'oil_pressure', 'battery', 'ac', 'central_lock', 'main_lights', 'maintenance_due',
    'insurance_expired', 'technical_inspection', 'registration_expired', 'documents_expired',
    'unauthorized_start', 'fuel_theft', 'coolant_level', 'cruise_control',
    'mission_order', 'fuel_coupon', 'brake_pads', 'tires_change', 'car_document',
    'presence_in_area', 'absence_from_area',
    'tank_low', 'tank_very_low', 'fuel_fill', 'temperature_alert', 'engine_temperature',
    'contact_on_off', 'remote_arming_enable_fail',
    'tunisian_road_speed_limit', 'high_fuel_consumption',
    'foot_brake', 'clutch', 'hood', 'pto', 'oil_level',
  ] as AlertType[]
).filter((t) => !EXCLUDED_SET.has(t));

const DASHBOARD_TYPES: AlertType[] = [
  'fuel', 'seatbelt', 'ac', 'cruise_control', 'foot_brake', 'clutch', 'handbrake', 'central_lock',
  'reverse_lights', 'position_lights', 'low_beam', 'high_beam', 'rear_fog', 'front_fog', 'door',
  'trunk', 'turn_signals', 'driver_door', 'front_right_door', 'rear_left_door', 'rear_right_door',
  'hood', 'parking_heater', 'brake_fluid_level', 'coolant_level', 'battery', 'brake_system_failure',
  'oil_pressure', 'temperature', 'abs', 'check_engine', 'airbag', 'maintenance', 'oil_level',
  'ev_charging', 'fuel_source', 'pto', 'main_lights',
];

const MESSAGES: Partial<Record<AlertType, string[]>> = {
  sos: ['Signal SOS activé par le conducteur', 'Bouton panique déclenché'],
  speeding: ['Vitesse excessive: 142 km/h (limite 90)', 'Dépassement de vitesse: 118 km/h'],
  fuel: ['Niveau carburant faible: 12%', 'Réserve carburant atteinte'],
  geofence: ['Entrée zone "Centre Paris"'],
  geofence_exit: ['Sortie de zone "Centre Paris"'],
  polygon_exit: ['Sortie polygone "Zone A1 — Accès restreint"'],
  city_exit: ['Sortie de ville "Périmètre Tunis"'],
  route: ['Déviation d\'itinéraire de 2.4 km'],
  departure_point: ['Arrivée au point de départ "Dépôt Nord"'],
  arrival_point: ['Arrivée destination "Port de Radès"'],
  restricted_hours: ['Circulation en horaires interdits — zone "Centre Paris"'],
  long_stop: ['Arrêt prolongé 45 min — zone "Dépôt Nord"'],
  abnormal_immobilization: ['Immobilisation anormale détectée'],
  country_border: ['Approche frontière — zone "Périmètre Tunis"'],
  stop: ['Ralenti excessif: 18 min'],
  taxi_status: ['Début de mission — zone "Aéroport Tunis-Carthage"'],
  towing: ['Mouvement détecté — véhicule potentiellement remorqué'],
  temperature: ['Température moteur élevée: 108°C'],
  maintenance: ['Code DTC P0420 détecté'],
  driver_door: ['Porte conducteur ouverte'],
  trunk: ['Coffre ouvert'],
  gps_signal: ['Signal GNSS perdu depuis 3 min'],
  driving_time_exceeded: ['Temps de conduite réglementaire dépassé'],
  harsh_brake: ['Freinage brusque détecté — décélération -0.8g'],
  harsh_accel: ['Accélération brusque — +0.7g'],
  harsh_turn: ['Virage agressif — force latérale 0.6g'],
  hard_deceleration: ['Décélération brusque — -0.9g'],
  excessive_idle: ['Ralenti moteur excessif : 22 min'],
  aggressive_driving: ['Score conduite agressive : 3 événements / 10 min'],
  engine_overspeed: ['Régime moteur excessif : 4200 tr/min'],
  battery_disconnected: ['Batterie traceur GPS déconnectée'],
  handbrake: ['Frein à main engagé en circulation'],
  seatbelt: ['Ceinture conducteur non attachée'],
  check_engine: ['Voyant moteur allumé'],
  abs: ['Défaut système ABS'],
  oil_pressure: ['Pression huile critique'],
  maintenance_due: ['Entretien à effectuer dans 500 km'],
  insurance_expired: ['Assurance expire dans 7 jours'],
  technical_inspection: ['Contrôle technique à renouveler'],
  registration_expired: ['Carte grise expirée'],
  documents_expired: ['Vignette expirée'],
  unauthorized_start: ['Démarrage non autorisé détecté'],
  mission_order: ["Durée d'ordre de mission terminée"],
  fuel_coupon: ['Bon/carte de carburant à livrer'],
  brake_pads: ['Patins de frein à changer'],
  distribution_chain: ['Chaîne de distribution à changer'],
  spark_plugs: ["Bougies d'allumage à changer"],
  tires_change: ['Pneus à changer'],
  fuel_filter: ['Filtre à gasoil à remplacer'],
  ac_filter: ['Filtre climatiseur à remplacer'],
  oil_filter: ['Filtre à huile à remplacer'],
  air_filter: ['Filtre à air à remplacer'],
  car_document: ['Papier de voiture à revoir'],
  presence_in_area: ['Présence véhicule en zone pour période déterminée'],
  absence_from_area: ['Absence véhicule en zone pour période déterminée'],
  remote_arming_enable_ok: ["Activation arrêt à distance réussie"],
  remote_arming_enable_fail: ["Activation arrêt à distance échouée"],
  remote_arming_disable_ok: ["Désactivation arrêt à distance réussie"],
  remote_arming_disable_fail: ["Désactivation arrêt à distance échouée"],
  tank_low: ['Niveau de réservoir faible'],
  tank_very_low: ['Niveau de réservoir très faible'],
  fuel_fill: ['Remplissage de carburant détecté'],
  stop_contact_on: ['Stop avec moteur en marche'],
  stop_contact_off: ['Stop avec moteur à l\'arrêt'],
  temperature_alert: ['Alerte de température hors plage'],
  engine_temperature: ['Dépassement température moteur'],
  contact_on_off: ['Contact On/Off'],
  tunisian_road_speed_limit: ['Dépassement limite route tunisienne'],
  high_fuel_consumption: ['Consommation carburant excessive'],
  foot_brake: ['Frein à pied engagé'],
  clutch: ['Pédale d\'embrayage'],
  hood: ['Capot ouvert'],
  pto: ['Power take-off actif'],
  oil_level: ['Niveau d\'huile bas'],
};

function minutesAgo(min: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - min);
  return d.toISOString();
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

export function generateMockAlerts(vehicles: Vehicle[]): FleetAlert[] {
  const alerts: FleetAlert[] = [];
  let id = 1;

  vehicles.forEach((vehicle, vIdx) => {
    const typeCount = 3 + (vIdx % 4);
    for (let i = 0; i < typeCount; i++) {
      const typePool = i === 0 && vIdx % 3 === 0 ? DASHBOARD_TYPES : ALERT_TYPES;
      const type = typePool[(vIdx + i) % typePool.length];
      const config = getAlertTypeConfig(type);
      const minsAgo = 5 + vIdx * 7 + i * 13;
      const createdAt = minutesAgo(minsAgo);
      const isResolved = i === typeCount - 1 && vIdx % 5 === 0;
      const isRead = isResolved || i % 2 === 0;

      alerts.push({
        id: String(id++),
        type,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        severity: config.defaultSeverity,
        message: MESSAGES[type]?.[i % (MESSAGES[type]?.length ?? 1)] ?? `Alerte ${config.label}`,
        timestamp: formatRelative(createdAt),
        createdAt,
        location: LOCATIONS[(vIdx + i) % LOCATIONS.length],
        isRead,
        category: config.category,
        status: isResolved ? 'resolved' : 'active',
        priority: config.defaultPriority,
        driverName: vehicle.driver,
        fleetName: FLEETS[vIdx % FLEETS.length],
        speed: vehicle.status === 'active' ? vehicle.speed : 0,
        missionName: MISSIONS[vIdx % MISSIONS.length],
        coordinates: vehicle.coordinates,
        recommendedAction: config.recommendedAction,
        autoResolvable: config.autoResolvable,
        businessImpact: config.businessImpact,
        notifiedUser: NOTIFIED_USERS[(vIdx + i) % NOTIFIED_USERS.length],
        isActive: !isResolved,
        details: type === 'speeding' ? { detected: '142 km/h', limit: '90 km/h' } : undefined,
      });
    }
  });

  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** One active demo alert per geolocation type for dashboard examples */
export function generateGeolocationDemoAlerts(vehicles: Vehicle[]): FleetAlert[] {
  if (!vehicles.length) return [];

  const types = getGeolocationAlertTypes();
  const alerts: FleetAlert[] = [];
  let id = 5000;

  types.forEach((type, index) => {
    const vehicle = vehicles[index % vehicles.length];
    const config = getAlertTypeConfig(type);
    const zone = MOCK_GEOFENCE_ZONES[index % MOCK_GEOFENCE_ZONES.length];
    const createdAt = minutesAgo(10 + index * 3);
    const defaultMessage = MESSAGES[type]?.[0];

    alerts.push({
      id: `geo-demo-${id++}`,
      type,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      severity: config.defaultSeverity,
      message:
        defaultMessage ??
        `Alerte ${config.label} — zone "${zone}"`,
      timestamp: formatRelative(createdAt),
      createdAt,
      location: LOCATIONS[index % LOCATIONS.length],
      isRead: false,
      category: 'geolocation',
      status: 'active',
      priority: config.defaultPriority,
      driverName: vehicle.driver,
      fleetName: FLEETS[index % FLEETS.length],
      coordinates: vehicle.coordinates,
      recommendedAction: config.recommendedAction,
      autoResolvable: config.autoResolvable,
      businessImpact: config.businessImpact,
      notifiedUser: NOTIFIED_USERS[index % NOTIFIED_USERS.length],
      isActive: true,
    });
  });

  return alerts;
}

/** One active demo alert per driving quality type for dashboard examples */
export function generateDrivingQualityDemoAlerts(vehicles: Vehicle[]): FleetAlert[] {
  return generateCenterSectionDemoAlerts(vehicles, 'driving_quality', 6000, 'dq-demo');
}

/** One active demo alert per fleet parc type */
export function generateFleetParcDemoAlerts(vehicles: Vehicle[]): FleetAlert[] {
  return generateCenterSectionDemoAlerts(vehicles, 'vehicle_management', 7000, 'parc-demo');
}

/** One active demo alert per security center type */
export function generateSecurityDemoAlerts(vehicles: Vehicle[]): FleetAlert[] {
  return generateCenterSectionDemoAlerts(vehicles, 'security', 8000, 'sec-demo');
}

function generateCenterSectionDemoAlerts(
  vehicles: Vehicle[],
  sectionId: 'driving_quality' | 'vehicle_management' | 'security',
  startId: number,
  idPrefix: string
): FleetAlert[] {
  if (!vehicles.length) return [];

  const types = getAlertTypesForCenterSection(sectionId).filter((t) => !EXCLUDED_SET.has(t));
  const alerts: FleetAlert[] = [];
  let id = startId;
  const category =
    sectionId === 'vehicle_management'
      ? 'vehicle_management'
      : sectionId === 'security'
        ? 'security'
        : 'driving_quality';

  types.forEach((type, index) => {
    const vehicle = vehicles[index % vehicles.length];
    const config = getAlertTypeConfig(type);
    const createdAt = minutesAgo(10 + index * 3);
    const defaultMessage = MESSAGES[type]?.[0];

    alerts.push({
      id: `${idPrefix}-${id++}`,
      type,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      severity: config.defaultSeverity,
      message: defaultMessage ?? `Alerte ${config.label}`,
      timestamp: formatRelative(createdAt),
      createdAt,
      location: LOCATIONS[index % LOCATIONS.length],
      isRead: false,
      category: config.category ?? category,
      status: 'active',
      priority: config.defaultPriority,
      driverName: vehicle.driver,
      fleetName: FLEETS[index % FLEETS.length],
      speed: vehicle.status === 'active' ? vehicle.speed : 0,
      coordinates: vehicle.coordinates,
      recommendedAction: config.recommendedAction,
      autoResolvable: config.autoResolvable,
      businessImpact: config.businessImpact,
      notifiedUser: NOTIFIED_USERS[index % NOTIFIED_USERS.length],
      isActive: true,
      details: type === 'speeding' || type === 'tunisian_road_speed_limit'
        ? { detected: '142 km/h', limit: '90 km/h' }
        : undefined,
    });
  });

  return alerts;
}

export function generateHistoricalAlerts(vehicleId: string, vehicleName: string, driverName: string): FleetAlert[] {
  const types: AlertType[] = ['speeding', 'driver_door', 'fuel', 'check_engine', 'geofence_exit', 'battery'];
  const history: FleetAlert[] = [];
  let id = 9000;

  types.forEach((type, i) => {
    const config = getAlertTypeConfig(type);
    const hoursAgo = i < 3 ? i * 0.5 + 0.25 : i * 4 + 12;
    const createdAt = minutesAgo(Math.round(hoursAgo * 60));
    history.push({
      id: `${vehicleId}-hist-${id++}`,
      type,
      vehicleId,
      vehicleName,
      severity: config.defaultSeverity,
      message: MESSAGES[type]?.[0] ?? `Alerte ${config.label}`,
      timestamp: formatRelative(createdAt),
      createdAt,
      isRead: true,
      category: config.category,
      status: 'resolved',
      priority: config.defaultPriority,
      driverName,
      recommendedAction: config.recommendedAction,
      autoResolvable: config.autoResolvable,
      businessImpact: config.businessImpact,
      notifiedUser: NOTIFIED_USERS[i % NOTIFIED_USERS.length],
      isActive: false,
    });
  });

  return history;
}
