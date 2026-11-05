import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { FleetAlert } from '@/types/alerts';
import { AlertCard } from '@/features/alert-center/components/feed/AlertCard';

const mockAlert: FleetAlert = {
  id: '1',
  type: 'sos',
  vehicleId: '1',
  vehicleName: 'Fleet-001',
  severity: 'critical',
  message: 'Signal SOS activé par le conducteur',
  timestamp: 'Il y a 5 min',
  createdAt: new Date().toISOString(),
  location: 'Gare de Lyon, Paris',
  isRead: false,
  category: 'driving_quality',
  status: 'active',
  priority: 'critical',
  driverName: 'Jean Dupont',
  fleetName: 'Flotte Nord',
  speed: 0,
  missionName: 'Livraison Paris',
  coordinates: [48.8443, 2.3749],
  recommendedAction: 'Appeler le conducteur immédiatement',
  autoResolvable: false,
  businessImpact: 'high',
};

const meta: Meta<typeof AlertCard> = {
  title: 'Alert Center/AlertCard',
  component: AlertCard,
  args: {
    alert: mockAlert,
    onResolve: fn(),
    onOpenVehicle: fn(),
    onViewTimeline: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AlertCard>;

export const CriticalSOS: Story = {};

export const Resolved: Story = {
  args: {
    alert: { ...mockAlert, status: 'resolved', isRead: true },
  },
};
