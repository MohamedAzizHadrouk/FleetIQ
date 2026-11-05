import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  User,
  Home,
  Phone,
  Mail,
  Globe,
  ShoppingCart,
  Wrench } from
'lucide-react';
import { TableFooter } from './TableFooter';
import { ModalHeader } from '@/components/ui/modal-header';
export interface FournisseurData {
  id?: string;
  type: 'Constructeur' | 'Fournisseur' | 'Supplier';
  nom: string;
  description: string;
  adresse: string;
  telephone: string;
  email: string;
  premierResponsable: string;
  deuxiemeResponsable: string;
  siteInternet: string;
  budgetMaximal: number;
  derniereModification: string;
}
interface AddEditFournisseurModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FournisseurData) => void;
  fournisseur?: FournisseurData | null;
}
export function AddEditFournisseurModal({
  isOpen,
  onClose,
  onSave,
  fournisseur
}: AddEditFournisseurModalProps) {
  const [formData, setFormData] = useState<FournisseurData>({
    type: 'Supplier',
    nom: '',
    description: '',
    adresse: '',
    telephone: '',
    email: '',
    premierResponsable: '',
    deuxiemeResponsable: '',
    siteInternet: '',
    budgetMaximal: 0,
    derniereModification: new Date().toLocaleString('fr-FR')
  });
  useEffect(() => {
    if (fournisseur) {
      setFormData(fournisseur);
    } else {
      setFormData({
        type: 'Supplier',
        nom: '',
        description: '',
        adresse: '',
        telephone: '',
        email: '',
        premierResponsable: '',
        deuxiemeResponsable: '',
        siteInternet: '',
        budgetMaximal: 0,
        derniereModification: new Date().toLocaleString('fr-FR')
      });
    }
  }, [fournisseur, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      derniereModification: new Date().toLocaleString('fr-FR')
    });
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
            title={
              fournisseur
                ? 'Modifier fournisseur'
                : 'Ajouter un nouveau fournisseur'
            }
            onClose={onClose}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* Row 1 - Nom */}
            <div className="relative">
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
                placeholder="Nom *" />
              
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Description */}
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
                }
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500 resize-none"
                placeholder="Description" />
              
            </div>

            {/* Row 2 - Adresse + Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
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
                
                <Home className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    telephone: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="Numéro de téléphone" />
                
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Row 3 - Email + Site Internet */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
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
                
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.siteInternet}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    siteInternet: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="site Internet" />
                
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Row 4 - Responsables */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={formData.premierResponsable}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    premierResponsable: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="premier responsable" />
                
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.deuxiemeResponsable}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    deuxiemeResponsable: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="deuxième responsable" />
                
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Row 5 - Type + Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs text-slate-500 mb-1 px-1">
                  Fournisseur
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as FournisseurData['type']
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-slate-700 bg-white">
                  
                  <option value="Supplier">Supplier</option>
                  <option value="Fournisseur">Fournisseur</option>
                  <option value="Constructeur">Constructeur</option>
                </select>
                <div className="absolute right-4 bottom-3.5 pointer-events-none text-slate-500">
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
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 px-1">
                  Budget Maximal
                </label>
                <input
                  type="number"
                  value={formData.budgetMaximal}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetMaximal: Number(e.target.value)
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0" />
                
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
                
                {fournisseur ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
export function SuppliersContent() {
  const [showModal, setShowModal] = useState(false);
  const [editingFournisseur, setEditingFournisseur] =
  useState<FournisseurData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [fournisseurs, setFournisseurs] = useState<FournisseurData[]>([
  {
    id: '1',
    type: 'Constructeur',
    nom: 'four 100',
    description: '',
    adresse: 'adddd',
    telephone: '88888888888',
    email: 'cc@gmail.com',
    premierResponsable: 'resp 1',
    deuxiemeResponsable: 'resp 2',
    siteInternet: 'www.tunav.com',
    budgetMaximal: 150,
    derniereModification: '25/02/2021 11:03:32'
  },
  {
    id: '2',
    type: 'Fournisseur',
    nom: 'eeee',
    description: '',
    adresse: 'add 8',
    telephone: '5425690',
    email: 'asma@gmail.com',
    premierResponsable: 'ppp',
    deuxiemeResponsable: 'resp 2',
    siteInternet: 'mmm',
    budgetMaximal: 150,
    derniereModification: '18/07/2019 14:27:19'
  },
  {
    id: '3',
    type: 'Constructeur',
    nom: 'eeee',
    description: '',
    adresse: 'add fact',
    telephone: 'tel fact',
    email: 'cc@gmail.com',
    premierResponsable: 'resp 1',
    deuxiemeResponsable: 'resp 2',
    siteInternet: 'www.tunav.com',
    budgetMaximal: 0,
    derniereModification: '18/07/2019 14:29:01'
  },
  {
    id: '4',
    type: 'Constructeur',
    nom: 'test',
    description: '',
    adresse: '',
    telephone: '',
    email: '',
    premierResponsable: '',
    deuxiemeResponsable: '',
    siteInternet: '',
    budgetMaximal: 0,
    derniereModification: '21/02/2020 10:28:41'
  },
  {
    id: '5',
    type: 'Constructeur',
    nom: 'ghada',
    description: '',
    adresse: 'tunis',
    telephone: '97825080',
    email: 'ghada0020@gmail.com',
    premierResponsable: '',
    deuxiemeResponsable: '',
    siteInternet: '',
    budgetMaximal: 0,
    derniereModification: '24/02/2021 10:27:05'
  },
  {
    id: '6',
    type: 'Fournisseur',
    nom: 'ITALCAR',
    description: 'Responsable client flott...',
    adresse: 'Rue N°8612 ZONE IND...',
    telephone: '55 799 571 - 71 77 33 22',
    email: 'Sofiene.BenKhalfallah...',
    premierResponsable: 'Sofiene ben khalfallah',
    deuxiemeResponsable: 'Gharbi Mohamed Aziz',
    siteInternet: 'www.italcar-sa.com',
    budgetMaximal: 0,
    derniereModification: '24/03/2022 17:03:18'
  },
  {
    id: '7',
    type: 'Fournisseur',
    nom: 'Tunisie Leasing.',
    description: 'Récupérer Attestation D...',
    adresse: 'Centre urbain nord, Av. ...',
    telephone: '70132000',
    email: 'contact@tlf.com.tn',
    premierResponsable: '',
    deuxiemeResponsable: '',
    siteInternet: 'www.tlf.com.tn',
    budgetMaximal: 0,
    derniereModification: '24/03/2022 17:12:53'
  }]
  );
  const filteredFournisseurs = fournisseurs.filter((f) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.nom.toLowerCase().includes(term) ||
      f.email.toLowerCase().includes(term) ||
      f.adresse.toLowerCase().includes(term) ||
      f.premierResponsable.toLowerCase().includes(term) ||
      f.deuxiemeResponsable.toLowerCase().includes(term));

  });
  const totalItems = filteredFournisseurs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFournisseurs = filteredFournisseurs.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const handleSaveFournisseur = (data: FournisseurData) => {
    if (editingFournisseur) {
      setFournisseurs(fournisseurs.map((f) => f.id === data.id ? data : f));
    } else {
      setFournisseurs([
      ...fournisseurs,
      {
        ...data,
        id: Date.now().toString()
      }]
      );
    }
    setShowModal(false);
    setEditingFournisseur(null);
  };
  const handleDeleteFournisseur = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      setFournisseurs(fournisseurs.filter((f) => f.id !== id));
    }
  };
  const constructeurCount = fournisseurs.filter(
    (f) => f.type === 'Constructeur'
  ).length;
  const fournisseurCount = fournisseurs.filter(
    (f) => f.type === 'Fournisseur' || f.type === 'Supplier'
  ).length;
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion des Fournisseurs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez vos fournisseurs et constructeurs
            </p>
          </div>
          <button
            onClick={() => {
              setEditingFournisseur(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            
            <Plus className="w-4 h-4" />
            Ajouter un fournisseur
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Fournisseurs
                </p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {fournisseurs.length}
                </p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Constructeurs
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {constructeurCount}
                </p>
              </div>
              <Wrench className="w-10 h-10 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Fournisseurs
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {fournisseurCount}
                </p>
              </div>
              <ShoppingCart className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un fournisseur..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <Filter className="w-4 h-4" />
              Filtrer
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Numéro de téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    premier responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    deuxième responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    site Internet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Budget Maximal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Dernière modification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedFournisseurs.map((fournisseur) =>
                <tr key={fournisseur.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4">
                      <span
                      className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${fournisseur.type === 'Constructeur' ? 'bg-orange-500 text-white' : 'bg-purple-600 text-white'}`}>
                      
                        {fournisseur.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">
                      {fournisseur.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fournisseur.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fournisseur.adresse}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fournisseur.telephone}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fournisseur.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fournisseur.premierResponsable}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fournisseur.deuxiemeResponsable}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fournisseur.siteInternet}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fournisseur.budgetMaximal}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {fournisseur.derniereModification}
                    </td>
                    <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-3">
                        <button
                        onClick={() => {
                          setEditingFournisseur(fournisseur);
                          setShowModal(true);
                        }}
                        className="text-[#0ea5e9] hover:text-blue-700 transition-colors"
                        title="Modifier">
                        
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                        onClick={() =>
                        fournisseur.id &&
                        handleDeleteFournisseur(fournisseur.id)
                        }
                        className="text-rose-500 hover:text-rose-700 transition-colors"
                        title="Supprimer">
                        
                          <Trash2 className="w-5 h-5" />
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
            onItemsPerPageChange={setItemsPerPage}
            onExportPdf={() => console.log('Export PDF Fournisseurs')}
            onExportExcel={() => console.log('Export Excel Fournisseurs')} />
          
        </div>
      </div>

      <AddEditFournisseurModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingFournisseur(null);
        }}
        onSave={handleSaveFournisseur}
        fournisseur={editingFournisseur} />
      
    </div>);

}