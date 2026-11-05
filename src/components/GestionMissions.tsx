import React, { useEffect, useMemo, useState, useRef, Component } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  UserPlus,
  FileText,
  MapPin,
  Calendar,
  Car,
  User,
  ChevronDown,
  ArrowRight,
  Truck,
  Package,
  Euro,
  Eye,
  RefreshCw,
  Clock,
  AlertCircle,
  ExternalLink,
  Download } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalHeader } from '@/components/ui/modal-header';
import { TableFooter } from './TableFooter';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});
// --- Types ---
export type MissionStatus = 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
export interface Mission {
  id: string;
  numero: string;
  objet: string;
  vehicule: string;
  responsable: string;
  dateDepart: string;
  heureDepart: string;
  emplacementDepart: string;
  emplacementVisite: string;
  poidsCharge: number;
  valeurPoids: number;
  coutExtra: number;
  status: MissionStatus;
  dateFin?: string;
  dateDepartReel?: string;
  heureDepartReel?: string;
  kmParcourus?: number;
  carburantConsomme?: number;
}
// --- Mock Data ---
const INITIAL_MISSIONS: Mission[] = [
{
  id: '1',
  numero: 'MISS-2024-001',
  objet: 'Livraison Marchandise',
  vehicule: 'Fleet-001',
  responsable: 'Jean Dupont',
  dateDepart: '2024-03-15',
  heureDepart: '08:00',
  emplacementDepart: 'Tunis',
  emplacementVisite: 'Sfax',
  poidsCharge: 1500,
  valeurPoids: 25000,
  coutExtra: 350,
  status: 'Terminée',
  dateFin: '2024-03-16',
  dateDepartReel: '2024-03-15',
  heureDepartReel: '08:15',
  kmParcourus: 540,
  carburantConsomme: 65
},
{
  id: '2',
  numero: 'MISS-2024-002',
  objet: 'Inspection Technique',
  vehicule: 'Fleet-003',
  responsable: 'Marie Martin',
  dateDepart: '2024-03-18',
  heureDepart: '09:00',
  emplacementDepart: 'Sousse',
  emplacementVisite: 'Monastir',
  poidsCharge: 0,
  valeurPoids: 0,
  coutExtra: 80,
  status: 'En cours',
  dateDepartReel: '2024-03-18',
  heureDepartReel: '09:05'
},
{
  id: '3',
  numero: 'MISS-2024-003',
  objet: 'Transport Équipement',
  vehicule: 'Fleet-007',
  responsable: 'Pierre Durand',
  dateDepart: '2024-03-20',
  heureDepart: '07:30',
  emplacementDepart: 'Tunis',
  emplacementVisite: 'Bizerte',
  poidsCharge: 800,
  valeurPoids: 12000,
  coutExtra: 120,
  status: 'Planifiée'
},
{
  id: '4',
  numero: 'MISS-2024-004',
  objet: 'Visite Client',
  vehicule: 'Fleet-002',
  responsable: 'Sophie Bernard',
  dateDepart: '2024-03-22',
  heureDepart: '10:00',
  emplacementDepart: 'Nabeul',
  emplacementVisite: 'Tunis',
  poidsCharge: 50,
  valeurPoids: 500,
  coutExtra: 90,
  status: 'Planifiée'
},
{
  id: '5',
  numero: 'MISS-2024-005',
  objet: 'Livraison Express',
  vehicule: 'Fleet-005',
  responsable: 'Lucas Petit',
  dateDepart: '2024-03-10',
  heureDepart: '14:00',
  emplacementDepart: 'Gabès',
  emplacementVisite: 'Sfax',
  poidsCharge: 300,
  valeurPoids: 8000,
  coutExtra: 150,
  status: 'Annulée'
},
{
  id: '6',
  numero: 'MISS-2024-006',
  objet: 'Approvisionnement',
  vehicule: 'Fleet-012',
  responsable: 'Emma Thomas',
  dateDepart: '2024-03-14',
  heureDepart: '06:00',
  emplacementDepart: 'Kairouan',
  emplacementVisite: 'Sousse',
  poidsCharge: 2000,
  valeurPoids: 15000,
  coutExtra: 110,
  status: 'Terminée',
  dateFin: '2024-03-14',
  dateDepartReel: '2024-03-14',
  heureDepartReel: '06:10',
  kmParcourus: 120,
  carburantConsomme: 15
},
{
  id: '7',
  numero: 'MISS-2024-007',
  objet: 'Transfert Matériel',
  vehicule: 'Fleet-008',
  responsable: 'Antoine Moreau',
  dateDepart: '2024-03-25',
  heureDepart: '08:30',
  emplacementDepart: 'Tunis',
  emplacementVisite: 'Gabès',
  poidsCharge: 1200,
  valeurPoids: 18000,
  coutExtra: 450,
  status: 'Planifiée'
},
{
  id: '8',
  numero: 'MISS-2024-008',
  objet: 'Maintenance Site',
  vehicule: 'Fleet-004',
  responsable: 'Camille Leroy',
  dateDepart: '2024-03-19',
  heureDepart: '11:00',
  emplacementDepart: 'Sfax',
  emplacementVisite: 'Kairouan',
  poidsCharge: 200,
  valeurPoids: 3000,
  coutExtra: 130,
  status: 'En cours',
  dateDepartReel: '2024-03-19',
  heureDepartReel: '11:00'
}];

