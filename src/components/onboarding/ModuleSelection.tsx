import { ArrowLeft, Lock, Play } from 'lucide-react';
import { MODULE_REGISTRY } from './module-registry';
import type { OnboardingModuleId } from './module-registry';
import { OnboardingLayout } from './OnboardingLayout';

interface ModuleSelectionProps {
  onBack: () => void;
  onSelectModule: (moduleId: OnboardingModuleId) => void;
}

export function ModuleSelection({ onBack, onSelectModule }: ModuleSelectionProps) {
  const hasAvailableModule = MODULE_REGISTRY.some((m) => m.available);

  return (
    <OnboardingLayout
      title="Choisir un module"
      subtitle="Sélectionnez le module que vous souhaitez apprendre. D'autres tutoriels seront disponibles prochainement."
      footer={
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULE_REGISTRY.map((module) => {
          const Icon = module.icon;
          const isAvailable = module.available;

          if (isAvailable) {
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => onSelectModule(module.id)}
                className="group text-left rounded-2xl border-2 border-blue-400/50 bg-gradient-to-br from-blue-600/25 to-blue-800/10 backdrop-blur-xl p-5 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${module.accentClass}`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-white">
                  {module.title}
                </h3>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {module.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 group-hover:text-blue-200">
                  <Play className="w-3.5 h-3.5" />
                  Accéder au module
                </span>
              </button>
            );
          }

          return (
            <div
              key={module.id}
              aria-disabled
              className="relative rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm p-5 opacity-60 cursor-not-allowed select-none"
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${module.accentClass} opacity-50`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-slate-400">
                {module.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                {module.description}
              </p>
              <p className="mt-4 text-[11px] font-medium text-slate-500 italic">
                Tutoriel bientôt disponible
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        {hasAvailableModule
          ? 'Sélectionnez un module disponible pour commencer'
          : 'Les tutoriels interactifs seront bientôt disponibles'}
      </p>
    </OnboardingLayout>
  );
}
