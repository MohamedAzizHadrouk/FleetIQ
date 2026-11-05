import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { TopBar } from './TopBar';

const meta = {
  component: TopBar,
  tags: ['ai-generated'],
  args: {
    activeSection: 'dashboard',
    onSectionChange: fn(),
    unreadAlertsCount: 3,
    hideBadges: false,
    onToggleHideBadges: fn(),
  },
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop',
    },
  },
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DashboardActive: Story = {};

export const WithUnreadAlerts: Story = {
  args: {
    activeSection: 'suivie',
    unreadAlertsCount: 12,
  },
};

export const BadgesHidden: Story = {
  args: {
    hideBadges: true,
  },
};

export const NavigateToParc: Story = {
  args: {
    activeSection: 'dashboard',
    onSectionChange: fn(),
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /parc/i }));
    await expect(args.onSectionChange).toHaveBeenCalledWith('parc');
  },
};
