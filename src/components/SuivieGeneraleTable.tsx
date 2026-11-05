import React from 'react';
import { Vehicle } from '../types';
import { MapPin, Clock, Battery, Signal, Navigation } from 'lucide-react';
interface SuivieGeneraleTableProps {
  vehicles: Vehicle[];
}
export function SuivieGeneraleTable({ vehicles }: SuivieGeneraleTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-600" />
          Suivi Général de la Flotte
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
          {vehicles.length} véhicules
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
                Chauffeur
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Statut
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Vitesse
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Position
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Dernière màj
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {vehicles.map((vehicle) =>
            <tr
              key={vehicle.id}
              className="hover:bg-slate-50 transition-colors cursor-pointer group">
              
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div
                    className={`w-2 h-2 rounded-full ${vehicle.status === 'active' ? 'bg-emerald-500' : vehicle.status === 'idle' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                  
                    <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                      {vehicle.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {vehicle.driver}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.status === 'active' ? 'bg-emerald-100 text-emerald-800' : vehicle.status === 'idle' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                  
                    {vehicle.status === 'active' ?
                  'En mouvement' :
                  vehicle.status === 'idle' ?
                  'Arrêté' :
                  'Hors ligne'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                  {vehicle.speed} km/h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  <div className="flex items-center gap-1.5 max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{vehicle.location}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {vehicle.lastUpdate}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}