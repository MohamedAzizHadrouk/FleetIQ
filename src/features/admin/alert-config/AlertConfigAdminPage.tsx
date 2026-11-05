import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { VehicleSidebar } from './VehicleSidebar';
import { AlertSectionCard } from './AlertSectionCard';
import { GeoAlertSection } from './GeoAlertSection';
import {
  DRIVING_FIELDS,
  FUEL_FIELDS,
  GENERAL_FIELDS,
  SPEED_FIELDS,
  STOP_FIELDS,
  TEMPERATURE_FIELDS,
  defaultDriving,
  defaultFuel,
  defaultGeneral,
  defaultSpeed,
  defaultStop,
  defaultTemperature,
} from './defaults';
import {
  useAlertEquipmentConfig,
  useResetAlertSection,
  useSaveAlertSection,
} from './hooks';
import type {
  AlertConfigSectionId,
  GeometricShapeAlertConfig,
  SelectedVehicle,
} from './types';

interface AlertConfigAdminPageProps {
  initialVehicleId?: string | null;
}

export function AlertConfigAdminPage({
  initialVehicleId = null,
}: AlertConfigAdminPageProps) {
  const [selected, setSelected] = useState<SelectedVehicle | null>(null);
  const [savingSection, setSavingSection] = useState<AlertConfigSectionId | null>(
    null
  );

  const [general, setGeneral] = useState(defaultGeneral());
  const [temperature, setTemperature] = useState(defaultTemperature());
  const [fuel, setFuel] = useState(defaultFuel());
  const [speed, setSpeed] = useState(defaultSpeed());
  const [stop, setStop] = useState(defaultStop());
  const [driving, setDriving] = useState(defaultDriving());
  const [wayAlerts, setWayAlerts] = useState<GeometricShapeAlertConfig[]>([]);
  const [polygonAlerts, setPolygonAlerts] = useState<GeometricShapeAlertConfig[]>(
    []
  );
  const [placeAlerts, setPlaceAlerts] = useState<GeometricShapeAlertConfig[]>([]);

  const equipment = selected?.carId ?? null;
  const { data: config, isLoading } = useAlertEquipmentConfig(equipment);
  const saveMut = useSaveAlertSection();
  const resetMut = useResetAlertSection();

  useEffect(() => {
    if (!config) return;
    setGeneral({ ...defaultGeneral(), ...config.general });
    setTemperature({ ...defaultTemperature(), ...config.temperature });
    setFuel({ ...defaultFuel(), ...config.fuel });
    setSpeed({ ...defaultSpeed(), ...config.speed });
    setStop({ ...defaultStop(), ...config.stop });
    setDriving({ ...defaultDriving(), ...config.driving });
    setWayAlerts(config.geometricShape.wayAlerts ?? []);
    setPolygonAlerts(config.geometricShape.polygonAlerts ?? []);
    setPlaceAlerts(config.geometricShape.placeAlerts ?? []);
  }, [config]);

  const onSelectVehicle = (vehicle: SelectedVehicle) => {
    setSelected(vehicle);
    setGeneral(defaultGeneral());
    setTemperature(defaultTemperature());
    setFuel(defaultFuel());
    setSpeed(defaultSpeed());
    setStop(defaultStop());
    setDriving(defaultDriving());
    setWayAlerts([]);
    setPolygonAlerts([]);
    setPlaceAlerts([]);
  };

  // Auto-select when navigating from Suivi with a vehicle id
  useEffect(() => {
    if (!initialVehicleId || selected) return;
    // Soft: wait until user expands; if same id already selected skip
  }, [initialVehicleId, selected]);

  const saveSection = async (
    section: AlertConfigSectionId,
    payload:
      | Record<string, boolean | number>
      | {
          wayAlerts: GeometricShapeAlertConfig[];
          polygonAlerts: GeometricShapeAlertConfig[];
          placeAlerts: GeometricShapeAlertConfig[];
        }
  ) => {
    if (!equipment) return;
    setSavingSection(section);
    try {
      await saveMut.mutateAsync({ equipment, section, payload });
    } finally {
      setSavingSection(null);
    }
  };

  const resetSection = async (section: AlertConfigSectionId) => {
    if (!equipment) return;
    setSavingSection(section);
    try {
      const updated = await resetMut.mutateAsync({ equipment, section });
      if (section === 'general') setGeneral({ ...defaultGeneral(), ...updated.general });
      if (section === 'temperature')
        setTemperature({ ...defaultTemperature(), ...updated.temperature });
      if (section === 'fuel') setFuel({ ...defaultFuel(), ...updated.fuel });
      if (section === 'speed') setSpeed({ ...defaultSpeed(), ...updated.speed });
      if (section === 'stop') setStop({ ...defaultStop(), ...updated.stop });
      if (section === 'driving')
        setDriving({ ...defaultDriving(), ...updated.driving });
      if (section === 'geo') {
        setWayAlerts(updated.geometricShape.wayAlerts ?? []);
        setPolygonAlerts(updated.geometricShape.polygonAlerts ?? []);
        setPlaceAlerts(updated.geometricShape.placeAlerts ?? []);
      }
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="flex h-full bg-slate-50">
      <VehicleSidebar
        selectedCarId={selected?.carId ?? null}
        onSelect={onSelectVehicle}
      />

      <div className="flex flex-1 flex-col bg-slate-50">
        {selected ? (
          <>
            <div className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
              <h1 className="text-xl font-bold text-slate-800">
                Paramétrage des alertes
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {selected.carName} — {selected.departmentName}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="w-full space-y-4">
                {isLoading ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    Chargement de la configuration en cours...
                  </div>
                ) : null}

                <AlertSectionCard
                  title="Général"
                  fields={GENERAL_FIELDS}
                  values={general}
                  saving={savingSection === 'general'}
                  onChange={setGeneral}
                  onSave={() => saveSection('general', general)}
                  onResetDefaults={() => resetSection('general')}
                />
                <AlertSectionCard
                  title="Température"
                  fields={TEMPERATURE_FIELDS}
                  values={temperature}
                  saving={savingSection === 'temperature'}
                  onChange={setTemperature}
                  onSave={() => saveSection('temperature', temperature)}
                  onResetDefaults={() => resetSection('temperature')}
                />
                <AlertSectionCard
                  title="Carburant"
                  fields={FUEL_FIELDS}
                  values={fuel}
                  saving={savingSection === 'fuel'}
                  onChange={setFuel}
                  onSave={() => saveSection('fuel', fuel)}
                  onResetDefaults={() => resetSection('fuel')}
                />
                <AlertSectionCard
                  title="Vitesse"
                  fields={SPEED_FIELDS}
                  values={speed}
                  saving={savingSection === 'speed'}
                  onChange={setSpeed}
                  onSave={() => saveSection('speed', speed)}
                  onResetDefaults={() => resetSection('speed')}
                />
                <AlertSectionCard
                  title="Stop"
                  fields={STOP_FIELDS}
                  values={stop}
                  saving={savingSection === 'stop'}
                  onChange={setStop}
                  onSave={() => saveSection('stop', stop)}
                  onResetDefaults={() => resetSection('stop')}
                />
                <AlertSectionCard
                  title="Conduite"
                  fields={DRIVING_FIELDS}
                  values={driving}
                  saving={savingSection === 'driving'}
                  onChange={setDriving}
                  onSave={() => saveSection('driving', driving)}
                  onResetDefaults={() => resetSection('driving')}
                />
                <GeoAlertSection
                  wayAlerts={wayAlerts}
                  polygonAlerts={polygonAlerts}
                  placeAlerts={placeAlerts}
                  saving={savingSection === 'geo'}
                  onWayChange={setWayAlerts}
                  onPolygonChange={setPolygonAlerts}
                  onPlaceChange={setPlaceAlerts}
                  onSave={() =>
                    saveSection('geo', {
                      wayAlerts,
                      polygonAlerts,
                      placeAlerts,
                    })
                  }
                  onResetDefaults={() => resetSection('geo')}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100">
                <Settings className="h-12 w-12 text-slate-400" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-slate-700">
                Sélectionnez un véhicule
              </h2>
              <p className="text-slate-500">
                Choisissez un véhicule dans la liste pour configurer ses alertes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
