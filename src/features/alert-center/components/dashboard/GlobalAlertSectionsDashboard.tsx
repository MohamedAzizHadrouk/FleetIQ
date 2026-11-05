import { useState } from 'react';
import type { AlertType } from '@/types/alerts';
import type { AlertCenterSectionId } from '../../constants/alert-config-sections';
import { ALERT_CENTER_SECTIONS } from '../../constants/alert-config-sections';
import type { BiKpis } from '../../mocks/mockBiKpis';
import { BiKpiStrip } from '../bi/BiKpiStrip';
import { AlertSectionPanel } from './AlertSectionPanel';
import { SectionAlertVehiclesDialog } from './SectionAlertVehiclesDialog';
import { AlertCenterStatsPanel } from './AlertCenterStatsPanel';

interface GlobalAlertSectionsDashboardProps {
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onSelectVehicle?: (vehicleId: string) => void;
  biOn?: boolean;
  biKpis?: BiKpis;
  onInspectVehicle?: (plate: string) => void;
}

export function GlobalAlertSectionsDashboard({
  onNavigateToVehicle,
  biOn = false,
  biKpis,
  onInspectVehicle,
}: GlobalAlertSectionsDashboardProps) {
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<AlertCenterSectionId | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectAlertType = (alertType: AlertType, sectionId: AlertCenterSectionId) => {
    setSelectedAlertType(alertType);
    setSelectedSectionId(sectionId);
    setDialogOpen(true);
  };

  const openSos = () => {
    setSelectedAlertType('sos');
    setSelectedSectionId('security');
    setDialogOpen(true);
  };

  return (
    <>
      <div className="w-full space-y-3">
        <AlertCenterStatsPanel onSosClick={openSos} onInspectVehicle={onInspectVehicle} />
        {biOn && biKpis ? <BiKpiStrip data={biKpis} /> : null}
        <div className="w-full space-y-3">
          {ALERT_CENTER_SECTIONS.map((section, index) => (
            <AlertSectionPanel
              key={section.id}
              section={section}
              defaultOpen={index < 2}
              biOn={biOn}
              onSelectAlertType={handleSelectAlertType}
            />
          ))}
        </div>
      </div>

      <SectionAlertVehiclesDialog
        alertType={selectedAlertType}
        sectionId={selectedSectionId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onNavigateToVehicle={onNavigateToVehicle}
      />
    </>
  );
}
