import { AlertCenterPage, AlertCenterProvider } from '@/features/alert-center';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Vehicle } from '../types';

interface AlertsContentProps {
  vehicles: Vehicle[];
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  hideBadges?: boolean;
  onOpenHistory?: (vehicleIds?: string[]) => void;
  onUnreadCountChange?: (count: number) => void;
}

export function AlertsContent({
  vehicles,
  onNavigateToVehicle,
  onOpenHistory,
  onUnreadCountChange,
}: AlertsContentProps) {
  return (
    <div className="h-full">
      <AlertCenterProvider>
        <TooltipProvider delayDuration={200}>
          <AlertCenterPage
            vehicles={vehicles}
            onNavigateToVehicle={onNavigateToVehicle}
            onOpenHistory={onOpenHistory}
            onUnreadCountChange={onUnreadCountChange}
          />
        </TooltipProvider>
      </AlertCenterProvider>
    </div>
  );
}
