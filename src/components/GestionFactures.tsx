import React, { useEffect, useMemo, useState, Component } from 'react';
import {
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Package,
  Receipt,
  CheckCircle,
  X,
  ArrowRight,
  ListChecks,
  Search } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableFooter } from './TableFooter';
import { EcheancesModal } from './EcheancesModal';
import { ModalHeader } from '@/components/ui/modal-header';
// --- Types ---
type TypeMouvement = 'Achat' | 'Vente';
type EtatPaiement =
'non payé' |
'payé' |
'en attente de payement' |
'en cours de payement' |
'livré';
type PieceCommerciale = 'bon commande' | 'bon livraison' | 'facture';
interface Article {
  id: string;
  nom: string;
  quantite: number;
  puht: number;
  tva: number;
  remise: number;
  ttc: number;
}
interface Echeance {
  numero: number;
  montant: number;
  datePaiement: string;
  etatPaiement: 'payé' | 'non payé';
}
interface BonCommande {
  id: string;
  typeMouvement: TypeMouvement;
  reference: string;
  dateOperation: string;
  tiers: string; // Fournisseur or Client
  articles: Article[];
}
interface BonLivraison {
  id: string;
  reference: string;
  dateOperation: string;
  refBonCommande: string; // empty string if not linked
  effetStock: boolean;
  typeMouvement?: TypeMouvement;
  tiers?: string;
  articles?: Article[];
}
interface Facture {
  id: string;
  reference: string;
  pieceCommerciale: PieceCommerciale;
  dateOperation: string;
  typeMouvement: TypeMouvement;
  quantite: number;
  objet: string;
  fournisseur: string;
  client: string;
  etatPaiement: EtatPaiement;
  totalTTC: number;
  totalHT: number;
  netAPayer: number;
  timbreFiscal: number;
  datePaiement?: string;
  conditionsReglement: 'Paiement immédiat' | 'Paiement par tranche';
  modeReglement: 'espèce' | 'chéque' | 'virement';
  refLiaison?: string; // linked BC or BL
  articles?: Article[]; // if no liaison
  echeances?: Echeance[];
  datePremiereEcheance?: string;
  dateDebutPremiereTranche?: string;
  nombreEcheanceParJour?: number;
  nombreTranches?: number;
}
// --- Mock Data ---
const MOCK_ARTICLES = [
{
  id: 'A1',
  nom: 'Pneu Michelin 205/55 R16'
},
{
  id: 'A2',
  nom: 'Huile Moteur 5W30 5L'
},
{
  id: 'A3',
  nom: 'Filtre à Air'
},
{
  id: 'A4',
  nom: 'Plaquettes de frein'
}];

const MOCK_COMMANDES: BonCommande[] = [
{
  id: 'BC-2024-001',
  typeMouvement: 'Achat',
  reference: 'BC-2024-001',
  dateOperation: '2024-03-15',
  tiers: 'AutoParts Pro',
  articles: [
  {
    id: '1',
    nom: 'Pneu Michelin 205/55 R16',
    quantite: 4,
    puht: 120,
    tva: 19,
    remise: 5,
    ttc: 542.64
  }]

},
{
  id: 'BC-2024-002',
  typeMouvement: 'Vente',
  reference: 'BC-2024-002',
  dateOperation: '2024-03-16',
  tiers: 'Client ABC',
  articles: [
  {
    id: '2',
    nom: 'Huile Moteur 5W30 5L',
    quantite: 2,
    puht: 45,
    tva: 19,
    remise: 0,
    ttc: 107.1
  }]

}];

const MOCK_LIVRAISONS: BonLivraison[] = [
{
  id: 'BL-2024-001',
  reference: 'BL-2024-001',
  dateOperation: '2024-03-18',
  refBonCommande: 'BC-2024-001',
  effetStock: true
}];

