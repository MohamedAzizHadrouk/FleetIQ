import React, { useEffect, useState, Fragment, Component } from 'react';
import {
  Search,
  Filter,
  Edit,
  Clock,
  Trash2,
  Wrench,
  CheckCircle,
  X,
  Plus,
  CircleDashed,
  Info,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Pencil,
  History } from
'lucide-react';
import { TableFooter } from './TableFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalHeader } from '@/components/ui/modal-header';
// --- Types ---
type AxleConfig = {
  id: number;
  active: boolean;
  wheels: 2 | 4;
};
type InstalledTire = {
  tireId: string;
  marque: string;
};
type InstalledTiresMap = Record<string, InstalledTire>;
// --- Mock Data ---
const MOCK_TIRES = [
{
  id: '0001',
  marque: 'a',
  taille: '2',
  type: '2',
  cout: 15,
  dateAchat: '2019/07/18',
  dateExpiration: '2019/07/18',
  statut: 'Occupé',
  utilisable: true,
  roueInstallee: '',
  voiture: '',
  contact: '',
  revendeur: 'pp',
  tel: '',
  commentObtenu: 'Viens avec une nouvelle voiture',
  hauteurUsure: 2,
  kilometrageAchat: 0,
  kilometrageGarantie: 12
},
{
  id: '000002',
  marque: 'xvx',
  taille: '',
  type: '',
  cout: 200,
  dateAchat: '2019/07/22',
  dateExpiration: '2019/07/22',
  statut: 'Occupé',
  utilisable: true,
  roueInstallee: "A gauche à l'extérieur",
  voiture: '8125 TU 226 Skander Elj',
  contact: '',
  revendeur: '',
  tel: '',
  commentObtenu: '',
  hauteurUsure: 0,
  kilometrageAchat: 0,
  kilometrageGarantie: 0
},
{
  id: '5',
  marque: 'test',
  taille: '',
  type: '',
  cout: 500,
  dateAchat: '2021/03/23',
  dateExpiration: '2021/03/23',
  statut: 'Occupé',
  utilisable: true,
  roueInstallee: "A gauche à l'extérieur",
  voiture: '',
  contact: '',
  revendeur: '',
  tel: '',
  commentObtenu: '',
  hauteurUsure: 0,
  kilometrageAchat: 0,
  kilometrageGarantie: 0
},
{
  id: '10005',
  marque: 'marque',
  taille: '',
  type: '',
  cout: 500,
  dateAchat: '2021/07/13',
  dateExpiration: '2021/07/31',
  statut: 'Occupé',
  utilisable: true,
  roueInstallee: "A gauche à l'extérieur",
  voiture: '8127 TU 226',
  contact: '',
  revendeur: '',
  tel: '',
  commentObtenu: '',
  hauteurUsure: 0,
  kilometrageAchat: 0,
  kilometrageGarantie: 0
},
{
  id: '10006',
  marque: 'Bridgestone',
  taille: '',
  type: '',
  cout: 450,
  dateAchat: '2022/01/10',
  dateExpiration: '2027/01/10',
  statut: 'Disponible',
  utilisable: true,
  roueInstallee: '',
  voiture: '',
  contact: '',
  revendeur: '',
  tel: '',
  commentObtenu: '',
  hauteurUsure: 0,
  kilometrageAchat: 0,
  kilometrageGarantie: 0
}];

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
},
{
  id: '6',
  matricule: 'test ID 3210 tu 222'
},
{
  id: '7',
  matricule: 'TEST SOS'
},
{
  id: '8',
  matricule: 'TEST FMB120 + LVC200'
},
{
  id: '9',
  matricule: 'test gps'
},
{
  id: '10',
  matricule: 'Samiha ( Test CERT)'
}];

// --- History Mock Data ---
const MOCK_TIRE_HISTORY = [
{
  id: 1,
  date: '18/07/2019',
  type: 'Nouvelle entrée',
  cout: 15,
  km1: 120,
  km2: 0,
  bonTravail: ''
},
{
  id: 2,
  date: '04/05/2020',
  type: 'Désinstallation',
  cout: 200,
  km1: 0,
  km2: 0,
  bonTravail: '1002'
},
{
  id: 3,
  date: '22/07/2020',
  type: 'Désinstallation',
  cout: 50,
  km1: 0,
  km2: 0,
  bonTravail: 'B0050'
},
{
  id: 4,
  date: '22/07/2020',
  type: 'Installation',
  cout: 100,
  km1: 0,
  km2: 0,
  bonTravail: 'B0002'
},
{
  id: 5,
  date: '22/07/2020',
  type: 'Installation',
  cout: 100,
  km1: 0,
  km2: 0,
  bonTravail: 'B0002'
}];

const MOCK_VEHICLE_TIRE_HISTORY = [
{
  id: 1,
  date: '13/07/2021',
  type: 'Installation',
  cout: 200,
  mileage: 1000
},
{
  id: 2,
  date: '13/07/2021',
  type: 'Désinstallation',
  cout: 200,
  mileage: 0
},
{
  id: 3,
  date: '28/06/2024',
  type: 'Installation',
  cout: 0,
  mileage: 100
}];

