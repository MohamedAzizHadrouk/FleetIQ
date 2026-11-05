import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { ScopeSelectorPanel } from './components/config/ScopeSelectorPanel';
import type { Vehicle } from '@/types';

const mockVehicles: Vehicle[] = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1),
  name: `Fleet-00${i + 1}`,
  status: 'active',
  speed: 45,
  location: 'Tunis',
  coordinates: [36.8, 10.18],
  lastUpdate: 'Il y a 2 min',
  driver: 'Conducteur',
  batteryLevel: 85,
}));

const meta: Meta<typeof ScopeSelectorPanel> = {
  title: 'Alert Center/ScopeSelectorPanel',
  component: ScopeSelectorPanel,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="h-[500px] w-[280px] border">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ScopeSelectorPanel>;

export const Default: Story = {
  args: {
    vehicles: mockVehicles,
    selectedScopes: [],
    onSelectionChange: () => {},
  },
};
