import type { VehicleIconType } from './vehicle-types';
import { getVehicleIconOption } from './vehicle-types';

/**
 * Soft-3D filled SVG bodies (viewBox 0 0 64 64) with gradients + shadow.
 * Used for map markers, info card avatar, and parc previews.
 */
function svg3dBody(id: VehicleIconType, color: string, shade: string): string {
  const uid = `v3d-${id}`;
  const commonDefs = `
    <defs>
      <linearGradient id="${uid}-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="55%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${shade}"/>
      </linearGradient>
      <linearGradient id="${uid}-glass" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#7dd3fc"/>
      </linearGradient>
      <radialGradient id="${uid}-hl" cx="35%" cy="25%" r="55%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <filter id="${uid}-sh" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity="0.25"/>
      </filter>
    </defs>
    <ellipse cx="32" cy="54" rx="18" ry="4" fill="#0f172a" opacity="0.18"/>
  `;

  switch (id) {
    case 'voiture':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <path d="M12 40c0-2 1-6 4-9l5-5h22l6 5c3 3 4 6 4 9v4H12v-4z" fill="url(#${uid}-body)"/>
          <path d="M22 26l3-5h14l4 5H22z" fill="url(#${uid}-glass)"/>
          <circle cx="20" cy="44" r="5" fill="#1e293b"/><circle cx="20" cy="44" r="2.2" fill="#94a3b8"/>
          <circle cx="44" cy="44" r="5" fill="#1e293b"/><circle cx="44" cy="44" r="2.2" fill="#94a3b8"/>
          <rect x="14" y="34" width="36" height="6" rx="2" fill="url(#${uid}-hl)"/>
        </g>`;
    case 'moto':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <circle cx="18" cy="44" r="7" fill="#1e293b"/><circle cx="18" cy="44" r="3" fill="#94a3b8"/>
          <circle cx="46" cy="44" r="7" fill="#1e293b"/><circle cx="46" cy="44" r="3" fill="#94a3b8"/>
          <path d="M22 40l8-14h8l6 10-8 2-6-6-4 8z" fill="url(#${uid}-body)"/>
          <path d="M34 26h8l2 4h-8z" fill="url(#${uid}-glass)"/>
          <rect x="30" y="22" width="3" height="10" rx="1" fill="${shade}"/>
        </g>`;
    case 'fourgon':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <path d="M10 42V22c0-2 2-4 4-4h24l10 10v14H10z" fill="url(#${uid}-body)"/>
          <path d="M38 18v10h10" fill="url(#${uid}-glass)" opacity="0.9"/>
          <rect x="14" y="24" width="10" height="8" rx="1" fill="url(#${uid}-glass)"/>
          <circle cx="20" cy="44" r="5" fill="#1e293b"/><circle cx="44" cy="44" r="5" fill="#1e293b"/>
          <circle cx="20" cy="44" r="2" fill="#94a3b8"/><circle cx="44" cy="44" r="2" fill="#94a3b8"/>
          <rect x="12" y="34" width="40" height="5" rx="1.5" fill="url(#${uid}-hl)"/>
        </g>`;
    case 'pickup':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <path d="M10 42V30h22V22c0-2 1-4 4-4h8l8 8v16H10z" fill="url(#${uid}-body)"/>
          <path d="M36 22h8l6 6h-14z" fill="url(#${uid}-glass)"/>
          <rect x="12" y="32" width="18" height="6" rx="1" fill="${shade}" opacity="0.45"/>
          <circle cx="20" cy="44" r="5" fill="#1e293b"/><circle cx="46" cy="44" r="5" fill="#1e293b"/>
          <circle cx="20" cy="44" r="2" fill="#94a3b8"/><circle cx="46" cy="44" r="2" fill="#94a3b8"/>
        </g>`;
    case 'camion':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <rect x="8" y="18" width="26" height="24" rx="2" fill="url(#${uid}-body)"/>
          <path d="M34 28h14l6 6v8H34V28z" fill="url(#${uid}-body)"/>
          <rect x="38" y="30" width="10" height="7" rx="1" fill="url(#${uid}-glass)"/>
          <circle cx="18" cy="44" r="5" fill="#1e293b"/><circle cx="46" cy="44" r="5" fill="#1e293b"/>
          <circle cx="18" cy="44" r="2" fill="#94a3b8"/><circle cx="46" cy="44" r="2" fill="#94a3b8"/>
          <rect x="10" y="20" width="22" height="8" rx="1" fill="url(#${uid}-hl)"/>
        </g>`;
    case 'bus':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <rect x="10" y="16" width="44" height="28" rx="4" fill="url(#${uid}-body)"/>
          <rect x="14" y="20" width="8" height="8" rx="1" fill="url(#${uid}-glass)"/>
          <rect x="26" y="20" width="8" height="8" rx="1" fill="url(#${uid}-glass)"/>
          <rect x="38" y="20" width="10" height="8" rx="1" fill="url(#${uid}-glass)"/>
          <circle cx="20" cy="46" r="5" fill="#1e293b"/><circle cx="44" cy="46" r="5" fill="#1e293b"/>
          <circle cx="20" cy="46" r="2" fill="#94a3b8"/><circle cx="44" cy="46" r="2" fill="#94a3b8"/>
          <rect x="12" y="32" width="40" height="5" rx="1" fill="url(#${uid}-hl)"/>
        </g>`;
    case 'taxi':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <path d="M12 40c0-2 1-6 4-9l5-5h22l6 5c3 3 4 6 4 9v4H12v-4z" fill="url(#${uid}-body)"/>
          <path d="M22 26l3-5h14l4 5H22z" fill="url(#${uid}-glass)"/>
          <rect x="26" y="16" width="12" height="5" rx="1" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
          <circle cx="20" cy="44" r="5" fill="#1e293b"/><circle cx="44" cy="44" r="5" fill="#1e293b"/>
          <circle cx="20" cy="44" r="2" fill="#94a3b8"/><circle cx="44" cy="44" r="2" fill="#94a3b8"/>
        </g>`;
    case 'tracteur':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <circle cx="20" cy="42" r="10" fill="#1e293b"/><circle cx="20" cy="42" r="5" fill="#64748b"/>
          <circle cx="46" cy="44" r="7" fill="#1e293b"/><circle cx="46" cy="44" r="3" fill="#94a3b8"/>
          <path d="M28 40h14l4-10H32l-4 6z" fill="url(#${uid}-body)"/>
          <rect x="34" y="18" width="12" height="12" rx="2" fill="url(#${uid}-body)"/>
          <rect x="36" y="20" width="8" height="6" rx="1" fill="url(#${uid}-glass)"/>
        </g>`;
    case 'ambulance':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <path d="M10 42V22c0-2 2-4 4-4h24l10 10v14H10z" fill="#f8fafc"/>
          <path d="M38 18v10h10" fill="#e2e8f0"/>
          <rect x="14" y="24" width="10" height="8" rx="1" fill="url(#${uid}-glass)"/>
          <rect x="28" y="26" width="14" height="10" rx="1" fill="#fee2e2"/>
          <path d="M33 28h4v2h2v4h-2v2h-4v-2h-2v-4h2z" fill="#ef4444"/>
          <circle cx="20" cy="44" r="5" fill="#1e293b"/><circle cx="44" cy="44" r="5" fill="#1e293b"/>
          <circle cx="20" cy="44" r="2" fill="#94a3b8"/><circle cx="44" cy="44" r="2" fill="#94a3b8"/>
        </g>`;
    case 'police':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <path d="M12 40c0-2 1-6 4-9l5-5h22l6 5c3 3 4 6 4 9v4H12v-4z" fill="url(#${uid}-body)"/>
          <path d="M22 26l3-5h14l4 5H22z" fill="url(#${uid}-glass)"/>
          <path d="M24 18h16l-2 4H26z" fill="#1e3a8a"/>
          <rect x="28" y="14" width="4" height="4" fill="#ef4444"/><rect x="34" y="14" width="4" height="4" fill="#3b82f6"/>
          <circle cx="20" cy="44" r="5" fill="#1e293b"/><circle cx="44" cy="44" r="5" fill="#1e293b"/>
          <circle cx="20" cy="44" r="2" fill="#94a3b8"/><circle cx="44" cy="44" r="2" fill="#94a3b8"/>
        </g>`;
    case 'camion_pompier':
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <rect x="8" y="18" width="26" height="24" rx="2" fill="url(#${uid}-body)"/>
          <path d="M34 28h14l6 6v8H34V28z" fill="url(#${uid}-body)"/>
          <rect x="38" y="30" width="10" height="7" rx="1" fill="url(#${uid}-glass)"/>
          <rect x="12" y="22" width="18" height="4" rx="1" fill="#fef08a"/>
          <circle cx="18" cy="44" r="5" fill="#1e293b"/><circle cx="46" cy="44" r="5" fill="#1e293b"/>
          <circle cx="18" cy="44" r="2" fill="#94a3b8"/><circle cx="46" cy="44" r="2" fill="#94a3b8"/>
        </g>`;
    case 'livraison':
    default:
      return `${commonDefs}
        <g filter="url(#${uid}-sh)">
          <path d="M18 20l14-8 14 8v20L32 48 18 40V20z" fill="url(#${uid}-body)"/>
          <path d="M32 12v36" stroke="${shade}" stroke-width="1.5" opacity="0.5"/>
          <path d="M18 20l14 8 14-8" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="1.5"/>
          <ellipse cx="32" cy="28" rx="6" ry="3" fill="url(#${uid}-hl)"/>
        </g>`;
  }
}

function shadeColor(hex: string): string {
  const n = hex.replace('#', '');
  const r = Math.max(0, parseInt(n.slice(0, 2), 16) - 45);
  const g = Math.max(0, parseInt(n.slice(2, 4), 16) - 45);
  const b = Math.max(0, parseInt(n.slice(4, 6), 16) - 45);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function vehicleIcon3dMarkup(
  iconType: VehicleIconType | undefined,
  size = 40
): string {
  const opt = getVehicleIconOption(iconType);
  const shade = shadeColor(opt.color);
  const inner = svg3dBody(opt.id, opt.color, shade);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">${inner}</svg>`;
}

/** React-friendly: returns HTML string for dangerouslySetInnerHTML */
export function vehicleIcon3dHtml(
  iconType: VehicleIconType | undefined,
  size = 40
): { __html: string } {
  return { __html: vehicleIcon3dMarkup(iconType, size) };
}
