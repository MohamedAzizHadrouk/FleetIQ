import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminAccount } from '../../types/admin.types';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: AdminAccount | null;
  saving?: boolean;
  onSubmit: (password: string) => Promise<void> | void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
  account,
  saving,
  onSubmit,
}: ChangePasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPassword('');
      setConfirm('');
      setError(null);
    }
  }, [open, account]);

  const handleSave = async () => {
    if (!password || password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setError(null);
    try {
      await onSubmit(password);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Changer le mot de passe</DialogTitle>
          <DialogDescription>
            {account
              ? `Nouveau mot de passe pour ${account.login}`
              : 'Nouveau mot de passe'}
          </DialogDescription>
        </DialogHeader>
        <div className="mx-6 my-2 space-y-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4">
          <div>
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirmer</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1"
            />
          </div>
          {error ? (
            <p className="text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter className="gap-2 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
