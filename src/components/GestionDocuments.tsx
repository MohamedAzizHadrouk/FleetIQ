import React, { useState, Component } from 'react';
import {
  Search,
  Filter,
  Edit,
  Clock,
  Trash2,
  Plus,
  X,
  AlarmClock,
  Calendar,
  ChevronDown,
  Car } from
'lucide-react';
import { TableFooter } from './TableFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalHeader } from '@/components/ui/modal-header';
// --- Types ---
type DocumentData = {
  id: number;
  type: string;
  frequence: string;
  rappelAvant: string;
  prochainPayement: string;
  hasAlarm: boolean;
};
// --- Mock Data ---
const MOCK_VEHICLES = [
{
  id: '1',
  matricule: '8125 TU 226 Skander Elj'
},
{
  id: '2',
  matricule: '8127 TU 226'
},
{
  id: '3',
  matricule: '8126 TU 226'
},
{
  id: '4',
  matricule: 'Tepee FM4200'
},
{
  id: '5',
  matricule: '8312 TU 193'
}];

const MOCK_DOCUMENTS: DocumentData[] = [
{
  id: 1,
  type: 'Contrôle technique (visite)',
  frequence: 'chaque 7 année',
  rappelAvant: '4 jour',
  prochainPayement: '17/11/2025 14:26:01',
  hasAlarm: true
},
{
  id: 2,
  type: 'Vignette',
  frequence: 'chaque 15 année',
  rappelAvant: '5 jour',
  prochainPayement: '27/09/2026 00:00:00',
  hasAlarm: false
},
{
  id: 3,
  type: 'Assurance',
  frequence: 'chaque 7 mois',
  rappelAvant: '5 jour',
  prochainPayement: '09/12/2025 16:58:04',
  hasAlarm: true
}];

const MOCK_HISTORY = [
{
  id: 1,
  validiteDe: '12 mai 2022',
  validiteJusqua: '14 nov. 2022',
  cout: 1,
  montantPaye: 1,
  datePayement: '12 mai 2022',
  description: "ATTERSTAION D'ASSURANCE 510000015",
  reference: '',
  fournisseur: 'ASSURANCE COMAR'
},
{
  id: 2,
  validiteDe: '10 mai 2023',
  validiteJusqua: '13 nov. 2023',
  cout: 1,
  montantPaye: 1,
  datePayement: '10 mai 2023',
  description: 'ATTESTATION D ASSURANCE',
  reference: '',
  fournisseur: 'COMAR'
},
{
  id: 3,
  validiteDe: '15 nov. 2024',
  validiteJusqua: '14 mai 2025',
  cout: 1,
  montantPaye: 1,
  datePayement: '22 nov. 2024',
  description: 'ASSURANCE 6 mois',
  reference: '',
  fournisseur: 'assurance comar'
}];

