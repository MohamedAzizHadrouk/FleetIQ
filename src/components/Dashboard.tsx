import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Truck,
  Calendar,
  FileText,
  Wrench,
  Car,
  StopCircle,
  ChevronDown,
  Check,
  X,
  Settings,
  Save,
  Star,
  Trash2,
  Edit,
  Plus,
  Bell,
  AlertCircle,
  TrendingUp,
  Zap,
  Droplet,
  Gauge,
  Activity,
  Clock,
  DollarSign,
  TrendingDown,
  Wifi,
  WifiOff,
  Signal,
  Shield,
  Award,
  AlertOctagon,
  Navigation,
  Fuel,
  Euro,
  BarChart3,
  Target,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Brain,
  MapPin,
  Battery,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Timer,
  Route,
  GripVertical } from
'lucide-react';
import { Vehicle, VehicleStatus } from '../types';
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
import { useFilterManager } from '../hooks/useFilterManager';
import { FilterManager } from './FilterManager';
import { SaveFilterModal } from './SaveFilterModal';
import { IndicatorVehicleModal } from './IndicatorVehicleModal';
import { DateTimePicker } from './DateTimePicker';
import { GlobalStatisticsSection } from './GlobalStatisticsSection';
import { ModalHeader } from '@/components/ui/modal-header';
import {
  SpeedSection,
  EngineStatsSection,
  PerformanceSection,
  FuelSection,
  DrivingQualitySection,
  MaintenanceSection,
  PredictionSection } from
'./DashboardSections';
interface DashboardProps {
  vehicles: Vehicle[];
  onNavigateToVehicle?: (
  vehicleId: string,
  coordinates: [number, number])
  => void;
}
const generateMockVehicles = (): Vehicle[] => {
  const statuses: VehicleStatus[] = ['active', 'idle', 'offline'];
  const drivers = [
  'Jean Dupont',
  'Marie Martin',
  'Pierre Durand',
  'Sophie Bernard',
  'Lucas Petit',
  'Emma Thomas',
  'Antoine Moreau',
  'Camille Leroy',
  'Nicolas Simon',
  'Julie Laurent',
  'Thomas Blanc',
  'Sarah Girard',
  'Alexandre Roux',
  'Léa Fournier',
  'Maxime Bonnet',
  'Chloé Lambert'];

  const locations = [
  'Rue de Rivoli, Paris',
  'Avenue des Champs-Élysées',
  'Boulevard Haussmann',
  'Gare de Lyon',
  'Périphérique Nord',
  'Montmartre',
  'La Défense',
  'Bercy',
  'Nation',
  'République',
  'Bastille',
  'Opéra',
  'Châtelet',
  'Saint-Germain',
  'Marais',
  'Belleville',
  'Ménilmontant',
  'Oberkampf'];

  const vehicles: Vehicle[] = [];
  for (let i = 1; i <= 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const speed = status === 'active' ? Math.floor(Math.random() * 80) + 20 : 0;
    const batteryLevel =
    status === 'offline' ? 0 : Math.floor(Math.random() * 100);
    vehicles.push({
      id: `${i}`,
      name: `Fleet-${String(i).padStart(3, '0')}`,
      status,
      speed,
      location: locations[Math.floor(Math.random() * locations.length)],
      coordinates: [
      48.8566 + (Math.random() - 0.5) * 0.1,
      2.3522 + (Math.random() - 0.5) * 0.1],

      lastUpdate:
      status === 'active' ?
      "À l'instant" :
      status === 'idle' ?
      `Il y a ${Math.floor(Math.random() * 30)} min` :
      `Il y a ${Math.floor(Math.random() * 5) + 1}h`,
      driver: drivers[Math.floor(Math.random() * drivers.length)],
      batteryLevel
    });
  }
  return vehicles;
};
const MOCK_VEHICLES = generateMockVehicles();
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

