import { useCallback, useEffect, useState } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import type { CallBackProps, Step, TooltipRenderProps } from 'react-joyride';
import { ArrowLeft, ArrowRight, Check, GraduationCap, X } from 'lucide-react';

/** Tab of the tracking table that a step needs to show (opened before the step) */
type TrackingTab = 'suivie_generale' | 'stop_circulation' | 'trajectoire' | 'alertes';
type TourStep = Step & { data?: { tab?: TrackingTab } };

/** Bullet list inside a step */
function Points({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#2F6BFF] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const STEP_LIST: TourStep[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Bienvenue dans le module Tracking',
    content: (
      <>
        <p>
          Ce tutoriel vous présente, fonctionnalité par fonctionnalité, comment suivre votre flotte en temps réel :
          carte, tableau de suivi, arrêts, trajectoires et alertes.
        </p>
        <p className="mt-2">Comptez environ 3 minutes. Vous pouvez le quitter à tout moment.</p>
      </>
    ),
  },
  {
    target: '.leaflet-container',
    placement: 'center',
    title: 'La carte en temps réel',
    content: (
      <Points
        items={[
          'Chaque véhicule apparaît avec son icône et une couleur selon son état : en marche, à l’arrêt, hors ligne ou en alerte.',
          'Les véhicules proches sont regroupés en bulles : cliquez dessus pour les afficher.',
          'Cliquez sur un véhicule pour ouvrir sa fiche (conducteur, vitesse, carburant, documents…).',
        ]}
      />
    ),
  },
  {
    target: '[data-tour="panel-toggle"]',
    placement: 'right',
    title: 'Afficher ou masquer le tableau',
    content: 'Ce bouton replie le tableau de suivi pour libérer toute la carte, puis le rouvre au même endroit.',
  },
  {
    target: '[data-tour="tabs"]',
    placement: 'bottom',
    title: 'Les quatre vues du suivi',
    content:
      'Passez d’une vue à l’autre : Suivi général, Stop & Circulation, Trajectoire et Alertes. Nous allons les voir une par une.',
  },
  {
    target: '[data-tour="tab-suivie_generale"]',
    placement: 'bottom',
    data: { tab: 'suivie_generale' },
    title: 'Suivi général',
    content: (
      <>
        <p>La position actuelle de chaque véhicule : date, vitesse, adresse, conducteur et département.</p>
        <Points items={['Cliquez sur une ligne pour localiser le véhicule sur la carte.']} />
      </>
    ),
  },
  {
    target: '[data-tour="filter-group"]',
    placement: 'bottom',
    data: { tab: 'suivie_generale' },
    title: 'Grouper le tableau',
    content: 'Glissez l’en-tête d’une colonne (par exemple « Département ») dans cette zone pour regrouper les lignes.',
  },
  {
    target: '[data-tour="filter-vehicles"]',
    placement: 'bottom',
    title: 'Choisir les véhicules',
    content: (
      <Points
        items={[
          'Recherchez un véhicule par matricule, IMEI ou nom.',
          'Cochez « Tous les véhicules » pour tout sélectionner, ou choisissez-les un par un.',
        ]}
      />
    ),
  },
  {
    target: '[data-tour="filter-search"]',
    placement: 'bottom',
    title: 'Rechercher dans le tableau',
    content: 'Filtrez instantanément les lignes affichées : adresse, conducteur, matricule…',
  },
  {
    target: '[data-tour="filter-columns"]',
    placement: 'bottom-end',
    title: 'Colonnes affichées',
    content: 'Choisissez les colonnes à afficher (avec une recherche), ou revenez à l’affichage par défaut.',
  },
  {
    target: '[data-tour="table"]',
    placement: 'right',
    title: 'Le tableau de suivi',
    content: (
      <Points
        items={[
          'Cliquez sur un en-tête pour trier, et glissez-le pour changer l’ordre des colonnes.',
          'La colonne Dashboard montre les voyants du véhicule (moteur, documents, maintenance…).',
          'Le menu ⋮ de chaque ligne regroupe les actions : position actuelle, trajectoire, rapport détaillé…',
        ]}
      />
    ),
  },
  {
    target: '[data-tour="footer"]',
    placement: 'top',
    title: 'Pagination et export',
    content: 'Choisissez le nombre de lignes par page, naviguez entre les pages et exportez le tableau en PDF ou Excel.',
  },
  {
    target: '[data-tour="tab-stop_circulation"]',
    placement: 'bottom',
    data: { tab: 'stop_circulation' },
    title: 'Stop & Circulation',
    content: (
      <Points
        items={[
          'Sélectionnez un ou plusieurs véhicules : les arrêts et circulations s’affichent, regroupés par véhicule et avec une couleur par véhicule.',
          'Sur la carte, chaque arrêt est un panneau STOP et chaque circulation un tracé.',
          'Cliquez sur un véhicule pour sa vue globale, ou sur l’œil pour masquer son trajet.',
        ]}
      />
    ),
  },
  {
    target: '[data-tour="filter-period"]',
    placement: 'bottom',
    data: { tab: 'stop_circulation' },
    title: 'Choisir la période',
    content:
      'Dans les vues Stop & Circulation, Trajectoire et Alertes, définissez la date et l’heure de début et de fin. Le tableau et la carte se mettent à jour.',
  },
  {
    target: '[data-tour="tab-trajectoire"]',
    placement: 'bottom',
    data: { tab: 'trajectoire' },
    title: 'Trajectoire',
    content: (
      <Points
        items={[
          'Le parcours détaillé d’un véhicule, sur les routes réelles.',
          'Basculez entre le mode lignes et le mode graphique de vitesse.',
          'Animez le trajet sur la carte, consultez les statistiques ou enregistrez-le comme route.',
        ]}
      />
    ),
  },
  {
    target: '[data-tour="tab-alertes"]',
    placement: 'bottom',
    data: { tab: 'alertes' },
    title: 'Alertes',
    content: (
      <Points
        items={[
          'Toutes les alertes de la période : excès de vitesse, carburant, geofences, SOS…',
          'Cliquez sur une ligne : l’icône de l’alerte apparaît sur la carte avec ses détails.',
        ]}
      />
    ),
  },
  {
    target: '[data-tour="filter-alert-types"]',
    placement: 'bottom',
    data: { tab: 'alertes' },
    title: 'Filtrer par type d’alerte',
    content: 'Recherchez et cochez les types d’alerte à afficher. « Toutes les alertes » les sélectionne toutes.',
  },
  {
    target: '[data-tour="map-controls"]',
    placement: 'left',
    title: 'Les outils de la carte',
    content: (
      <Points
        items={[
          'Opérations géographiques : créez des geofences, des points d’intérêt et des routes.',
          'Visibilité et couches : choisissez ce qui s’affiche et le fond de carte.',
        ]}
      />
    ),
  },
  {
    target: '[aria-label="Ouvrir le Monitoring Center"]',
    placement: 'top-end',
    title: 'Monitoring Center',
    content: 'L’état de la flotte d’un coup d’œil : véhicules en marche, à l’arrêt, hors ligne et en alerte. Cliquez pour le détail.',
  },
  {
    target: '[aria-label$="assistant TUNAVI"]',
    placement: 'left',
    title: 'Assistant TUNAVI',
    content: 'Posez vos questions à l’assistant IA : où est un véhicule, quelles alertes aujourd’hui, etc.',
  },
  {
    target: 'body',
    placement: 'center',
    data: { tab: 'suivie_generale' },
    title: 'Vous êtes prêt !',
    content:
      'Vous connaissez maintenant les fonctionnalités du module Tracking. Explorez librement : la carte et le tableau sont à vous.',
  },
];

