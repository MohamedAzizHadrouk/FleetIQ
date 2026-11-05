import React, { useState, Fragment } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Clock,
  ChevronDown,
  ChevronRight,
  X,
  Package,
  ArrowUpDown } from
'lucide-react';
import { TableFooter } from './TableFooter';
import { ModalHeader } from '@/components/ui/modal-header';
interface Article {
  id: string;
  modele: string;
  reference: string;
  nom: string;
  quantiteRestante: number;
  departement: string;
  dimension: string;
  numeroDeSerie: string;
  codeABarre: string;
  fournisseur: string;
  prixAchat: number;
  prixVente: number;
  tva: number;
  categorie: string;
}
interface ArticleFormData {
  modele: string;
  reference: string;
  nom: string;
  quantiteRestante: string;
  departement: string;
  dimension: string;
  numeroDeSerie: string;
  codeABarre: string;
  fournisseur: string;
  prixAchat: string;
  prixVente: string;
  tva: string;
  categorie: string;
}
const INITIAL_ARTICLES: Article[] = [
{
  id: '1',
  modele: '',
  reference: 'ref 13',
  nom: 'pppp',
  quantiteRestante: 0,
  departement: '',
  dimension: '0',
  numeroDeSerie: 'ssssssss',
  codeABarre: '',
  fournisseur: '',
  prixAchat: 0,
  prixVente: 0,
  tva: 0,
  categorie: ''
},
{
  id: '2',
  modele: 'b',
  reference: '33',
  nom: 'b',
  quantiteRestante: 0,
  departement: '',
  dimension: '0',
  numeroDeSerie: '',
  codeABarre: '',
  fournisseur: 'test',
  prixAchat: 0,
  prixVente: 0,
  tva: 0,
  categorie: 'a'
},
{
  id: '3',
  modele: 'bb',
  reference: 'aaa',
  nom: 'aaa',
  quantiteRestante: 0,
  departement: '',
  dimension: '0',
  numeroDeSerie: '',
  codeABarre: '',
  fournisseur: '',
  prixAchat: 0,
  prixVente: 0,
  tva: 0,
  categorie: 'aa'
},
{
  id: '4',
  modele: 'Peugeot',
  reference: 'Op1',
  nom: 'Opt AV dr',
  quantiteRestante: 20,
  departement: 'TUNAV',
  dimension: '0',
  numeroDeSerie: '',
  codeABarre: '',
  fournisseur: '',
  prixAchat: 0,
  prixVente: 0,
  tva: 0,
  categorie: 'Optique'
},
{
  id: '5',
  modele: '',
  reference: '1234',
  nom: 'pneu',
  quantiteRestante: 5,
  departement: 'TUNAV',
  dimension: '0',
  numeroDeSerie: '1478',
  codeABarre: '',
  fournisseur: 'four 100',
  prixAchat: 0,
  prixVente: 0,
  tva: 0,
  categorie: 'test'
}];

