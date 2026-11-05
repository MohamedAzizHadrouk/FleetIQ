import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, User, ChevronDown } from 'lucide-react';
import { ModalHeader } from '@/components/ui/modal-header';
import { Sinistre } from './GestionSinistres';
interface AddEditSinistreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Sinistre>) => void;
  sinistre?: Sinistre | null;
  vehicules: string[];
}
export function AddEditSinistreModal({
  isOpen,
  onClose,
  onSave,
  sinistre,
  vehicules
}: AddEditSinistreModalProps) {
  const [formData, setFormData] = useState<Partial<Sinistre>>({
    reference: '',
    vehicule: '',
    typeAccident: '',
    dateAccident: '',
    emplacement: '',
    chauffeur: '',
    details: '',
    description: ''
  });
  useEffect(() => {
    if (sinistre) {
      // Try to format the date for the date input if it's in DD/MM/YYYY format
      let formattedDate = sinistre.dateAccident;
      if (formattedDate && formattedDate.includes('/')) {
        const parts = formattedDate.split(' ')[0].split('/');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      setFormData({
        ...sinistre,
        dateAccident: formattedDate
      });
    } else {
      setFormData({
        reference: '',
        vehicule: '',
        typeAccident: '',
        dateAccident: '',
        emplacement: 'Autre',
        chauffeur: '',
        details: '',
        description: ''
      });
    }
  }, [sinistre, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Format date back to DD/MM/YYYY if needed, or just pass the YYYY-MM-DD
    let finalDate = formData.dateAccident || '';
    if (finalDate && finalDate.includes('-')) {
      const parts = finalDate.split('-');
      if (parts.length === 3) {
        finalDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    onSave({
      ...formData,
      dateAccident: finalDate
    });
  };
  if (!isOpen) return null;
  const typesAccident = [
  'Accident de la route',
  'Bris de glaces',
  'Collision',
  'Accrochage parking'];

  const emplacements = [
  'prologic',
  'prologic3',
  'Tunis Centre',
  'Sfax',
  'Sousse',
  'La Marsa',
  'Autre'];

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
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
          
          <ModalHeader
            title={sinistre ? 'Modifier une fiche' : 'Ajouter une fiche'}
            onClose={onClose}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.reference || ''}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  reference: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Référence" />
              
              <div className="relative">
                <select
                  required
                  value={formData.vehicule || ''}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    vehicule: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-slate-700 bg-white">
                  
                  <option value="" disabled>
                    Véhicule assuré par *
                  </option>
                  {vehicules.map((v) =>
                  <option key={v} value={v}>
                      {v}
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <select
                  required
                  value={formData.typeAccident || ''}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    typeAccident: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-slate-700 bg-white">
                  
                  <option value="" disabled>
                    Type d'accident *
                  </option>
                  {typesAccident.map((t) =>
                  <option key={t} value={t}>
                      {t}
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-slate-500 font-medium z-10">
                  Date d'accident *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateAccident || ''}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    dateAccident: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500 text-slate-700 relative z-0" />
                
                <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none z-10" />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative mt-2">
                <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-slate-500 font-medium z-10">
                  Emplacement *
                </label>
                <select
                  required
                  value={formData.emplacement || ''}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    emplacement: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-slate-700 bg-white relative z-0">
                  
                  <option value="" disabled>
                    Emplacement *
                  </option>
                  {emplacements.map((e) =>
                  <option key={e} value={e}>
                      {e}
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
              </div>
              <div className="relative mt-2">
                <input
                  type="text"
                  required
                  value={formData.chauffeur || ''}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    chauffeur: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="Chauffeur *" />
                
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <textarea
                value={formData.details || ''}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  details: e.target.value
                })
                }
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500 resize-none"
                placeholder="Détails" />
              
              <textarea
                value={formData.description || ''}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
                }
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500 resize-none"
                placeholder="Description des dégâts" />
              
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors">
                
                Enregistrer
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}