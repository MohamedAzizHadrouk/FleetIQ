import { useEffect, useMemo, useState } from 'react';
import { Bookmark } from 'lucide-react';
import type { Vehicle } from '@/types';
import type { AlertScopeRef } from '@/types/alert-config';
import { ALERT_SCOPE_TYPE_LABELS } from '@/types/alert-config';
import {
  useDefaultAlertTemplate,
  useOrgStructure,
  useSaveDefaultAlertTemplate,
} from '../../hooks/useAlertQueries';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SaveDefaultConfigButtonProps {
  selectedScopes: AlertScopeRef[];
  vehicles: Vehicle[];
}

function formatTemplateDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SaveDefaultConfigButton({ selectedScopes, vehicles }: SaveDefaultConfigButtonProps) {
  const { data: template } = useDefaultAlertTemplate();
  const { data: org } = useOrgStructure();
  const saveDefault = useSaveDefaultAlertTemplate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSave = selectedScopes.length === 1;

  const sourceScopeLabel = useMemo(() => {
    if (!template?.sourceScope) return null;
    const { scopeType, scopeId } = template.sourceScope;
    if (scopeType === 'vehicle') {
      return vehicles.find((v) => v.id === scopeId)?.name ?? scopeId;
    }
    if (scopeType === 'department') {
      return org?.departments.find((d) => d.id === scopeId)?.name ?? scopeId;
    }
    return scopeId;
  }, [template, vehicles, org]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const handleSave = () => {
    if (!canSave) return;
    saveDefault.mutate(selectedScopes[0], {
      onSuccess: () => {
        setSuccessMessage(
          'Configuration par défaut enregistrée — sera appliquée aux nouveaux véhicules'
        );
      },
    });
  };

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <Button
        variant="outline"
        size="sm"
        disabled={!canSave || saveDefault.isPending}
        onClick={handleSave}
        className="whitespace-nowrap"
      >
        <Bookmark className="w-4 h-4 mr-1.5" />
        Enregistrer comme configuration par défaut
      </Button>

      {!canSave && (
        <p className="text-xs text-muted-foreground text-right max-w-[280px]">
          Sélectionnez un seul véhicule ou département comme référence
        </p>
      )}

      {successMessage && (
        <p className={cn('text-xs text-emerald-600 dark:text-emerald-400 text-right max-w-[320px]')}>
          {successMessage}
        </p>
      )}

      {template && !successMessage && (
        <p className="text-xs text-muted-foreground text-right max-w-[320px]">
          Modèle par défaut enregistré le {formatTemplateDate(template.updatedAt)}
          {sourceScopeLabel && (
            <>
              {' '}
              depuis {ALERT_SCOPE_TYPE_LABELS[template.sourceScope.scopeType].toLowerCase()}{' '}
              <span className="font-medium text-slate-600 dark:text-slate-300">{sourceScopeLabel}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}
