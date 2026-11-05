import type { OrgStructure } from '@/types/alert-config';

export const MOCK_ORG_STRUCTURE: OrgStructure = {
  departments: [
    {
      id: 'dept-transport',
      name: 'Transport',
      type: 'groupe',
      level: 'racine',
      vehicleIds: ['1', '2', '3'],
    },
    {
      id: 'dept-logistique',
      name: 'Logistique',
      type: 'simple',
      level: 'branche',
      parentId: 'dept-transport',
      vehicleIds: ['4', '5'],
    },
    {
      id: 'dept-commercial',
      name: 'Commercial',
      type: 'simple',
      level: 'racine',
      vehicleIds: ['6'],
    },
    {
      id: 'dept-direction',
      name: 'Direction',
      type: 'groupe',
      level: 'racine',
      vehicleIds: ['7', '8'],
    },
    {
      id: 'dept-technique',
      name: 'Technique',
      type: 'simple',
      level: 'branche',
      parentId: 'dept-direction',
      vehicleIds: ['9', '10'],
    },
  ],
  groups: [
    {
      id: 'grp-livraison',
      name: 'Flotte Livraison',
      description: 'Véhicules affectés aux livraisons',
      vehicleIds: ['1', '2', '4', '5'],
    },
    {
      id: 'grp-urgence',
      name: 'Flotte Urgence',
      description: 'Véhicules SOS et intervention',
      vehicleIds: ['7', '10'],
    },
    {
      id: 'grp-admin',
      name: 'Flotte Administrative',
      description: 'Véhicules de service',
      vehicleIds: ['3', '6', '8', '9'],
    },
  ],
};

export function getVehicleDepartmentId(vehicleId: string): string | undefined {
  for (const dept of MOCK_ORG_STRUCTURE.departments) {
    if (dept.vehicleIds.includes(vehicleId)) return dept.id;
  }
  return undefined;
}

export function getVehicleGroupIds(vehicleId: string): string[] {
  return MOCK_ORG_STRUCTURE.groups
    .filter((g) => g.vehicleIds.includes(vehicleId))
    .map((g) => g.id);
}
