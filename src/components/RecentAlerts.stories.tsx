import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { RecentAlerts } from './RecentAlerts';
import type { Alert } from '../types/alerts';

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'speeding',
    vehicleId: '1',
    vehicleName: 'Fleet-001',
    severity: 'critical',
    message: '142 km/h détecté sur A1',
    timestamp: 'Il y a 5 min',
    isRead: false,
  },
  {
    id: '2',
    type: 'fuel',
    vehicleId: '3',
    vehicleName: 'Fleet-003',
    severity: 'warning',
    message: 'Carburant à 12%',
    timestamp: 'Il y a 15 min',
    isRead: false,
  },
  {
    id: '3',
    type: 'maintenance',
    vehicleId: '7',
    vehicleName: 'Fleet-007',
    severity: 'info',
    message: 'Révision dans 200 km',
    timestamp: 'Il y a 1h',
    isRead: true,
  },
];

const meta = {
  component: RecentAlerts,
  tags: ['ai-generated'],
  args: {
    alerts: mockAlerts,
    onMarkAsRead: fn(),
    onDismiss: fn(),
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RecentAlerts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAlerts: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('2 alerte(s) non lue(s)')).toBeVisible();
    await waitFor(
      () => expect(canvas.getByText('142 km/h détecté sur A1')).toBeVisible(),
      { timeout: 5000 },
    );
  },
};

export const Empty: Story = {
  args: {
    alerts: [],
  },
};

export const SingleCritical: Story = {
  args: {
    alerts: [mockAlerts[0]],
  },
};
