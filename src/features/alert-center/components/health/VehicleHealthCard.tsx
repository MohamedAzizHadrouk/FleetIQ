import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VehicleHealthSnapshot } from '@/types/alerts';
import { VEHICLE_INDICATORS } from '@/design-system/vehicle-indicators';
import { HealthIndicatorLed } from './HealthIndicatorLed';

interface VehicleHealthCardProps {
  health: VehicleHealthSnapshot;
  onClick?: () => void;
  index?: number;
}

export function VehicleHealthCard({ health, onClick, index = 0 }: VehicleHealthCardProps) {
  const scoreColor =
    health.overallScore >= 80 ? 'text-emerald-600' :
    health.overallScore >= 60 ? 'text-amber-600' : 'text-rose-600';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card
        className={cn(
          'p-4 cursor-pointer hover:shadow-elevated transition-all border-2',
          health.overallScore < 60 ? 'border-rose-200' : 'border-transparent hover:border-blue-200'
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-slate-900">{health.vehicleName}</p>
            <p className="text-xs text-muted-foreground">{health.driverName}</p>
          </div>
          <div className="text-right">
            <p className={cn('text-lg font-bold', scoreColor)}>{health.overallScore}</p>
            <p className="text-[10px] text-muted-foreground">Score santé</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={health.status === 'active' ? 'success' : health.status === 'idle' ? 'medium' : 'outline'}>
            {health.status === 'active' ? 'En ligne' : health.status === 'idle' ? 'Inactif' : 'Hors ligne'}
          </Badge>
          {health.alertCount > 0 && (
            <Badge variant="critical">{health.alertCount} alerte(s)</Badge>
          )}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {VEHICLE_INDICATORS.map((ind) => (
            <HealthIndicatorLed
              key={ind.type}
              label={ind.label}
              shortLabel={ind.shortLabel}
              status={health.indicators[ind.type]}
              showPulse={health.indicators[ind.type] === 'critical'}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
