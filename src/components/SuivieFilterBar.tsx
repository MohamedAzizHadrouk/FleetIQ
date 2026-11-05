import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  Filter,
  Car,
  Building2,
  Calendar,
  Layers,
  AlertTriangle,
  Check } from
'lucide-react';
import { DateTimePicker } from './DateTimePicker';
import { Vehicle } from '../types';
export type SuivieAction =
'suivie_generale' |
'alertes' |
'stop_circulation' |
'trajectoire' |
'commandes';
interface SuivieFilterBarProps {
  vehicles: Vehicle[];
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  selectedAction: SuivieAction;
  onActionChange: (action: SuivieAction) => void;
  selectedVehicles: Set<string>;
  onVehiclesChange: (ids: Set<string>) => void;
  selectedDepartments: Set<string>;
  onDepartmentsChange: (depts: Set<string>) => void;
  selectedAlertTypes: Set<string>;
  onAlertTypesChange: (types: Set<string>) => void;
  onApply: () => void;
}
const ACTIONS: {
  id: SuivieAction;
  label: string;
}[] = [
{
  id: 'suivie_generale',
  label: 'Suivi général'
},
{
  id: 'alertes',
  label: 'Alertes'
},
{
  id: 'stop_circulation',
  label: 'Stop & Circulation'
},
{
  id: 'trajectoire',
  label: 'Trajectoire'
},
{
  id: 'commandes',
  label: 'Commandes'
}];

const DEPARTMENTS = [
'Transport',
'Logistique',
'Commercial',
'Direction',
'Technique'];

const ALERT_TYPES = [
'Excès de vitesse',
'Sortie de zone',
'Arrêt prolongé',
'Batterie faible',
'Déconnexion',
'SOS',
'Accélération brusque',
'Freinage brusque'];

