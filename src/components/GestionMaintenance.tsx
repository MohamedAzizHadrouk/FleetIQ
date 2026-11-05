import React, { useEffect, useState, Component } from 'react';
import {
  Timer,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronDown,
  Plus,
  AlertTriangle,
  Calendar as CalendarIcon } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableFooter } from './TableFooter';
import { ModalHeader } from '@/components/ui/modal-header';
// --- Types ---
interface Rappel {
  id: number;
  type: string;
  typePlanning: string;
  frequence: string;
  rappelAvant: string;
  kmActuel: string;
  prochaineMaintenance: string;
  isOverdue: boolean;
}
interface Reparation {
  id: number;
  date: string;
  heuresAchevement: string;
  km: number;
  cout: number;
  montantPaye: number;
  datePaiement: string;
  description: string;
  reference: string;
  fournisseur: string;
  typeEntretien: string;
}
interface EntretienAcheve {
  id: number;
  date: string;
  heuresAchevement: string;
  km: number;
  cout: number;
  coutPaye: number;
  datePaiement: string;
  description: string;
  reference: string;
  fournisseur: string;
}
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
}];

const INITIAL_RAPPELS: Rappel[] = [
{
  id: 1,
  type: 'Vidange',
  typePlanning: 'Par kilométrage',
  frequence: 'chaque 10000 km',
  rappelAvant: '200 km',
  kmActuel: '0',
  prochaineMaintenance: '80000 km',
  isOverdue: false
},
{
  id: 2,
  type: "Bougies d'allumage",
  typePlanning: 'Par kilométrage',
  frequence: 'chaque 5000 km',
  rappelAvant: '150 km',
  kmActuel: '0',
  prochaineMaintenance: '45000 km',
  isOverdue: false
},
{
  id: 3,
  type: 'Pneus',
  typePlanning: 'Par kilométrage',
  frequence: 'chaque 5000 km',
  rappelAvant: '1500 km',
  kmActuel: '0',
  prochaineMaintenance: '80000 km',
  isOverdue: false
},
{
  id: 4,
  type: 'Patins de frein',
  typePlanning: 'Par kilométrage',
  frequence: 'chaque 15000 km',
  rappelAvant: '150 km',
  kmActuel: '0',
  prochaineMaintenance: '50000 km',
  isOverdue: false
},
{
  id: 5,
  type: 'Filtre climatiseur',
  typePlanning: 'Par kilométrage',
  frequence: 'chaque 0 km',
  rappelAvant: '555 km',
  kmActuel: '0',
  prochaineMaintenance: '24000000 km',
  isOverdue: false
},
{
  id: 6,
  type: 'Filtre à air',
  typePlanning: 'Par date',
  frequence: 'chaque 1 jour(s)',
  rappelAvant: '1 jour',
  kmActuel: '0',
  prochaineMaintenance: '04/09/2024 09:25:29',
  isOverdue: true
}];

const INITIAL_ENTRETIENS_ACHEVES: EntretienAcheve[] = [
{
  id: 1,
  date: '14 juin 2022',
  heuresAchevement: '3879',
  km: 10001.5,
  cout: 225.34,
  coutPaye: 225.34,
  datePaiement: '14 juin 2022',
  description: 'VIDANGE PERIODIQUE',
  reference: 'N°FA22007259',
  fournisseur: 'ITALCAR S.A'
},
{
  id: 2,
  date: '14 févr. 2023',
  heuresAchevement: '4200',
  km: 20012,
  cout: 357.59,
  coutPaye: 357.59,
  datePaiement: '14 mars 2023',
  description: 'VIDANGE PERIODIQUE',
  reference: 'N°FA23001826',
  fournisseur: 'ITALCAR S.A'
},
{
  id: 3,
  date: '26 mai 2023',
  heuresAchevement: '4500',
  km: 30080,
  cout: 771.29,
  coutPaye: 771.29,
  datePaiement: '26 mai 2023',
  description: 'VIDANGE PERIODIQUE',
  reference: 'N°FA23005960',
  fournisseur: 'ITALCAR S.A'
},
{
  id: 4,
  date: '13 sept. 2023',
  heuresAchevement: '4800',
  km: 40210,
  cout: 1,
  coutPaye: 274.435,
  datePaiement: '13 sept. 2023',
  description: 'vidange periodique',
  reference: 'FV+0323-001126',
  fournisseur: 'ITALCAR S .A'
},
{
  id: 5,
  date: '29 déc. 2023',
  heuresAchevement: '5100',
  km: 50197,
  cout: 1,
  coutPaye: 1,
  datePaiement: '29 déc. 2023',
  description: 'VIDANGE PERIODIQUE',
  reference: '',
  fournisseur: 'ITALCAR'
},
{
  id: 6,
  date: '23 avr. 2024',
  heuresAchevement: '5400',
  km: 60298,
  cout: 866.59,
  coutPaye: 866.59,
  datePaiement: '23 avr. 2024',
  description: 'VIDANGE PERIODIQUE',
  reference: 'N°FVS24-004406',
  fournisseur: 'ITALCAR'
},
{
  id: 7,
  date: '3 août 2024',
  heuresAchevement: '5700',
  km: 70218,
  cout: 269,
  coutPaye: 269,
  datePaiement: '1 août 2024',
  description: 'VIDANGE PERIODIQUE',
  reference: '',
  fournisseur: ''
}];

