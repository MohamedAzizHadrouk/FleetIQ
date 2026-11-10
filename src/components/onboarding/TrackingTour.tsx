import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import type { CallBackProps, Step, TooltipRenderProps } from 'react-joyride';
import { ArrowLeft, ArrowRight, Check, GraduationCap, MousePointerClick, RotateCcw, X } from 'lucide-react';

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
          'Le parcours détaillé d’un ou plusieurs véhicules, sur les routes réelles.',
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

/* ------------------------------------------------------------------ */
/* Hands-on mode: "Essayer" pauses the tour and lets the user test it */
/* ------------------------------------------------------------------ */

interface TourTask {
  /** What the user is asked to do */
  instruction: string;
  /** Optional tip shown under the instruction */
  hint?: string;
  /** Element(s) outlined while the user tries */
  highlight: string;
  /** Done when one of these events happens inside `within`… */
  events?: (keyof DocumentEventMap)[];
  within?: string;
  /** …this many times (default 1) */
  times?: number;
  /** …or when this check becomes true (polled) */
  check?: () => boolean;
}

const inputFilled = (selector: string) =>
  !!(document.querySelector<HTMLInputElement>(selector)?.value ?? '').trim();

/** Tasks offered on each step, keyed by the step target */
const TASKS: Record<string, TourTask> = {
  '.leaflet-container': {
    instruction: 'Zoomez avec la molette, déplacez la carte ou cliquez sur une bulle de véhicules.',
    hint: 'Un clic sur un véhicule ouvre sa fiche ; fermez-la avec ✕ pour retrouver le tableau.',
    highlight: '.leaflet-container',
    events: ['wheel', 'click'],
    within: '.leaflet-container',
  },
  '[data-tour="panel-toggle"]': {
    instruction: 'Masquez le tableau, puis rouvrez-le avec le même bouton.',
    highlight: '[data-tour="panel-toggle"]',
    events: ['click'],
    within: '[data-tour="panel-toggle"]',
    times: 2,
  },
  '[data-tour="tabs"]': {
    instruction: 'Cliquez sur l’onglet de votre choix pour changer de vue.',
    highlight: '[data-tour="tabs"]',
    events: ['click'],
    within: '[data-tour^="tab-"]',
  },
  '[data-tour="tab-suivie_generale"]': {
    instruction: 'Cliquez sur une ligne du tableau pour localiser le véhicule sur la carte.',
    highlight: '[data-tour="table"]',
    events: ['click'],
    within: '[data-tour="table"] tbody tr',
  },
  '[data-tour="filter-group"]': {
    instruction: 'Glissez l’en-tête « Département » du tableau dans la zone « Grouper ».',
    hint: 'Cliquez sur le ✕ de la zone pour annuler le regroupement.',
    highlight: '[data-tour="filter-group"]',
    check: () => document.querySelector('[data-tour="filter-group"]')?.getAttribute('data-grouped') === 'true',
  },
  '[data-tour="filter-vehicles"]': {
    instruction: 'Ouvrez la liste des véhicules et recherchez « 1000 ».',
    highlight: '[data-tour="filter-vehicles"]',
    check: () => inputFilled('[data-tour="filter-vehicles"] input[type="text"]'),
  },
  '[data-tour="filter-search"]': {
    instruction: 'Tapez « Tunis » pour filtrer le tableau.',
    highlight: '[data-tour="filter-search"]',
    check: () => inputFilled('[data-tour="filter-search"] input'),
  },
  '[data-tour="filter-columns"]': {
    instruction: 'Ouvrez le menu, puis masquez ou affichez une colonne.',
    highlight: '[data-tour="filter-columns"]',
    events: ['change'],
    within: '[data-tour="filter-columns"]',
  },
  '[data-tour="table"]': {
    instruction: 'Cliquez sur un en-tête pour trier, ou ouvrez le menu ⋮ d’une ligne.',
    highlight: '[data-tour="table"]',
    events: ['click'],
    within: '[data-tour="table"] thead th, [data-tour="table"] button[aria-label="Actions véhicule"]',
  },
  '[data-tour="footer"]': {
    instruction: 'Passez à la page suivante ou changez le nombre de lignes par page.',
    highlight: '[data-tour="footer"]',
    events: ['click', 'change'],
    within: '[data-tour="footer"] button:not([aria-label^="Exporter"]), [data-tour="footer"] select',
  },
  '[data-tour="tab-stop_circulation"]': {
    instruction: 'Sélectionnez un ou deux véhicules dans le filtre « Véhicules », puis regardez la carte.',
    hint: 'Cliquez ensuite sur le nom d’un véhicule pour sa vue globale.',
    highlight: '[data-tour="filter-vehicles"]',
    check: () =>
      document.querySelector('[data-tour="tab-stop_circulation"]')?.getAttribute('aria-current') === 'page' &&
      document.querySelectorAll('[data-tour="table"] tbody tr').length > 1,
  },
  '[data-tour="filter-period"]': {
    instruction: 'Ouvrez le calendrier et choisissez une période.',
    highlight: '[data-tour="filter-period"]',
    events: ['click'],
    within: '[data-tour="filter-period"]',
  },
  '[data-tour="tab-trajectoire"]': {
    instruction: 'Cliquez sur une ligne pour la voir sur la carte, ou sur ▶ pour animer le trajet.',
    hint: 'Fermez la fenêtre d’animation pour retrouver le tableau.',
    highlight: '[data-tour="table"]',
    events: ['click'],
    within: '[data-tour="table"] tbody tr, [aria-label="Animer le trajet sur la carte"]',
  },
  '[data-tour="tab-alertes"]': {
    instruction: 'Cliquez sur une alerte : son icône et ses détails s’affichent sur la carte.',
    highlight: '[data-tour="table"]',
    events: ['click'],
    within: '[data-tour="table"] tbody tr',
  },
  '[data-tour="filter-alert-types"]': {
    instruction: 'Ouvrez « Types » et recherchez « carburant ».',
    highlight: '[data-tour="filter-alert-types"]',
    check: () => inputFilled('input[aria-label^="Rechercher un type"]'),
  },
  '[data-tour="map-controls"]': {
    instruction: 'Ouvrez « Map Layer » et changez le fond de carte.',
    highlight: '[data-tour="map-controls"]',
    events: ['click'],
    within: '[data-tour="map-controls"]',
  },
  '[aria-label="Ouvrir le Monitoring Center"]': {
    instruction: 'Ouvrez le Monitoring Center pour voir l’état de la flotte.',
    highlight: '[aria-label="Ouvrir le Monitoring Center"]',
    events: ['click'],
    within: '[aria-label="Ouvrir le Monitoring Center"]',
  },
  '[aria-label$="assistant TUNAVI"]': {
    instruction: 'Ouvrez l’assistant et posez-lui une question.',
    highlight: '[aria-label$="assistant TUNAVI"]',
    events: ['click'],
    within: '[aria-label$="assistant TUNAVI"]',
  },
};

