import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeAccountPassword,
  createAccount,
  createDepartment,
  deleteAccount,
  deleteDepartment,
  fetchAccounts,
  fetchAccountsKpis,
  fetchAdminVehicles,
  fetchAllDepartments,
  fetchDepartments,
  fetchDepartmentsKpis,
  fetchSpecialties,
  updateAccount,
  updateDepartment,
} from '../api/admin-api';
import type {
  AccountFormPayload,
  AccountsListParams,
  DepartmentFormPayload,
  DepartmentsListParams,
} from '../types/admin.types';

export const adminKeys = {
  all: ['admin'] as const,
  accounts: (params: AccountsListParams) =>
    [...adminKeys.all, 'accounts', params] as const,
  accountsKpis: () => [...adminKeys.all, 'accountsKpis'] as const,
  departments: (params: DepartmentsListParams) =>
    [...adminKeys.all, 'departments', params] as const,
  departmentsAll: () => [...adminKeys.all, 'departmentsAll'] as const,
  departmentsKpis: () => [...adminKeys.all, 'departmentsKpis'] as const,
  specialties: () => [...adminKeys.all, 'specialties'] as const,
  vehicles: () => [...adminKeys.all, 'vehicles'] as const,
};

export function useAccounts(params: AccountsListParams) {
  return useQuery({
    queryKey: adminKeys.accounts(params),
    queryFn: () => fetchAccounts(params),
  });
}

export function useAccountsKpis() {
  return useQuery({
    queryKey: adminKeys.accountsKpis(),
    queryFn: fetchAccountsKpis,
  });
}

export function useAllDepartments() {
  return useQuery({
    queryKey: adminKeys.departmentsAll(),
    queryFn: fetchAllDepartments,
  });
}

export function useDepartments(params: DepartmentsListParams) {
  return useQuery({
    queryKey: adminKeys.departments(params),
    queryFn: () => fetchDepartments(params),
  });
}

export function useDepartmentsKpis() {
  return useQuery({
    queryKey: adminKeys.departmentsKpis(),
    queryFn: fetchDepartmentsKpis,
  });
}

export function useSpecialties() {
  return useQuery({
    queryKey: adminKeys.specialties(),
    queryFn: fetchSpecialties,
  });
}

export function useAdminVehicles() {
  return useQuery({
    queryKey: adminKeys.vehicles(),
    queryFn: fetchAdminVehicles,
  });
}

function invalidateAccounts(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: [...adminKeys.all, 'accounts'] });
  qc.invalidateQueries({ queryKey: adminKeys.accountsKpis() });
}

function invalidateDepartments(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: [...adminKeys.all, 'departments'] });
  qc.invalidateQueries({ queryKey: adminKeys.departmentsAll() });
  qc.invalidateQueries({ queryKey: adminKeys.departmentsKpis() });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AccountFormPayload) => createAccount(payload),
    onSuccess: () => invalidateAccounts(qc),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AccountFormPayload }) =>
      updateAccount(id, payload),
    onSuccess: () => invalidateAccounts(qc),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => invalidateAccounts(qc),
  });
}

export function useChangeAccountPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      changeAccountPassword(id, password),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: DepartmentFormPayload) => createDepartment(payload),
    onSuccess: () => invalidateDepartments(qc),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: DepartmentFormPayload;
    }) => updateDepartment(id, payload),
    onSuccess: () => invalidateDepartments(qc),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => invalidateDepartments(qc),
  });
}
