import type { AlertScopeRef, ResolvedAlertConfig } from '@/types/alert-config';
import type { AlertType } from '@/types/alerts';
import { getTaxonomyEntry } from '../../constants/alert-taxonomy';
import {
  getSecurityAlertTypes,
  SECURITY_ALERT_GROUPS,
} from '../../constants/security-alert-types';
import { buildBatchUpdate } from '../../lib/alert-config-resolver';
import { useBatchUpsertScopeConfigs } from '../../hooks/useAlertQueries';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ActivationModeControl } from './ActivationModeControl';
import { Switch } from './Switch';
import { cn } from '@/lib/utils';

interface SecurityAlertsSectionProps {
  selectedScopes: AlertScopeRef[];
  resolved: ResolvedAlertConfig[];
}

const ALLOWED_TYPES = new Set(getSecurityAlertTypes());

export function SecurityAlertsSection({
  selectedScopes,
  resolved,
}: SecurityAlertsSectionProps) {
  const batchUpdate = useBatchUpsertScopeConfigs();
  const disabled = selectedScopes.length === 0 || batchUpdate.isPending;

  const resolvedByType = new Map(
    resolved.filter((r) => ALLOWED_TYPES.has(r.alertType)).map((r) => [r.alertType, r])
  );

  const applyPatch = (alertType: AlertType, patch: Parameters<typeof buildBatchUpdate>[1]) => {
    if (selectedScopes.length === 0) return;
    batchUpdate.mutate({
      scopes: selectedScopes,
      updates: [buildBatchUpdate(alertType, patch)],
    });
  };

  if (selectedScopes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Sélectionnez un périmètre pour configurer les alertes sécurité.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {SECURITY_ALERT_GROUPS.map((group) => (
        <div key={group.id}>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">{group.label}</h4>
          <div className="space-y-2 pl-1 border-l-2 border-blue-100 ml-1">
            {group.alertTypes.map((alertType) => {
              const item = resolvedByType.get(alertType);
              if (!item) return null;
              const entry = getTaxonomyEntry(alertType);
              const threshold = item.thresholdConfig;

              return (
                <div
                  key={alertType}
                  className={cn(
                    'p-3 rounded-lg border ml-3',
                    item.state === 'active'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : item.state === 'partial'
                        ? 'border-amber-200 bg-amber-50/30'
                        : 'border-slate-200 bg-white dark:bg-slate-900'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{entry.label}</p>
                        {item.state === 'partial' && (
                          <Badge variant="medium" className="text-[10px] h-5">
                            Partiel
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={item.enabled}
                      disabled={disabled}
                      onCheckedChange={(checked) => applyPatch(alertType, { enabled: checked })}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {threshold?.value != null && (
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase">
                          Seuil {threshold.unit ? `(${threshold.unit})` : ''}
                        </label>
                        <Input
                          type="number"
                          value={threshold.value}
                          disabled={disabled}
                          onChange={(e) =>
                            applyPatch(alertType, {
                              thresholdConfig: {
                                ...threshold,
                                value: Number(e.target.value),
                              },
                            })
                          }
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                    )}

                    {threshold?.durationMinutes != null && (
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase">
                          Durée (min)
                        </label>
                        <Input
                          type="number"
                          value={threshold.durationMinutes}
                          disabled={disabled}
                          onChange={(e) =>
                            applyPatch(alertType, {
                              thresholdConfig: {
                                ...threshold,
                                durationMinutes: Number(e.target.value),
                              },
                            })
                          }
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <ActivationModeControl
                      compact
                      activationType={item.activationType}
                      activationStart={item.activationStart}
                      activationEnd={item.activationEnd}
                      onChange={(patch) => applyPatch(alertType, patch)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
