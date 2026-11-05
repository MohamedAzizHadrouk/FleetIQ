import { AlertConfigAdminPage } from '@/features/admin/alert-config/AlertConfigAdminPage';

interface AlertConfigurationPageProps {
  vehicles?: unknown[];
  onBack?: () => void;
  initialVehicleId?: string | null;
}

/** Thin wrapper — Webtrace-parity equipment alert configuration. */
export function AlertConfigurationPage({
  initialVehicleId = null,
}: AlertConfigurationPageProps) {
  return <AlertConfigAdminPage initialVehicleId={initialVehicleId} />;
}
