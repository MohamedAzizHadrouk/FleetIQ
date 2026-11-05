import type L from 'leaflet';

/** Width of the vehicle card docked on the map */
export const VEHICLE_CARD_W = 408;

/**
 * Left offset (px, relative to the map container) where the vehicle card docks:
 * just right of the left panel (vehicle list, forms) when it is open and there is
 * room, otherwise the map's top-left corner.
 */
export function cardDockLeft(map: L.Map): number {
  const bounds = map.getContainer().getBoundingClientRect();
  const panel = document.querySelector('[data-left-panel]')?.getBoundingClientRect();
  const panelRight = panel && panel.width > 0 ? panel.right - bounds.left : 0;
  if (panelRight > 0 && panelRight + 16 + VEHICLE_CARD_W + 16 <= bounds.width) return panelRight + 16;
  return 16;
}

/** Map pixels covered on the left by the docked card (0 when the map is too narrow). */
export function cardCoveredWidth(map: L.Map): number {
  const width = map.getContainer().clientWidth;
  const covered = cardDockLeft(map) + VEHICLE_CARD_W + 16;
  return width - covered > 240 ? covered : 0;
}
