import React, { useEffect, useState, useRef } from 'react';
import { Vehicle } from '../types';
import { DateTimePicker } from './DateTimePicker';
import {
  ChevronDown,
  Search,
  Filter,
  Gauge,
  Hand,
  DoorOpen,
  UserCircle,
  User,
  Shield,
  Thermometer,
  Droplets,
  Battery,
  Circle,
  Fuel,
  Wrench,
  Disc,
  LifeBuoy,
  MapPin,
  Clock,
  ArrowLeft,
  History,
  AlertCircle,
  Calendar } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface DashboardAlertsContentProps {
  vehicles: Vehicle[];
  onNavigateToVehicle?: (
  vehicleId: string,
  coordinates: [number, number])
  => void;
}
interface DashboardAlert {
  id: string;
  vehicleId: string;
  vehicleName: string;
  department: string;
  timestamp: Date;
  location: string;
  coordinates: [number, number];
  indicatorType: string;
  indicatorValue: boolean | string;
}
interface IndicatorSummary {
  type: string;
  label: string;
  icon: React.ElementType;
  count: number;
  alerts: DashboardAlert[];
}
const DEPARTMENTS = [
'Latrace',
'Transport',
'Logistique',
'Commercial',
'Maintenance'];

const INDICATOR_CONFIGS = [
{
  type: 'handbrake',
  label: 'Frein à main',
  icon: Hand
},
{
  type: 'doors',
  label: 'Portes',
  icon: DoorOpen
},
{
  type: 'passengerDoor',
  label: 'Porte passager',
  icon: UserCircle
},
{
  type: 'driverDoor',
  label: 'Porte du conducteur',
  icon: User
},
{
  type: 'seatbelt',
  label: 'Ceinture',
  icon: Shield
},
{
  type: 'engineTemp',
  label: 'Temp. Moteur',
  icon: Thermometer
},
{
  type: 'oilPressure',
  label: 'Pression Huile',
  icon: Droplets
},
{
  type: 'battery',
  label: 'Batterie',
  icon: Battery
},
{
  type: 'tirePressure',
  label: 'Pression Pneus',
  icon: Circle
},
{
  type: 'fuel',
  label: 'Carburant',
  icon: Fuel
},
{
  type: 'checkEngine',
  label: 'Check Engine',
  icon: Wrench
},
{
  type: 'abs',
  label: 'ABS',
  icon: Disc
},
{
  type: 'airbag',
  label: 'Airbag',
  icon: LifeBuoy
}];

