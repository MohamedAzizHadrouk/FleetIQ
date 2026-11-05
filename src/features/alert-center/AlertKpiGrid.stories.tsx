import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { AlertKpiGrid } from '@/features/alert-center/components/kpi/AlertKpiGrid';
import type { AlertKpiData } from '@/types/alerts';

const mockKpis: AlertKpiData = {
  critical: 4,
  high: 12,
  medium: 28,
  resolvedToday: 15,
  vehiclesInAlert: 18,
  total: 44,
  trends: {
    critical: 12,
    high: -5,
    medium: 3,
    resolvedToday: 18,
    vehiclesInAlert: -2,
    total: 5,
  },
};

const meta: Meta<typeof AlertKpiGrid> = {
  title: 'Alert Center/AlertKpiGrid',
  component: AlertKpiGrid,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-6 bg-slate-50">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AlertKpiGrid>;

export const Default: Story = {
  args: { data: mockKpis },
};

export const Loading: Story = {
  args: { isLoading: true },
};