const taskOf = (step: Step | undefined) => (step && typeof step.target === 'string' ? TASKS[step.target] : undefined);

/** Watches the page until the user has done the task */
function watchTask(task: TourTask, onDone: () => void): () => void {
  let count = 0;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    onDone();
  };
  const listener = (e: Event) => {
    const el = e.target instanceof Element ? e.target : null;
    if (!el || !task.within || !el.closest(task.within)) return;
    count += 1;
    if (count >= (task.times ?? 1)) finish();
  };
  task.events?.forEach((type) => document.addEventListener(type, listener, true));
  const poll = task.check
    ? window.setInterval(() => {
        if (task.check!()) finish();
      }, 300)
    : undefined;
  return () => {
    task.events?.forEach((type) => document.removeEventListener(type, listener, true));
    if (poll) window.clearInterval(poll);
  };
}

/** Outlines the element(s) the user is testing (re-applied: React may re-render them) */
function useHighlight(selector: string | null) {
  useEffect(() => {
    if (!selector) return;
    const apply = () =>
      document.querySelectorAll(selector).forEach((el) => el.classList.add('fiq-tour-target'));
    apply();
    const t = window.setInterval(apply, 400);
    return () => {
      window.clearInterval(t);
      document.querySelectorAll('.fiq-tour-target').forEach((el) => el.classList.remove('fiq-tour-target'));
    };
  }, [selector]);
}

