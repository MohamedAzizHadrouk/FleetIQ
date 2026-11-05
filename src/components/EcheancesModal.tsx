import React, { useState } from 'react';
import { Edit, Check, XCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalHeader } from '@/components/ui/modal-header';
interface Echeance {
  numero: number;
  montant: number;
  datePaiement: string;
  etatPaiement: 'payé' | 'non payé';
}
interface EcheancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  factureRef: string;
  echeances: Echeance[];
  onUpdateEcheance: (numero: number, updatedEcheance: Echeance) => void;
}
export function EcheancesModal({
  isOpen,
  onClose,
  factureRef,
  echeances,
  onUpdateEcheance
}: EcheancesModalProps) {
  const [editingNumero, setEditingNumero] = useState<number | null>(null);
  const [editMontant, setEditMontant] = useState('');
  if (!isOpen) return null;
  const handleStartEdit = (ech: Echeance) => {
    setEditingNumero(ech.numero);
    setEditMontant(ech.montant.toString());
  };
  const handleSaveEdit = (ech: Echeance) => {
    const newMontant = parseFloat(editMontant);
    if (!isNaN(newMontant) && newMontant > 0) {
      onUpdateEcheance(ech.numero, {
        ...ech,
        montant: newMontant
      });
    }
    setEditingNumero(null);
    setEditMontant('');
  };
  const handleCancelEdit = () => {
    setEditingNumero(null);
    setEditMontant('');
  };
  const handleTogglePaiement = (ech: Echeance) => {
    onUpdateEcheance(ech.numero, {
      ...ech,
      etatPaiement: ech.etatPaiement === 'payé' ? 'non payé' : 'payé'
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <ModalHeader
            title="Tableau des échéances"
            subtitle={`Facture: ${factureRef}`}
            onClose={onClose}
          />

          <div className="p-6 overflow-y-auto">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Numéro
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Montant d'échéance
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Date de paiement
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      État de paiement
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {echeances.map((ech) =>
                  <tr key={ech.numero} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        Échéance {ech.numero}
                      </td>
                      <td className="px-4 py-3">
                        {editingNumero === ech.numero ?
                      <div className="flex items-center gap-2">
                            <input
                          type="number"
                          value={editMontant}
                          onChange={(e) => setEditMontant(e.target.value)}
                          className="w-32 px-2 py-1 border border-slate-300 rounded text-sm"
                          step="0.01" />
                        
                            <span className="text-slate-600">TND</span>
                          </div> :

                      <span className="font-bold text-slate-800">
                            {ech.montant.toFixed(2)} TND
                          </span>
                      }
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {ech.datePaiement}
                      </td>
                      <td className="px-4 py-3">
                        {ech.etatPaiement === 'payé' ?
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Payé
                          </span> :

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Non payé
                          </span>
                      }
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingNumero === ech.numero ?
                        <>
                              <button
                            onClick={() => handleSaveEdit(ech)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Enregistrer">
                            
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                            onClick={handleCancelEdit}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                            title="Annuler">
                            
                                <XCircle className="w-4 h-4" />
                              </button>
                            </> :

                        <>
                              <button
                            onClick={() => handleStartEdit(ech)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Modifier le montant">
                            
                                <Edit className="w-4 h-4" />
                              </button>
                              {ech.etatPaiement === 'non payé' ?
                          <button
                            onClick={() => handleTogglePaiement(ech)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Valider le paiement">
                            
                                  <Check className="w-4 h-4" />
                                </button> :

                          <button
                            onClick={() => handleTogglePaiement(ech)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Annuler la validation">
                            
                                  <XCircle className="w-4 h-4" />
                                </button>
                          }
                            </>
                        }
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">Total des échéances</p>
                <p className="text-2xl font-bold text-slate-800">
                  {echeances.
                  reduce((acc, ech) => acc + ech.montant, 0).
                  toFixed(2)}{' '}
                  TND
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}