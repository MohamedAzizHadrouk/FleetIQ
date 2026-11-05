import React, { useMemo } from 'react';
import { Vehicle } from '../types';
import { Route, MapPin, ArrowRight, Clock, Navigation } from 'lucide-react';
interface TrajectoireTableProps {
  vehicles: Vehicle[];
}
// Mock data generator for trajectories
const generateTrajectories = (vehicles: Vehicle[]) => {
  const trajectories = [];
  const locations = [
  'Paris Centre',
  'La Défense',
  'Orly',
  'Roissy CDG',
  'Versailles',
  'Marne-la-Vallée',
  'Boulogne',
  'Saint-Denis',
  'Créteil',
  'Nanterre'];

  vehicles.slice(0, 10).forEach((vehicle, index) => {
    const startLoc = locations[index % locations.length];
    const endLoc = locations[(index + 3) % locations.length];
    const distance = Math.floor(Math.random() * 50) + 5;
    const duration = Math.floor(distance * 1.5) + 10; // rough estimate
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - Math.floor(Math.random() * 5));
    const endTime = new Date(startTime.getTime() + duration * 60000);
    trajectories.push({
      id: `traj-${vehicle.id}`,
      vehicle: vehicle.name,
      startLocation: startLoc,
      endLocation: endLoc,
      distance,
      duration,
      startTime,
      endTime
    });
  });
  return trajectories;
};
export function TrajectoireTable({ vehicles }: TrajectoireTableProps) {
  const trajectories = useMemo(() => generateTrajectories(vehicles), [vehicles]);
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Route className="w-4 h-4 text-indigo-600" />
          Historique des Trajets
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
          {trajectories.length} trajets
        </span>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Véhicule
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Départ
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Arrivée
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Distance
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Durée
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Horaires
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {trajectories.map((traj) =>
            <tr key={traj.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {traj.vehicle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    {traj.startLocation}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    {traj.endLocation}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">
                  {traj.distance} km
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {Math.floor(traj.duration / 60)}h {traj.duration % 60}min
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">
                      {formatTime(traj.startTime)}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-medium text-slate-700">
                      {formatTime(traj.endTime)}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}