const MOCK_FACTURES: Facture[] = [
{
  id: 'FAC-2024-001',
  reference: 'FAC-2024-001',
  pieceCommerciale: 'bon livraison',
  dateOperation: '2024-03-20',
  typeMouvement: 'Achat',
  quantite: 4,
  objet: 'Achat Pneus',
  fournisseur: 'AutoParts Pro',
  client: '-',
  etatPaiement: 'payé',
  totalHT: 480,
  totalTTC: 542.64,
  netAPayer: 543.64,
  timbreFiscal: 1.0,
  datePaiement: '2024-03-20',
  conditionsReglement: 'Paiement immédiat',
  modeReglement: 'virement',
  refLiaison: 'BL-2024-001'
},
{
  id: 'FAC-2024-002',
  reference: 'FAC-2024-002',
  pieceCommerciale: 'facture',
  dateOperation: '2024-03-22',
  typeMouvement: 'Vente',
  quantite: 1,
  objet: 'Prestation Service',
  fournisseur: '-',
  client: 'Client XYZ',
  etatPaiement: 'en cours de payement',
  totalHT: 200,
  totalTTC: 238,
  netAPayer: 239,
  timbreFiscal: 1.0,
  conditionsReglement: 'Paiement par tranche',
  modeReglement: 'chéque',
  datePremiereEcheance: '2024-04-01',
  dateDebutPremiereTranche: '2024-04-01',
  nombreEcheanceParJour: 30,
  nombreTranches: 3,
  echeances: [
  {
    numero: 1,
    montant: 79.67,
    datePaiement: '2024-04-01',
    etatPaiement: 'payé'
  },
  {
    numero: 2,
    montant: 79.67,
    datePaiement: '2024-05-01',
    etatPaiement: 'non payé'
  },
  {
    numero: 3,
    montant: 79.66,
    datePaiement: '2024-05-31',
    etatPaiement: 'non payé'
  }],

  articles: [
  {
    id: '3',
    nom: 'Filtre à Air',
    quantite: 1,
    puht: 200,
    tva: 19,
    remise: 0,
    ttc: 238
  }]

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
  min,
  step










}: {label: string;value: string | number;onChange: (v: string) => void;type?: string;required?: boolean;className?: string;disabled?: boolean;min?: string;step?: string;}) {
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
        min={min}
        step={step}
        className={`w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 bg-white ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
        required={required} />
      
    </div>);

}
function StatusBadge({ status }: {status: EtatPaiement;}) {
  switch (status) {
    case 'payé':
    case 'livré':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {status}
        </span>);

    case 'en attente de payement':
    case 'en cours de payement':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {status}
        </span>);

    case 'non payé':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {status}
        </span>);

  }
}
// --- Modals ---
// 1. Add/Edit Modal (The Wizard)
function AddEditDocumentModal({
  isOpen,
  onClose,
  commandes,
  livraisons,
  editData






}: {isOpen: boolean;onClose: () => void;commandes: BonCommande[];livraisons: BonLivraison[];editData?: any;}) {
  const [phase, setPhase] = useState<
    'select' | 'commande' | 'livraison' | 'facture'>(
    'select');
  const [step, setStep] = useState(1);
  // Commande State
  const [cTypeMvt, setCTypeMvt] = useState<TypeMouvement>('Achat');
  const [cRef, setCRef] = useState('');
  const [cDate, setCDate] = useState(new Date().toISOString().split('T')[0]);
  const [cTiers, setCTiers] = useState('');
  const [cArticles, setCArticles] = useState<Article[]>([]);
  // Livraison State
  const [lRef, setLRef] = useState('');
  const [lDate, setLDate] = useState(new Date().toISOString().split('T')[0]);
  const [lRefCmd, setLRefCmd] = useState('');
  const [lEffetStock, setLEffetStock] = useState(true);
  const [lIsLinkedToBC, setLIsLinkedToBC] = useState(true);
  const [lTypeMvt, setLTypeMvt] = useState<TypeMouvement>('Achat');
  const [lTiers, setLTiers] = useState('');
  const [lArticles, setLArticles] = useState<Article[]>([]);
  // Facture State
  const [fRef, setFRef] = useState('');
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0]);
  const [fLiaison, setFLiaison] = useState<'Command' | 'Livraison' | 'Aucune'>(
    'Aucune'
  );
  const [fRefLiaison, setFRefLiaison] = useState('');
  const [fTypeMvt, setFTypeMvt] = useState<TypeMouvement>('Achat');
  const [fTiers, setFTiers] = useState('');
  const [fArticles, setFArticles] = useState<Article[]>([]);
  const [fEtat, setFEtat] = useState<EtatPaiement>('non payé');
  const [fTotalHT, setFTotalHT] = useState('0');
  const [fTotalTTC, setFTotalTTC] = useState('0');
  const [fNet, setFNet] = useState('0');
  const [fTimbre, setFTimbre] = useState('1.000');
  const [fDatePaiement, setFDatePaiement] = useState('');
  const [fCondReglement, setFCondReglement] = useState<
    'Paiement immédiat' | 'Paiement par tranche'>(
    'Paiement immédiat');
  const [fMode, setFMode] = useState<'espèce' | 'chéque' | 'virement'>(
    'virement'
  );
  // Échéances fields
  const [fDatePremiereEcheance, setFDatePremiereEcheance] = useState('');
  const [fDateDebutTranche, setFDateDebutTranche] = useState('');
  const [fNombreEcheanceJour, setFNombreEcheanceJour] = useState('30');
  const [fNombreTranches, setFNombreTranches] = useState('2');
  const [fEcheances, setFEcheances] = useState<Echeance[]>([]);
  // Article Form State
  const [artNom, setArtNom] = useState('');
  const [artQte, setArtQte] = useState('1');
  const [artPuht, setArtPuht] = useState('0');
  const [artTva, setArtTva] = useState('19');
  const [artRemise, setArtRemise] = useState('0');
  // Compute net à payer from articles for échéances calculation
  const computedNetAPayer = useMemo(() => {
    let relevantArticles: Article[] = [];
    if (fLiaison === 'Command') {
      const cmd = commandes.find((c) => c.reference === fRefLiaison);
      if (cmd) relevantArticles = cmd.articles;
    } else if (fLiaison === 'Livraison') {
      const liv = livraisons.find((l) => l.reference === fRefLiaison);
      if (liv) {
        if (liv.articles && liv.articles.length > 0) {
          relevantArticles = liv.articles;
        } else {
          const cmd = commandes.find((c) => c.reference === liv.refBonCommande);
          if (cmd) relevantArticles = cmd.articles;
        }
      }
    } else {
      relevantArticles = fArticles;
    }
    const totalArticlesTTC = relevantArticles.reduce((acc, a) => acc + a.ttc, 0);
    const timbre = parseFloat(fTimbre) || 0;
    return totalArticlesTTC + timbre;
  }, [fLiaison, fRefLiaison, fArticles, fTimbre, commandes, livraisons]);
  // Auto-calculate échéances when relevant fields change
  useEffect(() => {
    if (
    fCondReglement === 'Paiement par tranche' &&
    computedNetAPayer > 0 &&
    fNombreTranches &&
    fDatePremiereEcheance &&
    fNombreEcheanceJour)
    {
      const netAPayer = computedNetAPayer;
      const nbTranches = parseInt(fNombreTranches);
      const intervalJours = parseInt(fNombreEcheanceJour);
      const startDate = new Date(fDatePremiereEcheance);
      if (netAPayer > 0 && nbTranches > 0 && !isNaN(startDate.getTime())) {
        const montantParTranche = netAPayer / nbTranches;
        const newEcheances: Echeance[] = [];
        for (let i = 0; i < nbTranches; i++) {
          const echeanceDate = new Date(startDate);
          echeanceDate.setDate(startDate.getDate() + i * intervalJours);
          const montant =
          i === nbTranches - 1 ?
          parseFloat(
            (netAPayer - montantParTranche * (nbTranches - 1)).toFixed(2)
          ) :
          parseFloat(montantParTranche.toFixed(2));
          newEcheances.push({
            numero: i + 1,
            montant,
            datePaiement: echeanceDate.toISOString().split('T')[0],
            etatPaiement: 'non payé'
          });
        }
        setFEcheances(newEcheances);
      }
    } else if (fCondReglement === 'Paiement immédiat') {
      setFEcheances([]);
    }
  }, [
  fCondReglement,
  computedNetAPayer,
  fNombreTranches,
  fDatePremiereEcheance,
  fNombreEcheanceJour]
  );
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        if (
        'tiers' in editData &&
        'typeMouvement' in editData &&
        !('pieceCommerciale' in editData))
        {
          setPhase('commande');
          setStep(1);
          setCTypeMvt(editData.typeMouvement);
          setCRef(editData.reference);
          setCDate(editData.dateOperation);
          setCTiers(editData.tiers);
          setCArticles(editData.articles || []);
        } else if ('refBonCommande' in editData) {
          setPhase('livraison');
          setStep(1);
          setLRef(editData.reference);
          setLDate(editData.dateOperation);
          setLRefCmd(editData.refBonCommande);
          setLEffetStock(editData.effetStock);
          setLIsLinkedToBC(!!editData.refBonCommande);
          setLTypeMvt(editData.typeMouvement || 'Achat');
          setLTiers(editData.tiers || '');
          setLArticles(editData.articles || []);
        } else if ('pieceCommerciale' in editData) {
          setPhase('facture');
          setStep(1);
          setFRef(editData.reference);
          setFDate(editData.dateOperation);
          setFLiaison(
            editData.refLiaison ?
            editData.pieceCommerciale === 'bon commande' ?
            'Command' :
            'Livraison' :
            'Aucune'
          );
          setFRefLiaison(editData.refLiaison || '');
          setFTypeMvt(editData.typeMouvement);
          setFTiers(
            editData.typeMouvement === 'Achat' ?
            editData.fournisseur :
            editData.client
          );
          setFArticles(editData.articles || []);
          setFEtat(editData.etatPaiement);
          setFTotalHT(editData.totalHT.toString());
          setFTotalTTC(editData.totalTTC.toString());
          setFNet(editData.netAPayer.toString());
          setFTimbre(editData.timbreFiscal.toString());
          setFDatePaiement(editData.datePaiement || '');
          setFCondReglement(editData.conditionsReglement);
          setFMode(editData.modeReglement);
          if (editData.conditionsReglement === 'Paiement par tranche') {
            setFDatePremiereEcheance(editData.datePremiereEcheance || '');
            setFNombreEcheanceJour(
              editData.nombreEcheanceParJour?.toString() || '30'
            );
            setFNombreTranches(editData.nombreTranches?.toString() || '2');
            setFEcheances(editData.echeances || []);
          }
        }
      } else {
        setPhase('select');
        setStep(1);
        // Reset states
        setCRef(`BC-${Date.now().toString().slice(-6)}`);
        setCDate(new Date().toISOString().split('T')[0]);
        setCArticles([]);
        setLRef(`BL-${Date.now().toString().slice(-6)}`);
        setLDate(new Date().toISOString().split('T')[0]);
        setLRefCmd('');
        setLIsLinkedToBC(true);
        setLTypeMvt('Achat');
        setLTiers('');
        setLArticles([]);
        setFRef(`FAC-${Date.now().toString().slice(-6)}`);
        setFDate(new Date().toISOString().split('T')[0]);
        setFArticles([]);
        setFTimbre('1.000');
      }
    }
  }, [isOpen, editData]);
  if (!isOpen) return null;
  const handleAddArticle = (target: 'commande' | 'facture' | 'livraison') => {
    if (!artNom || !artQte || !artPuht) return;
    const q = parseFloat(artQte);
    const p = parseFloat(artPuht);
    const t = parseFloat(artTva);
    const r = parseFloat(artRemise);
    const ht = q * p;
    const htRemise = ht * (1 - r / 100);
    const ttc = htRemise * (1 + t / 100);
    const newArt: Article = {
      id: Date.now().toString(),
      nom: artNom,
      quantite: q,
      puht: p,
      tva: t,
      remise: r,
      ttc: parseFloat(ttc.toFixed(3))
    };
    if (target === 'commande') setCArticles([...cArticles, newArt]);else
    if (target === 'livraison') setLArticles([...lArticles, newArt]);else
    setFArticles([...fArticles, newArt]);
    setArtNom('');
    setArtQte('1');
    setArtPuht('0');
    setArtRemise('0');
  };
  const removeArticle = (
  id: string,
  target: 'commande' | 'facture' | 'livraison') =>
  {
    if (target === 'commande')
    setCArticles(cArticles.filter((a) => a.id !== id));else
    if (target === 'livraison')
    setLArticles(lArticles.filter((a) => a.id !== id));else
    setFArticles(fArticles.filter((a) => a.id !== id));
  };
  const handleSubmit = () => {
    if (phase === 'commande') {
      onSaveCommande({
        id: editData ? editData.id : cRef,
        reference: cRef,
        typeMouvement: cTypeMvt,
        dateOperation: cDate,
        tiers: cTiers,
        articles: cArticles
      });
    } else if (phase === 'livraison') {
      const livraisonData: any = {
        id: editData ? editData.id : lRef,
        reference: lRef,
        dateOperation: lDate,
        refBonCommande: lIsLinkedToBC ? lRefCmd : '',
        effetStock: lEffetStock
      };
      if (!lIsLinkedToBC) {
        livraisonData.typeMouvement = lTypeMvt;
        livraisonData.tiers = lTiers;
        livraisonData.articles = lArticles;
      }
      onSaveLivraison(livraisonData);
    } else if (phase === 'facture') {
      let finalArticles = fArticles;
      let finalTypeMvt = fTypeMvt;
      let finalFournisseur = fTypeMvt === 'Achat' ? fTiers : '-';
      let finalClient = fTypeMvt === 'Vente' ? fTiers : '-';
      let finalObjet = 'Facture';
      let finalQte = 1;
      if (fLiaison === 'Command') {
        const cmd = commandes.find((c) => c.reference === fRefLiaison);
        if (cmd) {
          finalArticles = cmd.articles;
          finalTypeMvt = cmd.typeMouvement;
          finalFournisseur = cmd.typeMouvement === 'Achat' ? cmd.tiers : '-';
          finalClient = cmd.typeMouvement === 'Vente' ? cmd.tiers : '-';
          finalQte = cmd.articles.reduce((acc, a) => acc + a.quantite, 0);
        }
      } else if (fLiaison === 'Livraison') {
        const liv = livraisons.find((l) => l.reference === fRefLiaison);
        if (liv) {
          const cmd = commandes.find((c) => c.reference === liv.refBonCommande);
          if (cmd) {
            finalArticles = cmd.articles;
            finalTypeMvt = cmd.typeMouvement;
            finalFournisseur = cmd.typeMouvement === 'Achat' ? cmd.tiers : '-';
            finalClient = cmd.typeMouvement === 'Vente' ? cmd.tiers : '-';
            finalQte = cmd.articles.reduce((acc, a) => acc + a.quantite, 0);
          }
        }
      } else {
        finalQte = fArticles.reduce((acc, a) => acc + a.quantite, 0);
      }
      // Auto-calculate totals from articles
      const computedTotalHT = finalArticles.reduce((acc, a) => {
        return acc + a.quantite * a.puht * (1 - a.remise / 100);
      }, 0);
      const computedTotalArticlesTTC = finalArticles.reduce(
        (acc, a) => acc + a.ttc,
        0
      );
      const computedTimbre = parseFloat(fTimbre) || 0;
      const computedTotalTTC = computedTotalArticlesTTC + computedTimbre;
      const computedNet = computedTotalTTC;
      const factureData: Facture = {
        id: editData ? editData.id : fRef,
        reference: fRef,
        pieceCommerciale:
        fLiaison === 'Command' ?
        'bon commande' :
        fLiaison === 'Livraison' ?
        'bon livraison' :
        'facture',
        dateOperation: fDate,
        typeMouvement: finalTypeMvt,
        quantite: finalQte,
        objet: finalObjet,
        fournisseur: finalFournisseur,
        client: finalClient,
        etatPaiement: fEtat,
        totalHT: parseFloat(computedTotalHT.toFixed(3)),
        totalTTC: parseFloat(computedTotalTTC.toFixed(3)),
        netAPayer: parseFloat(computedNet.toFixed(3)),
        timbreFiscal: computedTimbre,
        datePaiement: fDatePaiement || undefined,
        conditionsReglement: fCondReglement,
        modeReglement: fMode,
        refLiaison: fLiaison !== 'Aucune' ? fRefLiaison : undefined,
        articles: fLiaison === 'Aucune' ? finalArticles : undefined
      };
      // Add échéances data if payment by installments
      if (fCondReglement === 'Paiement par tranche') {
        factureData.echeances = fEcheances;
        factureData.datePremiereEcheance = fDatePremiereEcheance;
        factureData.dateDebutPremiereTranche = fDatePremiereEcheance;
        factureData.nombreEcheanceParJour = parseInt(fNombreEcheanceJour);
        factureData.nombreTranches = parseInt(fNombreTranches);
      }
      onSaveFacture(factureData);
    }
    onClose();
  };
  const renderArticlesTable = (
  articles: Article[],
  target: 'commande' | 'facture' | 'livraison') =>

  <div className="mt-6">
      <h4 className="text-sm font-bold text-slate-800 mb-3">
        Articles ajoutés ({articles.length})
      </h4>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 font-semibold text-slate-600">Nom</th>
              <th className="px-4 py-2 font-semibold text-slate-600">Qté</th>
              <th className="px-4 py-2 font-semibold text-slate-600">PUHT</th>
              <th className="px-4 py-2 font-semibold text-slate-600">Remise</th>
              <th className="px-4 py-2 font-semibold text-slate-600">TVA</th>
              <th className="px-4 py-2 font-semibold text-slate-600">TTC</th>
              <th className="px-4 py-2 font-semibold text-slate-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.map((a) =>
          <tr key={a.id}>
                <td className="px-4 py-2">{a.nom}</td>
                <td className="px-4 py-2">{a.quantite}</td>
                <td className="px-4 py-2">{a.puht}</td>
                <td className="px-4 py-2">{a.remise}%</td>
                <td className="px-4 py-2">{a.tva}%</td>
                <td className="px-4 py-2 font-bold">{a.ttc}</td>
                <td className="px-4 py-2 text-right">
                  <button
                onClick={() => removeArticle(a.id, target)}
                className="text-rose-500 hover:text-rose-700">
                
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
          )}
            {articles.length === 0 &&
          <tr>
                <td
              colSpan={7}
              className="px-4 py-4 text-center text-slate-500">
              
                  Aucun article ajouté
                </td>
              </tr>
          }
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-right">
        <span className="text-sm text-slate-500">Total TTC: </span>
        <span className="text-lg font-bold text-slate-800">
          {articles.reduce((acc, a) => acc + a.ttc, 0).toFixed(3)} TND
        </span>
      </div>
    </div>;

  const renderArticleForm = (target: 'commande' | 'facture' | 'livraison') =>
  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
            Article
          </label>
          <select
          value={artNom}
          onChange={(e) => setArtNom(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
          
            <option value="">Sélectionner un article...</option>
            {MOCK_ARTICLES.map((a) =>
          <option key={a.id} value={a.nom}>
                {a.nom}
              </option>
          )}
          </select>
        </div>
        <FloatingLabelInput
        label="Quantité"
        type="number"
        value={artQte}
        onChange={setArtQte}
        min="1" />
      
      </div>
      <div className="grid grid-cols-3 gap-4">
        <FloatingLabelInput
        label="PUHT"
        type="number"
        value={artPuht}
        onChange={setArtPuht} />
      
        <FloatingLabelInput
        label="TVA %"
        type="number"
        value={artTva}
        onChange={setArtTva} />
      
        <FloatingLabelInput
        label="Remise %"
        type="number"
        value={artRemise}
        onChange={setArtRemise} />
      
      </div>
      <div className="flex justify-end">
        <button
        type="button"
        onClick={() => handleAddArticle(target)}
        className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
        
          Ajouter l'article
        </button>
      </div>
    </div>;

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
            title={
              editData
                ? 'Modifier le document commercial'
                : 'Créer un document commercial'
            }
            onClose={onClose}
          />

          <div className="p-6 overflow-y-auto flex-1">
            {/* Dynamic Step Progress Bar */}
            {phase !== 'select' &&
            <div className="mb-6 px-4">
                <div className="flex items-center justify-between">
                  {phase === 'commande' &&
                <>
                      {/* Step 1 */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      
                          {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                        </div>
                        <p
                      className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-sky-700' : 'text-slate-400'}`}>
                      
                          Informations
                        </p>
                      </div>
                      <div
                    className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-sky-500' : 'bg-slate-200'}`} />
                  
                      {/* Step 2 */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      
                          2
                        </div>
                        <p
                      className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-sky-700' : 'text-slate-400'}`}>
                      
                          Articles
                        </p>
                      </div>
                    </>
                }
                  {phase === 'livraison' &&
                <>
                      <div className="flex flex-col items-center flex-1">
                        <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      
                          {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                        </div>
                        <p
                      className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-sky-700' : 'text-slate-400'}`}>
                      
                          Informations
                        </p>
                      </div>
                      {!lIsLinkedToBC &&
                  <>
                          <div
                      className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-sky-500' : 'bg-slate-200'}`} />
                    
                          <div className="flex flex-col items-center flex-1">
                            <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        
                              2
                            </div>
                            <p
                        className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-sky-700' : 'text-slate-400'}`}>
                        
                              Articles
                            </p>
                          </div>
                        </>
                  }
                    </>
                }
                  {phase === 'facture' && fLiaison !== 'Aucune' &&
                <>
                      {/* Step 1 */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      
                          {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                        </div>
                        <p
                      className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-sky-700' : 'text-slate-400'}`}>
                      
                          Entête
                        </p>
                      </div>
                      <div
                    className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-sky-500' : 'bg-slate-200'}`} />
                  
                      {/* Step 2 */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      
                          2
                        </div>
                        <p
                      className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-sky-700' : 'text-slate-400'}`}>
                      
                          Paiement
                        </p>
                      </div>
                    </>
                }
                  {phase === 'facture' && fLiaison === 'Aucune' &&
                <>
                      {/* Step 1 */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      
                          {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                        </div>
                        <p
                      className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-sky-700' : 'text-slate-400'}`}>
                      
                          Entête
                        </p>
                      </div>
                      <div
                    className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-sky-500' : 'bg-slate-200'}`} />
                  
                      {/* Step 2 */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      
                          {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
                        </div>
                        <p
                      className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-sky-700' : 'text-slate-400'}`}>
                      
                          Articles
                        </p>
                      </div>
                      <div
                    className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-sky-500' : 'bg-slate-200'}`} />
                  
                      {/* Step 3 */}
                      <div className="flex flex-col items-center flex-1">
                        <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      
                          3
                        </div>
                        <p
                      className={`text-xs mt-2 font-medium ${step >= 3 ? 'text-sky-700' : 'text-slate-400'}`}>
                      
                          Paiement
                        </p>
                      </div>
                    </>
                }
                </div>
              </div>
            }

            {phase === 'select' &&
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800 text-center mb-6">
                  Que souhaitez-vous créer ?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                  onClick={() => {
                    setPhase('commande');
                    setStep(1);
                  }}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all text-center group">
                  
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                      <FileText className="w-6 h-6 text-slate-600 group-hover:text-sky-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">
                      Bon de Commande
                    </h4>
                    <p className="text-xs text-slate-500">
                      Phase 1 : Créer une nouvelle commande avec des articles.
                    </p>
                  </button>
                  <button
                  onClick={() => {
                    setPhase('livraison');
                    setStep(1);
                  }}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all text-center group">
                  
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                      <Package className="w-6 h-6 text-slate-600 group-hover:text-sky-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">
                      Bon de Livraison
                    </h4>
                    <p className="text-xs text-slate-500">
                      Phase 2 : Lier à une commande existante pour livraison.
                    </p>
                  </button>
                  <button
                  onClick={() => {
                    setPhase('facture');
                    setStep(1);
                  }}
                  className="p-6 border-2 border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all text-center group">
                  
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                      <Receipt className="w-6 h-6 text-slate-600 group-hover:text-sky-600" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-2">Facture</h4>
                    <p className="text-xs text-slate-500">
                      Phase 3 : Facturer une commande, une livraison ou libre.
                    </p>
                  </button>
                </div>
              </div>
            }

            {/* PHASE 1: COMMANDE */}
            {phase === 'commande' && step === 1 &&
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                      Type de mouvement
                    </label>
                    <select
                    value={cTypeMvt}
                    onChange={(e) =>
                    setCTypeMvt(e.target.value as TypeMouvement)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
                    
                      <option value="Achat">Achat</option>
                      <option value="Vente">Vente</option>
                    </select>
                  </div>
                  <FloatingLabelInput
                  label="REF Bon Commande"
                  value={cRef}
                  onChange={setCRef}
                  required />
                
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput
                  label="Date d'opération"
                  type="date"
                  value={cDate}
                  onChange={setCDate}
                  required />
                
                  <FloatingLabelInput
                  label={cTypeMvt === 'Achat' ? 'Fournisseur' : 'Client'}
                  value={cTiers}
                  onChange={setCTiers}
                  required />
                
                </div>
              </div>
            }
            {phase === 'commande' && step === 2 &&
            <div>
                {renderArticleForm('commande')}
                {renderArticlesTable(cArticles, 'commande')}
              </div>
            }

            {/* PHASE 2: LIVRAISON */}
            {phase === 'livraison' && step === 1 &&
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput
                  label="REF Bon Livraison"
                  value={lRef}
                  onChange={setLRef}
                  required />
                
                  <FloatingLabelInput
                  label="Date d'opération"
                  type="date"
                  value={lDate}
                  onChange={setLDate}
                  required />
                
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                  <p className="text-sm font-bold text-slate-800">
                    Est-ce que ce bon de livraison est lié avec un bon de
                    commande ?
                  </p>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                      type="radio"
                      name="blLinked"
                      checked={lIsLinkedToBC}
                      onChange={() => {
                        setLIsLinkedToBC(true);
                        setLRefCmd('');
                      }}
                      className="text-sky-600 focus:ring-sky-500" />
                    
                      <span className="text-sm text-slate-700">Oui</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                      type="radio"
                      name="blLinked"
                      checked={!lIsLinkedToBC}
                      onChange={() => {
                        setLIsLinkedToBC(false);
                        setLRefCmd('');
                      }}
                      className="text-sky-600 focus:ring-sky-500" />
                    
                      <span className="text-sm text-slate-700">Non</span>
                    </label>
                  </div>

                  {lIsLinkedToBC &&
                <div className="relative mt-4">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        REF Bon Commande liée
                      </label>
                      <select
                    value={lRefCmd}
                    onChange={(e) => setLRefCmd(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
                    
                        <option value="">Sélectionner une commande...</option>
                        {commandes.map((c) =>
                    <option key={c.id} value={c.reference}>
                            {c.reference} - {c.tiers}
                          </option>
                    )}
                      </select>
                    </div>
                }
                </div>

                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                  type="checkbox"
                  checked={lEffetStock}
                  onChange={(e) => setLEffetStock(e.target.checked)}
                  className="w-5 h-5 text-sky-600 rounded border-slate-300 focus:ring-sky-500" />
                
                  <div>
                    <p className="font-medium text-slate-800">
                      Effet sur le stock
                    </p>
                    <p className="text-xs text-slate-500">
                      Enregistrer les articles dans l'historique des
                      entrées/sorties
                    </p>
                  </div>
                </label>
              </div>
            }

            {phase === 'livraison' && step === 2 && !lIsLinkedToBC &&
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                      Type de mouvement
                    </label>
                    <select
                    value={lTypeMvt}
                    onChange={(e) =>
                    setLTypeMvt(e.target.value as TypeMouvement)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
                    
                      <option value="Achat">Achat (Fournisseur)</option>
                      <option value="Vente">Vente (Client)</option>
                    </select>
                  </div>
                  <FloatingLabelInput
                  label={lTypeMvt === 'Achat' ? 'Fournisseur' : 'Client'}
                  value={lTiers}
                  onChange={setLTiers}
                  required />
                
                </div>
                {renderArticleForm('livraison')}
                {renderArticlesTable(lArticles, 'livraison')}
              </div>
            }

            {/* PHASE 3: FACTURE */}
            {phase === 'facture' && step === 1 &&
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FloatingLabelInput
                  label="REF Facture"
                  value={fRef}
                  onChange={setFRef}
                  required />
                
                  <FloatingLabelInput
                  label="Date d'opération"
                  type="date"
                  value={fDate}
                  onChange={setFDate}
                  required />
                
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                  <p className="text-sm font-bold text-slate-800">
                    Quelle opération commerciale est liée avec cette facture ?
                  </p>
                  <div className="flex gap-4">
                    {['Command', 'Livraison', 'Aucune'].map((opt) =>
                  <label
                    key={opt}
                    className="flex items-center gap-2 cursor-pointer">
                    
                        <input
                      type="radio"
                      name="liaison"
                      value={opt}
                      checked={fLiaison === opt}
                      onChange={() => {
                        setFLiaison(opt as any);
                        setFRefLiaison('');
                      }}
                      className="text-sky-600 focus:ring-sky-500" />
                    
                        <span className="text-sm text-slate-700">{opt}</span>
                      </label>
                  )}
                  </div>
                  {fLiaison === 'Command' &&
                <div className="relative mt-4">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        REF Bon Commande
                      </label>
                      <select
                    value={fRefLiaison}
                    onChange={(e) => setFRefLiaison(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
                    
                        <option value="">Sélectionner une commande...</option>
                        {commandes.map((c) =>
                    <option key={c.id} value={c.reference}>
                            {c.reference}
                          </option>
                    )}
                      </select>
                    </div>
                }
                  {fLiaison === 'Livraison' &&
                <div className="relative mt-4">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        REF Bon Livraison
                      </label>
                      <select
                    value={fRefLiaison}
                    onChange={(e) => setFRefLiaison(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
                    
                        <option value="">Sélectionner une livraison...</option>
                        {livraisons.map((l) =>
                    <option key={l.id} value={l.reference}>
                            {l.reference}
                          </option>
                    )}
                      </select>
                    </div>
                }
                </div>
                <FloatingLabelInput
                label="Timbre fiscal (TND)"
                type="number"
                value={fTimbre}
                onChange={setFTimbre}
                step="0.001" />
              
              </div>
            }
            {phase === 'facture' && fLiaison === 'Aucune' && step === 2 &&
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                      Type de mouvement
                    </label>
                    <select
                    value={fTypeMvt}
                    onChange={(e) =>
                    setFTypeMvt(e.target.value as TypeMouvement)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
                    
                      <option value="Achat">Achat</option>
                      <option value="Vente">Vente</option>
                    </select>
                  </div>
                  <FloatingLabelInput
                  label={fTypeMvt === 'Achat' ? 'Fournisseur' : 'Client'}
                  value={fTiers}
                  onChange={setFTiers}
                  required />
                
                </div>
                {renderArticleForm('facture')}
                {renderArticlesTable(fArticles, 'facture')}
              </div>
            }
            {phase === 'facture' && (
            fLiaison !== 'Aucune' && step === 2 ||
            fLiaison === 'Aucune' && step === 3) &&
            <div className="space-y-5">
                  <h4 className="text-lg font-bold text-slate-800 mb-4">
                    Informations de paiement
                  </h4>

                  {/* Auto-calculated totals summary */}
                  {(() => {
                let relevantArticles: Article[] = [];
                if (fLiaison === 'Command') {
                  const cmd = commandes.find(
                    (c) => c.reference === fRefLiaison
                  );
                  if (cmd) relevantArticles = cmd.articles;
                } else if (fLiaison === 'Livraison') {
                  const liv = livraisons.find(
                    (l) => l.reference === fRefLiaison
                  );
                  if (liv) {
                    if (liv.articles && liv.articles.length > 0) {
                      relevantArticles = liv.articles;
                    } else {
                      const cmd = commandes.find(
                        (c) => c.reference === liv.refBonCommande
                      );
                      if (cmd) relevantArticles = cmd.articles;
                    }
                  }
                } else {
                  relevantArticles = fArticles;
                }
                const totalHT = relevantArticles.reduce((acc, a) => {
                  return acc + a.quantite * a.puht * (1 - a.remise / 100);
                }, 0);
                const totalArticlesTTC = relevantArticles.reduce(
                  (acc, a) => acc + a.ttc,
                  0
                );
                const timbreFiscal = parseFloat(fTimbre) || 0;
                const totalTTC = totalArticlesTTC + timbreFiscal;
                const netAPayer = totalTTC;
                return (
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                        <p className="text-sm font-bold text-slate-800 mb-2">
                          Récapitulatif financier
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-emerald-200">
                          <p className="text-xs text-slate-500 mb-1">
                            Montant total à payer
                          </p>
                          <p className="text-2xl font-bold text-emerald-700">
                            {netAPayer.toFixed(3)} TND
                          </p>
                        </div>
                      </div>);

              })()}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        État de payement
                      </label>
                      <select
                    value={fEtat}
                    onChange={(e) =>
                    setFEtat(e.target.value as EtatPaiement)
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
                    
                        <option value="non payé">Non payé</option>
                        <option value="payé">Payé</option>
                        <option value="en attente de payement">
                          En attente de payement
                        </option>
                        <option value="en cours de payement">
                          En cours de payement
                        </option>
                        <option value="livré">Livré</option>
                      </select>
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                        Mode de règlement
                      </label>
                      <select
                    value={fMode}
                    onChange={(e) => setFMode(e.target.value as any)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
                    
                        <option value="espèce">Espèce</option>
                        <option value="chéque">Chèque</option>
                        <option value="virement">Virement</option>
                      </select>
                    </div>
                  </div>

                  <FloatingLabelInput
                label="Date de paiement"
                type="date"
                value={fDatePaiement}
                onChange={setFDatePaiement} />
              

                  {/* Conditions de règlement */}
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                    <p className="text-sm font-bold text-slate-800">
                      Conditions de règlement
                    </p>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                      type="radio"
                      name="conditionsReglement"
                      value="Paiement immédiat"
                      checked={fCondReglement === 'Paiement immédiat'}
                      onChange={() => {
                        setFCondReglement('Paiement immédiat');
                        setFEcheances([]);
                      }}
                      className="text-sky-600 focus:ring-sky-500" />
                    
                        <span className="text-sm text-slate-700">
                          Paiement immédiat
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                      type="radio"
                      name="conditionsReglement"
                      value="Paiement par tranche"
                      checked={fCondReglement === 'Paiement par tranche'}
                      onChange={() =>
                      setFCondReglement('Paiement par tranche')
                      }
                      className="text-sky-600 focus:ring-sky-500" />
                    
                        <span className="text-sm text-slate-700">
                          Paiement par tranche
                        </span>
                      </label>
                    </div>

                    {/* Conditional field for Paiement immédiat */}
                    {fCondReglement === 'Paiement immédiat' &&
                <div className="pt-4 border-t border-slate-200">
                        <FloatingLabelInput
                    label="Date de paiement"
                    type="date"
                    value={fDatePaiement}
                    onChange={setFDatePaiement} />
                  
                      </div>
                }

                    {/* Conditional fields for Paiement par tranche */}
                    {fCondReglement === 'Paiement par tranche' &&
                <div className="space-y-4 pt-4 border-t border-slate-200">
                        <FloatingLabelInput
                    label="Date de paiement de la 1ère échéance"
                    type="date"
                    value={fDatePremiereEcheance}
                    onChange={setFDatePremiereEcheance} />
                  
                        <div className="grid grid-cols-2 gap-4">
                          <FloatingLabelInput
                      label="Intervalle entre échéances (en jours)"
                      type="number"
                      value={fNombreEcheanceJour}
                      onChange={setFNombreEcheanceJour}
                      min="1" />
                    
                          <FloatingLabelInput
                      label="Nombre des tranches"
                      type="number"
                      value={fNombreTranches}
                      onChange={setFNombreTranches}
                      min="2" />
                    
                        </div>

                        {/* Échéances preview table */}
                        {fEcheances.length > 0 &&
                  <div className="mt-4">
                            <p className="text-sm font-bold text-slate-800 mb-3">
                              Aperçu des échéances ({fEcheances.length})
                            </p>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                              <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 border-b border-slate-200">
                                  <tr>
                                    <th className="px-3 py-2 font-semibold text-slate-600">
                                      N°
                                    </th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">
                                      Montant
                                    </th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">
                                      Date
                                    </th>
                                    <th className="px-3 py-2 font-semibold text-slate-600">
                                      État
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {fEcheances.map((ech) =>
                          <tr key={ech.numero}>
                                      <td className="px-3 py-2">
                                        {ech.numero}
                                      </td>
                                      <td className="px-3 py-2 font-medium">
                                        {ech.montant.toFixed(2)} TND
                                      </td>
                                      <td className="px-3 py-2">
                                        {ech.datePaiement}
                                      </td>
                                      <td className="px-3 py-2">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                          {ech.etatPaiement}
                                        </span>
                                      </td>
                                    </tr>
                          )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                  }
                      </div>
                }
                  </div>
                </div>
            }
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
            {phase === 'select' ?
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
              
                Annuler
              </button> :

            <>
                <button
                onClick={() =>
                step > 1 ? setStep(step - 1) : setPhase('select')
                }
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                
                  Retour
                </button>
                {phase === 'commande' && step === 1 ||
              phase === 'livraison' && step === 1 && !lIsLinkedToBC ||
              phase === 'facture' && step === 1 ||
              phase === 'facture' && fLiaison === 'Aucune' && step === 2 ?
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors">
                
                    Suivant <ArrowRight className="w-4 h-4" />
                  </button> :

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors">
                
                    <CheckCircle className="w-4 h-4" /> Enregistrer
                  </button>
              }
              </>
            }
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// 2. View Articles Modal
function ViewArticlesModal({
  isOpen,
  onClose,
  document,
  onUpdateArticle,
  onDeleteArticle,
  onAddArticle







}: {isOpen: boolean;onClose: () => void;document: any;onUpdateArticle?: (articleId: string, updatedArticle: Article) => void;onDeleteArticle?: (articleId: string) => void;onAddArticle?: (article: Article) => void;}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Article | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  // Add form state
  const [artNom, setArtNom] = useState('');
  const [artQte, setArtQte] = useState('1');
  const [artPuht, setArtPuht] = useState('0');
  const [artTva, setArtTva] = useState('19');
  const [artRemise, setArtRemise] = useState('0');
  if (!isOpen || !document || !document.articles) return null;
  const handleStartEdit = (article: Article) => {
    setEditingId(article.id);
    setEditForm({
      ...article
    });
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };
  const handleSaveEdit = () => {
    if (editForm && onUpdateArticle) {
      // Recalculate TTC
      const ht = editForm.quantite * editForm.puht;
      const htRemise = ht * (1 - editForm.remise / 100);
      const ttc = htRemise * (1 + editForm.tva / 100);
      const updatedArticle = {
        ...editForm,
        ttc: parseFloat(ttc.toFixed(3))
      };
      onUpdateArticle(editForm.id, updatedArticle);
      setEditingId(null);
      setEditForm(null);
    }
  };
  const handleDelete = (articleId: string) => {
    if (
    onDeleteArticle &&
    confirm('Êtes-vous sûr de vouloir supprimer cet article ?'))
    {
      onDeleteArticle(articleId);
    }
  };
  const handleAddSubmit = () => {
    if (!artNom || !artQte || !artPuht) return;
    const q = parseFloat(artQte);
    const p = parseFloat(artPuht);
    const t = parseFloat(artTva);
    const r = parseFloat(artRemise);
    const ht = q * p;
    const htRemise = ht * (1 - r / 100);
    const ttc = htRemise * (1 + t / 100);
    const newArt: Article = {
      id: Date.now().toString(),
      nom: artNom,
      quantite: q,
      puht: p,
      tva: t,
      remise: r,
      ttc: parseFloat(ttc.toFixed(3))
    };
    if (onAddArticle) onAddArticle(newArt);
    setArtNom('');
    setArtQte('1');
    setArtPuht('0');
    setArtRemise('0');
    setShowAddForm(false);
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title={`Détails des articles - ${document.reference}`}
            onClose={onClose}
            actions={
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-primary-foreground rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" />
                Ajouter un article
              </button>
            }
          />
          <div className="flex-1 overflow-y-auto">
            {showAddForm && (
            <div className="mx-4 mt-4 mb-2 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800">Nouvel article</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
                      Article
                    </label>
                    <select
                    value={artNom}
                    onChange={(e) => setArtNom(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm bg-white">
                    
                      <option value="">Sélectionner un article...</option>
                      {MOCK_ARTICLES.map((a) =>
                    <option key={a.id} value={a.nom}>
                          {a.nom}
                        </option>
                    )}
                    </select>
                  </div>
                  <FloatingLabelInput
                  label="Quantité"
                  type="number"
                  value={artQte}
                  onChange={setArtQte}
                  min="1" />
                
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FloatingLabelInput
                  label="PUHT"
                  type="number"
                  value={artPuht}
                  onChange={setArtPuht} />
                
                  <FloatingLabelInput
                  label="TVA %"
                  type="number"
                  value={artTva}
                  onChange={setArtTva} />
                
                  <FloatingLabelInput
                  label="Remise %"
                  type="number"
                  value={artRemise}
                  onChange={setArtRemise} />
                
                </div>
                <div className="flex justify-end gap-2">
                  <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                  
                    Annuler
                  </button>
                  <button
                  type="button"
                  onClick={handleAddSubmit}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  
                    Ajouter
                  </button>
                </div>
              </div>
            )}
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Nom de la pièce
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Quantités
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    PUHT
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Remise(%)
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    TVA(%)
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Total TTC
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {document.articles.map((a) =>
                <tr key={a.id} className="hover:bg-slate-50">
                    {editingId === a.id && editForm ?
                  <>
                        <td className="px-4 py-3">
                          <input
                        type="text"
                        value={editForm.nom}
                        onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          nom: e.target.value
                        })
                        }
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm" />
                      
                        </td>
                        <td className="px-4 py-3">
                          <input
                        type="number"
                        value={editForm.quantite}
                        onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          quantite: parseFloat(e.target.value) || 0
                        })
                        }
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-sm" />
                      
                        </td>
                        <td className="px-4 py-3">
                          <input
                        type="number"
                        value={editForm.puht}
                        onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          puht: parseFloat(e.target.value) || 0
                        })
                        }
                        className="w-24 px-2 py-1 border border-slate-300 rounded text-sm" />
                      
                        </td>
                        <td className="px-4 py-3">
                          <input
                        type="number"
                        value={editForm.remise}
                        onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          remise: parseFloat(e.target.value) || 0
                        })
                        }
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-sm" />
                      
                        </td>
                        <td className="px-4 py-3">
                          <input
                        type="number"
                        value={editForm.tva}
                        onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          tva: parseFloat(e.target.value) || 0
                        })
                        }
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-sm" />
                      
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {(
                      editForm.quantite *
                      editForm.puht * (
                      1 - editForm.remise / 100) * (
                      1 + editForm.tva / 100)).
                      toFixed(3)}{' '}
                          TND
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                          onClick={handleSaveEdit}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Enregistrer">
                          
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                          onClick={handleCancelEdit}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                          title="Annuler">
                          
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </> :

                  <>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {a.nom}
                        </td>
                        <td className="px-4 py-3">{a.quantite}</td>
                        <td className="px-4 py-3">{a.puht} TND</td>
                        <td className="px-4 py-3">{a.remise}%</td>
                        <td className="px-4 py-3">{a.tva}%</td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {a.ttc} TND
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                          onClick={() => handleStartEdit(a)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier">
                          
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Supprimer">
                          
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                  }
                  </tr>
                )}
              </tbody>
            </table>
            <div className="mt-6 flex justify-end">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">Total Global TTC</p>
                <p className="text-2xl font-bold text-slate-800">
                  {document.articles.
                  reduce((acc, a) => acc + a.ttc, 0).
                  toFixed(3)}{' '}
                  TND
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Main Component ---
export function GestionFactures() {
  const [activeTab, setActiveTab] = useState<
    'commandes' | 'livraisons' | 'factures'>(
    'commandes');
  // Data states
  const [commandes, setCommandes] = useState<BonCommande[]>(MOCK_COMMANDES);
  const [livraisons, setLivraisons] = useState<BonLivraison[]>(MOCK_LIVRAISONS);
  const [factures, setFactures] = useState<Facture[]>(MOCK_FACTURES);
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTypeMvt, setFilterTypeMvt] = useState('Tous');
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);
  const [viewArticlesDoc, setViewArticlesDoc] = useState<any>(null);
  const [echeancesFacture, setEcheancesFacture] = useState<Facture | null>(null);
  const handleViewArticles = (
  doc: any,
  type: 'commande' | 'livraison' | 'facture') =>
  {
    let resolvedArticles = doc.articles || [];
    if (type === 'livraison') {
      if (doc.articles && doc.articles.length > 0) {
        resolvedArticles = doc.articles;
      } else {
        const cmd = commandes.find((c) => c.reference === doc.refBonCommande);
        if (cmd) resolvedArticles = cmd.articles;
      }
    } else if (type === 'facture' && doc.refLiaison) {
      if (doc.pieceCommerciale === 'bon commande') {
        const cmd = commandes.find((c) => c.reference === doc.refLiaison);
        if (cmd) resolvedArticles = cmd.articles;
      } else if (doc.pieceCommerciale === 'bon livraison') {
        const liv = livraisons.find((l) => l.reference === doc.refLiaison);
        if (liv) {
          if (liv.articles && liv.articles.length > 0) {
            resolvedArticles = liv.articles;
          } else {
            const cmd = commandes.find(
              (c) => c.reference === liv.refBonCommande
            );
            if (cmd) resolvedArticles = cmd.articles;
          }
        }
      }
    }
    setViewArticlesDoc({
      ...doc,
      articles: resolvedArticles,
      _docType: type
    });
  };
  const handleAddArticle = (newArticle: Article) => {
    if (!viewArticlesDoc) return;
    const type = viewArticlesDoc._docType;
    let targetCmdRef = null;
    if (type === 'commande') targetCmdRef = viewArticlesDoc.reference;else
    if (type === 'livraison') targetCmdRef = viewArticlesDoc.refBonCommande;else
    if (type === 'facture' && viewArticlesDoc.refLiaison) {
      if (viewArticlesDoc.pieceCommerciale === 'bon commande')
      targetCmdRef = viewArticlesDoc.refLiaison;else
      if (viewArticlesDoc.pieceCommerciale === 'bon livraison') {
        const liv = livraisons.find(
          (l: BonLivraison) => l.reference === viewArticlesDoc.refLiaison
        );
        if (liv) targetCmdRef = liv.refBonCommande;
      }
    }
    if (targetCmdRef) {
      setCommandes(
        commandes.map((c) =>
        c.reference === targetCmdRef ?
        {
          ...c,
          articles: [...c.articles, newArticle]
        } :
        c
        )
      );
    } else if (type === 'facture') {
      setFactures(
        factures.map((f) =>
        f.id === viewArticlesDoc.id ?
        {
          ...f,
          articles: [...(f.articles || []), newArticle]
        } :
        f
        )
      );
    }
    setViewArticlesDoc({
      ...viewArticlesDoc,
      articles: [...viewArticlesDoc.articles, newArticle]
    });
  };
  // Handlers for article updates
  const handleUpdateArticle = (articleId: string, updatedArticle: Article) => {
    if (!viewArticlesDoc) return;
    const updatedArticles = viewArticlesDoc.articles!.map((a: Article) =>
    a.id === articleId ? updatedArticle : a
    );
    const type = viewArticlesDoc._docType;
    let targetCmdRef = null;
    if (type === 'commande') targetCmdRef = viewArticlesDoc.reference;else
    if (type === 'livraison') targetCmdRef = viewArticlesDoc.refBonCommande;else
    if (type === 'facture' && viewArticlesDoc.refLiaison) {
      if (viewArticlesDoc.pieceCommerciale === 'bon commande')
      targetCmdRef = viewArticlesDoc.refLiaison;else
      if (viewArticlesDoc.pieceCommerciale === 'bon livraison') {
        const liv = livraisons.find(
          (l: BonLivraison) => l.reference === viewArticlesDoc.refLiaison
        );
        if (liv) targetCmdRef = liv.refBonCommande;
      }
    }
    if (targetCmdRef) {
      setCommandes(
        commandes.map((c) =>
        c.reference === targetCmdRef ?
        {
          ...c,
          articles: updatedArticles
        } :
        c
        )
      );
    } else if (type === 'facture') {
      setFactures(
        factures.map((f) =>
        f.id === viewArticlesDoc.id ?
        {
          ...f,
          articles: updatedArticles
        } :
        f
        )
      );
    }
    setViewArticlesDoc({
      ...viewArticlesDoc,
      articles: updatedArticles
    });
  };
  const handleDeleteArticle = (articleId: string) => {
    if (!viewArticlesDoc) return;
    const updatedArticles = viewArticlesDoc.articles!.filter(
      (a: Article) => a.id !== articleId
    );
    const type = viewArticlesDoc._docType;
    let targetCmdRef = null;
    if (type === 'commande') targetCmdRef = viewArticlesDoc.reference;else
    if (type === 'livraison') targetCmdRef = viewArticlesDoc.refBonCommande;else
    if (type === 'facture' && viewArticlesDoc.refLiaison) {
      if (viewArticlesDoc.pieceCommerciale === 'bon commande')
      targetCmdRef = viewArticlesDoc.refLiaison;else
      if (viewArticlesDoc.pieceCommerciale === 'bon livraison') {
        const liv = livraisons.find(
          (l: BonLivraison) => l.reference === viewArticlesDoc.refLiaison
        );
        if (liv) targetCmdRef = liv.refBonCommande;
      }
    }
    if (targetCmdRef) {
      setCommandes(
        commandes.map((c) =>
        c.reference === targetCmdRef ?
        {
          ...c,
          articles: updatedArticles
        } :
        c
        )
      );
    } else if (type === 'facture') {
      setFactures(
        factures.map((f) =>
        f.id === viewArticlesDoc.id ?
        {
          ...f,
          articles: updatedArticles
        } :
        f
        )
      );
    }
    setViewArticlesDoc({
      ...viewArticlesDoc,
      articles: updatedArticles
    });
  };
  const handleUpdateEcheance = (numero: number, updatedEcheance: Echeance) => {
    if (!echeancesFacture || !echeancesFacture.echeances) return;
    const updatedEcheances = echeancesFacture.echeances.map((e) =>
    e.numero === numero ? updatedEcheance : e
    );
    const updatedFacture = {
      ...echeancesFacture,
      echeances: updatedEcheances
    };
    setFactures(
      factures.map((f) => f.id === updatedFacture.id ? updatedFacture : f)
    );
    setEcheancesFacture(updatedFacture);
  };
  // Reset pagination on tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  // Filtering logic
  const filteredCommandes = useMemo(
    () =>
    commandes.filter((c) => {
      if (filterDate && c.dateOperation !== filterDate) return false;
      if (filterTypeMvt !== 'Tous' && c.typeMouvement !== filterTypeMvt)
      return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          c.reference.toLowerCase().includes(term) ||
          c.dateOperation.toLowerCase().includes(term) ||
          c.tiers.toLowerCase().includes(term) ||
          c.typeMouvement.toLowerCase().includes(term));

      }
      return true;
    }),
    [commandes, filterDate, filterTypeMvt, searchTerm]
  );
  const filteredLivraisons = useMemo(
    () =>
    livraisons.filter((l) => {
      if (filterDate && l.dateOperation !== filterDate) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          l.reference.toLowerCase().includes(term) ||
          l.dateOperation.toLowerCase().includes(term) ||
          l.refBonCommande.toLowerCase().includes(term));

      }
      return true;
    }),
    [livraisons, filterDate, searchTerm]
  );
  const filteredFactures = useMemo(
    () =>
    factures.filter((f) => {
      if (filterDate && f.dateOperation !== filterDate) return false;
      if (filterTypeMvt !== 'Tous' && f.typeMouvement !== filterTypeMvt)
      return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          f.reference.toLowerCase().includes(term) ||
          f.dateOperation.toLowerCase().includes(term) ||
          f.fournisseur.toLowerCase().includes(term) ||
          f.client.toLowerCase().includes(term) ||
          f.etatPaiement.toLowerCase().includes(term) ||
          f.refLiaison && f.refLiaison.toLowerCase().includes(term));

      }
      return true;
    }),
    [factures, filterDate, filterTypeMvt, searchTerm]
  );
  // Pagination logic
  const currentData =
  activeTab === 'commandes' ?
  filteredCommandes :
  activeTab === 'livraisons' ?
  filteredLivraisons :
  filteredFactures;
  const totalItems = currentData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(startIndex, startIndex + itemsPerPage);
  const handleDelete = (
  id: string,
  type: 'commande' | 'livraison' | 'facture') =>
  {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    if (type === 'commande') setCommandes(commandes.filter((c) => c.id !== id));else
    if (type === 'livraison')
    setLivraisons(livraisons.filter((l) => l.id !== id));else
    setFactures(factures.filter((f) => f.id !== id));
  };
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header & Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion Pièces commerciales
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez vos bons de commande, bons de livraison et factures
            </p>
          </div>
          <button
            onClick={() => {
              setEditDoc(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            
            <Plus className="w-4 h-4" />
            Ajouter un document
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('commandes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'commandes' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}>
            
            Bons de commande
          </button>
          <button
            onClick={() => setActiveTab('livraisons')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'livraisons' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}>
            
            Bons de livraison
          </button>
          <button
            onClick={() => setActiveTab('factures')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'factures' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}>
            
            Factures
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 py-4 flex-shrink-0">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" /> Filtres :
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white" />
          
          <select
            value={filterTypeMvt}
            onChange={(e) => setFilterTypeMvt(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white">
            
            <option value="Tous">Tous les mouvements</option>
            <option value="Achat">Achat</option>
            <option value="Vente">Vente</option>
          </select>
          {(searchTerm || filterDate || filterTypeMvt !== 'Tous') &&
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
              setFilterTypeMvt('Tous');
            }}
            className="text-sm text-rose-500 hover:text-rose-700 font-medium ml-auto">
            
              Effacer les filtres
            </button>
          }
        </div>
      </div>

      {/* Tables Area */}
      <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            {activeTab === 'commandes' &&
            <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Type Mvt
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      REF Bon Commande
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Date d'opération
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Tiers (Fournisseur/Client)
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(paginatedData as BonCommande[]).map((c) =>
                <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${c.typeMouvement === 'Achat' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      
                          {c.typeMouvement}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {c.reference}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {c.dateOperation}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.tiers}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                        onClick={() => handleViewArticles(c, 'commande')}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                        title="Voir les articles">
                        
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => {
                          setEditDoc(c);
                          setIsAddModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Modifier">
                        
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => handleDelete(c.id, 'commande')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-500">
                    
                        Aucun bon de commande trouvé
                      </td>
                    </tr>
                }
                </tbody>
              </table>
            }

            {activeTab === 'livraisons' &&
            <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      REF Bon Livraison
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Date d'opération
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Type Mvt
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Tiers
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      REF BC liée
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase text-center">
                      Effet Stock
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(paginatedData as BonLivraison[]).map((l) => {
                  const linkedCmd = l.refBonCommande ?
                  commandes.find((c) => c.reference === l.refBonCommande) :
                  null;
                  const typeMvt =
                  l.typeMouvement || linkedCmd?.typeMouvement || '-';
                  const tiers = l.tiers || linkedCmd?.tiers || '-';
                  return (
                    <tr key={l.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {l.reference}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {l.dateOperation}
                        </td>
                        <td className="px-6 py-4">
                          {typeMvt !== '-' ?
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${typeMvt === 'Achat' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                          
                              {typeMvt}
                            </span> :

                        <span className="text-slate-400">-</span>
                        }
                        </td>
                        <td className="px-6 py-4 text-slate-600">{tiers}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {l.refBonCommande || '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {l.effetStock ?
                        <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" /> :

                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                        }
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                            onClick={() => handleViewArticles(l, 'livraison')}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                            title="Voir les articles">
                            
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                            onClick={() => {
                              setEditDoc(l);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Modifier">
                            
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                            onClick={() => handleDelete(l.id, 'livraison')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Supprimer">
                            
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>);

                })}
                  {paginatedData.length === 0 &&
                <tr>
                      <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-500">
                    
                        Aucun bon de livraison trouvé
                      </td>
                    </tr>
                }
                </tbody>
              </table>
            }

            {activeTab === 'factures' &&
            <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Tiers
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      État
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Total TTC
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                      Liaison
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(paginatedData as Facture[]).map((f) =>
                <tr key={f.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {f.reference}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {f.dateOperation}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {f.typeMouvement === 'Achat' ? f.fournisseur : f.client}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={f.etatPaiement} />
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {f.totalTTC} TND
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {f.refLiaison || 'Aucune'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {f.conditionsReglement === 'Paiement par tranche' &&
                      f.echeances &&
                      f.echeances.length > 0 &&
                      <button
                        onClick={() => setEcheancesFacture(f)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Voir les échéances">
                        
                                <ListChecks className="w-4 h-4" />
                              </button>
                      }
                          <button
                        onClick={() => handleViewArticles(f, 'facture')}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                        title="Voir les articles">
                        
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => {
                          setEditDoc(f);
                          setIsAddModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Modifier">
                        
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => handleDelete(f.id, 'facture')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
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
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-500">
                    
                        Aucune facture trouvée
                      </td>
                    </tr>
                }
                </tbody>
              </table>
            }
          </div>
          <TableFooter
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage} />
          
        </div>
      </div>

      <AddEditDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditDoc(null);
        }}
        commandes={commandes}
        livraisons={livraisons}
        editData={editDoc}
        onSaveCommande={(c) => {
          if (editDoc) {
            setCommandes(commandes.map((cmd) => cmd.id === c.id ? c : cmd));
          } else {
            setCommandes([...commandes, c]);
          }
        }}
        onSaveLivraison={(l) => {
          if (editDoc) {
            setLivraisons(livraisons.map((liv) => liv.id === l.id ? l : liv));
          } else {
            setLivraisons([...livraisons, l]);
          }
        }}
        onSaveFacture={(f) => {
          if (editDoc) {
            setFactures(factures.map((fac) => fac.id === f.id ? f : fac));
          } else {
            setFactures([...factures, f]);
          }
        }} />
      

      <ViewArticlesModal
        isOpen={!!viewArticlesDoc}
        onClose={() => setViewArticlesDoc(null)}
        document={viewArticlesDoc}
        onUpdateArticle={handleUpdateArticle}
        onDeleteArticle={handleDeleteArticle}
        onAddArticle={handleAddArticle} />
      

      <EcheancesModal
        isOpen={!!echeancesFacture}
        onClose={() => setEcheancesFacture(null)}
        factureRef={echeancesFacture?.reference || ''}
        echeances={echeancesFacture?.echeances || []}
        onUpdateEcheance={handleUpdateEcheance} />
      
    </div>);

}