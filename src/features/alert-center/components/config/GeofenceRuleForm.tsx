import { useState } from 'react';
import type { Vehicle } from '@/types';
import type { GeofenceAlertRule } from '@/types/alert-config';
import type { AlertSeverity } from '@/types/alerts';
import { ALERT_SCOPE_TYPE_LABELS } from '@/types/alert-config';
import { MOCK_GEOFENCE_ZONES } from '../../mocks/mockGeofenceRules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActivationModeControl } from './ActivationModeControl';
import { ScopeTargetMultiSelect } from './ScopeTargetMultiSelect';
import { Switch } from './Switch';

interface GeofenceRuleFormProps {
  vehicles: Vehicle[];
  initial?: GeofenceAlertRule;
  onSubmit: (rule: Omit<GeofenceAlertRule, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export function GeofenceRuleForm({ vehicles, initial, onSubmit, onCancel }: GeofenceRuleFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [zoneLabel, setZoneLabel] = useState(initial?.zoneLabel ?? MOCK_GEOFENCE_ZONES[0]);
  const [eventType, setEventType] = useState<GeofenceAlertRule['eventType']>(
    initial?.eventType ?? 'entry'
  );
  const [severity] = useState<AlertSeverity>(initial?.severity ?? 'warning');
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [scopeType, setScopeType] = useState<'vehicle' | 'department'>(
    initial?.scopeType === 'department' ? 'department' : 'vehicle'
  );
  const [scopeIds, setScopeIds] = useState<string[]>(initial?.scopeIds ?? []);
  const [scopeIdsError, setScopeIdsError] = useState<string>();
  const [activationType, setActivationType] = useState(initial?.activationType ?? 'permanent');
  const [activationStart, setActivationStart] = useState(initial?.activationStart);
  const [activationEnd, setActivationEnd] = useState(initial?.activationEnd);

  const handleScopeTypeChange = (next: 'vehicle' | 'department') => {
    setScopeType(next);
    setScopeIds([]);
    setScopeIdsError(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scopeIds.length === 0) {
      setScopeIdsError('Sélectionnez au moins une cible.');
      return;
    }
    setScopeIdsError(undefined);
    onSubmit({
      id: initial?.id,
      name: name || zoneLabel,
      zoneLabel,
      eventType,
      severity,
      enabled,
      scopeType,
      scopeIds,
      activationType,
      activationStart,
      activationEnd,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Nom de la règle</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Sortie dépôt" />
        </div>
        <div className="space-y-1">
          <Label>Zone</Label>
          <select
            value={zoneLabel}
            onChange={(e) => setZoneLabel(e.target.value)}
            className="w-full h-9 rounded-md border border-slate-200 px-2 text-sm"
          >
            {MOCK_GEOFENCE_ZONES.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Type d&apos;événement</Label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as GeofenceAlertRule['eventType'])}
            className="w-full h-9 rounded-md border border-slate-200 px-2 text-sm"
          >
            <option value="entry">Entrée zone</option>
            <option value="exit">Sortie zone</option>
            <option value="both">Entrée et sortie</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Périmètre</Label>
        <select
          value={scopeType}
          onChange={(e) => handleScopeTypeChange(e.target.value as 'vehicle' | 'department')}
          className="w-full h-9 rounded-md border border-slate-200 px-2 text-sm"
        >
          {(['vehicle', 'department'] as const).map((t) => (
            <option key={t} value={t}>{ALERT_SCOPE_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <ScopeTargetMultiSelect
        scopeType={scopeType}
        value={scopeIds}
        onChange={(ids) => {
          setScopeIds(ids);
          if (ids.length > 0) setScopeIdsError(undefined);
        }}
        vehicles={vehicles}
        error={scopeIdsError}
      />

      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        <span className="text-sm">Règle active</span>
      </div>

      <ActivationModeControl
        activationType={activationType}
        activationStart={activationStart}
        activationEnd={activationEnd}
        onChange={(patch) => {
          setActivationType(patch.activationType);
          setActivationStart(patch.activationStart);
          setActivationEnd(patch.activationEnd);
        }}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit">{initial ? 'Enregistrer' : 'Ajouter la règle'}</Button>
      </div>
    </form>
  );
}