type SectionKey =
'alerts' |
'speed' |
'engineStats' |
'performance' |
'fuel' |
'drivingQuality' |
'maintenance' |
'prediction' |
'documents';
interface SectionConfig {
  key: SectionKey;
  label: string;
  icon: any;
  visible: boolean;
}
export function Dashboard({ vehicles, onNavigateToVehicle }: DashboardProps) {
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [watchedVehicles, setWatchedVehicles] = useState<string[]>([]);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [fuelDateDebut, setFuelDateDebut] = useState('');
  const [fuelDateFin, setFuelDateFin] = useState('');
  const [drivingDateDebut, setDrivingDateDebut] = useState('');
  const [drivingDateFin, setDrivingDateFin] = useState('');
  const [maintenanceDateDebut, setMaintenanceDateDebut] = useState('');
  const [maintenanceDateFin, setMaintenanceDateFin] = useState('');
  const [alertsDateDebut, setAlertsDateDebut] = useState('');
  const [alertsDateFin, setAlertsDateFin] = useState('');
  const [showFuelPriceModal, setShowFuelPriceModal] = useState(false);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState('5.21');
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showSectionConfig, setShowSectionConfig] = useState(false);
  // New states for EngineStatsSection filters
  const [engineVehicles, setEngineVehicles] = useState<string[]>([]);
  const [engineDateDebut, setEngineDateDebut] = useState('');
  const [engineDateFin, setEngineDateFin] = useState('');
  // New state for SpeedSection pagination
  const [speedChartPage, setSpeedChartPage] = useState(0);
  // New state for PredictionSection filters
  const [predictionVehicles, setPredictionVehicles] = useState<string[]>([]);
  const [sections, setSections] = useState([
  {
    key: 'alerts',
    label: 'Alertes Récentes',
    icon: Bell,
    visible: true
  },
  {
    key: 'speed',
    label: 'Vitesse',
    icon: Gauge,
    visible: true
  },
  {
    key: 'engineStats',
    label: 'Statistiques Moteur & Distance',
    icon: Timer,
    visible: true
  },
  {
    key: 'performance',
    label: 'Performance Opérationnelle',
    icon: Activity,
    visible: true
  },
  {
    key: 'fuel',
    label: 'Carburant & Coûts',
    icon: Fuel,
    visible: true
  },
  {
    key: 'drivingQuality',
    label: 'Qualité de Conduite',
    icon: Award,
    visible: true
  },
  {
    key: 'maintenance',
    label: 'Maintenance & Santé',
    icon: Wrench,
    visible: true
  },
  {
    key: 'prediction',
    label: 'Prédictions & IA',
    icon: Brain,
    visible: true
  },
  {
    key: 'documents',
    label: 'Documents à Traiter',
    icon: FileText,
    visible: true
  }]
  );
  const filterManager = useFilterManager('dashboard_filters');
  const [activeIndicatorModal, setActiveIndicatorModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    vehicles: any[];
    valueLabel?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    vehicles: []
  });
  useEffect(() => {
    const defaultFilter = filterManager.getDefaultFilter();
    if (defaultFilter) {
      const dates = filterManager.calculateDates(defaultFilter.duration);
      setSelectedVehicles(defaultFilter.vehicles);
      setDateDebut(dates.dateDebut);
      setDateFin(dates.dateFin);
    } else {
      const now = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const formatDate = (date: Date) => {
        return (
          date.toLocaleDateString('fr-FR').split('/').reverse().join('/') + (
          date === now ? ' 23:59:59' : ' 00:00:00'));

      };
      setDateDebut(formatDate(lastWeek));
      setDateFin(formatDate(now));
    }
  }, []);
  const handleGenerate = () => {
    setShowStats(true);
  };
  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicles((prev) =>
    prev.includes(vehicleId) ?
    prev.filter((id) => id !== vehicleId) :
    [...prev, vehicleId]
    );
  };
  const clearSelection = () => {
    setSelectedVehicles([]);
  };
  const handleSaveFilter = (
  durationType: 'relative' | 'fixed',
  unit?: any,
  value?: number) =>
  {
    filterManager.saveFilter(
      {
        vehicles: selectedVehicles
      },
      durationType,
      unit,
      value,
      dateDebut,
      dateFin
    );
  };
  const handleApplyFilter = (
  filter: any,
  dates: {
    dateDebut: string;
    dateFin: string;
  }) =>
  {
    setSelectedVehicles(filter.vehicles);
    setDateDebut(dates.dateDebut);
    setDateFin(dates.dateFin);
    setShowStats(true);
  };
  const singleVehicleMetrics =
  selectedVehicles.length === 1 ?
  {
    avgConsumption: (Math.random() * 3 + 7).toFixed(1),
    avgSpeed: Math.floor(Math.random() * 20 + 50)
  } :
  null;
  const getEffectiveDates = (sectionStart: string, sectionEnd: string) => {
    return {
      start: sectionStart || dateDebut,
      end: sectionEnd || dateFin
    };
  };
  const recentAlerts = [
  {
    id: 1,
    vehicle: 'Fleet-001',
    type: 'Excès de vitesse',
    message: '142 km/h détecté sur A1',
    time: 'Il y a 5 min',
    severity: 'critical',
    isRead: false
  },
  {
    id: 2,
    vehicle: 'Fleet-003',
    type: 'Niveau carburant bas',
    message: 'Carburant à 12%',
    time: 'Il y a 15 min',
    severity: 'warning',
    isRead: false
  },
  {
    id: 3,
    vehicle: 'Fleet-007',
    type: 'Maintenance requise',
    message: 'Révision dans 200 km',
    time: 'Il y a 1h',
    severity: 'info',
    isRead: true
  },
  {
    id: 4,
    vehicle: 'Fleet-002',
    type: 'Sortie de zone',
    message: 'Véhicule hors géofence',
    time: 'Il y a 2h',
    severity: 'warning',
    isRead: false
  },
  {
    id: 5,
    vehicle: 'Fleet-012',
    type: 'Arrêt prolongé',
    message: 'Arrêt depuis 3h',
    time: 'Il y a 3h',
    severity: 'info',
    isRead: true
  }];

  const unreadAlertsCount = recentAlerts.filter((a) => !a.isRead).length;
  const documentsToProcess = [
  {
    id: 1,
    vehicle: 'Fleet-001',
    type: 'Assurance',
    document: 'Renouvellement assurance',
    dueDate: '15/01/2026',
    priority: 'high'
  },
  {
    id: 2,
    vehicle: 'Fleet-005',
    type: 'Contrôle technique',
    document: 'CT à effectuer',
    dueDate: '20/01/2026',
    priority: 'high'
  },
  {
    id: 3,
    vehicle: 'Fleet-003',
    type: 'Carte grise',
    document: 'Mise à jour carte grise',
    dueDate: '25/01/2026',
    priority: 'medium'
  },
  {
    id: 4,
    vehicle: 'Fleet-008',
    type: 'Vignette',
    document: "Vignette Crit'Air",
    dueDate: '30/01/2026',
    priority: 'medium'
  },
  {
    id: 5,
    vehicle: 'Fleet-011',
    type: 'Contrat',
    document: 'Contrat de location',
    dueDate: '05/02/2026',
    priority: 'low'
  }];

  const SectionDateFilter = ({
    sectionDateDebut,
    setSectionDateDebut,
    sectionDateFin,
    setSectionDateFin,
    sectionTitle






  }: {sectionDateDebut: string;setSectionDateDebut: (date: string) => void;sectionDateFin: string;setSectionDateFin: (date: string) => void;sectionTitle: string;}) => {
    const effectiveDates = getEffectiveDates(sectionDateDebut, sectionDateFin);
    const isUsingGlobalFilter = !sectionDateDebut && !sectionDateFin;
    return (
      <div className="flex items-center gap-2">
        <DateTimePicker
          value={sectionDateDebut}
          onChange={setSectionDateDebut}
          placeholder={dateDebut}
          label="Date début" />
        
        <span className="text-xs text-slate-500">→</span>
        <DateTimePicker
          value={sectionDateFin}
          onChange={setSectionDateFin}
          placeholder={dateFin}
          label="Date fin" />
        
        {!isUsingGlobalFilter &&
        <button
          onClick={() => {
            setSectionDateDebut('');
            setSectionDateFin('');
          }}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Réinitialiser au filtre global">
          
            <X className="w-4 h-4 text-slate-600" />
          </button>
        }
        {isUsingGlobalFilter &&
        <span className="text-xs text-slate-500 bg-blue-50 px-2 py-1 rounded">
            Filtre global
          </span>
        }
      </div>);

  };
  const openIndicatorModal = (
  title: string,
  description: string,
  vehicles: any[],
  valueLabel?: string) =>
  {
    setActiveIndicatorModal({
      isOpen: true,
      title,
      description,
      vehicles,
      valueLabel
    });
  };
  const handleNavigateToMap = (vehicle: any) => {
    setActiveIndicatorModal({
      ...activeIndicatorModal,
      isOpen: false
    });
    if (onNavigateToVehicle) {
      onNavigateToVehicle(vehicle.vehicleId, vehicle.coordinates);
    }
  };
  const generateSpeedingVehicles = () => {
    return MOCK_VEHICLES.filter((_, idx) => idx % 5 === 0).map((v) => ({
      vehicleId: v.id,
      vehicleName: v.name,
      driver: v.driver,
      location: v.location,
      coordinates: v.coordinates,
      value: `${Math.floor(Math.random() * 30) + 90} km/h`,
      details: `Limite: 70 km/h`
    }));
  };
  const generateOverconsumptionVehicles = () => {
    return MOCK_VEHICLES.filter((_, idx) => idx % 7 === 0).map((v) => ({
      vehicleId: v.id,
      vehicleName: v.name,
      driver: v.driver,
      location: v.location,
      coordinates: v.coordinates,
      value: `+${Math.floor(Math.random() * 20) + 10}%`,
      details: `Surconsommation vs théorique`
    }));
  };
  const generateHarshBrakingVehicles = () => {
    return MOCK_VEHICLES.filter((_, idx) => idx % 6 === 0).map((v) => ({
      vehicleId: v.id,
      vehicleName: v.name,
      driver: v.driver,
      location: v.location,
      coordinates: v.coordinates,
      value: `${Math.floor(Math.random() * 15) + 5} freinages`,
      details: `Dernières 24h`
    }));
  };
  const generateMaintenanceVehicles = () => {
    return MOCK_VEHICLES.filter((_, idx) => idx % 10 === 0).map((v) => ({
      vehicleId: v.id,
      vehicleName: v.name,
      driver: v.driver,
      location: v.location,
      coordinates: v.coordinates,
      value: `+${Math.floor(Math.random() * 20) + 5} jours`,
      details: `Maintenance en retard`
    }));
  };
  const generateSpeedingVehiclesForAlerts = () => {
    return speedByVehicleData.
    map((v, idx) => {
      const mockVehicle = MOCK_VEHICLES[idx] || MOCK_VEHICLES[0];
      return {
        vehicleId: mockVehicle.id,
        vehicleName: v.vehicle,
        driver: mockVehicle.driver,
        location: mockVehicle.location,
        coordinates: mockVehicle.coordinates,
        value: `${v.maxSpeed} km/h`,
        details: `Limite dépassée: ${Math.floor(v.maxSpeed - 70)} km/h`
      };
    }).
    filter((v) => parseInt(v.value) > 70);
  };
  const generateMaxSpeedVehicles = () => {
    return speedByVehicleData.
    map((v, idx) => {
      const mockVehicle = MOCK_VEHICLES[idx] || MOCK_VEHICLES[0];
      return {
        vehicleId: mockVehicle.id,
        vehicleName: v.vehicle,
        driver: mockVehicle.driver,
        location: mockVehicle.location,
        coordinates: mockVehicle.coordinates,
        value: `${v.maxSpeed} km/h`,
        details: `Vitesse maximale enregistrée`
      };
    }).
    sort((a, b) => parseInt(b.value) - parseInt(a.value));
  };
  const generateTop5SpeedVehicles = () => {
    return topSpeedVehicles.map((v, idx) => {
      const mockVehicle = MOCK_VEHICLES[idx] || MOCK_VEHICLES[0];
      return {
        vehicleId: mockVehicle.id,
        vehicleName: v.vehicle,
        driver: mockVehicle.driver,
        location: mockVehicle.location,
        coordinates: mockVehicle.coordinates,
        value: `${v.speed} km/h`,
        details: `Classement: #${idx + 1}`
      };
    });
  };
  const toggleWatchedVehicle = (vehicleName: string) => {
    setWatchedVehicles((prev) =>
    prev.includes(vehicleName) ?
    prev.filter((name) => name !== vehicleName) :
    [...prev, vehicleName]
    );
  };
  const toggleSectionVisibility = (key: SectionKey) => {
    setSections((prev) =>
    prev.map((s) =>
    s.key === key ?
    {
      ...s,
      visible: !s.visible
    } :
    s
    )
    );
  };
  const isSectionVisible = (key: SectionKey) => {
    return sections.find((s) => s.key === key)?.visible ?? true;
  };
  const renderSection = (section: SectionConfig) => {
    if (!section.visible) return null;
    const sectionProps = {
      openIndicatorModal,
      generateSpeedingVehiclesForAlerts,
      generateMaxSpeedVehicles,
      generateTop5SpeedVehicles,
      generateSpeedingVehicles,
      generateOverconsumptionVehicles,
      generateHarshBrakingVehicles,
      generateMaintenanceVehicles,
      SectionDateFilter,
      fuelDateDebut,
      setFuelDateDebut,
      fuelDateFin,
      setFuelDateFin,
      drivingDateDebut,
      setDrivingDateDebut,
      drivingDateFin,
      setDrivingDateFin,
      maintenanceDateDebut,
      setMaintenanceDateDebut,
      maintenanceDateFin,
      setMaintenanceDateFin,
      alertsDateDebut,
      setAlertsDateDebut,
      alertsDateFin,
      setAlertsDateFin,
      setShowFuelPriceModal,
      // New props for EngineStatsSection
      engineVehicles,
      setEngineVehicles,
      engineDateDebut,
      setEngineDateDebut,
      engineDateFin,
      setEngineDateFin,
      allVehicles: MOCK_VEHICLES,
      // New props for SpeedSection
      speedChartPage,
      setSpeedChartPage,
      // New props for PredictionSection
      predictionVehicles,
      setPredictionVehicles
    };
    switch (section.key) {
      case 'alerts':
        return (
          <motion.button
            key={section.key}
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            transition={{
              delay: 0.05
            }}
            onClick={() => setShowAlertsModal(true)}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Bell className="w-7 h-7 text-white animate-pulse" />
                  </div>
                  {unreadAlertsCount > 0 &&
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-xs font-bold text-rose-900">
                        {unreadAlertsCount}
                      </span>
                    </div>
                  }
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">
                    Alertes Récentes
                  </h3>
                  <p className="text-sm text-white/80">
                    {recentAlerts.length} alerte(s) • {unreadAlertsCount} non
                    vue(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
                  <span className="text-3xl font-bold text-white">
                    {recentAlerts.length}
                  </span>
                </div>
                <ChevronDown className="w-6 h-6 text-white/80 group-hover:translate-y-1 transition-transform" />
              </div>
            </div>
          </motion.button>);

      case 'speed':
        return <SpeedSection key={section.key} {...sectionProps} />;
      case 'engineStats':
        return <EngineStatsSection key={section.key} {...sectionProps} />;
      case 'performance':
        return <PerformanceSection key={section.key} {...sectionProps} />;
      case 'fuel':
        return <FuelSection key={section.key} {...sectionProps} />;
      case 'drivingQuality':
        return <DrivingQualitySection key={section.key} {...sectionProps} />;
      case 'maintenance':
        return <MaintenanceSection key={section.key} {...sectionProps} />;
      case 'prediction':
        return <PredictionSection key={section.key} {...sectionProps} />;
      case 'documents':
        return (
          <motion.button
            key={section.key}
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            transition={{
              delay: 0.1
            }}
            onClick={() => setShowDocumentsModal(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  {documentsToProcess.filter((d) => d.priority === 'high').
                  length > 0 &&
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-xs font-bold text-white">
                        {
                      documentsToProcess.filter(
                        (d) => d.priority === 'high'
                      ).length
                      }
                      </span>
                    </div>
                  }
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-1">
                    Documents à Traiter
                  </h3>
                  <p className="text-sm text-white/80">
                    {documentsToProcess.length} document(s) •{' '}
                    {
                    documentsToProcess.filter((d) => d.priority === 'high').
                    length
                    }{' '}
                    urgent(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
                  <span className="text-3xl font-bold text-white">
                    {documentsToProcess.length}
                  </span>
                </div>
                <ChevronDown className="w-6 h-6 text-white/80 group-hover:translate-y-1 transition-transform" />
              </div>
            </div>
          </motion.button>);

      default:
        return null;
    }
  };
  return (
    <div className="h-full overflow-y-auto bg-slate-50 relative">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-4 shadow-lg">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>

              <div className="relative">
                <button
                  onClick={() =>
                  filterManager.setShowFilterManager(
                    !filterManager.showFilterManager
                  )
                  }
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/20 transition-all group"
                  title="Gérer les filtres">
                  
                  <Settings className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <FilterManager
                  show={filterManager.showFilterManager}
                  onClose={() => filterManager.setShowFilterManager(false)}
                  savedFilters={filterManager.savedFilters}
                  onApply={(filter) =>
                  filterManager.applyFilter(filter, handleApplyFilter)
                  }
                  onSetDefault={filterManager.setDefaultFilter}
                  onDelete={filterManager.deleteFilter}
                  onUpdateName={filterManager.updateFilterName}
                  onSaveNew={() => {
                    filterManager.setShowSaveFilter(true);
                    filterManager.setShowFilterManager(false);
                  }}
                  editingFilter={filterManager.editingFilter}
                  setEditingFilter={filterManager.setEditingFilter}
                  getDurationLabel={filterManager.getDurationLabel} />
                
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                  className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20 shadow-lg hover:bg-white transition-colors">
                  
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    <div className="text-left">
                      <label className="text-xs text-slate-500 font-medium block">
                        Véhicules
                      </label>
                      <span className="text-sm font-semibold text-slate-800">
                        {selectedVehicles.length === 0 ?
                        'Tous les véhicules' :
                        `${selectedVehicles.length} sélectionné(s)`}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </div>
                </button>

                {showVehicleDropdown &&
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-800">
                          Sélectionner des véhicules
                        </h3>
                        {selectedVehicles.length > 0 &&
                      <button
                        onClick={clearSelection}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        
                            Tout désélectionner
                          </button>
                      }
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                        type="text"
                        placeholder="Rechercher un véhicule..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                      {MOCK_VEHICLES.map((vehicle) =>
                    <label
                      key={vehicle.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                      
                          <input
                        type="checkbox"
                        checked={selectedVehicles.includes(vehicle.id)}
                        onChange={() => toggleVehicle(vehicle.id)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                      
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">
                              {vehicle.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {vehicle.driver}
                            </p>
                          </div>
                          <span
                        className={`w-2 h-2 rounded-full ${vehicle.status === 'active' ? 'bg-emerald-500' : vehicle.status === 'idle' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      
                        </label>
                    )}
                    </div>

                    <div className="p-3 border-t border-slate-200 bg-slate-50">
                      <button
                      onClick={() => setShowVehicleDropdown(false)}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                      
                        Appliquer
                      </button>
                    </div>
                  </div>
                }
              </div>

              <DateTimePicker
                value={dateDebut}
                onChange={setDateDebut}
                placeholder="Sélectionner date début"
                label="Date début *" />
              

              <DateTimePicker
                value={dateFin}
                onChange={setDateFin}
                placeholder="Sélectionner date fin"
                label="Date fin *" />
              

              <button
                onClick={handleGenerate}
                className="bg-white hover:bg-blue-50 text-blue-600 px-8 py-3 rounded-lg font-bold shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95">
                
                Générer
              </button>
            </div>
          </div>
        </div>
      </div>

      <SaveFilterModal
        show={filterManager.showSaveFilter}
        onClose={() => filterManager.setShowSaveFilter(false)}
        filterName={filterManager.filterName}
        setFilterName={filterManager.setFilterName}
        onSave={handleSaveFilter}
        currentDateDebut={dateDebut}
        currentDateFin={dateFin}
        filterPreview={
        <div className="space-y-1 text-xs text-slate-600">
            <p>
              •{' '}
              {selectedVehicles.length === 0 ?
            'Tous les véhicules' :
            `${selectedVehicles.length} véhicule(s)`}
            </p>
          </div>
        } />
      

      <IndicatorVehicleModal
        isOpen={activeIndicatorModal.isOpen}
        onClose={() =>
        setActiveIndicatorModal({
          ...activeIndicatorModal,
          isOpen: false
        })
        }
        title={activeIndicatorModal.title}
        description={activeIndicatorModal.description}
        vehicles={activeIndicatorModal.vehicles}
        onNavigateToMap={handleNavigateToMap}
        valueLabel={activeIndicatorModal.valueLabel} />
      

      <AnimatePresence mode="wait">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -20
          }}
          transition={{
            duration: 0.4
          }}
          className="p-4 pb-24">
          
          <div className="w-full space-y-6">
            {selectedVehicles.length > 0 &&
            <motion.div
              initial={{
                opacity: 0,
                y: -10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Filter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Filtrage actif
                      </p>
                      <p className="text-xs text-blue-700">
                        {selectedVehicles.length} véhicule(s) sélectionné(s)
                      </p>
                    </div>
                  </div>
                  <button
                  onClick={clearSelection}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 transition-colors">
                  
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                </div>
              </motion.div>
            }

            <GlobalStatisticsSection
              vehicles={
              selectedVehicles.length > 0 ?
              MOCK_VEHICLES.filter((v) => selectedVehicles.includes(v.id)) :
              MOCK_VEHICLES
              }
              alertsCount={recentAlerts.length}
              criticalAlertsCount={
              recentAlerts.filter((a) => a.severity === 'critical').length
              }
              documentsCount={documentsToProcess.length}
              urgentDocumentsCount={
              documentsToProcess.filter((d) => d.priority === 'high').length
              } />
            

            {sections.map((section) => renderSection(section))}
          </div>
        </motion.div>
      </AnimatePresence>

      {!showSectionConfig &&
      <button
        onClick={() => setShowSectionConfig(true)}
        className="fixed right-4 bottom-4 z-40 group">
        
          <div className="relative">
            <div className="relative w-16 h-16 bg-white hover:bg-slate-50 rounded-full shadow-2xl border-2 border-slate-200 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <Activity className="w-7 h-7 text-blue-600" />
            </div>
          </div>

          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
              Configurer les sections
              <div className="absolute top-full right-4 -mt-1">
                <div className="border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          </div>
        </button>
      }

      <AnimatePresence>
        {showSectionConfig &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSectionConfig(false)}>
          
            <motion.div
            initial={{
              scale: 0.95,
              opacity: 0
            }}
            animate={{
              scale: 1,
              opacity: 1
            }}
            exit={{
              scale: 0.95,
              opacity: 0
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            
              <ModalHeader
                title="Configuration des sections"
                icon={<Activity className="w-5 h-5 text-primary-foreground shrink-0" />}
                onClose={() => setShowSectionConfig(false)}
                size="compact"
              />

              <div className="p-3 max-h-[calc(80vh-140px)] overflow-y-auto">
                <Reorder.Group
                axis="y"
                values={sections}
                onReorder={setSections}
                className="space-y-2">
                
                  {sections.map((section) =>
                <Reorder.Item
                  key={section.key}
                  value={section}
                  className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-move hover:border-blue-300 transition-colors">
                  
                      <GripVertical className="w-4 h-4 text-slate-400" />
                      <input
                    type="checkbox"
                    checked={section.visible}
                    onChange={() => toggleSectionVisibility(section.key)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()} />
                  
                      <section.icon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700 flex-1">
                        {section.label}
                      </span>
                    </Reorder.Item>
                )}
                </Reorder.Group>
              </div>

              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <button
                onClick={() => setShowSectionConfig(false)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                
                  Appliquer
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {showAlertsModal &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAlertsModal(false)}>
          
            <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
              y: 20
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0
            }}
            exit={{
              scale: 0.9,
              opacity: 0,
              y: 20
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            
              <ModalHeader
                title="Alertes Récentes"
                subtitle={`${recentAlerts.length} alerte(s) • ${recentAlerts.filter((a) => a.severity === 'critical').length} critique(s)`}
                icon={<Bell className="w-6 h-6 text-primary-foreground shrink-0" />}
                onClose={() => setShowAlertsModal(false)}
              />

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                <div className="space-y-3">
                  {recentAlerts.map((alert, index) =>
                <motion.div
                  key={alert.id}
                  initial={{
                    opacity: 0,
                    x: -20
                  }}
                  animate={{
                    opacity: 1,
                    x: 0
                  }}
                  transition={{
                    delay: index * 0.05
                  }}
                  className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${alert.severity === 'critical' ? 'bg-rose-50 border-rose-200 hover:border-rose-300' : alert.severity === 'warning' ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-blue-50 border-blue-200 hover:border-blue-300'}`}>
                  
                      <div className="flex items-start gap-4">
                        <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.severity === 'critical' ? 'bg-rose-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                      
                          {alert.severity === 'critical' ?
                      <AlertOctagon className="w-6 h-6 text-white" /> :
                      alert.severity === 'warning' ?
                      <AlertTriangle className="w-6 h-6 text-white" /> :

                      <AlertCircle className="w-6 h-6 text-white" />
                      }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h4 className="text-lg font-bold text-slate-800">
                              {alert.vehicle}
                            </h4>
                            <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${alert.severity === 'critical' ? 'bg-rose-500 text-white' : alert.severity === 'warning' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>
                          
                              {alert.severity === 'critical' ?
                          'CRITIQUE' :
                          alert.severity === 'warning' ?
                          'ATTENTION' :
                          'INFO'}
                            </span>
                          </div>
                          <p className="text-base font-semibold text-slate-700 mb-2">
                            {alert.type}
                          </p>
                          <p className="text-sm text-slate-600 mb-3">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span>{alert.time}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                )}
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                onClick={() => setShowAlertsModal(false)}
                className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
                
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {showDocumentsModal &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDocumentsModal(false)}>
          
            <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
              y: 20
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0
            }}
            exit={{
              scale: 0.9,
              opacity: 0,
              y: 20
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            
              <ModalHeader
                title="Documents à Traiter"
                subtitle={`${documentsToProcess.length} document(s) • ${documentsToProcess.filter((d) => d.priority === 'high').length} urgent(s)`}
                icon={<FileText className="w-6 h-6 text-primary-foreground shrink-0" />}
                onClose={() => setShowDocumentsModal(false)}
              />

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                <div className="space-y-3">
                  {documentsToProcess.map((doc, index) =>
                <motion.div
                  key={doc.id}
                  initial={{
                    opacity: 0,
                    x: -20
                  }}
                  animate={{
                    opacity: 1,
                    x: 0
                  }}
                  transition={{
                    delay: index * 0.05
                  }}
                  className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${doc.priority === 'high' ? 'bg-rose-50 border-rose-200 hover:border-rose-300' : doc.priority === 'medium' ? 'bg-amber-50 border-amber-200 hover:border-amber-300' : 'bg-blue-50 border-blue-200 hover:border-blue-300'}`}>
                  
                      <div className="flex items-start gap-4">
                        <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.priority === 'high' ? 'bg-rose-500' : doc.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                      
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h4 className="text-lg font-bold text-slate-800">
                              {doc.vehicle}
                            </h4>
                            <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${doc.priority === 'high' ? 'bg-rose-500 text-white' : doc.priority === 'medium' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>
                          
                              {doc.priority === 'high' ?
                          'URGENT' :
                          doc.priority === 'medium' ?
                          'MOYEN' :
                          'BAS'}
                            </span>
                          </div>
                          <p className="text-base font-semibold text-slate-700 mb-2">
                            {doc.type}
                          </p>
                          <p className="text-sm text-slate-600 mb-3">
                            {doc.document}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span>Échéance: {doc.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                )}
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                onClick={() => setShowDocumentsModal(false)}
                className="px-6 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
                
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}