const MOCK_COUPONS = [
{
  id: '1',
  reference: 'CRT-2024-001',
  type: 'Carte de remplissage',
  solde: '150 L'
},
{
  id: '2',
  reference: 'CAR-2024-001',
  type: 'Carnet de remplissage',
  solde: '20 Bons'
},
{
  id: '3',
  reference: 'CRT-2024-002',
  type: 'Carte de remplissage',
  solde: '500 TND'
}];

// --- Helper Components ---
function FloatingLabelInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  className = '',
  disabled = false








}: {label: string;value: string | number;onChange: (v: string) => void;type?: string;required?: boolean;className?: string;disabled?: boolean;}) {
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
        className={`w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 bg-white ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
        required={required} />
      
    </div>);

}
function StatusBadge({ status }: {status: MissionStatus;}) {
  switch (status) {
    case 'Planifiée':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
          Planifiée
        </span>);

    case 'En cours':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <span className="relative flex h-2 w-2 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          En cours
        </span>);

    case 'Terminée':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          Terminée
        </span>);

    case 'Annulée':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
          Annulée
        </span>);

  }
}
function LocationSelector({
  label,
  value,
  onChange,
  locations,
  onOpenMap,
  required







}: {label: string;value: string;onChange: (v: string) => void;locations: string[];onOpenMap: () => void;required?: boolean;}) {
  return (
    <div className="flex gap-2 items-start">
      <div className="relative flex-1">
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
          
          <option value="">Sélectionner...</option>
          {locations.map((loc) =>
          <option key={loc} value={loc}>
              {loc}
            </option>
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      <button
        type="button"
        onClick={onOpenMap}
        className="h-[46px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 flex items-center justify-center transition-colors"
        title="Ajouter sur la carte">
        
        <Plus className="w-5 h-5" />
      </button>
    </div>);

}
function CreatableCombobox({
  label,
  value,
  onChange,
  options,
  onAddOption






}: {label: string;value: string;onChange: (v: string) => void;options: string[];onAddOption: (v: string) => void;}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node))
      {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const filteredOptions = options.filter((o) =>
  o.toLowerCase().includes(search.toLowerCase())
  );
  const showAdd =
  search && !options.some((o) => o.toLowerCase() === search.toLowerCase());
  return (
    <div className="relative" ref={wrapperRef}>
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
        {label}
      </label>
      <div
        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 flex items-center justify-between cursor-text focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-transparent"
        onClick={() => setIsOpen(true)}>
        
        <input
          type="text"
          value={isOpen ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setSearch('');
            setIsOpen(true);
          }}
          placeholder={value || 'Sélectionner ou taper...'}
          className="w-full outline-none bg-transparent" />
        
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>

      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: -10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -10
          }}
          className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          
            {filteredOptions.length > 0 ?
          filteredOptions.map((opt) =>
          <div
            key={opt}
            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
            onClick={() => {
              onChange(opt);
              setIsOpen(false);
            }}>
            
                  {opt}
                </div>
          ) :
          !showAdd ?
          <div className="px-4 py-2 text-sm text-slate-500 italic">
                Aucun résultat
              </div> :
          null}
            {showAdd &&
          <div
            className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-sm text-sky-600 font-medium flex items-center gap-2 border-t border-slate-100"
            onClick={() => {
              onAddOption(search);
              onChange(search);
              setIsOpen(false);
            }}>
            
                <Plus className="w-4 h-4" />
                Ajouter "{search}"
              </div>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
// --- Modals ---
function MapPickerModal({
  isOpen,
  onClose,
  onConfirm




}: {isOpen: boolean;onClose: () => void;onConfirm: (name: string) => void;}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [name, setName] = useState('');
  useEffect(() => {
    if (isOpen) {
      setPosition(null);
      setName('');
    }
  }, [isOpen]);
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      }
    });
    return position === null ? null : <Marker position={position}></Marker>;
  }
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
          
          <ModalHeader
            title="Ajouter un emplacement"
            icon={<MapPin className="w-5 h-5 text-primary-foreground shrink-0" />}
            onClose={onClose}
          />

          <div className="p-4 flex flex-col gap-4">
            <div className="h-[300px] w-full relative rounded-lg overflow-hidden border border-slate-200 z-0">
              <MapContainer
                center={[34.0, 9.0]}
                zoom={6}
                style={{
                  height: '100%',
                  width: '100%'
                }}>
                
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker />
              </MapContainer>
            </div>

            <FloatingLabelInput
              label="Nom de l'emplacement"
              value={name}
              onChange={setName}
              required />
            
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
              
              Annuler
            </button>
            <button
              onClick={() => {
                if (name && position) {
                  onConfirm(name);
                  onClose();
                }
              }}
              disabled={!name || !position}
              className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
              Ajouter
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function AddEditMissionModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  locations,
  onAddLocation







}: {isOpen: boolean;onClose: () => void;onSave: (data: Partial<Mission>) => void;initialData?: Mission | null;locations: string[];onAddLocation: (loc: string) => void;}) {
  const isEdit = !!initialData;
  const [step, setStep] = useState<1 | 2>(1);
  // Step 1
  const [numero, setNumero] = useState('');
  const [objet, setObjet] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [heureDepart, setHeureDepart] = useState('');
  // Step 2
  const [emplacementDepart, setEmplacementDepart] = useState('');
  const [emplacementVisite, setEmplacementVisite] = useState('');
  const [poidsCharge, setPoidsCharge] = useState('');
  const [valeurPoids, setValeurPoids] = useState('');
  const [coutExtra, setCoutExtra] = useState('');
  // Map Picker State
  const [mapPickerTarget, setMapPickerTarget] = useState<
    'depart' | 'visite' | null>(
    null);
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNumero(initialData.numero);
        setObjet(initialData.objet);
        setDateDepart(initialData.dateDepart);
        setHeureDepart(initialData.heureDepart);
        setEmplacementDepart(initialData.emplacementDepart);
        setEmplacementVisite(initialData.emplacementVisite);
        setPoidsCharge(initialData.poidsCharge.toString());
        setValeurPoids(initialData.valeurPoids.toString());
        setCoutExtra(initialData.coutExtra.toString());
      } else {
        setNumero('');
        setObjet('');
        setDateDepart('');
        setHeureDepart('');
        setEmplacementDepart('');
        setEmplacementVisite('');
        setPoidsCharge('0');
        setValeurPoids('0');
        setCoutExtra('0');
      }
      setStep(1);
    }
  }, [isOpen, initialData]);
  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || Date.now().toString(),
      numero,
      objet,
      dateDepart,
      heureDepart,
      responsable: initialData?.responsable || '-',
      vehicule: initialData?.vehicule || '-',
      emplacementDepart,
      emplacementVisite,
      poidsCharge: Number(poidsCharge),
      valeurPoids: Number(valeurPoids),
      coutExtra: Number(coutExtra),
      status: initialData?.status || 'Planifiée'
    });
    onClose();
  };
  return (
    <>
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
              title={isEdit ? 'Modifier la mission' : 'Ajouter une mission'}
              onClose={onClose}
            >
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
                <div
                  className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
                <span className="text-xs text-primary-foreground/80 ml-2 font-medium">
                  Étape {step} sur 2
                </span>
              </div>
            </ModalHeader>

            <div className="p-6 overflow-y-auto flex-1">
              <form
                id="mission-form"
                onSubmit={
                step === 2 ?
                handleSubmit :
                (e) => {
                  e.preventDefault();
                  setStep(2);
                }
                }
                className="space-y-6">
                
                {step === 1 ?
                <div className="space-y-5">
                    <FloatingLabelInput
                    label="N° Mission"
                    value={numero}
                    onChange={setNumero}
                    required />
                  
                    <FloatingLabelInput
                    label="Objet de la mission"
                    value={objet}
                    onChange={setObjet}
                    required />
                  

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                          Date de départ *
                        </label>
                        <input
                        type="date"
                        value={dateDepart}
                        onChange={(e) => setDateDepart(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700" />
                      
                      </div>
                      <div className="relative">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                          Heure de départ *
                        </label>
                        <input
                        type="time"
                        value={heureDepart}
                        onChange={(e) => setHeureDepart(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700" />
                      
                      </div>
                    </div>
                  </div> :

                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <LocationSelector
                      label="Emplacement de départ"
                      value={emplacementDepart}
                      onChange={setEmplacementDepart}
                      locations={locations}
                      onOpenMap={() => setMapPickerTarget('depart')}
                      required />
                    
                      <LocationSelector
                      label="Emplacement à visité"
                      value={emplacementVisite}
                      onChange={setEmplacementVisite}
                      locations={locations}
                      onOpenMap={() => setMapPickerTarget('visite')}
                      required />
                    
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FloatingLabelInput
                      label="Poids chargé (kg)"
                      type="number"
                      value={poidsCharge}
                      onChange={setPoidsCharge} />
                    
                      <FloatingLabelInput
                      label="Valeur poids (TND)"
                      type="number"
                      value={valeurPoids}
                      onChange={setValeurPoids} />
                    
                      <FloatingLabelInput
                      label="Cout extra (TND)"
                      type="number"
                      value={coutExtra}
                      onChange={setCoutExtra}
                      required />
                    
                    </div>
                  </div>
                }
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
              {step === 2 ?
              <button
                type="button"
                onClick={() => setStep(1)}
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

              {step === 1 ?
              <button
                type="submit"
                form="mission-form"
                className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </button> :

              <button
                type="submit"
                form="mission-form"
                className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
                
                  <CheckCircle className="w-4 h-4" />
                  {isEdit ? 'Enregistrer' : 'Créer la mission'}
                </button>
              }
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <MapPickerModal
        isOpen={!!mapPickerTarget}
        onClose={() => setMapPickerTarget(null)}
        onConfirm={(name) => {
          onAddLocation(name);
          if (mapPickerTarget === 'depart') setEmplacementDepart(name);else
          if (mapPickerTarget === 'visite') setEmplacementVisite(name);
          setMapPickerTarget(null);
        }} />
      
    </>);

}
function ViewMissionModal({
  isOpen,
  onClose,
  mission




}: {isOpen: boolean;onClose: () => void;mission: Mission | null;}) {
  if (!isOpen || !mission) return null;
  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const css = [
    '*, body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }',
    'body { padding: 40px; }',
    '.header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }',
    '.logo-placeholder { width: 150px; height: 50px; background-color: #f1f5f9; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; color: #64748b; font-weight: bold; font-size: 14px; }',
    '.title { text-align: right; }',
    '.title h1 { margin: 0; color: #0f172a; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }',
    '.title p { margin: 5px 0 0 0; color: #64748b; font-size: 14px; }',
    '.section { margin-bottom: 30px; }',
    '.section-title { font-size: 16px; font-weight: bold; color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }',
    '.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }',
    '.field { margin-bottom: 10px; }',
    '.field-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }',
    '.field-value { font-size: 14px; font-weight: 600; color: #0f172a; }',
    '.trajectoire { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; display: flex; align-items: center; justify-content: space-between; }',
    '.point { text-align: center; flex: 1; }',
    '.point-label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }',
    '.point-value { font-size: 16px; font-weight: bold; color: #0f172a; }',
    '.arrow { color: #94a3b8; font-size: 24px; padding: 0 20px; }',
    '.pdf-footer { margin-top: 60px; display: flex; justify-content: space-between; }',
    '.signature-box { width: 200px; }',
    '.signature-title { font-weight: bold; font-size: 14px; margin-bottom: 60px; color: #0f172a; }',
    '.signature-line { border-top: 1px solid #cbd5e1; }',
    '@media print { body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }'].
    join('\n');
    const periode =
    mission.dateDepart +
    ' à ' +
    mission.heureDepart + (
    mission.dateFin ? ' → ' + mission.dateFin : '');
    const lines = [
    '<!DOCTYPE html><html><head>',
    '<title>Ordre de Mission - ' + mission.numero + '</title>',
    '<style>{`' + css + '`}</style>',
    '</head><body>',
    '<div class="header">',
    '  <div class="logo-placeholder">LOGO ENTREPRISE</div>',
    '  <div class="title"><h1>Ordre de Mission</h1><p>N° ' +
    mission.numero +
    '</p></div>',
    '</div>',
    '<div class="grid section">',
    '  <div>',
    '    <div class="section-title">Informations Générales</div>',
    '    <div class="field"><div class="field-label">Objet de la mission</div><div class="field-value">' +
    mission.objet +
    '</div></div>',
    '    <div class="field"><div class="field-label">Statut</div><div class="field-value">' +
    mission.status +
    '</div></div>',
    '    <div class="field"><div class="field-label">Période</div><div class="field-value">' +
    periode +
    '</div></div>',
    '  </div>',
    '  <div>',
    '    <div class="section-title">Intervenants</div>',
    '    <div class="field"><div class="field-label">Responsable</div><div class="field-value">' +
    mission.responsable +
    '</div></div>',
    '    <div class="field"><div class="field-label">Véhicule</div><div class="field-value">' +
    mission.vehicule +
    '</div></div>',
    '  </div>',
    '</div>',
    '<div class="section">',
    '  <div class="section-title">Trajectoire</div>',
    '  <div class="trajectoire">',
    '    <div class="point"><div class="point-label">Départ</div><div class="point-value">' +
    mission.emplacementDepart +
    '</div></div>',
    '    <div class="arrow">→</div>',
    '    <div class="point"><div class="point-label">Destination</div><div class="point-value">' +
    mission.emplacementVisite +
    '</div></div>',
    '  </div>',
    '</div>',
    '<div class="section">',
    '  <div class="section-title">Détails Logistiques</div>',
    '  <div class="grid">',
    '    <div class="field"><div class="field-label">Poids chargé</div><div class="field-value">' +
    mission.poidsCharge +
    ' kg</div></div>',
    '    <div class="field"><div class="field-label">Valeur du poids</div><div class="field-value">' +
    mission.valeurPoids +
    ' TND</div></div>',
    '    <div class="field"><div class="field-label">Coût estimé</div><div class="field-value">' +
    mission.coutExtra +
    ' TND</div></div>',
    '  </div>',
    '</div>',
    '<div class="pdf-footer">',
    '  <div class="signature-box"><div class="signature-title">Le Responsable</div><div class="signature-line"></div></div>',
    '  <div class="signature-box"><div class="signature-title">Le Directeur</div><div class="signature-line"></div></div>',
    '</div>',
    '<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>',
    '</body></html>'];

    const htmlContent = lines.join('\n');
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title={`Détails de la mission ${mission.numero}`}
            icon={<Eye className="w-5 h-5 text-primary-foreground shrink-0" />}
            onClose={onClose}
          />

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Statut actuel
                </p>
                <div className="mt-1">
                  <StatusBadge status={mission.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 font-medium">Période</p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {mission.dateDepart} à {mission.heureDepart}{' '}
                  {mission.dateFin ? `→ ${mission.dateFin}` : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                  Informations Générales
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 block">Objet</span>
                    <span className="text-sm font-medium text-slate-800">
                      {mission.objet}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">
                      Responsable
                    </span>
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-1">
                      <User className="w-3 h-3" /> {mission.responsable}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">
                      Véhicule
                    </span>
                    <span className="text-sm font-medium text-slate-800 flex items-center gap-1">
                      <Car className="w-3 h-3" /> {mission.vehicule}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                  Détails Logistiques
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 block">
                      Poids chargé
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {mission.poidsCharge} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">
                      Valeur du poids
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      {mission.valeurPoids} TND
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">
                      Coût estimé
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {mission.coutExtra} TND
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                Trajectoire
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between relative">
                  {/* Connecting Line */}
                  <div className="absolute left-[10%] right-[10%] top-[28px] h-0.5 bg-slate-200 z-0"></div>

                  {/* Departure */}
                  <div className="relative z-10 flex flex-col items-center gap-3 w-1/3">
                    <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center border-4 border-slate-50 shadow-sm">
                      <MapPin className="w-6 h-6 text-rose-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                        Départ
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {mission.emplacementDepart}
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mission.emplacementDepart)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1.5 font-medium transition-colors">
                        
                        Voir sur la carte <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="relative z-10 bg-slate-50 px-4 text-slate-400 -mt-10">
                    <ArrowRight className="w-6 h-6" />
                  </div>

                  {/* Destination */}
                  <div className="relative z-10 flex flex-col items-center gap-3 w-1/3">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-slate-50 shadow-sm">
                      <MapPin className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                        Destination
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {mission.emplacementVisite}
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mission.emplacementVisite)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1.5 font-medium transition-colors">
                        
                        Voir sur la carte <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
              
              Fermer
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
              <Download className="w-4 h-4" />
              Exporter PDF
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function AffectationModal({
  isOpen,
  onClose,
  mission,
  responsables,
  onAddResponsable,
  onSave







}: {isOpen: boolean;onClose: () => void;mission: Mission | null;responsables: string[];onAddResponsable: (r: string) => void;onSave: (missionId: string, responsable: string, vehicule: string) => void;}) {
  const [activeTab, setActiveTab] = useState<'responsable' | 'coupons'>(
    'responsable'
  );
  const [responsable, setResponsable] = useState('');
  const [vehicule, setVehicule] = useState('');
  useEffect(() => {
    if (mission) {
      setResponsable(mission.responsable === '-' ? '' : mission.responsable);
      setVehicule(mission.vehicule === '-' ? '' : mission.vehicule);
    }
  }, [mission]);
  if (!isOpen || !mission) return null;
  const handleSave = () => {
    onSave(mission.id, responsable || '-', vehicule || '-');
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
          
          <ModalHeader
            title={`Affectation - ${mission.numero}`}
            icon={<UserPlus className="w-5 h-5 text-primary-foreground shrink-0" />}
            onClose={onClose}
          />

          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('responsable')}
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'responsable' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              
              Responsable & Véhicule
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'coupons' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
              
              Coupons
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'responsable' ?
            <div className="space-y-5">
                <CreatableCombobox
                label="Responsable"
                value={responsable}
                onChange={setResponsable}
                options={responsables}
                onAddOption={onAddResponsable} />
              
                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                    Véhicule
                  </label>
                  <select
                  value={vehicule}
                  onChange={(e) => setVehicule(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                  
                    <option value="">Sélectionner...</option>
                    <option value="Fleet-001">Fleet-001</option>
                    <option value="Fleet-002">Fleet-002</option>
                    <option value="Fleet-003">Fleet-003</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div> :

            <div className="space-y-4">
                <p className="text-sm text-slate-500 mb-2">
                  Sélectionnez les coupons à affecter à cette mission :
                </p>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2 w-10"></th>
                        <th className="px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                          Référence
                        </th>
                        <th className="px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                          Type
                        </th>
                        <th className="px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                          Solde
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_COUPONS.map((c) =>
                    <tr key={c.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <input
                          type="checkbox"
                          className="rounded text-sky-500 focus:ring-sky-500" />
                        
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-800">
                            {c.reference}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {c.type}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-blue-600">
                            {c.solde}
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            }
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
              
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
              Enregistrer l'affectation
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function ReportModal({
  isOpen,
  onClose,
  mission,
  fuelPricePerLiter





}: {isOpen: boolean;onClose: () => void;mission: Mission | null;fuelPricePerLiter: number;}) {
  if (!isOpen || !mission) return null;
  const coutCarburant = (mission.carburantConsomme || 0) * fuelPricePerLiter;
  const coutTotal = coutCarburant + mission.coutExtra;
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
            title={`Rapport de Mission - ${mission.numero}`}
            icon={<FileText className="w-5 h-5 text-primary-foreground shrink-0" />}
            onClose={onClose}
          />

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">
                Statistiques de la mission
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Date/Heure de départ prévue
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {mission.dateDepart} à {mission.heureDepart}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Date/Heure de départ réelle
                  </p>
                  <p className="text-sm font-medium text-slate-800">
                    {mission.dateDepartReel ?
                    `${mission.dateDepartReel} à ${mission.heureDepartReel}` :
                    'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Période réelle</p>
                  <p className="text-sm font-bold text-slate-800">
                    {(() => {
                      if (mission.dateDepartReel && mission.dateFin) {
                        const start = new Date(
                          `${mission.dateDepartReel}T${mission.heureDepartReel || '00:00'}`
                        );
                        const end = new Date(`${mission.dateFin}T00:00`);
                        const diffMs = end.getTime() - start.getTime();
                        if (diffMs > 0) {
                          const totalMinutes = Math.floor(diffMs / (1000 * 60));
                          const days = Math.floor(totalMinutes / (60 * 24));
                          const hours = Math.floor(
                            totalMinutes % (60 * 24) / 60
                          );
                          const minutes = totalMinutes % 60;
                          return `${days}J ${hours}H ${minutes}M`;
                        }
                      }
                      return 'N/A';
                    })()}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {mission.dateDepartReel || mission.dateDepart} →{' '}
                    {mission.dateFin || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Kilomètres parcourus
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {mission.kmParcourus || 0} km
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 mb-4">
                  Détails des coûts
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Carburant consommé
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {mission.carburantConsomme || 0} L
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">
                      Coût carburant ({fuelPricePerLiter} TND/L)
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {coutCarburant.toFixed(3)} TND
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Coût extra</p>
                    <p className="text-sm font-medium text-slate-800">
                      {mission.coutExtra.toFixed(3)} TND
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Coût total</p>
                    <p className="text-lg font-bold text-rose-600">
                      {coutTotal.toFixed(3)} TND
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b pb-2">
                Trajectoire
              </h3>
              <div className="flex items-center gap-4 text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-rose-500" />{' '}
                  {mission.emplacementDepart}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-500" />{' '}
                  {mission.emplacementVisite}
                </div>
              </div>
              <div className="h-[300px] bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <MapPin className="w-8 h-8 mb-2 opacity-50" />
                <span className="font-medium">Carte de trajectoire</span>
                <span className="text-xs mt-1">
                  Aperçu Leaflet (Placeholder)
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
              
              Fermer
            </button>
            <button
              onClick={() => {
                console.log('Exporting report...');
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
              <FileText className="w-4 h-4" />
              Exporter le rapport
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  type = 'danger'








}: {isOpen: boolean;onClose: () => void;onConfirm: () => void;title: string;message: string;confirmText: string;type?: 'danger' | 'success';}) {
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
          
          <ModalHeader title={title} onClose={onClose} />
          <div className="p-6 text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'danger' ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-500'}`}>
              
              {type === 'danger' ?
              <AlertCircle className="w-8 h-8" /> :

              <CheckCircle className="w-8 h-8" />
              }
            </div>
            <p className="text-slate-500 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                
                Annuler
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-6 py-2 text-white rounded-lg font-bold transition-colors shadow-sm ${type === 'danger' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Main Component ---
export function GestionMissions({
  fuelPricePerLiter = 2.525


}: {fuelPricePerLiter?: number;}) {
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  // Shared State
  const [responsables, setResponsables] = useState<string[]>([
  'Jean Dupont',
  'Marie Martin',
  'Pierre Durand',
  'Sophie Bernard',
  'Lucas Petit',
  'Emma Thomas',
  'Antoine Moreau',
  'Camille Leroy']
  );
  const [locations, setLocations] = useState<string[]>([
  'Tunis',
  'Sfax',
  'Sousse',
  'Monastir',
  'Bizerte',
  'Gabès',
  'Kairouan',
  'Nabeul',
  'Tozeur',
  'Gafsa']
  );
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResponsable, setFilterResponsable] = useState('');
  const [filterVehicule, setFilterVehicule] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAffectationModalOpen, setIsAffectationModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'delete' | 'validate';
    missionId: string | null;
  }>({
    isOpen: false,
    type: 'cancel',
    missionId: null
  });
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  // Filtered Data
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      const matchesSearch =
      m.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.objet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.emplacementDepart.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.emplacementVisite.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesResp = filterResponsable ?
      m.responsable === filterResponsable :
      true;
      const matchesVeh = filterVehicule ? m.vehicule === filterVehicule : true;
      const matchesStatus = filterStatus ? m.status === filterStatus : true;
      return matchesSearch && matchesResp && matchesVeh && matchesStatus;
    });
  }, [missions, searchTerm, filterResponsable, filterVehicule, filterStatus]);
  // Pagination
  const totalItems = filteredMissions.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMissions = filteredMissions.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  // KPIs
  const kpis = useMemo(() => {
    return {
      total: missions.length,
      planifiees: missions.filter((m) => m.status === 'Planifiée').length,
      enCours: missions.filter((m) => m.status === 'En cours').length,
      terminees: missions.filter((m) => m.status === 'Terminée').length,
      coutTotal: missions.reduce((acc, m) => acc + m.coutExtra, 0)
    };
  }, [missions]);
  // Actions
  const handleSaveMission = (data: Partial<Mission>) => {
    if (selectedMission) {
      setMissions(
        missions.map((m) =>
        m.id === data.id ?
        {
          ...m,
          ...data
        } as Mission :
        m
        )
      );
    } else {
      setMissions([data as Mission, ...missions]);
    }
  };
  const handleSaveAffectation = (
  missionId: string,
  responsable: string,
  vehicule: string) =>
  {
    setMissions(
      missions.map((m) =>
      m.id === missionId ?
      {
        ...m,
        responsable,
        vehicule
      } :
      m
      )
    );
  };
  const handleConfirmAction = () => {
    const id = confirmModalConfig.missionId;
    if (!id) return;
    if (confirmModalConfig.type === 'delete') {
      setMissions(missions.filter((m) => m.id !== id));
    } else if (confirmModalConfig.type === 'cancel') {
      setMissions(
        missions.map((m) =>
        m.id === id ?
        {
          ...m,
          status: 'Annulée'
        } :
        m
        )
      );
    } else if (confirmModalConfig.type === 'validate') {
      setMissions(
        missions.map((m) =>
        m.id === id ?
        {
          ...m,
          status: 'Terminée',
          dateFin: new Date().toISOString().split('T')[0]
        } :
        m
        )
      );
    }
  };
  const resetFilters = () => {
    setSearchTerm('');
    setFilterResponsable('');
    setFilterVehicule('');
    setFilterStatus('');
    setCurrentPage(1);
  };
  return (
    <div className="h-full overflow-y-auto p-4 bg-slate-50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion des Visites/Missions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez vos missions, affectations et rapports
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedMission(null);
              setIsAddEditModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
            
            <Plus className="w-4 h-4" />
            Ajouter une mission
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Missions
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {kpis.total}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Planifiées</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {kpis.planifiees}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">En cours</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {kpis.enCours}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Terminées</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {kpis.terminees}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Coût Extra Total
                </p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {kpis.coutTotal}{' '}
                  <span className="text-sm font-normal text-slate-500">
                    TND
                  </span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Euro className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-4 bg-slate-50/50 rounded-t-xl">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher par N°, objet, emplacement..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white" />
              
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={filterResponsable}
                onChange={(e) => {
                  setFilterResponsable(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700">
                
                <option value="">Tous les responsables</option>
                {Array.from(new Set(missions.map((m) => m.responsable))).map(
                  (r) =>
                  <option key={r} value={r}>
                      {r}
                    </option>

                )}
              </select>

              <select
                value={filterVehicule}
                onChange={(e) => {
                  setFilterVehicule(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700">
                
                <option value="">Tous les véhicules</option>
                {Array.from(new Set(missions.map((m) => m.vehicule))).map(
                  (v) =>
                  <option key={v} value={v}>
                      {v}
                    </option>

                )}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700">
                
                <option value="">Tous les statuts</option>
                <option value="Planifiée">Planifiée</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
              </select>

              <button
                onClick={resetFilters}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Réinitialiser les filtres">
                
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    N° Mission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Objet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Date/Heure Départ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Trajectoire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Cout extra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMissions.length === 0 ?
                <tr>
                    <td
                    colSpan={9}
                    className="px-6 py-8 text-center text-slate-500">
                    
                      Aucune mission trouvée
                    </td>
                  </tr> :

                paginatedMissions.map((mission) =>
                <tr
                  key={mission.id}
                  className="hover:bg-slate-50 transition-colors group">
                  
                      <td className="px-6 py-4 text-sm font-bold text-[#0ea5e9]">
                        {mission.numero}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                        {mission.objet}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {mission.vehicule}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {mission.responsable}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {mission.dateDepart} à {mission.heureDepart}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[100px]">
                            {mission.emplacementDepart}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[100px]">
                            {mission.emplacementVisite}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        {mission.coutExtra} TND
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={mission.status} />
                      </td>
                      <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)] text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                        onClick={() => {
                          setSelectedMission(mission);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                        title="Voir détails">
                        
                            <Eye className="w-4 h-4" />
                          </button>

                          {mission.status === 'Planifiée' &&
                      <>
                              <button
                          onClick={() => {
                            setSelectedMission(mission);
                            setIsAffectationModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
                          title="Affectation">
                          
                                <UserPlus className="w-4 h-4" />
                              </button>
                              <button
                          onClick={() => {
                            setSelectedMission(mission);
                            setIsAddEditModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                          title="Modifier">
                          
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                          onClick={() =>
                          setConfirmModalConfig({
                            isOpen: true,
                            type: 'cancel',
                            missionId: mission.id
                          })
                          }
                          className="p-1.5 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                          title="Annuler">
                          
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                      }

                          {mission.status === 'En cours' &&
                      <button
                        onClick={() =>
                        setConfirmModalConfig({
                          isOpen: true,
                          type: 'validate',
                          missionId: mission.id
                        })
                        }
                        className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600 transition-colors"
                        title="Valider">
                        
                              <CheckCircle className="w-4 h-4" />
                            </button>
                      }

                          {mission.status === 'Terminée' &&
                      <>
                              <button
                          onClick={() => {
                            setSelectedMission(mission);
                            setIsReportModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                          title="Rapport">
                          
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                          onClick={() => {
                            setSelectedMission(mission);
                            setIsAddEditModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                          title="Modifier">
                          
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                          onClick={() =>
                          setConfirmModalConfig({
                            isOpen: true,
                            type: 'delete',
                            missionId: mission.id
                          })
                          }
                          className="p-1.5 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                          title="Supprimer">
                          
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                      }

                          {mission.status === 'Annulée' &&
                      <>
                              <button
                          onClick={() => {
                            setSelectedMission(mission);
                            setIsAddEditModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-amber-50 rounded text-amber-600 transition-colors"
                          title="Modifier">
                          
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                          onClick={() =>
                          setConfirmModalConfig({
                            isOpen: true,
                            type: 'delete',
                            missionId: mission.id
                          })
                          }
                          className="p-1.5 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                          title="Supprimer">
                          
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                      }
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
            onExportPdf={() =>
            console.log('Exporting PDF with filters:', {
              searchTerm,
              filterResponsable,
              filterVehicule,
              filterStatus
            })
            }
            onExportExcel={() =>
            console.log('Exporting Excel with filters:', {
              searchTerm,
              filterResponsable,
              filterVehicule,
              filterStatus
            })
            } />
          
        </div>
      </div>

      {/* Modals */}
      <AddEditMissionModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveMission}
        initialData={selectedMission}
        locations={locations}
        onAddLocation={(loc) => {
          if (!locations.includes(loc)) setLocations([...locations, loc]);
        }} />
      

      <ViewMissionModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        mission={selectedMission} />
      

      <AffectationModal
        isOpen={isAffectationModalOpen}
        onClose={() => setIsAffectationModalOpen(false)}
        mission={selectedMission}
        responsables={responsables}
        onAddResponsable={(r) => {
          if (!responsables.includes(r)) setResponsables([...responsables, r]);
        }}
        onSave={handleSaveAffectation} />
      

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        mission={selectedMission}
        fuelPricePerLiter={fuelPricePerLiter} />
      

      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() =>
        setConfirmModalConfig({
          ...confirmModalConfig,
          isOpen: false
        })
        }
        onConfirm={handleConfirmAction}
        title={
        confirmModalConfig.type === 'delete' ?
        'Supprimer la mission' :
        confirmModalConfig.type === 'cancel' ?
        'Annuler la mission' :
        'Valider la mission'
        }
        message={
        confirmModalConfig.type === 'delete' ?
        'Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.' :
        confirmModalConfig.type === 'cancel' ?
        'Êtes-vous sûr de vouloir annuler cette mission ?' :
        'Marquer cette mission comme terminée ?'
        }
        confirmText={
        confirmModalConfig.type === 'delete' ?
        'Supprimer' :
        confirmModalConfig.type === 'cancel' ?
        'Annuler la mission' :
        'Valider'
        }
        type={confirmModalConfig.type === 'validate' ? 'success' : 'danger'} />
      
    </div>);

}
export default GestionMissions;