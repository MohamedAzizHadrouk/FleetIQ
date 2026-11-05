import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
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
import {
  ACCESS_PAGES,
  flattenAccessPageIds,
  getAllSelectablePageIds,
} from '../../mocks/access-pages';
import type {
  AccountFormPayload,
  AccountScopeType,
  AdminAccount,
  AdminDepartment,
  AdminSpecialty,
} from '../../types/admin.types';

const STEPS = [
  { id: 1, title: 'Informations générales', subtitle: 'Login, prénom et nom', color: 'blue' },
  { id: 2, title: 'Mot de passe', subtitle: 'Définir le mot de passe', color: 'amber' },
  { id: 3, title: 'Département / Spécialité', subtitle: 'Choisir le périmètre', color: 'emerald' },
  { id: 4, title: "Pages d'accès", subtitle: 'Définir les permissions', color: 'purple' },
] as const;

interface AccountFormStepperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAccount: AdminAccount | null;
  departments: AdminDepartment[];
  specialties: AdminSpecialty[];
  saving?: boolean;
  onSubmit: (payload: AccountFormPayload) => Promise<void> | void;
}

const emptyForm = (): AccountFormPayload & {
  password: string;
  confirmPassword: string;
} => ({
  login: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  scopeType: 'all_fleet',
  departmentIds: [],
  specialtyIds: [],
  accessPageIds: [],
});

