import {
  InOutGeometricShapeStatus,
  SensitivityLevel,
  type AlertEquipmentConfig,
  type AlertField,
  type GeometricShapeAlertConfig,
} from './types';

export const SENSITIVITY_OPTIONS = [
  { value: SensitivityLevel.HighSensitivity, label: 'Haute' },
  { value: SensitivityLevel.MediumSensitivity, label: 'Moyenne' },
  { value: SensitivityLevel.LowSensitivity, label: 'Basse' },
];

export const GENERAL_FIELDS: AlertField[] = [
  { key: 'enableDoorAlert', label: 'État des portes', type: 'toggle' },
  { key: 'enableToWingAlert', label: 'Remorquage', type: 'toggle' },
  { key: 'enableAccAlert', label: 'État de contact (on/off)', type: 'toggle' },
  {
    key: 'enableExternalBatteryRemovedAlert',
    label: 'Batterie déconnectée',
    type: 'toggle',
  },
  { key: 'enableSosAlert', label: 'Bouton SOS enfoncé', type: 'toggle' },
  {
    key: 'enableRpmOutOfRangeAlert',
    label: 'Dépassement RPM moteur',
    type: 'toggle',
  },
  {
    key: 'rpmThreshold',
    label: 'Seuil RPM',
    type: 'number',
    showWhen: 'enableRpmOutOfRangeAlert',
    suffix: 'RPM',
    min: 0,
  },
];

export const TEMPERATURE_FIELDS: AlertField[] = [
  {
    key: 'enableTemperatureAlert',
    label: "Activer l'alerte de dépassement de température moteur",
    type: 'toggle',
  },
  {
    key: 'temperatureThreshold',
    label: 'Seuil de température',
    type: 'number',
    showWhen: 'enableTemperatureAlert',
    suffix: '°C',
    min: -50,
    max: 200,
  },
];

export const FUEL_FIELDS: AlertField[] = [
  {
    key: 'enableFuelStolenDetectionAlert',
    label: 'Chute brusque de carburant',
    type: 'toggle',
  },
  {
    key: 'fuelStolenPercentThreshold',
    label: 'Seuil de chute',
    type: 'number',
    showWhen: 'enableFuelStolenDetectionAlert',
    suffix: '%',
    min: 0,
    max: 100,
  },
  {
    key: 'enableFuelRefillAlert',
    label: 'Remplissage de carburant dépasse',
    type: 'toggle',
  },
  {
    key: 'fuelRefillPercentThreshold',
    label: 'Seuil de remplissage',
    type: 'number',
    showWhen: 'enableFuelRefillAlert',
    suffix: '%',
    min: 0,
    max: 100,
  },
  {
    key: 'enableHighFuelConsumptionAlert',
    label: 'Dépassement de consommation de carburant',
    type: 'toggle',
  },
  {
    key: 'theoriticalConsumptionL100Km',
    label: 'Consommation théorique',
    type: 'number',
    showWhen: 'enableHighFuelConsumptionAlert',
    suffix: 'L/100km',
    min: 0,
  },
];

export const SPEED_FIELDS: AlertField[] = [
  { key: 'enableOverSpeedAlert', label: 'Dépassement de vitesse', type: 'toggle' },
  {
    key: 'overSpeedKmh',
    label: 'Vitesse maximale',
    type: 'number',
    showWhen: 'enableOverSpeedAlert',
    suffix: 'km/h',
    min: 0,
  },
  {
    key: 'enterDelayTimeS',
    label: 'Délai avant déclenchement',
    type: 'number',
    showWhen: 'enableOverSpeedAlert',
    suffix: 's',
    min: 0,
  },
  {
    key: 'overSpeedPeriodicitySendings',
    label: "Périodicité d'envoi",
    type: 'number',
    showWhen: 'enableOverSpeedAlert',
    min: 0,
  },
  {
    key: 'enableBuzzer',
    label: "Activer la sirène d'alarme en cas d'excès de vitesse",
    type: 'toggle',
    showWhen: 'enableOverSpeedAlert',
  },
  {
    key: 'enableLocalRouteOverSpeedAlert',
    label: 'Dépassement de vitesse sur itinéraire local',
    type: 'toggle',
  },
  {
    key: 'speedRangeThreshold',
    label: 'Seuil de plage de vitesse (+-)',
    type: 'number',
    showWhen: 'enableLocalRouteOverSpeedAlert',
    suffix: 'km/h',
    min: 0,
  },
];

export const STOP_FIELDS: AlertField[] = [
  {
    key: 'enableLongDurationStopAlert',
    label: 'Stop de longue durée',
    type: 'toggle',
  },
  {
    key: 'stopDetectionThresholdInSec',
    label: 'Seuil de détection',
    type: 'number',
    showWhen: 'enableLongDurationStopAlert',
    suffix: 's',
    min: 0,
  },
  {
    key: 'generateLongStopAlarmIfNoPositionSent',
    label:
      "Générer l'alerte même si le véhicule n'envoie pas de positions",
    type: 'toggle',
    showWhen: 'enableLongDurationStopAlert',
  },
  {
    key: 'enableStopDetectionWithAccOnOffAlert',
    label: 'Stop pour une période avec état contact',
    type: 'toggle',
  },
  {
    key: 'timeThresholdInSec',
    label: 'Durée du stop',
    type: 'number',
    showWhen: 'enableStopDetectionWithAccOnOffAlert',
    suffix: 's',
    min: 0,
  },
  {
    key: 'isAccOn',
    label: 'Avec le moteur lancé ?',
    type: 'toggle',
    showWhen: 'enableStopDetectionWithAccOnOffAlert',
  },
];

