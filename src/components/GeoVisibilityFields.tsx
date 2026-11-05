import { useMemo, useState } from 'react';
import type { GeoVisibility } from '@/types/map-overlays';
import { INITIAL_ACCOUNTS } from '@/features/admin/mocks/mockAccounts';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LockKeyhole, Search, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeoVisibilityFieldsProps {
  visibility: GeoVisibility;
  onChange: (next: GeoVisibility) => void;
  error?: string;
  disabled?: boolean;
}

function accountLabel(id: string): string {
  const a = INITIAL_ACCOUNTS.find((x) => x.id === id);
  if (!a) return id;
  return `${a.firstName} ${a.lastName} (${a.login})`;
}

export function GeoVisibilityFields({
  visibility,
  onChange,
  error,
  disabled = false,
}: GeoVisibilityFieldsProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return INITIAL_ACCOUNTS;
    return INITIAL_ACCOUNTS.filter(
      (a) =>
        a.login.toLowerCase().includes(q) ||
        a.firstName.toLowerCase().includes(q) ||
        a.lastName.toLowerCase().includes(q) ||
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(q)
    );
  }, [search]);

  const selectedIds =
    visibility.mode === 'accounts' ? visibility.accountIds : [];

  const setMode = (mode: GeoVisibility['mode']) => {
    if (disabled) return;
    if (mode === 'all') {
      onChange({ mode: 'all' });
    } else if (mode === 'private') {
      onChange({ mode: 'private' });
    } else {
      onChange({
        mode: 'accounts',
        accountIds: visibility.mode === 'accounts' ? visibility.accountIds : [],
      });
    }
  };

  const toggleAccount = (id: string) => {
    if (disabled || visibility.mode !== 'accounts') return;
    const next = visibility.accountIds.includes(id)
      ? visibility.accountIds.filter((x) => x !== id)
      : [...visibility.accountIds, id];
    onChange({ mode: 'accounts', accountIds: next });
  };

  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2.5">
      <div className="flex items-center gap-2">
        <span className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 inline-flex items-center justify-center shrink-0">
          <Users className="w-3.5 h-3.5" />
        </span>
        <Label className="text-xs text-slate-700">Visibilité</Label>
        {visibility.mode === 'accounts' && selectedIds.length > 0 && (
          <Badge variant="info" className="text-[10px] h-5 ml-auto">
            {selectedIds.length} compte{selectedIds.length > 1 ? 's' : ''}
          </Badge>
        )}
        {visibility.mode === 'private' && (
          <Badge variant="secondary" className="text-[10px] h-5 ml-auto">
            Moi uniquement
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode('all')}
          className={cn(
            'rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors',
            visibility.mode === 'all'
              ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
              : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-50',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          Tous les comptes
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode('private')}
          className={cn(
            'rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5',
            visibility.mode === 'private'
              ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
              : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-50',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
          title="Visible uniquement par le compte créateur"
        >
          <LockKeyhole className="h-3.5 w-3.5" />
          <span>Uniquement pour moi</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setMode('accounts')}
          className={cn(
            'rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors',
            visibility.mode === 'accounts'
              ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
              : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-50',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          Comptes spécifiques
        </button>
      </div>

      {visibility.mode === 'accounts' && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un compte…"
              className="pl-8 h-9 text-sm"
              autoComplete="off"
              disabled={disabled}
            />
          </div>

          <div className="max-h-36 overflow-y-auto rounded-md border border-slate-200 divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">
                Aucun compte trouvé
              </p>
            ) : (
              filtered.map((acc) => {
                const checked = selectedIds.includes(acc.id);
                return (
                  <label
                    key={acc.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer',
                      disabled && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={() => toggleAccount(acc.id)}
                    />
                    <span className="min-w-0 truncate">
                      <span className="text-slate-800 font-medium">
                        {acc.firstName} {acc.lastName}
                      </span>
                      <span className="text-slate-400 text-xs ml-1.5">
                        @{acc.login}
                      </span>
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {selectedIds.length > 0 && (
            <p className="text-[10px] text-slate-400 truncate">
              {selectedIds.map(accountLabel).join(' · ')}
            </p>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function validateGeoVisibility(
  visibility: GeoVisibility
): string | undefined {
  if (visibility.mode === 'accounts' && visibility.accountIds.length === 0) {
    return 'Sélectionnez au moins un compte.';
  }
  return undefined;
}
