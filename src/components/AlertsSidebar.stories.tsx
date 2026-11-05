import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { AlertsSidebar } from './AlertsSidebar';

const meta = {
  component: AlertsSidebar,
  tags: ['ai-generated'],
  args: {
    activeSection: 'dashboard',
    onSectionChange: fn(),
  },
} satisfies Meta<typeof AlertsSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DashboardActive: Story = {};

export const AlertsActive: Story = {
  args: {
    activeSection: 'alerts',
  },
};

export const SwitchToMailSms: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /envoi mail\/sms/i }));
    await expect(args.onSectionChange).toHaveBeenCalledWith('mail-sms');
  },
};
