import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FleetStatusVehicleItem } from '@/types/alerts';
import { cn } from '@/lib/utils';

export type FleetStatusDialogVariant = 'online' | 'offline' | 'sos';

const TITLES: Record<FleetStatusDialogVariant, string> = {
  online: 'Véhicules en ligne',
  offline: 'Véhicules hors ligne',
  sos: 'Alertes SOS actives',
};

const DESCRIPTIONS: Record<FleetStatusDialogVariant, string> = {
  online: 'Véhicules actifs ou à l\'arrêt, en communication avec la plateforme',
  offline: 'Véhicules sans communication récente',
  sos: 'Véhicules avec un signal SOS actif nécessitant une intervention',
};

interface FleetStatusListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: FleetStatusDialogVariant | null;
  vehicles: FleetStatusVehicleItem[];
  onSelectVehicle: (vehicleId: string) => void;
}

export function FleetStatusListDialog({
  open,
  onOpenChange,
  variant,
  vehicles,
  onSelectVehicle,
}: FleetStatusListDialogProps) {
  if (!variant) return null;

  const handleSelect = (vehicleId: string) => {
    onSelectVehicle(vehicleId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{TITLES[variant]}</DialogTitle>
          <DialogDescription>{DESCRIPTIONS[variant]}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[min(60vh,400px)] px-6 py-4">
          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Aucun véhicule dans cette catégorie
            </p>
          ) : (
            <ul className="space-y-1">
              {vehicles.map((v) => (
                <li key={v.vehicleId}>
                  <button
                    type="button"
                    onClick={() => handleSelect(v.vehicleId)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border border-slate-200',
                      'hover:bg-slate-50 hover:border-blue-200 transition-colors'
                    )}
                  >
                    <p className="font-medium text-sm text-slate-900">{v.vehicleName}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                      {v.licensePlate && <span>{v.licensePlate}</span>}
                      {v.driverName && <span>{v.driverName}</span>}
                    </div>
                    {v.detail && (
                      <p className="text-xs text-slate-500 mt-1 truncate">{v.detail}</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
