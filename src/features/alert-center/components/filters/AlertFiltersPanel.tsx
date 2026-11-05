import { Filter, RotateCcw } from 'lucide-react';
import type { Vehicle } from '@/types';
import type {
  AlertFilters,
  AlertSeverity,
  DateRangePreset,
  GpsFilterStatus,
  MovementFilterState,
  VehicleFilterState,
} from '@/types/alerts';
import { MOCK_ORG_STRUCTURE } from '../../mocks/mockOrgStructure';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardIndicatorFilter } from './DashboardIndicatorFilter';
import { AlertDayPickerButton, formatSelectedDateLabel } from './AlertDayPickerButton';
import { VehicleSearchMultiSelect } from './VehicleSearchMultiSelect';
import { cn } from '@/lib/utils';

const SEVERITIES: { id: AlertSeverity; label: string }[] = [
  { id: 'critical', label: 'Critique' },
  { id: 'warning', label: 'Avertissement' },
  { id: 'info', label: 'Informative' },
];

const VEHICLE_STATES: { id: VehicleFilterState; label: string }[] = [
  { id: 'with_alerts', label: 'Avec alertes actives' },
  { id: 'without_alerts', label: 'Sans alertes' },
];

const GPS_STATUSES: { id: GpsFilterStatus; label: string }[] = [
  { id: 'online', label: 'En ligne' },
  { id: 'offline', label: 'Hors ligne' },
];

const MOVEMENT_STATES: { id: MovementFilterState; label: string }[] = [
  { id: 'moving', label: 'En route' },
  { id: 'stopped', label: 'À l\'arrêt' },
];

const DATE_PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: '24h', label: '24h' },
  { id: '7d', label: '7 jours' },
];

interface AlertFiltersPanelProps {
  filters: AlertFilters;
  vehicles: Vehicle[];
  onUpdate: <K extends keyof AlertFilters>(key: K, value: AlertFilters[K]) => void;
  onReset: () => void;
}

function toggleArrayItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export function AlertFiltersPanel({ filters, vehicles, onUpdate, onReset }: AlertFiltersPanelProps) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-900 text-slate-200 w-full">
      <div className="shrink-0 p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Filtres</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-8" onClick={onReset}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-5">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Recherche</p>
            <div className="flex gap-2">
              <VehicleSearchMultiSelect
                vehicles={vehicles}
                value={filters.vehicleIds}
                onChange={(ids) => onUpdate('vehicleIds', ids)}
              />
              <AlertDayPickerButton
                value={filters.selectedDate}
                onChange={(date) => {
                  onUpdate('selectedDate', date);
                  if (date) onUpdate('datePreset', undefined);
                }}
              />
            </div>
            {filters.selectedDate && (
              <p className="text-[11px] text-blue-300 mt-1.5">
                {formatSelectedDateLabel(filters.selectedDate)}
              </p>
            )}
          </div>

          <Separator className="bg-slate-700" />

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Indicateurs TdB</p>
            <DashboardIndicatorFilter
              selected={filters.dashboardIndicatorIds}
              onChange={(ids) => onUpdate('dashboardIndicatorIds', ids)}
            />
          </div>

          <Separator className="bg-slate-700" />

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Gravité</p>
            <div className="space-y-2">
              {SEVERITIES.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`sev-${s.id}`}
                    checked={filters.severities.includes(s.id)}
                    onCheckedChange={() =>
                      onUpdate('severities', toggleArrayItem(filters.severities, s.id))
                    }
                    className="border-slate-500 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`sev-${s.id}`} className="text-sm text-slate-300 cursor-pointer">
                    {s.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-700" />

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Département</p>
            <div className="space-y-2">
              {MOCK_ORG_STRUCTURE.departments.map((dept) => (
                <div key={dept.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`dept-${dept.id}`}
                    checked={filters.departmentIds.includes(dept.id)}
                    onCheckedChange={() =>
                      onUpdate('departmentIds', toggleArrayItem(filters.departmentIds, dept.id))
                    }
                    className="border-slate-500 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`dept-${dept.id}`} className="text-sm text-slate-300 cursor-pointer">
                    {dept.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-700" />

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Connexion GPS</p>
            <div className="space-y-2">
              {GPS_STATUSES.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`gps-${s.id}`}
                    checked={filters.gpsStatuses.includes(s.id)}
                    onCheckedChange={() =>
                      onUpdate('gpsStatuses', toggleArrayItem(filters.gpsStatuses, s.id))
                    }
                    className="border-slate-500 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`gps-${s.id}`} className="text-sm text-slate-300 cursor-pointer">
                    {s.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-700" />

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Mouvement</p>
            <div className="space-y-2">
              {MOVEMENT_STATES.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`mov-${s.id}`}
                    checked={filters.movementStates.includes(s.id)}
                    onCheckedChange={() =>
                      onUpdate('movementStates', toggleArrayItem(filters.movementStates, s.id))
                    }
                    className="border-slate-500 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`mov-${s.id}`} className="text-sm text-slate-300 cursor-pointer">
                    {s.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-700" />

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">État véhicule</p>
            <div className="space-y-2">
              {VEHICLE_STATES.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`vs-${s.id}`}
                    checked={filters.vehicleStates.includes(s.id)}
                    onCheckedChange={() =>
                      onUpdate('vehicleStates', toggleArrayItem(filters.vehicleStates, s.id))
                    }
                    className="border-slate-500 data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`vs-${s.id}`} className="text-sm text-slate-300 cursor-pointer">
                    {s.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-slate-700" />

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Période récente</p>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onUpdate('datePreset', filters.datePreset === preset.id ? undefined : preset.id);
                    onUpdate('selectedDate', undefined);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
                    filters.datePreset === preset.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
