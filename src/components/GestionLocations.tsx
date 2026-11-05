import React, { useEffect, useMemo, useState, Component } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Calendar,
  ChevronDown,
  X,
  FileText,
  CreditCard,
  Car,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Info,
  DollarSign,
  List,
  RefreshCw,
  Save,
  Bookmark,
  ChevronLeft,
  ChevronRight } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableFooter } from './TableFooter';
import { useFilterManager } from '../hooks/useFilterManager';
import { FilterManager } from './FilterManager';
import { SaveFilterModal } from './SaveFilterModal';
import { ModalHeader } from '@/components/ui/modal-header';
// --- Types ---
type ContractType = 'Location' | 'Emprunt';
interface Contract {
  id: string;
  numeroContrat: string;
  typeContrat: ContractType;
  dateDebut: string;
  dateFin: string;
  premierChauffeur: string;
  deuxiemeChauffeur: string;
  coutActivation: number;
  cout: number;
  niveauCarburant: string;
  meRappelerAvantJours: number;
  paiementDe: string;
  paiementChaque: string;
  aPartirDe: string;
  mouvementVehicule: 'Entrée' | 'Sortie';
  dateMouvement: string;
  kilometrage: number;
  vehicule: string;
}
interface Payment {
  id: string;
  contractId: string;
  referenceFacture: string;
  factureDe: string;
  jusqua: string;
  cout: number;
  montantPaye: number;
  datePaiement: string;
  dateFacture: string;
  kilometrage: number;
}
type ToastType = 'success' | 'error' | 'info';
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
// --- Mock Data ---
const MOCK_VEHICLES = [
'8125 TU 226',
'8127 TU 226',
'8126 TU 226',
'Tepee FM4200',
'8312 TU 193'];

const INITIAL_CONTRACTS: Contract[] = [
{
  id: '1',
  numeroContrat: 'LOC-2024-001',
  typeContrat: 'Location',
  dateDebut: '2024-01-01',
  dateFin: '2024-12-31',
  premierChauffeur: 'Jean Dupont',
  deuxiemeChauffeur: '-',
  coutActivation: 150,
  cout: 1200,
  niveauCarburant: '100%',
  meRappelerAvantJours: 15,
  paiementDe: 'Mensuel',
  paiementChaque: '1',
  aPartirDe: '2024-01-01',
  mouvementVehicule: 'Sortie',
  dateMouvement: '2024-01-01',
  kilometrage: 45000,
  vehicule: '8125 TU 226'
},
{
  id: '2',
  numeroContrat: 'EMP-2024-001',
  typeContrat: 'Emprunt',
  dateDebut: '2024-03-15',
  dateFin: '2024-04-15',
  premierChauffeur: 'Marie Martin',
  deuxiemeChauffeur: 'Pierre Durand',
  coutActivation: 0,
  cout: 0,
  niveauCarburant: '50%',
  meRappelerAvantJours: 5,
  paiementDe: '-',
  paiementChaque: '-',
  aPartirDe: '-',
  mouvementVehicule: 'Sortie',
  dateMouvement: '2024-03-15',
  kilometrage: 67000,
  vehicule: '8127 TU 226'
},
{
  id: '3',
  numeroContrat: 'LOC-2024-002',
  typeContrat: 'Location',
  dateDebut: '2024-02-01',
  dateFin: '2025-01-31',
  premierChauffeur: 'Sophie Bernard',
  deuxiemeChauffeur: '-',
  coutActivation: 200,
  cout: 1500,
  niveauCarburant: '75%',
  meRappelerAvantJours: 30,
  paiementDe: 'Trimestriel',
  paiementChaque: '3',
  aPartirDe: '2024-02-01',
  mouvementVehicule: 'Sortie',
  dateMouvement: '2024-02-01',
  kilometrage: 12000,
  vehicule: '8125 TU 226'
}];

const INITIAL_PAYMENTS: Payment[] = [
{
  id: '1',
  contractId: '1',
  referenceFacture: 'FAC-2024-001',
  factureDe: '2024-01-01',
  jusqua: '2024-01-31',
  cout: 1200,
  montantPaye: 1200,
  datePaiement: '2024-01-05',
  dateFacture: '2024-01-01',
  kilometrage: 45500
},
{
  id: '2',
  contractId: '1',
  referenceFacture: 'FAC-2024-045',
  factureDe: '2024-02-01',
  jusqua: '2024-02-29',
  cout: 1200,
  montantPaye: 1200,
  datePaiement: '2024-02-03',
  dateFacture: '2024-02-01',
  kilometrage: 48000
}];

