import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Vehicle } from '@/types';
import type { AlertScopeRef, GeofenceAlertRule, ResolvedAlertConfig } from '@/types/alert-config';
import { ALERT_SCOPE_TYPE_LABELS } from '@/types/alert-config';
import { getVehicleDepartmentId } from '../../mocks/mockOrgStructure';
import {
  useDeleteGeofenceRule,
  useGeofenceRules,
  useOrgStructure,
  useSaveGeofenceRule,
} from '../../hooks/useAlertQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GeofenceRuleForm } from './GeofenceRuleForm';
import { GeolocationAlertsConfigSection } from './GeolocationAlertsConfigSection';
import { Switch } from './Switch';

interface GeofencingAlertsSectionProps {
  selectedScopes: AlertScopeRef[];
  resolved: ResolvedAlertConfig[];
  vehicles: Vehicle[];
}

function ruleAppliesToScope(rule: GeofenceAlertRule, scope: AlertScopeRef): boolean {
  if (rule.scopeType === scope.scopeType && rule.scopeIds.includes(scope.scopeId)) {
    return true;
  }
  if (scope.scopeType === 'vehicle') {
    const deptId = getVehicleDepartmentId(scope.scopeId);
    return Boolean(
      deptId && rule.scopeType === 'department' && rule.scopeIds.includes(deptId)
    );
  }
  if (scope.scopeType === 'department' && rule.scopeType === 'vehicle') {
    return rule.scopeIds.some((vehicleId) => getVehicleDepartmentId(vehicleId) === scope.scopeId);
  }
  return false;
}

function useScopeTargetLabels(vehicles: Vehicle[]) {
  const { data: org } = useOrgStructure();

  return useMemo(() => {
    const labels = new Map<string, string>();
    vehicles.forEach((v) => labels.set(v.id, v.name));
    (org?.departments ?? []).forEach((d) => labels.set(d.id, d.name));
    return labels;
  }, [org, vehicles]);
}

export function GeofencingAlertsSection({
  selectedScopes,
  resolved,
  vehicles,
}: GeofencingAlertsSectionProps) {
  const scopeTargetLabels = useScopeTargetLabels(vehicles);
  const { data: rules = [], isLoading } = useGeofenceRules();
  const saveRule = useSaveGeofenceRule();
  const deleteRule = useDeleteGeofenceRule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GeofenceAlertRule | undefined>();

  const filtered = selectedScopes.length
    ? rules.filter((r) => selectedScopes.some((s) => ruleAppliesToScope(r, s)))
    : rules;

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (rule: GeofenceAlertRule) => {
    setEditing(rule);
    setDialogOpen(true);
  };

  const handleSave = (rule: Omit<GeofenceAlertRule, 'id'> & { id?: string }) => {
    saveRule.mutate(rule, {
      onSuccess: () => {
        setDialogOpen(false);
        setEditing(undefined);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Types d&apos;alerte geofencing
        </h4>
        <p className="text-xs text-muted-foreground mb-4">
          Activez chaque type d&apos;alerte pour le périmètre sélectionné. Les véhicules alertés
          apparaissent dans le dashboard du centre d&apos;alertes.
        </p>
        <GeolocationAlertsConfigSection selectedScopes={selectedScopes} resolved={resolved} />
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Règles par zone
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Zones, itinéraires et périmètres configurables.
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Ajouter une règle
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
            {selectedScopes.length
              ? 'Aucune règle geofence pour la sélection actuelle.'
              : 'Aucune règle geofence. Ajoutez-en une ou sélectionnez un périmètre.'}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{rule.name}</p>
                    <Badge variant={rule.enabled ? 'success' : 'outline'} className="text-[10px]">
                      {rule.enabled ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Badge variant="info" className="text-[10px]">
                      {rule.eventType === 'entry'
                        ? 'Entrée'
                        : rule.eventType === 'exit'
                          ? 'Sortie'
                          : 'Entrée/Sortie'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Zone : {rule.zoneLabel} · {ALERT_SCOPE_TYPE_LABELS[rule.scopeType]} ·{' '}
                    {rule.scopeIds.map((id) => scopeTargetLabels.get(id) ?? id).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rule.activationType === 'permanent' ? 'Permanente' : 'Temporaire'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(enabled) => saveRule.mutate({ ...rule, enabled })}
                  />
                  <Button variant="ghost" size="sm" onClick={() => openEdit(rule)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteRule.mutate(rule.id)}>
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Modifier la règle geofence' : 'Nouvelle règle geofence'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
          <GeofenceRuleForm
            vehicles={vehicles}
            initial={editing}
            onSubmit={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
