export type DepartmentLevel = 'racine' | 'branche';
export type DepartmentType = 'simple' | 'groupe';

export type AccountScopeType = 'all_fleet' | 'specific_departments' | 'specialty';

export interface AdminDepartment {
  id: string;
  name: string;
  type: DepartmentType;
  level: DepartmentLevel;
  parentId?: string;
  vehicleIds: string[];
}

export interface AdminVehicleOption {
  id: string;
  name: string;
}

export interface AccessPageNode {
  id: string;
  label: string;
  children: AccessPageNode[];
}

export interface AdminSpecialty {
  id: string;
  name: string;
}

export interface AdminAccount {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  scopeType: AccountScopeType;
  departmentIds: string[];
  specialtyIds: string[];
  accessPageIds: string[];
  createdAt: string;
  lastActiveAt: string | null;
}

export interface AccountFormPayload {
  login: string;
  firstName: string;
  lastName: string;
  password?: string;
  scopeType: AccountScopeType;
  departmentIds: string[];
  specialtyIds: string[];
  accessPageIds: string[];
}

export interface DepartmentFormPayload {
  name: string;
  type: DepartmentType;
  level: DepartmentLevel;
  parentId?: string;
  vehicleIds: string[];
}

export interface AccountsListParams {
  page: number;
  pageSize: number;
  search?: string;
  departmentIds?: string[];
}

export interface DepartmentsListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AccountsKpis {
  total: number;
  activeThisMonth: number;
  newLast30Days: number;
}

export interface DepartmentsKpis {
  total: number;
  roots: number;
  branches: number;
}
