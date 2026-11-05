import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { VehicleCard } from './VehicleCard';
import { mockVehicle } from '../test/mockVehicle';

const meta = {
  component: VehicleCard,
  tags: ['ai-generated'],
  args: {
    vehicle: mockVehicle,
    onClick: fn(),
  },
} satisfies Meta<typeof VehicleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(mockVehicle.name)).toBeVisible();
    await expect(canvas.getByText(mockVehicle.driver)).toBeVisible();
  },
};

export const Idle: Story = {
  args: {
    vehicle: { ...mockVehicle, status: 'idle', speed: 0 },
  },
};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};
