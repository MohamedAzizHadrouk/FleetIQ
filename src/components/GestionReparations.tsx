import React, { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableFooter } from './TableFooter';
import { Sinistre } from './GestionSinistres';
import { ModalHeader } from '@/components/ui/modal-header';
interface Repair {
  id: number;
  dateCompletion: string;
  mileageCompletion: number;
  cost: number;
  paidCost: number;
  paidDate: string;
  description: string;
  invoiceReference: string;
  supplier: string;
}
// Mock data for repairs
const MOCK_REPAIRS: Repair[] = [
{
  id: 1,
  dateCompletion: '27 nov. 2021',
  mileageCompletion: 105415.3984375,
  cost: 0.04,
  paidCost: 0.04,
  paidDate: '10 mars 2026',
  description: '',
  invoiceReference: '',
  supplier: ''
}];

interface GestionReparationsProps {
  sinistre: Sinistre;
  onBack: () => void;
}
export function GestionReparations({
  sinistre,
  onBack
}: GestionReparationsProps) {
  const [repairs, setRepairs] = useState<Repair[]>(MOCK_REPAIRS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Pagination
  const totalItems = repairs.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRepairs = repairs.slice(startIndex, startIndex + itemsPerPage);
  // Totals
  const totalCost = repairs.reduce((sum, r) => sum + r.cost, 0);
  const totalPaid = repairs.reduce((sum, r) => sum + r.paidCost, 0);
  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réparation ?')) {
      setRepairs(repairs.filter((r) => r.id !== id));
    }
  };
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="p-6 space-y-6 w-full flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm border border-slate-200"
              title="Retour aux sinistres">
              
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Réparations</h1>
              <p className="text-sm text-slate-500">
                Véhicule:{' '}
                <span className="font-medium">{sinistre.vehicule}</span> |{' '}
                Sinistre #{sinistre.id}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
            
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-semibold">DateCompletion</th>
                  <th className="px-4 py-3 font-semibold">MileageCompletion</th>
                  <th className="px-4 py-3 font-semibold">Cost</th>
                  <th className="px-4 py-3 font-semibold">PaidCost</th>
                  <th className="px-4 py-3 font-semibold">PaidDate</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">InvoiceReference</th>
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRepairs.length === 0 ?
                <tr>
                    <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-slate-500">
                    
                      Aucune réparation trouvée.
                    </td>
                  </tr> :

                paginatedRepairs.map((repair) =>
                <tr
                  key={repair.id}
                  className="hover:bg-slate-50 transition-colors">
                  
                      <td className="px-4 py-3 text-slate-700">
                        {repair.dateCompletion}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {repair.mileageCompletion}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {repair.cost}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {repair.paidCost}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {repair.paidDate}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {repair.description}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {repair.invoiceReference}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {repair.supplier}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Modifier">
                        
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => handleDelete(repair.id)}
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
              <tfoot className="border-t border-slate-200 bg-white sticky bottom-0 z-10">
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-4 text-sm font-medium text-red-500">
                    
                    {totalCost.toFixed(3)} د.ت
                  </td>
                  <td
                    colSpan={5}
                    className="px-4 py-4 text-sm font-medium text-green-500">
                    
                    {totalPaid.toFixed(3)} د.ت
                  </td>
                </tr>
              </tfoot>
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

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal &&
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
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}>
          
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
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
              <ModalHeader
                title="Ajouter"
                onClose={() => setShowAddModal(false)}
                size="compact"
              />

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-5">
                  {/* Row 1 */}
                  <FloatingInput
                  label="Date d'achèvement"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]} />
                

                  {/* Row 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FloatingInput
                    label="Heures d'achèvement"
                    type="number"
                    defaultValue="0" />
                  
                    <FloatingInput
                    label="Kilométrage d'achèvement"
                    type="number"
                    defaultValue="0" />
                  
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FloatingInput
                    label="Coût"
                    type="number"
                    defaultValue="0" />
                  
                    <FloatingInput
                    label="Coût payé"
                    type="number"
                    defaultValue="0" />
                  
                  </div>

                  {/* Row 4 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FloatingInput
                    label="Payment date"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]} />
                  
                    <FloatingInput label="Référence de facture" type="text" />
                  </div>

                  {/* Row 5 */}
                  <FloatingInput label="Fournisseur" type="text" />

                  {/* Row 6 */}
                  <div className="relative pt-2">
                    <label className="absolute top-0 left-3 bg-white px-1 text-xs text-slate-500 z-10">
                      Description
                    </label>
                    <textarea
                    rows={3}
                    className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none bg-transparent relative z-0 resize-none">
                  </textarea>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
                <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium rounded-md transition-colors shadow-sm">
                
                  Ajouter
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
// Helper component for floating labels
function FloatingInput({
  label,
  type = 'text',
  defaultValue = '',
  ...props





}: {label: string;type?: string;defaultValue?: string | number;[key: string]: any;}) {
  return (
    <div className="relative pt-2">
      <label className="absolute top-0 left-3 bg-white px-1 text-xs text-slate-500 z-10">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] outline-none bg-transparent relative z-0"
        {...props} />
      
    </div>);

}