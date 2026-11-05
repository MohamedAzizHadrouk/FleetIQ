import { useEffect, useMemo, useState } from 'react';
import { Bell, Mail, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
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
import type { AlertNotificationContact } from '@/types/alert-config';
import type { AlertType } from '@/types/alerts';
import {
  useAlertContacts,
  useDeleteAlertContact,
  useSaveAlertContact,
} from '@/features/alert-center/hooks/useAlertQueries';
import { getAlertTypesForSection } from '@/features/alert-center/constants/alert-config-sections';
import { getAlertTypeLabel } from '@/features/alert-center/constants/alert-taxonomy';
import { AdminPageHeader } from '../components/shared/AdminPageHeader';
import { SearchFilterBar } from '../components/shared/SearchFilterBar';
import { AdminDataTable } from '../components/shared/AdminDataTable';
import { MultiSelectDropdown } from '../components/shared/MultiSelectDropdown';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { MOCK_ADMIN_VEHICLES } from '../mocks/mockVehicles';

type Tab = 'email' | 'phone';

interface AlertConfigRow {
  type: AlertType;
  startTime: string;
  endTime: string;
  active: boolean;
}

const ALERT_TYPES = [
  ...getAlertTypesForSection('dashboard'),
  ...getAlertTypesForSection('vehicle_management'),
  ...getAlertTypesForSection('geolocation'),
  ...getAlertTypesForSection('security'),
] as AlertType[];

function contactValue(c: AlertNotificationContact, tab: Tab) {
  return tab === 'email' ? c.email ?? '' : c.phone ?? '';
}

export function AlertMailSmsPage() {
  const { data: contacts = [], isLoading } = useAlertContacts();
  const saveContact = useSaveAlertContact();
  const deleteContact = useDeleteAlertContact();

  const [tab, setTab] = useState<Tab>('email');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AlertNotificationContact | null>(null);
  const [formContact, setFormContact] = useState('');
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AlertNotificationContact | null>(
    null
  );

  const [configTarget, setConfigTarget] = useState<AlertNotificationContact | null>(
    null
  );
  const [configVehicles, setConfigVehicles] = useState<string[]>([]);
  const [configRows, setConfigRows] = useState<AlertConfigRow[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced, tab, pageSize]);

  const filtered = useMemo(() => {
    const list = contacts.filter((c) =>
      tab === 'email' ? Boolean(c.email) : Boolean(c.phone)
    );
    const q = debounced.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => {
      const hay = `${contactValue(c, tab)} ${c.name}`.toLowerCase();
      return hay.includes(q);
    });
  }, [contacts, tab, debounced]);

  const totalCount = filtered.length;
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setFormContact('');
    setFormName('');
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (row: AlertNotificationContact) => {
    setEditing(row);
    setFormContact(contactValue(row, tab));
    setFormName(row.name);
    setFormError(null);
    setFormOpen(true);
  };

  const saveForm = async () => {
    if (!formContact.trim() || !formName.trim()) {
      setFormError('Contact et nom sont requis');
      return;
    }
    setFormError(null);
    const base: AlertNotificationContact = editing
      ? { ...editing }
      : {
          id: `contact-${Date.now()}`,
          name: formName.trim(),
          role: 'user',
          vehicleIds: [],
        };
    base.name = formName.trim();
    if (tab === 'email') {
      base.email = formContact.trim();
      if (!editing) delete (base as { phone?: string }).phone;
    } else {
      base.phone = formContact.trim();
      if (!editing) delete (base as { email?: string }).email;
    }
    await saveContact.mutateAsync(base);
    setFormOpen(false);
  };

  const openConfig = (row: AlertNotificationContact) => {
    setConfigTarget(row);
    setConfigVehicles([...(row.vehicleIds ?? [])]);
    setConfigRows(
      ALERT_TYPES.map((type) => ({
        type,
        startTime: '00:00',
        endTime: '23:59',
        active: false,
      }))
    );
  };

  const saveConfig = async () => {
    if (!configTarget || configVehicles.length === 0) return;
    await saveContact.mutateAsync({
      ...configTarget,
      vehicleIds: configVehicles,
    });
    setConfigTarget(null);
  };

  const headers =
    tab === 'email'
      ? ['Adresse mail', 'Nom', 'Actions']
      : ['Numéro', 'Nom', 'Actions'];

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="w-full space-y-5 p-4">
        <AdminPageHeader
          title="Envoi des alertes par Mail/SMS"
          subtitle="Gérez les adresses mail et numéros pour la réception des alertes"
          actions={
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {tab === 'email' ? 'Ajouter un email' : 'Ajouter un numéro'}
            </Button>
          }
        />

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <SearchFilterBar
            searchPlaceholder="Rechercher..."
            searchValue={search}
            onSearchChange={setSearch}
          />
        </div>

        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200">
            {(
              [
                ['email', Mail, 'Adresse mail'],
                ['phone', Phone, 'Numéro de téléphone'],
              ] as const
            ).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  'flex items-center space-x-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors',
                  tab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <AdminDataTable
            headers={headers}
            loading={isLoading}
            emptyMessage="Aucun contact"
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            className="rounded-none border-0 shadow-none"
          >
            {pageItems.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-3.5 text-sm text-slate-700">
                  {contactValue(row, tab)}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-700">{row.name}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Modifier"
                      onClick={() => openEdit(row)}
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Supprimer"
                      onClick={() => setDeleteTarget(row)}
                      className="rounded-lg p-1.5 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Configurer les alertes"
                      onClick={() => openConfig(row)}
                      className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Bell className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminDataTable>
        </div>
      </div>

      {/* Form modal */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? tab === 'email'
                  ? 'Modifier une adresse mail'
                  : 'Modifier un numéro portable'
                : tab === 'email'
                  ? 'Ajouter une adresse mail'
                  : 'Ajouter un numéro portable'}
            </DialogTitle>
            <DialogDescription>
              Renseignez le contact et le nom associé
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 px-6 py-2 sm:grid-cols-2">
            <div>
              <Label>{tab === 'email' ? 'Adresse mail' : 'Numéro'}</Label>
              <Input
                className="mt-1"
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
              />
            </div>
            <div>
              <Label>Nom</Label>
              <Input
                className="mt-1"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
          </div>
          {formError ? (
            <p className="px-6 text-sm font-medium text-rose-600">{formError}</p>
          ) : null}
          <DialogFooter className="gap-2 p-6">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={saveForm}
              disabled={saveContact.isPending}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Supprimer le contact"
        description={
          deleteTarget
            ? `Supprimer « ${deleteTarget.name} » (${contactValue(deleteTarget, tab)}) ?`
            : ''
        }
        loading={deleteContact.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteContact.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />

      {/* Configure modal */}
      <Dialog
        open={Boolean(configTarget)}
        onOpenChange={(o) => !o && setConfigTarget(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Configuration des alertes</DialogTitle>
            <DialogDescription>
              {configTarget
                ? `${configTarget.name} — ${contactValue(configTarget, tab)}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">
                Sélectionner les véhicules
              </label>
              <MultiSelectDropdown
                items={MOCK_ADMIN_VEHICLES.map((v) => ({
                  id: v.id,
                  label: v.name,
                }))}
                selectedIds={configVehicles}
                onChange={setConfigVehicles}
                label="Véhicules"
                searchPlaceholder="Rechercher un véhicule..."
                allSelectedLabel="Aucun véhicule sélectionné"
                emptyMessage="Aucun véhicule disponible"
              />
              <p className="text-sm text-slate-700">
                {configVehicles.length === 0
                  ? 'Aucun véhicule sélectionné'
                  : `${configVehicles.length} véhicule(s) sélectionné(s)`}
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-1/2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Type alerte
                    </th>
                    <th className="w-1/4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Heure début
                    </th>
                    <th className="w-1/4 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Heure fin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {configRows.map((row, i) => (
                    <tr key={row.type} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setConfigRows((rows) =>
                                rows.map((r, idx) =>
                                  idx === i ? { ...r, active: !r.active } : r
                                )
                              )
                            }
                            className={cn(
                              'relative h-[22px] w-10 shrink-0 rounded-full transition-colors duration-200',
                              row.active ? 'bg-emerald-500' : 'bg-slate-300'
                            )}
                          >
                            <span
                              className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200"
                              style={{ left: row.active ? 20 : 2 }}
                            />
                          </button>
                          <span className="text-sm font-medium text-slate-800">
                            {getAlertTypeLabel(row.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) =>
                            setConfigRows((rows) =>
                              rows.map((r, idx) =>
                                idx === i
                                  ? { ...r, startTime: e.target.value }
                                  : r
                              )
                            )
                          }
                          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) =>
                            setConfigRows((rows) =>
                              rows.map((r, idx) =>
                                idx === i ? { ...r, endTime: e.target.value } : r
                              )
                            )
                          }
                          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter className="gap-2 p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfigTarget(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={saveConfig}
              disabled={configVehicles.length === 0 || saveContact.isPending}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