// --- Helper to parse frequency ---
function parseFrequence(frequence: string): {
  num: number;
  period: string;
} {
  const match = frequence.match(/chaque\s+(\d+)\s+(.+)/);
  if (match) {
    return {
      num: parseInt(match[1]),
      period: match[2]
    };
  }
  return {
    num: 1,
    period: 'mois'
  };
}
function parseRappel(rappel: string): number {
  const match = rappel.match(/(\d+)/);
  return match ? parseInt(match[1]) : 1;
}
function getTypeValue(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('vignette')) return 'vignette';
  if (lower.includes('assurance')) return 'assurance';
  if (lower.includes('contrôle') || lower.includes('controle'))
  return 'controle';
  if (lower.includes('autre')) return 'autre_taxe';
  return 'vignette';
}
// --- Modals ---
function AddDocumentModal({
  isOpen,
  onClose



}: {isOpen: boolean;onClose: () => void;}) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        exit={{
          opacity: 0
        }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
            y: 20
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
            y: 20
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
          
          <ModalHeader title="Ajouter un document" onClose={onClose} />

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Type Dropdown */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500 z-10">
                Type d'entretien
              </label>
              <select className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                <option value="" disabled selected>
                  Type d'entretien
                </option>
                <option value="vignette">Vignette</option>
                <option value="assurance">Assurance</option>
                <option value="controle">Contrôle technique</option>
                <option value="autre_taxe">Autre taxe</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Fréquence & Payement chaque */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500">
                  Fréquence
                </label>
                <input
                  type="number"
                  defaultValue={1}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500 z-10">
                  Payement chaque
                </label>
                <select className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white relative">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Date Picker */}
            <div className="relative">
              <input
                type="text"
                defaultValue="10/03/2026 09:34:37"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Me rappeler avant */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500">
                Me rappeler avant
              </label>
              <input
                type="number"
                defaultValue={1}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="text-slate-800 font-bold hover:text-sky-600 transition-colors">
              
              Ajouter
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function EditDocumentModal({
  isOpen,
  onClose,
  document




}: {isOpen: boolean;onClose: () => void;document: DocumentData | null;}) {
  if (!isOpen || !document) return null;
  const freq = parseFrequence(document.frequence);
  const rappelNum = parseRappel(document.rappelAvant);
  const typeValue = getTypeValue(document.type);
  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        exit={{
          opacity: 0
        }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
            y: 20
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
            y: 20
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
          
          <ModalHeader title="Modifier document" onClose={onClose} />

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Type Dropdown */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500 z-10">
                Type d'entretien
              </label>
              <select
                defaultValue={typeValue}
                className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                
                <option value="vignette">Vignette</option>
                <option value="assurance">Assurance</option>
                <option value="controle">Contrôle technique</option>
                <option value="autre_taxe">Autre taxe</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Fréquence & Payement chaque */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500">
                  Fréquence
                </label>
                <input
                  type="number"
                  defaultValue={freq.num}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500 z-10">
                  Payement chaque
                </label>
                <select
                  defaultValue={freq.period}
                  className="w-full appearance-none px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white relative">
                  
                  <option value="jour">jour</option>
                  <option value="semaine">semaine</option>
                  <option value="mois">mois</option>
                  <option value="année">année</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Date Picker */}
            <div className="relative">
              <input
                type="text"
                defaultValue={document.prochainPayement}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Me rappeler avant */}
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-slate-500">
                Me rappeler avant
              </label>
              <input
                type="number"
                defaultValue={rappelNum}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex justify-end gap-6">
            <button
              onClick={onClose}
              className="text-slate-600 font-bold hover:text-rose-600 transition-colors">
              
              Supprimer
            </button>
            <button
              onClick={onClose}
              className="text-slate-800 font-bold hover:text-sky-600 transition-colors">
              
              Enregistrer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function HistoryModal({
  isOpen,
  onClose,
  documentType




}: {isOpen: boolean;onClose: () => void;documentType: string | null;}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  if (!isOpen) return null;
  const totalItems = MOCK_HISTORY.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = MOCK_HISTORY.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        exit={{
          opacity: 0
        }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
            y: 20
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
            y: 20
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title="Historique du document"
            subtitle={`Type: ${documentType}`}
            onClose={onClose}
          />

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">
                    Validité de
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">
                    Validité jusqu'à
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">
                    Coût
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">
                    Montant payé
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">
                    Date de payement
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">
                    Description
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">
                    Référence
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500">
                    Fournisseur
                  </th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHistory.map((row) =>
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors">
                  
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.validiteDe}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.validiteJusqua}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.cout}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.montantPaye}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.datePayement}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.description}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.reference}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.fournisseur}
                    </td>
                    <td className="py-4 px-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                        className="text-slate-600 hover:text-blue-600 transition-colors"
                        title="Modifier">
                        
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                        className="text-rose-500 hover:text-rose-700 transition-colors"
                        title="Supprimer">
                        
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center gap-6">
            <div className="text-sm font-medium text-rose-600">
              Total cost: 3.000 د.ت
            </div>
            <div className="text-sm font-medium text-emerald-600">
              Paid cost: 3.000 د.ت
            </div>
          </div>

          <TableFooter
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            onExportPdf={() => console.log('Export PDF - History')}
            onExportExcel={() => console.log('Export Excel - History')} />
          
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Main Component ---
export function GestionDocuments() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedDocForEdit, setSelectedDocForEdit] =
  useState<DocumentData | null>(null);
  const [selectedDocForHistory, setSelectedDocForHistory] = useState<
    string | null>(
    null);
  const handleOpenEdit = (doc: DocumentData) => {
    setSelectedDocForEdit(doc);
    setShowEditModal(true);
  };
  const handleOpenHistory = (docType: string) => {
    setSelectedDocForHistory(docType);
    setShowHistoryModal(true);
  };
  // Pagination
  const totalItems = MOCK_DOCUMENTS.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocs = MOCK_DOCUMENTS.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestion de documents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les documents de vos véhicules
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Vehicle Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Sélectionner un véhicule
            </label>
            <div className="relative max-w-md">
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pl-10 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium">
                
                <option value="">-- Choisir un véhicule --</option>
                {MOCK_VEHICLES.map((v) =>
                <option key={v.id} value={v.matricule}>
                    {v.matricule}
                  </option>
                )}
              </select>
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {!selectedVehicle ?
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Aucun véhicule sélectionné
              </h3>
              <p className="text-slate-500 max-w-md">
                Il faut tout d'abord sélectionner le véhicule puis les documents
                de cette véhicule seront affichés.
              </p>
            </div> :

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              {/* Table Header & Actions */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <h3 className="text-lg font-bold text-slate-800">
                  Documents du véhicule :{' '}
                  <span className="text-blue-600">{selectedVehicle}</span>
                </h3>
                <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                
                  <Plus className="w-4 h-4" />
                  Ajouter un document
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-left">
                  <thead className="bg-red-50 border-b border-red-100">
                    <tr>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600">
                        Type de document
                      </th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600">
                        Fréquence
                      </th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600">
                        Me rappeler avant
                      </th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600">
                        Prochain payement
                      </th>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedDocs.map((doc) =>
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50 transition-colors group">
                    
                        <td className="px-6 py-4 text-sm text-slate-700 flex items-center gap-2">
                          {doc.hasAlarm &&
                      <AlarmClock className="w-5 h-5 text-rose-500" />
                      }
                          {!doc.hasAlarm &&
                      <span className="w-5 h-5 inline-block"></span>
                      }
                          {doc.type}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {doc.frequence}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {doc.rappelAvant}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {doc.prochainPayement}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="Modifier">
                          
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                          onClick={() => handleOpenHistory(doc.type)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="Historique">
                          
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-md transition-colors"
                          title="Supprimer">
                          
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>

              <TableFooter
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              onExportPdf={() => console.log('Export PDF')}
              onExportExcel={() => console.log('Export Excel')} />
            
            </div>
          }
        </div>
      </div>

      <AddDocumentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)} />
      

      <EditDocumentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        document={selectedDocForEdit} />
      

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        documentType={selectedDocForHistory} />
      
    </div>);

}