const INITIAL_REPARATIONS: Reparation[] = [
{
  id: 1,
  date: '24 juil. 2019',
  heuresAchevement: '2536',
  km: 77716,
  cout: 0.03,
  montantPaye: 0.03,
  datePaiement: '24 juil. 2019',
  description: '',
  reference: '',
  fournisseur: '',
  typeEntretien: "Bougies d'allumage"
},
{
  id: 2,
  date: '22 nov. 2019',
  heuresAchevement: '2800',
  km: 83393.9,
  cout: 0.01,
  montantPaye: 0.02,
  datePaiement: '22 nov. 2019',
  description: '',
  reference: '',
  fournisseur: '',
  typeEntretien: 'Filtre climatiseur'
},
{
  id: 3,
  date: '22 nov. 2019',
  heuresAchevement: '2800',
  km: 83393.9,
  cout: 0.01,
  montantPaye: 0.02,
  datePaiement: '22 nov. 2019',
  description: '',
  reference: '',
  fournisseur: '',
  typeEntretien: 'Filtre climatiseur'
},
{
  id: 4,
  date: '27 avr. 2020',
  heuresAchevement: '3100',
  km: 0.1,
  cout: 0.01,
  montantPaye: 0.01,
  datePaiement: '27 avr. 2020',
  description: '',
  reference: '',
  fournisseur: '',
  typeEntretien: 'Patins de frein'
},
{
  id: 5,
  date: '28 avr. 2020',
  heuresAchevement: '3100',
  km: 87261.7,
  cout: 0.01,
  montantPaye: 0.01,
  datePaiement: '28 avr. 2020',
  description: '',
  reference: '',
  fournisseur: '',
  typeEntretien: "Bougies d'allumage"
},
{
  id: 6,
  date: '28 avr. 2020',
  heuresAchevement: '3100',
  km: 87261.7,
  cout: 0.01,
  montantPaye: 0.01,
  datePaiement: '28 avr. 2020',
  description: '',
  reference: '',
  fournisseur: '',
  typeEntretien: 'Patins de frein'
}];

const ENTRETIEN_TYPES = [
'Vidange',
"Bougies d'allumage",
'Pneus',
'Patins de frein',
'Filtre climatiseur',
'Filtre à air'];

