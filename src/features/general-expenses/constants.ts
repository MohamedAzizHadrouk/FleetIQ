import type {
  ActorDef,
  ActorType,
  SubRubriqueDef,
  SubRubriqueKey,
  VehicleMeta,
} from './types';

export const PERIODS = [
  "Aujourd'hui",
  'Ce mois',
  'Trimestre',
  'Année 2026',
  'Personnalisée',
] as const;

/** Index of the custom date-range period in PERIODS. */
export const PERIOD_CUSTOM = 4 as const;

/** Full calendar year labels (used when period = Année). */
export const MONTHS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
] as const;

export const HEATMAP_PAGE_SIZE = 5;

/** Category accents: blue-scale only (severity uses green / orange / red separately). */
export const SUBS: Record<SubRubriqueKey, SubRubriqueDef> = {
  maint: {
    key: 'maint',
    name: 'Maintenance',
    color: '#1e3a8a',
    src: 'CarRepairHistory',
    menu: 'Gestion de maintenance',
  },
  fuel: {
    key: 'fuel',
    name: 'Carburant/Coupons',
    color: '#1d4ed8',
    src: 'CardCoupon + CardAssignment',
    menu: 'Gestion des coupons',
  },
  tire: {
    key: 'tire',
    name: 'Pneus',
    color: '#2563eb',
    src: 'Tire + TireLog',
    menu: 'Gestion des pneus',
  },
  rent: {
    key: 'rent',
    name: 'Location/Emprunt',
    color: '#3b82f6',
    src: 'CarRental + CarRentalInstallment',
    menu: 'Emprunt et location',
  },
  docs: {
    key: 'docs',
    name: 'Documents',
    color: '#60a5fa',
    src: 'Documents + LogDocuments',
    menu: 'Gestion de documents',
  },
  acc: {
    key: 'acc',
    name: 'Sinistres',
    color: '#0ea5e9',
    src: 'CarAccident',
    menu: 'Gestion des sinistres',
  },
  miss: {
    key: 'miss',
    name: 'Frais de mission',
    color: '#0284c7',
    src: 'Mission',
    menu: 'Gestion des visites/missions',
    isNew: true,
  },
  buy: {
    key: 'buy',
    name: "Factures d'achat",
    color: '#64748b',
    src: 'CommercialDocument + DocumentArticle + Payment',
    menu: 'Gestion Pièces commerciales',
  },
  cons: {
    key: 'cons',
    name: 'Consommation stock',
    color: '#475569',
    src: 'StockMovment (sorties)',
    menu: 'Gestion des articles et du stock',
    isNew: true,
  },
};

export const ACTORS: Record<ActorType, ActorDef> = {
  car: {
    key: 'car',
    name: 'Véhicule',
    plural: 'Véhicules',
    entities: [
      '8125 TU 226',
      '8126 TU 226',
      '8127 TU 226',
      'Tepee FM4200',
      '8312 TU 193',
      '7710 TU 201',
      '4521 TU 188',
      '9034 TU 210',
      '1188 TU 175',
      '6670 TU 199',
      '3401 TU 220',
      '8855 TU 205',
      '2209 TU 214',
      '5566 TU 191',
    ],
    subs: {
      maint: 'y',
      fuel: 'y',
      tire: 'y',
      rent: 'y',
      docs: 'y',
      acc: 'y',
      miss: 'y',
    },
  },
  drv: {
    key: 'drv',
    name: 'Chauffeur',
    plural: 'Chauffeurs',
    isNew: true,
    entities: [
      'Ahmed Ben Salah',
      'Sami Trabelsi',
      'Mouna Gharbi',
      'Karim Jlassi',
      'Walid Hammami',
      'Nour Chatti',
      'Hedi Mansouri',
      'Ines Bouazizi',
      'Rami Khelifi',
      'Yasmine Saidi',
    ],
    subs: { fuel: 'y', acc: 'y', miss: 'y' },
  },
  dep: {
    key: 'dep',
    name: 'Département',
    plural: 'Départements',
    entities: ['Transport', 'Logistique', 'Commercial', 'Direction', 'Technique'],
    subs: {
      fuel: 'y',
      acc: 'y',
      buy: 'y',
      cons: 'y',
      maint: 'i',
      tire: 'i',
      rent: 'i',
      docs: 'i',
      miss: 'i',
    },
  },
  spe: {
    key: 'spe',
    name: 'Spécialité',
    plural: 'Spécialités',
    isNew: true,
    entities: ['Livraison', 'Transport', 'Frigo', 'Benne'],
    subs: {
      maint: 'i',
      fuel: 'i',
      tire: 'i',
      rent: 'i',
      docs: 'i',
      acc: 'i',
      miss: 'i',
    },
  },
};

