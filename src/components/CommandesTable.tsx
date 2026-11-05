import React, { useMemo } from 'react';
import { Vehicle } from '../types';
import { Terminal, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
interface CommandesTableProps {
  vehicles: Vehicle[];
}
// Mock data for commands
const generateCommands = (vehicles: Vehicle[]) => {
  const commands = [];
  const types = [
  'Couper moteur',
  'Activer moteur',
  'Ouvrir portes',
  'Fermer portes',
  'Activer alarme',
  'Désactiver alarme',
  'Demande position',
  'Reset boîtier'];

  const statuses = ['success', 'pending', 'failed'] as const;
  vehicles.slice(0, 12).forEach((vehicle, index) => {
    const cmdType = types[index % types.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const sentTime = new Date();
    sentTime.setMinutes(sentTime.getMinutes() - Math.floor(Math.random() * 60));
    let responseTime = null;
    if (status !== 'pending') {
      responseTime = new Date(sentTime.getTime() + Math.random() * 5000); // 0-5s later
    }
    commands.push({
      id: `cmd-${vehicle.id}-${index}`,
      vehicle: vehicle.name,
      command: cmdType,
      status,
      sentTime,
      responseTime,
      user: 'Admin'
    });
  });
  return commands.sort((a, b) => b.sentTime.getTime() - a.sentTime.getTime());
};
export function CommandesTable({ vehicles }: CommandesTableProps) {
  const commands = useMemo(() => generateCommands(vehicles), [vehicles]);
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-700" />
          Historique des Commandes
        </h3>
        <span className="text-xs font-medium px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-600">
          {commands.length} commandes
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
                Commande
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Envoyé à
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Réponse à
              </th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                Résultat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {commands.map((cmd) =>
            <tr key={cmd.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {cmd.vehicle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                  {cmd.command}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {cmd.user}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                  {formatTime(cmd.sentTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                  {cmd.responseTime ? formatTime(cmd.responseTime) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cmd.status === 'success' ? 'bg-emerald-100 text-emerald-800' : cmd.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                  
                    {cmd.status === 'success' ?
                  <CheckCircle className="w-3 h-3" /> :
                  cmd.status === 'pending' ?
                  <Clock className="w-3 h-3" /> :

                  <XCircle className="w-3 h-3" />
                  }
                    {cmd.status === 'success' ?
                  'Succès' :
                  cmd.status === 'pending' ?
                  'En cours' :
                  'Échec'}
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}