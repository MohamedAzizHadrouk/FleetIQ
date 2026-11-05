import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { MapControls } from './MapControls';
import type { MapOverlay } from '../types/map-overlays';

const defaultZones: MapOverlay[] = [
  {
    id: 'country-tn',
    kind: 'defaultZone',
    name: 'Tunisie',
    countryCode: 'TN',
    points: [],
    visible: false,
    readonly: true,
  },
  {
    id: 'region-tunis',
    kind: 'defaultZone',
    name: 'Tunis',
    countryCode: 'TN',
    points: [],
    visible: true,
    readonly: true,
  },
];

const meta = {
  component: MapControls,
  args: {
    basemap: 'plan',
    onBasemapChange: fn(),
    clusterVehicles: false,
    onClusterVehiclesChange: fn(),
    clusterLocations: false,
    onClusterLocationsChange: fn(),
    drawMode: null,
    onOpenManage: fn(),
    overlays: [
      ...defaultZones,
      {
        id: 'location-depot',
        kind: 'location',
        name: 'Dépôt',
        position: [36.8, 10.18],
        visible: true,
      },
    ],
    onSetOverlayVisible: fn(),
    pendingPointsCount: 0,
    onFinishDraw: fn(),
    onCancelDraw: fn(),
  },
} satisfies Meta<typeof MapControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutCountryAndRegionLayers: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Masquer / afficher les couches' })
    );
    await expect(canvas.queryByText('Tunisie')).not.toBeInTheDocument();
    await expect(canvas.queryByText('Tunis')).not.toBeInTheDocument();
    await expect(canvas.getByText('Dépôt')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Masquer tout' }));
    await expect(args.onSetOverlayVisible).toHaveBeenCalledExactlyOnceWith(
      'location-depot', false
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Afficher tout' }));
    await expect(args.onSetOverlayVisible).toHaveBeenCalledTimes(2);
    await expect(args.onSetOverlayVisible).toHaveBeenLastCalledWith(
      'location-depot', true
    );
  },
};

export const OnlyCountryAndRegionLayers: Story = {
  args: { overlays: defaultZones },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Masquer / afficher les couches' })
    );
    await expect(canvas.getByText('Aucune couche à masquer')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Masquer tout' })
    ).not.toBeInTheDocument();
  },
};
