import React, { useState } from 'react';
import { Vehicle } from '../types';
import {
  Download,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight } from
'lucide-react';
interface DataTableProps {
  vehicles: Vehicle[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}
export function DataTable({
  vehicles,
  isCollapsed = false,
  onToggleCollapse
}: DataTableProps) {
  const [activeTab, setActiveTab] = useState('GPS');
  const tabs = ['GPS', 'Média Files', 'System'];
  return (
    <div
      className={`h-full bg-white border-l border-slate-200 flex flex-col transition-all duration-300 relative ${isCollapsed ? 'w-0' : 'w-[600px]'} flex-shrink-0`}>
      
      {/* Collapse Toggle Button */}
      {onToggleCollapse &&
      <button
        onClick={onToggleCollapse}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-white hover:bg-slate-50 border border-slate-200 rounded-r-lg flex items-center justify-center transition-colors shadow-lg">
        
          {isCollapsed ?
        <ChevronLeft className="w-4 h-4 text-slate-600" /> :

        <ChevronRight className="w-4 h-4 text-slate-600" />
        }
        </button>
      }

      {!isCollapsed &&
      <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
            <div className="flex gap-2">
              {tabs.map((tab) =>
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'}
                  `}>
              
                  {tab}
                </button>
            )}
            </div>

            <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium transition-colors">
              <Download className="w-3 h-3" />
              <span>Export Excel</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  {[
                'DÉPARTEMENT',
                'VÉHICULE',
                'DATE / HEURE',
                'HORODATAGE',
                'VITESSE',
                'N° DE PLAQUE',
                'HEURES DE M.',
                "PRÉSENCE D'EAU",
                'DERNIÈRE ALERTE',
                'N° DE SÉRIE',
                'ÉTAT CONTACT',
                'VOLUME',
                'LATITUDE'].
                map((header) =>
                <th
                  key={header}
                  className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap border-b border-slate-200">
                  
                      {header}
                    </th>
                )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle, index) => {
                const randomAlerts = Math.floor(Math.random() * 5);
                const hasWater = Math.random() > 0.5;
                const hasContact = vehicle.status !== 'offline';
                return (
                  <tr
                    key={vehicle.id}
                    className={
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }>
                    
                      <td className="px-3 py-2 text-xs font-medium text-blue-600">
                        Latrace
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {vehicle.status === 'offline' ?
                        <XCircle className="w-4 h-4 text-rose-500" /> :

                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        }
                          <span className="text-xs font-medium text-slate-700">
                            #{vehicle.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        2025-12-03
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {new Date().toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                      </td>
                      <td className="px-3 py-2">
                        <span
                        className={`
                            px-2 py-0.5 rounded text-[10px] font-bold
                            ${vehicle.speed > 50 ? 'bg-rose-100 text-rose-700' : vehicle.speed > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}
                          `}>
                        
                          {vehicle.speed}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs font-bold text-slate-800">
                        {`${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 900) + 100}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {Math.floor(Math.random() * 9000) + 1000}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          {hasWater ?
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> :

                        <XCircle className="w-4 h-4 text-rose-500" />
                        }
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          {randomAlerts > 0 ?
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {randomAlerts}
                            </span> :

                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
                              0
                            </span>
                        }
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600 font-mono">
                        9178{String(1150 + index).padStart(4, '0')}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          {hasContact ?
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> :

                        <XCircle className="w-4 h-4 text-rose-500" />
                        }
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">0.00</td>
                      <td className="px-3 py-2 text-xs text-slate-600 font-mono">
                        {vehicle.coordinates[0].toFixed(6)}
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        </>
      }
    </div>);

}