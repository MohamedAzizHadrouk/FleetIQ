import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Brain,
  CircleDot,
  FileBarChart,
  LayoutDashboard,
  MapPin,
  Settings,
  Truck,
  Users,
} from 'lucide-react';

export type OnboardingModuleId =
  | 'administration'
  | 'parc'
  | 'alertes'
  | 'backoffice'
  | 'geofencing'
  | 'tracking'
  | 'rapport'
  | 'dashboard'
  | 'ia';

export interface ModuleConfig {
  id: OnboardingModuleId;
  title: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  accentClass: string;
}

export const MODULE_REGISTRY: ModuleConfig[] = [
  {
    id: 'administration',
    title: 'Module Administration',
    description: 'Gestion des comptes et des accès',
    icon: Users,
    available: false,
    accentClass: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'parc',
    title: 'Module Gestion Parc',
    description: 'Véhicules, entretien et flotte',
    icon: Truck,
    available: false,
    accentClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'alertes',
    title: 'Module Alerte',
    description: 'Centre d\'alertes et notifications',
    icon: Bell,
    available: false,
    accentClass: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'backoffice',
    title: 'Module Backoffice',
    description: 'Configuration et administration',
    icon: Settings,
    available: false,
    accentClass: 'bg-slate-100 text-slate-600',
  },
  {
    id: 'geofencing',
    title: 'Module Geofencing',
    description: 'Zones géographiques et géopérages',
    icon: CircleDot,
    available: false,
    accentClass: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'tracking',
    title: 'Module Tracking',
    description: 'Suivi en temps réel des véhicules',
    icon: MapPin,
    available: false,
    accentClass: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'rapport',
    title: 'Module Rapport',
    description: 'Rapports et analyses',
    icon: FileBarChart,
    available: false,
    accentClass: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'dashboard',
    title: 'Module Dashboard',
    description: 'Vue d\'ensemble de la flotte',
    icon: LayoutDashboard,
    available: false,
    accentClass: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'ia',
    title: 'Module Intelligence Artificielle',
    description: 'Assistant et analyses IA',
    icon: Brain,
    available: false,
    accentClass: 'bg-cyan-50 text-cyan-600',
  },
];

export function getModuleConfig(
  id: OnboardingModuleId
): ModuleConfig | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id);
}
