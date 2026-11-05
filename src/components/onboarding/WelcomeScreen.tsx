import { Compass, GraduationCap, LogIn, Sparkles } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';

interface WelcomeScreenProps {
  onExplore: () => void;
  onStartTutorial: () => void;
  onLogin: () => void;
}

export function WelcomeScreen({
  onExplore,
  onStartTutorial,
  onLogin,
}: WelcomeScreenProps) {
  return (
    <OnboardingLayout
      title="Bienvenue sur FleetIQ"
      subtitle="Découvrez la plateforme de gestion de flotte. Explorez librement ou suivez un tutoriel guidé."
      footer={
        <button
          type="button"
          onClick={onLogin}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
          <LogIn className="w-4 h-4" />
          Se connecter
        </button>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <button
          type="button"
          onClick={onExplore}
          className="group text-left rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 hover:bg-white/10 hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 group-hover:bg-blue-500/30 transition-colors">
            <Compass className="w-6 h-6" />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-white">
            Explorer sans tutoriel
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Ouvrez la maquette et explorez l&apos;application librement, sans
            guide ni contraintes.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 group-hover:text-blue-300">
            Accéder à la maquette
            <Sparkles className="w-4 h-4" />
          </span>
        </button>

        <button
          type="button"
          onClick={onStartTutorial}
          className="group text-left rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 backdrop-blur-xl p-6 sm:p-8 hover:from-blue-600/30 hover:to-indigo-600/20 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white group-hover:bg-blue-400 transition-colors">
            <GraduationCap className="w-6 h-6" />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-white">
            Démarrer le tutoriel guidé
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Suivez un parcours interactif pour découvrir les modules et leurs
            fonctionnalités pas à pas.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-300 group-hover:text-blue-200">
            Choisir un module
            <Sparkles className="w-4 h-4" />
          </span>
        </button>
      </div>
    </OnboardingLayout>
  );
}
