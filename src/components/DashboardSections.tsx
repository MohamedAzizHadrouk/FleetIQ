import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  FileText,
  Gauge,
  Timer,
  Activity,
  Fuel,
  Award,
  Wrench,
  AlertOctagon,
  ChevronDown,
  Zap,
  AlertTriangle,
  Eye,
  StopCircle,
  Route,
  Clock,
  DollarSign,
  Settings,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Droplet,
  Home,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Car,
  Search,
  Check,
  Calendar,
  Filter,
  Brain,
  Disc,
  Thermometer } from
'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar } from
'recharts';
const speedByVehicleData = [
{
  vehicle: '1182 TU 147',
  avgSpeed: 11.6,
  maxSpeed: 48
},
{
  vehicle: '1186 TU 147',
  avgSpeed: 25.14,
  maxSpeed: 93
},
{
  vehicle: '41 TU 196',
  avgSpeed: 34.76,
  maxSpeed: 89
},
{
  vehicle: '7894 TU 215',
  avgSpeed: 6.13,
  maxSpeed: 9
}];

const topSpeedVehicles = [
{
  vehicle: '1186 TU 147',
  speed: 93
},
{
  vehicle: '41 TU 196',
  speed: 93
},
{
  vehicle: '1182 TU 147',
  speed: 48
},
{
  vehicle: '7894 TU 215',
  speed: 9
}];

const drivingBehaviorData = [
{
  vehicle: 'Fleet-001',
  excessSpeed: 2,
  harshBraking: 3,
  idleTime: 45
},
{
  vehicle: 'Fleet-005',
  excessSpeed: 1,
  harshBraking: 2,
  idleTime: 38
},
{
  vehicle: 'Fleet-008',
  excessSpeed: 3,
  harshBraking: 4,
  idleTime: 52
},
{
  vehicle: 'Fleet-012',
  excessSpeed: 5,
  harshBraking: 8,
  idleTime: 67
},
{
  vehicle: 'Fleet-003',
  excessSpeed: 12,
  harshBraking: 15,
  idleTime: 98
},
{
  vehicle: 'Fleet-007',
  excessSpeed: 18,
  harshBraking: 22,
  idleTime: 125
}];

const maintenanceStatusData = [
{
  name: 'À jour',
  value: 42,
  color: '#10b981'
},
{
  name: 'Proche',
  value: 5,
  color: '#f59e0b'
},
{
  name: 'En retard',
  value: 3,
  color: '#ef4444'
}];

const alertsOverTimeData = [
{
  date: '01/01',
  critiques: 3,
  warnings: 8,
  info: 12
},
{
  date: '08/01',
  critiques: 2,
  warnings: 6,
  info: 10
},
{
  date: '15/01',
  critiques: 4,
  warnings: 9,
  info: 15
},
{
  date: '22/01',
  critiques: 1,
  warnings: 5,
  info: 8
},
{
  date: '29/01',
  critiques: 2,
  warnings: 7,
  info: 11
}];