export function DashboardAlertsContent({
  vehicles,
  onNavigateToVehicle
}: DashboardAlertsContentProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(
    new Set()
  );
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(
    new Set()
  );
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
  useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [allAlerts, setAllAlerts] = useState<DashboardAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<DashboardAlert[]>([]);
  const [indicatorSummaries, setIndicatorSummaries] = useState<
    IndicatorSummary[]>(
    []);
  const [selectedIndicator, setSelectedIndicator] =
  useState<IndicatorSummary | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const departmentDropdownRef = useRef<HTMLDivElement>(null);
  // Initialize dates to last 24h
  useEffect(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  }, []);
  // Generate mock alerts
  useEffect(() => {
    const generateMockAlerts = () => {
      const mockAlerts: DashboardAlert[] = [];
      const now = new Date();
      vehicles.forEach((vehicle) => {
        const dept = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
        // Generate random alerts for different indicators
        INDICATOR_CONFIGS.forEach((config) => {
          // 20% chance of having an alert for this indicator
          if (Math.random() > 0.8) {
            const alertCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < alertCount; i++) {
              const time = new Date(
                now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
              );
              mockAlerts.push({
                id: `${vehicle.id}-${config.type}-${i}`,
                vehicleId: vehicle.id,
                vehicleName: vehicle.name,
                department: dept,
                timestamp: time,
                location: vehicle.location,
                coordinates: vehicle.coordinates,
                indicatorType: config.type,
                indicatorValue: true
              });
            }
          }
        });
      });
      return mockAlerts.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    };
    setAllAlerts(generateMockAlerts());
  }, [vehicles]);
  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      vehicleDropdownRef.current &&
      !vehicleDropdownRef.current.contains(event.target as Node))
      {
        setIsVehicleDropdownOpen(false);
      }
      if (
      departmentDropdownRef.current &&
      !departmentDropdownRef.current.contains(event.target as Node))
      {
        setIsDepartmentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Apply filters
  const applyFilters = () => {
    let filtered = [...allAlerts];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter(
        (a) => a.timestamp >= start && a.timestamp <= end
      );
    }
    if (selectedVehicles.size > 0) {
      filtered = filtered.filter((a) => selectedVehicles.has(a.vehicleId));
    }
    if (selectedDepartments.size > 0) {
      filtered = filtered.filter((a) => selectedDepartments.has(a.department));
    }
    setFilteredAlerts(filtered);
    // Group by indicator type
    const summaries: IndicatorSummary[] = INDICATOR_CONFIGS.map((config) => {
      const alerts = filtered.filter((a) => a.indicatorType === config.type);
      return {
        type: config.type,
        label: config.label,
        icon: config.icon,
        count: alerts.length,
        alerts
      };
    }).filter((s) => s.count > 0);
    setIndicatorSummaries(summaries);
  };
  useEffect(() => {
    if (allAlerts.length > 0) {
      applyFilters();
    }
  }, [allAlerts]);
  const toggleVehicle = (id: string) => {
    const newSet = new Set(selectedVehicles);
    if (newSet.has(id)) newSet.delete(id);else
    newSet.add(id);
    setSelectedVehicles(newSet);
  };
  const toggleDepartment = (dept: string) => {
    const newSet = new Set(selectedDepartments);
    if (newSet.has(dept)) newSet.delete(dept);else
    newSet.add(dept);
    setSelectedDepartments(newSet);
  };
  const filteredVehiclesList = vehicles.filter((v) =>
  v.name.toLowerCase().includes(vehicleSearch.toLowerCase())
  );
  const handleIndicatorClick = (indicator: IndicatorSummary) => {
    setSelectedIndicator(indicator);
    setShowFilters(false);
  };
  const handleBackToIndicators = () => {
    setSelectedIndicator(null);
    setShowFilters(true);
  };
  const handleVehicleAlertClick = (alert: DashboardAlert) => {
    if (onNavigateToVehicle) {
      onNavigateToVehicle(alert.vehicleId, alert.coordinates);
    }
  };
  const getIndicatorConfig = (type: string) => {
    return (
      INDICATOR_CONFIGS.find((c) => c.type === type) || INDICATOR_CONFIGS[0]);

  };
  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="p-4 pb-4 bg-white border-b border-slate-200 z-20 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedIndicator &&
            <button
              onClick={handleBackToIndicators}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            }
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                  <Gauge className="w-6 h-6 text-white" />
                </div>
                {selectedIndicator ?
                selectedIndicator.label :
                'Alerte tableau de bord'}
              </h1>
              <p className="text-slate-500 mt-1 ml-14">
                {selectedIndicator ?
                `${selectedIndicator.count} alerte(s) pour cet indicateur` :
                'Consultez les alertes par indicateur de tableau de bord'}
              </p>
            </div>
          </div>

          {!selectedIndicator &&
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium text-slate-700">
            
              <Filter className="w-4 h-4" />
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </button>
          }
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && !selectedIndicator &&
        <motion.div
          initial={{
            height: 0,
            opacity: 0
          }}
          animate={{
            height: 'auto',
            opacity: 1
          }}
          exit={{
            height: 0,
            opacity: 0
          }}
          className="bg-white border-b border-slate-200 z-10 relative">
          
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <div className="grid grid-cols-2 gap-3">
                    <DateTimePicker
                    label="Date début"
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Début" />
                  
                    <DateTimePicker
                    label="Date fin"
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="Fin" />
                  
                  </div>
                </div>

                <div className="relative" ref={vehicleDropdownRef}>
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">
                    Véhicules
                  </label>
                  <button
                  onClick={() =>
                  setIsVehicleDropdownOpen(!isVehicleDropdownOpen)
                  }
                  className="w-full flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 rounded-lg px-3 py-2.5 text-sm transition-colors">
                  
                    <span className="text-slate-700 truncate">
                      {selectedVehicles.size === 0 ?
                    'Tous les véhicules' :
                    `${selectedVehicles.size} véhicule(s)`}
                    </span>
                    <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isVehicleDropdownOpen ? 'rotate-180' : ''}`} />
                  
                  </button>

                  <AnimatePresence>
                    {isVehicleDropdownOpen &&
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 5
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    exit={{
                      opacity: 0,
                      y: 5
                    }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-80 flex flex-col">
                    
                        <div className="p-2 border-b border-slate-100">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                          type="text"
                          placeholder="Rechercher..."
                          value={vehicleSearch}
                          onChange={(e) => setVehicleSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500" />
                        
                          </div>
                        </div>
                        <div className="p-2 border-b border-slate-100 flex gap-2">
                          <button
                        onClick={() =>
                        setSelectedVehicles(
                          new Set(vehicles.map((v) => v.id))
                        )
                        }
                        className="text-[10px] text-blue-600 hover:underline font-medium">
                        
                            Tout sélectionner
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                        onClick={() => setSelectedVehicles(new Set())}
                        className="text-[10px] text-slate-500 hover:underline">
                        
                            Tout désélectionner
                          </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-1">
                          {filteredVehiclesList.map((vehicle) =>
                      <label
                        key={vehicle.id}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        
                              <input
                          type="checkbox"
                          checked={selectedVehicles.has(vehicle.id)}
                          onChange={() => toggleVehicle(vehicle.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                        
                              <span className="text-sm text-slate-700">
                                {vehicle.name}
                              </span>
                            </label>
                      )}
                        </div>
                      </motion.div>
                  }
                  </AnimatePresence>
                </div>

                <div className="relative" ref={departmentDropdownRef}>
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">
                    Départements
                  </label>
                  <button
                  onClick={() =>
                  setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)
                  }
                  className="w-full flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 rounded-lg px-3 py-2.5 text-sm transition-colors">
                  
                    <span className="text-slate-700 truncate">
                      {selectedDepartments.size === 0 ?
                    'Tous les départements' :
                    `${selectedDepartments.size} département(s)`}
                    </span>
                    <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} />
                  
                  </button>

                  <AnimatePresence>
                    {isDepartmentDropdownOpen &&
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 5
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    exit={{
                      opacity: 0,
                      y: 5
                    }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                    
                        <div className="p-2 border-b border-slate-100 flex gap-2">
                          <button
                        onClick={() =>
                        setSelectedDepartments(new Set(DEPARTMENTS))
                        }
                        className="text-[10px] text-blue-600 hover:underline font-medium">
                        
                            Tout sélectionner
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                        onClick={() => setSelectedDepartments(new Set())}
                        className="text-[10px] text-slate-500 hover:underline">
                        
                            Tout désélectionner
                          </button>
                        </div>
                        <div className="p-1">
                          {DEPARTMENTS.map((dept) =>
                      <label
                        key={dept}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                        
                              <input
                          type="checkbox"
                          checked={selectedDepartments.has(dept)}
                          onChange={() => toggleDepartment(dept)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                        
                              <span className="text-sm text-slate-700">
                                {dept}
                              </span>
                            </label>
                      )}
                        </div>
                      </motion.div>
                  }
                  </AnimatePresence>
                </div>

                <button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                
                  <Filter className="w-4 h-4" />
                  Appliquer
                </button>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!selectedIndicator ?
        <div className="space-y-8">
            {/* Indicator Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {indicatorSummaries.map((indicator) => {
              const Icon = indicator.icon;
              return (
                <motion.button
                  key={indicator.type}
                  onClick={() => handleIndicatorClick(indicator)}
                  className="bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all p-6 text-left group"
                  whileHover={{
                    scale: 1.02
                  }}
                  whileTap={{
                    scale: 0.98
                  }}>
                  
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                        <Icon className="w-12 h-12 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">
                          {indicator.label}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                          <span className="font-semibold text-2xl text-blue-600">
                            {indicator.count}
                          </span>
                          <span>alerte(s)</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>);

            })}

              {indicatorSummaries.length === 0 &&
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400">
                  <Gauge className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Aucune alerte trouvée</p>
                  <p className="text-sm">
                    Modifiez vos filtres pour voir plus de résultats
                  </p>
                </div>
            }
            </div>

            {/* Historical Alerts List */}
            {filteredAlerts.length > 0 &&
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: 0.2
            }}>
            
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <History className="w-5 h-5 text-slate-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Historique des alertes récentes
                  </h2>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                    {filteredAlerts.length}
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {filteredAlerts.slice(0, 30).map((alert) => {
                  const config = getIndicatorConfig(alert.indicatorType);
                  const Icon = config.icon;
                  return (
                    <motion.button
                      key={alert.id}
                      onClick={() => handleVehicleAlertClick(alert)}
                      className="w-full p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 text-left group"
                      whileHover={{
                        x: 4
                      }}>
                      
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div>
                              <h4 className="font-bold text-slate-900 truncate">
                                {alert.vehicleName}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {alert.department}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                                {config.label}
                              </span>
                            </div>

                            <div className="flex flex-col md:items-end gap-1 text-sm text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  {alert.timestamp.toLocaleString('fr-FR')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[200px]">
                                  {alert.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MapPin className="w-5 h-5 text-blue-600" />
                          </div>
                        </motion.button>);

                })}
                  </div>
                  {filteredAlerts.length > 30 &&
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                      <span className="text-xs text-slate-500 font-medium">
                        + {filteredAlerts.length - 30} autres alertes
                      </span>
                    </div>
              }
                </div>
              </motion.div>
          }
          </div> :

        // Selected Indicator Alerts List
        <div className="space-y-3">
            {selectedIndicator.alerts.map((alert) =>
          <motion.button
            key={alert.id}
            onClick={() => handleVehicleAlertClick(alert)}
            className="w-full bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all p-5 text-left group"
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            whileHover={{
              scale: 1.01
            }}
            whileTap={{
              scale: 0.99
            }}>
            
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <selectedIndicator.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">
                          {alert.vehicleName}
                        </h4>
                        <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded">
                          {alert.department}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 ml-13">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{alert.timestamp.toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700 flex-shrink-0">
                    <span className="text-sm font-medium">
                      Voir sur la carte
                    </span>
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </motion.button>
          )}
          </div>
        }
      </div>
    </div>);

}