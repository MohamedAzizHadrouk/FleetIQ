import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { DateTimePicker } from './DateTimePicker';

const meta = {
  component: DateTimePicker,
  tags: ['ai-generated'],
  args: {
    value: '',
    onChange: fn(),
    placeholder: 'Sélectionner une date',
    label: 'Période',
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button'));
    await waitFor(() => expect(canvas.getByText('Dim')).toBeVisible(), {
      timeout: 5000,
    });
  },
};

export const WithValue: Story = {
  args: {
    value: '2024/04/01 12:00:00',
  },
};

export const NoLabel: Story = {
  args: {
    label: undefined,
    placeholder: 'Choisir date et heure',
  },
};