const PLANNING_TYPES = ['Par kilométrage', 'Par date', 'Par heures moteur'];
// --- Floating Input Helper ---
function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  suffix







}: {label: string;type?: string;value: string;onChange: (v: string) => void;required?: boolean;suffix?: string;}) {
  return (
    <div className="relative pt-2">
      <label className="absolute top-0 left-3 bg-white px-1 text-xs text-slate-500 z-10">
        {label}
        {required && '*'}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none bg-transparent relative z-0 ${suffix ? 'pr-12' : ''} ${type === 'date' ? 'pr-10' : ''}`} />
        
        {suffix &&
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
            {suffix}
          </span>
        }
      </div>
    </div>);

}
function FloatingSelect({
  label,
  value,
  onChange,
  options





}: {label: string;value: string;onChange: (v: string) => void;options: string[];}) {
  return (
    <div className="relative pt-2">
      <label className="absolute top-0 left-3 bg-white px-1 text-xs text-slate-500 z-10">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none bg-white relative z-0 appearance-none cursor-pointer">
        
        <option value="">-- Sélectionner --</option>
        {options.map((opt) =>
        <option key={opt} value={opt}>
            {opt}
          </option>
        )}
      </select>
      <ChevronDown className="absolute right-3 bottom-3 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>);

}
function FloatingTextarea({
  label,
  value,
  onChange




}: {label: string;value: string;onChange: (v: string) => void;}) {
  return (
    <div className="relative pt-2">
      <label className="absolute top-0 left-3 bg-white px-1 text-xs text-slate-500 z-10">
        {label}
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none bg-transparent relative z-0 resize-none" />
      
    </div>);

}
// --- Delete Confirm Modal ---
function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName





}: {isOpen: boolean;onClose: () => void;onConfirm: () => void;itemName: string;}) {
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          
          <ModalHeader title="Confirmer la suppression" onClose={onClose} />
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">
                  Êtes-vous sûr de vouloir supprimer{' '}
                  <span className="font-semibold text-slate-700">
                    {itemName}
                  </span>{' '}
                  ?
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                
                Annuler
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">
                
                Supprimer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Add/Edit Rappel Modal ---
function AddEditRappelModal({
  isOpen,
  onClose,
  onSave,
  editItem





}: {isOpen: boolean;onClose: () => void;onSave: (data: Omit<Rappel, 'id' | 'isOverdue'>) => void;editItem: Rappel | null;}) {
  const [type, setType] = useState('');
  const [typePlanning, setTypePlanning] = useState('Par kilométrage');
  const [kmActuel, setKmActuel] = useState('0');
  const [frequence, setFrequence] = useState('');
  const [prochaineMaintenance, setProchaineMaintenance] = useState('');
  const [rappelAvant, setRappelAvant] = useState('');
  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setTypePlanning(editItem.typePlanning || 'Par kilométrage');
      setKmActuel(editItem.kmActuel);
      setFrequence(
        editItem.frequence.replace(/^chaque\s*/, '').replace(/\s*km$/i, '')
      );
      setProchaineMaintenance(
        editItem.prochaineMaintenance.replace(/\s*km$/i, '')
      );
      setRappelAvant(
        editItem.rappelAvant.replace(/\s*km$/i, '').replace(/\s*jour$/i, '')
      );
    } else {
      setType('');
      setTypePlanning('Par kilométrage');
      setKmActuel('0');
      setFrequence('');
      setProchaineMaintenance('');
      setRappelAvant('');
    }
  }, [editItem, isOpen]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isKm = typePlanning === 'Par kilométrage';
    const suffix = isKm ? ' km' : ' jour';
    onSave({
      type,
      typePlanning,
      kmActuel,
      frequence: `chaque ${frequence}${suffix}`,
      prochaineMaintenance: `${prochaineMaintenance}${isKm ? ' km' : ''}`,
      rappelAvant: `${rappelAvant}${suffix}`
    });
  };
  const isKmPlanning = typePlanning === 'Par kilométrage';
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
          className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title={
              editItem ?
              'Modifier cet entretien' :
              "Ajouter un rappel d'entretien"
            }
            onClose={onClose}
            size="compact"
          />

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
            <div className="space-y-5">
              <FloatingSelect
                label="Type d'entretien*"
                value={type}
                onChange={setType}
                options={ENTRETIEN_TYPES} />
              
              <FloatingSelect
                label="Type de planning"
                value={typePlanning}
                onChange={setTypePlanning}
                options={PLANNING_TYPES} />
              
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Kilométrage actuel"
                  type="number"
                  value={kmActuel}
                  onChange={setKmActuel}
                  suffix="Km" />
                
                <FloatingInput
                  label="Fréquence chaque"
                  type="number"
                  value={frequence}
                  onChange={setFrequence}
                  suffix={isKmPlanning ? 'Km' : 'Jour(s)'} />
                
              </div>
              <FloatingInput
                label="Prochain entretien*"
                type="number"
                value={prochaineMaintenance}
                onChange={setProchaineMaintenance}
                required
                suffix={isKmPlanning ? 'Km' : ''} />
              
              <FloatingInput
                label="Me rappeler avant*"
                type="number"
                value={rappelAvant}
                onChange={setRappelAvant}
                required
                suffix={isKmPlanning ? 'Km' : 'Jour(s)'} />
              
            </div>
          </form>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <button
              onClick={handleSubmit as any}
              className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium rounded-md transition-colors shadow-sm">
              
              Enregistrer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Add/Edit Reparation Modal ---
function AddEditReparationModal({
  isOpen,
  onClose,
  onSave,
  editItem





}: {isOpen: boolean;onClose: () => void;onSave: (data: Omit<Reparation, 'id'>) => void;editItem: Reparation | null;}) {
  const [typeEntretien, setTypeEntretien] = useState('');
  const [date, setDate] = useState('');
  const [heuresAchevement, setHeuresAchevement] = useState('0');
  const [km, setKm] = useState('0');
  const [cout, setCout] = useState('0');
  const [montantPaye, setMontantPaye] = useState('0');
  const [datePaiement, setDatePaiement] = useState('');
  const [reference, setReference] = useState('');
  const [fournisseur, setFournisseur] = useState('');
  const [description, setDescription] = useState('');
  useEffect(() => {
    if (editItem) {
      setTypeEntretien(editItem.typeEntretien);
      setDate(editItem.date);
      setHeuresAchevement(editItem.heuresAchevement || '0');
      setKm(String(editItem.km));
      setCout(String(editItem.cout));
      setMontantPaye(String(editItem.montantPaye));
      setDatePaiement(editItem.datePaiement);
      setReference(editItem.reference);
      setFournisseur(editItem.fournisseur);
      setDescription(editItem.description);
    } else {
      setTypeEntretien('');
      setDate(new Date().toISOString().split('T')[0]);
      setHeuresAchevement('0');
      setKm('0');
      setCout('0');
      setMontantPaye('0');
      setDatePaiement(new Date().toISOString().split('T')[0]);
      setReference('');
      setFournisseur('');
      setDescription('');
    }
  }, [editItem, isOpen]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      typeEntretien,
      date,
      heuresAchevement,
      km: parseFloat(km),
      cout: parseFloat(cout),
      montantPaye: parseFloat(montantPaye),
      datePaiement,
      reference,
      fournisseur,
      description
    });
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
          className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title={editItem ? 'Modifier la réparation' : 'Ajouter'}
            onClose={onClose}
            size="compact"
          />

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
            <div className="space-y-5">
              <FloatingInput
                label="Type d'entretien"
                value={typeEntretien}
                onChange={setTypeEntretien} />
              
              <FloatingInput
                label="Date d'achèvement"
                type="date"
                value={date}
                onChange={setDate} />
              
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Heures d'achèvement"
                  type="number"
                  value={heuresAchevement}
                  onChange={setHeuresAchevement} />
                
                <FloatingInput
                  label="Kilométrage d'achèvement"
                  type="number"
                  value={km}
                  onChange={setKm} />
                
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Coût"
                  type="number"
                  value={cout}
                  onChange={setCout} />
                
                <FloatingInput
                  label="Coût payé"
                  type="number"
                  value={montantPaye}
                  onChange={setMontantPaye} />
                
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Payment date"
                  type="date"
                  value={datePaiement}
                  onChange={setDatePaiement} />
                
                <FloatingInput
                  label="Référence de facture"
                  value={reference}
                  onChange={setReference} />
                
              </div>
              <FloatingInput
                label="Fournisseur"
                value={fournisseur}
                onChange={setFournisseur} />
              
              <FloatingTextarea
                label="Description"
                value={description}
                onChange={setDescription} />
              
            </div>
          </form>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <button
              onClick={handleSubmit as any}
              className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium rounded-md transition-colors shadow-sm">
              
              Enregistrer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Add/Edit Entretien Achevé Modal ---
function AddEditEntretienAcheveModal({
  isOpen,
  onClose,
  onSave,
  editItem





}: {isOpen: boolean;onClose: () => void;onSave: (data: Omit<EntretienAcheve, 'id'>) => void;editItem: EntretienAcheve | null;}) {
  const [date, setDate] = useState('');
  const [heuresAchevement, setHeuresAchevement] = useState('0');
  const [km, setKm] = useState('0');
  const [cout, setCout] = useState('0');
  const [coutPaye, setCoutPaye] = useState('0');
  const [datePaiement, setDatePaiement] = useState('');
  const [reference, setReference] = useState('');
  const [fournisseur, setFournisseur] = useState('');
  const [description, setDescription] = useState('');
  useEffect(() => {
    if (editItem) {
      setDate(editItem.date);
      setHeuresAchevement(editItem.heuresAchevement || '0');
      setKm(String(editItem.km));
      setCout(String(editItem.cout));
      setCoutPaye(String(editItem.coutPaye));
      setDatePaiement(editItem.datePaiement);
      setReference(editItem.reference);
      setFournisseur(editItem.fournisseur);
      setDescription(editItem.description);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setHeuresAchevement('0');
      setKm('0');
      setCout('0');
      setCoutPaye('0');
      setDatePaiement(new Date().toISOString().split('T')[0]);
      setReference('');
      setFournisseur('');
      setDescription('');
    }
  }, [editItem, isOpen]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date,
      heuresAchevement,
      km: parseFloat(km),
      cout: parseFloat(cout),
      coutPaye: parseFloat(coutPaye),
      datePaiement,
      description,
      reference,
      fournisseur
    });
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
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
          className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title={editItem ? "Modifier l'entretien achevé" : 'Ajouter'}
            onClose={onClose}
            size="compact"
          />

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
            <div className="space-y-5">
              <FloatingInput
                label="Date d'achèvement"
                type="date"
                value={date}
                onChange={setDate} />
              
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Heures d'achèvement"
                  type="number"
                  value={heuresAchevement}
                  onChange={setHeuresAchevement} />
                
                <FloatingInput
                  label="Kilométrage d'achèvement"
                  type="number"
                  value={km}
                  onChange={setKm} />
                
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Coût"
                  type="number"
                  value={cout}
                  onChange={setCout} />
                
                <FloatingInput
                  label="Coût payé"
                  type="number"
                  value={coutPaye}
                  onChange={setCoutPaye} />
                
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Payment date"
                  type="date"
                  value={datePaiement}
                  onChange={setDatePaiement} />
                
                <FloatingInput
                  label="Référence de facture"
                  value={reference}
                  onChange={setReference} />
                
              </div>
              <FloatingInput
                label="Fournisseur"
                value={fournisseur}
                onChange={setFournisseur} />
              
              <FloatingTextarea
                label="Description"
                value={description}
                onChange={setDescription} />
              
            </div>
          </form>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <button
              onClick={handleSubmit as any}
              className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium rounded-md transition-colors shadow-sm">
              
              Enregistrer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Entretiens Achevés Modal ---
function EntretiensAchevesModal({
  isOpen,
  onClose,
  vehicleName,
  entretiensAcheves,
  onAdd,
  onEdit,
  onDelete








}: {isOpen: boolean;onClose: () => void;vehicleName: string;entretiensAcheves: EntretienAcheve[];onAdd: () => void;onEdit: (item: EntretienAcheve) => void;onDelete: (item: EntretienAcheve) => void;}) {
  if (!isOpen) return null;
  const totalCost = entretiensAcheves.reduce((sum, item) => sum + item.cout, 0);
  const totalPaid = entretiensAcheves.reduce(
    (sum, item) => sum + item.coutPaye,
    0
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
            title="Les entretiens achevés"
            subtitle={vehicleName}
            onClose={onClose}
            actions={
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-primary-foreground rounded-lg text-sm font-semibold transition-colors">
                
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            }
          />

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4 font-semibold">Date d'achèvement</th>
                  <th className="px-4 py-4 font-semibold">
                    Kilométrage d'achèvemnt
                  </th>
                  <th className="px-4 py-4 font-semibold">Coût</th>
                  <th className="px-4 py-4 font-semibold">Coût payé</th>
                  <th className="px-4 py-4 font-semibold">Date de paiement</th>
                  <th className="px-4 py-4 font-semibold">Description</th>
                  <th className="px-4 py-4 font-semibold">
                    Référence de facture
                  </th>
                  <th className="px-4 py-4 font-semibold">Fournisseur</th>
                  <th className="px-4 py-4 font-semibold text-right">
                    actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entretiensAcheves.length === 0 ?
                <tr>
                    <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-slate-500">
                    
                      Aucun entretien achevé trouvé.
                    </td>
                  </tr> :

                entretiensAcheves.map((item) =>
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 transition-colors">
                  
                      <td className="px-4 py-4 text-slate-700">{item.date}</td>
                      <td className="px-4 py-4 text-slate-700">{item.km}</td>
                      <td className="px-4 py-4 text-slate-700">{item.cout}</td>
                      <td className="px-4 py-4 text-slate-700">
                        {item.coutPaye}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {item.datePaiement}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {item.description}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {item.reference}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {item.fournisseur}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Modifier">
                        
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer">
                        
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                )
                }
              </tbody>
              {entretiensAcheves.length > 0 &&
              <tfoot className="border-t border-slate-200 bg-white sticky bottom-0 z-10">
                  <tr>
                    <td
                    colSpan={3}
                    className="px-4 py-4 text-sm font-medium text-red-500 text-right">
                    
                      Total Cost:{' '}
                      {totalCost.toLocaleString('fr-FR', {
                      minimumFractionDigits: 3
                    })}{' '}
                      د.ت
                    </td>
                    <td
                    colSpan={6}
                    className="px-4 py-4 text-sm font-medium text-green-500">
                    
                      {totalPaid.toLocaleString('fr-FR', {
                      minimumFractionDigits: 3
                    })}{' '}
                      د.ت
                    </td>
                  </tr>
                </tfoot>
              }
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Main Component ---
export function GestionMaintenance() {
  const [selectedVehicle, setSelectedVehicle] = useState(
    MOCK_VEHICLES[0].matricule
  );
  const [activeTab, setActiveTab] = useState<'rappel' | 'reparations'>('rappel');
  // Data states (mutable)
  const [rappels, setRappels] = useState<Rappel[]>(INITIAL_RAPPELS);
  const [reparations, setReparations] =
  useState<Reparation[]>(INITIAL_REPARATIONS);
  const [entretiensAcheves, setEntretiensAcheves] = useState<EntretienAcheve[]>(
    INITIAL_ENTRETIENS_ACHEVES
  );
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Filters for reparations
  const [dateDebut, setDateDebut] = useState('2016-01-01');
  const [dateFin, setDateFin] = useState('2026-03-23');
  // Modal states - Rappel
  const [showAddRappelModal, setShowAddRappelModal] = useState(false);
  const [editingRappel, setEditingRappel] = useState<Rappel | null>(null);
  // Modal states - Reparation
  const [showAddReparationModal, setShowAddReparationModal] = useState(false);
  const [editingReparation, setEditingReparation] = useState<Reparation | null>(
    null
  );
  // Modal states - Entretiens Achevés
  const [showAchevesModal, setShowAchevesModal] = useState(false);
  const [showAddEntretienModal, setShowAddEntretienModal] = useState(false);
  const [editingEntretien, setEditingEntretien] =
  useState<EntretienAcheve | null>(null);
  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'rappel' | 'reparation' | 'entretien';
    id: number;
    name: string;
  }>({
    isOpen: false,
    type: 'rappel',
    id: 0,
    name: ''
  });
  // --- Handlers: Rappels ---
  const handleSaveRappel = (data: Omit<Rappel, 'id' | 'isOverdue'>) => {
    if (editingRappel) {
      setRappels(
        rappels.map((r) =>
        r.id === editingRappel.id ?
        {
          ...r,
          ...data
        } :
        r
        )
      );
      setEditingRappel(null);
    } else {
      const newId = Math.max(0, ...rappels.map((r) => r.id)) + 1;
      setRappels([
      ...rappels,
      {
        ...data,
        id: newId,
        isOverdue: false
      }]
      );
      setShowAddRappelModal(false);
    }
  };
  const handleDeleteRappel = (id: number) => {
    setRappels(rappels.filter((r) => r.id !== id));
  };
  // --- Handlers: Reparations ---
  const handleSaveReparation = (data: Omit<Reparation, 'id'>) => {
    if (editingReparation) {
      setReparations(
        reparations.map((r) =>
        r.id === editingReparation.id ?
        {
          ...r,
          ...data
        } :
        r
        )
      );
      setEditingReparation(null);
    } else {
      const newId = Math.max(0, ...reparations.map((r) => r.id)) + 1;
      setReparations([
      ...reparations,
      {
        ...data,
        id: newId
      }]
      );
      setShowAddReparationModal(false);
    }
  };
  const handleDeleteReparation = (id: number) => {
    setReparations(reparations.filter((r) => r.id !== id));
  };
  // --- Handlers: Entretiens Achevés ---
  const handleSaveEntretien = (data: Omit<EntretienAcheve, 'id'>) => {
    if (editingEntretien) {
      setEntretiensAcheves(
        entretiensAcheves.map((e) =>
        e.id === editingEntretien.id ?
        {
          ...e,
          ...data
        } :
        e
        )
      );
      setEditingEntretien(null);
    } else {
      const newId = Math.max(0, ...entretiensAcheves.map((e) => e.id)) + 1;
      setEntretiensAcheves([
      ...entretiensAcheves,
      {
        ...data,
        id: newId
      }]
      );
      setShowAddEntretienModal(false);
    }
  };
  const handleDeleteEntretien = (id: number) => {
    setEntretiensAcheves(entretiensAcheves.filter((e) => e.id !== id));
  };
  // --- Delete confirm handler ---
  const handleConfirmDelete = () => {
    if (deleteConfirm.type === 'rappel') handleDeleteRappel(deleteConfirm.id);else
    if (deleteConfirm.type === 'reparation')
    handleDeleteReparation(deleteConfirm.id);else
    if (deleteConfirm.type === 'entretien')
    handleDeleteEntretien(deleteConfirm.id);
  };
  // Pagination
  const currentData = activeTab === 'rappel' ? rappels : reparations;
  const totalItems = currentData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(startIndex, startIndex + itemsPerPage);
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-slate-200 pt-4 px-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion de Maintenance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez les rappels d'entretien et les réparations de vos véhicules
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Add Button */}
            <button
              onClick={() => {
                if (activeTab === 'rappel') setShowAddRappelModal(true);else
                setShowAddReparationModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
              
              <Plus className="w-4 h-4" />
              {activeTab === 'rappel' ?
              'Ajouter un rappel' :
              'Ajouter une réparation'}
            </button>

            {/* Vehicle Selector */}
            <div className="relative w-72">
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer">
                
                {MOCK_VEHICLES.map((v) =>
                <option key={v.id} value={v.matricule}>
                    {v.matricule}
                  </option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <button
            onClick={() => {
              setActiveTab('rappel');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'rappel' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            
            Rappel d'entretien
          </button>
          <button
            onClick={() => {
              setActiveTab('reparations');
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reparations' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            
            Gestion des réparations
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          {activeTab === 'reparations' &&
          <div className="p-4 border-b border-slate-200 flex items-end gap-4 bg-white">
              <div className="relative pt-2">
                <label className="absolute top-0 left-3 bg-white px-1 text-xs text-slate-500 z-10">
                  Date de début *
                </label>
                <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-48 border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none" />
              
              </div>
              <div className="relative pt-2">
                <label className="absolute top-0 left-3 bg-white px-1 text-xs text-slate-500 z-10">
                  Date de fin *
                </label>
                <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-48 border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none" />
              
              </div>
              <button className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-lg text-sm transition-colors shadow-sm">
                Appliquer
              </button>
            </div>
          }

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                {activeTab === 'rappel' ?
                <tr>
                    <th className="px-6 py-4 font-semibold">
                      Date/Km/HeuresMoteur
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Type d'entretien
                    </th>
                    <th className="px-6 py-4 font-semibold">Fréquence</th>
                    <th className="px-6 py-4 font-semibold">
                      Me rappeler avant
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Kilométrage actuel
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Prochaine maintenance
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">
                      actions ↓
                    </th>
                  </tr> :

                <tr>
                    <th className="px-6 py-4 font-semibold">
                      Date d'achèvement
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      Kilométrage d'achèvemnt
                    </th>
                    <th className="px-6 py-4 font-semibold">Coût</th>
                    <th className="px-6 py-4 font-semibold">Montant payé</th>
                    <th className="px-6 py-4 font-semibold">
                      Date de paiement
                    </th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">
                      Référence de facture
                    </th>
                    <th className="px-6 py-4 font-semibold">Fournisseur</th>
                    <th className="px-6 py-4 font-semibold">
                      Type d'entretien
                    </th>
                    <th className="px-6 py-4 font-semibold text-right">
                      actions
                    </th>
                  </tr>
                }
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'rappel' ?
                (paginatedData as Rappel[]).map((rappel) =>
                <tr
                  key={rappel.id}
                  className={`transition-colors ${rappel.isOverdue ? 'bg-red-50 hover:bg-red-100/80' : 'hover:bg-slate-50'}`}>
                  
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center w-8 h-8">
                            <Timer
                        className={`w-5 h-5 ${rappel.isOverdue ? 'text-red-500' : 'text-slate-700'}`} />
                      
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {rappel.isOverdue &&
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">
                                !
                              </div>
                      }
                            <span
                        className={
                        rappel.isOverdue ?
                        'text-red-900 font-medium' :
                        'text-slate-700'
                        }>
                        
                              {rappel.type}
                            </span>
                          </div>
                        </td>
                        <td
                    className={`px-6 py-4 ${rappel.isOverdue ? 'text-red-900' : 'text-slate-700'}`}>
                    
                          {rappel.frequence}
                        </td>
                        <td
                    className={`px-6 py-4 ${rappel.isOverdue ? 'text-red-900' : 'text-slate-700'}`}>
                    
                          {rappel.rappelAvant}
                        </td>
                        <td
                    className={`px-6 py-4 ${rappel.isOverdue ? 'text-red-900' : 'text-slate-700'}`}>
                    
                          {rappel.kmActuel}
                        </td>
                        <td
                    className={`px-6 py-4 ${rappel.isOverdue ? 'text-red-900' : 'text-slate-700'}`}>
                    
                          {rappel.prochaineMaintenance}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                        onClick={() => setEditingRappel(rappel)}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                        title="Modifier">
                        
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                        onClick={() => setShowAchevesModal(true)}
                        className="p-1.5 text-[#0ea5e9] hover:bg-sky-100 rounded transition-colors"
                        title="Visualiser les entretiens achevés">
                        
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                        onClick={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          type: 'rappel',
                          id: rappel.id,
                          name: rappel.type
                        })
                        }
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                        title="Supprimer">
                        
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                ) :
                (paginatedData as Reparation[]).map((rep) =>
                <tr
                  key={rep.id}
                  className="hover:bg-slate-50 transition-colors">
                  
                        <td className="px-6 py-4 text-slate-700">{rep.date}</td>
                        <td className="px-6 py-4 text-slate-700">{rep.km}</td>
                        <td className="px-6 py-4 text-slate-700">{rep.cout}</td>
                        <td className="px-6 py-4 text-slate-700">
                          {rep.montantPaye}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {rep.datePaiement}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {rep.description}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {rep.reference}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {rep.fournisseur}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {rep.typeEntretien}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                        onClick={() => setEditingReparation(rep)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Modifier">
                        
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                        onClick={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          type: 'reparation',
                          id: rep.id,
                          name: `${rep.typeEntretien} - ${rep.date}`
                        })
                        }
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer">
                        
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                )}
                {paginatedData.length === 0 &&
                <tr>
                    <td
                    colSpan={10}
                    className="px-6 py-12 text-center text-slate-500">
                    
                      Aucun élément trouvé.
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
            onItemsPerPageChange={setItemsPerPage} />
          
        </div>
      </div>

      {/* --- All Modals --- */}

      {/* Entretiens Achevés Modal */}
      <EntretiensAchevesModal
        isOpen={showAchevesModal}
        onClose={() => setShowAchevesModal(false)}
        vehicleName={selectedVehicle}
        entretiensAcheves={entretiensAcheves}
        onAdd={() => setShowAddEntretienModal(true)}
        onEdit={(item) => setEditingEntretien(item)}
        onDelete={(item) =>
        setDeleteConfirm({
          isOpen: true,
          type: 'entretien',
          id: item.id,
          name: `${item.description} - ${item.date}`
        })
        } />
      

      {/* Add/Edit Rappel Modal */}
      <AddEditRappelModal
        isOpen={showAddRappelModal || !!editingRappel}
        onClose={() => {
          setShowAddRappelModal(false);
          setEditingRappel(null);
        }}
        onSave={(data) => {
          handleSaveRappel(data);
          setShowAddRappelModal(false);
        }}
        editItem={editingRappel} />
      

      {/* Add/Edit Reparation Modal */}
      <AddEditReparationModal
        isOpen={showAddReparationModal || !!editingReparation}
        onClose={() => {
          setShowAddReparationModal(false);
          setEditingReparation(null);
        }}
        onSave={(data) => {
          handleSaveReparation(data);
          setShowAddReparationModal(false);
        }}
        editItem={editingReparation} />
      

      {/* Add/Edit Entretien Achevé Modal */}
      <AddEditEntretienAcheveModal
        isOpen={showAddEntretienModal || !!editingEntretien}
        onClose={() => {
          setShowAddEntretienModal(false);
          setEditingEntretien(null);
        }}
        onSave={(data) => {
          handleSaveEntretien(data);
          setShowAddEntretienModal(false);
        }}
        editItem={editingEntretien} />
      

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
        setDeleteConfirm({
          ...deleteConfirm,
          isOpen: false
        })
        }
        onConfirm={handleConfirmDelete}
        itemName={deleteConfirm.name} />
      
    </div>);

}