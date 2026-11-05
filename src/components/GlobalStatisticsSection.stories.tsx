import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { GlobalStatisticsSection } from './GlobalStatisticsSection';
import { mockVehicles } from '../test/mockVehicle';

const meta = {
  component: GlobalStatisticsSection,
  tags: ['ai-generated'],
  args: {
    vehicles: mockVehicles,
    alertsCount: 8,
    criticalAlertsCount: 2,
    documentsCount: 15,
    urgentDocumentsCount: 3,
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GlobalStatisticsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Vue d'ensemble de la flotte")).toBeVisible();
    await expect(canvas.getByText("Mise à jour à l'instant")).toBeVisible();
  },
};

export const SingleVehicle: Story = {
  args: {
    vehicles: [mockVehicles[0]],
    alertsCount: 0,
    criticalAlertsCount: 0,
  },
};

export const HighAlertVolume: Story = {
  args: {
    alertsCount: 42,
    criticalAlertsCount: 11,
    urgentDocumentsCount: 9,
  },
};
