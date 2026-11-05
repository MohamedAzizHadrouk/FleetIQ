import { useEffect, useMemo, useState } from 'react';
import { Edit, Key, Plus, Trash2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '../shared/AdminPageHeader';
import { SummaryCard } from '../shared/SummaryCard';
import { SearchFilterBar } from '../shared/SearchFilterBar';
import { MultiSelectDropdown } from '../shared/MultiSelectDropdown';
import { AdminDataTable } from '../shared/AdminDataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { AccountFormStepper } from './AccountFormStepper';
import { ChangePasswordModal } from './ChangePasswordModal';
import {
  useAccounts,
  useAccountsKpis,
  useAllDepartments,
  useChangeAccountPassword,
  useCreateAccount,
  useDeleteAccount,
  useSpecialties,
  useUpdateAccount,
} from '../../hooks/useAdminQueries';
import { MOCK_SPECIALTIES } from '../../mocks/mockSpecialties';
import type { AccountFormPayload, AdminAccount } from '../../types/admin.types';

function scopeLabel(
  account: AdminAccount,
  deptMap: Map<string, string>,
  specialtyMap: Map<string, string>
): { primary: string; secondary?: string } {
  if (account.scopeType === 'all_fleet') {
    return { primary: 'Toute la flotte' };
  }
  if (account.scopeType === 'specific_departments') {
    const names = account.departmentIds
      .map((id) => deptMap.get(id) ?? id)
      .join(', ');
    return {
      primary: names || 'Départements',
      secondary: 'Départements spécifiques',
    };
  }
  return { primary: 'Spécialité', secondary: specialtyMap.get(account.specialtyIds[0] ?? '') };
}

export function AccountsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [passwordAccount, setPasswordAccount] = useState<AdminAccount | null>(null);
  const [deleteAccount, setDeleteTarget] = useState<AdminAccount | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, departmentIds, pageSize]);

  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch,
      departmentIds,
    }),
    [page, pageSize, debouncedSearch, departmentIds]
  );

  const { data: list, isLoading, isError, refetch, error } = useAccounts(listParams);
  const { data: kpis } = useAccountsKpis();
  const { data: departments = [] } = useAllDepartments();
  const { data: specialties = MOCK_SPECIALTIES } = useSpecialties();

  const createMut = useCreateAccount();
  const updateMut = useUpdateAccount();
  const deleteMut = useDeleteAccount();
  const passwordMut = useChangeAccountPassword();

  const deptMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name])),
    [departments]
  );
  const specialtyMap = useMemo(
    () => new Map(specialties.map((s) => [s.id, s.name])),
    [specialties]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (account: AdminAccount) => {
    setEditing(account);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: AccountFormPayload) => {
    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload });
    } else {
      await createMut.mutateAsync(payload);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="w-full space-y-5 p-4">
        <AdminPageHeader
          title="Gestion des Comptes"
          subtitle="Gérez les comptes utilisateurs et leurs accès"
          actions={
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Ajouter un compte
            </Button>
          }
        />

        {isError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {(error as Error)?.message ?? 'Erreur de chargement'}
            <button type="button" className="ml-2 underline" onClick={() => refetch()}>
              Réessayer
            </button>
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            label="Total Comptes"
            value={kpis?.total ?? '—'}
            icon={<UserCircle className="h-10 w-10 text-blue-600" />}
          />
          <SummaryCard
            label="Actifs ce mois"
            value={kpis?.activeThisMonth ?? '—'}
            variant="success"
            icon={<UserCircle className="h-10 w-10 text-emerald-600" />}
          />
          <SummaryCard
            label="Nouveaux (30j)"
            value={kpis?.newLast30Days ?? '—'}
            variant="info"
            icon={<UserCircle className="h-10 w-10 text-blue-600" />}
          />
        </section>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <SearchFilterBar
            searchPlaceholder="Rechercher..."
            searchValue={search}
            onSearchChange={setSearch}
            showFilterLabel
          >
            <MultiSelectDropdown
              items={departments.map((d) => ({ id: d.id, label: d.name }))}
              selectedIds={departmentIds}
              onChange={setDepartmentIds}
              label="Départements"
              searchPlaceholder="Rechercher un département..."
              allSelectedLabel="Tous les départements"
              emptyMessage="Aucun département"
            />
          </SearchFilterBar>
        </div>

        <AdminDataTable
          headers={['Login', 'Prénom', 'Nom', 'Départements / Spécialité', 'Actions']}
          loading={isLoading}
          emptyMessage="Aucun compte"
          page={page}
          pageSize={pageSize}
          totalCount={list?.totalCount ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        >
          {(list?.items ?? []).map((row) => {
            const scope = scopeLabel(row, deptMap, specialtyMap);
            return (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="whitespace-nowrap px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {row.login}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-700 dark:text-slate-200">
                  {row.firstName || '—'}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-700 dark:text-slate-200">
                  {row.lastName || '—'}
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {scope.primary}
                  </span>
                  {scope.secondary ? (
                    <p className="mt-0.5 text-xs text-slate-500">{scope.secondary}</p>
                  ) : null}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Modifier"
                      onClick={() => openEdit(row)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Changer mot de passe"
                      onClick={() => setPasswordAccount(row)}
                    >
                      <Key className="h-4 w-4 text-amber-600" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Supprimer"
                      onClick={() => setDeleteTarget(row)}
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminDataTable>
      </div>

      <AccountFormStepper
        open={formOpen}
        onOpenChange={setFormOpen}
        editingAccount={editing}
        departments={departments}
        specialties={specialties}
        saving={createMut.isPending || updateMut.isPending}
        onSubmit={handleSubmit}
      />

      <ChangePasswordModal
        open={Boolean(passwordAccount)}
        onOpenChange={(o) => !o && setPasswordAccount(null)}
        account={passwordAccount}
        saving={passwordMut.isPending}
        onSubmit={async (password) => {
          if (!passwordAccount) return;
          await passwordMut.mutateAsync({ id: passwordAccount.id, password });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteAccount)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer le compte"
        description={
          deleteAccount
            ? `Supprimer le compte « ${deleteAccount.login} » ? Cette action est irréversible.`
            : ''
        }
        loading={deleteMut.isPending}
        onConfirm={async () => {
          if (!deleteAccount) return;
          await deleteMut.mutateAsync(deleteAccount.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
