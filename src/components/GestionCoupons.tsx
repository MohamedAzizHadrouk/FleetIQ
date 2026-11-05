import React, { useEffect, useMemo, useState, Component } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Clock,
  ChevronDown,
  X,
  Ticket,
  CreditCard,
  Droplet,
  Car,
  User,
  History,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
  Check,
  Info,
  XCircle,
  Eye,
  DollarSign,
  LayoutGrid,
  Table } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalHeader } from '@/components/ui/modal-header';
import { TableFooter } from './TableFooter';
// --- Types ---
type CouponType = 'Carte de remplissage' | 'Carnet de remplissage';
type CouponStatus = 'Libre' | 'Affecté' | 'Partiellement affecté';
interface Coupon {
  id: string;
  reference: string;
  type: CouponType;
  status: CouponStatus;
  couponsAffectes: number;
  soldeNonAffecte: number;
  soldeAffecte: number;
  soldeTotal: number;
  montantTotal: number;
  vehicule: string;
  fournisseur: string;
  dateExpiration: string;
  citerne: string;
  unite: 'L' | 'TND';
  departement?: string;
  nombreBons?: number;
  bonsRestants?: number;
  soldeBon?: number;
}
interface AssignmentHistory {
  id: string;
  date: string;
  action: 'Affectation' | 'Alimentation' | 'Création' | 'Annulation';
  driver?: string;
  vehicle?: string;
  amount: number;
  unite: 'L' | 'TND';
  couponId: string;
}
type ToastType = 'success' | 'error' | 'info';
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}
// --- Mock Data ---
const INITIAL_COUPONS: Coupon[] = [
{
  id: '1',
  reference: 'CRT-2024-001',
  type: 'Carte de remplissage',
  status: 'Partiellement affecté',
  couponsAffectes: 2,
  soldeNonAffecte: 150,
  soldeAffecte: 350,
  soldeTotal: 500,
  montantTotal: 1250,
  vehicule: 'Multiples',
  fournisseur: 'Agil',
  dateExpiration: '2024-12-31',
  citerne: 'Dépôt Central',
  unite: 'L',
  departement: 'Transport'
},
{
  id: '2',
  reference: 'CRT-2024-002',
  type: 'Carte de remplissage',
  status: 'Libre',
  couponsAffectes: 0,
  soldeNonAffecte: 1000,
  soldeAffecte: 0,
  soldeTotal: 1000,
  montantTotal: 2500,
  vehicule: '-',
  fournisseur: 'Total',
  dateExpiration: '2025-06-30',
  citerne: 'Dépôt Sud',
  unite: 'TND',
  departement: 'Logistique'
},
{
  id: '3',
  reference: 'CAR-2024-001',
  type: 'Carnet de remplissage',
  status: 'Affecté',
  couponsAffectes: 50,
  soldeNonAffecte: 0,
  soldeAffecte: 1000,
  soldeTotal: 1000,
  montantTotal: 1000,
  vehicule: '8125 TU 226',
  fournisseur: 'Shell',
  dateExpiration: '2024-12-31',
  citerne: 'Dépôt Nord',
  unite: 'TND',
  departement: 'Transport',
  nombreBons: 50,
  bonsRestants: 0,
  soldeBon: 20
},
{
  id: '4',
  reference: 'CAR-2024-002',
  type: 'Carnet de remplissage',
  status: 'Partiellement affecté',
  couponsAffectes: 10,
  soldeNonAffecte: 400,
  soldeAffecte: 100,
  soldeTotal: 500,
  montantTotal: 500,
  vehicule: 'Multiples',
  fournisseur: 'Agil',
  dateExpiration: '2025-03-31',
  citerne: 'Dépôt Central',
  unite: 'TND',
  departement: 'Direction',
  nombreBons: 50,
  bonsRestants: 40,
  soldeBon: 10
},
{
  id: '5',
  reference: 'CRT-2024-003',
  type: 'Carte de remplissage',
  status: 'Affecté',
  couponsAffectes: 1,
  soldeNonAffecte: 0,
  soldeAffecte: 200,
  soldeTotal: 200,
  montantTotal: 500,
  vehicule: '4521 RS 112',
  fournisseur: 'Total',
  dateExpiration: '2024-12-31',
  citerne: 'Dépôt Sud',
  unite: 'L',
  departement: 'Transport'
}];

