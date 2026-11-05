import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Calendar, Clock } from 'lucide-react';
import { DurationUnit } from '../types';
import { ModalHeader } from '@/components/ui/modal-header';
interface SaveFilterModalProps {
  show: boolean;
  onClose: () => void;
  filterName: string;
  setFilterName: (name: string) => void;
  onSave: (
  durationType: 'relative' | 'fixed',
  unit?: DurationUnit,
  value?: number)
  => void;
  filterPreview?: React.ReactNode;
  currentDateDebut?: string;
  currentDateFin?: string;
}
export function SaveFilterModal({
  show,
  onClose,
  filterName,
  setFilterName,
  onSave,
  filterPreview,
  currentDateDebut,
  currentDateFin
}: SaveFilterModalProps) {
  const [durationType, setDurationType] = useState<'relative' | 'fixed'>(
    'relative'
  );
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('weeks');
  const [durationValue, setDurationValue] = useState<number>(1);
  if (!show) return null;
  const handleSave = () => {
    if (!filterName.trim()) return;
    if (durationType === 'relative') {
      onSave('relative', durationUnit, durationValue);
    } else {
      onSave('fixed');
    }
  };
  const getDurationPreview = () => {
    if (durationType === 'fixed') {
      return `Du ${currentDateDebut} au ${currentDateFin}`;
    }
    const unitLabels = {
      days: durationValue === 1 ? 'jour' : 'jours',
      weeks: durationValue === 1 ? 'semaine' : 'semaines',
      months: durationValue === 1 ? 'mois' : 'mois'
    };
    return `${durationValue} ${unitLabels[durationUnit]} précédent${durationValue > 1 && durationUnit !== 'months' ? 's' : ''}`;
  };
  return (
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}>
      
      <motion.div
        initial={{
          scale: 0.9,
          y: 20
        }}
        animate={{
          scale: 1,
          y: 0
        }}
        exit={{
          scale: 0.9,
          y: 20
        }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        
        <ModalHeader
          title="Sauvegarder le filtre"
          subtitle="Configurez un filtre dynamique ou fixe"
          icon={<Save className="w-6 h-6 text-primary-foreground shrink-0" />}
          onClose={onClose}
        />

        <div className="p-6 space-y-6">
          {/* Filter Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nom du filtre *
            </label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Ex: Rapport hebdomadaire"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filterName.trim()) {
                  handleSave();
                }
              }} />
            
          </div>

          {/* Duration Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Type de période
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDurationType('relative')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${durationType === 'relative' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                
                <Clock
                  className={`w-5 h-5 ${durationType === 'relative' ? 'text-blue-600' : 'text-slate-400'}`} />
                
                <div className="text-left">
                  <div
                    className={`text-sm font-semibold ${durationType === 'relative' ? 'text-blue-900' : 'text-slate-700'}`}>
                    
                    Dynamique
                  </div>
                  <div className="text-xs text-slate-500">Période relative</div>
                </div>
              </button>

              <button
                onClick={() => setDurationType('fixed')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${durationType === 'fixed' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                
                <Calendar
                  className={`w-5 h-5 ${durationType === 'fixed' ? 'text-blue-600' : 'text-slate-400'}`} />
                
                <div className="text-left">
                  <div
                    className={`text-sm font-semibold ${durationType === 'fixed' ? 'text-blue-900' : 'text-slate-700'}`}>
                    
                    Fixe
                  </div>
                  <div className="text-xs text-slate-500">Dates exactes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Duration Configuration */}
          {durationType === 'relative' &&
          <motion.div
            initial={{
              opacity: 0,
              y: -10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="space-y-4">
            
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Durée
                </label>
                <div className="flex gap-3">
                  <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationValue}
                  onChange={(e) =>
                  setDurationValue(
                    Math.max(1, parseInt(e.target.value) || 1)
                  )
                  }
                  className="w-24 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold" />
                
                  <select
                  value={durationUnit}
                  onChange={(e) =>
                  setDurationUnit(e.target.value as DurationUnit)
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  
                    <option value="days">Jour(s)</option>
                    <option value="weeks">Semaine(s)</option>
                    <option value="months">Mois</option>
                  </select>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Le filtre utilisera toujours les {durationValue} derniers{' '}
                  {durationUnit === 'days' ?
                'jours' :
                durationUnit === 'weeks' ?
                'semaines' :
                'mois'}
                </p>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Raccourcis
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                  onClick={() => {
                    setDurationUnit('weeks');
                    setDurationValue(1);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  
                    Semaine dernière
                  </button>
                  <button
                  onClick={() => {
                    setDurationUnit('days');
                    setDurationValue(7);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  
                    7 derniers jours
                  </button>
                  <button
                  onClick={() => {
                    setDurationUnit('days');
                    setDurationValue(30);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  
                    30 derniers jours
                  </button>
                  <button
                  onClick={() => {
                    setDurationUnit('months');
                    setDurationValue(1);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  
                    Mois dernier
                  </button>
                  <button
                  onClick={() => {
                    setDurationUnit('months');
                    setDurationValue(3);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  
                    3 derniers mois
                  </button>
                  <button
                  onClick={() => {
                    setDurationUnit('months');
                    setDurationValue(6);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  
                    6 derniers mois
                  </button>
                </div>
              </div>
            </motion.div>
          }

          {/* Preview */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-700 mb-2">
              Aperçu du filtre:
            </p>
            <div className="space-y-1 text-xs text-slate-600">
              {filterPreview}
              <p className="flex items-center gap-2 text-blue-600 font-medium">
                <Calendar className="w-3 h-3" />
                {getDurationPreview()}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-white transition-colors">
            
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!filterName.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors">
            
            Sauvegarder
          </button>
        </div>
      </motion.div>
    </motion.div>);

}