import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { MapLegend } from './MapLegend';

const meta = {
  component: MapLegend,
  tags: ['ai-generated'],
} satisfies Meta<typeof MapLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Légende')).toBeVisible();
  },
};

export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const row = canvas.getByText('Circulation').closest('div');
    const dot = row?.querySelector('span');
    if (!dot) throw new Error('Legend status dot not found');
    // MapLegend uses bg-emerald-500 for vehicles in circulation.
    await expect(getComputedStyle(dot).backgroundColor).toBe('rgb(16, 185, 129)');
  },
};
