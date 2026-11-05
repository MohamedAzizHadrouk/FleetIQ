import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Filter,
  Car,
  Building2,
  ExternalLink,
  Pencil,
  Wrench,
  Trash2,
  ChevronDown,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock } from
'lucide-react';
import { AddEditSinistreModal } from './AddEditSinistreModal';
import { TableFooter } from './TableFooter';
import { GestionReparations } from './GestionReparations';
import { SuiviDossierSinistre } from './SuiviDossierSinistre';
export interface Sinistre {
  id: number;
  vehicule: string;
  departement: string;
  status: 'Achevé' | 'Déclaration' | 'En cours';
  typeAccident: string;
  dateAccident: string;
  emplacement: string;
  description: string;
  reference?: string;
  chauffeur?: string;
  details?: string;
  etape?: number; // 0=Déclaration, 1=Expert, 2=Contre-expert, 3=Règlement, 4=Achevé
}
const MOCK_SINISTRES: Sinistre[] = [
{
  id: 1,
  vehicule: '8125 TU 226 Skander',
  departement: 'Département 1',
  status: 'En cours',
  typeAccident: 'Accident de la route',
  dateAccident: '23/02/2021 09:41:50',
  emplacement: 'prologic3',
  description: '',
  etape: 3
},
{
  id: 2,
  vehicule: '8125 TU 226 Skander',
  departement: 'Département 1',
  status: 'Achevé',
  typeAccident: 'Accident de la route',
  dateAccident: '26/02/2021 13:35:48',
  emplacement: 'prologic',
  description: '',
  etape: 4
},
{
  id: 3,
  vehicule: '8125 TU 226 Skander',
  departement: 'Département 1',
  status: 'Achevé',
  typeAccident: 'Accident de la route',
  dateAccident: '01/06/2023 08:43:55',
  emplacement: 'prologic',
  description: '',
  etape: 4
},
{
  id: 4,
  vehicule: '4521 RS 112 Ahmed',
  departement: 'Département 2',
  status: 'Déclaration',
  typeAccident: 'Bris de glaces',
  dateAccident: '09/08/2023 10:35:07',
  emplacement: '',
  description: '',
  etape: 0
},
{
  id: 5,
  vehicule: '4521 RS 112 Ahmed',
  departement: 'Département 2',
  status: 'Déclaration',
  typeAccident: 'Accident de la route',
  dateAccident: '14/05/2025 08:53:19',
  emplacement: '',
  description: 'ddd',
  etape: 0
},
{
  id: 6,
  vehicule: '7823 AB 445 Karim',
  departement: 'Département 1',
  status: 'En cours',
  typeAccident: 'Collision',
  dateAccident: '03/11/2024 14:20:00',
  emplacement: 'Tunis Centre',
  description: 'Dommages légers',
  etape: 1
},
{
  id: 7,
  vehicule: '7823 AB 445 Karim',
  departement: 'Département 3',
  status: 'Achevé',
  typeAccident: 'Accident de la route',
  dateAccident: '17/03/2022 07:15:30',
  emplacement: 'Sfax',
  description: 'Réparé',
  etape: 4
},
{
  id: 8,
  vehicule: '3301 TN 089 Sami',
  departement: 'Département 3',
  status: 'Déclaration',
  typeAccident: 'Bris de glaces',
  dateAccident: '22/01/2025 11:00:00',
  emplacement: 'Sousse',
  description: '',
  etape: 0
},
{
  id: 9,
  vehicule: '3301 TN 089 Sami',
  departement: 'Département 2',
  status: 'En cours',
  typeAccident: 'Accrochage parking',
  dateAccident: '05/09/2024 16:45:22',
  emplacement: 'La Marsa',
  description: 'Pare-choc endommagé',
  etape: 2
}];

