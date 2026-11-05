import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { TableFooter } from './TableFooter';

const meta = {
  component: TableFooter,
  tags: ['ai-generated'],
  args: {
    currentPage: 1,
    totalItems: 47,
    itemsPerPage: 10,
    onPageChange: fn(),
    onItemsPerPageChange: fn(),
    onExportPdf: fn(),
    onExportExcel: fn(),
  },
} satisfies Meta<typeof TableFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('1 - 10 of 47')).toBeVisible();
    const buttons = canvas.getAllByRole('button');
    const prevButton = buttons[buttons.length - 2];
    await expect(prevButton).toBeDisabled();
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 3,
  },
};

export const EmptyResults: Story = {
  args: {
    totalItems: 0,
    currentPage: 1,
  },
};
