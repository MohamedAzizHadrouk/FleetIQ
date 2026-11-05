import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogBody } from '@/components/ui/dialog-body';
import type { Vehicle } from '@/types';

export type AadCommandMode = 'disable' | 'enable' | 'force';

interface RemoteStopDialogProps {
  open: boolean;
  vehicle: Vehicle | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mode: AadCommandMode) => void;
}

const MODE_LABELS: Record<AadCommandMode, string> = {
  disable: 'Désactiver AAD',
  enable: 'Activer AAD',
  force: 'Activer AAD forcé (même en circulation)',
};

export function RemoteStopDialog({
  open,
  vehicle,
  onOpenChange,
  onConfirm,
}: RemoteStopDialogProps) {
  const [mode, setMode] = useState<AadCommandMode>('enable');
  const [applyOthers, setApplyOthers] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const reset = () => {
    setMode('enable');
    setApplyOthers(false);
    setConfirming(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const modes: AadCommandMode[] = vehicle?.supportsAadForced
    ? ['disable', 'enable', 'force']
    : ['disable', 'enable'];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Arrêt à distance (AAD)</DialogTitle>
          <DialogDescription>
            {vehicle?.name ?? 'Véhicule'}
            {vehicle?.matricule ? ` · ${vehicle.matricule}` : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!confirming ? (
            <>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700 mb-1">
                  Commande
                </legend>
                {modes.map((m) => (
                  <label
                    key={m}
                    className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="aad-mode"
                      checked={mode === m}
                      onChange={() => setMode(m)}
                      className="accent-blue-600"
                    />
                    {MODE_LABELS[m]}
                  </label>
                ))}
              </fieldset>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyOthers}
                  onChange={(e) => setApplyOthers(e.target.checked)}
                  className="accent-blue-600 rounded"
                />
                Envoyer aussi à d&apos;autres véhicules
              </label>
            </>
          ) : (
            <p className="text-sm text-slate-700">
              Êtes-vous sûr de vouloir envoyer la commande « {MODE_LABELS[mode]} »
              {applyOthers ? ' (et à d’autres véhicules)' : ''} ?
            </p>
          )}
        </DialogBody>
        <DialogFooter className="gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => {
              if (confirming) setConfirming(false);
              else handleOpenChange(false);
            }}
          >
            {confirming ? 'Retour' : 'Annuler'}
          </button>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => {
              if (!confirming) {
                setConfirming(true);
                return;
              }
              onConfirm(mode);
              handleOpenChange(false);
            }}
          >
            {confirming ? 'Confirmer l’envoi' : 'Continuer'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
