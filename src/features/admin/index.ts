export type {
  AdminAccount,
  AdminDepartment,
  AccountFormPayload,
  DepartmentFormPayload,
  AccessPageNode,
} from './types/admin.types';

export { AccountsPage } from './components/accounts/AccountsPage';
export { DepartmentsPage } from './components/departments/DepartmentsPage';
export { AlertConfigAdminPage } from './alert-config/AlertConfigAdminPage';
export { AlertMailSmsPage } from './alert-mail-sms/AlertMailSmsPage';
export { ACCESS_PAGES } from './mocks/access-pages';
export {
  useAccounts,
  useDepartments,
  useAllDepartments,
  adminKeys,
} from './hooks/useAdminQueries';
