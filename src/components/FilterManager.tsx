import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Save,
  Star,
  Trash2,
  Edit,
  Plus,
  Check,
  X,
  Calendar,
  Clock } from
'lucide-react';
import { SavedFilter } from '../types';
import { ModalHeader } from '@/components/ui/modal-header';
interface FilterManagerProps {
  show: boolean;
  onClose: () => void;
  savedFilters: SavedFilter[];
  onApply: (filter: SavedFilter) => void;
  onSetDefault: (filterId: string) => void;
  onDelete: (filterId: string) => void;
  onUpdateName: (filterId: string, newName: string) => void;
  onSaveNew: () => void;
  editingFilter: string | null;
  setEditingFilter: (id: string | null) => void;
  getDurationLabel: (duration: any) => string;
}
export function FilterManager({
  show,
  onClose,
  savedFilters,
  onApply,
  onSetDefault,
  onDelete,
  onUpdateName,
  onSaveNew,
  editingFilter,
  setEditingFilter,
  getDurationLabel
}: FilterManagerProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);
  if (!show) return null;
  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        scale: 0.95,
        y: -10
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        y: -10
      }}
      transition={{
        duration: 0.2
      }}
      className="absolute top-full left-0 mt-2 w-[420px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
      
      <ModalHeader
        title="Filtres sauvegardés"
        subtitle="Gérez vos filtres personnalisés"
        icon={<Settings className="w-5 h-5 text-primary-foreground shrink-0" />}
        onClose={onClose}
        size="compact"
      />

      <div className="max-h-96 overflow-y-auto">
        {savedFilters.length === 0 ?
        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Save className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm text-slate-600 mb-1">
              Aucun filtre sauvegardé
            </p>
            <p className="text-xs text-slate-400">
              Configurez vos filtres et cliquez sur "Sauvegarder"
            </p>
          </div> :

        <div className="divide-y divide-slate-100">
            {savedFilters.map((filter) =>
          <div
            key={filter.id}
            className="p-4 hover:bg-slate-50 transition-colors">
            
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {editingFilter === filter.id ?
                <input
                  type="text"
                  defaultValue={filter.name}
                  onBlur={(e) => onUpdateName(filter.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateName(filter.id, e.currentTarget.value);
                    }
                  }}
                  autoFocus
                  className="w-full px-2 py-1 text-sm font-semibold text-slate-800 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" /> :


                <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">
                          {filter.name}
                        </h4>
                        {filter.isDefault &&
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                  }
                      </div>
                }
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-500">
                        {filter.vehicles.length === 0 ?
                    'Tous les véhicules' :
                    `${filter.vehicles.length} véhicule${filter.vehicles.length > 1 ? 's' : ''}`}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs">
                        {filter.duration.type === 'relative' ?
                    <Clock className="w-3 h-3 text-blue-500" /> :

                    <Calendar className="w-3 h-3 text-slate-400" />
                    }
                        <span
                      className={
                      filter.duration.type === 'relative' ?
                      'text-blue-600 font-medium' :
                      'text-slate-400'
                      }>
                      
                          {getDurationLabel(filter.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                  onClick={() => onApply(filter)}
                  className="p-1.5 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                  title="Appliquer ce filtre">
                  
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                  onClick={() => setDefaultFilter(filter.id)}
                  className={`p-1.5 rounded transition-colors ${filter.isDefault ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-200 text-slate-400'}`}
                  title="Définir par défaut">
                  
                      <Star
                    className={`w-4 h-4 ${filter.isDefault ? 'fill-amber-600' : ''}`} />
                  
                    </button>
                    <button
                  onClick={() => setEditingFilter(filter.id)}
                  className="p-1.5 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                  title="Renommer">
                  
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                  onClick={() => onDelete(filter.id)}
                  className="p-1.5 hover:bg-rose-100 rounded text-rose-600 transition-colors"
                  title="Supprimer">
                  
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
          )}
          </div>
        }
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <button
          onClick={onSaveNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          
          <Plus className="w-4 h-4" />
          Sauvegarder le filtre actuel
        </button>
      </div>
    </motion.div>);

}