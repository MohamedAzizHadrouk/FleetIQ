import { delay } from '@/lib/utils';
import { INITIAL_ACCOUNTS } from '../mocks/mockAccounts';
import { INITIAL_DEPARTMENTS } from '../mocks/mockDepartments';
import { MOCK_SPECIALTIES } from '../mocks/mockSpecialties';
import { MOCK_ADMIN_VEHICLES } from '../mocks/mockVehicles';
import type {
  AccountFormPayload,
  AccountsKpis,
  AccountsListParams,
  AdminAccount,
  AdminDepartment,
  DepartmentFormPayload,
  DepartmentsKpis,
  DepartmentsListParams,
  PagedResult,
} from '../types/admin.types';

let accountsStore: AdminAccount[] = structuredClone(INITIAL_ACCOUNTS);
let departmentsStore: AdminDepartment[] = structuredClone(INITIAL_DEPARTMENTS);
const passwordStore = new Map<string, string>([
  ['acc-1', 'Password1!'],
  ['acc-2', 'Password1!'],
  ['acc-3', 'Password1!'],
  ['acc-4', 'Password1!'],
]);

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysAgoDate(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function fetchAccounts(
  params: AccountsListParams
): Promise<PagedResult<AdminAccount>> {
  await delay(220);
  const search = params.search?.trim().toLowerCase() ?? '';
  const deptFilter = params.departmentIds ?? [];

  let filtered = accountsStore.filter((a) => {
    if (search) {
      const hay = `${a.login} ${a.firstName} ${a.lastName}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    if (deptFilter.length > 0) {
      if (a.scopeType === 'all_fleet') return true;
      if (a.scopeType === 'specific_departments') {
        return a.departmentIds.some((id) => deptFilter.includes(id));
      }
      return false;
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => a.login.localeCompare(b.login));
  const totalCount = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);

  return { items, totalCount, page: params.page, pageSize: params.pageSize };
}

export async function fetchAccountsKpis(): Promise<AccountsKpis> {
  await delay(120);
  const monthStart = startOfMonth().getTime();
  const cutoff30 = daysAgoDate(30).getTime();
  return {
    total: accountsStore.length,
    activeThisMonth: accountsStore.filter(
      (a) => a.lastActiveAt && new Date(a.lastActiveAt).getTime() >= monthStart
    ).length,
    newLast30Days: accountsStore.filter(
      (a) => new Date(a.createdAt).getTime() >= cutoff30
    ).length,
  };
}

export async function createAccount(payload: AccountFormPayload): Promise<AdminAccount> {
  await delay(280);
  if (accountsStore.some((a) => a.login.toLowerCase() === payload.login.toLowerCase())) {
    throw new Error('Ce login existe déjà');
  }
  const account: AdminAccount = {
    id: `acc-${Date.now()}`,
    login: payload.login.trim(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    scopeType: payload.scopeType,
    departmentIds: payload.departmentIds,
    specialtyIds: payload.specialtyIds,
    accessPageIds: payload.accessPageIds,
    createdAt: new Date().toISOString(),
    lastActiveAt: null,
  };
  accountsStore = [account, ...accountsStore];
  if (payload.password) passwordStore.set(account.id, payload.password);
  return account;
}

export async function updateAccount(
  id: string,
  payload: AccountFormPayload
): Promise<AdminAccount> {
  await delay(280);
  const idx = accountsStore.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error('Compte introuvable');
  if (
    accountsStore.some(
      (a) => a.id !== id && a.login.toLowerCase() === payload.login.toLowerCase()
    )
  ) {
    throw new Error('Ce login existe déjà');
  }
  const updated: AdminAccount = {
    ...accountsStore[idx],
    login: payload.login.trim(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    scopeType: payload.scopeType,
    departmentIds: payload.departmentIds,
    specialtyIds: payload.specialtyIds,
    accessPageIds: payload.accessPageIds,
  };
  accountsStore = accountsStore.map((a) => (a.id === id ? updated : a));
  if (payload.password) passwordStore.set(id, payload.password);
  return updated;
}

export async function deleteAccount(id: string): Promise<void> {
  await delay(200);
  accountsStore = accountsStore.filter((a) => a.id !== id);
  passwordStore.delete(id);
}

export async function changeAccountPassword(
  id: string,
  password: string
): Promise<void> {
  await delay(200);
  if (!accountsStore.some((a) => a.id === id)) throw new Error('Compte introuvable');
  passwordStore.set(id, password);
}

export async function fetchDepartments(
  params: DepartmentsListParams
): Promise<PagedResult<AdminDepartment>> {
  await delay(220);
  const search = params.search?.trim().toLowerCase() ?? '';
  let filtered = departmentsStore.filter((d) =>
    search ? d.name.toLowerCase().includes(search) : true
  );
  filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  const totalCount = filtered.length;
  const start = (params.page - 1) * params.pageSize;
  const items = filtered.slice(start, start + params.pageSize);
  return { items, totalCount, page: params.page, pageSize: params.pageSize };
}

export async function fetchAllDepartments(): Promise<AdminDepartment[]> {
  await delay(100);
  return [...departmentsStore].sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchDepartmentsKpis(): Promise<DepartmentsKpis> {
  await delay(100);
  return {
    total: departmentsStore.length,
    roots: departmentsStore.filter((d) => d.level === 'racine').length,
    branches: departmentsStore.filter((d) => d.level === 'branche').length,
  };
}

export async function createDepartment(
  payload: DepartmentFormPayload
): Promise<AdminDepartment> {
  await delay(280);
  if (!payload.name.trim()) throw new Error('Le nom est requis');
  const dept: AdminDepartment = {
    id: `dept-${Date.now()}`,
    name: payload.name.trim(),
    type: payload.type,
    level: payload.level,
    parentId: payload.level === 'branche' ? payload.parentId : undefined,
    vehicleIds: payload.vehicleIds,
  };
  departmentsStore = [dept, ...departmentsStore];
  return dept;
}

export async function updateDepartment(
  id: string,
  payload: DepartmentFormPayload
): Promise<AdminDepartment> {
  await delay(280);
  const idx = departmentsStore.findIndex((d) => d.id === id);
  if (idx < 0) throw new Error('Département introuvable');
  if (payload.level === 'branche' && payload.parentId === id) {
    throw new Error('Un département ne peut pas être son propre parent');
  }
  const updated: AdminDepartment = {
    ...departmentsStore[idx],
    name: payload.name.trim(),
    type: payload.type,
    level: payload.level,
    parentId: payload.level === 'branche' ? payload.parentId : undefined,
    vehicleIds: payload.vehicleIds,
  };
  departmentsStore = departmentsStore.map((d) => (d.id === id ? updated : d));
  return updated;
}

export async function deleteDepartment(id: string): Promise<void> {
  await delay(200);
  if (departmentsStore.some((d) => d.parentId === id)) {
    throw new Error('Supprimez d’abord les départements branches enfants');
  }
  departmentsStore = departmentsStore.filter((d) => d.id !== id);
}

export async function fetchSpecialties() {
  await delay(80);
  return MOCK_SPECIALTIES;
}

export async function fetchAdminVehicles() {
  await delay(80);
  return MOCK_ADMIN_VEHICLES;
}

/** Test helper — reset stores between Storybook/tests if needed. */
export function resetAdminStores() {
  accountsStore = structuredClone(INITIAL_ACCOUNTS);
  departmentsStore = structuredClone(INITIAL_DEPARTMENTS);
}
