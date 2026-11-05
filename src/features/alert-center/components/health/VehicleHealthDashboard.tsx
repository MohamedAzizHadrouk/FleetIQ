import type { VehicleHealthSnapshot } from '@/types/alerts';
import { VehicleHealthCard } from './VehicleHealthCard';
import { Skeleton } from '@/components/ui/skeleton';

interface VehicleHealthDashboardProps {
  health?: VehicleHealthSnapshot[];
  isLoading?: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

export function VehicleHealthDashboard({
  health,
  isLoading,
  onVehicleClick,
}: VehicleHealthDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-slate-200 bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Santé véhicules</h2>
        <p className="text-sm text-muted-foreground">Tableau de bord cockpit — cliquez pour les détails</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto scrollbar-hide">
        {health?.map((h, i) => (
          <VehicleHealthCard
            key={h.vehicleId}
            health={h}
            index={i}
            onClick={() => onVehicleClick?.(h.vehicleId)}
          />
        ))}
      </div>
    </div>
  );
}
