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
  CreditCard } from
'lucide-react';
import { TableFooter } from './TableFooter';
import { ModalHeader } from '@/components/ui/modal-header';
export interface ClientData {
  id?: string;
  nom: string;
  adresse: string;
  email: string;
  telephone: string;
  web: string;
  dateCreation: string;
}
interface AddEditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ClientData) => void;
  client?: ClientData | null;
}
export function AddEditClientModal({
  isOpen,
  onClose,
  onSave,
  client
}: AddEditClientModalProps) {
  const [formData, setFormData] = useState<ClientData>({
    nom: '',
    adresse: '',
    email: '',
    telephone: '',
    web: '',
    dateCreation: new Date().toLocaleString('fr-FR')
  });
  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        nom: '',
        adresse: '',
        email: '',
        telephone: '',
        web: '',
        dateCreation: new Date().toLocaleString('fr-FR')
      });
    }
  }, [client, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      dateCreation: client ?
      formData.dateCreation :
      new Date().toLocaleString('fr-FR')
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
          
          <ModalHeader
            title={client ? 'Modifier le client' : 'Ajouter un nouveau client'}
            onClose={onClose}
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {/* Nom */}
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

            {/* Adresse + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.adresse}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    adresse: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="Adresse *" />
                
                <Home className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="Email *" />
                
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Telephone + Web */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={formData.telephone}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    telephone: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="Telephone *" />
                
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.web}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    web: e.target.value
                  })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  placeholder="Web *" />
                
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors">
                
                {client ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
export function ClientsContent() {
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [clients, setClients] = useState<ClientData[]>([
  {
    id: '1',
    nom: 'EL ATHIR',
    adresse: '1073, 27 Av. Kheireddine Pacha, Tunis',
    email: 'contact.tunis@elathir.com',
    telephone: '71 904 133',
    web: 'www.elathirgroup.com',
    dateCreation: '24/01/2023 10:00:11'
  },
  {
    id: '2',
    nom: 'SNBG',
    adresse: 'Zone Industrielle Grombalia, Grombalia 8030',
    email: 'snbg@planet.tn',
    telephone: '72 255 807',
    web: 'www.snbg.com.tn',
    dateCreation: '24/01/2023 10:01:32'
  }]
  );
  const filteredClients = clients.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.nom.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.adresse.toLowerCase().includes(term) ||
      c.telephone.toLowerCase().includes(term) ||
      c.web.toLowerCase().includes(term));

  });
  const totalItems = filteredClients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const handleSaveClient = (data: ClientData) => {
    if (editingClient) {
      setClients(clients.map((c) => c.id === data.id ? data : c));
    } else {
      setClients([
      ...clients,
      {
        ...data,
        id: Date.now().toString()
      }]
      );
    }
    setShowModal(false);
    setEditingClient(null);
  };
  const handleDeleteClient = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      setClients(clients.filter((c) => c.id !== id));
    }
  };
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion des Clients
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez votre base de clients
            </p>
          </div>
          <button
            onClick={() => {
              setEditingClient(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            
            <Plus className="w-4 h-4" />
            Ajouter un client
          </button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Clients
                </p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {clients.length}
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-600" />
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
                placeholder="Rechercher un client..."
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
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Telephone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Web
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">
                    Date de creation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedClients.map((client) =>
                <tr key={client.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {client.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-[250px] whitespace-normal">
                      {client.adresse}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {client.telephone}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {client.web}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {client.dateCreation}
                    </td>
                    <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-3">
                        <button
                        onClick={() => {
                          setEditingClient(client);
                          setShowModal(true);
                        }}
                        className="text-[#0ea5e9] hover:text-blue-700 transition-colors"
                        title="Modifier">
                        
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                        onClick={() =>
                        client.id && handleDeleteClient(client.id)
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
            onExportPdf={() => console.log('Export PDF Clients')}
            onExportExcel={() => console.log('Export Excel Clients')} />
          
        </div>
      </div>

      <AddEditClientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        client={editingClient} />
      
    </div>);

}