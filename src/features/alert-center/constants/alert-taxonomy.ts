import type {
  AlertCategory,
  AlertPriority,
  AlertSeverity,
  AlertType,
  BusinessImpact,
  NotificationChannel,
} from '@/types/alerts';

export interface AlertTaxonomyEntry {
  id: AlertType;
  label: string;
  category: AlertCategory;
  subcategory: string;
  defaultSeverity: AlertSeverity;
  defaultPriority: AlertPriority;
  businessImpact: BusinessImpact;
  recommendedAction: string;
  autoResolvable: boolean;
  requiresAcknowledgement: boolean;
  notificationChannels: NotificationChannel[];
  contactOffOnly?: boolean;
  drivingOnly?: boolean;
  requiresConfiguration?: boolean;
  configurableInParametrage?: boolean;
}

function entry(
  e: Omit<AlertTaxonomyEntry, 'defaultPriority' | 'requiresConfiguration' | 'configurableInParametrage'> & {
    defaultPriority?: AlertPriority;
    requiresConfiguration?: boolean;
    configurableInParametrage?: boolean;
  }
): AlertTaxonomyEntry {
  const severity = e.defaultSeverity;
  const defaultPriority: AlertPriority =
    e.defaultPriority ??
    (severity === 'critical' ? 'critical' : severity === 'warning' ? 'medium' : 'low');
  const requiresConfiguration =
    e.requiresConfiguration ??
    (e.category === 'geolocation' || e.category === 'security' || e.category === 'driving_quality');
  const configurableInParametrage =
    e.configurableInParametrage ?? (e.id !== 'all' && e.id !== 'unknown');
  return { ...e, defaultPriority, requiresConfiguration, configurableInParametrage };
}

