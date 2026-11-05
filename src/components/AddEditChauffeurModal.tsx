import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Flag } from 'lucide-react';
import { ModalHeader } from '@/components/ui/modal-header';
export interface ChauffeurData {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  codePersonnel: string;
  mobile: string;
  numeroCarteFermeture: string;
  numeroCarteOuverture: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  departement: string;
  etat: 'Actif' | 'Inactif';
  numeroCIN: string;
  genrePermis: string;
  numeroPermis: string;
  vehiculeUtil: string;
}
interface AddEditChauffeurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ChauffeurData) => void;
  chauffeur?: ChauffeurData | null;
  departments: string[];
}
export function AddEditChauffeurModal({
  isOpen,
  onClose,
  onSave,
  chauffeur,
  departments
}: AddEditChauffeurModalProps) {
  const [formData, setFormData] = useState<ChauffeurData>({
    nom: '',
    prenom: '',
    email: '',
    codePersonnel: '',
    mobile: '',
    numeroCarteFermeture: '',
    numeroCarteOuverture: '',
    dateNaissance: '',
    lieuNaissance: '',
    adresse: '',
    departement: '',
    etat: 'Actif',
    numeroCIN: '',
    genrePermis: '',
    numeroPermis: '',
    vehiculeUtil: ''
  });
  useEffect(() => {
    if (chauffeur) {
      setFormData(chauffeur);
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        codePersonnel: '',
        mobile: '',
        numeroCarteFermeture: '',
        numeroCarteOuverture: '',
        dateNaissance: '',
        lieuNaissance: '',
        adresse: '',
        departement: '',
        etat: 'Actif',
        numeroCIN: '',
        genrePermis: '',
        numeroPermis: '',
        vehiculeUtil: ''
      });
    }
  }, [chauffeur, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
          
          <ModalHeader
            title={chauffeur ? 'Modifier Chauffeur' : 'Ajouter Nouveau Chauffeur'}
            onClose={onClose}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* Row 1 */}
            <div>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  nom: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Nom*" />
              
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  prenom: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Prénom*" />
              
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Email" />
              
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={formData.codePersonnel}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  codePersonnel: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Code personnel*" />
              
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  mobile: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="N de tel" />
              
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.numeroCarteFermeture}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  numeroCarteFermeture: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Numéro de carte fermeture" />
              
              <input
                type="text"
                value={formData.numeroCarteOuverture}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  numeroCarteOuverture: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Numéro de carte ouverture" />
              
            </div>

            {/* Row 5 */}
            <div className="relative">
              <input
                type="date"
                value={formData.dateNaissance}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  dateNaissance: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500 text-slate-700"
                placeholder="Date de naissance" />
              
              <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.lieuNaissance}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  lieuNaissance: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Lieu de naissance" />
              
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  adresse: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Adresse" />
              
            </div>

            {/* Row 7 */}
            <div className="relative">
              <select
                required
                value={formData.departement}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  departement: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-slate-700 bg-white">
                
                <option value="" disabled>
                  Département*
                </option>
                {departments.map((dept) =>
                <option key={dept} value={dept}>
                    {dept}
                  </option>
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-slate-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7" />
                  
                </svg>
                <Flag className="w-4 h-4" />
              </div>
            </div>

            {/* Row 8 - N° de CIN */}
            <div>
              <input
                type="text"
                value={formData.numeroCIN}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  numeroCIN: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="N° de CIN" />
              
            </div>

            {/* Row 9 - Genre du permis + N° du permis */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.genrePermis}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  genrePermis: e.target.value
                })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                placeholder="Genre du permis de conduire" />
              
              <div>
                <label className="block text-xs text-slate-400 mb-1 px-1">
                  N° du permis du conduire
                </label>
                <input
                  type="text"
                  value={formData.numeroPermis}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    numeroPermis: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="0" />
                
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
                
                {chauffeur ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}