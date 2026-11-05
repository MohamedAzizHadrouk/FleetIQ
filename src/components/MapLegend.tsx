import React from 'react';
export function MapLegend() {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg w-full max-w-[12rem] sm:w-48 text-sm">
      <h3 className="font-bold text-slate-800 mb-3">Légende</h3>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Circulation</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-rose-500"></span>
          <span className="text-slate-600">Stop</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-slate-400"></span>
          <span className="text-slate-600">Hors connexion</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span className="text-slate-600">Sélectionné</span>
        </div>

        <div className="h-px bg-slate-200 my-2"></div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-0.5 bg-red-500"></span>
          <span className="text-slate-600">Autoroute</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-0.5 bg-amber-700"></span>
          <span className="text-slate-600">Route</span>
        </div>
      </div>
    </div>);

}