export const VEHICLE_META: Record<string, VehicleMeta> = {
  '8125 TU 226': { icon: 'Voiture', specialty: 'Livraison' },
  '8126 TU 226': { icon: 'Fourgon', specialty: 'Transport' },
  '8127 TU 226': { icon: 'Pick-up', specialty: 'Benne' },
  'Tepee FM4200': { icon: 'Fourgon', specialty: 'Livraison' },
  '8312 TU 193': { icon: 'Voiture', specialty: 'Transport' },
  '7710 TU 201': { icon: 'Fourgon', specialty: 'Frigo' },
  '4521 TU 188': { icon: 'Voiture', specialty: 'Livraison' },
  '9034 TU 210': { icon: 'Fourgon', specialty: 'Transport' },
  '1188 TU 175': { icon: 'Pick-up', specialty: 'Benne' },
  '6670 TU 199': { icon: 'Fourgon', specialty: 'Frigo' },
  '3401 TU 220': { icon: 'Voiture', specialty: 'Livraison' },
  '8855 TU 205': { icon: 'Fourgon', specialty: 'Transport' },
  '2209 TU 214': { icon: 'Moto', specialty: 'Livraison' },
  '5566 TU 191': { icon: 'Pick-up', specialty: 'Benne' },
};

export const ICON_LABEL: Record<string, string> = {
  Voiture: 'Voiture',
  Moto: 'Moto',
  Fourgon: 'Fourgon',
  'Pick-up': 'Pick-up',
};

/** Lucide icon names mapped by vehicle type (see VehicleTypeIcon). */
export const VEHICLE_TYPE_KEYS = [
  'Voiture',
  'Fourgon',
  'Pick-up',
  'Moto',
] as const;

export type VehicleTypeKey = (typeof VEHICLE_TYPE_KEYS)[number];

export const DEP_COLORS: Record<string, string> = {
  Transport: '#1e3a8a',
  Logistique: '#1d4ed8',
  Commercial: '#2563eb',
  Direction: '#3b82f6',
  Technique: '#60a5fa',
};

export const SPEC_COLORS: Record<string, string> = {
  Livraison: '#1d4ed8',
  Transport: '#2563eb',
  Frigo: '#3b82f6',
  Benne: '#60a5fa',
};

export const DEP_CARS: Record<string, number> = {
  Transport: 12,
  Logistique: 9,
  Commercial: 6,
  Direction: 3,
  Technique: 5,
};

export const SPE_CARS: Record<string, number> = {
  Livraison: 14,
  Transport: 10,
  Frigo: 6,
  Benne: 5,
};

export const SPE_KM: Record<string, number> = {
  Livraison: 62000,
  Transport: 48000,
  Frigo: 26000,
  Benne: 14000,
};

export const DEP_KM: Record<string, number> = {
  Transport: 70000,
  Logistique: 52000,
  Commercial: 30000,
  Direction: 15000,
  Technique: 26000,
};

export const DEP_OVER: Record<string, number> = {
  Transport: 0.06,
  Logistique: 0.12,
  Commercial: 0.08,
  Direction: 0.05,
  Technique: 0.15,
};

export const SPE_OVER: Record<string, number> = {
  Livraison: 0.06,
  Transport: 0.04,
  Frigo: 0.22,
  Benne: 0.15,
};

export const SPE_UNPL: Record<string, number> = {
  Livraison: 0.3,
  Transport: 0.35,
  Frigo: 0.45,
  Benne: 0.6,
};

export const SPE_WARR: Record<string, number> = {
  Livraison: 0.08,
  Transport: 0.1,
  Frigo: 0.12,
  Benne: 0.22,
};

export const DEP_VEH_FIXED: Record<string, string[]> = {
  Transport: ['8125 TU 226', '8126 TU 226'],
  Technique: ['8127 TU 226'],
  Logistique: ['Tepee FM4200'],
  Commercial: ['8312 TU 193'],
  Direction: ['7710 TU 201'],
};

export const SPE_VEH_FIXED: Record<string, string[]> = {
  Livraison: ['8125 TU 226', 'Tepee FM4200'],
  Transport: ['8126 TU 226', '8312 TU 193'],
  Benne: ['8127 TU 226'],
  Frigo: ['7710 TU 201'],
};