export function AccountFormStepper({
  open,
  onOpenChange,
  editingAccount,
  departments,
  specialties,
  saving,
  onSubmit,
}: AccountFormStepperProps) {
  const isEdit = Boolean(editingAccount);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['administration']));

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError(null);
    if (editingAccount) {
      setForm({
        login: editingAccount.login,
        firstName: editingAccount.firstName,
        lastName: editingAccount.lastName,
        password: '',
        confirmPassword: '',
        scopeType: editingAccount.scopeType,
        departmentIds: [...editingAccount.departmentIds],
        specialtyIds: [...editingAccount.specialtyIds],
        accessPageIds: [...editingAccount.accessPageIds],
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, editingAccount]);

  const allPageIds = useMemo(() => getAllSelectablePageIds(), []);
  const leafAndGroupIds = useMemo(() => flattenAccessPageIds(), []);

  const isAllSelected =
    form.accessPageIds.includes('tous') ||
    leafAndGroupIds.every((id) => form.accessPageIds.includes(id));

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!form.login.trim()) {
        return 'Le login est requis';
      }
    }
    if (s === 2) {
      if (!isEdit) {
        if (!form.password || !form.confirmPassword) {
          return 'Le mot de passe est requis';
        }
      }
      if (form.password || form.confirmPassword) {
        if (form.password !== form.confirmPassword) {
          return 'Les mots de passe ne correspondent pas';
        }
        if (form.password.length < 8) {
          return 'Le mot de passe doit contenir au moins 8 caractères';
        }
      }
    }
    if (s === 3) {
      if (form.scopeType === 'specific_departments' && form.departmentIds.length === 0) {
        return 'Sélectionnez au moins un département';
      }
      if (form.scopeType === 'specialty' && form.specialtyIds.length === 0) {
        return 'Sélectionnez au moins une spécialité';
      }
    }
    // Step 4 pages are optional (Webtrace parity)
    return null;
  };

  const goNext = async () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    const payload: AccountFormPayload = {
      login: form.login,
      firstName: form.firstName,
      lastName: form.lastName,
      scopeType: form.scopeType,
      departmentIds: form.departmentIds,
      specialtyIds: form.specialtyIds,
      accessPageIds: form.accessPageIds,
      password: form.password || undefined,
    };
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’enregistrement');
    }
  };

  const setScope = (scopeType: AccountScopeType) => {
    setForm((f) => ({
      ...f,
      scopeType,
      departmentIds: scopeType === 'specific_departments' ? f.departmentIds : [],
      specialtyIds: scopeType === 'specialty' ? f.specialtyIds : [],
    }));
  };

  const toggleDept = (id: string) => {
    setForm((f) => ({
      ...f,
      departmentIds: f.departmentIds.includes(id)
        ? f.departmentIds.filter((x) => x !== id)
        : [...f.departmentIds, id],
    }));
  };

  const toggleSpecialty = (id: string) => {
    setForm((f) => ({
      ...f,
      specialtyIds: f.specialtyIds.includes(id)
        ? f.specialtyIds.filter((x) => x !== id)
        : [...f.specialtyIds, id],
    }));
  };

  const togglePage = (id: string) => {
    setForm((f) => {
      const next = new Set(f.accessPageIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      next.delete('tous');
      return { ...f, accessPageIds: [...next] };
    });
  };

  const setAllPages = (checked: boolean) => {
    setForm((f) => ({
      ...f,
      accessPageIds: checked ? [...allPageIds] : [],
    }));
  };

  const setGroupPages = (groupId: string, childIds: string[], checked: boolean) => {
    setForm((f) => {
      const next = new Set(f.accessPageIds);
      next.delete('tous');
      if (checked) {
        next.add(groupId);
        childIds.forEach((id) => next.add(id));
      } else {
        next.delete(groupId);
        childIds.forEach((id) => next.delete(id));
      }
      return { ...f, accessPageIds: [...next] };
    });
  };

  const stepMeta = STEPS[step - 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier le compte' : 'Ajouter un compte'}
          </DialogTitle>
          <DialogDescription>{stepMeta.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="flex items-start justify-between gap-2 px-6 pb-3">
          {STEPS.map((s) => {
            const active = s.id === step;
            const done = s.id < step;
            return (
              <div key={s.id} className="flex flex-1 flex-col items-center gap-1 text-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                    active || done
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {s.id}
                </div>
                <span
                  className={cn(
                    'hidden text-[11px] font-medium sm:block',
                    active ? 'text-blue-700' : 'text-slate-500'
                  )}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-6 py-2">
          {step === 1 && (
            <section className="space-y-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:border-blue-900 dark:from-blue-950/40 dark:to-slate-900">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                  1
                </span>
                Informations générales
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="login">Login *</Label>
                  <Input
                    id="login"
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                    placeholder="Nom d'utilisateur"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 dark:border-amber-900 dark:from-amber-950/40 dark:to-slate-900">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-sm font-bold text-white">
                  2
                </span>
                Mot de passe
              </h3>
              {isEdit ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Laissez vide pour ne pas modifier le mot de passe.
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="password">
                    {isEdit ? 'Nouveau mot de passe' : 'Mot de passe *'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">
                    {isEdit ? 'Répéter nouveau mot de passe' : 'Répéter mot de passe *'}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 dark:border-emerald-900 dark:from-emerald-950/40 dark:to-slate-900">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                  3
                </span>
                Département / Spécialité
              </h3>
              <div className="space-y-3">
                <ScopeOption
                  checked={form.scopeType === 'all_fleet'}
                  onSelect={() => setScope('all_fleet')}
                  label="Suivre toute la flotte"
                />
                <ScopeOption
                  checked={form.scopeType === 'specific_departments'}
                  onSelect={() => setScope('specific_departments')}
                  label="Suivre uniquement les voitures de ces départements"
                >
                  {form.scopeType === 'specific_departments' ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {departments.map((d) => (
                        <label
                          key={d.id}
                          className="flex cursor-pointer items-center gap-2 rounded p-2 text-sm hover:bg-white/60"
                        >
                          <input
                            type="checkbox"
                            checked={form.departmentIds.includes(d.id)}
                            onChange={() => toggleDept(d.id)}
                            className="h-4 w-4 rounded text-emerald-600"
                          />
                          {d.name}
                        </label>
                      ))}
                    </div>
                  ) : null}
                </ScopeOption>
                <ScopeOption
                  checked={form.scopeType === 'specialty'}
                  onSelect={() => setScope('specialty')}
                  label="Spécialité"
                >
                  {form.scopeType === 'specialty' ? (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {specialties.map((s) => (
                        <label
                          key={s.id}
                          className="flex cursor-pointer items-center gap-2 rounded p-2 text-sm hover:bg-white/60"
                        >
                          <input
                            type="checkbox"
                            checked={form.specialtyIds.includes(s.id)}
                            onChange={() => toggleSpecialty(s.id)}
                            className="h-4 w-4 rounded text-emerald-600"
                          />
                          {s.name}
                        </label>
                      ))}
                    </div>
                  ) : null}
                </ScopeOption>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 dark:border-purple-900 dark:from-purple-950/40 dark:to-slate-900">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
                  4
                </span>
                Les pages d&apos;accès
              </h3>
              <div className="max-h-80 overflow-y-auto rounded-lg border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <label className="flex cursor-pointer items-center gap-2 border-b border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <PageCheck checked={isAllSelected} />
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isAllSelected}
                    onChange={(e) => setAllPages(e.target.checked)}
                  />
                  <span className="text-sm font-semibold">Tous</span>
                </label>
                {ACCESS_PAGES.filter((g) => g.id !== 'tous').map((group) => {
                  const childIds = group.children.map((c) => c.id);
                  const groupChecked =
                    form.accessPageIds.includes(group.id) ||
                    (childIds.length > 0 &&
                      childIds.every((id) => form.accessPageIds.includes(id)));
                  const isOpen = expanded.has(group.id);
                  return (
                    <div
                      key={group.id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800">
                        {group.children.length > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setExpanded((prev) => {
                                const n = new Set(prev);
                                if (n.has(group.id)) n.delete(group.id);
                                else n.add(group.id);
                                return n;
                              })
                            }
                            className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                            aria-expanded={isOpen}
                          >
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <span className="w-5" />
                        )}
                        <label className="flex flex-1 cursor-pointer items-center gap-2">
                          <PageCheck checked={groupChecked} />
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={groupChecked}
                            onChange={(e) =>
                              setGroupPages(group.id, childIds, e.target.checked)
                            }
                          />
                          <span className="text-sm font-semibold">{group.label}</span>
                        </label>
                      </div>
                      {isOpen && group.children.length > 0 ? (
                        <div className="bg-slate-50 pl-16 dark:bg-slate-800/50">
                          {group.children.map((child) => (
                            <label
                              key={child.id}
                              className="flex cursor-pointer items-center gap-2 p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <PageCheck
                                checked={form.accessPageIds.includes(child.id)}
                              />
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={form.accessPageIds.includes(child.id)}
                                onChange={() => togglePage(child.id)}
                              />
                              <span className="text-sm text-slate-600 dark:text-slate-300">
                                {child.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {error ? (
            <p className="mt-3 text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 border-t border-slate-100 p-6 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={saving}
            >
              Précédent
            </Button>
          ) : null}
          <Button type="button" onClick={goNext} disabled={saving}>
            {saving
              ? 'Enregistrement...'
              : step < 4
                ? 'Suivant'
                : isEdit
                  ? 'Modifier'
                  : 'Créer le compte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScopeOption({
  checked,
  onSelect,
  label,
  children,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
  children?: ReactNode;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border-2 bg-white p-4 transition-colors dark:bg-slate-900',
        checked ? 'border-emerald-400' : 'border-slate-200 dark:border-slate-700'
      )}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onSelect}
        className="mt-0.5 h-5 w-5 text-emerald-600"
      />
      <div className="flex-1">
        <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </span>
        {children}
      </div>
    </label>
  );
}

function PageCheck({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2',
        checked
          ? 'border-purple-600 bg-purple-600 text-white'
          : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
      )}
    >
      {checked ? <Check className="h-3 w-3" /> : null}
    </span>
  );
}
