import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { SeverityLevelId, SeverityNotificationPolicy, SeverityOption } from '@/types/alert-config';
import type { AlertSeverity } from '@/types/alerts';
import { SEVERITY_CONFIG } from '@/design-system/severity';
import { Button } from '@/components/ui/button';
import {
  SeverityLevelEditorDialog,
  type SeverityLevelSavePayload,
} from './SeverityLevelEditorDialog';

interface NamedUser {
  id: string;
  name: string;
}

type DialogState =
  | { mode: 'create' }
  | { mode: 'edit'; levelId: SeverityLevelId; isCustom: boolean };

interface SeverityLevelsManagerProps {
  options: SeverityOption[];
  getPolicy: (severity: SeverityLevelId) => SeverityNotificationPolicy;
  namedUsers: NamedUser[];
  isSaving?: boolean;
  onSaveLevel: (
    levelId: SeverityLevelId | null,
    isCustom: boolean,
    isCreate: boolean,
    payload: SeverityLevelSavePayload
  ) => Promise<void>;
  onDeleteLevel: (levelId: SeverityLevelId) => Promise<void>;
}

function emptyPolicy(severity: SeverityLevelId): SeverityNotificationPolicy {
  return { severity, roles: [], userIds: [], channels: [] };
}

export function SeverityLevelsManager({
  options,
  getPolicy,
  namedUsers,
  isSaving,
  onSaveLevel,
  onDeleteLevel,
}: SeverityLevelsManagerProps) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const closeDialog = () => setDialog(null);

  const getDialogProps = () => {
    if (!dialog) return null;

    if (dialog.mode === 'create') {
      return {
        mode: 'create' as const,
        title: 'Nouveau niveau',
        initialLabel: '',
        initialColor: '#64748b',
        initialPolicy: emptyPolicy('custom-new'),
        levelId: null as SeverityLevelId | null,
        isCustom: true,
        isCreate: true,
      };
    }

    const opt = options.find((o) => o.id === dialog.levelId);
    if (!opt) return null;

    let subtitle = opt.id;
    if (!opt.isCustom) {
      subtitle = SEVERITY_CONFIG[opt.id as AlertSeverity]?.label ?? opt.id;
    }

    return {
      mode: 'edit' as const,
      title: `Modifier — ${opt.label}`,
      initialLabel: opt.label,
      initialColor: opt.color,
      initialPolicy: getPolicy(opt.id),
      levelId: opt.id,
      isCustom: opt.isCustom,
      isCreate: false,
      subtitle,
    };
  };

  const dialogProps = getDialogProps();

  const handleSave = async (payload: SeverityLevelSavePayload) => {
    if (!dialogProps) return;
    await onSaveLevel(
      dialogProps.levelId,
      dialogProps.isCustom,
      dialogProps.isCreate,
      payload
    );
    closeDialog();
  };

  const handleDelete = async (levelId: SeverityLevelId) => {
    if (!window.confirm('Supprimer ce niveau personnalisé ?')) return;
    await onDeleteLevel(levelId);
  };

  return (
    <>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Niveaux système</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cliquez sur modifier pour configurer un niveau.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setDialog({ mode: 'create' })}
          disabled={isSaving}
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter un niveau
        </Button>
      </div>

      <ul className="space-y-2">
        {options.map((opt) => (
          <li
            key={opt.id}
            className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white border border-slate-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: opt.color }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground uppercase">
                  {opt.isCustom
                    ? 'Personnalisé'
                    : SEVERITY_CONFIG[opt.id as AlertSeverity]?.label ?? opt.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDialog({ mode: 'edit', levelId: opt.id, isCustom: opt.isCustom })}
                title="Modifier"
                disabled={isSaving}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              {opt.isCustom && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => handleDelete(opt.id)}
                  title="Supprimer"
                  disabled={isSaving}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {dialogProps && (
        <SeverityLevelEditorDialog
          open={dialog != null}
          mode={dialogProps.mode}
          title={dialogProps.title}
          initialLabel={dialogProps.initialLabel}
          initialColor={dialogProps.initialColor}
          initialPolicy={dialogProps.initialPolicy}
          namedUsers={namedUsers}
          isSaving={isSaving}
          onClose={closeDialog}
          onSave={handleSave}
        />
      )}
    </>
  );
}