export const VEH_SUBS: SubRubriqueKey[] = [
  'maint',
  'fuel',
  'tire',
  'rent',
  'docs',
  'acc',
  'miss',
];

export const GROUP_META = {
  dep: {
    cars: DEP_CARS,
    colors: DEP_COLORS,
    fixed: DEP_VEH_FIXED,
    src: 'Car.DepartmentId',
    pct: '% dépt.',
    km: DEP_KM,
    over: DEP_OVER,
  },
  spe: {
    cars: SPE_CARS,
    colors: SPEC_COLORS,
    fixed: SPE_VEH_FIXED,
    src: 'Car.SpecialityId',
    pct: '% spéc.',
    km: SPE_KM,
    over: SPE_OVER,
  },
} as const;

export const TOP_ENT_TITLE: Record<ActorType, string> = {
  car: 'Véhicule le plus coûteux',
  drv: 'Chauffeur le plus coûteux',
  dep: 'Département le plus lourd',
  spe: 'Spécialité la plus lourde',
};

export const LOW_ENT_TITLE: Record<ActorType, string> = {
  car: 'Véhicule le plus économique',
  drv: 'Chauffeur le plus économique',
  dep: 'Département le plus économique',
  spe: 'Spécialité la plus économique',
};

export const SUB_TYPES: Partial<
  Record<SubRubriqueKey, { label: string; src: string; list: string[]; w: number[] }>
> = {
  acc: {
    label: 'Type de sinistre',
    src: 'CarAccident.AccidentTypeId → AccidentType.Name',
    list: [
      'Accident de route',
      'Accident de route avec autre véhicule',
      'Bris de glaces',
      'Dégât des eaux',
      'Incendie',
      'Vol',
      'Autre',
    ],
    w: [30, 26, 14, 5, 4, 12, 9],
  },
  maint: {
    label: "Type d'entretien",
    src: 'CarRepairHistory.MaintenanceType → MaintenanceType.Name',
    list: [
      'Vidange',
      "Bougies d'allumage",
      'Pneus',
      'Patins de frein',
      'Filtre climatiseur',
      'Filtre à air',
    ],
    w: [34, 8, 22, 18, 9, 9],
  },
  docs: {
    label: 'Type de document',
    src: 'Documents.DocumentsType → DocumentsType.Name',
    list: ['Vignette', 'Assurance', 'Contrôle technique', 'Autre taxe'],
    w: [22, 58, 12, 8],
  },
};

export const SUPPLIERS: Record<SubRubriqueKey, string[]> = {
  maint: ['Garage Ennour', 'Auto Service Nabeul'],
  fuel: ['Agil', 'Total Energies'],
  tire: ['Pneus Plus', 'Point S'],
  rent: ['Auto Location Sahel'],
  docs: ['STAR Assurances', 'Centre de visite technique'],
  acc: ['STAR Assurances', 'COMAR'],
  miss: ['Frais sur route'],
  buy: ['Parts Center', 'Auto Pièces Sfax'],
  cons: ['Magasin interne'],
};

export const FUEL_PRICES = { Diesel: 2.205, Essence: 2.525 } as const;

export const FUEL_EST: Record<string, number> = {
  Voiture: 7,
  Fourgon: 9.5,
  'Pick-up': 10,
  Moto: 4,
};

export const MAINT_TYPES = [
  'Vidange',
  "Bougies d'allumage",
  'Pneus',
  'Patins de frein',
  'Filtre climatiseur',
  'Filtre à air',
] as const;

export const MAINT_EVERY: Record<string, number> = {
  Vidange: 10000,
  "Bougies d'allumage": 30000,
  Pneus: 40000,
  'Patins de frein': 20000,
  'Filtre climatiseur': 15000,
  'Filtre à air': 15000,
};

export const MAINT_EVERY_H: Record<string, number> = {
  Vidange: 250,
  "Bougies d'allumage": 1000,
  Pneus: 1500,
  'Patins de frein': 800,
  'Filtre climatiseur': 500,
  'Filtre à air': 500,
};

export const MAINT_H_SHARE: Record<string, number> = {
  Livraison: 0.1,
  Transport: 0.2,
  Frigo: 0.5,
  Benne: 0.5,
};

export const BASE_AMOUNTS: Record<SubRubriqueKey, number> = {
  maint: 1900,
  fuel: 2600,
  tire: 1700,
  rent: 1600,
  docs: 2400,
  acc: 6700,
  miss: 450,
  buy: 2200,
  cons: 1500,
};

export const UNPL_EXTRA = 0.3;
