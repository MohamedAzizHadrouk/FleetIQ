export type SuivieAction =
  | 'suivie_generale'
  | 'alertes'
  | 'stop_circulation'
  | 'trajectoire'
  | 'commandes';

export interface ColumnDef {
  id: string;
  label: string;
  defaultVisible: boolean;
}

export const ACTIONS: { id: SuivieAction; label: string }[] = [
  { id: 'suivie_generale', label: 'Suivi général' },
  { id: 'alertes', label: 'Alertes' },
  { id: 'stop_circulation', label: 'Stop & Circulation' },
  { id: 'trajectoire', label: 'Trajectoire' },
  { id: 'commandes', label: 'Commandes' },
];

export const SUIVIE_DEPARTMENTS = [
  'DEmo2025',
  'LATRACE',
  'test',
  'TUNAV',
] as const;

export type SuivieDepartment = (typeof SUIVIE_DEPARTMENTS)[number];

const trackingColumns: ColumnDef[] = [
  { id: 'name', label: 'Véhicule', defaultVisible: true },
  { id: 'date', label: 'Date / heure', defaultVisible: true },
  { id: 'speed', label: 'Vitesse', defaultVisible: true },
  { id: 'positionAddress', label: 'Adresse', defaultVisible: true },
  { id: 'driver', label: 'Chauffeur', defaultVisible: true },
  { id: 'Department', label: 'Département', defaultVisible: true },
  { id: 'horodatage', label: 'Horodatage', defaultVisible: false },
  { id: 'Mileage', label: 'Kilométrage', defaultVisible: false },
  { id: 'engineHours', label: 'Heures moteur', defaultVisible: false },
  { id: 'LastAlert', label: 'Dernière alerte', defaultVisible: false },
  { id: 'Contact', label: 'Contact', defaultVisible: false },
  { id: 'engine', label: 'Moteur', defaultVisible: false },
  { id: 'FuelLevel', label: 'Carburant', defaultVisible: false },
  { id: 'Temperature', label: 'Température', defaultVisible: false },
  { id: 'EngineTemperature', label: 'Temp. moteur', defaultVisible: false },
  { id: 'Equipment', label: 'Équipement', defaultVisible: false },
  { id: 'SimCardNumber', label: 'N° SIM', defaultVisible: false },
  { id: 'ChassisNumber', label: 'N° châssis', defaultVisible: false },
  { id: 'BatteryLevel', label: 'Batterie', defaultVisible: false },
  { id: 'HumidityLevel', label: 'Humidité', defaultVisible: false },
  { id: 'ElockBattery', label: 'Batterie e-lock', defaultVisible: false },
  { id: 'LockStatus', label: 'Verrouillage', defaultVisible: false },
  { id: 'SealStatus', label: 'Scellé', defaultVisible: false },
  { id: 'TearDownStatus', label: 'Arrachement', defaultVisible: false },
  { id: 'TotalFuel', label: 'Carburant total', defaultVisible: false },
  { id: 'Latitude', label: 'Latitude', defaultVisible: false },
  { id: 'Longitude', label: 'Longitude', defaultVisible: false },
  { id: 'CardId', label: 'Card ID', defaultVisible: false },
  { id: 'waterdetected1', label: 'Eau détectée', defaultVisible: false },
  { id: 'SNSonde1', label: 'SN Sonde 1', defaultVisible: false },
  { id: 'VolumeSonde1', label: 'Volume Sonde 1', defaultVisible: false },
  { id: 'TemperatureSonde1', label: 'Temp. Sonde 1', defaultVisible: false },
  { id: 'BatteryLevelSonde1', label: 'Batterie Sonde 1', defaultVisible: false },
  { id: 'StatusConnectedSonde1', label: 'Sonde 1 connectée', defaultVisible: false },
  { id: 'AdBlueLevel', label: 'AdBlue', defaultVisible: false },
  { id: 'AxleWeight1st', label: 'Poids essieu 1', defaultVisible: false },
  { id: 'AxleWeight', label: 'Poids essieu 2', defaultVisible: false },
  { id: 'AxleWeight3rd', label: 'Poids essieu 3', defaultVisible: false },
  { id: 'AxleWeight4th', label: 'Poids essieu 4', defaultVisible: false },
  { id: 'RapidBrackings', label: 'Freinages brusques', defaultVisible: false },
  { id: 'RapidAccelerations', label: 'Accélérations brusques', defaultVisible: false },
  { id: 'SpecialityName', label: 'Spécialité', defaultVisible: false },
  { id: 'Dashboard', label: 'Dashboard', defaultVisible: true },
];

const alertColumns: ColumnDef[] = [
  { id: 'Vehicle', label: 'Véhicule', defaultVisible: true },
  { id: 'Date', label: 'Date', defaultVisible: true },
  { id: 'Type', label: "Type d'alerte", defaultVisible: true },
  { id: 'Address', label: 'Adresse', defaultVisible: true },
  { id: 'Speed', label: 'Vitesse', defaultVisible: true },
  { id: 'Mileage', label: 'Kilométrage', defaultVisible: true },
  { id: 'Chassis', label: 'N° châssis', defaultVisible: false },
  { id: 'Action', label: 'Action', defaultVisible: false },
];