export const ALERT_TAXONOMY: Record<AlertType, AlertTaxonomyEntry> = {
  all: entry({
    id: 'all',
    label: 'Toutes les alertes',
    category: 'dashboard',
    subcategory: 'Général',
    defaultSeverity: 'info',
    businessImpact: 'low',
    recommendedAction: 'Examiner l\'alerte',
    autoResolvable: false,
    requiresAcknowledgement: false,
    notificationChannels: ['in_app'],
  }),

  // Dashboard — Freinage
  handbrake: entry({ id: 'handbrake', label: 'Frein à main', category: 'dashboard', subcategory: 'Freinage', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Vérifier le frein à main', autoResolvable: true, requiresAcknowledgement: true, notificationChannels: ['in_app'], drivingOnly: true }),
  foot_brake: entry({ id: 'foot_brake', label: 'Frein à pied', category: 'dashboard', subcategory: 'Freinage', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Inspecter le système de freinage', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  rear_brake: entry({ id: 'rear_brake', label: 'Frein arrière', category: 'dashboard', subcategory: 'Freinage', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Contrôler les freins arrière', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  brake_system_failure: entry({ id: 'brake_system_failure', label: 'Panne système freinage', category: 'dashboard', subcategory: 'Freinage', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Immobiliser le véhicule immédiatement', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  abs: entry({ id: 'abs', label: 'ABS', category: 'dashboard', subcategory: 'Freinage', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Diagnostic ABS urgent', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'], drivingOnly: true }),

  // Dashboard — Portes
  trunk: entry({ id: 'trunk', label: 'Coffre', category: 'dashboard', subcategory: 'Portes', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Fermer le coffre', autoResolvable: true, requiresAcknowledgement: true, notificationChannels: ['in_app'], contactOffOnly: true }),
  driver_door: entry({ id: 'driver_door', label: 'Porte conducteur', category: 'dashboard', subcategory: 'Portes', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Fermer la porte conducteur', autoResolvable: true, requiresAcknowledgement: true, notificationChannels: ['in_app'], contactOffOnly: true }),
  front_right_door: entry({ id: 'front_right_door', label: 'Porte avant droite', category: 'dashboard', subcategory: 'Portes', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Fermer la porte', autoResolvable: true, requiresAcknowledgement: true, notificationChannels: ['in_app'], contactOffOnly: true }),
  rear_left_door: entry({ id: 'rear_left_door', label: 'Porte arrière gauche', category: 'dashboard', subcategory: 'Portes', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Fermer la porte', autoResolvable: true, requiresAcknowledgement: true, notificationChannels: ['in_app'], contactOffOnly: true }),
  rear_right_door: entry({ id: 'rear_right_door', label: 'Porte arrière droite', category: 'dashboard', subcategory: 'Portes', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Fermer la porte', autoResolvable: true, requiresAcknowledgement: true, notificationChannels: ['in_app'], contactOffOnly: true }),
  door: entry({ id: 'door', label: 'Porte générale', category: 'dashboard', subcategory: 'Portes', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Fermer la porte', autoResolvable: true, requiresAcknowledgement: true, notificationChannels: ['in_app'], contactOffOnly: true }),
  hood: entry({ id: 'hood', label: 'Capot', category: 'dashboard', subcategory: 'Portes', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Fermer le capot', autoResolvable: true, requiresAcknowledgement: true, notificationChannels: ['in_app'], contactOffOnly: true }),

  // Dashboard — Éclairage
  position_lights: entry({ id: 'position_lights', label: 'Feux de position', category: 'dashboard', subcategory: 'Éclairage', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier l\'éclairage', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  low_beam: entry({ id: 'low_beam', label: 'Feux croisement', category: 'dashboard', subcategory: 'Éclairage', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier les feux', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  high_beam: entry({ id: 'high_beam', label: 'Feux route', category: 'dashboard', subcategory: 'Éclairage', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier les feux', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  turn_signals: entry({ id: 'turn_signals', label: 'Clignotants', category: 'dashboard', subcategory: 'Éclairage', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier les clignotants', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  front_fog: entry({ id: 'front_fog', label: 'Brouillard avant', category: 'dashboard', subcategory: 'Éclairage', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier les feux antibrouillard', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  rear_fog: entry({ id: 'rear_fog', label: 'Brouillard arrière', category: 'dashboard', subcategory: 'Éclairage', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier les feux', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  reverse_lights: entry({ id: 'reverse_lights', label: 'Marche arrière', category: 'dashboard', subcategory: 'Éclairage', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier les feux de recul', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  main_lights: entry({ id: 'main_lights', label: 'Feux principaux', category: 'dashboard', subcategory: 'Éclairage', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier l\'éclairage', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),

  // Dashboard — Moteur
  check_engine: entry({ id: 'check_engine', label: 'Check Engine', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Diagnostic moteur urgent', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'email'] }),
  temperature: entry({ id: 'temperature', label: 'Température moteur', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Arrêter le moteur et vérifier le refroidissement', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'], drivingOnly: true }),
  oil_pressure: entry({ id: 'oil_pressure', label: 'Pression huile', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Arrêter le véhicule immédiatement', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'], drivingOnly: true }),
  oil_level: entry({ id: 'oil_level', label: 'Niveau huile', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Vérifier le niveau d\'huile', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  battery: entry({ id: 'battery', label: 'Batterie', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Contrôler la batterie', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  airbag: entry({ id: 'airbag', label: 'Airbag', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Diagnostic airbag urgent', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  coolant_level: entry({ id: 'coolant_level', label: 'Liquide refroidissement', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Compléter le liquide de refroidissement', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  brake_fluid_level: entry({ id: 'brake_fluid_level', label: 'Liquide frein', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Contrôle liquide de frein urgent', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  maintenance: entry({ id: 'maintenance', label: 'Appel entretien', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Planifier un entretien', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'email'] }),
  dashboard_alerts: entry({ id: 'dashboard_alerts', label: 'Indicateur tableau de bord', category: 'dashboard', subcategory: 'Moteur', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Inspecter l\'indicateur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),

  // Dashboard — Conduite
  seatbelt: entry({ id: 'seatbelt', label: 'Ceinture conducteur', category: 'dashboard', subcategory: 'Conduite', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Attacher la ceinture', autoResolvable: true, requiresAcknowledgement: true, notificationChannels: ['in_app'], drivingOnly: true }),
  cruise_control: entry({ id: 'cruise_control', label: 'Régulateur vitesse', category: 'dashboard', subcategory: 'Conduite', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Information régulateur', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'], drivingOnly: true }),
  clutch: entry({ id: 'clutch', label: 'Embrayage', category: 'dashboard', subcategory: 'Conduite', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier l\'embrayage', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  ac: entry({ id: 'ac', label: 'Climatisation', category: 'dashboard', subcategory: 'Conduite', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Information climatisation', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'], contactOffOnly: true }),
  parking_heater: entry({ id: 'parking_heater', label: 'Chauffage stationnement', category: 'dashboard', subcategory: 'Conduite', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Information chauffage', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'], contactOffOnly: true }),

  // Dashboard — Énergie
  fuel: entry({ id: 'fuel', label: 'Carburant faible', category: 'dashboard', subcategory: 'Énergie', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Faire le plein', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  ev_charging: entry({ id: 'ev_charging', label: 'Recharge véhicule électrique', category: 'dashboard', subcategory: 'Énergie', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Information recharge', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'], contactOffOnly: true }),
  fuel_source: entry({ id: 'fuel_source', label: 'Source carburant', category: 'dashboard', subcategory: 'Énergie', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier la source', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  pto: entry({ id: 'pto', label: 'Power Take Off', category: 'dashboard', subcategory: 'Énergie', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier le PTO', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  central_lock: entry({ id: 'central_lock', label: 'Fermeture centrale', category: 'dashboard', subcategory: 'Énergie', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier la fermeture', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'], contactOffOnly: true }),

  // Vehicle management
  maintenance_due: entry({ id: 'maintenance_due', label: 'Entretien à effectuer', category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Planifier l\'entretien', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'email'] }),
  oil_change: entry({ id: 'oil_change', label: 'Vidange', category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Programmer la vidange', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  technical_inspection: entry({ id: 'technical_inspection', label: 'Contrôle technique', category: 'vehicle_management', subcategory: 'Documents', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Planifier le contrôle technique', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'email'] }),
  insurance_expired: entry({ id: 'insurance_expired', label: 'Assurance expirée', category: 'vehicle_management', subcategory: 'Documents', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Renouveler l\'assurance', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'email'] }),
  registration_expired: entry({ id: 'registration_expired', label: 'Carte grise expirée', category: 'vehicle_management', subcategory: 'Documents', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Renouveler la carte grise', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  documents_expired: entry({ id: 'documents_expired', label: 'Documents expirés', category: 'vehicle_management', subcategory: 'Documents', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Mettre à jour les documents', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  lease_payment: entry({ id: 'lease_payment', label: 'Paiement location', category: 'vehicle_management', subcategory: 'Contrats', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Effectuer le paiement', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'email'] }),
  accident: entry({ id: 'accident', label: 'Véhicule accidenté', category: 'vehicle_management', subcategory: 'Incidents', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Contacter le conducteur et les assurances', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  lease_end: entry({ id: 'lease_end', label: 'Fin contrat leasing', category: 'vehicle_management', subcategory: 'Contrats', defaultSeverity: 'info', businessImpact: 'medium', recommendedAction: 'Préparer le renouvellement', autoResolvable: false, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  car_document: entry({ id: 'car_document', label: 'Papier de voiture à revoir', category: 'vehicle_management', subcategory: 'Documents', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Vérifier les documents du véhicule', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'email'] }),
  mission_order: entry({ id: 'mission_order', label: "Durée d'ordre de mission terminé", category: 'vehicle_management', subcategory: 'Contrats', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Renouveler ou clôturer la mission', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  fuel_coupon: entry({ id: 'fuel_coupon', label: 'Bon/carte de carburant à livrer', category: 'vehicle_management', subcategory: 'Contrats', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Livrer le bon ou la carte carburant', autoResolvable: false, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  brake_pads: entry({ id: 'brake_pads', label: 'Patins de frein à changer', category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Remplacer les patins de frein', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  distribution_chain: entry({ id: 'distribution_chain', label: 'Chaîne de distribution à changer', category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Planifier le remplacement de la chaîne', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  spark_plugs: entry({ id: 'spark_plugs', label: "Bougies d'allumage à changer", category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Remplacer les bougies', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  tires_change: entry({ id: 'tires_change', label: 'Pneus à changer', category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Remplacer les pneus', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  fuel_filter: entry({ id: 'fuel_filter', label: 'Filtre à gasoil à remplacer', category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Remplacer le filtre à gasoil', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  ac_filter: entry({ id: 'ac_filter', label: 'Filtre climatiseur à remplacer', category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Remplacer le filtre clim', autoResolvable: false, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  oil_filter: entry({ id: 'oil_filter', label: 'Filtre à huile à remplacer', category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Remplacer le filtre à huile', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  air_filter: entry({ id: 'air_filter', label: 'Filtre à air à remplacer', category: 'vehicle_management', subcategory: 'Entretien', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Remplacer le filtre à air', autoResolvable: false, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),

  // Geolocation
  geofence: entry({ id: 'geofence', label: 'Entrée dans la zone polygonale', category: 'geolocation', subcategory: 'Zones', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier la conformité', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  geofence_exit: entry({ id: 'geofence_exit', label: "Sortie de l'itinéraire", category: 'geolocation', subcategory: 'Itinéraire', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Contacter le conducteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  polygon_exit: entry({ id: 'polygon_exit', label: 'Sortie de la zone polygonale', category: 'geolocation', subcategory: 'Zones', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Vérifier la position', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  city_exit: entry({ id: 'city_exit', label: 'Sortie de ville autorisée', category: 'geolocation', subcategory: 'Zones', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Confirmer l\'autorisation', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  route: entry({ id: 'route', label: "Sortie de l'itinéraire", category: 'geolocation', subcategory: 'Itinéraire', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Contacter le conducteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  departure_point: entry({ id: 'departure_point', label: 'Arrivée point de départ', category: 'geolocation', subcategory: 'Itinéraire', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Confirmer le départ', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  arrival_point: entry({ id: 'arrival_point', label: 'Arrivée destination', category: 'geolocation', subcategory: 'Itinéraire', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Confirmer l\'arrivée', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  restricted_hours: entry({ id: 'restricted_hours', label: 'Circulation horaires interdits', category: 'geolocation', subcategory: 'Zones', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Alerter le conducteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  long_stop: entry({ id: 'long_stop', label: 'Stop de longue durée', category: 'geolocation', subcategory: 'Arrêts', defaultSeverity: 'info', businessImpact: 'medium', recommendedAction: 'Vérifier la raison de l\'arrêt', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  abnormal_immobilization: entry({ id: 'abnormal_immobilization', label: 'Immobilisation anormale', category: 'geolocation', subcategory: 'Arrêts', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Contacter le conducteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  country_border: entry({ id: 'country_border', label: 'Sortie du pays', category: 'geolocation', subcategory: 'Zones', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Confirmer la sortie du territoire', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  stop: entry({ id: 'stop', label: 'Ralenti excessif', category: 'geolocation', subcategory: 'Arrêts', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Optimiser le temps moteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  presence_in_area: entry({ id: 'presence_in_area', label: 'Présence de véhicule pour une période déterminée', category: 'geolocation', subcategory: 'Zones', defaultSeverity: 'info', businessImpact: 'medium', recommendedAction: 'Vérifier la présence en zone', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  absence_from_area: entry({ id: 'absence_from_area', label: 'Absence de véhicule pour une période déterminée', category: 'geolocation', subcategory: 'Zones', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Localiser le véhicule', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),

  // Driving quality
  speeding: entry({ id: 'speeding', label: 'Dépassement de vitesse', category: 'driving_quality', subcategory: 'Vitesse', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Contacter le conducteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'], drivingOnly: true }),
  harsh_brake: entry({ id: 'harsh_brake', label: 'Conduite agressive (Freinage brusque)', category: 'driving_quality', subcategory: 'Comportement', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Coaching conducteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'], drivingOnly: true }),
  harsh_accel: entry({ id: 'harsh_accel', label: 'Conduite agressive (Accélération brusque)', category: 'driving_quality', subcategory: 'Comportement', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Coaching conducteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'], drivingOnly: true }),
  harsh_turn: entry({ id: 'harsh_turn', label: 'Virage agressif', category: 'driving_quality', subcategory: 'Comportement', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Coaching conducteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'], drivingOnly: true }),
  hard_deceleration: entry({ id: 'hard_deceleration', label: 'Décélération brusque', category: 'driving_quality', subcategory: 'Comportement', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Analyser l\'événement', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'], drivingOnly: true }),
  excessive_idle: entry({ id: 'excessive_idle', label: 'Ralenti excessif moteur', category: 'driving_quality', subcategory: 'Comportement', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Couper le moteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  aggressive_driving: entry({ id: 'aggressive_driving', label: 'Conduite agressive', category: 'driving_quality', subcategory: 'Comportement', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Session de coaching', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'email'] }),
  engine_overspeed: entry({ id: 'engine_overspeed', label: 'Surrégime du moteur', category: 'driving_quality', subcategory: 'Moteur', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Réduire le régime moteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'], drivingOnly: true }),
  driving_time_exceeded: entry({ id: 'driving_time_exceeded', label: 'Dépassement temps de conduite', category: 'driving_quality', subcategory: 'Réglementation', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Pause réglementaire immédiate', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  tunisian_road_speed_limit: entry({ id: 'tunisian_road_speed_limit', label: 'Dépassement de vitesse par rapport à la limite', category: 'driving_quality', subcategory: 'Vitesse', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Ralentir selon la limite de la route', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'], drivingOnly: true }),
  high_fuel_consumption: entry({ id: 'high_fuel_consumption', label: 'Dépassement de consommation de carburant', category: 'driving_quality', subcategory: 'Consommation', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Analyser le style de conduite', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),

  // Security
  gps_signal: entry({ id: 'gps_signal', label: 'GPS perdu', category: 'security', subcategory: 'Connectivité', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Vérifier le traceur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  gsm_lost: entry({ id: 'gsm_lost', label: 'GSM perdu', category: 'security', subcategory: 'Connectivité', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Vérifier la couverture réseau', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  gps_battery_low: entry({ id: 'gps_battery_low', label: 'Batterie GPS faible', category: 'security', subcategory: 'Connectivité', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Remplacer la batterie GPS', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  gps_jamming: entry({ id: 'gps_jamming', label: 'Brouillage GPS', category: 'security', subcategory: 'Connectivité', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Alerter la sécurité', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  battery_disconnected: entry({ id: 'battery_disconnected', label: 'Batterie débranchée', category: 'security', subcategory: 'Protection', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Risque de vol — intervention', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  towing: entry({ id: 'towing', label: 'Remorquage', category: 'security', subcategory: 'Protection', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Localiser le véhicule', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms', 'push'] }),
  unauthorized_start: entry({ id: 'unauthorized_start', label: 'Démarrage non autorisé', category: 'security', subcategory: 'Protection', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Alerter la sécurité', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  fuel_theft: entry({ id: 'fuel_theft', label: 'Vol de carburant', category: 'security', subcategory: 'Protection', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Enquêter immédiatement', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  removal: entry({ id: 'removal', label: 'Déconnexion boîtier', category: 'security', subcategory: 'Protection', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Intervention sécurité', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  power_cut: entry({ id: 'power_cut', label: 'Coupure alimentation', category: 'security', subcategory: 'Protection', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Vérifier l\'alimentation', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  sos: entry({ id: 'sos', label: 'SOS', category: 'security', subcategory: 'Urgence', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Appeler le conducteur et les secours', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms', 'push'] }),
  remote_arming_enable_ok: entry({ id: 'remote_arming_enable_ok', label: "Activation de la commande d'arrêt à distance a été réussie", category: 'security', subcategory: 'Commandes', defaultSeverity: 'info', businessImpact: 'medium', recommendedAction: 'Confirmer l\'immobilisation', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  remote_arming_enable_fail: entry({ id: 'remote_arming_enable_fail', label: "Activation de la commande d'arrêt à distance a été échouée", category: 'security', subcategory: 'Commandes', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Réessayer la commande', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  remote_arming_disable_ok: entry({ id: 'remote_arming_disable_ok', label: "Désactivation de la commande d'arrêt à distance a été réussie", category: 'security', subcategory: 'Commandes', defaultSeverity: 'info', businessImpact: 'medium', recommendedAction: 'Confirmer la réactivation', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  remote_arming_disable_fail: entry({ id: 'remote_arming_disable_fail', label: "Désactivation de la commande d'arrêt à distance a été échouée", category: 'security', subcategory: 'Commandes', defaultSeverity: 'warning', businessImpact: 'high', recommendedAction: 'Réessayer la commande', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  tank_low: entry({ id: 'tank_low', label: 'Niveau de réservoir faible', category: 'security', subcategory: 'Carburant', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Faire le plein', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  tank_very_low: entry({ id: 'tank_very_low', label: 'Niveau de réservoir est très faible', category: 'security', subcategory: 'Carburant', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Faire le plein immédiatement', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  fuel_fill: entry({ id: 'fuel_fill', label: 'Remplissage de carburant', category: 'security', subcategory: 'Carburant', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Confirmer le remplissage', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  stop_contact_on: entry({ id: 'stop_contact_on', label: 'Stop avec moteur en marche', category: 'security', subcategory: 'Arrêts', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Vérifier le véhicule', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  stop_contact_off: entry({ id: 'stop_contact_off', label: 'Stop avec moteur en arrêt', category: 'security', subcategory: 'Arrêts', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Information arrêt', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  temperature_alert: entry({ id: 'temperature_alert', label: 'Alerte de température', category: 'security', subcategory: 'Température', defaultSeverity: 'warning', businessImpact: 'medium', recommendedAction: 'Vérifier la température', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app'] }),
  engine_temperature: entry({ id: 'engine_temperature', label: 'Dépassement de température moteur', category: 'security', subcategory: 'Température', defaultSeverity: 'critical', businessImpact: 'high', recommendedAction: 'Arrêter le moteur', autoResolvable: false, requiresAcknowledgement: true, notificationChannels: ['in_app', 'sms'] }),
  contact_on_off: entry({ id: 'contact_on_off', label: 'Contact On/Off', category: 'security', subcategory: 'Contact', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier le statut contact', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),

  // Legacy / operational
  ignition: entry({ id: 'ignition', label: 'Contact ON/OFF', category: 'dashboard', subcategory: 'Conduite', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier le statut mission', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  taxi_status: entry({ id: 'taxi_status', label: 'Début / fin mission', category: 'geolocation', subcategory: 'Itinéraire', defaultSeverity: 'info', businessImpact: 'medium', recommendedAction: 'Confirmer la mission', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  message_received: entry({ id: 'message_received', label: 'Message reçu', category: 'dashboard', subcategory: 'Général', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Lire le message', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  driver_identification: entry({ id: 'driver_identification', label: 'Identification conducteur', category: 'dashboard', subcategory: 'Conduite', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Vérifier l\'identité', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  fleet_alert: entry({ id: 'fleet_alert', label: 'Règle de seuil', category: 'vehicle_management', subcategory: 'Configuration', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Revoir la règle', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  photo_received: entry({ id: 'photo_received', label: 'Photo reçue', category: 'dashboard', subcategory: 'Général', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Consulter la photo', autoResolvable: true, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
  unknown: entry({ id: 'unknown', label: 'Alerte inconnue', category: 'dashboard', subcategory: 'Général', defaultSeverity: 'info', businessImpact: 'low', recommendedAction: 'Analyser l\'événement', autoResolvable: false, requiresAcknowledgement: false, notificationChannels: ['in_app'] }),
};

export function getTaxonomyEntry(type: AlertType): AlertTaxonomyEntry {
  return ALERT_TAXONOMY[type] ?? ALERT_TAXONOMY.unknown;
}

export function getAlertsByCategory(category: AlertCategory): AlertTaxonomyEntry[] {
  return Object.values(ALERT_TAXONOMY).filter((e) => e.id !== 'all' && e.category === category);
}

export function getAlertTypeLabel(type: AlertType): string {
  return getTaxonomyEntry(type).label;
}

export function severityToPriority(severity: AlertSeverity): AlertPriority {
  if (severity === 'critical') return 'critical';
  if (severity === 'warning') return 'medium';
  return 'low';
}

export function priorityToSeverity(priority: AlertPriority): AlertSeverity {
  if (priority === 'critical') return 'critical';
  if (priority === 'high' || priority === 'medium') return 'warning';
  return 'info';
}
