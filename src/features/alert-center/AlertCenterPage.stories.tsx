import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { mockVehicles } from '@/test/mockVehicle';
import { initAlertStore } from '@/features/alert-center/api/alert-api';
import { AlertCenterPage } from '@/features/alert-center/components/layout/AlertCenterPage';
import { AlertCenterProvider } from '@/features/alert-center/context/AlertCenterContext';
import { TooltipProvider } from '@/components/ui/tooltip';

initAlertStore(mockVehicles);

const meta: Meta<typeof AlertCenterPage> = {
  title: 'Alert Center/AlertCenterPage',
  component: AlertCenterPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <AlertCenterProvider>
          <TooltipProvider>
            <div className="h-screen">
              <Story />
            </div>
          </TooltipProvider>
        </AlertCenterProvider>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AlertCenterPage>;

export const Default: Story = {
  args: {
    vehicles: mockVehicles,
    onNavigateToVehicle: fn(),
  },
};
