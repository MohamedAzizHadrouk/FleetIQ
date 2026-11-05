import {
  CheckCircle,
  Eye,
  Navigation,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FleetAlert } from '@/types/alerts';

interface AlertCardActionsProps {
  alert: FleetAlert;
  onResolve: (id: string) => void;
  onOpenVehicle: (vehicleId: string) => void;
  onOpenMap?: (vehicleId: string, coords: [number, number]) => void;
  onViewTimeline: (vehicleId: string) => void;
}

export function AlertCardActions({
  alert,
  onResolve,
  onOpenVehicle,
  onOpenMap,
  onViewTimeline,
}: AlertCardActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
      {alert.status !== 'resolved' && (
        <Button size="sm" variant="outline" onClick={() => onResolve(alert.id)}>
          <CheckCircle className="w-3.5 h-3.5 mr-1" />
          Résoudre
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={() => onOpenVehicle(alert.vehicleId)}>
        <Eye className="w-3.5 h-3.5 mr-1" />
        Véhicule
      </Button>
      {alert.coordinates && onOpenMap && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const coords = alert.coordinates;
            if (coords) onOpenMap(alert.vehicleId, coords);
          }}
        >
          <Navigation className="w-3.5 h-3.5 mr-1" />
          Carte
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={() => onViewTimeline(alert.vehicleId)}>
        <Clock className="w-3.5 h-3.5 mr-1" />
        Timeline
      </Button>
    </div>
  );
}
