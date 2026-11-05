import { motion, AnimatePresence } from 'framer-motion';
import { VehicleInspectorPanel } from './VehicleInspectorPanel';

interface ContextualRightPanelProps {
  selectedVehicleId: string;
  onBack: () => void;
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onOpenHistory?: (vehicleIds?: string[]) => void;
}

export function ContextualRightPanel({
  selectedVehicleId,
  onBack,
  onNavigateToVehicle,
  onOpenHistory,
}: ContextualRightPanelProps) {
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      <AnimatePresence mode="wait">
        <motion.div
          key="inspector"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="h-full min-h-0 flex flex-col overflow-hidden"
        >
          <VehicleInspectorPanel
            vehicleId={selectedVehicleId}
            onBack={onBack}
            onNavigateToVehicle={onNavigateToVehicle}
            onOpenHistory={
              onOpenHistory ? () => onOpenHistory([selectedVehicleId]) : undefined
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