export function SuivieFilterBar({
  vehicles,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  selectedAction,
  onActionChange,
  selectedVehicles,
  onVehiclesChange,
  selectedDepartments,
  onDepartmentsChange,
  selectedAlertTypes,
  onAlertTypesChange,
  onApply
}: SuivieFilterBarProps) {
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [vehicleTab, setVehicleTab] = useState<'vehicles' | 'departments'>(
    'vehicles'
  );
  const [vehicleSearch, setVehicleSearch] = useState('');
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const alertDropdownRef = useRef<HTMLDivElement>(null);
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
      actionDropdownRef.current &&
      !actionDropdownRef.current.contains(event.target as Node))
      {
        setIsActionDropdownOpen(false);
      }
      if (
      alertDropdownRef.current &&
      !alertDropdownRef.current.contains(event.target as Node))
      {
        setIsAlertDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const filteredVehicles = vehicles.filter(
    (v) =>
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.id.toLowerCase().includes(vehicleSearch.toLowerCase())
  );
  const toggleVehicle = (id: string) => {
    const newSet = new Set(selectedVehicles);
    if (newSet.has(id)) newSet.delete(id);else
    newSet.add(id);
    onVehiclesChange(newSet);
  };
  const toggleDepartment = (dept: string) => {
    const newSet = new Set(selectedDepartments);
    if (newSet.has(dept)) newSet.delete(dept);else
    newSet.add(dept);
    onDepartmentsChange(newSet);
  };
  const toggleAlertType = (type: string) => {
    const newSet = new Set(selectedAlertTypes);
    if (newSet.has(type)) newSet.delete(type);else
    newSet.add(type);
    onAlertTypesChange(newSet);
  };
  const selectAllVehicles = () => {
    onVehiclesChange(new Set(vehicles.map((v) => v.id)));
  };
  const deselectAllVehicles = () => {
    onVehiclesChange(new Set());
  };
  const selectAllDepartments = () => {
    onDepartmentsChange(new Set(DEPARTMENTS));
  };
  const deselectAllDepartments = () => {
    onDepartmentsChange(new Set());
  };
  const getVehicleButtonText = () => {
    const vCount = selectedVehicles.size;
    const dCount = selectedDepartments.size;
    if (vCount === 0 && dCount === 0) return 'Sélectionner véhicules';
    const parts = [];
    if (vCount > 0) parts.push(`${vCount} véh.`);
    if (dCount > 0) parts.push(`${dCount} dép.`);
    return parts.join(', ');
  };
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm z-30 relative">
      <div className="max-w-[1920px] mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          {/* Vehicle/Department Selection - Spans 3 columns */}
          <div className="lg:col-span-3 relative" ref={vehicleDropdownRef}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5" />
              Véhicules / Départements
            </label>
            <button
              onClick={() => setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm rounded-lg px-3 py-2.5 text-sm transition-all">
              
              <span
                className={`truncate ${selectedVehicles.size > 0 || selectedDepartments.size > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                
                {getVehicleButtonText()}
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
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[400px] w-[320px]">
                
                  {/* Tabs */}
                  <div className="flex border-b border-slate-100">
                    <button
                    onClick={() => setVehicleTab('vehicles')}
                    className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${vehicleTab === 'vehicles' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    
                      Véhicules ({selectedVehicles.size})
                    </button>
                    <button
                    onClick={() => setVehicleTab('departments')}
                    className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${vehicleTab === 'departments' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    
                      Départements ({selectedDepartments.size})
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {vehicleTab === 'vehicles' ?
                  <>
                        <div className="p-3 border-b border-slate-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                          type="text"
                          placeholder="Rechercher..."
                          value={vehicleSearch}
                          onChange={(e) => setVehicleSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
                        
                          </div>
                          <div className="flex items-center justify-between mt-2 px-1">
                            <button
                          onClick={selectAllVehicles}
                          className="text-xs text-blue-600 hover:underline font-medium">
                          
                              Tout sélectionner
                            </button>
                            <button
                          onClick={deselectAllVehicles}
                          className="text-xs text-slate-500 hover:underline">
                          
                              Tout désélectionner
                            </button>
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2">
                          {filteredVehicles.map((vehicle) =>
                      <label
                        key={vehicle.id}
                        className="flex items-center gap-3 px-2 py-2 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
                        
                              <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedVehicles.has(vehicle.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                          
                                {selectedVehicles.has(vehicle.id) &&
                          <Check className="w-3 h-3 text-white" />
                          }
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-700">
                                  {vehicle.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {vehicle.driver}
                                </div>
                              </div>
                            </label>
                      )}
                        </div>
                      </> :

                  <div className="flex-1 overflow-y-auto p-2">
                        <div className="flex items-center justify-between mb-2 px-3 pt-2">
                          <button
                        onClick={selectAllDepartments}
                        className="text-xs text-blue-600 hover:underline font-medium">
                        
                            Tout sélectionner
                          </button>
                          <button
                        onClick={deselectAllDepartments}
                        className="text-xs text-slate-500 hover:underline">
                        
                            Tout désélectionner
                          </button>
                        </div>
                        {DEPARTMENTS.map((dept) =>
                    <label
                      key={dept}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
                      
                            <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedDepartments.has(dept) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                        
                              {selectedDepartments.has(dept) &&
                        <Check className="w-3 h-3 text-white" />
                        }
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {dept}
                            </span>
                          </label>
                    )}
                      </div>
                  }
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>

          {/* Date Range - Spans 4 columns (2 each) */}
          <div className="lg:col-span-2">
            <DateTimePicker
              label="Date début"
              value={startDate}
              onChange={onStartDateChange}
              placeholder="Début" />
            
          </div>
          <div className="lg:col-span-2">
            <DateTimePicker
              label="Date fin"
              value={endDate}
              onChange={onEndDateChange}
              placeholder="Fin" />
            
          </div>

          {/* Action Selection - Spans 3 columns */}
          <div className="lg:col-span-3 relative" ref={actionDropdownRef}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Action
            </label>
            <button
              onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm rounded-lg px-3 py-2.5 text-sm transition-all">
              
              <span className="text-slate-900 font-medium truncate">
                {ACTIONS.find((a) => a.id === selectedAction)?.label}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${isActionDropdownOpen ? 'rotate-180' : ''}`} />
              
            </button>

            <AnimatePresence>
              {isActionDropdownOpen &&
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
                className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                
                  <div className="p-1">
                    {ACTIONS.map((action) =>
                  <button
                    key={action.id}
                    onClick={() => {
                      onActionChange(action.id);
                      setIsActionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedAction === action.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>
                    
                        {action.label}
                      </button>
                  )}
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>

          {/* Alert Types (Conditional) or Apply Button - Spans 2 columns */}
          <div className="lg:col-span-2 flex gap-2">
            {selectedAction === 'alertes' ?
            <div className="relative flex-1" ref={alertDropdownRef}>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Types d'alerte
                </label>
                <button
                onClick={() => setIsAlertDropdownOpen(!isAlertDropdownOpen)}
                className="w-full flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm rounded-lg px-3 py-2.5 text-sm transition-all">
                
                  <span className="truncate text-slate-700">
                    {selectedAlertTypes.size === 0 ?
                  'Tous' :
                  `${selectedAlertTypes.size} types`}
                  </span>
                  <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${isAlertDropdownOpen ? 'rotate-180' : ''}`} />
                
                </button>

                <AnimatePresence>
                  {isAlertDropdownOpen &&
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
                  className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden w-[250px] max-h-[300px] flex flex-col">
                  
                      <div className="p-2 border-b border-slate-100 flex justify-between">
                        <button
                      onClick={() =>
                      onAlertTypesChange(new Set(ALERT_TYPES))
                      }
                      className="text-xs text-blue-600 hover:underline font-medium">
                      
                          Tout
                        </button>
                        <button
                      onClick={() => onAlertTypesChange(new Set())}
                      className="text-xs text-slate-500 hover:underline">
                      
                          Rien
                        </button>
                      </div>
                      <div className="overflow-y-auto p-1">
                        {ALERT_TYPES.map((type) =>
                    <label
                      key={type}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                      
                            <input
                        type="checkbox"
                        checked={selectedAlertTypes.has(type)}
                        onChange={() => toggleAlertType(type)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                      
                            <span className="text-sm text-slate-700">
                              {type}
                            </span>
                          </label>
                    )}
                      </div>
                    </motion.div>
                }
                </AnimatePresence>
              </div> :

            <div className="flex-1"></div>
            }

            <button
              onClick={onApply}
              className="h-[42px] px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium text-sm self-end mb-[1px]">
              
              <Filter className="w-4 h-4" />
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>);

}