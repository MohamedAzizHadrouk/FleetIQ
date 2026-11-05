import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react';
import type { Vehicle } from '@/types';
import { Button } from '@/components/ui/button';

interface GeneralReportDetailsPageProps {
  vehicle: Vehicle | null;
  onBack: () => void;
}

function mockRows(vehicle: Vehicle) {
  const base = vehicle.coordinates;
  return [
    {
      etat: vehicle.status === 'active' ? 'Circulation' : vehicle.status === 'idle' ? 'Stop' : 'Hors ligne',
      horodatage: vehicle.lastUpdate,
      vitesse: `${vehicle.speed} km/h`,
      distance: '12,4 km',
      lieu: vehicle.location,
      carburant: `${Math.max(10, vehicle.batteryLevel - 20)} %`,
      rpm: vehicle.speed > 0 ? String(1800 + vehicle.speed * 12) : '—',
      lat: base[0].toFixed(5),
      lng: base[1].toFixed(5),
    },
    {
      etat: 'Ralenti',
      horodatage: 'Il y a 25 min',
      vitesse: '4 km/h',
      distance: '0,3 km',
      lieu: vehicle.location,
      carburant: `${Math.max(8, vehicle.batteryLevel - 22)} %`,
      rpm: '900',
      lat: (base[0] + 0.001).toFixed(5),
      lng: (base[1] - 0.0008).toFixed(5),
    },
    {
      etat: 'Stop',
      horodatage: 'Il y a 1 h',
      vitesse: '0 km/h',
      distance: '0 km',
      lieu: vehicle.location,
      carburant: `${Math.max(5, vehicle.batteryLevel - 25)} %`,
      rpm: '—',
      lat: (base[0] - 0.002).toFixed(5),
      lng: (base[1] + 0.0012).toFixed(5),
    },
  ];
}

export function GeneralReportDetailsPage({
  vehicle,
  onBack,
}: GeneralReportDetailsPageProps) {
  if (!vehicle) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-slate-50">
        <p className="text-sm text-slate-600">Aucun véhicule sélectionné.</p>
        <Button variant="outline" onClick={onBack}>
          Retour au suivi
        </Button>
      </div>
    );
  }

  const rows = mockRows(vehicle);

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="shrink-0 px-6 py-4 border-b border-slate-200 bg-white flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">
              Rapport général — {vehicle.name}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {vehicle.matricule ?? vehicle.id} · {vehicle.driver} · {vehicle.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.alert('Export Excel (stub)')}
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.alert('Export PDF (stub)')}
          >
            <Download className="w-4 h-4 mr-1.5" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5">État</th>
                <th className="px-3 py-2.5">Horodatage</th>
                <th className="px-3 py-2.5">Vitesse</th>
                <th className="px-3 py-2.5">Distance</th>
                <th className="px-3 py-2.5">Lieu proche</th>
                <th className="px-3 py-2.5">Carburant</th>
                <th className="px-3 py-2.5">RPM</th>
                <th className="px-3 py-2.5">Lat</th>
                <th className="px-3 py-2.5">Long</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 text-slate-700 hover:bg-slate-50"
                >
                  <td className="px-3 py-2 font-medium">{row.etat}</td>
                  <td className="px-3 py-2">{row.horodatage}</td>
                  <td className="px-3 py-2">{row.vitesse}</td>
                  <td className="px-3 py-2">{row.distance}</td>
                  <td className="px-3 py-2">{row.lieu}</td>
                  <td className="px-3 py-2">{row.carburant}</td>
                  <td className="px-3 py-2">{row.rpm}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.lat}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.lng}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
