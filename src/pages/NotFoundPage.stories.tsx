import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { NotFoundPage } from './NotFoundPage';

const meta = {
  component: NotFoundPage,
  tags: ['ai-generated'],
  args: {
    onNavigateToDashboard: fn(),
    onNavigateToLogin: fn(),
  },
  parameters: {
    layout: 'fullscreen',
    a11y: { disable: true },
  },
} satisfies Meta<typeof NotFoundPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Signal Perdu')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: /retour au tableau de bord/i }),
    ).toBeVisible();
  },
};

export const NavigateToLogin: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /retour à la connexion/i }),
    );
    await expect(args.onNavigateToLogin).toHaveBeenCalled();
  },
};
