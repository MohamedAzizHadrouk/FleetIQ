import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
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
  /** Fleet: the other vehicles the command can also be sent to */
  vehicles?: Vehicle[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (mode: AadCommandMode, otherVehicleIds: string[]) => void;
}

const MODE_LABELS: Record<AadCommandMode, string> = {
  disable: 'Désactiver AAD',
  enable: 'Activer AAD',
  force: 'Activer AAD forcé (même en circulation)',
};

const labelOf = (v: Vehicle) => v.matricule || v.name;

export function RemoteStopDialog({
  open,
  vehicle,
  vehicles = [],
  onOpenChange,
  onConfirm,
}: RemoteStopDialogProps) {
  const [mode, setMode] = useState<AadCommandMode>('enable');
  const [applyOthers, setApplyOthers] = useState(false);
  const [others, setOthers] = useState<Set<string>>(new Set());
  const [listOpen, setListOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [confirming, setConfirming] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setMode('enable');
    setApplyOthers(false);
    setOthers(new Set());
    setListOpen(false);
    setSearch('');
    setConfirming(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  // Close the vehicle list on an outside click
  useEffect(() => {
    if (!listOpen) return;
    const onDown = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setListOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [listOpen]);

  const modes: AadCommandMode[] = vehicle?.supportsAadForced
    ? ['disable', 'enable', 'force']
    : ['disable', 'enable'];

  /** Other vehicles; only those whose equipment supports AAD can be picked */
  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles
      .filter((v) => v.id !== vehicle?.id)
      .filter((v) => !q || `${v.matricule ?? ''} ${v.name} ${v.imei ?? ''}`.toLowerCase().includes(q))
      .sort((a, b) => Number(!!b.supportsAad) - Number(!!a.supportsAad) || labelOf(a).localeCompare(labelOf(b)));
  }, [vehicles, vehicle, search]);
  const selectable = candidates.filter((v) => v.supportsAad);
  const allSelected = selectable.length > 0 && selectable.every((v) => others.has(v.id));

  const toggle = (id: string) =>
    setOthers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const chosen = vehicles.filter((v) => others.has(v.id));
  const otherIds = applyOthers ? chosen.map((v) => v.id) : [];

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
                <legend className="text-sm font-medium text-slate-700 mb-1">Commande</legend>
                {modes.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
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

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyOthers}
                    onChange={(e) => {
                      setApplyOthers(e.target.checked);
                      setListOpen(e.target.checked);
                    }}
                    className="accent-blue-600 rounded"
                  />
                  Envoyer aussi à d&apos;autres véhicules
                </label>

                {applyOthers && (
                  <div className="relative" ref={listRef}>
                    <button
                      type="button"
                      onClick={() => setListOpen((o) => !o)}
                      aria-expanded={listOpen}
                      className={`w-full h-10 flex items-center gap-2 px-3 rounded-xl border text-sm transition-colors ${
                        listOpen ? 'border-[#2F6BFF] ring-4 ring-[#2F6BFF]/10' : 'border-[#DCE3EF] hover:border-[#BFD3FF]'
                      }`}
                    >
                      <span className={`flex-1 truncate text-left ${chosen.length ? 'text-[#0F1B3D] font-semibold' : 'text-[#8A94A6]'}`}>
                        {chosen.length === 0
                          ? 'Sélectionner les véhicules'
                          : chosen.length === 1
                            ? labelOf(chosen[0])
                            : `${chosen.length} véhicules sélectionnés`}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${listOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {listOpen && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-slate-100">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A94A6]" />
                            <input
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              placeholder="Matricule, IMEI, nom…"
                              aria-label="Rechercher un véhicule"
                              className="w-full h-8 pl-8 pr-2 text-[13px] rounded-lg bg-[#F7F9FF] border border-[#E3E9F4] focus:outline-none focus:border-[#2F6BFF]"
                            />
                          </div>
                          {selectable.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setOthers((prev) => {
                                  const next = new Set(prev);
                                  selectable.forEach((v) => (allSelected ? next.delete(v.id) : next.add(v.id)));
                                  return next;
                                })
                              }
                              className="mt-1.5 px-1 text-[11.5px] font-semibold text-[#2F6BFF] hover:underline"
                            >
                              {allSelected ? 'Tout désélectionner' : `Tout sélectionner (${selectable.length})`}
                            </button>
                          )}
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1">
                          {candidates.length === 0 ? (
                            <p className="px-3 py-5 text-center text-xs text-slate-500">Aucun véhicule trouvé</p>
                          ) : (
                            candidates.map((v) => {
                              const supported = !!v.supportsAad;
                              const on = others.has(v.id);
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  disabled={!supported}
                                  onClick={() => toggle(v.id)}
                                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left ${
                                    supported ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <span
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                      on ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {on && <Check className="w-2.5 h-2.5 text-white" />}
                                  </span>
                                  <span className="flex-1 min-w-0">
                                    <span className="block text-xs font-semibold text-slate-800 truncate">{labelOf(v)}</span>
                                    <span className="block text-[10px] text-slate-500 truncate">
                                      {supported ? v.name : 'Équipement non compatible AAD'}
                                    </span>
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {chosen.length > 0 && !listOpen && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {chosen.map((v) => (
                          <span
                            key={v.id}
                            className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-full bg-[#EAF1FF] text-[#1E40AF] text-[11.5px] font-semibold"
                          >
                            {labelOf(v)}
                            <button
                              type="button"
                              aria-label={`Retirer ${labelOf(v)}`}
                              onClick={() => toggle(v.id)}
                              className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-[#DCE8FF]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-700">
              Êtes-vous sûr de vouloir envoyer la commande « {MODE_LABELS[mode]} » à{' '}
              <b>{vehicle ? labelOf(vehicle) : 'ce véhicule'}</b>
              {otherIds.length > 0 && (
                <>
                  {' '}et à <b>{otherIds.length} autre{otherIds.length > 1 ? 's' : ''} véhicule{otherIds.length > 1 ? 's' : ''}</b> (
                  {chosen.map(labelOf).join(', ')})
                </>
              )}{' '}
              ?
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
            disabled={!confirming && applyOthers && chosen.length === 0}
            title={!confirming && applyOthers && chosen.length === 0 ? 'Sélectionnez au moins un autre véhicule' : undefined}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (!confirming) {
                setListOpen(false);
                setConfirming(true);
                return;
              }
              onConfirm(mode, otherIds);
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