/** Lets the tooltip start the hands-on mode */
const TryContext = createContext<(index: number) => void>(() => {});

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
  const startTrying = useContext(TryContext);
  const task = taskOf(step);
  const progress = ((index + 1) / size) * 100;
  return (
    <div
      {...tooltipProps}
      className="fiq-font w-[min(390px,calc(100vw-32px))] bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(15,27,61,0.45)] border border-[#E3E9F4] overflow-hidden text-left"
    >
      <div className="h-1 bg-[#EEF1F7]">
        <div className="h-full bg-[#2F6BFF] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full bg-[#EAF1FF] text-[#1E40AF] text-[11px] font-bold">
              <GraduationCap className="w-3.5 h-3.5" />
              Étape {index + 1} / {size}
            </span>
            {task && (
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full bg-[#ECFDF3] text-[#15803D] text-[11px] font-bold">
                <MousePointerClick className="w-3.5 h-3.5" />
                Interactif
              </span>
            )}
          </div>
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
        {task && (
          <button
            type="button"
            onClick={() => startTrying(index)}
            className="mt-3 w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] hover:bg-[#DCFCE7] text-left transition-colors group"
          >
            <span className="w-8 h-8 rounded-lg bg-[#16A34A] text-white inline-flex items-center justify-center shrink-0">
              <MousePointerClick className="w-4 h-4" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[12.5px] font-extrabold text-[#14532D]">Essayer maintenant</span>
              <span className="block text-[11.5px] text-[#15803D] leading-snug">{task.instruction}</span>
            </span>
            <ArrowRight className="w-4 h-4 text-[#16A34A] shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
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

/** Floating coach shown while the user tests a feature (the whole interface stays usable) */
function TryCoach({
  index,
  task,
  title,
  done,
  inTracking,
  onReturnToTracking,
  onExplain,
  onNext,
  onQuit,
}: {
  index: number;
  task: TourTask;
  title: string;
  done: boolean;
  inTracking: boolean;
  onReturnToTracking: () => void;
  onExplain: () => void;
  onNext: () => void;
  onQuit: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Tutoriel : à vous de jouer"
      className="fiq-font fixed z-[10001] top-[84px] right-[76px] w-[min(340px,calc(100vw-32px))] bg-white rounded-2xl border border-[#E3E9F4] shadow-[0_20px_50px_-12px_rgba(15,27,61,0.45)] overflow-hidden"
    >
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full bg-[#ECFDF3] text-[#15803D] text-[11px] font-bold">
            <MousePointerClick className="w-3.5 h-3.5" />
            À vous de jouer · Étape {index + 1} / {STEPS.length}
          </span>
          <button
            type="button"
            onClick={onQuit}
            aria-label="Quitter le tutoriel"
            className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-[#8A94A6] hover:text-[#0F1B3D] hover:bg-[#F0F3F9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="mt-2.5 text-[14.5px] font-extrabold text-[#0F1B3D]">{title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-[#0F1B3D]">{task.instruction}</p>
        {task.hint && <p className="mt-1 text-[11.5px] leading-snug text-[#5B6B8C]">{task.hint}</p>}
        <div
          className={`mt-3 flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
            done ? 'bg-[#ECFDF3] text-[#15803D]' : 'bg-[#F7F9FF] text-[#5B6B8C]'
          }`}
          aria-live="polite"
        >
          {done ? (
            <>
              <span className="w-5 h-5 rounded-full bg-[#16A34A] text-white inline-flex items-center justify-center">
                <Check className="w-3 h-3" />
              </span>
              Bien joué ! Continuez à tester ou passez à la suite.
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-full border-2 border-dashed border-[#2F6BFF] animate-spin [animation-duration:3s]" />
              En attente de votre action…
            </>
          )}
        </div>
        {!inTracking && (
          <button
            type="button"
            onClick={onReturnToTracking}
            className="mt-2 w-full h-8 rounded-lg text-[12px] font-semibold text-[#2F6BFF] hover:bg-[#EAF1FF]"
          >
            Revenir au module Tracking
          </button>
        )}
      </div>
      <div className="px-4 py-2.5 border-t border-[#EEF1F7] bg-[#F7F9FF] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onExplain}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5B6B8C] hover:text-[#0F1B3D]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Revoir l’explication
        </button>
        <button
          type="button"
          onClick={onNext}
          className={`h-9 px-3.5 rounded-xl text-[13px] font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors ${
            done ? 'bg-[#16A34A] hover:bg-[#15803D] text-white' : 'bg-[#2F6BFF] hover:bg-[#1F57E0] text-white'
          }`}
        >
          {index === STEPS.length - 1 ? 'Terminer' : 'Étape suivante'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
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

/** After testing, put the screen back so the next step can be shown */
function tidyUpAfterTrying() {
  document.querySelector<HTMLButtonElement>('.trip-replay-panel button[aria-label="Fermer le replay"]')?.click();
  if (!document.querySelector('[data-tour="tabs"]')) {
    document.querySelector<HTMLButtonElement>('[data-tour="panel-toggle"]')?.click();
  }
  // close any open dropdown / menu
  document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

/**
 * Guided tour of the tracking module (react-joyride), in French.
 * Each step highlights one feature; "Essayer" lets the user test it for real.
 */
export function TrackingTour({
  run,
  inTracking = true,
  onReturnToTracking,
  onFinish,
}: {
  /** The tour is active */
  run: boolean;
  /** The tracking screen is shown (the tour pauses elsewhere) */
  inTracking?: boolean;
  onReturnToTracking?: () => void;
  onFinish: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [ready, setReady] = useState(false);
  /** Step being tested by the user (tour paused), or null */
  const [tryingIndex, setTryingIndex] = useState<number | null>(null);
  const [taskDone, setTaskDone] = useState(false);

  // Start from the first step once the tracking screen has rendered
  useEffect(() => {
    if (!run) {
      setReady(false);
      setTryingIndex(null);
      return;
    }
    setStepIndex(0);
    openTab('suivie_generale');
    const t = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(t);
  }, [run]);

  const trying = tryingIndex != null ? STEPS[tryingIndex] : undefined;
  const tryingTask = taskOf(trying);
  useHighlight(tryingTask?.highlight ?? null);

  // Detect when the user has done the task
  useEffect(() => {
    if (!tryingTask) return;
    setTaskDone(false);
    return watchTask(tryingTask, () => setTaskDone(true));
  }, [tryingTask]);

  const goTo = useCallback((index: number) => {
    const next = STEPS[index];
    openTab(next?.data?.tab);
    // Let the view render before Joyride looks for the target
    window.setTimeout(() => setStepIndex(index), next?.data?.tab ? 250 : 0);
  }, []);

  const finish = useCallback(() => {
    setTryingIndex(null);
    openTab('suivie_generale');
    onFinish();
  }, [onFinish]);

  /** Leave the hands-on mode and show step `index` */
  const resume = useCallback(
    (index: number) => {
      setTryingIndex(null);
      tidyUpAfterTrying();
      if (index >= STEPS.length) {
        finish();
        return;
      }
      window.setTimeout(() => goTo(index), 200);
    },
    [goTo, finish]
  );

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
        finish();
        return;
      }
      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        const delta = action === ACTIONS.PREV ? -1 : 1;
        const next = index + delta;
        if (next >= 0 && next < STEPS.length) goTo(next);
        else finish();
      }
    },
    [goTo, finish]
  );

  return (
    <TryContext.Provider value={(index) => setTryingIndex(index)}>
      <Joyride
        steps={STEPS}
        run={run && ready && inTracking && tryingIndex == null}
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
      {run && tryingIndex != null && tryingTask && (
        <TryCoach
          index={tryingIndex}
          task={tryingTask}
          title={String(trying?.title ?? '')}
          done={taskDone}
          inTracking={inTracking}
          onReturnToTracking={() => onReturnToTracking?.()}
          onExplain={() => resume(tryingIndex)}
          onNext={() => resume(tryingIndex + 1)}
          onQuit={finish}
        />
      )}
    </TryContext.Provider>
  );
}