// --- Helper Components ---
function FloatingLabelInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  className = '',
  disabled = false,
  max









}: {label: string;value: string | number;onChange: (v: string) => void;type?: string;required?: boolean;className?: string;disabled?: boolean;max?: number;}) {
  return (
    <div className={`relative ${className}`}>
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        max={max}
        className={`w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 bg-white ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
        required={required} />
      
    </div>);

}
function ToastContainer({
  toasts,
  removeToast



}: {toasts: ToastMessage[];removeToast: (id: string) => void;}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) =>
        <motion.div
          key={toast.id}
          initial={{
            opacity: 0,
            y: -20,
            scale: 0.9
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            transition: {
              duration: 0.2
            }
          }}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          
            {toast.type === 'success' &&
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          }
            {toast.type === 'error' &&
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          }
            {toast.type === 'info' &&
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
          }
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-black/5 rounded-md transition-colors">
            
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>);

}
// --- Modals ---
function AddEditContractModal({
  isOpen,
  onClose,
  onSave,
  initialData = null





}: {isOpen: boolean;onClose: () => void;onSave: (data: any) => void;initialData?: Contract | null;}) {
  const isEdit = !!initialData;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  // Step 1
  const [numeroContrat, setNumeroContrat] = useState('');
  const [typeContrat, setTypeContrat] = useState<ContractType>('Location');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [premierChauffeur, setPremierChauffeur] = useState('');
  const [deuxiemeChauffeur, setDeuxiemeChauffeur] = useState('');
  const [vehicule, setVehicule] = useState('');
  // Step 2
  const [coutActivation, setCoutActivation] = useState('');
  const [cout, setCout] = useState('');
  const [niveauCarburant, setNiveauCarburant] = useState('');
  const [meRappelerAvantJours, setMeRappelerAvantJours] = useState('');
  const [paiementDe, setPaiementDe] = useState('');
  const [paiementChaque, setPaiementChaque] = useState('');
  const [aPartirDe, setAPartirDe] = useState('');
  // Step 3
  const [mouvementVehicule, setMouvementVehicule] = useState<
    'Entrée' | 'Sortie'>(
    'Sortie');
  const [dateMouvement, setDateMouvement] = useState('');
  const [kilometrage, setKilometrage] = useState('');
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNumeroContrat(initialData.numeroContrat);
        setTypeContrat(initialData.typeContrat);
        setDateDebut(initialData.dateDebut);
        setDateFin(initialData.dateFin);
        setPremierChauffeur(initialData.premierChauffeur);
        setDeuxiemeChauffeur(initialData.deuxiemeChauffeur);
        setVehicule(initialData.vehicule);
        setCoutActivation(initialData.coutActivation.toString());
        setCout(initialData.cout.toString());
        setNiveauCarburant(initialData.niveauCarburant);
        setMeRappelerAvantJours(initialData.meRappelerAvantJours.toString());
        setPaiementDe(initialData.paiementDe);
        setPaiementChaque(initialData.paiementChaque);
        setAPartirDe(initialData.aPartirDe);
        setMouvementVehicule(initialData.mouvementVehicule);
        setDateMouvement(initialData.dateMouvement);
        setKilometrage(initialData.kilometrage.toString());
        setStep(1);
      } else {
        setNumeroContrat('');
        setTypeContrat('Location');
        setDateDebut('');
        setDateFin('');
        setPremierChauffeur('');
        setDeuxiemeChauffeur('');
        setVehicule('');
        setCoutActivation('');
        setCout('');
        setNiveauCarburant('');
        setMeRappelerAvantJours('');
        setPaiementDe('');
        setPaiementChaque('');
        setAPartirDe('');
        setMouvementVehicule('Sortie');
        setDateMouvement('');
        setKilometrage('');
        setStep(1);
      }
    }
  }, [isOpen, initialData]);
  if (!isOpen) return null;
  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1 as 1 | 2 | 3);
  };
  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1 as 1 | 2 | 3);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newContract: Partial<Contract> = {
      numeroContrat,
      typeContrat,
      dateDebut,
      dateFin,
      premierChauffeur,
      deuxiemeChauffeur,
      vehicule,
      coutActivation: parseFloat(coutActivation) || 0,
      cout: parseFloat(cout) || 0,
      niveauCarburant,
      meRappelerAvantJours: parseInt(meRappelerAvantJours) || 0,
      paiementDe,
      paiementChaque,
      aPartirDe,
      mouvementVehicule,
      dateMouvement,
      kilometrage: parseInt(kilometrage) || 0
    };
    if (isEdit && initialData) {
      newContract.id = initialData.id;
    } else {
      newContract.id = `new-${Date.now()}`;
    }
    onSave(newContract);
    onClose();
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title={isEdit ? 'Modifier le contrat' : 'Ajouter un contrat'}
            onClose={onClose}
          />

          {/* Stepper */}
          <div className="bg-white px-6 py-5 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between relative max-w-sm mx-auto">
              <div className="absolute left-0 top-4 w-full h-[2px] bg-slate-200 -z-10" />
              <div
                className="absolute left-0 top-4 h-[2px] bg-[#0ea5e9] transition-all duration-300 -z-10"
                style={{
                  width: `${(step - 1) / 2 * 100}%`
                }} />
              

              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 1 ? 'bg-[#0ea5e9] text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                  
                  1
                </div>
                <span
                  className={`text-xs font-medium ${step >= 1 ? 'text-[#0ea5e9]' : 'text-slate-400'}`}>
                  
                  Informations
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 2 ? 'bg-[#0ea5e9] text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                  
                  2
                </div>
                <span
                  className={`text-xs font-medium ${step >= 2 ? 'text-[#0ea5e9]' : 'text-slate-400'}`}>
                  
                  Paiements
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= 3 ? 'bg-[#0ea5e9] text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                  
                  3
                </div>
                <span
                  className={`text-xs font-medium ${step >= 3 ? 'text-[#0ea5e9]' : 'text-slate-400'}`}>
                  
                  Suivi véhicule
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto flex-1">
            <form
              id="add-contract-form"
              onSubmit={
              step === 3 ?
              handleSubmit :
              (e) => {
                e.preventDefault();
                handleNext();
              }
              }
              className="space-y-6">
              
              {step === 1 &&
              <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#0ea5e9]" />
                    Informations sur le contrat
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput
                    label="N° Contract"
                    value={numeroContrat}
                    onChange={setNumeroContrat}
                    required />
                  
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        Type de contrat *
                      </label>
                      <select
                      value={typeContrat}
                      onChange={(e) =>
                      setTypeContrat(e.target.value as ContractType)
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700"
                      required>
                      
                        <option value="Location">Location</option>
                        <option value="Emprunt">Emprunt</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        Date début du contrat *
                      </label>
                      <input
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 bg-white" />
                    
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        Date fin du contrat *
                      </label>
                      <input
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 bg-white" />
                    
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput
                    label="Premier chauffeur"
                    value={premierChauffeur}
                    onChange={setPremierChauffeur}
                    required />
                  
                    <FloatingLabelInput
                    label="Deuxième chauffeur"
                    value={deuxiemeChauffeur}
                    onChange={setDeuxiemeChauffeur}
                    required />
                  
                  </div>

                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                      Véhicule *
                    </label>
                    <select
                    value={vehicule}
                    onChange={(e) => setVehicule(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700"
                    required>
                    
                      <option value="">Sélectionner un véhicule</option>
                      {MOCK_VEHICLES.map((v) =>
                    <option key={v} value={v}>
                          {v}
                        </option>
                    )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              }

              {step === 2 &&
              <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#0ea5e9]" />
                    Paiements
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput
                    label="Coût d'activation"
                    type="number"
                    value={coutActivation}
                    onChange={setCoutActivation}
                    required />
                  
                    <FloatingLabelInput
                    label="Coût"
                    type="number"
                    value={cout}
                    onChange={setCout}
                    required />
                  
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FloatingLabelInput
                    label="Niveau de carburant"
                    value={niveauCarburant}
                    onChange={setNiveauCarburant}
                    required />
                  
                    <FloatingLabelInput
                    label="Me rappeler avant jours"
                    type="number"
                    value={meRappelerAvantJours}
                    onChange={setMeRappelerAvantJours}
                    required />
                  
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FloatingLabelInput
                    label="Payment de"
                    value={paiementDe}
                    onChange={setPaiementDe}
                    required />
                  
                    <FloatingLabelInput
                    label="Payement chaque"
                    value={paiementChaque}
                    onChange={setPaiementChaque}
                    required />
                  
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        A partir de *
                      </label>
                      <input
                      type="date"
                      value={aPartirDe}
                      onChange={(e) => setAPartirDe(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 bg-white" />
                    
                    </div>
                  </div>
                </div>
              }

              {step === 3 &&
              <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Car className="w-5 h-5 text-[#0ea5e9]" />
                    Suivi du véhicule
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        Mouvement du véhicule
                      </label>
                      <select
                      value={mouvementVehicule}
                      onChange={(e) =>
                      setMouvementVehicule(
                        e.target.value as 'Entrée' | 'Sortie'
                      )
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                      
                        <option value="Entrée">Entrée</option>
                        <option value="Sortie">Sortie</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        Date du Mouvement *
                      </label>
                      <input
                      type="date"
                      value={dateMouvement}
                      onChange={(e) => setDateMouvement(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 bg-white" />
                    
                    </div>
                  </div>

                  <FloatingLabelInput
                  label="Kilométrage"
                  type="number"
                  value={kilometrage}
                  onChange={setKilometrage} />
                
                </div>
              }
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            {step > 1 ?
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
              
                Retour
              </button> :

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
              
                Annuler
              </button>
            }

            {step < 3 ?
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
                Suivant
                <ArrowRight className="w-4 h-4" />
              </button> :

            <button
              type="submit"
              form="add-contract-form"
              className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
                <CheckCircle className="w-4 h-4" />
                {isEdit ? 'Enregistrer les modifications' : 'Créer le contrat'}
              </button>
            }
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function AddPaymentModal({
  isOpen,
  onClose,
  onSave,
  contractId





}: {isOpen: boolean;onClose: () => void;onSave: (data: any) => void;contractId: string;}) {
  const [referenceFacture, setReferenceFacture] = useState('');
  const [factureDe, setFactureDe] = useState('');
  const [jusqua, setJusqua] = useState('');
  const [cout, setCout] = useState('');
  const [montantPaye, setMontantPaye] = useState('');
  const [datePaiement, setDatePaiement] = useState('');
  const [dateFacture, setDateFacture] = useState('');
  const [kilometrage, setKilometrage] = useState('');
  useEffect(() => {
    if (isOpen) {
      setReferenceFacture('');
      setFactureDe('');
      setJusqua('');
      setCout('');
      setMontantPaye('');
      setDatePaiement('');
      setDateFacture('');
      setKilometrage('');
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: `pay-${Date.now()}`,
      contractId,
      referenceFacture,
      factureDe,
      jusqua,
      cout: parseFloat(cout) || 0,
      montantPaye: parseFloat(montantPaye) || 0,
      datePaiement,
      dateFacture,
      kilometrage: parseInt(kilometrage) || 0
    });
    onClose();
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
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
          
          <ModalHeader title="Ajouter un paiement" onClose={onClose} />

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
            
            <FloatingLabelInput
              label="Référence facture"
              value={referenceFacture}
              onChange={setReferenceFacture}
              required />
            

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                  Facture de *
                </label>
                <input
                  type="date"
                  value={factureDe}
                  onChange={(e) => setFactureDe(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 bg-white" />
                
              </div>
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                  Jusqu'à *
                </label>
                <input
                  type="date"
                  value={jusqua}
                  onChange={(e) => setJusqua(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 bg-white" />
                
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Coût *"
                type="number"
                value={cout}
                onChange={setCout}
                required />
              
              <FloatingLabelInput
                label="Montant payé *"
                type="number"
                value={montantPaye}
                onChange={setMontantPaye}
                required />
              
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                  Date de payement *
                </label>
                <input
                  type="date"
                  value={datePaiement}
                  onChange={(e) => setDatePaiement(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 bg-white" />
                
              </div>
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                  Date de facture *
                </label>
                <input
                  type="date"
                  value={dateFacture}
                  onChange={(e) => setDateFacture(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 bg-white" />
                
              </div>
            </div>

            <FloatingLabelInput
              label="Kilométrage"
              type="number"
              value={kilometrage}
              onChange={setKilometrage} />
            

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg font-bold transition-colors shadow-sm">
                
                Ajouter
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function PaymentListModal({
  isOpen,
  onClose,
  contractId,
  payments,
  onAddPayment,
  onDeletePayment







}: {isOpen: boolean;onClose: () => void;contractId: string | null;payments: Payment[];onAddPayment: (payment: any) => void;onDeletePayment: (id: string) => void;}) {
  const [showAddModal, setShowAddModal] = useState(false);
  if (!isOpen || !contractId) return null;
  const contractPayments = payments.filter((p) => p.contractId === contractId);
  const totalCost = contractPayments.reduce((sum, p) => sum + p.cout, 0);
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
            title="Liste des paiements"
            subtitle={`Contrat ID: ${contractId}`}
            onClose={onClose}
            actions={
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-primary-foreground rounded-lg text-sm font-bold transition-colors">
                <Plus className="w-4 h-4" />
                Ajouter un paiement
              </button>
            }
          />

          <div className="flex-1 overflow-auto p-6">
            <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-sky-600" />
                <span className="text-sm font-medium text-sky-800">
                  Coût total en TND
                </span>
              </div>
              <span className="text-xl font-bold text-sky-900">
                {totalCost.toLocaleString()} TND
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                      Référence facture
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                      Facture de
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                      Jusqu'à
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                      Coût
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                      Montant payé
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                      Date payement
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                      Date facture
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                      Kilométrage
                    </th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contractPayments.length === 0 ?
                  <tr>
                      <td
                      colSpan={9}
                      className="py-8 text-center text-slate-500">
                      
                        Aucun paiement trouvé pour ce contrat.
                      </td>
                    </tr> :

                  contractPayments.map((payment) =>
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50 transition-colors">
                    
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">
                          {payment.referenceFacture}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {payment.factureDe}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {payment.jusqua}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-800">
                          {payment.cout}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-emerald-600">
                          {payment.montantPaye}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {payment.datePaiement}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {payment.dateFacture}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {payment.kilometrage}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier">
                          
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                          onClick={() => onDeletePayment(payment.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
          </div>
        </motion.div>
      </motion.div>

      <AddPaymentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(data) => {
          onAddPayment(data);
          setShowAddModal(false);
        }}
        contractId={contractId} />
      
    </AnimatePresence>);

}
function RenewContractModal({
  isOpen,
  onClose,
  onSave,
  contract





}: {isOpen: boolean;onClose: () => void;onSave: (date: string) => void;contract: Contract | null;}) {
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  useEffect(() => {
    if (isOpen) setNextPaymentDate('');
  }, [isOpen]);
  if (!isOpen || !contract) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(nextPaymentDate);
    onClose();
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          
          <ModalHeader
            title="Renouveler le contrat"
            icon={<RefreshCw className="w-5 h-5 text-primary-foreground" />}
            onClose={onClose}
          />

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
              <p className="text-sm text-sky-800 font-medium">
                Contrat:{' '}
                <span className="font-bold">{contract.numeroContrat}</span>
              </p>
            </div>

            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                Date de prochaine paiement *
              </label>
              <input
                type="date"
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700 bg-white" />
              
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                
                Annuler
              </button>
              <button
                type="submit"
                disabled={!nextPaymentDate}
                className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors shadow-sm">
                
                Confirmer
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  contractRef





}: {isOpen: boolean;onClose: () => void;onConfirm: () => void;contractRef: string;}) {
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          
          <ModalHeader title="Supprimer le contrat ?" onClose={onClose} />
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-slate-500 mb-6">
              Êtes-vous sûr de vouloir supprimer le contrat{' '}
              <span className="font-bold text-slate-700">{contractRef}</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold transition-colors shadow-sm">
                
                Oui, supprimer
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Main Component ---
export function GestionLocations() {
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isPaymentListOpen, setIsPaymentListOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [
    ...prev,
    {
      id,
      message,
      type
    }]
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };
  // Filters
  const filterManager = useFilterManager('parc_filters_rental');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState<
    ContractType | 'Tous'>(
    'Tous');
  const [showAgenda, setShowAgenda] = useState(false);
  const [agendaMonth, setAgendaMonth] = useState(new Date());
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Load default filter on mount
  useEffect(() => {
    const defaultFilter = filterManager.getDefaultFilter();
    if (defaultFilter) {
      if (defaultFilter.vehicles && defaultFilter.vehicles.length > 0) {
        setSelectedVehicles(defaultFilter.vehicles);
      }
      if (defaultFilter.dateDebut) setDateDebut(defaultFilter.dateDebut);
      if (defaultFilter.dateFin) setDateFin(defaultFilter.dateFin);
    }
  }, []);
  // Filter logic
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesSearch =
      searchTerm === '' ||
      c.numeroContrat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.premierChauffeur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vehicule.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVehicles =
      selectedVehicles.length === 0 || selectedVehicles.includes(c.vehicule);
      const matchesType =
      contractTypeFilter === 'Tous' || c.typeContrat === contractTypeFilter;
      const matchesDateDebut =
      dateDebut === '' || new Date(c.dateDebut) >= new Date(dateDebut);
      const matchesDateFin =
      dateFin === '' || new Date(c.dateFin) <= new Date(dateFin);
      return (
        matchesSearch &&
        matchesVehicles &&
        matchesType &&
        matchesDateDebut &&
        matchesDateFin);

    });
  }, [
  contracts,
  searchTerm,
  selectedVehicles,
  contractTypeFilter,
  dateDebut,
  dateFin]
  );
  // Group by vehicle
  const groupedContracts = useMemo(() => {
    const groups: Record<string, Contract[]> = {};
    filteredContracts.forEach((c) => {
      if (!groups[c.vehicule]) groups[c.vehicule] = [];
      groups[c.vehicule].push(c);
    });
    return groups;
  }, [filteredContracts]);
  // Pagination logic (flatten grouped for pagination, or paginate groups? Usually paginate rows)
  const flattenedGroupedContracts = useMemo(() => {
    const flat: {
      isGroupHeader: boolean;
      vehicle?: string;
      contract?: Contract;
    }[] = [];
    Object.entries(groupedContracts).forEach(([vehicle, vehicleContracts]) => {
      flat.push({
        isGroupHeader: true,
        vehicle
      });
      vehicleContracts.forEach((c) => {
        flat.push({
          isGroupHeader: false,
          contract: c
        });
      });
    });
    return flat;
  }, [groupedContracts]);
  const totalItems = flattenedGroupedContracts.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = flattenedGroupedContracts.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  // Handlers
  const handleSaveContract = (contractData: Contract) => {
    if (editingContract) {
      setContracts(
        contracts.map((c) => c.id === contractData.id ? contractData : c)
      );
      addToast('Contrat modifié avec succès', 'success');
    } else {
      setContracts([contractData, ...contracts]);
      addToast('Contrat ajouté avec succès', 'success');
    }
  };
  const handleDeleteContract = () => {
    if (selectedContractId) {
      setContracts(contracts.filter((c) => c.id !== selectedContractId));
      setPayments(payments.filter((p) => p.contractId !== selectedContractId));
      addToast('Contrat supprimé', 'success');
      setIsDeleteModalOpen(false);
      setSelectedContractId(null);
    }
  };
  const handleAddPayment = (paymentData: Payment) => {
    setPayments([paymentData, ...payments]);
    addToast('Paiement ajouté', 'success');
  };
  const handleDeletePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id));
    addToast('Paiement supprimé', 'success');
  };
  const handleRenew = (date: string) => {
    addToast(`Contrat renouvelé jusqu'au ${date}`, 'success');
  };
  const toggleVehicleSelection = (v: string) => {
    setSelectedVehicles((prev) =>
    prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };
  // Stats
  const stats = {
    total: contracts.length,
    locations: contracts.filter((c) => c.typeContrat === 'Location').length,
    emprunts: contracts.filter((c) => c.typeContrat === 'Emprunt').length,
    totalCost: contracts.reduce((sum, c) => sum + c.cout, 0),
    expiringSoon: contracts.filter((c) => {
      const daysUntil =
      (new Date(c.dateFin).getTime() - new Date().getTime()) / (
      1000 * 3600 * 24);
      return daysUntil > 0 && daysUntil <= c.meRappelerAvantJours;
    }).length
  };
  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <ToastContainer
        toasts={toasts}
        removeToast={(id) => setToasts(toasts.filter((t) => t.id !== id))} />
      

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Gestion des Locations et Emprunts
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Gérez vos contrats de location et d'emprunt de véhicules
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAgenda(!showAgenda)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${showAgenda ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                
                <Calendar className="w-4 h-4" />
                {showAgenda ? "Masquer l'agenda" : 'Agenda'}
              </button>
              <button
                onClick={() => {
                  setEditingContract(null);
                  setIsAddEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                
                <Plus className="w-4 h-4" />
                Ajouter un contrat
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Contrats
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Locations Actives
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {stats.locations}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Car className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Emprunts Actifs
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {stats.emprunts}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Coût Total
                  </p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {stats.totalCost.toLocaleString()} TND
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Expire Bientôt
                  </p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">
                    {stats.expiringSoon}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-3 w-full">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher (N°, Chauffeur...)"
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                
              </div>

              {/* Type Filter */}
              <select
                value={contractTypeFilter}
                onChange={(e) => setContractTypeFilter(e.target.value as any)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
                
                <option value="Tous">Tous les types</option>
                <option value="Location">Location</option>
                <option value="Emprunt">Emprunt</option>
              </select>

              {/* Date Range */}
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="px-2 py-1 bg-transparent text-sm focus:outline-none text-slate-600" />
                
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="px-2 py-1 bg-transparent text-sm focus:outline-none text-slate-600" />
                
              </div>

              {/* Vehicle Multi-select Dropdown (Simplified) */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
                  <Car className="w-4 h-4 text-slate-500" />
                  Véhicules (
                  {selectedVehicles.length === 0 ?
                  'Tous' :
                  selectedVehicles.length}
                  )
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 p-2 max-h-60 overflow-y-auto">
                  {MOCK_VEHICLES.map((v) =>
                  <label
                    key={v}
                    className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    
                      <input
                      type="checkbox"
                      checked={selectedVehicles.includes(v)}
                      onChange={() => toggleVehicleSelection(v)}
                      className="rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
                    
                      <span className="text-sm text-slate-700">{v}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Filter Manager Button */}
              <div className="relative ml-auto">
                <button
                  onClick={() =>
                  filterManager.setShowFilterManager(
                    !filterManager.showFilterManager
                  )
                  }
                  className="flex items-center justify-center p-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                  title="Filtres sauvegardés">
                  
                  <Bookmark className="w-5 h-5" />
                </button>
                <FilterManager
                  show={filterManager.showFilterManager}
                  onClose={() => filterManager.setShowFilterManager(false)}
                  savedFilters={filterManager.savedFilters}
                  onApply={(filter) => {
                    filterManager.applyFilter(filter, (f, dates) => {
                      setSelectedVehicles(f.vehicles);
                      setDateDebut(dates.dateDebut.split(' ')[0]);
                      setDateFin(dates.dateFin.split(' ')[0]);
                    });
                  }}
                  onSetDefault={filterManager.setDefaultFilter}
                  onDelete={filterManager.deleteFilter}
                  onUpdateName={filterManager.updateFilterName}
                  onSaveNew={() => {
                    filterManager.setShowFilterManager(false);
                    filterManager.setShowSaveFilter(true);
                  }}
                  editingFilter={filterManager.editingFilter}
                  setEditingFilter={filterManager.setEditingFilter}
                  getDurationLabel={filterManager.getDurationLabel} />
                
              </div>
            </div>
          </div>

          {/* Agenda View */}
          {showAgenda &&
          <motion.div
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
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
            
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  Disponibilité des véhicules sélectionnés
                </h3>
                <div className="flex items-center gap-4">
                  <button
                  onClick={() => {
                    const prev = new Date(agendaMonth);
                    prev.setMonth(prev.getMonth() - 1);
                    setAgendaMonth(prev);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <span className="text-sm font-bold text-slate-700 capitalize min-w-[120px] text-center">
                    {agendaMonth.toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric'
                  })}
                  </span>
                  <button
                  onClick={() => {
                    const next = new Date(agendaMonth);
                    next.setMonth(next.getMonth() + 1);
                    setAgendaMonth(next);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Calendar Grid */}
                  {(() => {
                  const year = agendaMonth.getFullYear();
                  const month = agendaMonth.getMonth();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const daysArray = Array.from(
                    {
                      length: daysInMonth
                    },
                    (_, i) => {
                      const d = new Date(year, month, i + 1);
                      return {
                        date: d,
                        dayNum: i + 1,
                        dayName: d.toLocaleDateString('fr-FR', {
                          weekday: 'short'
                        })
                      };
                    }
                  );
                  const vehiclesToShow =
                  selectedVehicles.length > 0 ?
                  selectedVehicles :
                  MOCK_VEHICLES;
                  return (
                    <>
                        <div className="flex mb-2">
                          <div className="w-48 flex-shrink-0 font-bold text-sm text-slate-500 p-2">
                            Véhicule
                          </div>
                          <div className="flex-1 flex">
                            {daysArray.map((day, i) =>
                          <div
                            key={i}
                            className="flex-1 min-w-[30px] text-center font-bold text-[10px] text-slate-500 p-1 bg-slate-50 border-r border-white">
                            
                                <div>
                                  {day.dayName.charAt(0).toUpperCase() +
                              day.dayName.slice(1, 2)}
                                </div>
                                <div>{day.dayNum}</div>
                              </div>
                          )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {vehiclesToShow.map((v) =>
                        <div key={v} className="flex items-center">
                              <div className="w-48 flex-shrink-0 text-sm font-medium text-slate-700 truncate pr-2">
                                {v}
                              </div>
                              <div className="flex-1 flex gap-[1px]">
                                {daysArray.map((day, i) => {
                              // Check if vehicle has an active contract on this day
                              const isOccupied = contracts.some((c) => {
                                if (c.vehicule !== v) return false;
                                const start = new Date(c.dateDebut);
                                const end = new Date(c.dateFin);
                                const current = day.date;
                                // Reset times for accurate day comparison
                                start.setHours(0, 0, 0, 0);
                                end.setHours(23, 59, 59, 999);
                                current.setHours(12, 0, 0, 0);
                                return current >= start && current <= end;
                              });
                              return (
                                <div
                                  key={i}
                                  className={`flex-1 h-8 rounded-sm ${isOccupied ? 'bg-rose-400' : 'bg-emerald-100'}`}
                                  title={`${day.dayNum} ${agendaMonth.toLocaleDateString(
                                    'fr-FR',
                                    {
                                      month: 'long'
                                    }
                                  )}: ${isOccupied ? 'Occupé' : 'Disponible'}`}>
                                </div>);

                            })}
                              </div>
                            </div>
                        )}
                        </div>
                      </>);

                })()}
                </div>
              </div>
            </motion.div>
          }

          {/* Contracts Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Véhicule
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      N° Contrat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Période
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Chauffeurs
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Coûts
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Paiement
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Carburant
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedItems.length === 0 ?
                  <tr>
                      <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-slate-500">
                      
                        Aucun contrat trouvé.
                      </td>
                    </tr> :

                  paginatedItems.map((item, idx) => {
                    if (item.isGroupHeader) {
                      return (
                        <tr
                          key={`group-${item.vehicle}-${idx}`}
                          className="bg-slate-50/80 border-y border-slate-200">
                          
                            <td colSpan={9} className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <Car className="w-4 h-4 text-slate-400" />
                                <span className="font-bold text-slate-700">
                                  {item.vehicle}
                                </span>
                                <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">
                                  {groupedContracts[item.vehicle!].length}{' '}
                                  contrat(s)
                                </span>
                              </div>
                            </td>
                          </tr>);

                    }
                    const c = item.contract!;
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/50 transition-colors">
                        
                          <td className="px-4 py-3 text-sm text-slate-600 pl-8">
                            {c.vehicule}
                          </td>
                          <td className="px-4 py-3">
                            <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${c.typeContrat === 'Location' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            
                              {c.typeContrat}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-800">
                            {c.numeroContrat}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-800">
                              {c.dateDebut}
                            </div>
                            <div className="text-xs text-slate-500">
                              au {c.dateFin}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-800">
                              {c.premierChauffeur}
                            </div>
                            <div className="text-xs text-slate-500">
                              {c.deuxiemeChauffeur !== '-' ?
                            c.deuxiemeChauffeur :
                            ''}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-slate-800">
                              {c.cout} TND
                            </div>
                            <div className="text-xs text-slate-500">
                              Act: {c.coutActivation} TND
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-800">
                              {c.paiementDe}
                            </div>
                            <div className="text-xs text-slate-500">
                              Rappel: {c.meRappelerAvantJours}j
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {c.niveauCarburant}
                          </td>
                          <td className="px-4 py-3 text-right sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center justify-end gap-1">
                              <button
                              onClick={() => {
                                setEditingContract(c);
                                setIsAddEditModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Modifier">
                              
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                              onClick={() => {
                                setSelectedContractId(c.id);
                                setIsPaymentListOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              title="Liste des paiements">
                              
                                <List className="w-4 h-4" />
                              </button>
                              <button
                              onClick={() => {
                                setEditingContract(c);
                                setIsRenewModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Renouveler le contrat">
                              
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                              onClick={() => {
                                setSelectedContractId(c.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Supprimer">
                              
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>);

                  })
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
      </div>

      {/* Modals */}
      <AddEditContractModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingContract(null);
        }}
        onSave={handleSaveContract}
        initialData={editingContract} />
      

      <PaymentListModal
        isOpen={isPaymentListOpen}
        onClose={() => {
          setIsPaymentListOpen(false);
          setSelectedContractId(null);
        }}
        contractId={selectedContractId}
        payments={payments}
        onAddPayment={handleAddPayment}
        onDeletePayment={handleDeletePayment} />
      

      <RenewContractModal
        isOpen={isRenewModalOpen}
        onClose={() => {
          setIsRenewModalOpen(false);
          setEditingContract(null);
        }}
        onSave={handleRenew}
        contract={editingContract} />
      

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedContractId(null);
        }}
        onConfirm={handleDeleteContract}
        contractRef={
        contracts.find((c) => c.id === selectedContractId)?.numeroContrat ||
        ''
        } />
      

      <SaveFilterModal
        show={filterManager.showSaveFilter}
        onClose={() => filterManager.setShowSaveFilter(false)}
        filterName={filterManager.filterName}
        setFilterName={filterManager.setFilterName}
        onSave={(type, unit, value) => {
          filterManager.saveFilter(
            {
              vehicles: selectedVehicles
            },
            type,
            unit,
            value,
            dateDebut,
            dateFin
          );
        }}
        currentDateDebut={dateDebut}
        currentDateFin={dateFin} />
      
    </div>);

}