interface SectionProps {
  openIndicatorModal: (
  title: string,
  description: string,
  vehicles: any[],
  valueLabel?: string)
  => void;
  generateSpeedingVehiclesForAlerts: () => any[];
  generateMaxSpeedVehicles: () => any[];
  generateTop5SpeedVehicles: () => any[];
  generateSpeedingVehicles: () => any[];
  generateOverconsumptionVehicles: () => any[];
  generateHarshBrakingVehicles: () => any[];
  generateMaintenanceVehicles: () => any[];
  SectionDateFilter?: any;
  fuelDateDebut?: string;
  setFuelDateDebut?: (date: string) => void;
  fuelDateFin?: string;
  setFuelDateFin?: (date: string) => void;
  drivingDateDebut?: string;
  setDrivingDateDebut?: (date: string) => void;
  drivingDateFin?: string;
  setDrivingDateFin?: (date: string) => void;
  maintenanceDateDebut?: string;
  setMaintenanceDateDebut?: (date: string) => void;
  maintenanceDateFin?: string;
  setMaintenanceDateFin?: (date: string) => void;
  alertsDateDebut?: string;
  setAlertsDateDebut?: (date: string) => void;
  alertsDateFin?: string;
  setAlertsDateFin?: (date: string) => void;
  setShowFuelPriceModal?: (show: boolean) => void;
  engineVehicles?: string[];
  setEngineVehicles?: (vehicles: string[]) => void;
  engineDateDebut?: string;
  setEngineDateDebut?: (date: string) => void;
  engineDateFin?: string;
  setEngineDateFin?: (date: string) => void;
  allVehicles?: any[];
  speedChartPage?: number;
  setSpeedChartPage?: (page: number) => void;
  // Prediction section filters
  predictionVehicles?: string[];
  setPredictionVehicles?: (vehicles: string[]) => void;
}
export const SpeedSection: React.FC<SectionProps> = ({
  openIndicatorModal,
  generateSpeedingVehiclesForAlerts,
  generateMaxSpeedVehicles,
  generateTop5SpeedVehicles,
  speedChartPage = 0,
  setSpeedChartPage
}) => {
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(speedByVehicleData.length / ITEMS_PER_PAGE);
  const paginatedData = speedByVehicleData.slice(
    speedChartPage * ITEMS_PER_PAGE,
    (speedChartPage + 1) * ITEMS_PER_PAGE
  );
  const handlePrevPage = () => {
    if (setSpeedChartPage && speedChartPage > 0) {
      setSpeedChartPage(speedChartPage - 1);
    }
  };
  const handleNextPage = () => {
    if (setSpeedChartPage && speedChartPage < totalPages - 1) {
      setSpeedChartPage(speedChartPage + 1);
    }
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Vitesse</h3>
            <p className="text-xs text-slate-600">Le 12/2025</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-6">
          <button
            onClick={() =>
            openIndicatorModal(
              'Vitesse Maximale',
              'Véhicules avec les vitesses maximales enregistrées',
              generateMaxSpeedVehicles(),
              'Vitesse max'
            )
            }
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 relative overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-400/10 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <Eye className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-4xl font-bold text-slate-800 mb-1">
                93 km/h
              </div>
              <div className="text-sm text-slate-600 font-medium">
                Vitesse Maximale
              </div>
            </div>
          </button>

          <button
            onClick={() =>
            openIndicatorModal(
              'Alertes de dépassement',
              'Véhicules ayant dépassé la limite de vitesse',
              generateSpeedingVehiclesForAlerts(),
              'Vitesse'
            )
            }
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 relative overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <Eye className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-4xl font-bold text-slate-800 mb-1">79</div>
              <div className="text-sm text-slate-600 font-medium">
                Alertes dépassement
              </div>
            </div>
          </button>

          <button
            onClick={() =>
            openIndicatorModal(
              'TOP 5 Vitesses',
              'Les 5 véhicules les plus rapides',
              generateTop5SpeedVehicles(),
              'Vitesse'
            )
            }
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 relative overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group">
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-400/10 to-transparent rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">5</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    TOP 5
                  </span>
                  <Eye className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="space-y-1.5">
                {topSpeedVehicles.slice(0, 4).map((item, idx) =>
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs">
                  
                    <span className="text-slate-600 font-medium">
                      {idx + 1}. {item.vehicle}
                    </span>
                    <span className="font-bold text-slate-800">
                      {item.speed} km/h
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-800">Vitesse</h4>
                <p className="text-xs text-slate-500 mt-0.5">Le 12/2025</p>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={speedChartPage === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <span className="text-xs font-medium text-slate-600">
                  Page {speedChartPage + 1} / {totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={speedChartPage >= totalPages - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={paginatedData} barGap={8}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false} />
                
                <XAxis
                  dataKey="vehicle"
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  stroke="#e2e8f0"
                  angle={-45}
                  textAnchor="end"
                  height={80} />
                
                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: '#64748b'
                  }}
                  stroke="#e2e8f0"
                  label={{
                    value: 'Vitesse (km/h)',
                    angle: -90,
                    position: 'insideLeft',
                    style: {
                      fontSize: 12,
                      fill: '#64748b'
                    }
                  }} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  cursor={{
                    fill: 'rgba(148, 163, 184, 0.1)'
                  }} />
                
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '20px'
                  }}
                  iconType="circle" />
                
                <Bar
                  dataKey="avgSpeed"
                  name="Vitesse Moyenne"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  label={{
                    position: 'top',
                    fontSize: 11,
                    fill: '#3b82f6',
                    fontWeight: 600
                  }} />
                
                <Bar
                  dataKey="maxSpeed"
                  name="Vitesse Maximale"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  label={{
                    position: 'top',
                    fontSize: 11,
                    fill: '#ef4444',
                    fontWeight: 600
                  }} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>);

};
export const EngineStatsSection: React.FC<SectionProps> = ({
  engineVehicles = [],
  setEngineVehicles,
  engineDateDebut,
  setEngineDateDebut,
  engineDateFin,
  setEngineDateFin,
  allVehicles = []
}) => {
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node))
      {
        setShowVehicleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const toggleVehicle = (id: string) => {
    if (!setEngineVehicles) return;
    const newSelection = engineVehicles.includes(id) ?
    engineVehicles.filter((v) => v !== id) :
    [...engineVehicles, id];
    setEngineVehicles(newSelection);
  };
  const selectAll = () => {
    if (setEngineVehicles) setEngineVehicles(allVehicles.map((v) => v.id));
  };
  const deselectAll = () => {
    if (setEngineVehicles) setEngineVehicles([]);
  };
  const engineDurationData = [
  {
    month: 'Jan',
    heures: 1150
  },
  {
    month: 'Fév',
    heures: 1180
  },
  {
    month: 'Mar',
    heures: 1220
  },
  {
    month: 'Avr',
    heures: 1190
  },
  {
    month: 'Mai',
    heures: 1240
  },
  {
    month: 'Juin',
    heures: 1245
  }];

  const totalEngineHoursData = [
  {
    month: 'Jan',
    heures: 60000
  },
  {
    month: 'Fév',
    heures: 60500
  },
  {
    month: 'Mar',
    heures: 61000
  },
  {
    month: 'Avr',
    heures: 61500
  },
  {
    month: 'Mai',
    heures: 62000
  },
  {
    month: 'Juin',
    heures: 62450
  }];

  const idleTimeData = [
  {
    month: 'Jan',
    temps: 160
  },
  {
    month: 'Fév',
    temps: 175
  },
  {
    month: 'Mar',
    heures: 180
  },
  {
    month: 'Avr',
    heures: 178
  },
  {
    month: 'Mai',
    heures: 185
  },
  {
    month: 'Juin',
    heures: 190
  }];

  const distanceData = [
  {
    month: 'Jan',
    distance: 48200
  },
  {
    month: 'Fév',
    distance: 49500
  },
  {
    month: 'Mar',
    distance: 50100
  },
  {
    month: 'Avr',
    distance: 49800
  },
  {
    month: 'Mai',
    distance: 51200
  },
  {
    month: 'Juin',
    distance: 51890
  }];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
      
      <div className="px-6 py-4 border-b border-cyan-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Statistiques Moteur & Distance
            </h3>
            <p className="text-xs text-slate-600">
              Durée de fonctionnement, heures moteur, distance parcourue
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Vehicle Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-cyan-300 rounded-lg text-sm text-slate-700 hover:bg-cyan-50 transition-colors shadow-sm">
              
              <Car className="w-4 h-4 text-cyan-600" />
              <span className="max-w-[100px] truncate">
                {engineVehicles.length === 0 ?
                'Tous les véhicules' :
                `${engineVehicles.length} véhicule(s)`}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showVehicleDropdown &&
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-80 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <span className="text-xs font-semibold text-slate-700">
                    Sélectionner
                  </span>
                  <div className="flex gap-2">
                    <button
                    onClick={selectAll}
                    className="text-xs text-blue-600 hover:underline">
                    
                      Tout
                    </button>
                    <button
                    onClick={deselectAll}
                    className="text-xs text-slate-500 hover:underline">
                    
                      Rien
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-cyan-500" />
                  
                  </div>
                  {allVehicles.map((vehicle) =>
                <label
                  key={vehicle.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                  
                      <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${engineVehicles.includes(vehicle.id) ? 'bg-cyan-600 border-cyan-600' : 'border-slate-300 bg-white'}`}>
                    
                        {engineVehicles.includes(vehicle.id) &&
                    <Check className="w-3 h-3 text-white" />
                    }
                      </div>
                      <span className="text-sm text-slate-700 truncate">
                        {vehicle.name}
                      </span>
                    </label>
                )}
                </div>
              </div>
            }
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-cyan-300 shadow-sm">
            <Calendar className="w-4 h-4 text-cyan-600" />
            <input
              type="text"
              placeholder="Début"
              value={engineDateDebut}
              onChange={(e) =>
              setEngineDateDebut && setEngineDateDebut(e.target.value)
              }
              className="w-24 text-xs border-none focus:ring-0 p-1 text-slate-700 placeholder:text-slate-400" />
            
            <span className="text-slate-400">→</span>
            <input
              type="text"
              placeholder="Fin"
              value={engineDateFin}
              onChange={(e) =>
              setEngineDateFin && setEngineDateFin(e.target.value)
              }
              className="w-24 text-xs border-none focus:ring-0 p-1 text-slate-700 placeholder:text-slate-400" />
            
          </div>

          {/* Apply Button */}
          <button className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-sm transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Durée de fonctionnement moteur */}
          <div className="bg-gradient-to-br from-cyan-50 to-white rounded-xl p-6 border border-cyan-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">
                  Durée de fonctionnement moteur
                </h4>
                <p className="text-xs text-slate-600">Évolution mensuelle</p>
              </div>
              <button className="p-1.5 hover:bg-cyan-100 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-cyan-600" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={engineDurationData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e0f2fe"
                  vertical={false} />
                
                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  stroke="#cbd5e1" />
                
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  stroke="#cbd5e1"
                  domain={[0, 1400]} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0f2fe',
                    borderRadius: '8px'
                  }} />
                
                <Line
                  type="monotone"
                  dataKey="heures"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{
                    fill: '#06b6d4',
                    r: 4
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-end justify-between border-t border-cyan-200 pt-3">
              <span className="text-xs text-slate-600">Total ce mois</span>
              <span className="text-3xl font-bold text-cyan-600">1,245h</span>
            </div>
          </div>

          {/* Heures moteur totales */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">
                  Heures moteur totales
                </h4>
                <p className="text-xs text-slate-600">Cumul par mois</p>
              </div>
              <button className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-blue-600" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={totalEngineHoursData}>
                <defs>
                  <linearGradient id="colorHeures" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#dbeafe"
                  vertical={false} />
                
                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  stroke="#cbd5e1" />
                
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  stroke="#cbd5e1"
                  domain={[0, 80000]} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #dbeafe',
                    borderRadius: '8px'
                  }} />
                
                <Area
                  type="monotone"
                  dataKey="heures"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorHeures)" />
                
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-end justify-between border-t border-blue-200 pt-3">
              <span className="text-xs text-slate-600">Total flotte</span>
              <span className="text-3xl font-bold text-blue-600">62,450h</span>
            </div>
          </div>

          {/* Moteur on avec vitesse = 0 */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-6 border border-amber-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <StopCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">
                  Moteur on avec vitesse = 0
                </h4>
                <p className="text-xs text-slate-600">Temps ralenti mensuel</p>
              </div>
              <button className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-amber-600" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={idleTimeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#fef3c7"
                  vertical={false} />
                
                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  stroke="#cbd5e1" />
                
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  stroke="#cbd5e1"
                  domain={[0, 200]} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #fef3c7',
                    borderRadius: '8px'
                  }} />
                
                <Line
                  type="monotone"
                  dataKey="temps"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{
                    fill: '#f59e0b',
                    r: 4
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-end justify-between border-t border-amber-200 pt-3">
              <span className="text-xs text-slate-600">
                Gaspillage carburant
              </span>
              <span className="text-3xl font-bold text-amber-600">~374L</span>
            </div>
          </div>

          {/* Distance parcourue */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">
                  Distance parcourue
                </h4>
                <p className="text-xs text-slate-600">Kilomètres par mois</p>
              </div>
              <button className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors">
                <Eye className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={distanceData}>
                <defs>
                  <linearGradient
                    id="colorDistance"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#d1fae5"
                  vertical={false} />
                
                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  stroke="#cbd5e1" />
                
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#64748b'
                  }}
                  stroke="#cbd5e1"
                  domain={[0, 60000]} />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #d1fae5',
                    borderRadius: '8px'
                  }} />
                
                <Area
                  type="monotone"
                  dataKey="distance"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorDistance)" />
                
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-end justify-between border-t border-emerald-200 pt-3">
              <span className="text-xs text-slate-600">Moyenne/véhicule</span>
              <span className="text-3xl font-bold text-emerald-600">
                1,038 km
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>);

};
export const PerformanceSection: React.FC<SectionProps> = ({
  openIndicatorModal
}) =>
<motion.div
  initial={{
    opacity: 0,
    y: 20
  }}
  animate={{
    opacity: 1,
    y: 0
  }}
  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
  
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Performance Opérationnelle
          </h3>
          <p className="text-xs text-slate-600">
            Temps de conduite, immobilisation, distance
          </p>
        </div>
      </div>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
              Ce mois
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">892h</div>
          <div className="text-sm opacity-90 mb-4">Temps de conduite total</div>
          <div className="pt-4 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="opacity-75">Moyenne/véhicule</span>
              <span className="font-semibold">17.8h</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <AlertOctagon className="w-8 h-8 opacity-80" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
              Alerte
            </span>
          </div>
          <div className="text-4xl font-bold mb-2">48h</div>
          <div className="text-sm opacity-90 mb-4">
            Immobilisation non planifiée
          </div>
          <div className="pt-4 border-t border-white/20">
            <div className="flex justify-between text-xs">
              <span className="opacity-75">Perte exploitation</span>
              <span className="font-semibold">-5.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>;

export const FuelSection: React.FC<SectionProps> = ({
  openIndicatorModal,
  generateOverconsumptionVehicles,
  setShowFuelPriceModal
}) =>
<motion.div
  initial={{
    opacity: 0,
    y: 20
  }}
  animate={{
    opacity: 1,
    y: 0
  }}
  className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm border border-amber-200 overflow-hidden">
  
    <div className="px-6 py-4 border-b border-amber-200 flex items-center gap-3">
      <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
        <Fuel className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800">Carburant & Coûts</h3>
        <p className="text-xs text-slate-600">Consommation, coûts, rendement</p>
      </div>
      <button
      onClick={() => setShowFuelPriceModal?.(true)}
      className="p-2 hover:bg-amber-200 rounded-lg transition-colors group"
      title="Configurer le prix du litre">
      
        <Settings className="w-5 h-5 text-amber-700 group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>

    <div className="p-6 space-y-6">
      {/* Top 3 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Fuel className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800">104.40 L</div>
              <div className="text-xs text-slate-600 mt-1">
                Total de carburant utilisé
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800">1</div>
              <div className="text-xs text-slate-600 mt-1">
                Nombre de Remplissage
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
              <Droplet className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800">273.0 L</div>
              <div className="text-xs text-slate-600 mt-1">
                Total Remplissage
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Large Colored Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Coût carburant total */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
              +2%
            </span>
          </div>
          <DollarSign className="w-8 h-8 opacity-80 mb-4" />
          <div className="text-5xl font-bold mb-2">32,450</div>
          <div className="text-sm opacity-90 mb-4">
            TND - Coût carburant total
          </div>
          <div className="pt-4 border-t border-white/20 text-xs">
            <div className="opacity-75">6,234 L × 5.21 TND</div>
            <div className="font-semibold mt-1">Ce mois</div>
          </div>
        </div>

        {/* Véhicules en surconsommation */}
        <button
        onClick={() =>
        openIndicatorModal(
          'Surconsommation détectée',
          'Véhicules en surconsommation',
          generateOverconsumptionVehicles(),
          'Surconsommation'
        )
        }
        className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden text-left hover:scale-105 transition-transform">
        
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
              Alerte
            </span>
          </div>
          <AlertTriangle className="w-8 h-8 opacity-80 mb-4" />
          <div className="text-5xl font-bold mb-2">7</div>
          <div className="text-sm opacity-90 mb-4">
            Véhicules en surconsommation
          </div>
          <div className="pt-4 border-t border-white/20 text-xs">
            <div className="opacity-75">vs théorique</div>
            <div className="font-semibold mt-1">+18%</div>
          </div>
        </button>

        {/* km/litre moyen */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
              Bon
            </span>
          </div>
          <Droplet className="w-8 h-8 opacity-80 mb-4" />
          <div className="text-5xl font-bold mb-2">12.2</div>
          <div className="text-sm opacity-90 mb-4">km/litre moyen</div>
          <div className="pt-4 border-t border-white/20 text-xs">
            <div className="opacity-75">8.2 L/100km</div>
            <div className="font-semibold mt-1">-3%</div>
          </div>
        </div>

        {/* TND par km (ROI) */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
              ROI
            </span>
          </div>
          <BarChart3 className="w-8 h-8 opacity-80 mb-4" />
          <div className="text-5xl font-bold mb-2">0.71</div>
          <div className="text-sm opacity-90 mb-4">TND par km</div>
          <div className="pt-4 border-t border-white/20 text-xs">
            <div className="opacity-75">Carburant + maintenance</div>
            <div className="font-semibold mt-1">-5%</div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>;

export const DrivingQualitySection: React.FC<SectionProps> = ({
  openIndicatorModal,
  generateSpeedingVehicles,
  generateHarshBrakingVehicles
}) => {
  const consumptionData = [
  {
    vehicle: '1182 TU 147',
    consommation: 82.56,
    carburant: 8.9
  },
  {
    vehicle: '1186 TU 147',
    consommation: 0,
    carburant: 0
  },
  {
    vehicle: '41 TU 196',
    consommation: 21.34,
    carburant: 95.5
  },
  {
    vehicle: '7894 TU 215',
    consommation: 0,
    carburant: 0
  }];

  return (
    <>
      {/* Consommation moyenne & Carburant utilisé Chart */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm border border-amber-200 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Consommation moyenne & Carburant utilisé
              </h3>
              <p className="text-xs text-slate-600">Le 12/2025</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Date début"
              className="px-3 py-1.5 border border-amber-300 rounded-lg text-xs"
              defaultValue="2026/01/12 00:00:00" />
            
            <input
              type="text"
              placeholder="Date fin"
              className="px-3 py-1.5 border border-amber-300 rounded-lg text-xs"
              defaultValue="2026/01/19 23:59:59" />
            
            <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium">
              Filtre global
            </button>
          </div>
        </div>

        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={consumptionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#fef3c7"
                vertical={false} />
              
              <XAxis
                dataKey="vehicle"
                tick={{
                  fontSize: 11,
                  fill: '#64748b'
                }}
                stroke="#cbd5e1"
                angle={-45}
                textAnchor="end"
                height={80} />
              
              <YAxis
                yAxisId="left"
                tick={{
                  fontSize: 11,
                  fill: '#64748b'
                }}
                stroke="#cbd5e1"
                label={{
                  value: 'Consommation moyen',
                  angle: -90,
                  position: 'insideLeft',
                  style: {
                    fontSize: 11,
                    fill: '#64748b'
                  }
                }} />
              
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{
                  fontSize: 11,
                  fill: '#64748b'
                }}
                stroke="#cbd5e1"
                label={{
                  value: 'Carburant utilisé',
                  angle: 90,
                  position: 'insideRight',
                  style: {
                    fontSize: 11,
                    fill: '#64748b'
                  }
                }} />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #fef3c7',
                  borderRadius: '8px'
                }} />
              
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '20px'
                }} />
              
              <Bar
                yAxisId="left"
                dataKey="consommation"
                name="Consommation moyenne"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]} />
              
              <Bar
                yAxisId="right"
                dataKey="carburant"
                name="Carburant utilisé"
                fill="#ef4444"
                radius={[4, 4, 0, 0]} />
              
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Qualité de Conduite */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-purple-200 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Qualité de Conduite
            </h3>
            <p className="text-xs text-slate-600">
              Comportements, infractions, temps ralenti
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Accélérations brusques */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
                  Attention
                </span>
              </div>
              <Zap className="w-8 h-8 opacity-80 mb-4" />
              <div className="text-5xl font-bold mb-2">45</div>
              <div className="text-sm opacity-90 mb-4">
                Accélérations brusques
              </div>
              <div className="pt-4 border-t border-white/20 text-xs">
                <div className="opacity-75">Moyenne flotte</div>
                <div className="font-semibold mt-1">0.9/jour</div>
              </div>
            </div>

            {/* Freinages brusques */}
            <button
              onClick={() =>
              openIndicatorModal(
                'Conduite agressive (Freinage brusque)',
                'Véhicules avec freinages brusques détectés',
                generateHarshBrakingVehicles(),
                'Nombre'
              )
              }
              className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden text-left hover:scale-105 transition-transform">
              
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
                  Attention
                </span>
              </div>
              <AlertOctagon className="w-8 h-8 opacity-80 mb-4" />
              <div className="text-5xl font-bold mb-2">67</div>
              <div className="text-sm opacity-90 mb-4">Freinages brusques</div>
              <div className="pt-4 border-t border-white/20 text-xs">
                <div className="opacity-75">Moyenne flotte</div>
                <div className="font-semibold mt-1">1.3/jour</div>
              </div>
            </button>

            {/* Sur-régimes moteur */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
                  Élevé
                </span>
              </div>
              <Activity className="w-8 h-8 opacity-80 mb-4" />
              <div className="text-5xl font-bold mb-2">32</div>
              <div className="text-sm opacity-90 mb-4">Sur-régimes moteur</div>
              <div className="pt-4 border-t border-white/20 text-xs">
                <div className="opacity-75">RPM moyen</div>
                <div className="font-semibold mt-1">&gt;4500</div>
              </div>
            </div>

            {/* Excès de vitesse */}
            <button
              onClick={() =>
              openIndicatorModal(
                'Dépassement de vitesse',
                'Véhicules ayant commis des excès de vitesse',
                generateSpeedingVehicles(),
                'Vitesse max'
              )
              }
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden text-left hover:scale-105 transition-transform">
              
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
                  -15%
                </span>
              </div>
              <Gauge className="w-8 h-8 opacity-80 mb-4" />
              <div className="text-5xl font-bold mb-2">23</div>
              <div className="text-sm opacity-90 mb-4">
                Excès de vitesse détectés
              </div>
              <div className="pt-4 border-t border-white/20 text-xs">
                <div className="opacity-75">vs mois dernier</div>
                <div className="font-semibold mt-1">-4 incidents</div>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </>);

};
export const MaintenanceSection: React.FC<SectionProps> = ({
  openIndicatorModal,
  generateMaintenanceVehicles,
  SectionDateFilter,
  maintenanceDateDebut,
  setMaintenanceDateDebut,
  maintenanceDateFin,
  setMaintenanceDateFin
}) =>
<>
    <motion.div
    initial={{
      opacity: 0,
      y: 20
    }}
    animate={{
      opacity: 1,
      y: 0
    }}
    className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 overflow-hidden">
    
      <div className="px-6 py-4 border-b border-emerald-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Maintenance & Santé Véhicule
          </h3>
          <p className="text-xs text-slate-600">
            État, maintenance, prévisions
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* 3 Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Maintenances en retard */}
          <button
          onClick={() =>
          openIndicatorModal(
            'Maintenance en retard',
            'Véhicules nécessitant une maintenance urgente',
            generateMaintenanceVehicles(),
            'Retard'
          )
          }
          className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden text-left hover:scale-105 transition-transform">
          
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
                Urgent
              </span>
            </div>
            <AlertCircle className="w-8 h-8 opacity-80 mb-4" />
            <div className="text-5xl font-bold mb-2">3</div>
            <div className="text-sm opacity-90 mb-4">
              Maintenances en retard
            </div>
            <div className="pt-4 border-t border-white/20 text-xs">
              <div className="opacity-75">À planifier</div>
              <div className="font-semibold mt-1">+2 semaines</div>
            </div>
          </button>

          {/* km avant prochaine maintenance */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
                Proche
              </span>
            </div>
            <Gauge className="w-8 h-8 opacity-80 mb-4" />
            <div className="text-5xl font-bold mb-2">1,250</div>
            <div className="text-sm opacity-90 mb-4">
              km avant prochaine maintenance
            </div>
            <div className="pt-4 border-t border-white/20 text-xs">
              <div className="opacity-75">Fleet-007</div>
              <div className="font-semibold mt-1">-8 jours</div>
            </div>
          </div>

          {/* Entretiens achevés */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-bold">
                +20%
              </span>
            </div>
            <Award className="w-8 h-8 opacity-80 mb-4" />
            <div className="text-5xl font-bold mb-2">6</div>
            <div className="text-sm opacity-90 mb-4">Entretiens achevés</div>
            <div className="pt-4 border-t border-white/20 text-xs">
              <div className="opacity-75">Ce mois</div>
              <div className="font-semibold mt-1">100% conformité</div>
            </div>
          </div>
        </div>

        {/* Statut Maintenance Flotte */}
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  Statut Maintenance Flotte
                </h4>
                <p className="text-xs text-slate-600">Répartition par état</p>
              </div>
            </div>
            {SectionDateFilter &&
          <SectionDateFilter
            sectionDateDebut={maintenanceDateDebut}
            setSectionDateDebut={setMaintenanceDateDebut}
            sectionDateFin={maintenanceDateFin}
            setSectionDateFin={setMaintenanceDateFin}
            sectionTitle="Maintenance" />

          }
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
              data={maintenanceStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value">
              
                {maintenanceStatusData.map((entry, index) =>
              <Cell key={`cell-${index}`} fill={entry.color} />
              )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {maintenanceStatusData.map((item, idx) =>
          <div key={idx} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: item.color
                }} />
              
                  <span className="text-xs font-medium text-slate-600">
                    {item.name}
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {item.value}
                </div>
              </div>
          )}
          </div>
        </div>
      </div>
    </motion.div>
  </>;

export const PredictionSection: React.FC<SectionProps> = ({
  openIndicatorModal,
  generateMaintenanceVehicles,
  generateOverconsumptionVehicles,
  predictionVehicles = [],
  setPredictionVehicles,
  allVehicles = []
}) => {
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node))
      {
        setShowVehicleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const toggleVehicle = (id: string) => {
    if (!setPredictionVehicles) return;
    const newSelection = predictionVehicles.includes(id) ?
    predictionVehicles.filter((v) => v !== id) :
    [...predictionVehicles, id];
    setPredictionVehicles(newSelection);
  };
  const selectAll = () => {
    if (setPredictionVehicles)
    setPredictionVehicles(allVehicles.map((v) => v.id));
  };
  const deselectAll = () => {
    if (setPredictionVehicles) setPredictionVehicles([]);
  };
  const riskData = [
  {
    name: 'Risque',
    value: 23,
    fill: '#10b981'
  }];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl shadow-sm border border-violet-200 overflow-hidden">
      
      <div className="px-6 py-4 border-b border-violet-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Prédictions & IA
            </h3>
            <p className="text-xs text-slate-600">
              Anticipation des risques et maintenance prédictive
            </p>
          </div>
        </div>

        {/* Vehicle Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-violet-300 rounded-lg text-sm text-slate-700 hover:bg-violet-50 transition-colors shadow-sm">
              
              <Car className="w-4 h-4 text-violet-600" />
              <span className="max-w-[100px] truncate">
                {predictionVehicles.length === 0 ?
                'Tous les véhicules' :
                `${predictionVehicles.length} véhicule(s)`}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showVehicleDropdown &&
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-80 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <span className="text-xs font-semibold text-slate-700">
                    Sélectionner
                  </span>
                  <div className="flex gap-2">
                    <button
                    onClick={selectAll}
                    className="text-xs text-violet-600 hover:underline">
                    
                      Tout
                    </button>
                    <button
                    onClick={deselectAll}
                    className="text-xs text-slate-500 hover:underline">
                    
                      Rien
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-7 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-violet-500" />
                  
                  </div>
                  {allVehicles.map((vehicle) =>
                <label
                  key={vehicle.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                  
                      <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${predictionVehicles.includes(vehicle.id) ? 'bg-violet-600 border-violet-600' : 'border-slate-300 bg-white'}`}>
                    
                        {predictionVehicles.includes(vehicle.id) &&
                    <Check className="w-3 h-3 text-white" />
                    }
                      </div>
                      <span className="text-sm text-slate-700 truncate">
                        {vehicle.name}
                      </span>
                    </label>
                )}
                </div>
              </div>
            }
          </div>

          {/* Apply Button */}
          <button className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Risque de panne moteur */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-violet-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  Risque Panne
                </h4>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">
                Faible
              </span>
            </div>

            <div className="flex items-center justify-center h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={riskData}
                  startAngle={180}
                  endAngle={0}>
                  
                  <RadialBar background dataKey="value" cornerRadius={10} />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-bold fill-slate-800">
                    
                    23%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-center">
              <p className="text-xs text-slate-500">
                Basé sur heures moteur & comportement
              </p>
            </div>
          </div>

          {/* Prochaine vidange */}
          <button
            onClick={() =>
            openIndicatorModal(
              'Maintenance Prédictive',
              'Véhicules proches de leur prochaine vidange',
              generateMaintenanceVehicles(),
              'Km restants'
            )
            }
            className="bg-white rounded-xl p-6 shadow-sm border border-violet-100 relative overflow-hidden text-left hover:shadow-md transition-shadow group">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  Prochaine Vidange
                </h4>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                Moyenne
              </span>
            </div>

            <div className="mt-4 mb-2">
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold text-slate-800">2,450</span>
                <span className="text-sm font-medium text-slate-500 mb-1">
                  km restants
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-500 h-2.5 rounded-full w-[75%]" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Estimation: 18 jours</span>
              <span className="text-blue-600 font-medium group-hover:underline">
                Voir détails →
              </span>
            </div>
          </button>

          {/* Coût carburant estimé */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-violet-100 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  Coût Estimé
                </h4>
              </div>
              <span className="text-xs text-slate-500">Fin du mois</span>
            </div>

            <div className="mt-2">
              <div className="text-3xl font-bold text-slate-800">
                38,200{' '}
                <span className="text-lg text-slate-500 font-normal">TND</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-rose-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +4.2%
                </span>
                <span className="text-xs text-slate-400">vs mois dernier</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
              Basé sur consommation actuelle et prix carburant
            </div>
          </div>
        </div>
      </div>
    </motion.div>);

};
export const AlertsEvolutionSection: React.FC<SectionProps> = ({
  SectionDateFilter,
  alertsDateDebut,
  setAlertsDateDebut,
  alertsDateFin,
  setAlertsDateFin
}) =>
<motion.div
  initial={{
    opacity: 0,
    y: 20
  }}
  animate={{
    opacity: 1,
    y: 0
  }}
  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
  
    <div className="bg-gradient-to-r from-rose-50 to-rose-100 px-6 py-4 border-b border-rose-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center">
            <AlertOctagon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Évolution des Alertes
            </h3>
            <p className="text-xs text-slate-600">Tendances sur la période</p>
          </div>
        </div>
        {SectionDateFilter &&
      <SectionDateFilter
        sectionDateDebut={alertsDateDebut}
        setSectionDateDebut={setAlertsDateDebut}
        sectionDateFin={alertsDateFin}
        setSectionDateFin={setAlertsDateFin}
        sectionTitle="Alertes" />

      }
      </div>
    </div>
    <div className="p-6">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={alertsOverTimeData}>
          <defs>
            <linearGradient id="colorCritiques" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorWarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
          dataKey="date"
          tick={{
            fontSize: 12
          }}
          stroke="#94a3b8" />
        
          <YAxis
          tick={{
            fontSize: 12
          }}
          stroke="#94a3b8" />
        
          <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }} />
        
          <Legend
          wrapperStyle={{
            fontSize: '12px'
          }} />
        
          <Area
          type="monotone"
          dataKey="critiques"
          name="Critiques"
          stackId="1"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#colorCritiques)" />
        
          <Area
          type="monotone"
          dataKey="warnings"
          name="Warnings"
          stackId="1"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#colorWarnings)" />
        
          <Area
          type="monotone"
          dataKey="info"
          name="Info"
          stackId="1"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#colorInfo)" />
        
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>;