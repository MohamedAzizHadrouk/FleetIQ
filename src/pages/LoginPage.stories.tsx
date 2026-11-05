import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { LoginPage } from './LoginPage';

const meta = {
  component: LoginPage,
  tags: ['ai-generated'],
  args: {
    onLogin: fn(),
    onNavigateToSignUp: fn(),
  },
  parameters: {
    layout: 'fullscreen',
    a11y: { disable: true },
  },
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FilledForm: Story = {
  parameters: {
    test: { timeout: 30000 },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.type(
      canvas.getByPlaceholderText('nom@exemple.com'),
      'admin@tunav.com',
    );
    await userEvent.type(canvas.getByPlaceholderText('••••••••'), 'secret123');
    await userEvent.click(canvas.getByRole('button', { name: /se connecter/i }));
    await waitFor(() => expect(args.onLogin).toHaveBeenCalled(), { timeout: 3000 });
  },
};

export const SignUpLink: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /créer un compte/i }));
    await expect(args.onNavigateToSignUp).toHaveBeenCalled();
  },
};
