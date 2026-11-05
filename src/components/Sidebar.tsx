import React, { useEffect, useState, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Circle,
  FileText,
  Settings,
  BarChart,
  TrendingUp,
  Calendar,
  Zap,
  AlertTriangle,
  Droplet,
  Thermometer,
  Users,
  Award,
  Clock,
  Hexagon,
  Lock,
  Activity,
  Weight,
  Car,
  StopCircle,
  WifiOff,
  LayoutDashboard,
  Eye,
  Truck,
  Bell } from
'lucide-react';
import type { VehicleStatus } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mode?: 'monitoring' | 'rapports';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  position?: 'left' | 'right' | 'bottom-left' | 'floating-right';
  statusFilter?: Set<VehicleStatus>;
  statusCounts?: Record<VehicleStatus, number>;
  onToggleStatusFilter?: (status: VehicleStatus) => void;
}

const EMPTY_STATUS_FILTER = new Set<VehicleStatus>();
const DEFAULT_STATUS_COUNTS: Record<VehicleStatus, number> = {
  active: 0,
  idle: 0,
  offline: 0,
};

export function Sidebar({
  activeTab,
  setActiveTab,
  mode = 'monitoring',
  isCollapsed = false,
  onToggleCollapse,
  position = 'left',
  statusFilter = EMPTY_STATUS_FILTER,
  statusCounts = DEFAULT_STATUS_COUNTS,
  onToggleStatusFilter,
}: SidebarProps) {
  const [width, setWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      if (position === 'right') {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 280 && newWidth <= 450) {
          setWidth(newWidth);
        }
      } else {
        const newWidth = e.clientX;
        if (newWidth >= 280 && newWidth <= 450) {
          setWidth(newWidth);
        }
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, position]);
  // Reports menu items
  const reportItems = [
  {
    id: 'rapport_detaille',
    label: 'Rapport détaillé',
    icon: FileText
  },
  {
    id: 'rapport_configurable',
    label: 'Rapport configurable',
    icon: Settings
  },
  {
    id: 'rapport_statistique',
    label: 'Rapport statistique',
    icon: BarChart
  },
  {
    id: 'rapport_trajets',
    label: 'Rapport des trajets',
    icon: TrendingUp
  },
  {
    id: 'rapport_mensuel',
    label: 'Rapport mensuel',
    icon: Calendar
  },
  {
    id: 'rapport_vitesse',
    label: 'Rapport de vitesse',
    icon: Zap
  },
  {
    id: 'rapport_exces_vitesse',
    label: 'Rapport des excès de vitesses',
    icon: AlertTriangle
  },
  {
    id: 'passage_emplacements',
    label: 'Passage par emplacements',
    icon: Activity
  },
  {
    id: 'rapport_carburant',
    label: 'Rapport de carburant',
    icon: Droplet
  },
  {
    id: 'rapport_temperature',
    label: 'Rapport capteur température',
    icon: Thermometer
  },
  {
    id: 'rapport_moteur',
    label: 'Rapport de moteur',
    icon: Settings
  },
  {
    id: 'missions_chauffeurs',
    label: 'Missions de chauffeurs',
    icon: Users
  },
  {
    id: 'qualite_conduite',
    label: 'Qualité de conduite',
    icon: Award
  },
  {
    id: 'stats_temps_travail',
    label: 'Statistiques temps de travail',
    icon: Clock
  },
  {
    id: 'rapport_geofences',
    label: 'Rapport des géofences',
    icon: Hexagon
  },
  {
    id: 'rapport_smartlock',
    label: 'Rapport de smartlock',
    icon: Lock
  },
  {
    id: 'indicateurs_dashboard',
    label: 'Indicateurs de tableau de bord',
    icon: Activity
  },
  {
    id: 'rapport_poids',
    label: 'Rapport de poids',
    icon: Weight
  }];

  const totalVehicles =
    statusCounts.active + statusCounts.idle + statusCounts.offline;

  // Render Reports Sidebar
  if (mode === 'rapports') {
    return (
      <div className="w-64 bg-slate-800 flex flex-col flex-shrink-0 z-20 text-slate-200 font-sans">
        <div className="p-4 pt-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-slate-300" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Rapports
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {reportItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left group ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
                
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                
                <span
                  className={`text-sm ${isActive ? 'text-white font-medium' : 'group-hover:text-white'}`}>
                  
                  {item.label}
                </span>
              </button>);

          })}
        </div>
      </div>);

  }
  // Render Monitoring Sidebar as floating card at bottom-left
  if (position === 'bottom-left' || position === 'floating-right') {
    return (
      <div
        className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 transition-all duration-300 relative ${isCollapsed ? 'w-16 h-16' : 'w-[min(320px,calc(100vw-2rem))] lg:w-80'}`}>
        
        {/* Collapse Toggle Button */}
        {onToggleCollapse &&
        <button
          onClick={onToggleCollapse}
          className="absolute -top-3 -left-3 z-50 w-10 h-10 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl">
          
            {isCollapsed ?
          position === 'floating-right' ?
          <ChevronLeft className="w-5 h-5 text-slate-600" /> :

          <ChevronRight className="w-5 h-5 text-slate-600" /> :

          position === 'floating-right' ?
          <ChevronRight className="w-5 h-5 text-slate-600" /> :

          <ChevronLeft className="w-5 h-5 text-slate-600" />
          }
          </button>
        }

        {isCollapsed ?
        // Collapsed state - just icon
        <div className="w-full h-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-slate-600" />
          </div> :

        // Expanded state
        <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Monitoring Center
                </h2>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                <span className="text-xs font-medium text-slate-600">
                  Total Véhicules
                </span>
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                  {totalVehicles}
                </span>
              </div>
            </div>

            {/* Vehicle Status Groups */}
            <div className="p-4 space-y-2 max-h-[calc(100dvh-8rem)] lg:max-h-[calc(100vh-300px)] overflow-y-auto">
              <button
                type="button"
                onClick={() => onToggleStatusFilter?.('active')}
                aria-pressed={statusFilter.has('active')}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg border group transition-all ${
                  statusFilter.has('active')
                    ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                    : 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-100 border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Car className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-emerald-900">
                      Circulation
                    </div>
                    <div className="text-[10px] text-emerald-600">
                      Véhicules en mouvement
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-emerald-700">
                    {statusCounts.active}
                  </span>
                  <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500 animate-pulse" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onToggleStatusFilter?.('idle')}
                aria-pressed={statusFilter.has('idle')}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg border group transition-all ${
                  statusFilter.has('idle')
                    ? 'bg-gradient-to-r from-rose-100 to-rose-50 border-rose-400 ring-2 ring-rose-200'
                    : 'bg-gradient-to-r from-rose-50 to-rose-100/50 hover:from-rose-100 hover:to-rose-100 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                    <StopCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-rose-900">
                      Stop
                    </div>
                    <div className="text-[10px] text-rose-600">
                      Véhicules arrêtés
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-rose-700">
                    {statusCounts.idle}
                  </span>
                  <Circle className="w-1.5 h-1.5 fill-rose-500 text-rose-500" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => onToggleStatusFilter?.('offline')}
                aria-pressed={statusFilter.has('offline')}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg border group transition-all ${
                  statusFilter.has('offline')
                    ? 'bg-gradient-to-r from-slate-200 to-slate-100 border-slate-400 ring-2 ring-slate-300'
                    : 'bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                    <WifiOff className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-900">
                      Hors connexion
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Véhicules offline
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-slate-700">
                    {statusCounts.offline}
                  </span>
                  <Circle className="w-1.5 h-1.5 fill-slate-500 text-slate-500" />
                </div>
              </button>
            </div>
          </>
        }
      </div>);

  }
  // Render original right-side monitoring sidebar (not used in suivie view anymore)
  const borderClass = position === 'right' ? 'border-l' : 'border-r';
  const toggleButtonPosition = position === 'right' ? '-left-3' : '-right-3';
  const toggleButtonRounding =
  position === 'right' ? 'rounded-l-lg' : 'rounded-r-lg';
  const resizeHandlePosition = position === 'right' ? 'left-0' : 'right-0';
  const resizeHandleRounding = position === 'right' ? 'rounded-r' : 'rounded-l';
  return (
    <div
      ref={panelRef}
      style={{
        width: isCollapsed ? '0px' : `${width}px`
      }}
      className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col flex-shrink-0 z-20 text-slate-300 font-sans transition-all duration-300 relative ${borderClass} border-slate-700/50 shadow-2xl`}>
      
      {/* Collapse Toggle Button */}
      {onToggleCollapse &&
      <button
        onClick={onToggleCollapse}
        className={`absolute ${toggleButtonPosition} top-1/2 -translate-y-1/2 z-40 w-6 h-12 bg-slate-800/95 backdrop-blur-sm hover:bg-slate-700 border border-slate-700 ${toggleButtonRounding} flex items-center justify-center transition-colors shadow-lg`}>
        
          {isCollapsed ?
        position === 'right' ?
        <ChevronLeft className="w-4 h-4 text-slate-400" /> :

        <ChevronRight className="w-4 h-4 text-slate-400" /> :

        position === 'right' ?
        <ChevronRight className="w-4 h-4 text-slate-400" /> :

        <ChevronLeft className="w-4 h-4 text-slate-400" />
        }
        </button>
      }

      {!isCollapsed &&
      <>
          {/* Header */}
          <div className="p-5 pt-6 border-b border-slate-700/50">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Monitoring Center
            </h2>

            <div className="flex items-center justify-between py-3 px-4 bg-slate-800/50 rounded-lg mb-2 border border-slate-700/30">
              <span className="text-sm font-medium text-slate-200">
                Tous les Véhicules
              </span>
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                {totalVehicles}
              </span>
            </div>
          </div>

          {/* Vehicle Status Groups */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <button
              type="button"
              onClick={() => onToggleStatusFilter?.('active')}
              aria-pressed={statusFilter.has('active')}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border group transition-all ${
                statusFilter.has('active')
                  ? 'bg-gradient-to-r from-emerald-600/40 to-emerald-600/20 border-emerald-400/60 ring-2 ring-emerald-500/40'
                  : 'bg-gradient-to-r from-emerald-600/20 to-emerald-600/10 hover:from-emerald-600/30 hover:to-emerald-600/20 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                  <Car className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-emerald-100">
                    Circulation
                  </div>
                  <div className="text-xs text-emerald-300/70">
                    Véhicules en mouvement
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-emerald-400">
                  {statusCounts.active}
                </span>
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => onToggleStatusFilter?.('idle')}
              aria-pressed={statusFilter.has('idle')}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border group transition-all ${
                statusFilter.has('idle')
                  ? 'bg-gradient-to-r from-rose-600/40 to-rose-600/20 border-rose-400/60 ring-2 ring-rose-500/40'
                  : 'bg-gradient-to-r from-rose-600/20 to-rose-600/10 hover:from-rose-600/30 hover:to-rose-600/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center border border-rose-500/30">
                  <StopCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-rose-100">
                    Stop
                  </div>
                  <div className="text-xs text-rose-300/70">
                    Véhicules arrêtés
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-rose-400">
                  {statusCounts.idle}
                </span>
                <Circle className="w-2 h-2 fill-rose-500 text-rose-500" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => onToggleStatusFilter?.('offline')}
              aria-pressed={statusFilter.has('offline')}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-xl border group transition-all ${
                statusFilter.has('offline')
                  ? 'bg-gradient-to-r from-slate-600/40 to-slate-600/20 border-slate-400/60 ring-2 ring-slate-500/40'
                  : 'bg-gradient-to-r from-slate-600/20 to-slate-600/10 hover:from-slate-600/30 hover:to-slate-600/20 border-slate-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-500/20 rounded-lg flex items-center justify-center border border-slate-500/30">
                  <WifiOff className="w-5 h-5 text-slate-300" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-slate-100">
                    Hors connexion
                  </div>
                  <div className="text-xs text-slate-400">
                    Véhicules offline
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-300">
                  {statusCounts.offline}
                </span>
                <Circle className="w-2 h-2 fill-slate-400 text-slate-400" />
              </div>
            </button>
          </div>

          {/* Resize Handle */}
          {mode === 'monitoring' &&
        <div
          onMouseDown={() => setIsResizing(true)}
          className={`absolute top-0 ${resizeHandlePosition} w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors group`}>
          
              <div
            className={`absolute top-1/2 ${resizeHandlePosition} -translate-y-1/2 w-1 h-12 bg-slate-700 group-hover:bg-blue-500 transition-colors ${resizeHandleRounding}`} />
          
            </div>
        }

          {/* Bottom Alerts */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Alertes Critiques
            </h3>
            <p className="text-xs text-slate-600 italic">
              Aucune alerte pour le moment
            </p>
          </div>
        </>
      }
    </div>);

}