import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Clock, Battery, Activity } from 'lucide-react';
import { Vehicle } from '../types';
interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
  isSelected?: boolean;
}
export function VehicleCard({
  vehicle,
  onClick,
  isSelected
}: VehicleCardProps) {
  const statusColors = {
    active: 'bg-emerald-500',
    idle: 'bg-amber-500',
    offline: 'bg-rose-500'
  };
  const statusText = {
    active: 'En mouvement',
    idle: "À l'arrêt",
    offline: 'Hors ligne'
  };
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        backgroundColor: 'rgba(30, 41, 59, 1)'
      }}
      whileTap={{
        scale: 0.98
      }}
      onClick={() => onClick(vehicle)}
      className={`
        p-4 rounded-xl cursor-pointer border transition-colors duration-200
        ${isSelected ? 'bg-slate-800 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'}
      `}>
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-slate-100 font-semibold text-sm">
            {vehicle.name}
          </h3>
          <p className="text-slate-400 text-xs">{vehicle.driver}</p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/50 border border-slate-700/50`}>
          
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusColors[vehicle.status]} animate-pulse`} />
          
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-wide">
            {statusText[vehicle.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-300">{vehicle.speed} km/h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Battery
            className={`w-3.5 h-3.5 ${vehicle.batteryLevel < 20 ? 'text-rose-400' : 'text-emerald-400'}`} />
          
          <span>{vehicle.batteryLevel}%</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <Navigation className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">{vehicle.location}</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{vehicle.lastUpdate}</span>
        </div>
      </div>
    </motion.div>);

}