function StatusBadge({ status }: {status: Sinistre['status'];}) {
  const config = {
    Achevé: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle,
      dot: 'bg-emerald-500'
    },
    Déclaration: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: AlertTriangle,
      dot: 'bg-amber-500'
    },
    'En cours': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: Clock,
      dot: 'bg-blue-500'
    }
  };
  const c = config[status];
  const Icon = c.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>);

}
export function GestionSinistresContent() {
  const [sinistres, setSinistres] = useState<Sinistre[]>(MOCK_SINISTRES);
  const [selectedDepartement, setSelectedDepartement] = useState<string>('');
  const [selectedVehicule, setSelectedVehicule] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingSinistre, setEditingSinistre] = useState<Sinistre | null>(null);
  const [selectedSinistreForRepair, setSelectedSinistreForRepair] =
  useState<Sinistre | null>(null);
  const [selectedSinistreForView, setSelectedSinistreForView] =
  useState<Sinistre | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const ALL_VEHICULES = useMemo(
    () => [...new Set(sinistres.map((s) => s.vehicule))],
    [sinistres]
  );
  const ALL_DEPARTEMENTS = useMemo(
    () => [...new Set(sinistres.map((s) => s.departement))].sort(),
    [sinistres]
  );
  const filteredSinistres = useMemo(() => {
    return sinistres.filter((s) => {
      const matchDept =
      !selectedDepartement || s.departement === selectedDepartement;
      const matchVeh = !selectedVehicule || s.vehicule === selectedVehicule;
      const matchSearch =
      !searchTerm ||
      s.typeAccident.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.emplacement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDept && matchVeh && matchSearch;
    });
  }, [sinistres, selectedDepartement, selectedVehicule, searchTerm]);
  const totalItems = filteredSinistres.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSinistres = filteredSinistres.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  // Stats
  const stats = useMemo(
    () => ({
      total: filteredSinistres.length,
      acheve: filteredSinistres.filter((s) => s.status === 'Achevé').length,
      declaration: filteredSinistres.filter((s) => s.status === 'Déclaration').
      length,
      enCours: filteredSinistres.filter((s) => s.status === 'En cours').length
    }),
    [filteredSinistres]
  );
  const handleSaveSinistre = (data: Partial<Sinistre>) => {
    if (editingSinistre) {
      setSinistres(
        sinistres.map((s) =>
        s.id === editingSinistre.id ?
        {
          ...s,
          ...data
        } as Sinistre :
        s
        )
      );
    } else {
      const newSinistre: Sinistre = {
        id: Math.max(...sinistres.map((s) => s.id), 0) + 1,
        vehicule: data.vehicule || '',
        departement: data.departement || 'Département 1',
        status: data.status || 'Déclaration',
        typeAccident: data.typeAccident || '',
        dateAccident:
        data.dateAccident || new Date().toLocaleDateString('fr-FR'),
        emplacement: data.emplacement || '',
        description: data.description || '',
        reference: data.reference || '',
        chauffeur: data.chauffeur || '',
        details: data.details || ''
      };
      setSinistres([newSinistre, ...sinistres]);
    }
    setShowModal(false);
    setEditingSinistre(null);
  };
  const handleDeleteSinistre = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce sinistre ?')) {
      setSinistres(sinistres.filter((s) => s.id !== id));
    }
  };
  if (selectedSinistreForView) {
    return (
      <SuiviDossierSinistre
        sinistre={selectedSinistreForView}
        onBack={() => setSelectedSinistreForView(null)} />);


  }
  if (selectedSinistreForRepair) {
    return (
      <GestionReparations
        sinistre={selectedSinistreForRepair}
        onBack={() => setSelectedSinistreForRepair(null)} />);


  }
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      <div className="p-4 space-y-5 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Gestion des sinistres
              </h1>
              <p className="text-sm text-slate-500">
                {stats.total} sinistre{stats.total !== 1 ? 's' : ''} trouvé
                {stats.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingSinistre(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
            
            <Plus className="w-4 h-4" />
            Nouveau sinistre
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
            <p className="text-xs font-medium text-emerald-600 mb-1">Achevés</p>
            <p className="text-2xl font-bold text-emerald-700">
              {stats.acheve}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
            <p className="text-xs font-medium text-amber-600 mb-1">
              Déclarations
            </p>
            <p className="text-2xl font-bold text-amber-700">
              {stats.declaration}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
            <p className="text-xs font-medium text-blue-600 mb-1">En cours</p>
            <p className="text-2xl font-bold text-blue-700">{stats.enCours}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Filter className="w-4 h-4 text-slate-400" />
              Filtres :
            </div>

            {/* Département filter */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedDepartement}
                onChange={(e) => setSelectedDepartement(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-slate-700 min-w-[180px]">
                
                <option value="">Tous les départements</option>
                {ALL_DEPARTEMENTS.map((d) =>
                <option key={d} value={d}>
                    {d}
                  </option>
                )}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Véhicule filter */}
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedVehicule}
                onChange={(e) => setSelectedVehicule(e.target.value)}
                className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-slate-700 min-w-[220px]">
                
                <option value="">Tous les véhicules</option>
                {ALL_VEHICULES.map((v) =>
                <option key={v} value={v}>
                    {v}
                  </option>
                )}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              
            </div>

            {(selectedDepartement || selectedVehicule || searchTerm) &&
            <button
              onClick={() => {
                setSelectedDepartement('');
                setSelectedVehicule('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              
                Réinitialiser
              </button>
            }
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Type d'accident
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date d'accident
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Emplacement
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Description des dégâts
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSinistres.length === 0 ?
                <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <ShieldAlert className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          Aucun sinistre trouvé
                        </p>
                        <p className="text-xs text-slate-400">
                          Modifiez vos filtres pour voir plus de résultats
                        </p>
                      </div>
                    </td>
                  </tr> :

                paginatedSinistres.map((sinistre) =>
                <tr
                  key={sinistre.id}
                  className="hover:bg-slate-50 transition-colors group">
                  
                      <td className="px-5 py-3.5">
                        <StatusBadge status={sinistre.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Car className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                            {sinistre.vehicule}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-700">
                          {sinistre.typeAccident}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-600 font-mono whitespace-nowrap">
                          {sinistre.dateAccident}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-slate-600">
                          {sinistre.emplacement ||
                      <span className="text-slate-300 italic">—</span>
                      }
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-[200px]">
                        <span className="text-sm text-slate-600 truncate block">
                          {sinistre.description ||
                      <span className="text-slate-300 italic">—</span>
                      }
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                        onClick={() => setSelectedSinistreForView(sinistre)}
                        className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        title="Voir">
                        
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => {
                          setEditingSinistre(sinistre);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Modifier">
                        
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() =>
                        setSelectedSinistreForRepair(sinistre)
                        }
                        className="p-1.5 rounded-lg text-cyan-500 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                        title="Réparation">
                        
                            <Wrench className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => handleDeleteSinistre(sinistre.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Supprimer">
                        
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                )
                }
              </tbody>
            </table>
          </div>

          <TableFooter
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onExportPdf={() => console.log('Export PDF Sinistres')}
            onExportExcel={() => console.log('Export Excel Sinistres')} />
          
        </div>
      </div>

      <AddEditSinistreModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingSinistre(null);
        }}
        onSave={handleSaveSinistre}
        sinistre={editingSinistre}
        vehicules={ALL_VEHICULES} />
      
    </div>);

}
// Alias export for App.tsx compatibility
export { GestionSinistresContent as GestionSinistres };