export const DRIVING_FIELDS: AlertField[] = [
  {
    key: 'enableAggressiveDrivingAlert',
    label: 'Conduite agressive',
    type: 'toggle',
  },
  {
    key: 'accelerationThresholdG',
    label: "Seuil d'accélération",
    type: 'number',
    showWhen: 'enableAggressiveDrivingAlert',
    suffix: 'G',
    min: 0,
    step: 0.1,
  },
  {
    key: 'accelerationSensitivity',
    label: 'Sensibilité accélération',
    type: 'select',
    showWhen: 'enableAggressiveDrivingAlert',
    options: SENSITIVITY_OPTIONS,
  },
  {
    key: 'brakingSensitivity',
    label: 'Sensibilité freinage',
    type: 'select',
    showWhen: 'enableAggressiveDrivingAlert',
    options: SENSITIVITY_OPTIONS,
  },
  {
    key: 'enableBuzzerForAggressiveAlert',
    label: 'Activer la sirène (conduite agressive)',
    type: 'toggle',
    showWhen: 'enableAggressiveDrivingAlert',
  },
  {
    key: 'enableExceededDrivingTimeAlert',
    label: 'Dépassement de temps de conduite',
    type: 'toggle',
  },
  {
    key: 'timeThresholdInSec',
    label: 'Seuil de temps de conduite',
    type: 'number',
    showWhen: 'enableExceededDrivingTimeAlert',
    suffix: 's',
    min: 0,
  },
  {
    key: 'enableBuzzerForExceededDrivingTime',
    label: 'Activer la sirène (temps de conduite)',
    type: 'toggle',
    showWhen: 'enableExceededDrivingTimeAlert',
  },
];

export function defaultGeneral(): Record<string, boolean | number> {
  return {
    enableDoorAlert: false,
    enableToWingAlert: false,
    enableAccAlert: false,
    enableExternalBatteryRemovedAlert: false,
    enableSosAlert: false,
    enableRpmOutOfRangeAlert: false,
    rpmThreshold: 0,
  };
}

export function defaultTemperature(): Record<string, boolean | number> {
  return { enableTemperatureAlert: false, temperatureThreshold: 0 };
}

export function defaultFuel(): Record<string, boolean | number> {
  return {
    enableFuelStolenDetectionAlert: false,
    fuelStolenPercentThreshold: 0,
    enableFuelRefillAlert: false,
    fuelRefillPercentThreshold: 0,
    enableHighFuelConsumptionAlert: false,
    theoriticalConsumptionL100Km: 0,
  };
}

export function defaultSpeed(): Record<string, boolean | number> {
  return {
    enableOverSpeedAlert: false,
    overSpeedKmh: 0,
    enterDelayTimeS: 0,
    overSpeedPeriodicitySendings: 0,
    enableBuzzer: false,
    enableLocalRouteOverSpeedAlert: false,
    speedRangeThreshold: 0,
  };
}

export function defaultStop(): Record<string, boolean | number> {
  return {
    enableLongDurationStopAlert: false,
    stopDetectionThresholdInSec: 0,
    generateLongStopAlarmIfNoPositionSent: false,
    enableStopDetectionWithAccOnOffAlert: false,
    timeThresholdInSec: 0,
    isAccOn: false,
  };
}

export function defaultDriving(): Record<string, boolean | number> {
  return {
    enableAggressiveDrivingAlert: false,
    accelerationThresholdG: 0.5,
    accelerationSensitivity: SensitivityLevel.MediumSensitivity,
    brakingSensitivity: SensitivityLevel.MediumSensitivity,
    enableBuzzerForAggressiveAlert: false,
    enableExceededDrivingTimeAlert: false,
    timeThresholdInSec: 0,
    enableBuzzerForExceededDrivingTime: false,
  };
}

export function emptyGeoItem(): GeometricShapeAlertConfig {
  return {
    enableWayAlarm: false,
    distanceInM: 0,
    dayOfWeeks: [],
    idPlaceOrGeometricShape: 0,
    inOutGeometricShapeStatus: InOutGeometricShapeStatus.InOut,
    startTime: '00:00',
    endTime: '23:59',
  };
}

export function createDefaultEquipmentConfig(equipment: string): AlertEquipmentConfig {
  return {
    equipment,
    general: defaultGeneral(),
    temperature: defaultTemperature(),
    fuel: defaultFuel(),
    speed: defaultSpeed(),
    stop: defaultStop(),
    driving: defaultDriving(),
    geometricShape: {
      wayAlerts: [],
      polygonAlerts: [],
      placeAlerts: [],
    },
  };
}
