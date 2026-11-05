import type { VehicleAlertSummary } from '@/types/alerts';
import { VehicleAlertCard } from './VehicleAlertCard';
import { AlertEmptyState } from '../states/AlertEmptyState';
import { AlertErrorState } from '../states/AlertErrorState';
import { Skeleton } from '@/components/ui/skeleton';

interface VehicleAlertCardListProps {
  summaries?: VehicleAlertSummary[];
  isLoading?: boolean;
  isError?: boolean;
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicleId: string) => void;
  onRetry?: () => void;
}

export function VehicleAlertCardList({
  summaries,
  isLoading,
  isError,
  selectedVehicleId,
  onSelectVehicle,
  onRetry,
}: VehicleAlertCardListProps) {
  if (isLoading) {
    return (
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <AlertErrorState onRetry={onRetry} />;
  }

  if (!summaries?.length) {
    return (
      <AlertEmptyState
        title="Aucun véhicule trouvé"
        description="Ajustez vos filtres pour afficher d'autres véhicules."
      />
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
      {summaries.map((summary, index) => (
        <VehicleAlertCard
          key={summary.vehicleId}
          summary={summary}
          index={index}
          isSelected={selectedVehicleId === summary.vehicleId}
          onClick={() => {
            if (selectedVehicleId === summary.vehicleId) {
              onSelectVehicle?.('');
            } else {
              onSelectVehicle?.(summary.vehicleId);
            }
          }}
        />
      ))}
    </div>
  );
}
