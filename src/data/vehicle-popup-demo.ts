import type { Vehicle } from '@/types';

/** Presentation-only demo fallback. Never persist these values as live telemetry. */
export function withVehiclePopupDemo(vehicle: Vehicle): Vehicle {
  const seed = Array.from(vehicle.id).reduce(
    (value, character) => (Math.imul(value, 31) + character.charCodeAt(0)) >>> 0,
    7
  );
  const fuelLevel = vehicle.fuelLevel ?? 38 + (seed % 43);
  const mileage = vehicle.mileage ?? 48200 + (seed % 96000);
  // Fixed sample time keeps demo readings stable when switching pages or vehicles.
  const timestamp = vehicle.timestamp ?? new Date(
    Date.UTC(2026, 8, 28, 8, 20, 0) - (seed % 900) * 1000
  ).toISOString();
  const defaults: Partial<Vehicle> = {
    imei: `35693803${String(seed % 10000000).padStart(7, '0')}`,
    mileage,
    engineHours: Math.round(mileage / 37),
    engineTemperature: vehicle.status === 'active' ? 82 + seed % 11 : 31 + seed % 18,
    fuelLevel,
    fuelVolume: Math.round(70 * fuelLevel) / 100,
    fuelConsumption: (64 + seed % 38) / 10,
    driverId: `CH-${String(1000 + seed % 9000)}`,
    drivingTime: `${2 + seed % 4} h ${String(seed % 60).padStart(2, '0')} min`,
    serialNumber: `FMC130-${String(seed % 100000000).padStart(8, '0')}`,
    chipNumber: '93701195',
    temperature: (215 + seed % 65) / 10,
    probeState: vehicle.status === 'offline' ? 'Dernière mesure reçue' : 'Connectée · signal stable',
    waterPresence: false,
    timestamp,
    cardId: `RFID-${seed.toString(16).toUpperCase().padStart(8, '0')}`,
  };
  // Preserve supplied readings, including zero values and false sensor states.
  const supplied = Object.fromEntries(
    Object.entries(vehicle).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
  return { ...vehicle, ...defaults, ...supplied };
}
