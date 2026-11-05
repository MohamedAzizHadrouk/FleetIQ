import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Gauge, User, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { FleetAlert } from '@/types/alerts';
import { getPriorityConfig } from '@/design-system/severity';
import { CATEGORY_LABELS } from '@/design-system/alert-categories';
import { getAlertTypeLabel } from '../../constants/alert-type-registry';
import { AlertCardActions } from './AlertCardActions';
import { AlertTypeIcon } from '../shared/AlertTypeIcon';

interface AlertCardProps {
  alert: FleetAlert;
  index?: number;
  onResolve: (id: string) => void;
  onOpenVehicle: (vehicleId: string) => void;
  onOpenMap?: (vehicleId: string, coords: [number, number]) => void;
  onViewTimeline: (vehicleId: string) => void;
}

export function AlertCard({
  alert,
  index = 0,
  onResolve,
  onOpenVehicle,
  onOpenMap,
  onViewTimeline,
}: AlertCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = getPriorityConfig(alert.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      layout
    >
      <Card
        className={cn(
          'overflow-hidden border-l-4 transition-shadow hover:shadow-elevated',
          config.borderColor,
          !alert.isRead && 'ring-1 ring-blue-100'
        )}
      >
        <button
          className="w-full text-left p-4"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <div className="flex items-start gap-3">
            <AlertTypeIcon alertType={alert.type} severity={alert.severity} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant={config.badgeVariant}>{config.label}</Badge>
                <Badge variant="outline">{getAlertTypeLabel(alert.type)}</Badge>
                <Badge variant="secondary">{CATEGORY_LABELS[alert.category]}</Badge>
                {alert.status === 'resolved' && (
                  <Badge variant="success">Résolue</Badge>
                )}
              </div>
              <p className="font-semibold text-slate-900 mb-1">{alert.message}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {alert.vehicleName}
                </span>
                {alert.driverName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {alert.driverName}
                  </span>
                )}
                <span>{alert.timestamp}</span>
                {alert.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {alert.location}
                  </span>
                )}
                {alert.speed !== undefined && alert.speed > 0 && (
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> {alert.speed} km/h
                  </span>
                )}
              </div>
            </div>
            <ChevronDown
              className={cn('w-5 h-5 text-slate-400 transition-transform shrink-0', expanded && 'rotate-180')}
            />
          </div>
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-4"
            >
              <div className="bg-slate-50 rounded-lg p-3 mb-3 text-sm">
                <p className="font-medium text-slate-700 mb-1">Action recommandée</p>
                <p className="text-slate-600">{alert.recommendedAction}</p>
                {alert.missionName && (
                  <p className="text-xs text-muted-foreground mt-2">Mission: {alert.missionName} · {alert.fleetName}</p>
                )}
              </div>
              <AlertCardActions
                alert={alert}
                onResolve={onResolve}
                onOpenVehicle={onOpenVehicle}
                onOpenMap={onOpenMap}
                onViewTimeline={onViewTimeline}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
