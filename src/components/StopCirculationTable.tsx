import React, { useMemo } from 'react';
import { Vehicle } from '../types';
import { PlayCircle, StopCircle, Clock, MapPin } from 'lucide-react';
interface StopCirculationTableProps {
  vehicles: Vehicle[];
}
// Mock data generator for stop/circulation events
const generateEvents = (vehicles: Vehicle[]) => {
  const events = [];
  const types = ['stop', 'circulation'] as const;
  vehicles.slice(0, 15).forEach((vehicle) => {
    // Generate 2-3 events per vehicle
    const count = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const duration = Math.floor(Math.random() * 120) + 5; // 5 to 125 mins
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - Math.random() * 1000);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      events.push({
        id: `${vehicle.id}-${i}`,
        vehicle: vehicle.name,
        type,
        startTime,
        endTime,
        duration,
        location: vehicle.location
      });
    }
  });
  return events.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};
export function StopCirculationTable({ vehicles }: StopCirculationTableProps) {
  const events = useMemo(() => generateEvents(vehicles), [vehicles]);
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}min`;
    return `${m}min`;
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <StopCircle className="w-4 h-4 text-rose-600" />
          Rapport Stop & Circulation
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
          {events.length} événements
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
                Type
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Début
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Fin
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Durée
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Position
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {events.map((event) =>
            <tr
              key={event.id}
              className="hover:bg-slate-50 transition-colors">
              
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {event.vehicle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${event.type === 'circulation' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  
                    {event.type === 'circulation' ?
                  <PlayCircle className="w-3 h-3" /> :

                  <StopCircle className="w-3 h-3" />
                  }
                    {event.type === 'circulation' ? 'Circulation' : 'Arrêt'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatTime(event.startTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatTime(event.endTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700">
                  {formatDuration(event.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  <div className="flex items-center gap-1.5 max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}