import { useEffect, useMemo, useState } from 'react';
import { Building2, Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '../shared/AdminPageHeader';
import { SummaryCard } from '../shared/SummaryCard';
import { SearchFilterBar } from '../shared/SearchFilterBar';
import { AdminDataTable } from '../shared/AdminDataTable';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { DepartmentFormModal } from './DepartmentFormModal';
import {
  useAdminVehicles,
  useAllDepartments,
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useDepartmentsKpis,
  useUpdateDepartment,
} from '../../hooks/useAdminQueries';
import type {
  AdminDepartment,
  DepartmentFormPayload,
} from '../../types/admin.types';

export function DepartmentsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminDepartment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminDepartment | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize]);

  const listParams = useMemo(
    () => ({ page, pageSize, search: debouncedSearch }),
    [page, pageSize, debouncedSearch]
  );

  const { data: list, isLoading, isError, refetch, error } = useDepartments(listParams);
  const { data: kpis } = useDepartmentsKpis();
  const { data: allDepartments = [] } = useAllDepartments();
  const { data: vehicles = [] } = useAdminVehicles();

  const createMut = useCreateDepartment();
  const updateMut = useUpdateDepartment();
  const deleteMut = useDeleteDepartment();

  const deptMap = useMemo(
    () => new Map(allDepartments.map((d) => [d.id, d.name])),
    [allDepartments]
  );
  const vehicleMap = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v.name])),
    [vehicles]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (dept: AdminDepartment) => {
    setEditing(dept);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: DepartmentFormPayload) => {
    setActionError(null);
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
          title="Gestion des Départements"
          subtitle="Gérez les départements et leurs véhicules associés"
          actions={
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Ajouter un département
            </Button>
          }
        />

        {isError || actionError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {actionError ?? (error as Error)?.message ?? 'Erreur de chargement'}
            {isError ? (
              <button type="button" className="ml-2 underline" onClick={() => refetch()}>
                Réessayer
              </button>
            ) : null}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            label="Total Départements"
            value={kpis?.total ?? '—'}
            icon={<Building2 className="h-10 w-10 text-blue-600" />}
          />
          <SummaryCard
            label="Racines"
            value={kpis?.roots ?? '—'}
            variant="success"
            icon={<Building2 className="h-10 w-10 text-emerald-600" />}
          />
          <SummaryCard
            label="Branches"
            value={kpis?.branches ?? '—'}
            variant="info"
            icon={<Building2 className="h-10 w-10 text-blue-600" />}
          />
        </section>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <SearchFilterBar
            searchPlaceholder="Rechercher un département..."
            searchValue={search}
            onSearchChange={setSearch}
          />
        </div>

        <AdminDataTable
          headers={['Département', 'Véhicules', 'Actions']}
          loading={isLoading}
          emptyMessage="Aucun département"
          page={page}
          pageSize={pageSize}
          totalCount={list?.totalCount ?? 0}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        >
          {(list?.items ?? []).map((row) => {
            const isRoot = row.level === 'racine';
            const parentName = row.parentId ? deptMap.get(row.parentId) : undefined;
            const vehicleNames = row.vehicleIds.map(
              (id) => vehicleMap.get(id) ?? id
            );
            return (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                        isRoot
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {row.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant={isRoot ? 'success' : 'medium'}>
                          {isRoot
                            ? 'Racine'
                            : `Branche${parentName ? ` → ${parentName}` : ''}`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {vehicleNames.length === 0 ? (
                    <span className="text-xs italic text-slate-400">Aucun véhicule</span>
                  ) : (
                    <div className="flex max-w-xs flex-wrap gap-1.5">
                      {vehicleNames.slice(0, 4).map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {name}
                        </span>
                      ))}
                      {vehicleNames.length > 4 ? (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          +{vehicleNames.length - 4}
                        </span>
                      ) : null}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
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

      <DepartmentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        departments={allDepartments}
        vehicles={vehicles}
        saving={createMut.isPending || updateMut.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer le département"
        description={
          deleteTarget
            ? `Supprimer le département « ${deleteTarget.name} » ?`
            : ''
        }
        loading={deleteMut.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setActionError(null);
          try {
            await deleteMut.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
          } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Erreur');
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