const EMPTY_FORM: ArticleFormData = {
  modele: '',
  reference: '',
  nom: '',
  quantiteRestante: '0',
  departement: '',
  dimension: '0',
  numeroDeSerie: '',
  codeABarre: '',
  fournisseur: '',
  prixAchat: '0',
  prixVente: '0',
  tva: '0',
  categorie: ''
};
export function GestionArticlesStock() {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortCategorie, setSortCategorie] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Group articles by category
  const categories = Array.from(new Set(articles.map((a) => a.categorie))).sort(
    (a, b) =>
    sortCategorie === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );
  const filteredArticles = articles.filter(
    (a) =>
    a.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.categorie.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalItems = filteredArticles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  // Re-calculate categories based on paginated articles to only show categories for current page
  const paginatedCategories = Array.from(
    new Set(paginatedArticles.map((a) => a.categorie))
  ).sort((a, b) =>
  sortCategorie === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );
  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);else
      next.add(cat);
      return next;
    });
  };
  const openAddModal = () => {
    setEditingArticle(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };
  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      modele: article.modele,
      reference: article.reference,
      nom: article.nom,
      quantiteRestante: String(article.quantiteRestante),
      departement: article.departement,
      dimension: article.dimension,
      numeroDeSerie: article.numeroDeSerie,
      codeABarre: article.codeABarre,
      fournisseur: article.fournisseur,
      prixAchat: String(article.prixAchat),
      prixVente: String(article.prixVente),
      tva: String(article.tva),
      categorie: article.categorie
    });
    setShowModal(true);
  };
  const handleSave = () => {
    if (editingArticle) {
      setArticles((prev) =>
      prev.map((a) =>
      a.id === editingArticle.id ?
      {
        ...a,
        ...formData,
        quantiteRestante: Number(formData.quantiteRestante),
        prixAchat: Number(formData.prixAchat),
        prixVente: Number(formData.prixVente),
        tva: Number(formData.tva)
      } :
      a
      )
      );
    } else {
      const newArticle: Article = {
        id: String(Date.now()),
        ...formData,
        quantiteRestante: Number(formData.quantiteRestante),
        prixAchat: Number(formData.prixAchat),
        prixVente: Number(formData.prixVente),
        tva: Number(formData.tva)
      };
      setArticles((prev) => [...prev, newArticle]);
    }
    setShowModal(false);
  };
  const handleDelete = (id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  };
  const updateForm = (field: keyof ArticleFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const totalArticles = articles.length;
  const totalStock = articles.reduce((sum, a) => sum + a.quantiteRestante, 0);
  const lowStockCount = articles.filter((a) => a.quantiteRestante === 0).length;
  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Gestion des articles et du stock
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Gérez votre inventaire et vos articles
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
              
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
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              
              <Plus className="w-4 h-4" />
              Nouvel article
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-4 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total articles</p>
            <p className="text-2xl font-bold text-slate-800">{totalArticles}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <ArrowUpDown className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Stock total</p>
            <p className="text-2xl font-bold text-slate-800">{totalStock}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <X className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Stock épuisé</p>
            <p className="text-2xl font-bold text-rose-600">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Filter bar */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <button
              onClick={() =>
              setSortCategorie((s) => s === 'asc' ? 'desc' : 'asc')
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              
              <ArrowUpDown className="w-3.5 h-3.5" />
              Catégorie {sortCategorie === 'asc' ? '↑' : '↓'}
            </button>
            {searchTerm &&
            <span className="text-xs text-slate-500 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                Résultats pour "{searchTerm}"
              </span>
            }
          </div>

          {/* Table header */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                  'Modèle',
                  'Référence',
                  'Nom',
                  'Quantité restante',
                  'Département',
                  'Dimension',
                  'Numéro de série',
                  'Code à barre',
                  'Fournisseur',
                  "Prix d'achat",
                  'Prix de vente',
                  'TVA',
                  'Actions'].
                  map((col) =>
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    
                      {col}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((cat) => {
                  const catArticles = paginatedArticles.filter(
                    (a) => a.categorie === cat
                  );
                  if (catArticles.length === 0) return null;
                  const isCollapsed = collapsedCategories.has(cat);
                  return (
                    <Fragment key={cat}>
                      {/* Category row */}
                      <tr
                        className="bg-slate-700 cursor-pointer hover:bg-slate-600 transition-colors"
                        onClick={() => toggleCategory(cat)}>
                        
                        <td colSpan={13} className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {isCollapsed ?
                            <ChevronRight className="w-4 h-4 text-slate-300" /> :

                            <ChevronDown className="w-4 h-4 text-slate-300" />
                            }
                            <span className="text-sm font-semibold text-slate-200">
                              Catégorie:{cat ? ` ${cat}` : ''}
                            </span>
                            <span className="ml-2 px-2 py-0.5 bg-slate-600 text-slate-300 rounded-full text-xs">
                              {catArticles.length} article
                              {catArticles.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {/* Article rows */}
                      {!isCollapsed &&
                      catArticles.map((article) =>
                      <tr
                        key={article.id}
                        className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors group">
                        
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {article.modele || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-blue-600">
                              {article.reference}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                              {article.nom}
                            </td>
                            <td className="px-4 py-3">
                              <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${article.quantiteRestante > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                            
                                {article.quantiteRestante}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {article.departement || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {article.dimension}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                              {article.numeroDeSerie || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                              {article.codeABarre || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {article.fournisseur || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {article.prixAchat}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {article.prixVente}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {article.tva}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                              onClick={() => openEditModal(article)}
                              className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                              title="Modifier">
                              
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                              onClick={() => setDeleteConfirm(article.id)}
                              className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                              title="Supprimer">
                              
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                              title="Historique">
                              
                                  <Clock className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                      )}
                    </Fragment>);

                })}
                {paginatedArticles.length === 0 &&
                <tr>
                    <td colSpan={13} className="px-6 py-16 text-center">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">
                        Aucun article trouvé
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        {searchTerm ?
                      'Essayez un autre terme de recherche' :
                      'Ajoutez votre premier article'}
                      </p>
                    </td>
                  </tr>
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
            onExportPdf={() => console.log('Export PDF Articles')}
            onExportExcel={() => console.log('Export Excel Articles')} />
          
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal &&
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowModal(false)}>
        
          <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}>
          
            <ModalHeader
              title={editingArticle ? "Modifier l'article" : 'Nouvel article'}
              icon={<Package className="w-5 h-5 text-primary-foreground shrink-0" />}
              onClose={() => setShowModal(false)}
            />

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-2 gap-4">
                {/* Catégorie - Select dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Catégorie
                  </label>
                  <div className="relative">
                    <select
                    value={formData.categorie}
                    onChange={(e) => updateForm('categorie', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-slate-700">
                    
                      <option value="">Sélectionner une catégorie</option>
                      {Array.from(
                      new Set(
                        articles.map((a) => a.categorie).filter(Boolean)
                      )
                    ).
                    sort().
                    map((cat) =>
                    <option key={cat} value={cat}>
                            {cat}
                          </option>
                    )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Other fields */}
                {(
              [
              {
                field: 'modele',
                label: 'Modèle',
                type: 'text'
              },
              {
                field: 'reference',
                label: 'Référence',
                type: 'text'
              },
              {
                field: 'nom',
                label: 'Nom',
                type: 'text'
              },
              {
                field: 'quantiteRestante',
                label: 'Quantité restante',
                type: 'number'
              },
              {
                field: 'departement',
                label: 'Département',
                type: 'text'
              },
              {
                field: 'dimension',
                label: 'Dimension',
                type: 'text'
              },
              {
                field: 'numeroDeSerie',
                label: 'Numéro de série',
                type: 'text'
              },
              {
                field: 'codeABarre',
                label: 'Code à barre',
                type: 'text'
              },
              {
                field: 'fournisseur',
                label: 'Fournisseur',
                type: 'text'
              },
              {
                field: 'prixAchat',
                label: "Prix d'achat",
                type: 'number'
              },
              {
                field: 'prixVente',
                label: 'Prix de vente',
                type: 'number'
              },
              {
                field: 'tva',
                label: 'TVA (%)',
                type: 'number'
              }] as
              {
                field: keyof ArticleFormData;
                label: string;
                type: string;
              }[]).
              map(({ field, label, type }) =>
              <div
                key={field}
                className={field === 'nom' ? 'col-span-2' : ''}>
                
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      {label}
                    </label>
                    <input
                  type={type}
                  value={formData[field]}
                  onChange={(e) => updateForm(field, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={label} />
                
                  </div>
              )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
              
                Annuler
              </button>
              <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              
                {editingArticle ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Delete Confirm */}
      {deleteConfirm &&
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setDeleteConfirm(null)}>
        
          <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}>
          
            <ModalHeader
              title="Supprimer l'article"
              onClose={() => setDeleteConfirm(null)}
            />
            <div className="p-6 text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
            <p className="text-sm text-slate-500 text-center mb-6">
              Cette action est irréversible. Voulez-vous vraiment supprimer cet
              article ?
            </p>
            <div className="flex gap-3">
              <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
              
                Annuler
              </button>
              <button
              onClick={() => handleDelete(deleteConfirm)}
              className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors">
              
                Supprimer
              </button>
            </div>
          </div>
        </div>
        </div>
      }
    </div>);

}