const INITIAL_HISTORY: AssignmentHistory[] = [
{
  id: '1',
  date: '15/03/2024 08:30',
  action: 'Affectation',
  driver: 'Jean Dupont',
  vehicle: '8125 TU 226',
  amount: 150,
  unite: 'L',
  couponId: '1'
},
{
  id: '2',
  date: '10/03/2024 14:15',
  action: 'Affectation',
  driver: 'Marie Martin',
  vehicle: '4521 RS 112',
  amount: 200,
  unite: 'L',
  couponId: '1'
},
{
  id: '3',
  date: '05/03/2024 09:00',
  action: 'Création',
  driver: '-',
  vehicle: '-',
  amount: 500,
  unite: 'L',
  couponId: '1'
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
function StatusBadge({ status }: {status: CouponStatus;}) {
  switch (status) {
    case 'Libre':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Libre
        </span>);

    case 'Affecté':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Affecté
        </span>);

    case 'Partiellement affecté':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Partiellement affecté
        </span>);

  }
}
// --- Toast Component ---
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
// --- Alimentation (Recharge) Modal ---
function AlimentationModal({
  isOpen,
  onClose,
  onRecharge,
  coupon





}: {isOpen: boolean;onClose: () => void;onRecharge: (amount: number) => void;coupon: Coupon | null;}) {
  const [amount, setAmount] = useState('');
  useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
  }, [isOpen]);
  if (!isOpen || !coupon || coupon.type !== 'Carte de remplissage') return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rechargeAmount = parseFloat(amount);
    if (rechargeAmount > 0) {
      onRecharge(rechargeAmount);
      onClose();
    }
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
            title="Nouvelle alimentation"
            icon={<DollarSign className="w-5 h-5 text-primary-foreground shrink-0" />}
            onClose={onClose}
          />

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
              <p className="text-sm text-sky-800 font-medium mb-1">
                Carte: <span className="font-bold">{coupon.reference}</span>
              </p>
              <p className="text-sm text-sky-800">
                Solde actuel:{' '}
                <span className="font-bold">
                  {coupon.soldeTotal} {coupon.unite}
                </span>
              </p>
            </div>

            <FloatingLabelInput
              label={`Montant à ajouter (${coupon.unite})`}
              type="number"
              value={amount}
              onChange={setAmount}
              required />
            

            {amount && parseFloat(amount) > 0 &&
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <p className="text-sm text-emerald-800">
                  Nouveau solde total:{' '}
                  <span className="font-bold">
                    {coupon.soldeTotal + parseFloat(amount)} {coupon.unite}
                  </span>
                </p>
              </div>
            }

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                
                Annuler
              </button>
              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors shadow-sm">
                
                Ajouter l'alimentation
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Updated AddEditCouponModal with 3 steps ---
function AddEditCouponModal({
  isOpen,
  onClose,
  onSave,
  initialData = null





}: {isOpen: boolean;onClose: () => void;onSave: (data: any) => void;initialData?: Coupon | null;}) {
  const isEdit = !!initialData;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<CouponType>('Carte de remplissage');
  // Carte Form State
  const [carteRef, setCarteRef] = useState('');
  const [carteExp, setCarteExp] = useState('');
  const [carteSolde, setCarteSolde] = useState('');
  const [carteUnite, setCarteUnite] = useState<'L' | 'TND'>('L');
  const [carteFournisseur, setCarteFournisseur] = useState('');
  const [carteDept, setCarteDept] = useState('');
  // Carnet Form State
  const [carnetRef, setCarnetRef] = useState('');
  const [carnetNombreBons, setCarnetNombreBons] = useState('');
  const [carnetSoldeBon, setCarnetSoldeBon] = useState('');
  const [carnetExp, setCarnetExp] = useState('');
  const [carnetFournisseur, setCarnetFournisseur] = useState('');
  const [carnetDept, setCarnetDept] = useState('');
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setStep(2); // Skip type selection on edit
        if (initialData.type === 'Carte de remplissage') {
          setCarteRef(initialData.reference);
          setCarteExp(initialData.dateExpiration);
          setCarteSolde(initialData.soldeTotal.toString());
          setCarteUnite(initialData.unite);
          setCarteFournisseur(initialData.fournisseur);
          setCarteDept(initialData.departement || '');
        } else {
          setCarnetRef(initialData.reference);
          setCarnetNombreBons(initialData.nombreBons?.toString() || '');
          setCarnetSoldeBon(initialData.soldeBon?.toString() || '');
          setCarnetExp('-');
          setCarnetFournisseur('-');
          setCarnetDept('');
        }
      } else {
        setStep(1);
        setCarteRef('');
        setCarteExp('');
        setCarteSolde('');
        setCarteFournisseur('');
        setCarteDept('');
        setCarnetRef('');
        setCarnetNombreBons('');
        setCarnetSoldeBon('');
        setCarnetExp('-');
        setCarnetFournisseur('-');
        setCarnetDept('');
      }
    }
  }, [isOpen, initialData]);
  if (!isOpen) return null;
  const handleNext = () => {
    if (step === 1) setStep(2);else
    if (step === 2 && type === 'Carte de remplissage') setStep(3);
  };
  const handleBack = () => {
    if (step === 3) setStep(2);else
    if (step === 2) setStep(1);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newCoupon: Partial<Coupon> = {
      type,
      status: 'Libre',
      couponsAffectes: 0,
      soldeAffecte: 0,
      vehicule: '-',
      citerne: 'Dépôt Central'
    };
    if (type === 'Carte de remplissage') {
      const solde = parseFloat(carteSolde);
      newCoupon = {
        ...newCoupon,
        reference: carteRef,
        dateExpiration: carteExp,
        soldeTotal: solde,
        soldeNonAffecte: solde,
        montantTotal: carteUnite === 'L' ? solde * 2.5 : solde,
        unite: carteUnite,
        fournisseur: carteFournisseur || 'Non spécifié',
        departement: carteDept || undefined
      };
    } else {
      const nombreBons = parseInt(carnetNombreBons);
      const soldeBon = parseFloat(carnetSoldeBon);
      const totalSolde = nombreBons * soldeBon;
      newCoupon = {
        ...newCoupon,
        reference: carnetRef,
        dateExpiration: '-',
        soldeTotal: totalSolde,
        soldeNonAffecte: totalSolde,
        montantTotal: totalSolde,
        unite: 'TND',
        fournisseur: '-',
        departement: undefined,
        nombreBons,
        bonsRestants: nombreBons,
        soldeBon
      };
    }
    if (isEdit && initialData) {
      newCoupon.id = initialData.id;
      newCoupon.status = initialData.status;
      newCoupon.soldeAffecte = initialData.soldeAffecte;
      newCoupon.soldeNonAffecte =
      newCoupon.soldeTotal! - initialData.soldeAffecte;
      newCoupon.couponsAffectes = initialData.couponsAffectes;
      if (type === 'Carnet de remplissage') {
        newCoupon.bonsRestants = initialData.bonsRestants;
      }
    } else {
      newCoupon.id = `new-${Date.now()}`;
    }
    onSave(newCoupon);
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
            title={isEdit ? 'Modifier le coupon' : 'Ajouter un coupon'}
            onClose={onClose}
          >
            {!isEdit && (
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
                <div
                  className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
                {type === 'Carte de remplissage' && (
                  <div
                    className={`h-1.5 w-8 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`} />
                )}
                <span className="text-xs text-primary-foreground/80 ml-2 font-medium">
                  Étape {step} sur {type === 'Carte de remplissage' ? 3 : 2}
                </span>
              </div>
            )}
          </ModalHeader>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Step 1: Type Selection */}
            {step === 1 && !isEdit ?
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Choisissez le type de coupon
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <button
                  type="button"
                  onClick={() => setType('Carte de remplissage')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${type === 'Carte de remplissage' ? 'border-[#0ea5e9] bg-sky-50 shadow-md' : 'border-slate-200 hover:border-sky-200 hover:bg-slate-50'}`}>
                  
                    <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'Carte de remplissage' ? 'bg-[#0ea5e9] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <h4
                    className={`font-bold text-lg mb-2 ${type === 'Carte de remplissage' ? 'text-[#0ea5e9]' : 'text-slate-700'}`}>
                    
                      Carte de remplissage
                    </h4>
                    <p className="text-sm text-slate-500">
                      Carte avec un solde global (en litres ou dinars) pouvant
                      être divisé et affecté à plusieurs véhicules.
                    </p>
                  </button>

                  <button
                  type="button"
                  onClick={() => setType('Carnet de remplissage')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${type === 'Carnet de remplissage' ? 'border-[#0ea5e9] bg-sky-50 shadow-md' : 'border-slate-200 hover:border-sky-200 hover:bg-slate-50'}`}>
                  
                    <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'Carnet de remplissage' ? 'bg-[#0ea5e9] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    
                      <Ticket className="w-6 h-6" />
                    </div>
                    <h4
                    className={`font-bold text-lg mb-2 ${type === 'Carnet de remplissage' ? 'text-[#0ea5e9]' : 'text-slate-700'}`}>
                    
                      Carnet de remplissage
                    </h4>
                    <p className="text-sm text-slate-500">
                      Carnet contenant plusieurs bons avec un solde fixe par
                      bon, affectables individuellement.
                    </p>
                  </button>
                </div>
              </div> :
            step === 2 ||
            isEdit &&
            type ===
            'Carnet de remplissage' /* Step 2: Basic Details */ ?
            <form
              id="add-coupon-form"
              onSubmit={
              type === 'Carnet de remplissage' || isEdit ?
              handleSubmit :
              undefined
              }
              className="space-y-6">
              
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {type === 'Carte de remplissage' ?
                <CreditCard className="w-5 h-5 text-[#0ea5e9]" /> :

                <Ticket className="w-5 h-5 text-[#0ea5e9]" />
                }
                  Détails : {type}
                </h3>

                {type === 'Carte de remplissage' ?
              <div className="space-y-5">
                    <FloatingLabelInput
                  label="Référence de la carte"
                  value={carteRef}
                  onChange={setCarteRef}
                  required />
                

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <FloatingLabelInput
                      label="Solde de la carte"
                      type="number"
                      value={carteSolde}
                      onChange={setCarteSolde}
                      required
                      disabled={isEdit} />
                    
                      </div>
                      <div className="w-32 relative">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                          Unité
                        </label>
                        <select
                      value={carteUnite}
                      onChange={(e) =>
                      setCarteUnite(e.target.value as 'L' | 'TND')
                      }
                      disabled={isEdit}
                      className={`w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700 font-medium ${isEdit ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}>
                      
                          <option value="L">Litres (L)</option>
                          <option value="TND">Dinars (TND)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {!isEdit &&
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 mt-4">
                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                          Après la création, vous pourrez diviser ce solde et
                          l'affecter à différents chauffeurs ou véhicules depuis
                          le tableau principal.
                        </p>
                      </div>
                }
                  </div> :

              <div className="space-y-5">
                    <FloatingLabelInput
                  label="Référence du carnet"
                  value={carnetRef}
                  onChange={setCarnetRef}
                  required
                  disabled={isEdit} />
                

                    <FloatingLabelInput
                  label="Nombre de bons dans le carnet"
                  type="number"
                  value={carnetNombreBons}
                  onChange={setCarnetNombreBons}
                  required
                  disabled={isEdit} />
                

                    <FloatingLabelInput
                  label="Solde de chaque bon (TND)"
                  type="number"
                  value={carnetSoldeBon}
                  onChange={setCarnetSoldeBon}
                  required
                  disabled={isEdit} />
                

                    <FloatingLabelInput
                  label="Date d'expiration"
                  type="date"
                  value={carnetExp}
                  onChange={setCarnetExp}
                  required />
                

                    <FloatingLabelInput
                  label="Fournisseur"
                  value={carnetFournisseur}
                  onChange={setCarnetFournisseur} />
                

                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        Département
                      </label>
                      <select
                    value={carnetDept}
                    onChange={(e) => setCarnetDept(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                    
                        <option value="">Sélectionner...</option>
                        <option value="Transport">Transport</option>
                        <option value="Logistique">Logistique</option>
                        <option value="Direction">Direction</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
              }
              </form> :
            type === 'Carte de remplissage' && (
            step === 3 ||
            isEdit) /* Step 3: Expiration, Department & Supplier */ ?
            <form
              id="add-coupon-form"
              onSubmit={handleSubmit}
              className="space-y-6">
              
                <h3 className="text-lg font-bold text-slate-800">
                  Informations complémentaires
                </h3>

                <div className="relative">
                  <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                    Date d'expiration *
                  </label>
                  <input
                  type="date"
                  value={
                  type === 'Carte de remplissage' ? carteExp : carnetExp
                  }
                  onChange={(e) =>
                  type === 'Carte de remplissage' ?
                  setCarteExp(e.target.value) :
                  setCarnetExp(e.target.value)
                  }
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 bg-white" />
                
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                      Département
                    </label>
                    <select
                    value={
                    type === 'Carte de remplissage' ? carteDept : carnetDept
                    }
                    onChange={(e) =>
                    type === 'Carte de remplissage' ?
                    setCarteDept(e.target.value) :
                    setCarnetDept(e.target.value)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                    
                      <option value="">Sélectionner...</option>
                      <option value="Transport">Transport</option>
                      <option value="Logistique">Logistique</option>
                      <option value="Direction">Direction</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <FloatingLabelInput
                  label="Fournisseur"
                  value={
                  type === 'Carte de remplissage' ?
                  carteFournisseur :
                  carnetFournisseur
                  }
                  onChange={(v) =>
                  type === 'Carte de remplissage' ?
                  setCarteFournisseur(v) :
                  setCarnetFournisseur(v)
                  } />
                
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">
                    Ces informations permettent une meilleure organisation et
                    traçabilité de vos coupons.
                  </p>
                </div>
              </form> :
            null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            {(step === 2 || step === 3) && !isEdit ?
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

            {step === 1 && !isEdit ?
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
                Suivant
                <ArrowRight className="w-4 h-4" />
              </button> :
            step === 2 && !isEdit && type === 'Carte de remplissage' ?
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
                Suivant
                <ArrowRight className="w-4 h-4" />
              </button> :

            <button
              type="submit"
              form="add-coupon-form"
              className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
                <CheckCircle className="w-4 h-4" />
                {isEdit ?
              'Enregistrer les modifications' :
              `Créer le ${type === 'Carte de remplissage' ? 'carte' : 'carnet'}`}
              </button>
            }
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  couponRef





}: {isOpen: boolean;onClose: () => void;onConfirm: () => void;couponRef: string;}) {
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
          
          <ModalHeader title="Supprimer le coupon ?" onClose={onClose} />
          <div className="p-6 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <p className="text-slate-500 mb-6">
            Êtes-vous sûr de vouloir supprimer le coupon{' '}
            <span className="font-bold text-slate-700">{couponRef}</span> ?
            Cette action est irréversible.
          </p>
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
              className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold transition-colors shadow-sm">
              
              Supprimer
            </button>
          </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function AssignCouponModal({
  isOpen,
  onClose,
  onAssign,
  coupon,
  bon






}: {isOpen: boolean;onClose: () => void;onAssign: (data: any) => void;coupon: Coupon | null;bon?: any | null;}) {
  const [driver, setDriver] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [amount, setAmount] = useState('');
  useEffect(() => {
    if (isOpen) {
      setDriver('');
      setVehicle('');
      if (bon) {
        setAmount(bon.amount.toString());
      } else {
        setAmount('');
      }
    }
  }, [isOpen, bon]);
  if (!isOpen || !coupon) return null;
  const maxAmount = bon ? bon.amount : coupon.soldeNonAffecte;
  const isCarnet = coupon.type === 'Carnet de remplissage';
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign({
      driver,
      vehicle,
      amount: parseFloat(amount),
      couponId: coupon.id,
      bonId: bon?.id
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
          
          <ModalHeader
            title="Affecter un solde"
            onClose={onClose}
          />

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="bg-sky-50 p-4 rounded-lg border border-sky-100 mb-2">
              <p className="text-sm text-sky-800 font-medium mb-1">
                Réf:{' '}
                <span className="font-bold">
                  {bon ? bon.bonNumber : coupon.reference}
                </span>
              </p>
              <p className="text-sm text-sky-800">
                Solde disponible:{' '}
                <span className="font-bold">
                  {maxAmount} {coupon.unite}
                </span>
              </p>
            </div>

            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                Chauffeur
              </label>
              <select
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                
                <option value="">Sélectionner un chauffeur...</option>
                <option value="Jean Dupont">Jean Dupont</option>
                <option value="Marie Martin">Marie Martin</option>
                <option value="Pierre Durand">Pierre Durand</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                Véhicule
              </label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                
                <option value="">Sélectionner un véhicule...</option>
                <option value="8125 TU 226">8125 TU 226</option>
                <option value="4521 RS 112">4521 RS 112</option>
                <option value="1234 TN 56">1234 TN 56</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <FloatingLabelInput
              label={`Montant à affecter (${coupon.unite})`}
              type="number"
              value={amount}
              onChange={setAmount}
              required
              disabled={!!bon} // If it's a bon, amount is fixed
              max={maxAmount} />
            

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                
                Annuler
              </button>
              <button
                type="submit"
                disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > maxAmount ||
                !driver && !vehicle
                }
                className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors shadow-sm">
                
                Affecter
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function EditAssignmentModal({
  isOpen,
  onClose,
  onSave,
  row





}: {isOpen: boolean;onClose: () => void;onSave: (rowId: string, newDriver: string, newVehicle: string) => void;row: AssignmentHistory | null;}) {
  const [driver, setDriver] = useState('');
  const [vehicle, setVehicle] = useState('');
  useEffect(() => {
    if (isOpen && row) {
      setDriver(row.driver || '');
      setVehicle(row.vehicle || '');
    }
  }, [isOpen, row]);
  if (!isOpen || !row) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(row.id, driver, vehicle);
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          
          <ModalHeader
            title="Modifier l'affectation"
            icon={<Edit className="w-5 h-5 text-primary-foreground shrink-0" />}
            onClose={onClose}
          />

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Read-only info */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Date</span>
                <span className="text-sm font-bold text-slate-800 font-mono">
                  {row.date}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Montant</span>
                <span className="text-sm font-bold text-slate-800">
                  {row.amount} {row.unite}
                </span>
              </div>
            </div>

            {/* Editable fields */}
            <FloatingLabelInput
              label="Chauffeur"
              value={driver}
              onChange={setDriver}
              required />
            

            <FloatingLabelInput
              label="Véhicule"
              value={vehicle}
              onChange={setVehicle}
              required />
            

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
                
                Enregistrer
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function CarnetSummaryModal({
  isOpen,
  onClose,
  coupon,
  onAssignBons,
  history,
  onModifyAssignment,
  onCancelAssignment












}: {isOpen: boolean;onClose: () => void;coupon: Coupon | null;onAssignBons: () => void;history: AssignmentHistory[];onModifyAssignment: (rowId: string, newDriver: string, newVehicle: string) => void;onCancelAssignment: (row: AssignmentHistory) => void;}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRow, setEditingRow] = useState<AssignmentHistory | null>(null);
  if (!isOpen || !coupon || coupon.type !== 'Carnet de remplissage') return null;
  const couponHistory = history.filter((h) => h.couponId === coupon.id);
  const totalItems = couponHistory.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = couponHistory.slice(
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title={`Carnet: ${coupon.reference}`}
            icon={<Ticket className="w-5 h-5 text-primary-foreground shrink-0" />}
            onClose={onClose}
            actions={
              <button
                onClick={onAssignBons}
                disabled={coupon.bonsRestants === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-primary-foreground rounded-lg text-sm font-bold transition-colors">
                <Droplet className="w-4 h-4" />
                Affecter des bons
              </button>
            }
          />

          <div className="flex-1 overflow-auto px-4 py-4 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Total bons
                </p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {coupon.nombreBons}
                </h3>
              </div>
              <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
                <p className="text-sm font-medium text-emerald-600 mb-1">
                  Bons restants
                </p>
                <h3 className="text-2xl font-bold text-emerald-700">
                  {coupon.bonsRestants}
                </h3>
              </div>
              <div className="bg-sky-50 rounded-xl border border-sky-100 p-4">
                <p className="text-sm font-medium text-sky-600 mb-1">
                  Valeur par bon
                </p>
                <h3 className="text-2xl font-bold text-sky-700">
                  {coupon.soldeBon} {coupon.unite}
                </h3>
              </div>
              <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                <p className="text-sm font-medium text-amber-600 mb-1">
                  Valeur totale
                </p>
                <h3 className="text-2xl font-bold text-amber-700">
                  {coupon.soldeTotal} {coupon.unite}
                </h3>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">
                  Progression des affectations
                </span>
                <span className="text-sm font-bold text-[#0ea5e9]">
                  {(() => {
                    const progressPercentage = coupon.nombreBons ?
                    (coupon.nombreBons - (coupon.bonsRestants || 0)) /
                    coupon.nombreBons *
                    100 :
                    0;
                    return progressPercentage.toFixed(0);
                  })()}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div
                  className="bg-[#0ea5e9] h-3 rounded-full transition-all"
                  style={{
                    width: `${coupon.nombreBons ? (coupon.nombreBons - (coupon.bonsRestants || 0)) / coupon.nombreBons * 100 : 0}%`
                  }} />
                
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
                <span>
                  {(coupon.nombreBons || 0) - (coupon.bonsRestants || 0)}{' '}
                  affectés
                </span>
                <span>{coupon.bonsRestants} restants</span>
              </div>
            </div>

            {/* History Table */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Historique d'affectation
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Chauffeur
                      </th>
                      <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Véhicule
                      </th>
                      <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Montant
                      </th>
                      <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedHistory.length === 0 ?
                    <tr>
                        <td
                        colSpan={5}
                        className="py-8 text-center text-slate-500">
                        
                          Aucun historique trouvé.
                        </td>
                      </tr> :

                    paginatedHistory.map((row) =>
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors">
                      
                          <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                            {row.date}
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-800 font-medium">
                            <div className="flex items-center gap-2">
                              {row.driver !== '-' &&
                          <User className="w-3.5 h-3.5 text-[#0ea5e9]" />
                          }
                              {row.driver}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-slate-800 font-medium">
                            <div className="flex items-center gap-2">
                              {row.vehicle !== '-' &&
                          <Car className="w-3.5 h-3.5 text-[#0ea5e9]" />
                          }
                              {row.vehicle}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-slate-800 text-right">
                            {row.amount} {row.unite}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {row.action === 'Affectation' ?
                        <div className="flex items-center justify-end gap-2">
                                <button
                            onClick={() => {
                              setEditingRow(row);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier">
                            
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                            onClick={() => onCancelAssignment(row)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Annuler l'affectation">
                            
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div> :
                        null}
                          </td>
                        </tr>
                    )
                    }
                  </tbody>
                </table>
              </div>
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

      {/* Edit Assignment Popup Modal */}
      <EditAssignmentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingRow(null);
        }}
        onSave={onModifyAssignment}
        row={editingRow} />
      
    </AnimatePresence>);

}
function CarnetAssignModal({
  isOpen,
  onClose,
  onAssign,
  coupon









}: {isOpen: boolean;onClose: () => void;onAssign: (data: {driver: string;vehicle: string;nombreBons: number;}) => void;coupon: Coupon | null;}) {
  const [driver, setDriver] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [nombreBons, setNombreBons] = useState('');
  useEffect(() => {
    if (isOpen) {
      setDriver('');
      setVehicle('');
      setNombreBons('');
    }
  }, [isOpen]);
  if (!isOpen || !coupon || coupon.type !== 'Carnet de remplissage') return null;
  const maxBons = coupon.bonsRestants || 0;
  const parsedNombreBons = parseInt(nombreBons) || 0;
  const totalValue = parsedNombreBons * (coupon.soldeBon || 0);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign({
      driver,
      vehicle,
      nombreBons: parsedNombreBons
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
          
          <ModalHeader
            title="Affecter des bons"
            onClose={onClose}
          />

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="bg-sky-50 p-4 rounded-lg border border-sky-100 mb-2">
              <p className="text-sm text-sky-800 font-medium mb-1">
                Carnet: <span className="font-bold">{coupon.reference}</span>
              </p>
              <p className="text-sm text-sky-800">
                Bons restants: <span className="font-bold">{maxBons}</span>
              </p>
            </div>

            <FloatingLabelInput
              label="Nombre de bons à affecter"
              type="number"
              value={nombreBons}
              onChange={setNombreBons}
              required
              max={maxBons} />
            

            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                Chauffeur
              </label>
              <select
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                
                <option value="">Sélectionner un chauffeur...</option>
                <option value="Jean Dupont">Jean Dupont</option>
                <option value="Marie Martin">Marie Martin</option>
                <option value="Pierre Durand">Pierre Durand</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                Véhicule
              </label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                
                <option value="">Sélectionner un véhicule...</option>
                <option value="8125 TU 226">8125 TU 226</option>
                <option value="4521 RS 112">4521 RS 112</option>
                <option value="1234 TN 56">1234 TN 56</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {parsedNombreBons > 0 && parsedNombreBons <= maxBons &&
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">
                  Valeur totale affectée:{' '}
                  <span className="font-bold">
                    {totalValue} {coupon.unite}
                  </span>
                </p>
              </div>
            }

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                
                Annuler
              </button>
              <button
                type="submit"
                disabled={
                !driver && !vehicle ||
                parsedNombreBons <= 0 ||
                parsedNombreBons > maxBons
                }
                className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors shadow-sm">
                
                Affecter
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function HistoryModal({
  isOpen,
  onClose,
  coupon,
  history





}: {isOpen: boolean;onClose: () => void;coupon: Coupon | null;history: AssignmentHistory[];}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  if (!isOpen || !coupon) return null;
  const couponHistory = history.filter((h) => h.couponId === coupon.id);
  const totalItems = couponHistory.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = couponHistory.slice(
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
            title="Historique d'affectation"
            subtitle={`Référence: ${coupon.reference}`}
            onClose={onClose}
          />

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Date
                  </th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Action
                  </th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Chauffeur
                  </th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Véhicule
                  </th>
                  <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedHistory.length === 0 ?
                <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Aucun historique trouvé.
                    </td>
                  </tr> :

                paginatedHistory.map((row) =>
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors">
                  
                      <td className="py-4 px-6 text-sm text-slate-600 font-mono text-center">
                        {row.date}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${row.action === 'Affectation' ? 'bg-blue-50 text-blue-700' : row.action === 'Annulation' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      
                          {row.action}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-800 font-medium text-center">
                        <div className="flex items-center justify-center gap-2">
                          {row.driver !== '-' &&
                      <User className="w-3.5 h-3.5 text-[#0ea5e9]" />
                      }
                          {row.driver}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-800 font-medium text-center">
                        <div className="flex items-center justify-center gap-2">
                          {row.vehicle !== '-' &&
                      <Car className="w-3.5 h-3.5 text-[#0ea5e9]" />
                      }
                          {row.vehicle}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-800 text-center">
                        {row.amount} {row.unite}
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
function CarteSummaryModal({
  isOpen,
  onClose,
  coupon,
  onRecharge,
  onAssign,
  history,
  onModifyAssignment,
  onCancelAssignment













}: {isOpen: boolean;onClose: () => void;coupon: Coupon | null;onRecharge: (amount: number) => void;onAssign: (data: any) => void;history: AssignmentHistory[];onModifyAssignment: (rowId: string, newDriver: string, newVehicle: string) => void;onCancelAssignment: (row: AssignmentHistory) => void;}) {
  const [activeTab, setActiveTab] = useState<
    'statistiques' | 'alimentation' | 'affectation' | 'historique'>(
    'statistiques');
  // Alimentation state
  const [rechargeAmount, setRechargeAmount] = useState('');
  // Affectation state
  const [assignDriver, setAssignDriver] = useState('');
  const [assignVehicle, setAssignVehicle] = useState('');
  const [assignAmount, setAssignAmount] = useState('');
  // Historique state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRow, setEditingRow] = useState<AssignmentHistory | null>(null);
  useEffect(() => {
    if (isOpen) {
      setActiveTab('statistiques');
      setRechargeAmount('');
      setAssignDriver('');
      setAssignVehicle('');
      setAssignAmount('');
      setCurrentPage(1);
    }
  }, [isOpen]);
  if (!isOpen || !coupon || coupon.type !== 'Carte de remplissage') return null;
  const couponHistory = history.filter((h) => h.couponId === coupon.id);
  const totalItems = couponHistory.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = couponHistory.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);
    if (amount > 0) {
      onRecharge(amount);
      setRechargeAmount('');
      setActiveTab('statistiques');
    }
  };
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign({
      driver: assignDriver,
      vehicle: assignVehicle,
      amount: parseFloat(assignAmount),
      couponId: coupon.id
    });
    setAssignDriver('');
    setAssignVehicle('');
    setAssignAmount('');
    setActiveTab('statistiques');
  };
  const progressPercentage =
  coupon.soldeTotal > 0 ? coupon.soldeAffecte / coupon.soldeTotal * 100 : 0;
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
            title={`Carte: ${coupon.reference}`}
            icon={<CreditCard className="w-5 h-5 text-primary-foreground shrink-0" />}
            onClose={onClose}
          />

          {/* Tabs */}
          <div className="bg-white border-b border-slate-200 px-4 flex-shrink-0">
            <div className="flex gap-6">
              {[
              {
                id: 'statistiques',
                label: 'Statistiques'
              },
              {
                id: 'alimentation',
                label: 'Alimentation'
              },
              {
                id: 'affectation',
                label: 'Affectation'
              },
              {
                id: 'historique',
                label: 'Historique'
              }].
              map((tab) =>
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                
                  {tab.label}
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-4 py-4 bg-slate-50">
            <AnimatePresence mode="wait">
              {activeTab === 'statistiques' &&
              <motion.div
                key="statistiques"
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -10
                }}
                className="space-y-6">
                
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        Solde Total
                      </p>
                      <h3 className="text-2xl font-bold text-slate-800">
                        {coupon.soldeTotal}{' '}
                        <span className="text-sm text-slate-500">
                          {coupon.unite}
                        </span>
                      </h3>
                    </div>
                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 shadow-sm">
                      <p className="text-sm font-medium text-blue-600 mb-1">
                        Solde Affecté
                      </p>
                      <h3 className="text-2xl font-bold text-blue-700">
                        {coupon.soldeAffecte}{' '}
                        <span className="text-sm text-blue-500">
                          {coupon.unite}
                        </span>
                      </h3>
                    </div>
                    <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 shadow-sm">
                      <p className="text-sm font-medium text-emerald-600 mb-1">
                        Solde Non Affecté
                      </p>
                      <h3 className="text-2xl font-bold text-emerald-700">
                        {coupon.soldeNonAffecte}{' '}
                        <span className="text-sm text-emerald-500">
                          {coupon.unite}
                        </span>
                      </h3>
                    </div>
                    <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 shadow-sm">
                      <p className="text-sm font-medium text-amber-600 mb-1">
                        Nombre d'Affectations
                      </p>
                      <h3 className="text-2xl font-bold text-amber-700">
                        {coupon.couponsAffectes}
                      </h3>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-700">
                        Progression des affectations
                      </span>
                      <span className="text-sm font-bold text-[#0ea5e9]">
                        {progressPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                      className="bg-[#0ea5e9] h-3 rounded-full transition-all"
                      style={{
                        width: `${progressPercentage}%`
                      }} />
                    
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
                      <span>
                        {coupon.soldeAffecte} {coupon.unite} affectés
                      </span>
                      <span>
                        {coupon.soldeNonAffecte} {coupon.unite} restants
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">
                      Informations de la carte
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Fournisseur
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {coupon.fournisseur}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Date d'expiration
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {coupon.dateExpiration}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Unité</p>
                        <p className="text-sm font-medium text-slate-800">
                          {coupon.unite === 'L' ? 'Litres (L)' : 'Dinars (TND)'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Département
                        </p>
                        <p className="text-sm font-medium text-slate-800">
                          {coupon.departement || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              }

              {activeTab === 'alimentation' &&
              <motion.div
                key="alimentation"
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -10
                }}
                className="max-w-xl mx-auto">
                
                  <form
                  onSubmit={handleRechargeSubmit}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                  
                    <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                      <p className="text-sm text-sky-800 font-medium mb-1">
                        Carte:{' '}
                        <span className="font-bold">{coupon.reference}</span>
                      </p>
                      <p className="text-sm text-sky-800">
                        Solde actuel:{' '}
                        <span className="font-bold">
                          {coupon.soldeTotal} {coupon.unite}
                        </span>
                      </p>
                    </div>

                    <FloatingLabelInput
                    label={`Montant à ajouter (${coupon.unite})`}
                    type="number"
                    value={rechargeAmount}
                    onChange={setRechargeAmount}
                    required />
                  

                    {rechargeAmount && parseFloat(rechargeAmount) > 0 &&
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                        <p className="text-sm text-emerald-800">
                          Nouveau solde total:{' '}
                          <span className="font-bold">
                            {coupon.soldeTotal + parseFloat(rechargeAmount)}{' '}
                            {coupon.unite}
                          </span>
                        </p>
                      </div>
                  }

                    <div className="pt-4 flex justify-end">
                      <button
                      type="submit"
                      disabled={
                      !rechargeAmount || parseFloat(rechargeAmount) <= 0
                      }
                      className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors shadow-sm">
                      
                        Ajouter l'alimentation
                      </button>
                    </div>
                  </form>
                </motion.div>
              }

              {activeTab === 'affectation' &&
              <motion.div
                key="affectation"
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -10
                }}
                className="max-w-xl mx-auto">
                
                  <form
                  onSubmit={handleAssignSubmit}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
                  
                    <div className="bg-sky-50 p-4 rounded-lg border border-sky-100 mb-2">
                      <p className="text-sm text-sky-800 font-medium mb-1">
                        Réf:{' '}
                        <span className="font-bold">{coupon.reference}</span>
                      </p>
                      <p className="text-sm text-sky-800">
                        Solde disponible:{' '}
                        <span className="font-bold">
                          {coupon.soldeNonAffecte} {coupon.unite}
                        </span>
                      </p>
                    </div>

                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        Chauffeur
                      </label>
                      <select
                      value={assignDriver}
                      onChange={(e) => setAssignDriver(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                      
                        <option value="">Sélectionner un chauffeur...</option>
                        <option value="Jean Dupont">Jean Dupont</option>
                        <option value="Marie Martin">Marie Martin</option>
                        <option value="Pierre Durand">Pierre Durand</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        Véhicule
                      </label>
                      <select
                      value={assignVehicle}
                      onChange={(e) => setAssignVehicle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none bg-white text-slate-700">
                      
                        <option value="">Sélectionner un véhicule...</option>
                        <option value="8125 TU 226">8125 TU 226</option>
                        <option value="4521 RS 112">4521 RS 112</option>
                        <option value="1234 TN 56">1234 TN 56</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    <FloatingLabelInput
                    label={`Montant à affecter (${coupon.unite})`}
                    type="number"
                    value={assignAmount}
                    onChange={setAssignAmount}
                    required
                    max={coupon.soldeNonAffecte} />
                  

                    <div className="pt-4 flex justify-end">
                      <button
                      type="submit"
                      disabled={
                      !assignAmount ||
                      parseFloat(assignAmount) <= 0 ||
                      parseFloat(assignAmount) > coupon.soldeNonAffecte ||
                      !assignDriver && !assignVehicle ||
                      coupon.soldeNonAffecte === 0
                      }
                      className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors shadow-sm">
                      
                        Affecter
                      </button>
                    </div>
                  </form>
                </motion.div>
              }

              {activeTab === 'historique' &&
              <motion.div
                key="historique"
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -10
                }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Chauffeur
                        </th>
                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Véhicule
                        </th>
                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                          Montant
                        </th>
                        <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedHistory.length === 0 ?
                    <tr>
                          <td
                        colSpan={6}
                        className="py-8 text-center text-slate-500">
                        
                            Aucun historique trouvé.
                          </td>
                        </tr> :

                    paginatedHistory.map((row) =>
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors">
                      
                            <td className="py-4 px-6 text-sm text-slate-600 font-mono">
                              {row.date}
                            </td>
                            <td className="py-4 px-6">
                              <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${row.action === 'Affectation' ? 'bg-blue-50 text-blue-700' : row.action === 'Annulation' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          
                                {row.action}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-800 font-medium">
                              <div className="flex items-center gap-2">
                                {row.driver !== '-' &&
                          <User className="w-3.5 h-3.5 text-[#0ea5e9]" />
                          }
                                {row.driver}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-slate-800 font-medium">
                              <div className="flex items-center gap-2">
                                {row.vehicle !== '-' &&
                          <Car className="w-3.5 h-3.5 text-[#0ea5e9]" />
                          }
                                {row.vehicle}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-slate-800 text-right">
                              {row.amount} {row.unite}
                            </td>
                            <td className="py-4 px-6 text-right">
                              {row.action === 'Affectation' ?
                        <div className="flex items-center justify-end gap-2">
                                  <button
                            onClick={() => {
                              setEditingRow(row);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier">
                            
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                            onClick={() => onCancelAssignment(row)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Annuler l'affectation">
                            
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div> :
                        null}
                            </td>
                          </tr>
                    )
                    }
                    </tbody>
                  </table>
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
              }
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      <EditAssignmentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingRow(null);
        }}
        onSave={onModifyAssignment}
        row={editingRow} />
      
    </AnimatePresence>);

}
// --- Main Component ---
export function GestionCoupons() {
  const [activeTab, setActiveTab] = useState<'carte_bon' | 'citernes'>(
    'carte_bon'
  );
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // State Management
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [history, setHistory] = useState<AssignmentHistory[]>(INITIAL_HISTORY);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCarnetSummaryModal, setShowCarnetSummaryModal] = useState(false);
  const [showCarnetAssignModal, setShowCarnetAssignModal] = useState(false);
  const [showAlimentationModal, setShowAlimentationModal] = useState(false);
  const [showCarteSummaryModal, setShowCarteSummaryModal] = useState(false);
  // Selection States
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  // Toast Helper
  const addToast = (message: string, type: ToastType = 'success') => {
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
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  // Filtering
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchSearch =
      !searchTerm ||
      coupon.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.vehicule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = !filterType || coupon.type === filterType;
      const matchStatus = !filterStatus || coupon.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [coupons, searchTerm, filterType, filterStatus]);
  // Pagination
  const totalItems = filteredCoupons.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCoupons = filteredCoupons.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  // Handlers
  const handleSaveCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
    addToast(`Coupon ${newCoupon.reference} ajouté avec succès`);
  };
  const handleUpdateCoupon = (updatedCoupon: Coupon) => {
    setCoupons((prev) =>
    prev.map((c) => c.id === updatedCoupon.id ? updatedCoupon : c)
    );
    addToast(`Coupon ${updatedCoupon.reference} modifié avec succès`);
  };
  const handleDeleteConfirm = () => {
    if (selectedCoupon) {
      setCoupons((prev) => prev.filter((c) => c.id !== selectedCoupon.id));
      addToast(`Coupon ${selectedCoupon.reference} supprimé`, 'success');
      setSelectedCoupon(null);
    }
  };
  const handleAssignSubmit = (data: {
    driver: string;
    vehicle: string;
    amount: number;
    couponId: string;
    bonId?: string;
  }) => {
    setCoupons((prev) =>
    prev.map((c) => {
      if (c.id === data.couponId) {
        let updatedCoupon = {
          ...c
        };
        // Assigning from a carte
        updatedCoupon.soldeAffecte += data.amount;
        updatedCoupon.soldeNonAffecte -= data.amount;
        updatedCoupon.couponsAffectes += 1; // Treat each assignment as 1 "coupon affecté" for simplicity
        // Update status
        if (updatedCoupon.soldeNonAffecte === 0) {
          updatedCoupon.status = 'Affecté';
        } else if (updatedCoupon.soldeAffecte > 0) {
          updatedCoupon.status = 'Partiellement affecté';
        }
        // Update vehicle display if needed (simplified)
        if (
        updatedCoupon.vehicule === '-' ||
        updatedCoupon.vehicule === 'Multiples')
        {
          updatedCoupon.vehicule =
          updatedCoupon.couponsAffectes > 1 ?
          'Multiples' :
          data.vehicle || '-';
        }
        return updatedCoupon;
      }
      return c;
    })
    );
    // Update selectedCoupon to reflect changes immediately in the modal
    setSelectedCoupon((prev) => {
      if (prev && prev.id === data.couponId) {
        let updatedCoupon = {
          ...prev
        };
        // Assigning from a carte
        updatedCoupon.soldeAffecte += data.amount;
        updatedCoupon.soldeNonAffecte -= data.amount;
        updatedCoupon.couponsAffectes += 1;
        // Update status
        if (updatedCoupon.soldeNonAffecte === 0) {
          updatedCoupon.status = 'Affecté';
        } else if (updatedCoupon.soldeAffecte > 0) {
          updatedCoupon.status = 'Partiellement affecté';
        }
        // Update vehicle display if needed
        if (
        updatedCoupon.vehicule === '-' ||
        updatedCoupon.vehicule === 'Multiples')
        {
          updatedCoupon.vehicule =
          updatedCoupon.couponsAffectes > 1 ?
          'Multiples' :
          data.vehicle || '-';
        }
        return updatedCoupon;
      }
      return prev;
    });
    // Add to history
    const newHistoryEntry: AssignmentHistory = {
      id: `hist-${Date.now()}`,
      date: new Date().toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }),
      action: 'Affectation',
      driver: data.driver || '-',
      vehicle: data.vehicle || '-',
      amount: data.amount,
      unite: selectedCoupon?.unite || 'L',
      couponId: data.couponId
    };
    setHistory((prev) => [newHistoryEntry, ...prev]);
    addToast(`Affectation de ${data.amount} ${selectedCoupon?.unite} réussie`);
  };
  const handleCarnetAssignSubmit = (data: {
    driver: string;
    vehicle: string;
    nombreBons: number;
  }) => {
    if (!selectedCoupon) return;
    const amount = data.nombreBons * (selectedCoupon.soldeBon || 0);
    setCoupons((prev) =>
    prev.map((c) => {
      if (c.id === selectedCoupon.id) {
        let updatedCoupon = {
          ...c
        };
        updatedCoupon.bonsRestants =
        (updatedCoupon.bonsRestants || 0) - data.nombreBons;
        updatedCoupon.soldeAffecte += amount;
        updatedCoupon.soldeNonAffecte -= amount;
        updatedCoupon.couponsAffectes += data.nombreBons;
        // Update status
        if (updatedCoupon.bonsRestants === 0) {
          updatedCoupon.status = 'Affecté';
        } else if (updatedCoupon.soldeAffecte > 0) {
          updatedCoupon.status = 'Partiellement affecté';
        }
        // Update vehicle display if needed
        if (
        updatedCoupon.vehicule === '-' ||
        updatedCoupon.vehicule === 'Multiples')
        {
          updatedCoupon.vehicule =
          updatedCoupon.couponsAffectes > 1 ?
          'Multiples' :
          data.vehicle || '-';
        }
        return updatedCoupon;
      }
      return c;
    })
    );
    setSelectedCoupon((prev) => {
      if (prev && prev.id === selectedCoupon.id) {
        let updatedCoupon = {
          ...prev
        };
        updatedCoupon.bonsRestants =
        (updatedCoupon.bonsRestants || 0) - data.nombreBons;
        updatedCoupon.soldeAffecte += amount;
        updatedCoupon.soldeNonAffecte -= amount;
        updatedCoupon.couponsAffectes += data.nombreBons;
        if (updatedCoupon.bonsRestants === 0) {
          updatedCoupon.status = 'Affecté';
        } else if (updatedCoupon.soldeAffecte > 0) {
          updatedCoupon.status = 'Partiellement affecté';
        }
        if (
        updatedCoupon.vehicule === '-' ||
        updatedCoupon.vehicule === 'Multiples')
        {
          updatedCoupon.vehicule =
          updatedCoupon.couponsAffectes > 1 ?
          'Multiples' :
          data.vehicle || '-';
        }
        return updatedCoupon;
      }
      return prev;
    });
    // Add to history
    const newHistoryEntry: AssignmentHistory = {
      id: `hist-${Date.now()}`,
      date: new Date().toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }),
      action: 'Affectation',
      driver: data.driver || '-',
      vehicle: data.vehicle || '-',
      amount: amount,
      unite: 'TND',
      couponId: selectedCoupon.id
    };
    setHistory((prev) => [newHistoryEntry, ...prev]);
    addToast(`Affectation de ${data.nombreBons} bons réussie`);
  };
  const handleModifyCarnetAssignment = (
  rowId: string,
  newDriver: string,
  newVehicle: string) =>
  {
    setHistory((prev) =>
    prev.map((h) =>
    h.id === rowId ?
    {
      ...h,
      driver: newDriver || '-',
      vehicle: newVehicle || '-'
    } :
    h
    )
    );
    addToast('Affectation modifiée avec succès');
  };
  const handleCancelCarnetAssignment = (row: AssignmentHistory) => {
    if (!selectedCoupon || !selectedCoupon.soldeBon) return;
    const bonsToRestore = row.amount / selectedCoupon.soldeBon;
    setCoupons((prev) =>
    prev.map((c) => {
      if (c.id === selectedCoupon.id) {
        let updatedCoupon = {
          ...c
        };
        updatedCoupon.bonsRestants =
        (updatedCoupon.bonsRestants || 0) + bonsToRestore;
        updatedCoupon.soldeAffecte -= row.amount;
        updatedCoupon.soldeNonAffecte += row.amount;
        updatedCoupon.couponsAffectes -= bonsToRestore;
        if (updatedCoupon.bonsRestants === updatedCoupon.nombreBons) {
          updatedCoupon.status = 'Libre';
          updatedCoupon.vehicule = '-';
        } else if (updatedCoupon.soldeAffecte > 0) {
          updatedCoupon.status = 'Partiellement affecté';
        }
        return updatedCoupon;
      }
      return c;
    })
    );
    setSelectedCoupon((prev) => {
      if (prev && prev.id === selectedCoupon.id) {
        let updatedCoupon = {
          ...prev
        };
        updatedCoupon.bonsRestants =
        (updatedCoupon.bonsRestants || 0) + bonsToRestore;
        updatedCoupon.soldeAffecte -= row.amount;
        updatedCoupon.soldeNonAffecte += row.amount;
        updatedCoupon.couponsAffectes -= bonsToRestore;
        if (updatedCoupon.bonsRestants === updatedCoupon.nombreBons) {
          updatedCoupon.status = 'Libre';
          updatedCoupon.vehicule = '-';
        } else if (updatedCoupon.soldeAffecte > 0) {
          updatedCoupon.status = 'Partiellement affecté';
        }
        return updatedCoupon;
      }
      return prev;
    });
    const newHistoryEntry: AssignmentHistory = {
      id: `hist-${Date.now()}`,
      date: new Date().toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }),
      action: 'Annulation',
      driver: row.driver,
      vehicle: row.vehicle,
      amount: -row.amount,
      unite: row.unite,
      couponId: selectedCoupon.id
    };
    setHistory((prev) => [newHistoryEntry, ...prev]);
    addToast(`Affectation annulée (${bonsToRestore} bons restaurés)`);
  };
  // Alimentation Handler
  const handleRecharge = (amount: number) => {
    if (selectedCoupon && selectedCoupon.type === 'Carte de remplissage') {
      setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === selectedCoupon.id) {
          return {
            ...c,
            soldeTotal: c.soldeTotal + amount,
            soldeNonAffecte: c.soldeNonAffecte + amount,
            montantTotal:
            c.unite === 'L' ?
            (c.soldeTotal + amount) * 2.5 :
            c.soldeTotal + amount
          };
        }
        return c;
      })
      );
      // Add to history
      const newHistoryEntry: AssignmentHistory = {
        id: `hist-${Date.now()}`,
        date: new Date().toLocaleString('fr-FR', {
          dateStyle: 'short',
          timeStyle: 'short'
        }),
        action: 'Alimentation',
        amount: amount,
        unite: selectedCoupon.unite,
        couponId: selectedCoupon.id
      };
      setHistory((prev) => [newHistoryEntry, ...prev]);
      addToast(
        `Alimentation de ${amount} ${selectedCoupon.unite} ajoutée avec succès`
      );
    }
  };
  // Action Triggers
  const openAssign = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    if (coupon.type === 'Carnet de remplissage') {
      setShowCarnetSummaryModal(true);
    } else {
      setShowAssignModal(true);
    }
  };
  const openCarteDetails = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowCarteSummaryModal(true);
  };
  const openEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowEditModal(true);
  };
  const openDelete = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  };
  const openHistory = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowHistoryModal(true);
  };
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 flex-shrink-0">
        <div className="w-full flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
                <Ticket className="w-5 h-5 text-[#0ea5e9]" />
              </div>
              Gestion des coupons
            </h1>
            <p className="text-sm text-slate-500 mt-1 ml-13">
              Gérez vos cartes et carnets de remplissage de carburant
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
            
            <Plus className="w-4 h-4" />
            Ajouter un coupon
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 flex-shrink-0">
        <div className="w-full flex gap-8">
          <button
            onClick={() => setActiveTab('carte_bon')}
            className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'carte_bon' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
            
            Carte/Bon
          </button>
          <button
            onClick={() => setActiveTab('citernes')}
            className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'citernes' ? 'border-[#0ea5e9] text-[#0ea5e9]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
            
            Voir les citernes
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full space-y-6">
          {activeTab === 'carte_bon' ?
          <>
              {/* Filters with View Toggle */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 min-w-max">
                    <Filter className="w-4 h-4 text-slate-400" />
                    Filtres :
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                      <button
                      onClick={() => setViewMode('dashboard')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'dashboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      
                        <LayoutGrid className="w-4 h-4" />
                        Dashboard
                      </button>
                      <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      
                        <Table className="w-4 h-4" />
                        Tableau
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                      type="text"
                      placeholder="Rechercher par référence, véhicule..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    
                      {searchTerm &&
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      
                          <X className="w-3.5 h-3.5" />
                        </button>
                    }
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                      <select
                      value={filterType}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full appearance-none px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700 font-medium">
                      
                        <option value="">Tous les types</option>
                        <option value="Carte de remplissage">
                          Carte de remplissage
                        </option>
                        <option value="Carnet de remplissage">
                          Carnet de remplissage
                        </option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                      <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full appearance-none px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700 font-medium">
                      
                        <option value="">Tous les statuts</option>
                        <option value="Libre">Libre</option>
                        <option value="Affecté">Affecté</option>
                        <option value="Partiellement affecté">
                          Partiellement affecté
                        </option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard View - Statistics Overview */}
              {viewMode === 'dashboard' &&
            <>
                  {/* Calculate Statistics */}
                  {(() => {
                const stats = {
                  totalCoupons: filteredCoupons.length,
                  totalCartes: filteredCoupons.filter(
                    (c) => c.type === 'Carte de remplissage'
                  ).length,
                  totalCarnets: filteredCoupons.filter(
                    (c) => c.type === 'Carnet de remplissage'
                  ).length,
                  totalLibre: filteredCoupons.filter(
                    (c) => c.status === 'Libre'
                  ).length,
                  totalAffecte: filteredCoupons.filter(
                    (c) => c.status === 'Affecté'
                  ).length,
                  totalPartiel: filteredCoupons.filter(
                    (c) => c.status === 'Partiellement affecté'
                  ).length,
                  soldeNonAffecteL: filteredCoupons.
                  filter((c) => c.unite === 'L').
                  reduce((sum, c) => sum + c.soldeNonAffecte, 0),
                  soldeNonAffecteTND: filteredCoupons.
                  filter((c) => c.unite === 'TND').
                  reduce((sum, c) => sum + c.soldeNonAffecte, 0),
                  soldeAffecteL: filteredCoupons.
                  filter((c) => c.unite === 'L').
                  reduce((sum, c) => sum + c.soldeAffecte, 0),
                  soldeAffecteTND: filteredCoupons.
                  filter((c) => c.unite === 'TND').
                  reduce((sum, c) => sum + c.soldeAffecte, 0),
                  soldeTotalL: filteredCoupons.
                  filter((c) => c.unite === 'L').
                  reduce((sum, c) => sum + c.soldeTotal, 0),
                  soldeTotalTND: filteredCoupons.
                  filter((c) => c.unite === 'TND').
                  reduce((sum, c) => sum + c.soldeTotal, 0),
                  montantTotal: filteredCoupons.reduce(
                    (sum, c) => sum + c.montantTotal,
                    0
                  ),
                  totalCouponsAffectes: filteredCoupons.reduce(
                    (sum, c) => sum + c.couponsAffectes,
                    0
                  )
                };
                return (
                  <div className="space-y-6">
                        {/* Main KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Total Coupons */}
                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center">
                                <Ticket className="w-6 h-6 text-[#0ea5e9]" />
                              </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-1">
                              {stats.totalCoupons}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                              Total Coupons
                            </p>
                          </div>

                          {/* Montant Total */}
                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-amber-600" />
                              </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-1">
                              {stats.montantTotal.toFixed(0)}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                              Montant Total (TND)
                            </p>
                          </div>

                          {/* Total Affectations */}
                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                              </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-1">
                              {stats.totalCouponsAffectes}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                              Total Affectations
                            </p>
                          </div>

                          {/* Coupons Libres */}
                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Ticket className="w-6 h-6 text-emerald-600" />
                              </div>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-1">
                              {stats.totalLibre}
                            </h3>
                            <p className="text-sm font-medium text-slate-500">
                              Coupons Libres
                            </p>
                          </div>
                        </div>

                        {/* Soldes par Unité - Grande Carte */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Droplet className="w-6 h-6 text-[#0ea5e9]" />
                            Soldes par Unité
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Litres (L) */}
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                                  <Droplet className="w-5 h-5 text-[#0ea5e9]" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">
                                  Litres (L)
                                </h4>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                  <span className="text-sm font-medium text-slate-600">
                                    Solde Non Affecté
                                  </span>
                                  <span className="text-2xl font-bold text-emerald-600">
                                    {stats.soldeNonAffecteL.toFixed(0)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <span className="text-sm font-medium text-slate-600">
                                    Solde Affecté
                                  </span>
                                  <span className="text-2xl font-bold text-blue-600">
                                    {stats.soldeAffecteL.toFixed(0)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200">
                                  <span className="text-sm font-medium text-slate-600">
                                    Solde Total
                                  </span>
                                  <span className="text-2xl font-bold text-slate-800">
                                    {stats.soldeTotalL.toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Dinars (TND) */}
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-amber-600" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800">
                                  Dinars (TND)
                                </h4>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                  <span className="text-sm font-medium text-slate-600">
                                    Solde Non Affecté
                                  </span>
                                  <span className="text-2xl font-bold text-emerald-600">
                                    {stats.soldeTotalTND.toFixed(0)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <span className="text-sm font-medium text-slate-600">
                                    Solde Affecté
                                  </span>
                                  <span className="text-2xl font-bold text-blue-600">
                                    {stats.soldeAffecteTND.toFixed(0)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg border border-slate-200">
                                  <span className="text-sm font-medium text-slate-600">
                                    Solde Total
                                  </span>
                                  <span className="text-2xl font-bold text-slate-800">
                                    {stats.soldeTotalTND.toFixed(0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Secondary Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Répartition par Statut */}
                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Info className="w-5 h-5 text-slate-400" />
                              Répartition par Statut
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                  <span className="text-sm font-medium text-slate-600">
                                    Libre
                                  </span>
                                </div>
                                <span className="text-lg font-bold text-slate-800">
                                  {stats.totalLibre}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                  <span className="text-sm font-medium text-slate-600">
                                    Partiellement affecté
                                  </span>
                                </div>
                                <span className="text-lg font-bold text-slate-800">
                                  {stats.totalPartiel}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                  <span className="text-sm font-medium text-slate-600">
                                    Affecté
                                  </span>
                                </div>
                                <span className="text-lg font-bold text-slate-800">
                                  {stats.totalAffecte}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Solde Total par Unité */}
                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <Droplet className="w-5 h-5 text-slate-400" />
                              Solde Total par Unité
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-slate-600">
                                    Litres (L)
                                  </span>
                                  <span className="text-2xl font-bold text-[#0ea5e9]">
                                    {stats.soldeTotalL.toFixed(0)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div
                                className="bg-[#0ea5e9] h-2 rounded-full transition-all"
                                style={{
                                  width: `${stats.soldeTotalL > 0 ? Math.min(stats.soldeTotalL / (stats.soldeTotalL + stats.soldeTotalTND) * 100, 100) : 0}%`
                                }}>
                              </div>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-slate-600">
                                    Dinars (TND)
                                  </span>
                                  <span className="text-2xl font-bold text-amber-600">
                                    {stats.soldeTotalTND.toFixed(0)}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div
                                className="bg-amber-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${stats.soldeTotalTND > 0 ? Math.min(stats.soldeTotalTND / (stats.soldeTotalL + stats.soldeTotalTND) * 100, 100) : 0}%`
                                }}>
                              </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Répartition par Type */}
                          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-slate-400" />
                              Répartition par Type
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-[#0ea5e9]" />
                                    <span className="text-sm font-medium text-slate-600">
                                      Cartes
                                    </span>
                                  </div>
                                  <span className="text-2xl font-bold text-[#0ea5e9]">
                                    {stats.totalCartes}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div
                                className="bg-[#0ea5e9] h-2 rounded-full transition-all"
                                style={{
                                  width: `${stats.totalCoupons > 0 ? stats.totalCartes / stats.totalCoupons * 100 : 0}%`
                                }}>
                              </div>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Ticket className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-600">
                                      Carnets
                                    </span>
                                  </div>
                                  <span className="text-2xl font-bold text-purple-600">
                                    {stats.totalCarnets}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div
                                className="bg-purple-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${stats.totalCoupons > 0 ? stats.totalCarnets / stats.totalCoupons * 100 : 0}%`
                                }}>
                              </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Empty State */}
                        {filteredCoupons.length === 0 &&
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
                            <Ticket className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-1">
                              Aucun coupon trouvé
                            </h3>
                            <p className="text-slate-500">
                              Modifiez vos filtres ou ajoutez un nouveau coupon.
                            </p>
                          </div>
                    }
                      </div>);

              })()}
                </>
            }

              {/* Table View */}
              {viewMode === 'table' &&
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            N° Réf
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Type / Statut
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                            Coupons
                            <br />
                            affectés
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                            Solde
                            <br />
                            non affecté
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                            Solde
                            <br />
                            affecté
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                            Solde
                            <br />
                            total
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Véhicule
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Fournisseur
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Date d'exp.
                          </th>
                          <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedCoupons.length === 0 ?
                    <tr>
                            <td colSpan={10} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <Ticket className="w-12 h-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 mb-1">
                                  Aucun coupon trouvé
                                </h3>
                                <p className="text-slate-500">
                                  Modifiez vos filtres ou ajoutez un nouveau
                                  coupon.
                                </p>
                              </div>
                            </td>
                          </tr> :

                    paginatedCoupons.map((coupon) =>
                    <tr
                      key={coupon.id}
                      className="hover:bg-slate-50 transition-colors group">
                      
                              <td className="px-5 py-4">
                                <span className="text-sm font-bold text-slate-800">
                                  {coupon.reference}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex flex-col gap-1.5 items-start">
                                  <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                    {coupon.type === 'Carte de remplissage' ?
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" /> :

                            <Ticket className="w-3.5 h-3.5 text-slate-400" />
                            }
                                    {coupon.type}
                                  </span>
                                  <StatusBadge status={coupon.status} />
                                </div>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                  {coupon.couponsAffectes}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span
                          className={`text-sm font-bold ${coupon.soldeNonAffecte > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          
                                  {coupon.soldeNonAffecte} {coupon.unite}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-sm font-bold text-blue-600">
                                  {coupon.soldeAffecte} {coupon.unite}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span className="text-sm font-bold text-slate-800">
                                  {coupon.soldeTotal} {coupon.unite}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-sm font-medium text-slate-700">
                                  {coupon.vehicule}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-sm text-slate-600">
                                  {coupon.fournisseur}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span className="text-sm text-slate-600 font-mono">
                                  {coupon.dateExpiration}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {coupon.type === 'Carte de remplissage' &&
                          <button
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setShowCarteSummaryModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-lg transition-colors"
                            title="Voir détails">
                            
                                      <Eye className="w-4 h-4" />
                                    </button>
                          }
                                  {coupon.type === 'Carnet de remplissage' &&
                          <button
                            onClick={() => openAssign(coupon)}
                            className="p-1.5 text-slate-400 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-lg transition-colors"
                            title="Voir les bons">
                            
                                      <Ticket className="w-4 h-4" />
                                    </button>
                          }
                                  <button
                            onClick={() => openEdit(coupon)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier">
                            
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                            onClick={() => openDelete(coupon)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                onItemsPerPageChange={(val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                onExportPdf={() => console.log('Export PDF Coupons')}
                onExportExcel={() => console.log('Export Excel Coupons')} />
              
                </div>
            }
            </> :

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Droplet className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Gestion des citernes
              </h2>
              <p className="text-slate-500 max-w-md">
                Cette section est en cours de développement. Elle vous permettra
                de gérer le stock de carburant dans vos propres citernes.
              </p>
            </div>
          }
        </div>
      </div>

      {/* Modals */}
      <AddEditCouponModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveCoupon} />
      

      <AddEditCouponModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setTimeout(() => setSelectedCoupon(null), 300);
        }}
        onSave={handleUpdateCoupon}
        initialData={selectedCoupon} />
      

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        couponRef={selectedCoupon?.reference || ''} />
      

      <AssignCouponModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setTimeout(() => setSelectedCoupon(null), 300);
        }}
        onAssign={handleAssignSubmit}
        coupon={selectedCoupon} />
      

      <CarnetSummaryModal
        isOpen={showCarnetSummaryModal}
        onClose={() => setShowCarnetSummaryModal(false)}
        coupon={selectedCoupon}
        history={history}
        onAssignBons={() => {
          setShowCarnetSummaryModal(false);
          setTimeout(() => setShowCarnetAssignModal(true), 300);
        }}
        onModifyAssignment={handleModifyCarnetAssignment}
        onCancelAssignment={handleCancelCarnetAssignment} />
      

      <CarnetAssignModal
        isOpen={showCarnetAssignModal}
        onClose={() => {
          setShowCarnetAssignModal(false);
          setTimeout(() => setShowCarnetSummaryModal(true), 300);
        }}
        onAssign={handleCarnetAssignSubmit}
        coupon={selectedCoupon} />
      

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        coupon={selectedCoupon}
        history={history} />
      

      <AlimentationModal
        isOpen={showAlimentationModal}
        onClose={() => setShowAlimentationModal(false)}
        onRecharge={handleRecharge}
        coupon={selectedCoupon} />
      

      <CarteSummaryModal
        isOpen={showCarteSummaryModal}
        onClose={() => setShowCarteSummaryModal(false)}
        coupon={selectedCoupon}
        onRecharge={handleRecharge}
        onAssign={handleAssignSubmit}
        history={history}
        onModifyAssignment={(rowId, newDriver, newVehicle) => {
          setHistory((prev) =>
          prev.map((h) =>
          h.id === rowId ?
          {
            ...h,
            driver: newDriver || '-',
            vehicle: newVehicle || '-'
          } :
          h
          )
          );
          addToast('Affectation modifiée avec succès');
        }}
        onCancelAssignment={(row) => {
          if (!selectedCoupon) return;
          setCoupons((prev) =>
          prev.map((c) => {
            if (c.id === selectedCoupon.id) {
              let updatedCoupon = {
                ...c
              };
              updatedCoupon.soldeAffecte -= row.amount;
              updatedCoupon.soldeNonAffecte += row.amount;
              updatedCoupon.couponsAffectes -= 1;
              if (
              updatedCoupon.soldeNonAffecte === updatedCoupon.soldeTotal)
              {
                updatedCoupon.status = 'Libre';
                updatedCoupon.vehicule = '-';
              } else if (updatedCoupon.soldeAffecte > 0) {
                updatedCoupon.status = 'Partiellement affecté';
              }
              return updatedCoupon;
            }
            return c;
          })
          );
          setSelectedCoupon((prev) => {
            if (prev && prev.id === selectedCoupon.id) {
              let updatedCoupon = {
                ...prev
              };
              updatedCoupon.soldeAffecte -= row.amount;
              updatedCoupon.soldeNonAffecte += row.amount;
              updatedCoupon.couponsAffectes -= 1;
              if (updatedCoupon.soldeNonAffecte === updatedCoupon.soldeTotal) {
                updatedCoupon.status = 'Libre';
                updatedCoupon.vehicule = '-';
              } else if (updatedCoupon.soldeAffecte > 0) {
                updatedCoupon.status = 'Partiellement affecté';
              }
              return updatedCoupon;
            }
            return prev;
          });
          const newHistoryEntry: AssignmentHistory = {
            id: `hist-${Date.now()}`,
            date: new Date().toLocaleString('fr-FR', {
              dateStyle: 'short',
              timeStyle: 'short'
            }),
            action: 'Annulation',
            driver: row.driver,
            vehicle: row.vehicle,
            amount: -row.amount,
            unite: row.unite,
            couponId: selectedCoupon.id
          };
          setHistory((prev) => [newHistoryEntry, ...prev]);
          addToast(`Affectation annulée (${row.amount} ${row.unite} restaurés)`);
        }} />
      
    </div>);

}