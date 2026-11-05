import { useState } from 'react';
import { cn } from '@/lib/utils';
import { emptyGeoItem } from './defaults';
import { InOutGeometricShapeStatus, type GeometricShapeAlertConfig } from './types';

const DAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mer' },
  { value: 4, label: 'Jeu' },
  { value: 5, label: 'Ven' },
  { value: 6, label: 'Sam' },
  { value: 0, label: 'Dim' },
];

const IN_OUT_OPTIONS = [
  { value: InOutGeometricShapeStatus.InOut, label: 'Entrée et sortie' },
  { value: InOutGeometricShapeStatus.In, label: 'Entrée' },
  { value: InOutGeometricShapeStatus.Out, label: 'Sortie' },
];

type GeoTab = 'way' | 'polygon' | 'place';

interface GeoAlertSectionProps {
  wayAlerts: GeometricShapeAlertConfig[];
  polygonAlerts: GeometricShapeAlertConfig[];
  placeAlerts: GeometricShapeAlertConfig[];
  saving?: boolean;
  onWayChange: (items: GeometricShapeAlertConfig[]) => void;
  onPolygonChange: (items: GeometricShapeAlertConfig[]) => void;
  onPlaceChange: (items: GeometricShapeAlertConfig[]) => void;
  onSave: () => void;
  onResetDefaults: () => void;
}

export function GeoAlertSection({
  wayAlerts,
  polygonAlerts,
  placeAlerts,
  saving,
  onWayChange,
  onPolygonChange,
  onPlaceChange,
  onSave,
  onResetDefaults,
}: GeoAlertSectionProps) {
  const [tab, setTab] = useState<GeoTab>('way');

  const list =
    tab === 'way' ? wayAlerts : tab === 'polygon' ? polygonAlerts : placeAlerts;
  const setList =
    tab === 'way' ? onWayChange : tab === 'polygon' ? onPolygonChange : onPlaceChange;

  const updateItem = (
    index: number,
    key: keyof GeometricShapeAlertConfig,
    value: GeometricShapeAlertConfig[keyof GeometricShapeAlertConfig]
  ) => {
    const next = list.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    );
    setList(next);
  };

  const toggleDay = (index: number, day: number) => {
    const item = list[index];
    const days = new Set(item.dayOfWeeks ?? []);
    if (days.has(day)) days.delete(day);
    else days.add(day);
    updateItem(index, 'dayOfWeeks', [...days]);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          Georéperage
        </h3>
      </div>

      <div className="flex border-b border-slate-200">
        {(
          [
            ['way', 'Trajectoires'],
            ['polygon', 'Polygones'],
            ['place', 'Lieux'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-4">
        {list.map((item, i) => (
          <div
            key={i}
            className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.enableWayAlarm}
                  onChange={(e) =>
                    updateItem(i, 'enableWayAlarm', e.target.checked)
                  }
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Activer l&apos;alerte
                </span>
              </label>
              <button
                type="button"
                onClick={() => setList(list.filter((_, idx) => idx !== i))}
                className="text-xs font-medium text-rose-500 hover:text-rose-700"
              >
                Supprimer
              </button>
            </div>

            {item.enableWayAlarm ? (
              <>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600">Distance :</label>
                  <input
                    type="number"
                    min={0}
                    value={item.distanceInM}
                    onChange={(e) =>
                      updateItem(i, 'distanceInM', Number(e.target.value))
                    }
                    className="w-24 rounded border border-slate-300 px-3 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-500">m</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600">Lors du passage à :</label>
                  <select
                    value={item.inOutGeometricShapeStatus}
                    onChange={(e) =>
                      updateItem(
                        i,
                        'inOutGeometricShapeStatus',
                        Number(e.target.value) as InOutGeometricShapeStatus
                      )
                    }
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {IN_OUT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-600">Jours :</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((day) => {
                      const selected = (item.dayOfWeeks ?? []).includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(i, day.value)}
                          className={cn(
                            'rounded px-3 py-1 text-xs font-medium transition-colors',
                            selected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          )}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-slate-600">
                      À partir de
                    </label>
                    <input
                      type="time"
                      value={item.startTime}
                      onChange={(e) => updateItem(i, 'startTime', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-600">Prend fin</label>
                    <input
                      type="time"
                      value={item.endTime}
                      onChange={(e) => updateItem(i, 'endTime', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setList([...list, emptyGeoItem()])}
          className="w-full rounded-lg border-2 border-dashed border-slate-300 py-2 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600"
        >
          + Ajouter une configuration
        </button>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3">
        <button
          type="button"
          onClick={onResetDefaults}
          className="text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          Paramètres par défaut
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
        >
          {saving ? 'Enregistrement...' : 'Envoyer les paramètres'}
        </button>
      </div>
    </div>
  );
}
