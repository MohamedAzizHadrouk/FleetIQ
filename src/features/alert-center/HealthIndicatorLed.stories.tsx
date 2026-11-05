import type { Meta, StoryObj } from '@storybook/react-vite';
import { HealthIndicatorLed } from '@/features/alert-center/components/health/HealthIndicatorLed';
import { TooltipProvider } from '@/components/ui/tooltip';

const meta: Meta<typeof HealthIndicatorLed> = {
  title: 'Alert Center/HealthIndicatorLed',
  component: HealthIndicatorLed,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  args: {
    label: 'Moteur',
    shortLabel: 'MOT',
    status: 'ok',
  },
};

export default meta;
type Story = StoryObj<typeof HealthIndicatorLed>;

export const Ok: Story = {};
export const Warning: Story = { args: { status: 'warning' } };
export const Critical: Story = { args: { status: 'critical', showPulse: true } };
export const Offline: Story = { args: { status: 'offline' } };
