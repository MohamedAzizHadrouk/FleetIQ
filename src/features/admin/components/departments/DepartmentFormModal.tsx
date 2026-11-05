import { useEffect, useMemo, useState } from 'react';
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
import { cn } from '@/lib/utils';
import { MultiSelectDropdown } from '../shared/MultiSelectDropdown';
import type {
  AdminDepartment,
  AdminVehicleOption,
  DepartmentFormPayload,
  DepartmentLevel,
} from '../../types/admin.types';

interface DepartmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AdminDepartment | null;
  departments: AdminDepartment[];
  vehicles: AdminVehicleOption[];
  saving?: boolean;
  onSubmit: (payload: DepartmentFormPayload) => Promise<void> | void;
}

export function DepartmentFormModal({
  open,
  onOpenChange,
  editing,
  departments,
  vehicles,
  saving,
  onSubmit,
}: DepartmentFormModalProps) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<DepartmentLevel>('racine');
  const [parentId, setParentId] = useState('');
  const [vehicleIds, setVehicleIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setName(editing.name);
      setLevel(editing.level);
      setParentId(editing.parentId ?? '');
      setVehicleIds([...editing.vehicleIds]);
    } else {
      setName('');
      setLevel('racine');
      setParentId('');
      setVehicleIds([]);
    }
  }, [open, editing]);

  const parentOptions = useMemo(
    () => departments.filter((d) => !editing || d.id !== editing.id),
    [departments, editing]
  );

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        type: editing?.type ?? 'simple',
        level,
        parentId: level === 'branche' ? parentId || undefined : undefined,
        vehicleIds,
      });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Mise à jour du département' : 'Ajouter un département'}
          </DialogTitle>
          <DialogDescription>
            Définissez le niveau et les véhicules associés
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-2">
          <section className="space-y-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
              Informations
            </h3>
            <div>
              <Label htmlFor="dept-name">Nom *</Label>
              <Input
                id="dept-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Nom du département"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Type</p>
              <div className="flex gap-4">
                {(['racine', 'branche'] as const).map((l) => (
                  <label
                    key={l}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border-2 bg-white px-4 py-2 text-sm',
                      level === l ? 'border-sky-500' : 'border-slate-200'
                    )}
                  >
                    <input
                      type="radio"
                      checked={level === l}
                      onChange={() => setLevel(l)}
                      className="h-4 w-4 text-sky-600"
                    />
                    {l === 'racine' ? 'Racine' : 'Branche'}
                  </label>
                ))}
              </div>
            </div>

            {level === 'branche' ? (
              <div>
                <Label htmlFor="parent">Département parent</Label>
                <select
                  id="parent"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  <option value="">Sélectionner...</option>
                  {parentOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </section>

          <section className="space-y-3 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
              Véhicules
            </h3>
            <MultiSelectDropdown
              items={vehicles.map((v) => ({ id: v.id, label: v.name }))}
              selectedIds={vehicleIds}
              onChange={setVehicleIds}
              label="Véhicules"
              searchPlaceholder="Rechercher un véhicule..."
              allSelectedLabel="Aucun véhicule"
              emptyMessage="Aucun véhicule"
            />
          </section>

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
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