// --- Add/Edit Tire Modal ---
interface TireFormData {
  id: string;
  marque: string;
  taille: string;
  type: string;
  cout: string;
  dateAchat: string;
  kilometrageAchat: string;
  dateExpiration: string;
  kilometrageGarantie: string;
  commentObtenu: string;
  hauteurUsure: string;
  revendeur: string;
}
function FloatingLabelInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false






}: {label: string;value: string;onChange: (v: string) => void;type?: string;required?: boolean;}) {
  return (
    <div className="relative">
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
        {label}
        {required && ' *'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700" />
      
    </div>);

}
function AddEditTireModal({
  isOpen,
  onClose,
  onSave,
  editTire





}: {isOpen: boolean;onClose: () => void;onSave: (data: TireFormData) => void;editTire?: (typeof MOCK_TIRES)[0] | null;}) {
  const isEditMode = !!editTire;
  const emptyForm: TireFormData = {
    id: '',
    marque: '',
    taille: '',
    type: '',
    cout: '0',
    dateAchat: '',
    kilometrageAchat: '0',
    dateExpiration: '',
    kilometrageGarantie: '0',
    commentObtenu: '',
    hauteurUsure: '0',
    revendeur: ''
  };
  const [formData, setFormData] = useState<TireFormData>(emptyForm);
  // Populate form when editTire changes
  useEffect(() => {
    if (editTire) {
      // Convert date format from YYYY/MM/DD to YYYY-MM-DD for date inputs
      const formatDate = (d: string) => d ? d.replace(/\//g, '-') : '';
      setFormData({
        id: editTire.id || '',
        marque: editTire.marque || '',
        taille: '',
        type: '',
        cout: String(editTire.cout || 0),
        dateAchat: formatDate(editTire.dateAchat),
        kilometrageAchat: '0',
        dateExpiration: formatDate(editTire.dateExpiration),
        kilometrageGarantie: '0',
        commentObtenu: '',
        hauteurUsure: '0',
        revendeur: ''
      });
    } else {
      setFormData(emptyForm);
    }
  }, [editTire, isOpen]);
  const update = (field: keyof TireFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (!isEditMode) {
      setFormData(emptyForm);
    }
  };
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
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          exit={{
            scale: 0.95,
            opacity: 0
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title={isEditMode ? 'Modifier ce pneu' : 'Ajouter un pneu'}
            onClose={onClose}
          />

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 flex flex-col gap-5 overflow-y-auto">
            
            {/* Row 1: Id, Marque */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Id"
                value={formData.id}
                onChange={(v) => update('id', v)} />
              
              <FloatingLabelInput
                label="Marque"
                value={formData.marque}
                onChange={(v) => update('marque', v)} />
              
            </div>

            {/* Row 2: Taille, Type */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Taille"
                value={formData.taille}
                onChange={(v) => update('taille', v)} />
              
              <FloatingLabelInput
                label="Type"
                value={formData.type}
                onChange={(v) => update('type', v)} />
              
            </div>

            {/* Row 3: Coût (full width, floating label) */}
            <FloatingLabelInput
              label="Coût"
              value={formData.cout}
              onChange={(v) => update('cout', v)}
              type="number" />
            

            {/* Row 4: Date d'achat, Kilométrage au achat */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                  Date d'achat *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateAchat}
                  onChange={(e) => update('dateAchat', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700" />
                
                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <FloatingLabelInput
                label="Kilométrage au achat"
                value={formData.kilometrageAchat}
                onChange={(v) => update('kilometrageAchat', v)}
                type="number" />
              
            </div>

            {/* Row 5: Date d'expiration, Kilométrage sous garantie */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                  Date d'expiration de la garantie
                </label>
                <input
                  type="date"
                  value={formData.dateExpiration}
                  onChange={(e) => update('dateExpiration', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700" />
                
                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <FloatingLabelInput
                label="Kilométrage sous garantie expiré"
                value={formData.kilometrageGarantie}
                onChange={(v) => update('kilometrageGarantie', v)}
                type="number" />
              
            </div>

            {/* Row 6: Comment obtenu (select, full width) */}
            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                Comment obtenu
              </label>
              <select
                value={formData.commentObtenu}
                onChange={(e) => update('commentObtenu', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none text-slate-700 bg-white">
                
                <option value="">Comment obtenu</option>
                <option value="nouvelle_voiture">
                  Viens avec une nouvelle voiture
                </option>
                <option value="voiture_occasion">
                  Viens avec une voiture occasion
                </option>
                <option value="achete_occasion">Acheté comme occasion</option>
                <option value="achete_neuf">Acheté comme neuf</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Row 7: Hauteur indicateurs d'usure, Revendeur */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Hauteur des indicateurs d'usure(m)"
                value={formData.hauteurUsure}
                onChange={(v) => update('hauteurUsure', v)}
                type="number" />
              
              <FloatingLabelInput
                label="Revendeur"
                value={formData.revendeur}
                onChange={(v) => update('revendeur', v)} />
              
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${isEditMode ? 'bg-[#0ea5e9] hover:bg-sky-600 text-white' : 'text-slate-500 bg-slate-200 hover:bg-slate-300'}`}>
                
                {isEditMode ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Modals ---
function TireHistoryModal({
  isOpen,
  onClose,
  tireId




}: {isOpen: boolean;onClose: () => void;tireId: string | null;}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showAddHistoryForm, setShowAddHistoryForm] = useState(false);
  if (!isOpen) return null;
  const totalItems = MOCK_TIRE_HISTORY.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = MOCK_TIRE_HISTORY.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const handleAddHistoryEntry = (data: TireOperationFormData) => {
    console.log('New tire history entry:', data, 'for tire:', tireId);
    setShowAddHistoryForm(false);
  };
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title="Historique du pneu"
            subtitle={`ID Pneu: ${tireId}`}
            onClose={onClose}
            actions={
              <button
                onClick={() => setShowAddHistoryForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-primary-foreground rounded-lg text-sm font-bold transition-colors">
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            }
          />

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    Date d'opération
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    Type d'opération
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    Coût
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    Kilométrage
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    Kilométrage
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    N° de bon de travail
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHistory.map((row) =>
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors">
                  
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.date}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.type}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.cout}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.km1}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.km2}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.bonTravail}
                    </td>
                    <td className="py-4 px-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                        title="Modifier">
                        
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                        className="text-rose-400 hover:text-rose-600 transition-colors"
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
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            onExportPdf={() => console.log('Export PDF - Tire History')}
            onExportExcel={() => console.log('Export Excel - Tire History')} />
          
        </motion.div>
      </motion.div>

      {/* Add History Entry Form Modal */}
      <TireOperationFormModal
        isOpen={showAddHistoryForm}
        onClose={() => setShowAddHistoryForm(false)}
        onSubmit={handleAddHistoryEntry}
        operationType="reparation_verification" />
      
    </AnimatePresence>);

}
function VehicleTireHistoryModal({
  isOpen,
  onClose,
  vehicle




}: {isOpen: boolean;onClose: () => void;vehicle: string | null;}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  if (!isOpen) return null;
  const totalItems = MOCK_VEHICLE_TIRE_HISTORY.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = MOCK_VEHICLE_TIRE_HISTORY.slice(
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title="Historique des pneus du véhicule"
            subtitle={`Véhicule: ${vehicle}`}
            onClose={onClose}
          />

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    Date
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    Type
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    Coût
                  </th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-500">
                    OperationMileage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHistory.map((row) =>
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors">
                  
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.date}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.type}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.cout}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-700">
                      {row.mileage}
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
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            onExportPdf={() => console.log('Export PDF - Vehicle Tire History')}
            onExportExcel={() =>
            console.log('Export Excel - Vehicle Tire History')
            } />
          
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function EssieuxModal({
  isOpen,
  onClose,
  vehicle,
  axles,
  setAxles






}: {isOpen: boolean;onClose: () => void;vehicle: string | null;axles: AxleConfig[];setAxles: (axles: AxleConfig[]) => void;}) {
  if (!isOpen) return null;
  const toggleAxle = (id: number) => {
    setAxles(
      axles.map((a) =>
      a.id === id ?
      {
        ...a,
        active: !a.active
      } :
      a
      )
    );
  };
  const updateWheels = (id: number, wheels: 2 | 4) => {
    setAxles(
      axles.map((a) =>
      a.id === id ?
      {
        ...a,
        wheels
      } :
      a
      )
    );
  };
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
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          exit={{
            scale: 0.95,
            opacity: 0
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          
          <ModalHeader
            title="Configuration des essieux"
            subtitle={`Véhicule: ${vehicle}`}
            onClose={onClose}
          />
          <div className="p-6 pt-0">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {axles.map((axle) =>
              <div
                key={axle.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${axle.active ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-slate-50'}`}>
                
                  <div className="flex items-center gap-3">
                    <button
                    onClick={() => toggleAxle(axle.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${axle.active ? 'bg-blue-500' : 'bg-slate-300'}`}>
                    
                      <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${axle.active ? 'translate-x-6' : 'translate-x-1'}`} />
                    
                    </button>
                    <span
                    className={`text-sm font-bold ${axle.active ? 'text-blue-900' : 'text-slate-500'}`}>
                    
                      Essieu {axle.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                    className={`text-sm font-medium ${axle.active ? 'text-blue-800' : 'text-slate-400'}`}>
                    
                      Roues:
                    </span>
                    <select
                    value={axle.wheels}
                    onChange={(e) =>
                    updateWheels(axle.id, parseInt(e.target.value) as 2 | 4)
                    }
                    className={`w-20 px-2 py-1.5 text-sm font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${!axle.active ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white border-blue-300 text-blue-900 cursor-pointer'}`}
                    disabled={!axle.active}>
                    
                      <option value={2}>2</option>
                      <option value={4}>4</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm">
                
                Valider la configuration
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Tire Operation Form Modal (Installation / Désinstallation) ---
interface TireOperationFormData {
  bonTravail: string;
  description: string;
  commentaire: string;
  dateOperation: string;
  kilometrage: string;
  pression: string;
  operationCost: string;
}
function TireOperationFormModal({
  isOpen,
  onClose,
  onSubmit,
  operationType





}: {isOpen: boolean;onClose: () => void;onSubmit: (data: TireOperationFormData) => void;operationType: 'installation' | 'desinstallation' | 'reparation_verification';}) {
  const [formData, setFormData] = useState<TireOperationFormData>({
    bonTravail: '',
    description: '',
    commentaire: '',
    dateOperation: '',
    kilometrage: '0',
    pression: '0',
    operationCost: '0'
  });
  useEffect(() => {
    if (isOpen) {
      setFormData({
        bonTravail: '',
        description: '',
        commentaire: '',
        dateOperation: '',
        kilometrage: '0',
        pression: '0',
        operationCost: '0'
      });
    }
  }, [isOpen]);
  const update = (field: keyof TireOperationFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}>
        
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
            y: 10
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
            y: 10
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title={
              operationType === 'installation'
                ? 'Installation'
                : operationType === 'desinstallation'
                ? 'Désinstallation'
                : 'Réparation/Vérification'
            }
            onClose={onClose}
          />

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 flex flex-col gap-5 overflow-y-auto">
            
            {/* Row 1: N° de bon de travail */}
            <div className="relative">
              <input
                type="text"
                value={formData.bonTravail}
                onChange={(e) => update('bonTravail', e.target.value)}
                placeholder="N° de bon de travail"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 placeholder:text-slate-400" />
              
            </div>

            {/* Row 2: Description + Commentaire */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Description"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 placeholder:text-slate-400" />
                
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.commentaire}
                  onChange={(e) => update('commentaire', e.target.value)}
                  placeholder="Commentaire"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 placeholder:text-slate-400" />
                
              </div>
            </div>

            {/* Row 3: Date d'opération + Kilométrage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.dateOperation}
                  onChange={(e) => update('dateOperation', e.target.value)}
                  placeholder="Date d'opération"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700" />
                
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                  Date d'opération *
                </label>
                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <FloatingLabelInput
                label="Kilométrage"
                value={formData.kilometrage}
                onChange={(v) => update('kilometrage', v)}
                type="number" />
              
            </div>

            {/* Row 4: Pression(bar) + OperationCost */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Pression(bar)"
                value={formData.pression}
                onChange={(v) => update('pression', v)}
                type="number" />
              
              <FloatingLabelInput
                label="OperationCost"
                value={formData.operationCost}
                onChange={(v) => update('operationCost', v)}
                type="number" />
              
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium rounded-lg transition-colors text-slate-500 bg-slate-200 hover:bg-slate-300">
                
                Ajouter
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function SchemaModal({
  isOpen,
  onClose,
  vehicle,
  axles,
  installedTires,
  setInstalledTires







}: {isOpen: boolean;onClose: () => void;vehicle: string | null;axles: AxleConfig[];installedTires: InstalledTiresMap;setInstalledTires: React.Dispatch<React.SetStateAction<InstalledTiresMap>>;}) {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [showOperationForm, setShowOperationForm] = useState(false);
  const [operationType, setOperationType] = useState<
    'installation' | 'desinstallation' | 'reparation_verification'>(
    'installation');
  const [pendingInstallTire, setPendingInstallTire] = useState<
    (typeof MOCK_TIRES)[0] | null>(
    null);
  if (!isOpen) return null;
  const activeAxles = axles.filter((a) => a.active);
  const axleCount = activeAxles.length;
  // Dynamic sizing based on number of active axles - LARGER sizes for readability
  const isCompact = axleCount >= 5;
  const isMedium = axleCount >= 3 && axleCount < 5;
  // Tire dimensions - significantly larger
  const tireW = isCompact ? 'w-20' : isMedium ? 'w-24' : 'w-28';
  const tireH = isCompact ? 'h-14' : isMedium ? 'h-16' : 'h-20';
  const halfH = isCompact ? 'h-10' : isMedium ? 'h-12' : 'h-14';
  const iconSize = isCompact ? 'w-5 h-5' : isMedium ? 'w-5 h-5' : 'w-6 h-6';
  const idFontSize = isCompact ?
  'text-[9px]' :
  isMedium ?
  'text-[10px]' :
  'text-xs';
  const labelFontSize = isCompact ? 'text-sm' : 'text-base';
  const gapBetweenAxles = isCompact ? 'gap-6' : isMedium ? 'gap-10' : 'gap-16';
  const gapBetweenSides = isCompact ? 'gap-6' : isMedium ? 'gap-8' : 'gap-10';
  const axlePadY = isCompact ? 'py-10' : isMedium ? 'py-12' : 'py-14';
  const containerPad = isCompact ? 'p-6' : isMedium ? 'p-8' : 'p-10';
  const labelOffset = isCompact ? '-top-8' : '-top-10';
  const labelOffsetBottom = isCompact ? '-bottom-8' : '-bottom-10';
  // Filter out tires that are already installed on the current schema
  const availableTires = MOCK_TIRES.filter(
    (t) =>
    !t.voiture &&
    !Object.values(installedTires).some((it) => it.tireId === t.id)
  );
  const handleInstallClick = (tire: (typeof MOCK_TIRES)[0]) => {
    setPendingInstallTire(tire);
    setOperationType('installation');
    setShowOperationForm(true);
  };
  const handleRemoveClick = () => {
    setOperationType('desinstallation');
    setShowOperationForm(true);
  };
  const handleOperationSubmit = (data: TireOperationFormData) => {
    console.log(`Tire operation (${operationType}):`, data);
    if (
    operationType === 'installation' &&
    pendingInstallTire &&
    selectedPosition)
    {
      setInstalledTires((prev) => ({
        ...prev,
        [selectedPosition]: {
          tireId: pendingInstallTire.id,
          marque: pendingInstallTire.marque
        }
      }));
      setSelectedPosition(null);
      setPendingInstallTire(null);
    } else if (operationType === 'desinstallation' && selectedPosition) {
      setInstalledTires((prev) => {
        const next = {
          ...prev
        };
        delete next[selectedPosition];
        return next;
      });
      setSelectedPosition(null);
    }
    setShowOperationForm(false);
  };
  const handleOperationClose = () => {
    setShowOperationForm(false);
    setPendingInstallTire(null);
  };
  const TirePosition = ({
    positionKey,
    label,
    shape,
    labelPosition





  }: {positionKey: string;label?: string;shape: 'single' | 'top-half' | 'bottom-half';labelPosition?: 'top' | 'bottom';}) => {
    const isSelected = selectedPosition === positionKey;
    const installedTire = installedTires[positionKey];
    const isInstalled = !!installedTire;
    let shapeClasses = `${tireW} ${tireH} rounded-xl border-[3px]`;
    if (shape === 'top-half')
    shapeClasses = `${tireW} ${halfH} rounded-t-xl border-[3px] border-b-[1.5px]`;
    if (shape === 'bottom-half')
    shapeClasses = `${tireW} ${halfH} rounded-b-xl border-[3px] border-t-[1.5px]`;
    const stateClasses = isSelected ?
    'border-blue-500 bg-slate-700 ring-4 ring-blue-500/20 z-20' :
    isInstalled ?
    'border-emerald-500 bg-slate-800 hover:border-emerald-400 z-10' :
    'border-slate-600 bg-slate-800 hover:border-blue-400 z-10';
    return (
      <div className="relative">
        {label && labelPosition === 'top' &&
        <span
          className={`${`absolute ${labelOffset} left-1/2 -translate-x-1/2 ${labelFontSize} font-extrabold text-slate-700 whitespace-nowrap tracking-wide`} ml-[30px]`}>
          
            {label}
          </span>
        }
        <button
          onClick={() => setSelectedPosition(positionKey)}
          className={`${shapeClasses} ${stateClasses} flex flex-col items-center justify-center transition-all relative group shadow-md`}>
          
          {isInstalled ?
          <div className="flex flex-col items-center gap-1">
              <CheckCircle className={`${iconSize} text-emerald-400`} />
              <span
              className={`${idFontSize} font-bold text-emerald-400 bg-emerald-900/50 px-1.5 py-0.5 rounded leading-none`}>
              
                {installedTire.tireId}
              </span>
            </div> :

          <CircleDashed
            className={`${iconSize} text-slate-500 group-hover:text-blue-400 transition-colors`} />

          }
        </button>
        {label && labelPosition === 'bottom' &&
        <span
          className={`${`absolute ${labelOffsetBottom} left-1/2 -translate-x-1/2 ${labelFontSize} font-extrabold text-slate-700 whitespace-nowrap tracking-wide`} ml-[30px]`}>
          
            {label}
          </span>
        }
      </div>);

  };
  const renderSide = (
  axle: AxleConfig,
  side: 'top' | 'bottom',
  prefix: string) =>
  {
    const isTop = side === 'top';
    const label = `${prefix}${isTop ? 'G' : 'D'}`;
    if (axle.wheels === 2) {
      const posKey = `${axle.id}-${side}-0`;
      return (
        <div className="relative z-10">
          <TirePosition
            positionKey={posKey}
            label={label}
            shape="single"
            labelPosition={isTop ? 'top' : 'bottom'} />
          
        </div>);

    } else {
      const posOuter = `${axle.id}-${side}-outer`;
      const posInner = `${axle.id}-${side}-inner`;
      return (
        <div className="relative z-10 flex flex-col gap-1">
          <span
            className={`${`absolute ${isTop ? labelOffset : labelOffsetBottom} left-1/2 -translate-x-1/2 ${labelFontSize} font-extrabold text-slate-700 whitespace-nowrap tracking-wide`} ml-[30px]`}>
            
            {label}
          </span>
          {isTop ?
          <>
              <TirePosition positionKey={posOuter} shape="top-half" />
              <TirePosition positionKey={posInner} shape="bottom-half" />
            </> :

          <>
              <TirePosition positionKey={posInner} shape="top-half" />
              <TirePosition positionKey={posOuter} shape="bottom-half" />
            </>
          }
        </div>);

    }
  };
  const selectedTireData = selectedPosition ?
  installedTires[selectedPosition] :
  null;
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3"
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[96vw] xl:max-w-[90vw] overflow-hidden flex flex-col max-h-[95vh]">
          
          <ModalHeader
            title="Schéma des pneumatiques"
            subtitle={`Véhicule: ${vehicle}`}
            onClose={onClose}
          />

          <div className="flex-1 overflow-hidden flex bg-slate-50 min-h-[500px]">
            {/* Left: Vehicle Schema - HORIZONTAL LAYOUT */}
            <div className="flex-1 p-6 flex items-center justify-center relative overflow-auto">
              {activeAxles.length === 0 ?
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Wrench className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Aucun essieu actif</p>
                  <p className="text-sm">
                    Veuillez configurer les essieux d'abord.
                  </p>
                </div> :

              <div
                className={`bg-white ${containerPad} rounded-3xl shadow-sm border border-slate-200 relative w-full min-h-[400px] flex items-center justify-center`}>
                
                  {/* Chassis Background - HORIZONTAL */}
                  <div
                  className={`absolute ${isCompact ? 'inset-x-10' : isMedium ? 'inset-x-14' : 'inset-x-16'} top-1/2 -translate-y-1/2 ${isCompact ? 'h-20' : isMedium ? 'h-24' : 'h-28'} bg-slate-100 rounded-l-[60px] rounded-r-2xl border-4 border-slate-200 z-0`}>
                </div>

                  {/* Axles container - HORIZONTAL (left to right) */}
                  <div
                  className={`relative z-10 flex flex-row ${gapBetweenAxles} px-4 items-center justify-center`}>
                  
                    {activeAxles.map((axle, index) => {
                    const isFront = index === 0;
                    const prefix = isFront ? 'AV' : 'AR';
                    return (
                      <div
                        key={axle.id}
                        className={`flex flex-col items-center ${gapBetweenSides} relative ${axlePadY}`}>
                        
                          {/* Axle Bar - VERTICAL */}
                          <div
                          className={`absolute inset-y-1 left-1/2 -translate-x-1/2 ${isCompact ? 'w-2.5' : 'w-3'} bg-slate-800 rounded-full z-0 shadow-sm`}>
                        </div>

                          {/* Top Wheels (G - Gauche) */}
                          {renderSide(axle, 'top', prefix)}

                          {/* Bottom Wheels (D - Droite) */}
                          {renderSide(axle, 'bottom', prefix)}
                        </div>);

                  })}
                  </div>

                  {/* Axle count indicator */}
                  <div className="absolute bottom-3 right-4 text-xs font-medium text-slate-400">
                    {axleCount} essieu{axleCount > 1 ? 'x' : ''} actif
                    {axleCount > 1 ? 's' : ''}
                  </div>
                </div>
              }
            </div>

            {/* Right: Tire Stock / Actions */}
            <div className="w-80 xl:w-96 border-l border-slate-200 bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 flex-shrink-0">
              {!selectedPosition ?
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Info className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    Sélectionnez un emplacement
                  </h3>
                  <p className="text-sm">
                    Cliquez sur un emplacement vide du schéma pour y installer
                    un pneu, ou sur un pneu existant pour le retirer.
                  </p>
                </div> :
              selectedTireData ?
              <div className="flex-1 flex flex-col">
                  <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-emerald-900">
                          Pneu Installé
                        </h3>
                        <p className="text-sm text-emerald-700 font-medium">
                          Position sélectionnée
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">ID Pneu</span>
                        <span className="font-bold text-slate-800">
                          {selectedTireData.tireId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm">Marque</span>
                        <span className="font-bold text-slate-800">
                          {selectedTireData.marque}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 mt-auto">
                    <button
                    onClick={handleRemoveClick}
                    className="w-full py-3 bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    
                      <Trash2 className="w-5 h-5" />
                      Retirer ce pneu
                    </button>
                  </div>
                </div> :

              <div className="flex-1 flex flex-col h-full">
                  <div className="p-5 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Stock disponible
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                      type="text"
                      placeholder="Rechercher un pneu..."
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm" />
                    
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {availableTires.length === 0 ?
                  <p className="text-center text-slate-500 text-sm py-8">
                        Aucun pneu disponible dans le stock.
                      </p> :

                  availableTires.map((tire) =>
                  <div
                    key={tire.id}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group">
                    
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-800 text-lg">
                              #{tire.id}
                            </span>
                            <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                              Disponible
                            </span>
                          </div>
                          <div className="text-sm text-slate-600 space-y-1.5 mb-4">
                            <p className="flex justify-between">
                              <span className="text-slate-400">Marque:</span>
                              <span className="font-medium text-slate-700">
                                {tire.marque}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-400">Achat:</span>
                              <span className="font-medium text-slate-700">
                                {tire.dateAchat}
                              </span>
                            </p>
                          </div>
                          <button
                      onClick={() => handleInstallClick(tire)}
                      className="w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      
                            Installer ici
                          </button>
                        </div>
                  )
                  }
                  </div>
                </div>
              }
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Tire Operation Form Modal (nested, higher z-index) */}
      <TireOperationFormModal
        isOpen={showOperationForm}
        onClose={handleOperationClose}
        onSubmit={handleOperationSubmit}
        operationType={operationType} />
      
    </AnimatePresence>);

}
// --- Expandable Detail Row ---
function TireDetailBanner({ tire }: {tire: (typeof MOCK_TIRES)[0];}) {
  const details = [
  {
    label: `Hauteur des indicateurs d'usure(m) : ${tire.hauteurUsure}`
  },
  {
    label: `Taille : ${tire.taille || '-'}`
  },
  {
    label: `Contact : ${tire.contact || '-'}`
  },
  {
    label: `Revendeur : ${tire.revendeur || '-'}`
  },
  {
    label: `Tel: ${tire.tel || '-'}`
  },
  {
    label: `Comment obtenu : ${tire.commentObtenu || '-'}`
  },
  {
    label: `Kilométrage sous garantie expiré : ${tire.kilometrageGarantie}`
  }];

  return (
    <motion.tr
      initial={{
        opacity: 0,
        height: 0
      }}
      animate={{
        opacity: 1,
        height: 'auto'
      }}
      exit={{
        opacity: 0,
        height: 0
      }}
      className="bg-slate-50">
      
      <td colSpan={11} className="px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {details.map((d, i) =>
          <span
            key={i}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-300 bg-emerald-50 text-emerald-800">
            
              {d.label}
            </span>
          )}
        </div>
      </td>
    </motion.tr>);

}
// --- Main Component ---
export function GestionPneus() {
  const [activeTab, setActiveTab] = useState<'stock' | 'vehicules'>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  // Modals state
  const [showEssieuxModal, setShowEssieuxModal] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [showTireHistoryModal, setShowTireHistoryModal] = useState(false);
  const [showVehicleTireHistoryModal, setShowVehicleTireHistoryModal] =
  useState(false);
  const [showAddTireModal, setShowAddTireModal] = useState(false);
  const [editingTire, setEditingTire] = useState<(typeof MOCK_TIRES)[0] | null>(
    null
  );
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedTireForHistory, setSelectedTireForHistory] = useState<
    string | null>(
    null);
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<
    string | null>(
    null);
  // Lifted State for Axles and Tires
  const [axles, setAxles] = useState<AxleConfig[]>([
  {
    id: 1,
    active: true,
    wheels: 2
  },
  {
    id: 2,
    active: true,
    wheels: 4
  },
  {
    id: 3,
    active: false,
    wheels: 4
  },
  {
    id: 4,
    active: false,
    wheels: 4
  },
  {
    id: 5,
    active: false,
    wheels: 2
  },
  {
    id: 6,
    active: false,
    wheels: 2
  }]
  );
  const [installedTires, setInstalledTires] = useState<InstalledTiresMap>({});
  // Filtering
  const filteredTires = MOCK_TIRES.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.id.toLowerCase().includes(term) ||
      t.marque.toLowerCase().includes(term) ||
      t.voiture.toLowerCase().includes(term));

  });
  const filteredVehicles = MOCK_VEHICLES.filter((v) => {
    if (!searchTerm) return true;
    return v.matricule.toLowerCase().includes(searchTerm.toLowerCase());
  });
  // Pagination
  const currentData = activeTab === 'stock' ? filteredTires : filteredVehicles;
  const totalItems = currentData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(startIndex, startIndex + itemsPerPage);
  const toggleRowExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const handleOpenEssieux = (vehicle: string) => {
    setSelectedVehicle(vehicle);
    setShowEssieuxModal(true);
  };
  const handleOpenSchema = (vehicle: string) => {
    setSelectedVehicle(vehicle);
    setShowSchemaModal(true);
  };
  const handleOpenTireHistory = (tireId: string) => {
    setSelectedTireForHistory(tireId);
    setShowTireHistoryModal(true);
  };
  const handleOpenVehicleTireHistory = (matricule: string) => {
    setSelectedVehicleForHistory(matricule);
    setShowVehicleTireHistoryModal(true);
  };
  const handleAddTire = (data: TireFormData) => {
    console.log('New tire added:', data);
    setShowAddTireModal(false);
  };
  const handleEditTire = (tire: (typeof MOCK_TIRES)[0]) => {
    setEditingTire(tire);
  };
  const handleSaveEditTire = (data: TireFormData) => {
    console.log('Tire updated:', data);
    setEditingTire(null);
  };
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-slate-200 pt-4 px-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion des pneus
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez le stock de pneus et les affectations aux véhicules
            </p>
          </div>
          <button
            onClick={() => setShowAddTireModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
            
            <Plus className="w-4 h-4" />
            Ajouter un pneu
          </button>
        </div>

        <div className="flex gap-6">
          <button
            onClick={() => {
              setActiveTab('stock');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'stock' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            
            Stock des pneus
          </button>
          <button
            onClick={() => {
              setActiveTab('vehicules');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'vehicules' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            
            Véhicule - Pneu
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                activeTab === 'stock' ?
                'Rechercher un pneu...' :
                'Rechercher un véhicule...'
                }
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
              
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium transition-colors">
              <Filter className="w-4 h-4" />
              Filtrer
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full whitespace-nowrap text-left">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                {activeTab === 'stock' ?
                <tr>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Id
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Marque
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Coût
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Date d'achat
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Date d'expiration de la garantie
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                      On peut l'utilisé
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Roue installée
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Voiture
                    </th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr> :

                <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Matricule
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]"></th>
                  </tr>
                }
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'stock' ?
                (paginatedData as typeof MOCK_TIRES).map((tire) => {
                  const isExpanded = expandedRows.has(tire.id);
                  return (
                    <Fragment key={tire.id}>
                          <tr
                        className={`transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50' : 'hover:bg-blue-50/50'}`}
                        onClick={() => toggleRowExpand(tire.id)}>
                        
                            <td className="px-4 py-3.5 text-sm font-bold text-slate-800">
                              {tire.id}
                            </td>
                            <td className="px-4 py-3.5 text-sm font-medium text-slate-700">
                              {tire.marque}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-slate-600">
                              {tire.cout}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-slate-600">
                              {tire.dateAchat}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-slate-600">
                              {tire.dateExpiration}
                            </td>
                            <td className="px-4 py-3.5 text-sm text-slate-600">
                              {tire.statut}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {tire.utilisable &&
                          <CheckCircle className="w-5 h-5 text-emerald-500 inline-block" />
                          }
                            </td>
                            <td className="px-4 py-3.5 text-sm text-slate-600">
                              {tire.roueInstallee || ''}
                            </td>
                            <td className="px-4 py-3.5 text-sm font-medium text-slate-700">
                              {tire.voiture || ''}
                            </td>
                            <td
                          className="px-4 py-3.5 bg-white group-hover:bg-blue-50/50 transition-colors"
                          onClick={(e) => e.stopPropagation()}>
                          
                              <div className="flex items-center justify-end gap-2">
                                <button
                              onClick={() => handleEditTire(tire)}
                              className="p-1.5 text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                              title="Modifier">
                              
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                              onClick={() => handleOpenTireHistory(tire.id)}
                              className="p-1.5 text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors"
                              title="Historique">
                              
                                  <History className="w-4 h-4" />
                                </button>
                                <button
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Supprimer">
                              
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          <AnimatePresence>
                            {isExpanded && <TireDetailBanner tire={tire} />}
                          </AnimatePresence>
                        </Fragment>);

                }) :
                (paginatedData as typeof MOCK_VEHICLES).map((vehicle) =>
                <tr
                  key={vehicle.id}
                  className="hover:bg-blue-50/50 transition-colors group">
                  
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          {vehicle.matricule}
                        </td>
                        <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-blue-50/50 transition-colors shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                          <div className="flex items-center justify-end gap-3">
                            <button
                        onClick={() =>
                        handleOpenSchema(vehicle.matricule)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-medium rounded-md transition-colors"
                        title="Schéma essieux-roues">
                        
                              <CircleDashed className="w-4 h-4" />
                              <span className="text-xs">Schéma</span>
                            </button>
                            <button
                        onClick={() =>
                        handleOpenEssieux(vehicle.matricule)
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-medium rounded-md transition-colors"
                        title="Configuration des essieux">
                        
                              <Wrench className="w-4 h-4" />
                              <span className="text-xs">Essieux</span>
                            </button>
                            <button
                        onClick={() =>
                        handleOpenVehicleTireHistory(vehicle.matricule)
                        }
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="Historique">
                        
                              <Clock className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                )}
                {paginatedData.length === 0 &&
                <tr>
                    <td
                    colSpan={11}
                    className="px-6 py-12 text-center text-slate-500">
                    
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-lg font-medium text-slate-600">
                          Aucun résultat trouvé
                        </p>
                        <p className="text-sm">
                          Essayez de modifier vos critères de recherche.
                        </p>
                      </div>
                    </td>
                  </tr>
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
            onExportPdf={() => console.log('Export PDF')}
            onExportExcel={() => console.log('Export Excel')} />
          
        </div>
      </div>

      <EssieuxModal
        isOpen={showEssieuxModal}
        onClose={() => setShowEssieuxModal(false)}
        vehicle={selectedVehicle}
        axles={axles}
        setAxles={setAxles} />
      

      <SchemaModal
        isOpen={showSchemaModal}
        onClose={() => setShowSchemaModal(false)}
        vehicle={selectedVehicle}
        axles={axles}
        installedTires={installedTires}
        setInstalledTires={setInstalledTires} />
      

      <TireHistoryModal
        isOpen={showTireHistoryModal}
        onClose={() => setShowTireHistoryModal(false)}
        tireId={selectedTireForHistory} />
      

      <VehicleTireHistoryModal
        isOpen={showVehicleTireHistoryModal}
        onClose={() => setShowVehicleTireHistoryModal(false)}
        vehicle={selectedVehicleForHistory} />
      

      <AddEditTireModal
        isOpen={showAddTireModal}
        onClose={() => setShowAddTireModal(false)}
        onSave={handleAddTire} />
      

      <AddEditTireModal
        isOpen={!!editingTire}
        onClose={() => setEditingTire(null)}
        onSave={handleSaveEditTire}
        editTire={editingTire} />
      
    </div>);

}