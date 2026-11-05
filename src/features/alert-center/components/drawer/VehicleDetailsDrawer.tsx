import {
  Phone,
  MapPin,
  Wrench,
  CheckCircle,
  User,
  Truck,
} from 'lucide-react';
import type { Vehicle } from '@/types';
import type { FleetAlert, VehicleHealthSnapshot } from '@/types/alerts';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { VEHICLE_INDICATORS } from '@/design-system/vehicle-indicators';
import { HealthIndicatorLed } from '../health/HealthIndicatorLed';
import { EventTimeline } from '../timeline/EventTimeline';
import { useVehicleTimeline } from '../../hooks/useAlertQueries';
import { DrawerSkeleton } from '../states/AlertFeedSkeleton';

interface VehicleDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle;
  health?: VehicleHealthSnapshot;
  alert?: FleetAlert | null;
  onResolve?: (alertId: string) => void;
  onOpenMap?: (vehicleId: string, coords: [number, number]) => void;
}

export function VehicleDetailsDrawer({
  open,
  onOpenChange,
  vehicle,
  health,
  alert,
  onResolve,
  onOpenMap,
}: VehicleDetailsDrawerProps) {
  const { data: timeline, isLoading: timelineLoading } = useVehicleTimeline(
    open && vehicle ? vehicle.id : null
  );

  if (!vehicle) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            {vehicle.name}
          </SheetTitle>
          <SheetDescription>
            {vehicle.driver} · {health?.fleetName ?? 'Flotte'}
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={vehicle.status === 'active' ? 'success' : 'outline'}>
              {vehicle.status === 'active' ? 'En ligne' : vehicle.status}
            </Badge>
            {health && (
              <Badge variant={health.overallScore >= 70 ? 'success' : 'critical'}>
                Score: {health.overallScore}
              </Badge>
            )}
            {alert?.missionName && <Badge variant="info">{alert.missionName}</Badge>}
          </div>

          <Tabs defaultValue="health">
            <TabsList className="w-full">
              <TabsTrigger value="health" className="flex-1">Santé</TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
              <TabsTrigger value="info" className="flex-1">Infos</TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="mt-4">
              {health ? (
                <div className="grid grid-cols-4 gap-4">
                  {VEHICLE_INDICATORS.map((ind) => (
                    <HealthIndicatorLed
                      key={ind.type}
                      label={ind.label}
                      shortLabel={ind.shortLabel}
                      status={health.indicators[ind.type]}
                      size="md"
                    />
                  ))}
                </div>
              ) : (
                <DrawerSkeleton />
              )}
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <EventTimeline events={timeline} isLoading={timelineLoading} />
            </TabsContent>

            <TabsContent value="info" className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{vehicle.driver}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{vehicle.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Vitesse:</span>
                <span>{vehicle.speed} km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Batterie:</span>
                <span>{vehicle.batteryLevel}%</span>
              </div>
              {alert && (
                <>
                  <Separator />
                  <p className="font-medium">Alerte active</p>
                  <p className="text-slate-600">{alert.message}</p>
                  <p className="text-slate-500">{alert.recommendedAction}</p>
                </>
              )}
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <Phone className="w-4 h-4 mr-1" />
              Appeler
            </Button>
            {vehicle.coordinates && onOpenMap && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenMap(vehicle.id, vehicle.coordinates)}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Carte
              </Button>
            )}
            {alert && onResolve && alert.status !== 'resolved' && (
              <Button size="sm" onClick={() => onResolve(alert.id)}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Résoudre
              </Button>
            )}
            <Button size="sm" variant="secondary">
              <Wrench className="w-4 h-4 mr-1" />
              Ticket maintenance
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
