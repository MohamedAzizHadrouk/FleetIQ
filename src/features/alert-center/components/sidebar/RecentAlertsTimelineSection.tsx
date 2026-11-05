import { useEffect, useMemo, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import type { Vehicle } from '@/types';
import type { AlertType } from '@/types/alerts';
import { ALERT_TAXONOMY } from '../../constants/alert-taxonomy';
import {
  ALERT_CENTER_SECTIONS,
  resolveCategoriesFromCenterSections,
  type AlertCenterSectionId,
} from '../../constants/alert-config-sections';
import { useRecentAlerts } from '../../hooks/useAlertQueries';
import { VehicleSearchMultiSelect } from '../filters/VehicleSearchMultiSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { EventTimeline } from '../timeline/EventTimeline';

interface RecentAlertsTimelineSectionProps {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicleId: string) => void;
}

const ALERT_TYPE_OPTIONS = Object.values(ALERT_TAXONOMY).filter(
  (entry) => entry.id !== 'all' && entry.id !== 'unknown'
);

const DEFAULT_SECTIONS: AlertCenterSectionId[] = ALERT_CENTER_SECTIONS.map((s) => s.id);

function toggleSection(
  sections: AlertCenterSectionId[],
  sectionId: AlertCenterSectionId
): AlertCenterSectionId[] {
  return sections.includes(sectionId)
    ? sections.filter((id) => id !== sectionId)
    : [...sections, sectionId];
}

export function RecentAlertsTimelineSection({
  vehicles,
  onVehicleClick,
}: RecentAlertsTimelineSectionProps) {
  const [selectedSections, setSelectedSections] = useState<AlertCenterSectionId[]>(DEFAULT_SECTIONS);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [alertType, setAlertType] = useState<AlertType | 'all'>('all');
  const [typeSearch, setTypeSearch] = useState('');

  const filters = useMemo(
    () => ({
      centerSectionIds: selectedSections,
      alertTypes: alertType === 'all' ? undefined : [alertType],
      vehicleIds: selectedVehicleIds.length > 0 ? selectedVehicleIds : undefined,
      limit: 15,
    }),
    [selectedSections, alertType, selectedVehicleIds]
  );

  const { data: events = [], isLoading } = useRecentAlerts(filters);

  const typeOptionsForSections = useMemo(() => {
    const allowedCategories = resolveCategoriesFromCenterSections(selectedSections);
    return ALERT_TYPE_OPTIONS.filter((entry) => allowedCategories.includes(entry.category));
  }, [selectedSections]);

  const filteredTypeOptions = useMemo(() => {
    const q = typeSearch.toLowerCase().trim();
    if (!q) return typeOptionsForSections;
    return typeOptionsForSections.filter(
      (entry) =>
        entry.label.toLowerCase().includes(q) || entry.id.toLowerCase().includes(q)
    );
  }, [typeSearch, typeOptionsForSections]);

  useEffect(() => {
    if (alertType === 'all') return;
    const isStillValid = typeOptionsForSections.some((entry) => entry.id === alertType);
    if (!isStillValid) setAlertType('all');
  }, [typeOptionsForSections, alertType]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" /> Alertes récentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Véhicule(s)</Label>
            <VehicleSearchMultiSelect
              vehicles={vehicles}
              value={selectedVehicleIds}
              onChange={setSelectedVehicleIds}
              variant="light"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Catégorie</Label>
              {selectedSections.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {selectedSections.length} sélectionnée{selectedSections.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="space-y-1.5 rounded-md border border-slate-200 p-2">
              {ALERT_CENTER_SECTIONS.map((section) => (
                <div key={section.id} className="flex items-start gap-2">
                  <Checkbox
                    id={`recent-cat-${section.id}`}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() =>
                      setSelectedSections((prev) => toggleSection(prev, section.id))
                    }
                  />
                  <Label
                    htmlFor={`recent-cat-${section.id}`}
                    className="text-xs text-slate-700 cursor-pointer leading-tight"
                  >
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Type d&apos;alerte</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                value={typeSearch}
                onChange={(e) => setTypeSearch(e.target.value)}
                placeholder="Rechercher un type..."
                className="pl-7 h-8 text-xs"
              />
            </div>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as AlertType | 'all')}
              className="w-full h-8 rounded-md border border-slate-200 px-2 text-xs"
            >
              <option value="all">Tous les types</option>
              {filteredTypeOptions.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <EventTimeline
            events={events}
            initialLimit={8}
            emptyMessage="Aucune alerte récente pour ces filtres"
            onEventClick={(event) => {
              if (event.vehicleId) onVehicleClick?.(event.vehicleId);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