const runStopColumns: ColumnDef[] = [
  { id: 'Status', label: 'État', defaultVisible: true },
  { id: 'Matricule', label: 'Matricule', defaultVisible: true },
  { id: 'Place', label: 'Emplacement', defaultVisible: true },
  { id: 'Distance', label: 'Distance', defaultVisible: true },
  { id: 'Period', label: 'Période', defaultVisible: true },
  { id: 'StartDate', label: 'Date début', defaultVisible: true },
  { id: 'AvgSpeed', label: 'Vitesse moy.', defaultVisible: false },
  { id: 'Action', label: 'Action', defaultVisible: false },
];

const trajectoryColumns: ColumnDef[] = [
  { id: 'StopRun', label: 'Stop/Circulation', defaultVisible: true },
  { id: 'StartDate', label: 'Date début', defaultVisible: true },
  { id: 'Period', label: 'Période', defaultVisible: true },
  { id: 'Speed', label: 'Vitesse', defaultVisible: true },
  { id: 'Distance', label: 'Distance', defaultVisible: true },
  { id: 'Place', label: 'Emplacement', defaultVisible: true },
  { id: 'AlertIcon', label: 'Alerte', defaultVisible: false },
  { id: 'OtherInfo', label: 'Info', defaultVisible: false },
  { id: 'Fuel', label: 'Carburant', defaultVisible: false },
  { id: 'BatteryLevel', label: 'Batterie', defaultVisible: false },
  { id: 'IgnOn', label: 'Contact', defaultVisible: false },
  { id: 'FuelConsumptionAvgInL100Km', label: 'Conso. L/100km', defaultVisible: false },
  { id: 'Direction', label: 'Direction', defaultVisible: false },
  { id: 'CentralLock', label: 'Verrou central', defaultVisible: false },
  { id: 'Temperature', label: 'Température', defaultVisible: false },
  { id: 'EngineHours', label: 'Heures moteur', defaultVisible: false },
  { id: 'EngineTemperature', label: 'Temp. moteur', defaultVisible: false },
  { id: 'RPM', label: 'RPM', defaultVisible: false },
  { id: 'Latitude', label: 'Latitude', defaultVisible: false },
  { id: 'Longitude', label: 'Longitude', defaultVisible: false },
  { id: 'Report_Reason', label: 'Raison rapport', defaultVisible: false },
  { id: 'LockStatus', label: 'Verrouillage', defaultVisible: false },
  { id: 'SealStatus', label: 'Scellé', defaultVisible: false },
  { id: 'ElockBattery', label: 'Batterie e-lock', defaultVisible: false },
  { id: 'Mileage', label: 'Kilométrage', defaultVisible: false },
  { id: 'AxleWeight1st', label: 'Poids essieu 1', defaultVisible: false },
  { id: 'AxleWeight', label: 'Poids essieu 2', defaultVisible: false },
  { id: 'AxleWeight3rd', label: 'Poids essieu 3', defaultVisible: false },
  { id: 'AxleWeight4th', label: 'Poids essieu 4', defaultVisible: false },
  { id: 'RapidBrackings', label: 'Freinages brusques', defaultVisible: false },
  { id: 'RapidAccelerations', label: 'Accélérations brusques', defaultVisible: false },
  { id: 'AdBlueLevel', label: 'AdBlue', defaultVisible: false },
  { id: 'HumidityLevel', label: 'Humidité', defaultVisible: false },
  { id: 'SNSonde1', label: 'SN Sonde 1', defaultVisible: false },
  { id: 'VolumeSonde1', label: 'Volume Sonde 1', defaultVisible: false },
  { id: 'TemperatureSonde1', label: 'Temp. Sonde 1', defaultVisible: false },
  { id: 'BatteryLevelSonde1', label: 'Batterie Sonde 1', defaultVisible: false },
  { id: 'StatusConnectedSonde1', label: 'Sonde 1 connectée', defaultVisible: false },
  { id: 'waterdetected1', label: 'Eau détectée', defaultVisible: false },
];

const commandColumns: ColumnDef[] = [
  { id: 'SendDate', label: "Date d'envoi", defaultVisible: true },
  { id: 'Vehicle', label: 'Véhicule', defaultVisible: true },
  { id: 'CommandType', label: 'Type de commande', defaultVisible: true },
  { id: 'Status', label: 'État', defaultVisible: true },
];

export const COLUMN_DEFS: Record<SuivieAction, ColumnDef[]> = {
  suivie_generale: trackingColumns,
  alertes: alertColumns,
  stop_circulation: runStopColumns,
  trajectoire: trajectoryColumns,
  commandes: commandColumns,
};

export function getColumnDefs(action: SuivieAction): ColumnDef[] {
  return COLUMN_DEFS[action];
}

export function getDefaultVisibleOrderedIds(action: SuivieAction): string[] {
  return COLUMN_DEFS[action]
    .filter((c) => c.defaultVisible)
    .map((c) => c.id);
}

export function getDefaultOrder(action: SuivieAction): string[] {
  return COLUMN_DEFS[action].map((c) => c.id);
}

export function getDefaultVisibility(
  action: SuivieAction
): Record<string, boolean> {
  return Object.fromEntries(
    COLUMN_DEFS[action].map((c) => [c.id, c.defaultVisible])
  );
}

export function getColumnLabel(action: SuivieAction, id: string): string {
  return COLUMN_DEFS[action].find((c) => c.id === id)?.label ?? id;
}
