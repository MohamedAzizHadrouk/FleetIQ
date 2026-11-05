import type { AccessPageNode } from '../types/admin.types';

/** Mirrors Webtrace FO page tree / AddAccountModal ACCESS_PAGES. */
export const ACCESS_PAGES: AccessPageNode[] = [
  {
    id: 'tous',
    label: 'Tous',
    children: [],
  },
  {
    id: 'administration',
    label: 'Administration',
    children: [
      { id: 'gestion_comptes', label: 'Gestion des comptes', children: [] },
      { id: 'gestion_departements', label: 'Gestion des départements', children: [] },
      { id: 'controle_unites', label: 'Contrôle des unités', children: [] },
      { id: 'parametrage_alertes', label: 'Paramétrage des alertes', children: [] },
      { id: 'envoi_alertes', label: 'Envoi des alertes par Mail/SMS', children: [] },
      { id: 'geofencing', label: 'Geofencing', children: [] },
      { id: 'gestion_emplacements', label: 'Gestion des emplacements', children: [] },
    ],
  },
  {
    id: 'suivi',
    label: 'Suivi',
    children: [],
  },
  {
    id: 'gestion_parc',
    label: 'Gestion de Parc',
    children: [],
  },
  {
    id: 'surveillance_reservoirs',
    label: 'Surveillance des réservoirs',
    children: [
      {
        id: 'tableau_surveillance_reservoirs',
        label: 'Tableau de bord de surveillance des réservoirs',
        children: [],
      },
      { id: 'gestion_reservoirs', label: 'Gestion des réservoirs', children: [] },
    ],
  },
  {
    id: 'surveillance_reservoirs_mobiles',
    label: 'Surveillance des réservoirs mobiles',
    children: [
      {
        id: 'tableau_surveillance_reservoirs_mobiles',
        label: 'Tableau de bord de surveillance des réservoirs',
        children: [],
      },
      { id: 'gestion_reservoirs_mobiles', label: 'Gestion des réservoirs', children: [] },
    ],
  },
  {
    id: 'surveillance_pompes',
    label: 'Surveillance des pompes',
    children: [
      { id: 'tableau_pompes', label: 'Tableau de bord des pompes', children: [] },
      { id: 'gestion_pompes', label: 'Gestion des pompes', children: [] },
    ],
  },
];

export function flattenAccessPageIds(nodes: AccessPageNode[] = ACCESS_PAGES): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.id !== 'tous') ids.push(node.id);
    if (node.children.length) ids.push(...flattenAccessPageIds(node.children));
  }
  return ids;
}

export function getAllSelectablePageIds(): string[] {
  return ['tous', ...flattenAccessPageIds()];
}