/** Every step opens its tooltip directly (no pulsing beacon first) */
const STEPS: TourStep[] = STEP_LIST.map((step) => ({ disableBeacon: true, ...step }));

/** Tooltip in the FleetIQ design system */
function TourTooltip({
  index,
  size,
  step,
  isLastStep,
  backProps,
  primaryProps,
  skipProps,
  closeProps,
  tooltipProps,
}: TooltipRenderProps) {
  const progress = ((index + 1) / size) * 100;
  return (
    <div
      {...tooltipProps}
      className="fiq-font w-[min(380px,calc(100vw-32px))] bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(15,27,61,0.45)] border border-[#E3E9F4] overflow-hidden text-left"
    >
      <div className="h-1 bg-[#EEF1F7]">
        <div className="h-full bg-[#2F6BFF] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full bg-[#EAF1FF] text-[#1E40AF] text-[11px] font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            Étape {index + 1} / {size}
          </span>
          <button
            {...closeProps}
            aria-label="Fermer le tutoriel"
            className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-[#8A94A6] hover:text-[#0F1B3D] hover:bg-[#F0F3F9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {step.title && <h3 className="mt-3 text-[16px] font-extrabold text-[#0F1B3D] leading-snug">{step.title}</h3>}
        <div className="mt-1.5 text-[13px] leading-relaxed text-[#5B6B8C]">{step.content}</div>
      </div>
      <div className="px-5 py-3 border-t border-[#EEF1F7] bg-[#F7F9FF] flex items-center justify-between gap-2">
        {!isLastStep ? (
          <button {...skipProps} className="text-[12px] font-semibold text-[#8A94A6] hover:text-[#0F1B3D]">
            Passer le tutoriel
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="h-9 px-3 rounded-xl border border-[#DCE3EF] bg-white text-[13px] font-semibold text-[#0F1B3D] hover:bg-[#F0F3F9] inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Précédent
            </button>
          )}
          <button
            {...primaryProps}
            className="h-9 px-4 rounded-xl bg-[#2F6BFF] text-white text-[13px] font-bold hover:bg-[#1F57E0] inline-flex items-center gap-1.5 shadow-sm"
          >
            {isLastStep ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Terminer
              </>
            ) : index === 0 ? (
              <>
                Commencer
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Suivant
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Opens a tab of the tracking table (the tour shows each view in turn) */
function openTab(tab: TrackingTab | undefined) {
  if (!tab) return;
  const button = document.querySelector<HTMLButtonElement>(`[data-tour="tab-${tab}"]`);
  if (button && button.getAttribute('aria-current') !== 'page') button.click();
}

/**
 * Guided tour of the tracking module (react-joyride), in French.
 * Each step highlights one feature; steps tied to a view open it first.
 */
export function TrackingTour({ run, onFinish }: { run: boolean; onFinish: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [ready, setReady] = useState(false);

  // Start from the first step once the tracking screen has rendered
  useEffect(() => {
    if (!run) {
      setReady(false);
      return;
    }
    setStepIndex(0);
    openTab('suivie_generale');
    const t = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(t);
  }, [run]);

  const goTo = useCallback((index: number) => {
    const next = STEPS[index];
    openTab(next?.data?.tab);
    // Let the view render before Joyride looks for the target
    window.setTimeout(() => setStepIndex(index), next?.data?.tab ? 250 : 0);
  }, []);

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
        openTab('suivie_generale');
        onFinish();
        return;
      }
      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        const delta = action === ACTIONS.PREV ? -1 : 1;
        const next = index + delta;
        if (next >= 0 && next < STEPS.length) goTo(next);
        else {
          openTab('suivie_generale');
          onFinish();
        }
      }
    },
    [goTo, onFinish]
  );

  return (
    <Joyride
      steps={STEPS}
      run={run && ready}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      disableScrolling
      disableScrollParentFix
      spotlightClicks={false}
      spotlightPadding={6}
      tooltipComponent={TourTooltip}
      callback={handleCallback}
      floaterProps={{ disableAnimation: true }}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        open: 'Ouvrir le tutoriel',
        skip: 'Passer le tutoriel',
      }}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(15, 27, 61, 0.55)',
          primaryColor: '#2F6BFF',
          arrowColor: '#FFFFFF',
        },
        spotlight: { borderRadius: 14 },
      }}
    />
  );
}
