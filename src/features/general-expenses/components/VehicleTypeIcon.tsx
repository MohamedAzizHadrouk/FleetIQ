import { Bike, Bus, Car, Truck, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VehicleTypeKey } from '../constants';

const ICONS: Record<VehicleTypeKey, LucideIcon> = {
  Voiture: Car,
  Fourgon: Bus,
  'Pick-up': Truck,
  Moto: Bike,
};

interface VehicleTypeIconProps {
  type?: string | null;
  className?: string;
  showLabel?: boolean;
}

export function VehicleTypeIcon({
  type,
  className,
  showLabel = false,
}: VehicleTypeIconProps) {
  const key = (type && type in ICONS ? type : 'Voiture') as VehicleTypeKey;
  const Icon = ICONS[key];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 text-slate-500',
        className
      )}
      title={key}
      aria-label={key}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {showLabel && (
        <span className="text-[11px] font-medium text-slate-500">{key}</span>
      )}
    </span>
  );
}
