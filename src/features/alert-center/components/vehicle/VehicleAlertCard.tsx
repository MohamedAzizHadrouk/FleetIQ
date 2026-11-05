import { motion } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VehicleAlertSummary } from '@/types/alerts';
import { DashboardIndicatorGrid } from './DashboardIndicatorGrid';
import { StatusBadgeWithTooltip } from '../shared/StatusBadgeWithTooltip';

interface VehicleAlertCardProps {
  summary: VehicleAlertSummary;
  isSelected?: boolean;
  onClick?: () => void;
  index?: number;
}

export function VehicleAlertCard({
  summary,
  isSelected,
  onClick,
  index = 0,
}: VehicleAlertCardProps) {
  return (
    <motion.div
      id={`vehicle-card-${summary.vehicleId}`}
      className="h-full"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ y: -2 }}
    >
      <Card
        className={cn(
          'p-3 h-full flex flex-col cursor-pointer transition-all border-2 hover:shadow-elevated',
          isSelected
            ? 'border-blue-500 bg-blue-50/30 shadow-md'
            : 'border-transparent hover:border-slate-200',
          summary.criticalCount > 0 && !isSelected && 'border-rose-100'
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        aria-pressed={isSelected}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-semibold text-sm text-slate-900 truncate">{summary.vehicleName}</h3>
              <span className="text-[10px] text-muted-foreground font-mono truncate">{summary.licensePlate}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{summary.driverName}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <StatusBadgeWithTooltip kind="vehicle" value={summary.status} />
            <StatusBadgeWithTooltip kind="gps" value={summary.gpsStatus} />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">{summary.lastCommunication}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{summary.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {summary.criticalCount > 0 && (
            <Badge variant="critical" className="text-[10px] h-5">{summary.criticalCount} Crit.</Badge>
          )}
          {summary.warningCount > 0 && (
            <Badge variant="high" className="text-[10px] h-5">{summary.warningCount} Avert.</Badge>
          )}
          {summary.infoCount > 0 && (
            <Badge variant="info" className="text-[10px] h-5">{summary.infoCount} Info</Badge>
          )}
          {summary.totalAlerts === 0 && (
            <Badge variant="success" className="text-[10px] h-5">OK</Badge>
          )}
        </div>

        <div className="mt-auto pt-1">
          <DashboardIndicatorGrid indicators={summary.dashboardIndicators} columns={5} size="sm" />
        </div>
      </Card>
    </motion.div>
  );
}
