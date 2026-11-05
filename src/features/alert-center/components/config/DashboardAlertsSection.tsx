import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AlertScopeRef, ResolvedAlertConfig } from '@/types/alert-config';
import type { AlertType } from '@/types/alerts';
import { getTaxonomyEntry } from '../../constants/alert-taxonomy';
import { buildBatchUpdate, reorderDisplayOrders } from '../../lib/alert-config-resolver';
import { useBatchUpsertScopeConfigs } from '../../hooks/useAlertQueries';
import { Switch } from './Switch';
import { Badge } from '@/components/ui/badge';
import { ActivationModeControl } from './ActivationModeControl';
import { cn } from '@/lib/utils';

interface DashboardAlertsSectionProps {
  selectedScopes: AlertScopeRef[];
  resolved: ResolvedAlertConfig[];
  onRefresh?: () => void;
}

export function DashboardAlertsSection({
  selectedScopes,
  resolved,
}: DashboardAlertsSectionProps) {
  const batchUpdate = useBatchUpsertScopeConfigs();
  const disabled = selectedScopes.length === 0 || batchUpdate.isPending;

  const sorted = [...resolved].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

  const applyPatch = (alertType: AlertType, patch: Parameters<typeof buildBatchUpdate>[1]) => {
    if (selectedScopes.length === 0) return;
    batchUpdate.mutate({
      scopes: selectedScopes,
      updates: [buildBatchUpdate(alertType, patch)],
    });
  };

  const move = (alertType: AlertType, direction: 'up' | 'down') => {
    const orders = reorderDisplayOrders(resolved, alertType, direction);
    if (Object.keys(orders).length === 0) return;
    batchUpdate.mutate({
      scopes: selectedScopes,
      updates: Object.entries(orders).map(([type, displayOrder]) =>
        buildBatchUpdate(type as AlertType, { displayOrder })
      ),
    });
  };

  if (selectedScopes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Sélectionnez un ou plusieurs véhicules, groupes ou départements pour configurer les alertes.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((item, index) => {
        const entry = getTaxonomyEntry(item.alertType);
        return (
          <div
            key={item.alertType}
            className={cn(
              'p-3 rounded-lg border transition-colors',
              item.state === 'active'
                ? 'border-emerald-200 bg-emerald-50/30'
                : item.state === 'partial'
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-slate-200 bg-white dark:bg-slate-900'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 min-w-0">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={disabled || index === 0}
                    onClick={() => move(item.alertType, 'up')}
                    className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || index === sorted.length - 1}
                    onClick={() => move(item.alertType, 'down')}
                    className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                      {entry.label}
                    </p>
                    {item.state === 'partial' && (
                      <Badge variant="medium" className="text-[10px] h-5">
                        Partiel
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] h-5">
                      #{item.displayOrder ?? '—'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.subcategory}</p>
                </div>
              </div>
              <Switch
                checked={item.enabled}
                disabled={disabled}
                onCheckedChange={(checked) => applyPatch(item.alertType, { enabled: checked })}
              />
            </div>

            <div className="mt-3 pl-8">
              {entry.contactOffOnly && (
                <div className="flex items-center gap-2 mb-3">
                  <Switch
                    checked={item.alertWhenContactOn ?? false}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      applyPatch(item.alertType, { alertWhenContactOn: checked })
                    }
                  />
                  <span className="text-xs text-slate-600">
                    Alerter aussi si contact ON
                  </span>
                </div>
              )}

              <ActivationModeControl
                  compact
                  activationType={item.activationType}
                  activationStart={item.activationStart}
                  activationEnd={item.activationEnd}
                  onChange={(patch) => applyPatch(item.alertType, patch)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
