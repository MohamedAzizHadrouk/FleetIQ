import React, { useState, Fragment } from 'react';
import {
  ArrowLeft,
  Pencil,
  User,
  Users,
  FileText,
  CreditCard,
  CheckCircle2,
  Check,
  AlertCircle } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sinistre } from './GestionSinistres';
interface SuiviDossierSinistreProps {
  sinistre: Sinistre;
  onBack: () => void;
}
type TabId = 'declaration' | 'expert' | 'contre_expert' | 'reglement' | 'acheve';
interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
}
const TABS: TabConfig[] = [
{
  id: 'declaration',
  label: 'Déclaration',
  icon: FileText
},
{
  id: 'expert',
  label: "Vue de l'expert",
  icon: User
},
{
  id: 'contre_expert',
  label: 'Vue par un contre expert',
  icon: Users
},
{
  id: 'reglement',
  label: 'Règlement',
  icon: CreditCard
},
{
  id: 'acheve',
  label: 'Achevé',
  icon: CheckCircle2
}];

// Expert form data type
interface ExpertData {
  dateExpertise: string;
  decision: string;
  indemnisation: string;
  description: string;
}
// Contre-expert form data type
interface ContreExpertData {
  dateContreExpertise: string;
  decision: string;
  indemnisation: string;
  description: string;
}
// Reglement form data type
interface ReglementData {
  dateReglement: string;
  descriptionReglement: string;
}
function getInitialStep(sinistre: Sinistre): number {
  if (sinistre.etape !== undefined) return sinistre.etape;
  switch (sinistre.status) {
    case 'Déclaration':
      return 0;
    case 'En cours':
      return 1;
    case 'Achevé':
      return 4;
    default:
      return 0;
  }
}
// Read-only field row component
function FieldRow({ label, value }: {label: string;value?: string;}) {
  return (
    <div className="px-8 py-4 border-b border-slate-100/80 bg-white flex items-baseline gap-1">
      <span className="text-sky-500 text-[15px] font-medium whitespace-nowrap">
        {label} :
      </span>
      <span className="text-slate-800 text-[15px]">{value || ''}</span>
    </div>);

}
// Editable field component
function EditableField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  placeholder,
  options












}: {label: string;value: string;onChange: (value: string) => void;type?: 'text' | 'date' | 'number' | 'textarea' | 'select';required?: boolean;error?: string;placeholder?: string;options?: {value: string;label: string;}[];}) {
  return (
    <div className="px-8 py-4 border-b border-slate-100/80 bg-white">
      <div className="flex items-start gap-4">
        <label className="text-sky-500 text-[15px] font-medium whitespace-nowrap min-w-[180px] pt-2">
          {label} {required && <span className="text-rose-500">*</span>} :
        </label>
        <div className="flex-1">
          {type === 'textarea' ?
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none transition-colors ${error ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`} /> :

          type === 'select' && options ?
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white transition-colors ${error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}>
            
              <option value="">-- Sélectionner --</option>
              {options.map((opt) =>
            <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
            )}
            </select> :

          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors ${error ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'}`} />

          }
          {error &&
          <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          }
        </div>
      </div>
    </div>);

}
export function SuiviDossierSinistre({
  sinistre,
  onBack
}: SuiviDossierSinistreProps) {
  const initialStep = getInitialStep(sinistre);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [activeTab, setActiveTab] = useState(() => {
    return initialStep >= 4 ? 3 : initialStep;
  });
  // Form data states - start empty for steps that haven't been completed
  const [expertData, setExpertData] = useState<ExpertData>(() => {
    // If step > 1, the expert data was already filled (simulate with mock data for demo)
    if (initialStep > 1) {
      return {
        dateExpertise: '2021-02-23',
        decision: 'acceptee',
        indemnisation: '52000',
        description: ''
      };
    }
    return {
      dateExpertise: '',
      decision: '',
      indemnisation: '',
      description: ''
    };
  });
  const [contreExpertData, setContreExpertData] = useState<ContreExpertData>(
    () => {
      // If step > 2, the contre-expert data was already filled
      if (initialStep > 2) {
        return {
          dateContreExpertise: '2026-03-10',
          decision: 'confirmee',
          indemnisation: '50000',
          description: ''
        };
      }
      return {
        dateContreExpertise: '',
        decision: '',
        indemnisation: '',
        description: ''
      };
    }
  );
  const [reglementData, setReglementData] = useState<ReglementData>(() => {
    if (initialStep >= 4) {
      return {
        dateReglement: '2021-02-23',
        descriptionReglement: '50000'
      };
    }
    return {
      dateReglement: '',
      descriptionReglement: ''
    };
  });
  // Validation errors
  const [expertErrors, setExpertErrors] = useState<Partial<ExpertData>>({});
  const [contreExpertErrors, setContreExpertErrors] = useState<
    Partial<ContreExpertData>>(
    {});
  const [reglementErrors, setReglementErrors] = useState<
    Partial<ReglementData>>(
    {});
  // Edit mode states (for completed steps)
  const [isEditingExpert, setIsEditingExpert] = useState(false);
  const [isEditingContreExpert, setIsEditingContreExpert] = useState(false);
  const [isEditingReglement, setIsEditingReglement] = useState(false);
  // Decision options
  const decisionOptions = [
  {
    value: 'acceptee',
    label: 'Indemnisation / Acceptée'
  },
  {
    value: 'refusee',
    label: 'Indemnisation / Refusée'
  },
  {
    value: 'partielle',
    label: 'Indemnisation / Partielle'
  },
  {
    value: 'en_attente',
    label: 'En attente'
  }];

  const contreExpertDecisionOptions = [
  {
    value: 'confirmee',
    label: 'Décision confirmée'
  },
  {
    value: 'contestee',
    label: 'Décision contestée'
  },
  {
    value: 'revision',
    label: 'Révision demandée'
  },
  {
    value: 'en_attente',
    label: 'En attente'
  }];

  // Validation functions
  const validateExpert = (): boolean => {
    const errors: Partial<ExpertData> = {};
    if (!expertData.dateExpertise)
    errors.dateExpertise = 'Ce champ est obligatoire';
    if (!expertData.decision) errors.decision = 'Ce champ est obligatoire';
    if (!expertData.indemnisation)
    errors.indemnisation = 'Ce champ est obligatoire';
    setExpertErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const validateContreExpert = (): boolean => {
    const errors: Partial<ContreExpertData> = {};
    if (!contreExpertData.dateContreExpertise)
    errors.dateContreExpertise = 'Ce champ est obligatoire';
    if (!contreExpertData.decision) errors.decision = 'Ce champ est obligatoire';
    if (!contreExpertData.indemnisation)
    errors.indemnisation = 'Ce champ est obligatoire';
    setContreExpertErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const validateReglement = (): boolean => {
    const errors: Partial<ReglementData> = {};
    if (!reglementData.dateReglement)
    errors.dateReglement = 'Ce champ est obligatoire';
    if (!reglementData.descriptionReglement)
    errors.descriptionReglement = 'Ce champ est obligatoire';
    setReglementErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Handle next step
  const handleNext = () => {
    if (currentStep === 0) {
      // Declaration step - just advance
      setCurrentStep(1);
      setActiveTab(1);
    } else if (currentStep === 1) {
      // Expert step - validate before advancing
      if (validateExpert()) {
        setCurrentStep(2);
        setActiveTab(2);
        setIsEditingExpert(false);
      }
    } else if (currentStep === 2) {
      // Contre-expert step - validate before advancing
      if (validateContreExpert()) {
        setCurrentStep(3);
        setActiveTab(3);
        setIsEditingContreExpert(false);
      }
    } else if (currentStep === 3) {
      // Reglement step - validate before completing
      if (validateReglement()) {
        setCurrentStep(4);
        setIsEditingReglement(false);
      }
    }
  };
  // Handle save edit
  const handleSaveExpert = () => {
    if (validateExpert()) {
      setIsEditingExpert(false);
    }
  };
  const handleSaveContreExpert = () => {
    if (validateContreExpert()) {
      setIsEditingContreExpert(false);
    }
  };
  const handleSaveReglement = () => {
    if (validateReglement()) {
      setIsEditingReglement(false);
    }
  };
  // Step state helpers
  const isStepCompleted = (index: number) => index < currentStep;
  const isStepActive = (index: number) => index === currentStep;
  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };
  // Get decision label
  const getDecisionLabel = (
  value: string,
  options: {
    value: string;
    label: string;
  }[]) =>
  {
    const option = options.find((o) => o.value === value);
    return option ? option.label : value;
  };
  const renderStepIcon = (tabIndex: number, Icon: React.ElementType) => {
    const completed = isStepCompleted(tabIndex);
    const active = isStepActive(tabIndex);
    const isAcheveTab = tabIndex === 4;
    if (isAcheveTab) {
      if (currentStep >= 4) {
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center z-10 relative shadow-sm shadow-emerald-200">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>);

      }
      return (
        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center z-10 relative">
          <Icon className="w-3.5 h-3.5 text-slate-300" strokeWidth={2} />
        </div>);

    }
    if (completed) {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center z-10 relative shadow-sm shadow-emerald-200">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>);

    }
    if (active) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center z-10 relative shadow-sm shadow-slate-300">
          <Pencil className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>);

    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center z-10 relative">
        <Icon className="w-3.5 h-3.5 text-slate-300" strokeWidth={2} />
      </div>);

  };
  const getStepLabelClasses = (tabIndex: number) => {
    const isAcheveTab = tabIndex === 4;
    if (isAcheveTab) {
      return currentStep >= 4 ?
      'font-semibold text-emerald-600' :
      'text-slate-300';
    }
    if (isStepCompleted(tabIndex)) return 'font-semibold text-emerald-600';
    if (isStepActive(tabIndex)) return 'font-bold text-slate-800';
    return 'text-slate-300';
  };
  const getConnectorColor = (fromIndex: number) => {
    if (fromIndex < currentStep) return 'bg-emerald-400';
    return 'bg-slate-200';
  };
  // Check if tab is clickable
  const isTabClickable = (tabIndex: number) => {
    // Achevé tab is never clickable
    if (tabIndex === 4) return false;
    // Can only click on completed steps or current step
    return tabIndex <= currentStep;
  };
  // Check if can edit a step
  const canEditStep = (stepIndex: number) => {
    // Declaration (step 0) can NEVER be edited
    if (stepIndex === 0) return false;
    // Can only edit completed steps (not future steps)
    return stepIndex < currentStep;
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        // Declaration - always read-only
        return (
          <motion.div
            key="declaration"
            initial={{
              opacity: 0,
              y: 8
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.2
            }}
            className="bg-white">
            
            <FieldRow label="Date d'accident" value={sinistre.dateAccident} />
            <FieldRow label="Type d'accident" value={sinistre.typeAccident} />
            <FieldRow label="Emplacement" value={sinistre.emplacement} />
            <FieldRow
              label="Description des dégâts"
              value={sinistre.description} />
            
            <FieldRow
              label="Chauffeur"
              value={sinistre.chauffeur || 'Non spécifié'} />
            
            <FieldRow label="Véhicule assuré par" value="" />
            <div className="px-8 py-5 flex gap-4">
              {currentStep === 0 &&
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                
                  Suivant
                </button>
              }
            </div>
          </motion.div>);

      case 1:
        // Expert - editable when active or when editing completed step
        const showExpertForm = currentStep === 1 || isEditingExpert;
        const expertCompleted = currentStep > 1;
        return (
          <motion.div
            key="expert"
            initial={{
              opacity: 0,
              y: 8
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.2
            }}
            className="bg-white">
            
            {showExpertForm ?
            // Editable form
            <>
                <EditableField
                label="Date de l'expertise"
                value={expertData.dateExpertise}
                onChange={(v) => {
                  setExpertData({
                    ...expertData,
                    dateExpertise: v
                  });
                  if (expertErrors.dateExpertise)
                  setExpertErrors({
                    ...expertErrors,
                    dateExpertise: undefined
                  });
                }}
                type="date"
                required
                error={expertErrors.dateExpertise} />
              
                <EditableField
                label="Décision de l'expert"
                value={expertData.decision}
                onChange={(v) => {
                  setExpertData({
                    ...expertData,
                    decision: v
                  });
                  if (expertErrors.decision)
                  setExpertErrors({
                    ...expertErrors,
                    decision: undefined
                  });
                }}
                type="select"
                options={decisionOptions}
                required
                error={expertErrors.decision} />
              
                <EditableField
                label="Indemnisation estimée"
                value={expertData.indemnisation}
                onChange={(v) => {
                  setExpertData({
                    ...expertData,
                    indemnisation: v
                  });
                  if (expertErrors.indemnisation)
                  setExpertErrors({
                    ...expertErrors,
                    indemnisation: undefined
                  });
                }}
                type="number"
                required
                error={expertErrors.indemnisation}
                placeholder="Montant en TND" />
              
                <EditableField
                label="Description des dégâts"
                value={expertData.description}
                onChange={(v) =>
                setExpertData({
                  ...expertData,
                  description: v
                })
                }
                type="textarea"
                placeholder="Description détaillée..." />
              
                <div className="px-8 py-5 flex gap-4">
                  {isEditingExpert ?
                <>
                      <button
                    onClick={() => setIsEditingExpert(false)}
                    className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                    
                        Annuler
                      </button>
                      <button
                    onClick={handleSaveExpert}
                    className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                    
                        Enregistrer
                      </button>
                    </> :

                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                  
                      Suivant
                    </button>
                }
                </div>
              </> :

            // Read-only view
            <>
                <FieldRow
                label="Date de l'expertise"
                value={formatDateDisplay(expertData.dateExpertise)} />
              
                <FieldRow
                label="Décision de l'expert"
                value={getDecisionLabel(expertData.decision, decisionOptions)} />
              
                <FieldRow
                label="Indemnisation estimée"
                value={
                expertData.indemnisation ?
                `${expertData.indemnisation} TND` :
                ''
                } />
              
                <FieldRow
                label="Description des dégâts"
                value={expertData.description} />
              
                <div className="px-8 py-5 flex gap-4">
                  {canEditStep(1) &&
                <button
                  onClick={() => setIsEditingExpert(true)}
                  className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                  
                      Modifier
                    </button>
                }
                </div>
              </>
            }
          </motion.div>);

      case 2:
        // Contre-expert - editable when active or when editing completed step
        const showContreExpertForm = currentStep === 2 || isEditingContreExpert;
        const contreExpertCompleted = currentStep > 2;
        return (
          <motion.div
            key="contre_expert"
            initial={{
              opacity: 0,
              y: 8
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.2
            }}
            className="bg-white">
            
            {showContreExpertForm ?
            // Editable form
            <>
                <EditableField
                label="Date de contre expertise"
                value={contreExpertData.dateContreExpertise}
                onChange={(v) => {
                  setContreExpertData({
                    ...contreExpertData,
                    dateContreExpertise: v
                  });
                  if (contreExpertErrors.dateContreExpertise)
                  setContreExpertErrors({
                    ...contreExpertErrors,
                    dateContreExpertise: undefined
                  });
                }}
                type="date"
                required
                error={contreExpertErrors.dateContreExpertise} />
              
                <EditableField
                label="Décision du contre expert"
                value={contreExpertData.decision}
                onChange={(v) => {
                  setContreExpertData({
                    ...contreExpertData,
                    decision: v
                  });
                  if (contreExpertErrors.decision)
                  setContreExpertErrors({
                    ...contreExpertErrors,
                    decision: undefined
                  });
                }}
                type="select"
                options={contreExpertDecisionOptions}
                required
                error={contreExpertErrors.decision} />
              
                <EditableField
                label="Indemnisation estimée"
                value={contreExpertData.indemnisation}
                onChange={(v) => {
                  setContreExpertData({
                    ...contreExpertData,
                    indemnisation: v
                  });
                  if (contreExpertErrors.indemnisation)
                  setContreExpertErrors({
                    ...contreExpertErrors,
                    indemnisation: undefined
                  });
                }}
                type="number"
                required
                error={contreExpertErrors.indemnisation}
                placeholder="Montant en TND" />
              
                <EditableField
                label="Description des dégâts"
                value={contreExpertData.description}
                onChange={(v) =>
                setContreExpertData({
                  ...contreExpertData,
                  description: v
                })
                }
                type="textarea"
                placeholder="Description détaillée..." />
              
                <div className="px-8 py-5 flex gap-4">
                  {isEditingContreExpert ?
                <>
                      <button
                    onClick={() => setIsEditingContreExpert(false)}
                    className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                    
                        Annuler
                      </button>
                      <button
                    onClick={handleSaveContreExpert}
                    className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                    
                        Enregistrer
                      </button>
                    </> :

                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors">
                  
                      Suivant
                    </button>
                }
                </div>
              </> :

            // Read-only view
            <>
                <FieldRow
                label="Date de contre expertise"
                value={formatDateDisplay(
                  contreExpertData.dateContreExpertise
                )} />
              
                <FieldRow
                label="Décision du contre expert"
                value={getDecisionLabel(
                  contreExpertData.decision,
                  contreExpertDecisionOptions
                )} />
              
                <FieldRow
                label="Indemnisation estimée"
                value={
                contreExpertData.indemnisation ?
                `${contreExpertData.indemnisation} TND` :
                ''
                } />
              
                <FieldRow
                label="Description des dégâts"
                value={contreExpertData.description} />
              
                <div className="px-8 py-5 flex gap-4">
                  {canEditStep(2) &&
                <button
                  onClick={() => setIsEditingContreExpert(true)}
                  className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                  
                      Modifier
                    </button>
                }
                </div>
              </>
            }
          </motion.div>);

      case 3:
        // Reglement
        const showReglementForm = currentStep === 3 || isEditingReglement;
        return (
          <motion.div
            key="reglement"
            initial={{
              opacity: 0,
              y: 8
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.2
            }}
            className="bg-white">
            
            {showReglementForm ?
            <>
                <EditableField
                label="Date de règlement"
                value={reglementData.dateReglement}
                onChange={(v) => {
                  setReglementData({
                    ...reglementData,
                    dateReglement: v
                  });
                  if (reglementErrors.dateReglement)
                  setReglementErrors({
                    ...reglementErrors,
                    dateReglement: undefined
                  });
                }}
                type="date"
                required
                error={reglementErrors.dateReglement} />
              
                <EditableField
                label="Montant du règlement"
                value={reglementData.descriptionReglement}
                onChange={(v) => {
                  setReglementData({
                    ...reglementData,
                    descriptionReglement: v
                  });
                  if (reglementErrors.descriptionReglement)
                  setReglementErrors({
                    ...reglementErrors,
                    descriptionReglement: undefined
                  });
                }}
                type="number"
                required
                error={reglementErrors.descriptionReglement}
                placeholder="Montant en TND" />
              
                <div className="px-8 py-5 flex gap-4">
                  {isEditingReglement ?
                <>
                      <button
                    onClick={() => setIsEditingReglement(false)}
                    className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                    
                        Annuler
                      </button>
                      <button
                    onClick={handleSaveReglement}
                    className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                    
                        Enregistrer
                      </button>
                    </> :

                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
                  
                      Terminer le dossier
                    </button>
                }
                </div>
              </> :

            <>
                <FieldRow
                label="Date de règlement"
                value={formatDateDisplay(reglementData.dateReglement)} />
              
                <FieldRow
                label="Montant du règlement"
                value={
                reglementData.descriptionReglement ?
                `${reglementData.descriptionReglement} TND` :
                ''
                } />
              

                {currentStep >= 4 &&
              <div className="px-8 py-5 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-emerald-700 text-[15px] font-semibold">
                        Ce dossier est réglé.
                      </p>
                    </div>
                  </div>
              }

                <div className="px-8 py-5 flex gap-4">
                  {canEditStep(3) &&
                <button
                  onClick={() => setIsEditingReglement(true)}
                  className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                  
                      Modifier
                    </button>
                }
                </div>
              </>
            }
          </motion.div>);

      default:
        return null;
    }
  };
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-4 flex items-center gap-4 flex-shrink-0 shadow-md">
        <button
          onClick={onBack}
          className="text-white/90 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all">
          
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-lg">
          Suivi dossier sinistre N° {sinistre.id} de {sinistre.vehicule}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-6xl mx-auto">
          {/* Stepper Bar */}
          <div className="bg-white px-6 md:px-10 py-7 border-b border-slate-100">
            <div className="flex items-center w-full">
              {TABS.map((tab, index) => {
                const isAcheveTab = index === 4;
                const isClickable = isTabClickable(index);
                const isActiveTab = activeTab === index;
                return (
                  <Fragment key={tab.id}>
                    {/* Step item */}
                    {isClickable ?
                    <button
                      onClick={() => setActiveTab(index)}
                      className="flex items-center gap-2.5 flex-shrink-0 group">
                      
                        {renderStepIcon(index, tab.icon)}
                        <span
                        className={`text-sm hidden sm:inline transition-colors ${getStepLabelClasses(index)} ${isActiveTab ? 'underline underline-offset-4 decoration-2' : ''}`}>
                        
                          {tab.label}
                        </span>
                      </button> :

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        {renderStepIcon(index, tab.icon)}
                        <span
                        className={`text-sm hidden sm:inline ${getStepLabelClasses(index)}`}>
                        
                          {tab.label}
                        </span>
                      </div>
                    }

                    {/* Connector line between steps */}
                    {index < TABS.length - 1 &&
                    <div className="flex-1 mx-3 md:mx-4">
                        <div
                        className={`h-[2px] w-full rounded-full ${getConnectorColor(index)}`} />
                      
                      </div>
                    }
                  </Fragment>);

              })}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <div className="min-h-[380px] bg-white">{renderTabContent()}</div>
          </AnimatePresence>
        </div>
      </div>
    </div>);

}