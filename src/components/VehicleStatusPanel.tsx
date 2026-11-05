import React from 'react';
import { VehicleCard } from './VehicleCard';
import { Vehicle } from '../types';
import { Search, Filter } from 'lucide-react';
interface VehicleStatusPanelProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}
export function VehicleStatusPanel({
  vehicles,
  selectedVehicleId,
  onSelectVehicle
}: VehicleStatusPanelProps) {
  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 w-80 flex-shrink-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-100 font-semibold">État de la flotte</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {vehicles.length} Véhicules
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full bg-slate-800 text-sm text-slate-200 pl-9 pr-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition-all" />
            
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {vehicles.map((vehicle) =>
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onClick={onSelectVehicle}
          isSelected={selectedVehicleId === vehicle.id} />

        )}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-900 text-[10px] text-center text-slate-500">
        Dernière mise à jour: {new Date().toLocaleTimeString()}
      </div>
    </div>);

}