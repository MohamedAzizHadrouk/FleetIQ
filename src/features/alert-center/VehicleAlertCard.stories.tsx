import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TooltipProvider } from '@/components/ui/tooltip';
import { VehicleAlertCard } from './components/vehicle/VehicleAlertCard';
import type { VehicleAlertSummary } from '@/types/alerts';

const mockSummary: VehicleAlertSummary = {
  vehicleId: '1',
  vehicleName: '8127 TU 226',
  licensePlate: '8127 TU 226',
  driverName: 'Jean Dupont',
  fleetName: 'Flotte Nord',
  status: 'active',
  gpsStatus: 'online',
  lastCommunication: 'Il y a 2 min',
  location: 'Rue de Rivoli, Paris',
  coordinates: [48.8566, 2.3522],
  ignitionOn: true,
  isMoving: true,
  criticalCount: 1,
  warningCount: 2,
  infoCount: 1,
  totalAlerts: 4,
  overallScore: 72,
  dashboardIndicators: {
    handbrake: { id: 'handbrake', label: 'Frein à main', status: 'inactive' },
    fuel: { id: 'fuel', label: 'Carburant', status: 'active', severity: 'warning' },
    seatbelt: { id: 'seatbelt', label: 'Ceinture', status: 'active', severity: 'warning' },
    check_engine: { id: 'check_engine', label: 'Check Engine', status: 'active', severity: 'critical' },
  },
};

const meta: Meta<typeof VehicleAlertCard> = {
  title: 'Alert Center/VehicleAlertCard',
  component: VehicleAlertCard,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="max-w-sm p-4">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof VehicleAlertCard>;

export const Default: Story = {
  args: {
    summary: mockSummary,
    onClick: fn(),
  },
};

export const Selected: Story = {
  args: {
    summary: mockSummary,
    isSelected: true,
    onClick: fn(),
  },
};

export const NoAlerts: Story = {
  args: {
    summary: {
      ...mockSummary,
      criticalCount: 0,
      warningCount: 0,
      infoCount: 0,
      totalAlerts: 0,
      dashboardIndicators: {},
    },
    onClick: fn(),
  },
};
