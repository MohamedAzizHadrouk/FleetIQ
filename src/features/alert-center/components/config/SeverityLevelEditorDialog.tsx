import { useEffect, useState } from 'react';
import type {
  AlertConfigChannel,
  AlertRecipientRole,
  SeverityNotificationPolicy,
} from '@/types/alert-config';
import { ALERT_RECIPIENT_ROLE_LABELS } from '@/types/alert-config';
import { SEVERITY_COLOR_PRESETS } from '../../mocks/mockCustomSeverities';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const ROLES: AlertRecipientRole[] = ['administrator', 'driver', 'fleet_manager', 'user'];
const CHANNELS: { id: AlertConfigChannel; label: string }[] = [
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push Notification' },
];

export interface SeverityLevelSavePayload {
  label: string;
  color: string;
  roles: AlertRecipientRole[];
  userIds: string[];
  channels: AlertConfigChannel[];
}

interface NamedUser {
  id: string;
  name: string;
}

interface SeverityLevelEditorDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  title: string;
  initialLabel: string;
  initialColor: string;
  initialPolicy: SeverityNotificationPolicy;
  namedUsers: NamedUser[];
  isSaving?: boolean;
  onClose: () => void;
  onSave: (payload: SeverityLevelSavePayload) => void;
}

export function SeverityLevelEditorDialog({
  open,
  mode,
  title,
  initialLabel,
  initialColor,
  initialPolicy,
  namedUsers,
  isSaving,
  onClose,
  onSave,
}: SeverityLevelEditorDialogProps) {
  const [draftLabel, setDraftLabel] = useState(initialLabel);
  const [draftColor, setDraftColor] = useState(initialColor);
  const [draftRoles, setDraftRoles] = useState<AlertRecipientRole[]>(initialPolicy.roles);
  const [draftUserIds, setDraftUserIds] = useState<string[]>(initialPolicy.userIds);
  const [draftChannels, setDraftChannels] = useState<AlertConfigChannel[]>(initialPolicy.channels);

  useEffect(() => {
    if (!open) return;
    setDraftLabel(initialLabel);
    setDraftColor(initialColor);
    setDraftRoles(initialPolicy.roles);
    setDraftUserIds(initialPolicy.userIds);
    setDraftChannels(initialPolicy.channels);
  }, [open, initialLabel, initialColor, initialPolicy]);

  const toggleRole = (role: AlertRecipientRole) => {
    setDraftRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleUser = (userId: string) => {
    setDraftUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleChannel = (channel: AlertConfigChannel) => {
    setDraftChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleSave = () => {
    if (!draftLabel.trim()) return;
    onSave({
      label: draftLabel.trim(),
      color: draftColor,
      roles: draftRoles,
      userIds: draftUserIds,
      channels: draftChannels,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <Label className="text-xs">Nom affiché</Label>
            <Input
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder="Nom du niveau"
              className="h-9 text-sm mt-1"
            />
          </div>

          <div>
            <Label className="text-xs mb-2 block">Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {SEVERITY_COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setDraftColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                    draftColor === color
                      ? 'border-slate-900 ring-2 ring-offset-1 ring-slate-400'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
              Qui — Rôles
            </p>
            <div className="space-y-2">
              {ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={draftRoles.includes(role)}
                    onCheckedChange={() => toggleRole(role)}
                  />
                  {ALERT_RECIPIENT_ROLE_LABELS[role]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
              Qui — Utilisateurs
            </p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {namedUsers.map((user) => (
                <label key={user.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={draftUserIds.includes(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                  />
                  <span className="truncate">{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
              Comment
            </p>
            <div className="space-y-2">
              {CHANNELS.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={draftChannels.includes(id)}
                    onCheckedChange={() => toggleChannel(id)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !draftLabel.trim()}
            >
              {isSaving ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
