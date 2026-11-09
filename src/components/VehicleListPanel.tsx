import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ChevronDown,
  Clock,
  Car,
  AlertTriangle,
  Check,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
  BookmarkPlus,
  Route as RouteIcon,
  Ruler,
  Activity,
  Ban,
  Send,
  FileText,
  FileSpreadsheet,
  Group,
  Columns3,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Vehicle, type VehicleStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DateTimeRangePicker } from './DateTimeRangePicker';
import {
  DASH_INDICATORS,
  DashIcon,
  getTrajectoryDashIndicators,
} from '@/features/fleetiq/dashboard-icons';
import { useVehicleFieldConfig } from '@/features/fleetiq/vehicle-fields';
import {
  getVehicleTrajectory,
  TRAJECTORY_COLORS,
  type TrajSample,
  type TrajectoryFocus,
  type TrajectoryLayer,
  type VehicleTrajectory,
} from '@/features/fleetiq/trajectory-data';
import {
  TrajectoryDetailsRow,
  TrajectoryGraphRow,
  TrajectoryGroupHeader,
  StopRunGroupHeader,
  type TrajectoryViewMode,
} from './TrajectoryGroup';
import { FleetReminderCell } from './suivie/FleetReminderCell';
import { RemoteStopDialog } from './suivie/RemoteStopDialog';
import type { AadCommandMode } from './suivie/RemoteStopDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogBody } from '@/components/ui/dialog-body';
import {
  buildMockTrajectoryPath,
  getVehicleRowActions,
  hasAssignedEquipment,
  type VehicleRowActionId,
} from '@/features/suivie/vehicle-row-actions';
import {
  DndContext,
  closestCenter,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type CollisionDetection,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SUIVIE_DEPARTMENTS,
  type SuivieAction,
  type SuivieDepartment,
} from '@/features/suivie/column-defs';
import {
  ALERT_TYPES,
  applySuivieFilters,
  buildRowsForAction,
  getFilteredVehicleIds,
  type AppliedSuivieFilters,
  type SuivieRow,
  type CommandRow,
} from '@/features/suivie/mock-data';
import { useColumnPreferences } from '@/features/suivie/useColumnPreferences';
import {
  nextSortState,
  sortSuivieRows,
  type ColumnSortState,
  type SortDir,
} from '@/features/suivie/sort-rows';

interface VehicleListPanelProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onFilteredVehicleIdsChange?: (ids: string[] | null) => void;
  statusFilter?: Set<VehicleStatus>;
  isAdmin?: boolean;
  onFocusVehicleOnMap?: (vehicle: Vehicle, zoom?: number) => void;
  onShowTrajectoryTrack?: (path: [number, number][]) => void;
  /** Trajectory table: highlight a stop / segment / chart point on the map */
  onTrajectoryFocus?: (focus: TrajectoryFocus | null) => void;
  /** Trajectory table: animate a vehicle's trajectory on the map */
  onReplayTrajectory?: (vehicle: Vehicle, traj: VehicleTrajectory) => void;
  onStopReplay?: () => void;
  /** Vehicle whose trajectory is currently animated */
  replayVehicleId?: string | null;
  /** Trajectory table: save the driven path as a route overlay with the given title */
  onSaveTrajectoryRoute?: (vehicle: Vehicle, traj: VehicleTrajectory, name: string) => void;
  /** Frame the map on these points (beside the table) */
  onFitMapToPoints?: (points: [number, number][]) => void;
  /** Trajectory view: every displayed vehicle trajectory to draw on the map */
  onTrajectoryLayersChange?: (layers: TrajectoryLayer[]) => void;
  onClearTrajectoryTrack?: () => void;
  onOpenDetailedReport?: (vehicleId: string) => void;
  onOpenAlertConfiguration?: (vehicleId: string) => void;
}

const EMPTY_STATUS_FILTER = new Set<VehicleStatus>();
const GROUP_BY_DROP_ID = 'group-by-drop';

const groupByCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  const dropHit = pointerHits.find((c) => c.id === GROUP_BY_DROP_ID);
  if (dropHit) return [dropHit];
  return closestCenter(args);
};

function GroupByDropZone({
  groupByColumnId,
  groupByLabel,
  groupBySortDir,
  onToggleSortDir,
  onClear,
}: {
  groupByColumnId: string | null;
  groupByLabel: string | null;
  groupBySortDir: 'asc' | 'desc';
  onToggleSortDir: () => void;
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: GROUP_BY_DROP_ID });
  const SortIcon = groupBySortDir === 'asc' ? ArrowUp : ArrowDown;
  const sortLabel =
    groupBySortDir === 'asc' ? 'Ordre croissant' : 'Ordre décroissant';

  return (
    <div
      ref={setNodeRef}
      title="Glissez un en-tête de colonne ici pour grouper le tableau"
      data-tour="filter-group"
      className={`order-1 h-9 shrink-0 ${groupByColumnId ? 'max-w-[220px]' : 'w-[104px]'} flex items-center gap-1.5 rounded-xl border border-dashed px-2 transition-colors ${
        isOver
          ? 'border-blue-500 bg-blue-50'
          : groupByColumnId
            ? 'border-blue-300 bg-blue-50/70'
            : 'border-[#DCE3EF] bg-[#F7F9FF] hover:border-[#BFD3FF]'
      }`}
    >
      {groupByColumnId ? (
        <>
          <span className="inline-flex items-center gap-1 min-w-0 rounded-md bg-white border border-blue-200 px-1.5 py-0.5 text-[11px] font-semibold text-blue-800">
            <span className="truncate max-w-[100px]">
              {groupByLabel || groupByColumnId}
            </span>
            <button
              type="button"
              onClick={onClear}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 shrink-0"
              title="Retirer le regroupement"
              aria-label="Retirer le regroupement"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
          <button
            type="button"
            onClick={onToggleSortDir}
            title={sortLabel}
            aria-label={sortLabel}
            className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 hover:border-blue-300 hover:text-blue-800 shrink-0"
          >
            <SortIcon className="w-3 h-3" />
            <span>{groupBySortDir === 'asc' ? 'A→Z' : 'Z→A'}</span>
          </button>
        </>
      ) : (
        <p className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 truncate w-full">
          <Group className="w-3.5 h-3.5 shrink-0" />
          Grouper
        </p>
      )}
    </div>
  );
}
function SortableHeader({
  id,
  label,
  sortDir,
  onSortClick,
}: {
  id: string;
  label: string;
  sortDir: SortDir | null;
  onSortClick: (columnId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  const ariaSort =
    sortDir === 'asc'
      ? 'ascending'
      : sortDir === 'desc'
        ? 'descending'
        : 'none';

  const SortIcon =
    sortDir === 'asc' ? ArrowUp : sortDir === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <th
      ref={setNodeRef}
      style={style}
      aria-sort={ariaSort}
      className="px-2 py-2.5 text-xs font-bold text-white uppercase tracking-wider border-b border-blue-700 whitespace-nowrap select-none"
    >
      <button
        type="button"
        className={`flex items-center gap-1 min-w-0 w-full rounded px-1 py-0.5 touch-none cursor-grab active:cursor-grabbing hover:bg-blue-500/40 transition-colors ${
          sortDir ? 'bg-blue-500/30' : ''
        }`}
        title={`Trier ou glisser « ${label} »`}
        aria-label={`${label} : clic pour trier, glisser pour déplacer`}
        onClick={() => onSortClick(id)}
        {...attributes}
        {...listeners}
      >
        <span className="truncate">{label}</span>
        <SortIcon
          className={`w-3.5 h-3.5 shrink-0 ${
            sortDir ? 'text-white' : 'text-blue-200/80'
          }`}
        />
      </button>
    </th>
  );
}

/** Main views of the tracking panel (Commandes opens only from "Demande position actuelle") */
const TAB_ACTIONS: { id: SuivieAction; label: string; icon: typeof Activity }[] = [
  { id: 'suivie_generale', label: 'Suivi général', icon: Activity },
  { id: 'stop_circulation', label: 'Stop & Circulation', icon: Ban },
  { id: 'trajectoire', label: 'Trajectoire', icon: RouteIcon },
  { id: 'alertes', label: 'Alertes', icon: AlertTriangle },
];

const PAGE_SIZES = [25, 50, 100];

/** Accent / case-insensitive match for dropdown searches */
const fold = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const matchesQuery = (label: string, query: string) => !query.trim() || fold(label).includes(fold(query.trim()));

/** Search field shown at the top of a filter dropdown */
function DropdownSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A94A6] pointer-events-none" />
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-8 pl-8 pr-7 text-[12.5px] text-[#0F1B3D] bg-[#F7F9FF] border border-[#E3E9F4] rounded-lg placeholder:text-[#8A94A6] focus:outline-none focus:bg-white focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md text-[#8A94A6] hover:text-[#0F1B3D] hover:bg-[#F0F3F9] inline-flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/** Page numbers with ellipsis: 1 … 4 5 6 … 20 */
function pageWindow(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(total - 1, page + 1);
  if (from > 2) out.push('…');
  for (let p = from; p <= to; p++) out.push(p);
  if (to < total - 1) out.push('…');
  out.push(total);
  return out;
}

function TableFooter({
  page,
  pageSize,
  total,
  paginated,
  onPage,
  onPageSize,
}: {
  page: number;
  pageSize: number;
  total: number;
  paginated: boolean;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const navBtn =
    'w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#5B6B8C] hover:bg-[#F0F3F9] hover:text-[#0F1B3D] disabled:opacity-30 disabled:hover:bg-transparent transition-colors';
  return (
    <div data-tour="footer" className="fiq-font shrink-0 border-t border-[#E3E9F4] bg-white px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-2">
      {/* Rows per page + counter */}
      <div className="flex items-center gap-2.5 min-w-0">
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          disabled={!paginated}
          aria-label="Lignes par page"
          title="Lignes par page"
          className="h-8 pl-2.5 pr-7 rounded-lg border border-[#DCE3EF] bg-white text-[12.5px] font-bold text-[#0F1B3D] focus:outline-none focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 disabled:opacity-50"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <span className="text-[12.5px] text-[#5B6B8C] tabular-nums whitespace-nowrap">
          {paginated ? (
            <>
              <b className="font-bold text-[#0F1B3D]">
                {from}–{to}
              </b>{' '}
              sur <b className="font-bold text-[#0F1B3D]">{total}</b>
            </>
          ) : (
            <>
              <b className="font-bold text-[#0F1B3D]">{total}</b> lignes regroupées
            </>
          )}
        </span>
      </div>

      {/* Pages */}
      <nav aria-label="Pagination" className="flex-1 flex items-center justify-center gap-0.5 min-w-0">
        <button type="button" className={navBtn} onClick={() => onPage(1)} disabled={!paginated || page === 1} aria-label="Première page" title="Première page">
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button type="button" className={navBtn} onClick={() => onPage(page - 1)} disabled={!paginated || page === 1} aria-label="Page précédente" title="Page précédente">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {paginated &&
          pageWindow(page, pages).map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="w-6 text-center text-[12.5px] text-[#8A94A6]">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPage(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`min-w-8 h-8 px-2 rounded-lg text-[12.5px] tabular-nums transition-colors ${
                  p === page ? 'bg-[#EAF1FF] text-[#2F6BFF] font-extrabold ring-1 ring-[#BFD3FF]' : 'text-[#0F1B3D] font-semibold hover:bg-[#F0F3F9]'
                }`}
              >
                {p}
              </button>
            )
          )}
        <button type="button" className={navBtn} onClick={() => onPage(page + 1)} disabled={!paginated || page >= pages} aria-label="Page suivante" title="Page suivante">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button type="button" className={navBtn} onClick={() => onPage(pages)} disabled={!paginated || page >= pages} aria-label="Dernière page" title="Dernière page">
          <ChevronsRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Exports */}
      <div className="flex items-center gap-1.5 pl-3 border-l border-[#E3E9F4]">
        <button
          type="button"
          title="Exporter en PDF"
          aria-label="Exporter en PDF"
          className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[#DCE3EF] bg-white text-[12.5px] font-bold text-[#0F1B3D] hover:border-[#F8C9CB] hover:bg-[#FFF5F5] transition-colors"
        >
          <FileText className="w-4 h-4 text-[#E5484D]" />
          PDF
        </button>
        <button
          type="button"
          title="Exporter en Excel"
          aria-label="Exporter en Excel"
          className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[#DCE3EF] bg-white text-[12.5px] font-bold text-[#0F1B3D] hover:border-[#BBF7D0] hover:bg-[#F3FCF6] transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#16A34A]" />
          Excel
        </button>
      </div>
    </div>
  );
}

type OpenActionMenu = {
  rowId: string;
  vehicleId: string;
  x: number;
  y: number;
} | null;

function clampMenuPosition(
  x: number,
  y: number,
  menuWidth = 288,
  menuHeight = 460
) {
  const pad = 8;
  const maxX = window.innerWidth - menuWidth - pad;
  const maxY = window.innerHeight - menuHeight - pad;
  return {
    x: Math.max(pad, Math.min(x, maxX)),
    y: Math.max(pad, Math.min(y, maxY)),
  };
}

function cellClassFor(columnId: string, value: string): string {
  const base = 'px-3 py-2 text-xs text-slate-600';
  if (columnId === 'Dashboard') {
    return 'px-2 py-2 text-xs text-slate-600 whitespace-nowrap min-w-[7.5rem]';
  }
  if (
    columnId === 'Type' ||
    (columnId === 'Status' && value === 'Échouée') ||
    value.includes('↓')
  ) {
    return `${base} text-rose-600 font-medium`;
  }
  if (
    columnId === 'Status' &&
    (value === 'Circulation' || value === 'Exécutée' || value === 'ON')
  ) {
    return `${base}`;
  }
  if (columnId === 'name' || columnId === 'Vehicle' || columnId === 'Matricule') {
    return 'px-3 py-2 text-xs font-medium text-slate-700';
  }
  return base;
}

function renderCellContent(
  columnId: string,
  value: string,
  row: SuivieRow,
  onZoomClick?: (row: SuivieRow) => void
): React.ReactNode {
  if (columnId === 'Dashboard') {
    return <FleetReminderCell row={row} />;
  }

  if (columnId === 'horodatage') {
    const statusColor =
      String(value).includes('mn') && !String(value).includes('h')
        ? 'bg-emerald-500'
        : String(value).includes('j')
          ? 'bg-rose-500'
          : 'bg-amber-500';
    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-5 h-5 rounded-full ${statusColor} flex items-center justify-center`}
        >
          <Clock className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-medium text-slate-700">{value}</span>
      </div>
    );
  }

  if (columnId === 'Status' || columnId === 'StopRun') {
    const tone =
      value === 'Circulation' || value === 'Exécutée' || value === 'ON'
        ? 'bg-emerald-100 text-emerald-700'
        : value === 'Stop' || value === 'Échouée' || value === 'Expirée'
          ? 'bg-rose-100 text-rose-700'
          : value === 'Ralenti'
            ? 'bg-orange-100 text-orange-700'
            : 'bg-slate-100 text-slate-700';
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tone}`}>
        {value}
      </span>
    );
  }

  if (columnId === 'speed' || columnId === 'Speed') {
    const high = parseInt(value, 10) > 90;
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          high ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
        }`}
      >
        {value}
      </span>
    );
  }

  if (columnId === 'AlertIcon') {
    return value === '⚠' ? (
      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
    ) : (
      <span className="text-slate-400">—</span>
    );
  }

  if (columnId === 'Action') {
    const isZoom = value === 'Zoom' || value === 'Carte';
    return (
      <button
        type="button"
        className="text-[11px] font-medium text-blue-600 hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          if (isZoom && onZoomClick) onZoomClick(row);
        }}
      >
        {value || 'Carte'}
      </button>
    );
  }

  void row;
  return value || '—';
}

export function VehicleListPanel({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  isCollapsed = false,
  onToggleCollapse,
  onFilteredVehicleIdsChange,
  statusFilter = EMPTY_STATUS_FILTER,
  isAdmin = true,
  onFocusVehicleOnMap,
  onShowTrajectoryTrack,
  onClearTrajectoryTrack,
  onOpenDetailedReport,
  onOpenAlertConfiguration,
  onTrajectoryFocus,
  onReplayTrajectory,
  onStopReplay,
  replayVehicleId = null,
  onSaveTrajectoryRoute,
  onTrajectoryLayersChange,
  onFitMapToPoints,
}: VehicleListPanelProps) {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined'
      ? Math.min(800, Math.round(window.innerWidth * 0.9))
      : 800
  );
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const [isResizing, setIsResizing] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenActionMenu>(null);
  const [noEquipmentOpen, setNoEquipmentOpen] = useState(false);
  const [commandSentOpen, setCommandSentOpen] = useState<string | null>(null);
  /** Commands sent from this session ("Demande position actuelle"), newest first */
  const [sentCommands, setSentCommands] = useState<SuivieRow[]>([]);
  const [aadVehicle, setAadVehicle] = useState<Vehicle | null>(null);
  const [sort, setSort] = useState<ColumnSortState | null>(null);
  const [groupByColumnId, setGroupByColumnId] = useState<string | null>(null);
  const [groupBySortDir, setGroupBySortDir] = useState<'asc' | 'desc'>('asc');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  // Draft filter state
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const [draftAction, setDraftAction] =
    useState<SuivieAction>('suivie_generale');
  // All vehicles are selected by default
  const [draftVehicles, setDraftVehicles] = useState<Set<string>>(() => new Set(vehicles.map((v) => v.id)));
  const [draftAlertTypes, setDraftAlertTypes] = useState<Set<string>>(
    new Set()
  );

  // Applied filter state
  const [applied, setApplied] = useState<AppliedSuivieFilters | null>(null);

  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  /** Search inside the "Types d'alerte" and "Colonnes affichées" dropdowns */
  const [alertTypeSearch, setAlertTypeSearch] = useState('');
  const [columnSearch, setColumnSearch] = useState('');
  useEffect(() => {
    if (!isAlertDropdownOpen) setAlertTypeSearch('');
  }, [isAlertDropdownOpen]);
  useEffect(() => {
    if (!isColumnSettingsOpen) setColumnSearch('');
  }, [isColumnSettingsOpen]);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const alertDropdownRef = useRef<HTMLDivElement>(null);
  const columnSettingsRef = useRef<HTMLDivElement>(null);
  const suppressSortClickRef = useRef(false);

  const activeAction: SuivieAction = applied?.action ?? draftAction;
  const {
    visibleColumns: prefsVisibleColumns,
    allColumns,
    prefs,
    toggleVisible,
    reorder,
    resetToDefault,
  } = useColumnPreferences(activeAction);
  // Trajectory view: per-vehicle mode, details, saved routes, selection
  const [trajModes, setTrajModes] = useState<Record<string, TrajectoryViewMode>>({});
  const [trajDetails, setTrajDetails] = useState<Set<string>>(() => new Set());
  const [savedTrajRoutes, setSavedTrajRoutes] = useState<Set<string>>(() => new Set());
  const [selectedTrajRowId, setSelectedTrajRowId] = useState<string | null>(null);
  const [selectedSampleT, setSelectedSampleT] = useState<number | null>(null);
  const [trajToast, setTrajToast] = useState<string | null>(null);
  /** Vehicles whose trajectory is hidden on the map (all shown by default) */
  const [hiddenTrajVehicles, setHiddenTrajVehicles] = useState<Set<string>>(() => new Set());
  /** Stop & Circulation: overall view of one vehicle only (others temporarily off the map) */
  const [soloVehicleId, setSoloVehicleId] = useState<string | null>(null);
  /** "Enregistrer comme route" dialog */
  const [routeDraft, setRouteDraft] = useState<{ vehicleId: string; name: string } | null>(null);
  /** Visible width of the scrollable table, so group rows stay pinned to it */
  const [tableViewportW, setTableViewportW] = useState<number | null>(null);
  const tableResizeObs = useRef<ResizeObserver | null>(null);
  const tableScrollRef = useCallback((el: HTMLDivElement | null) => {
    tableResizeObs.current?.disconnect();
    if (!el) return;
    const update = () => setTableViewportW(el.clientWidth);
    update();
    tableResizeObs.current = new ResizeObserver(update);
    tableResizeObs.current.observe(el);
  }, []);
  // Trajectory rows whose full dashboard grid is expanded
  const [expandedDashRows, setExpandedDashRows] = useState<Set<string>>(() => new Set());
  // Same show/hide choice as the vehicle card (⚙ Personnaliser → Tableau de bord)
  const dashConfig = useVehicleFieldConfig();
  const shownDash = DASH_INDICATORS.filter((d) => dashConfig.isVisible(`dash:${d.id}`));
  const toggleDashRow = (rowId: string) =>
    setExpandedDashRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });

  const tableColumns = useMemo(
    () =>
      prefsVisibleColumns.filter((col) => col.id !== groupByColumnId),
    [prefsVisibleColumns, groupByColumnId]
  );

  const groupByLabel = useMemo(() => {
    if (!groupByColumnId) return null;
    return (
      allColumns.find((c) => c.id === groupByColumnId)?.label ??
      groupByColumnId
    );
  }, [allColumns, groupByColumnId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${y}/${m}/${d} ${h}:${min}:${s}`;
    };
    const startStr = formatDate(start);
    const endStr = formatDate(now);
    setDraftStartDate(startStr);
    setDraftEndDate(endStr);
    setApplied({
      action: 'suivie_generale',
      vehicleIds: new Set(),
      departments: new Set(),
      startDate: startStr,
      endDate: endStr,
      alertTypes: new Set(),
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 600 && newWidth <= 1200) setWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenu && !(e.target as Element).closest('.action-menu')) {
        setOpenMenu(null);
      }
      if (
        vehicleDropdownRef.current &&
        !vehicleDropdownRef.current.contains(e.target as Node)
      ) {
        setIsVehicleDropdownOpen(false);
      }
      if (
        alertDropdownRef.current &&
        !alertDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAlertDropdownOpen(false);
      }
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(e.target as Node)
      ) {
        setIsColumnSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  useEffect(() => {
    setSelectedTrajRowId(null);
    setSelectedSampleT(null);
    setSoloVehicleId(null);
    onTrajectoryFocus?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAction]);

  useEffect(() => {
    setSort(null);
    setTableSearch('');
    setGroupByColumnId(null);
    setGroupBySortDir('asc');
    setCollapsedGroups(new Set());
  }, [activeAction]);

  useEffect(() => {
    if (
      groupByColumnId &&
      !allColumns.some((c) => c.id === groupByColumnId)
    ) {
      setGroupByColumnId(null);
      setGroupBySortDir('asc');
      setCollapsedGroups(new Set());
    }
  }, [allColumns, groupByColumnId]);

  const toggleSort = useCallback((columnId: string) => {
    if (suppressSortClickRef.current) {
      suppressSortClickRef.current = false;
      return;
    }
    setSort((prev) => nextSortState(prev, columnId));
  }, []);

  const clearGroupBy = useCallback(() => {
    setGroupByColumnId(null);
    setGroupBySortDir('asc');
    setCollapsedGroups(new Set());
  }, []);

  const toggleGroupBySortDir = useCallback(() => {
    setGroupBySortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((v) => [v.id, v])),
    [vehicles]
  );

  const scopedRows = useMemo(() => {
    if (!applied) return [] as SuivieRow[];
    if (
      applied.action === 'stop_circulation' &&
      applied.vehicleIds.size === 0 &&
      applied.departments.size === 0
    )
      return [] as SuivieRow[];
    const all = buildRowsForAction(applied.action, vehicles);
    const filtered = applySuivieFilters(all, applied);
    if (applied.action !== 'commandes') return filtered;
    const scope = applied.vehicleIds;
    const mine = sentCommands.filter((c) => scope.size === 0 || scope.has(c.vehicleId));
    return [...mine, ...filtered];
  }, [applied, vehicles, sentCommands]);

  const tableRows = useMemo(() => {
    let rows = scopedRows;
    if (activeAction === 'suivie_generale' && statusFilter.size > 0) {
      rows = rows.filter((row) => {
        const status = vehicleById[row.vehicleId]?.status;
        return status != null && statusFilter.has(status);
      });
    }
    if (groupByColumnId) return rows;
    return sortSuivieRows(rows, sort);
  }, [
    scopedRows,
    activeAction,
    statusFilter,
    vehicleById,
    sort,
    groupByColumnId,
  ]);

  useEffect(() => {
    if (!onFilteredVehicleIdsChange || !applied) return;
    const hasScope =
      applied.vehicleIds.size > 0 || applied.departments.size > 0;
    if (!hasScope) {
      onFilteredVehicleIdsChange(null);
      return;
    }
    onFilteredVehicleIdsChange(getFilteredVehicleIds(tableRows));
  }, [applied, tableRows, onFilteredVehicleIdsChange]);

  const rowsByGroup = useMemo(() => {
    if (!groupByColumnId) return null;
    const grouped: Record<string, SuivieRow[]> = {};
    for (const row of tableRows) {
      const key = String(row[groupByColumnId] ?? '—');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }
    const entries = Object.entries(grouped).sort(([a], [b]) =>
      groupBySortDir === 'asc'
        ? a.localeCompare(b, 'fr', { sensitivity: 'base', numeric: true })
        : b.localeCompare(a, 'fr', { sensitivity: 'base', numeric: true })
    );
    return Object.fromEntries(
      entries.map(([key, rows]) => [key, sortSuivieRows(rows, sort)])
    );
  }, [groupByColumnId, groupBySortDir, tableRows, sort]);

  const rowMatchesTableSearch = useCallback(
    (row: SuivieRow, query: string) => {
      if (!query) return true;
      const parts: string[] = [
        row.vehicleName,
        row.department,
        row.vehicleId,
        row.id,
      ];
      for (const col of prefsVisibleColumns) {
        const raw = row[col.id];
        if (raw !== undefined && raw !== null) parts.push(String(raw));
      }
      return parts.join(' ').toLowerCase().includes(query);
    },
    [prefsVisibleColumns]
  );

  const displayTableRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return tableRows;
    return tableRows.filter((row) => rowMatchesTableSearch(row, q));
  }, [tableRows, tableSearch, rowMatchesTableSearch]);

  // Pagination (not applied while rows are grouped by a column)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const paginated = !groupByColumnId;
  const pageCount = Math.max(1, Math.ceil(displayTableRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = paginated
    ? displayTableRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : displayTableRows;
  useEffect(() => {
    setPage(1);
  }, [activeAction, applied, tableSearch, sort, pageSize, groupByColumnId]);

  /** Vehicles listed in the trajectory table, in display order, with their map colour */
  const trajVehicleOrder = useMemo(() => {
    if (activeAction !== 'trajectoire' && activeAction !== 'stop_circulation') return [] as string[];
    const seen: string[] = [];
    for (const row of displayTableRows) if (!seen.includes(row.vehicleId)) seen.push(row.vehicleId);
    return seen;
  }, [activeAction, displayTableRows]);
  const trajColorOf = (vehicleId: string) =>
    TRAJECTORY_COLORS[Math.max(0, trajVehicleOrder.indexOf(vehicleId)) % TRAJECTORY_COLORS.length];

  useEffect(() => {
    if (!onTrajectoryLayersChange) return;
    if (activeAction !== 'trajectoire' && activeAction !== 'stop_circulation') {
      onTrajectoryLayersChange([]);
      return;
    }
    const withStops = activeAction === 'stop_circulation';
    const layers: TrajectoryLayer[] = [];
    trajVehicleOrder.forEach((vehicleId, i) => {
      if (hiddenTrajVehicles.has(vehicleId)) return;
      if (withStops && soloVehicleId && vehicleId !== soloVehicleId) return;
      const vehicle = vehicleById[vehicleId];
      const traj = vehicle ? getVehicleTrajectory(vehicle) : null;
      if (!vehicle || !traj || traj.path.length < 2) return;
      layers.push({
        vehicleId,
        label: vehicle.matricule || vehicle.name,
        color: TRAJECTORY_COLORS[i % TRAJECTORY_COLORS.length],
        path: traj.path,
        ...(withStops && {
          runs: traj.segments.filter((g) => g.kind === 'Circulation' && g.path.length > 1).map((g) => g.path),
          stops: traj.segments
            .filter((g) => g.kind === 'Stop')
            .map((g) => ({
              id: g.id,
              position: g.position,
              start: g.start.getTime(),
              durationMin: g.durationMin,
              place: g.place,
            })),
        }),
      });
    });
    onTrajectoryLayersChange(layers);
  }, [activeAction, trajVehicleOrder, hiddenTrajVehicles, soloVehicleId, vehicleById, onTrajectoryLayersChange]);

  // Stop & Circulation: frame all displayed vehicles when the tab opens or the selection changes
  const stopRunFitKey = activeAction === 'stop_circulation' ? trajVehicleOrder.join(',') : '';
  useEffect(() => {
    if (!stopRunFitKey || !onFitMapToPoints) return;
    const points: [number, number][] = [];
    for (const id of trajVehicleOrder) {
      const v = vehicleById[id];
      const t = v ? getVehicleTrajectory(v) : null;
      if (t) points.push(...t.segments.map((g) => g.position));
    }
    if (points.length) onFitMapToPoints(points);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopRunFitKey]);

  const stopCirculationDistanceTotalKm = useMemo(() => {
    if (activeAction !== 'stop_circulation') return null;
    let total = 0;
    for (const row of displayTableRows) {
      const raw = String(row.Distance ?? '');
      const n = parseFloat(raw.replace(',', '.').replace(/[^\d.]/g, ''));
      if (!Number.isNaN(n)) total += n;
    }
    return total;
  }, [activeAction, displayTableRows]);

  const displayRowsByGroup = useMemo(() => {
    if (!rowsByGroup) return null;
    const q = tableSearch.trim().toLowerCase();
    if (!q) return rowsByGroup;
    const filtered: Record<string, SuivieRow[]> = {};
    for (const [key, rows] of Object.entries(rowsByGroup)) {
      const matched = rows.filter((row) => rowMatchesTableSearch(row, q));
      if (matched.length > 0) filtered[key] = matched;
    }
    return filtered;
  }, [rowsByGroup, tableSearch, rowMatchesTableSearch]);

  const filteredVehiclesList = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => {
      const haystack = [
        v.name,
        v.id,
        v.matricule ?? '',
        v.imei ?? '',
        v.driver,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [vehicles, vehicleSearch]);

  useEffect(() => {
    setApplied({
      action: draftAction,
      vehicleIds: new Set(draftVehicles),
      departments: new Set(),
      startDate: draftStartDate,
      endDate: draftEndDate,
      alertTypes: new Set(draftAlertTypes),
    });
  }, [
    draftAction,
    draftVehicles,
    draftStartDate,
    draftEndDate,
    draftAlertTypes,
  ]);

  const toggleVehicle = (id: string) => {
    if (draftAction === 'trajectoire') {
      // Trajectoire works on one vehicle at a time
      setDraftVehicles(new Set([id]));
      setIsVehicleDropdownOpen(false);
      return;
    }
    setDraftVehicles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** "Toutes les alertes" checks every type; unchecking any type unchecks it */
  const ALL_ALERTS = ALERT_TYPES[0];
  const toggleAlertType = (type: string) => {
    setDraftAlertTypes((prev) => {
      if (type === ALL_ALERTS) {
        return prev.has(ALL_ALERTS) ? new Set() : new Set([...ALERT_TYPES]);
      }
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      const everyType = ALERT_TYPES.slice(1).every((t) => next.has(t));
      if (everyType) next.add(ALL_ALERTS);
      else next.delete(ALL_ALERTS);
      return next;
    });
  };

  const getVehicleButtonText = () => {
    const vCount = draftVehicles.size;
    if (vCount === 0) return 'Sélectionner des véhicules';
    if (vCount === vehicles.length) return `Tous les véhicules (${vCount})`;
    if (vCount === 1) {
      const v = vehicles.find((x) => x.id === [...draftVehicles][0]);
      return v?.matricule || v?.name || '1 véhicule';
    }
    return `${vCount} véhicules`;
  };

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const formatDateTime = useCallback((date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}/${m}/${d} ${h}:${min}:${s}`;
  }, []);

  const focusSuivieAction = useCallback(
    (
      action: SuivieAction,
      vehicleId: string,
      extras?: {
        startDate?: string;
        endDate?: string;
        alertTypes?: Set<string>;
      }
    ) => {
      const vehicle = vehicleById[vehicleId];
      const startDate = extras?.startDate ?? draftStartDate;
      const endDate = extras?.endDate ?? draftEndDate;
      const alertTypes = extras?.alertTypes ?? new Set<string>();
      const vehicleIds = new Set([vehicleId]);
      setDraftVehicles(vehicleIds);
      setDraftAction(action);
      setDraftStartDate(startDate);
      setDraftEndDate(endDate);
      setDraftAlertTypes(alertTypes);
      setApplied({
        action,
        vehicleIds,
        departments: new Set(),
        startDate,
        endDate,
        alertTypes,
      });
      if (vehicle) onSelectVehicle(vehicle);
      setOpenMenu(null);
    },
    [
      vehicleById,
      draftStartDate,
      draftEndDate,
      onSelectVehicle,
    ]
  );

  /** Narrow panel: tab bar shows icons only (labels in tooltips) */
  const panelW = isDesktop ? width : typeof window !== 'undefined' ? window.innerWidth : 800;
  const compactTabs = panelW < 520;

  /**
   * Selection of the general views (Suivi général / Alertes), kept aside while
   * Trajectoire (one vehicle) or Stop & Circulation (none by default) is open
   */
  const multiSelectionRef = useRef<Set<string> | null>(null);
  const isScopedView = (a: SuivieAction) => a === 'trajectoire' || a === 'stop_circulation';

  /** Switch the panel view (tab bar) */
  const selectAction = (action: SuivieAction) => {
    let nextVehicles = draftVehicles;
    if (action !== draftAction) {
      if (!isScopedView(draftAction) && isScopedView(action)) {
        multiSelectionRef.current = new Set(draftVehicles);
      }
      if (action === 'stop_circulation') {
        // Stop & Circulation starts with no vehicle selected
        nextVehicles = new Set();
      } else if (action === 'trajectoire') {
        if (draftVehicles.size !== 1) {
          const preferred =
            (selectedVehicleId && vehicles.some((v) => v.id === selectedVehicleId) && selectedVehicleId) ||
            [...draftVehicles][0] ||
            vehicles[0]?.id;
          nextVehicles = preferred ? new Set([preferred]) : new Set();
        }
      } else if (isScopedView(draftAction) && multiSelectionRef.current) {
        nextVehicles = multiSelectionRef.current;
        multiSelectionRef.current = null;
      }
    }
    if (nextVehicles !== draftVehicles) setDraftVehicles(nextVehicles);
    setDraftAction(action);
    setApplied((prev) =>
      prev
        ? { ...prev, action, vehicleIds: new Set(nextVehicles) }
        : {
            action,
            vehicleIds: new Set(nextVehicles),
            departments: new Set(),
            startDate: draftStartDate,
            endDate: draftEndDate,
            alertTypes: new Set(draftAlertTypes),
          }
    );
    setIsColumnSettingsOpen(false);
  };

  const handleZoomRow = useCallback(
    (row: SuivieRow) => {
      const vehicle = vehicleById[row.vehicleId];
      if (!vehicle) return;
      onFocusVehicleOnMap?.(vehicle, 16);
      onSelectVehicle(vehicle);
    },
    [vehicleById, onFocusVehicleOnMap, onSelectVehicle]
  );

  const handleMenuAction = useCallback(
    (actionId: VehicleRowActionId, vehicleId: string) => {
      const vehicle = vehicleById[vehicleId];
      if (!vehicle) {
        setOpenMenu(null);
        return;
      }

      switch (actionId) {
        case 'showOnMap': {
          setOpenMenu(null);
          if (!hasAssignedEquipment(vehicle)) {
            setNoEquipmentOpen(true);
            return;
          }
          onSelectVehicle(vehicle);
          onFocusVehicleOnMap?.(vehicle, 16);
          onClearTrajectoryTrack?.();
          break;
        }
        case 'showTrajectory': {
          focusSuivieAction('trajectoire', vehicleId);
          onShowTrajectoryTrack?.(buildMockTrajectoryPath(vehicle));
          break;
        }
        case 'showStopRun': {
          focusSuivieAction('stop_circulation', vehicleId);
          onClearTrajectoryTrack?.();
          break;
        }
        case 'showDetailedReport': {
          setOpenMenu(null);
          onOpenDetailedReport?.(vehicleId);
          break;
        }
        case 'showSpeedExcess': {
          const now = new Date();
          const start = new Date(now);
          start.setHours(0, 0, 0, 0);
          focusSuivieAction('alertes', vehicleId, {
            startDate: formatDateTime(start),
            endDate: formatDateTime(now),
            alertTypes: new Set(['Dépassement de vitesse']),
          });
          onClearTrajectoryTrack?.();
          break;
        }
        case 'requestPosition': {
          const now = new Date();
          const id = `cmd-live-${vehicleId}-${now.getTime()}`;
          const pad = (n: number) => String(n).padStart(2, '0');
          const sendDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
          setSentCommands((prev) => [
            {
              id,
              vehicleId,
              vehicleName: vehicle.name,
              department: ((SUIVIE_DEPARTMENTS as readonly string[]).includes(vehicle.departmentId ?? '')
                ? vehicle.departmentId
                : SUIVIE_DEPARTMENTS[0]) as SuivieDepartment,
              filterDate: now.toISOString(),
              SendDate: sendDate,
              Vehicle: vehicle.matricule || vehicle.name,
              CommandType: 'Demande position',
              Status: 'En attente',
            } satisfies CommandRow,
            ...prev,
          ]);
          // The tracker answers a few seconds later
          window.setTimeout(() => {
            setSentCommands((prev) =>
              prev.map((c) =>
                c.id === id ? ({ ...(c as CommandRow), Status: vehicle.status === 'offline' ? 'Échouée' : 'Exécutée' } satisfies CommandRow) : c
              )
            );
          }, 3500);
          focusSuivieAction('commandes', vehicleId);
          setTrajToast(`Demande de position envoyée à ${vehicle.matricule || vehicle.name}`);
          break;
        }
        case 'remoteStop': {
          setOpenMenu(null);
          setAadVehicle(vehicle);
          break;
        }
        case 'alertSettings': {
          setOpenMenu(null);
          onOpenAlertConfiguration?.(vehicleId);
          break;
        }
        default:
          setOpenMenu(null);
      }
    },
    [
      vehicleById,
      onSelectVehicle,
      onFocusVehicleOnMap,
      onClearTrajectoryTrack,
      onShowTrajectoryTrack,
      onOpenDetailedReport,
      onOpenAlertConfiguration,
      focusSuivieAction,
      formatDateTime,
    ]
  );

  const handleAadConfirm = useCallback(
    (_mode: AadCommandMode) => {
      if (!aadVehicle) return;
      focusSuivieAction('commandes', aadVehicle.id);
      setCommandSentOpen('Commande AAD envoyée');
      setAadVehicle(null);
    },
    [aadVehicle, focusSuivieAction]
  );

  const openActionMenuAt = (
    e: React.MouseEvent,
    rowId: string,
    vehicleId: string
  ) => {
    e.stopPropagation();
    if (openMenu?.rowId === rowId) {
      setOpenMenu(null);
      return;
    }
    const { x, y } = clampMenuPosition(e.clientX, e.clientY);
    setOpenMenu({ rowId, vehicleId, x, y });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    if (Math.abs(delta.x) > 2 || Math.abs(delta.y) > 2) {
      suppressSortClickRef.current = true;
    }
    if (!over) return;
    if (over.id === GROUP_BY_DROP_ID) {
      setGroupByColumnId(String(active.id));
      setGroupBySortDir('asc');
      setCollapsedGroups(new Set());
      return;
    }
    if (active.id === over.id) return;
    reorder(String(active.id), String(over.id));
  };

  const colCount =
    tableColumns.length + (activeAction === 'suivie_generale' ? 1 : 0);

  const selectRowVehicle = (row: SuivieRow) => {
    const vehicle = vehicleById[row.vehicleId];
    if (vehicle) onSelectVehicle(vehicle);
  };

  const trajectoryOf = (vehicleId: string) => {
    const v = vehicleById[vehicleId];
    return v ? getVehicleTrajectory(v) : null;
  };

  /** Row click in the alert table: the alert icon at its position, with its details */
  const handleAlertRowClick = (row: SuivieRow) => {
    const vehicle = vehicleById[row.vehicleId];
    const lat = row['alertLat'];
    const lng = row['alertLng'];
    if (!vehicle || typeof lat !== 'number' || typeof lng !== 'number') return;
    const position: [number, number] = [lat, lng];
    if (selectedTrajRowId === row.id) {
      // second click on the same alert: hide it from the map
      setSelectedTrajRowId(null);
      onTrajectoryFocus?.(null);
      return;
    }
    setSelectedTrajRowId(row.id);
    onClearTrajectoryTrack?.();
    onTrajectoryFocus?.({
      vehicleId: vehicle.id,
      kind: 'Alert',
      position,
      time: new Date(String(row.filterDate)).getTime(),
      speed: parseInt(String(row['Speed']), 10) || 0,
      place: String(row['Address'] ?? ''),
      alert: {
        type: String(row['Type']),
        vehicle: vehicle.matricule || vehicle.name,
        date: String(row['Date']),
        speed: String(row['Speed']),
        mileage: String(row['Mileage']),
        driver: vehicle.driver || undefined,
      },
    });
  };

  /** Row click in the trajectory table: show the stop / segment on the map */
  const handleTrajRowClick = (row: SuivieRow) => {
    const vehicle = vehicleById[row.vehicleId];
    const traj = trajectoryOf(row.vehicleId);
    const seg = traj?.segments.find((g) => g.id === row.id);
    if (!vehicle || !traj || !seg) return;
    onSelectVehicle(vehicle);
    onShowTrajectoryTrack?.(traj.path);
    setSelectedTrajRowId(row.id);
    setSelectedSampleT(null);
    onTrajectoryFocus?.({
      vehicleId: vehicle.id,
      kind: seg.kind,
      position: seg.position,
      time: seg.kind === 'Stop' ? seg.start.getTime() : seg.end.getTime(),
      speed: seg.kind === 'Stop' ? 0 : seg.avgSpeed,
      place: seg.place,
      durationMin: seg.durationMin,
      path: seg.kind === 'Circulation' ? seg.path : undefined,
    });
  };

  /** Chart click: show that exact moment on the map */
  const handleTrajSamplePick = (vehicleId: string, sample: TrajSample) => {
    const vehicle = vehicleById[vehicleId];
    const traj = trajectoryOf(vehicleId);
    if (!vehicle || !traj) return;
    onSelectVehicle(vehicle);
    onShowTrajectoryTrack?.(traj.path);
    setSelectedTrajRowId(null);
    setSelectedSampleT(sample.t);
    onTrajectoryFocus?.({
      vehicleId,
      kind: sample.speed === 0 ? 'Stop' : 'Point',
      position: sample.point,
      time: sample.t,
      speed: sample.speed,
    });
  };

  const toggleTrajPlay = (vehicleId: string) => {
    const vehicle = vehicleById[vehicleId];
    const traj = trajectoryOf(vehicleId);
    if (!vehicle || !traj) return;
    if (replayVehicleId === vehicleId) {
      onStopReplay?.();
      return;
    }
    onSelectVehicle(vehicle);
    onTrajectoryFocus?.(null);
    setSelectedTrajRowId(null);
    onReplayTrajectory?.(vehicle, traj);
  };

  const saveTrajRoute = (vehicleId: string) => {
    const vehicle = vehicleById[vehicleId];
    const traj = trajectoryOf(vehicleId);
    if (!vehicle || !traj) return;
    if (savedTrajRoutes.has(vehicleId)) {
      setTrajToast('Ce trajet est déjà enregistré comme route.');
      return;
    }
    const day = traj.start.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    setRouteDraft({ vehicleId, name: `${traj.from} → ${traj.to} · ${vehicle.matricule || vehicle.name} · ${day}` });
  };

  const confirmSaveRoute = () => {
    if (!routeDraft) return;
    const name = routeDraft.name.trim();
    const vehicle = vehicleById[routeDraft.vehicleId];
    const traj = trajectoryOf(routeDraft.vehicleId);
    if (!name || !vehicle || !traj) return;
    onSaveTrajectoryRoute?.(vehicle, traj, name);
    setSavedTrajRoutes((prev) => new Set(prev).add(routeDraft.vehicleId));
    setTrajToast(`Route « ${name} » enregistrée · visible dans Géo › Routes`);
    setRouteDraft(null);
  };

  useEffect(() => {
    if (!trajToast) return;
    const t = window.setTimeout(() => setTrajToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [trajToast]);

  /** Trajectory table body: rows grouped by vehicle with header actions */
  /** Points framing a vehicle's whole trajectory (driving lines + stops) */
  const trajFramePoints = (traj: VehicleTrajectory) =>
    [...traj.path, ...traj.segments.filter((g) => g.kind === 'Stop').map((g) => g.position)] as [number, number][];

  /** 👁 — hiding a vehicle hides its whole trajectory, highlight and animation included */
  const toggleVehicleShown = (vehicleId: string) => {
    const hiding = !hiddenTrajVehicles.has(vehicleId);
    setHiddenTrajVehicles((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
    if (!hiding) return;
    if (soloVehicleId === vehicleId) setSoloVehicleId(null);
    const rowOfVehicle = selectedTrajRowId?.startsWith(`trj-${vehicleId}-`);
    if (rowOfVehicle || selectedVehicleId === vehicleId) {
      setSelectedTrajRowId(null);
      setSelectedSampleT(null);
      onTrajectoryFocus?.(null);
      onClearTrajectoryTrack?.();
    }
    if (replayVehicleId === vehicleId) onStopReplay?.();
  };

  /** Click on a vehicle: overall view of its stops & driving segments only */
  const focusVehicleOverall = (vehicleId: string, toggle = true) => {
    const vehicle = vehicleById[vehicleId];
    const traj = trajectoryOf(vehicleId);
    if (!vehicle || !traj) return;
    if (toggle && soloVehicleId === vehicleId) {
      // second click: back to every vehicle
      setSoloVehicleId(null);
      const all: [number, number][] = [];
      for (const id of trajVehicleOrder) {
        const t = trajectoryOf(id);
        if (t && !hiddenTrajVehicles.has(id)) all.push(...t.segments.map((g) => g.position));
      }
      if (all.length) onFitMapToPoints?.(all);
      return;
    }
    if (hiddenTrajVehicles.has(vehicleId)) {
      setHiddenTrajVehicles((prev) => {
        const next = new Set(prev);
        next.delete(vehicleId);
        return next;
      });
    }
    setSoloVehicleId(vehicleId);
    onFitMapToPoints?.(trajFramePoints(traj));
  };

  /** Stop & Circulation body: rows grouped by vehicle, one colour per vehicle */
  const renderStopRunGroups = (rows: SuivieRow[]) => {
    const order: string[] = [];
    const byVehicle: Record<string, SuivieRow[]> = {};
    for (const row of rows) {
      if (!byVehicle[row.vehicleId]) {
        byVehicle[row.vehicleId] = [];
        order.push(row.vehicleId);
      }
      byVehicle[row.vehicleId].push(row);
    }
    return order.map((vehicleId) => {
      const vehicle = vehicleById[vehicleId];
      if (!vehicle) return null;
      const traj = trajectoryOf(vehicleId);
      const key = `sr:${vehicleId}`;
      const collapsed = collapsedGroups.has(key);
      const groupRows = [...byVehicle[vehicleId]].sort((a, b) =>
        String(a.filterDate).localeCompare(String(b.filterDate))
      );
      return (
        <Fragment key={key}>
          <StopRunGroupHeader
            vehicle={vehicle}
            traj={traj}
            colCount={colCount}
            viewportWidth={tableViewportW}
            color={trajColorOf(vehicleId)}
            collapsed={collapsed}
            onToggleCollapse={() => toggleGroupCollapse(key)}
            shownOnMap={!hiddenTrajVehicles.has(vehicleId)}
            onToggleShown={() => toggleVehicleShown(vehicleId)}
            focused={soloVehicleId === vehicleId}
            dimmed={!!soloVehicleId && soloVehicleId !== vehicleId}
            onFocus={() => {
              setSelectedTrajRowId(null);
              onTrajectoryFocus?.(null);
              onClearTrajectoryTrack?.();
              focusVehicleOverall(vehicleId);
            }}
          />
          {!collapsed && groupRows.map((row) => renderDataRow(row))}
        </Fragment>
      );
    });
  };

  const renderTrajectoryGroups = (rows: SuivieRow[]) => {
    const order: string[] = [];
    const byVehicle: Record<string, SuivieRow[]> = {};
    for (const row of rows) {
      if (!byVehicle[row.vehicleId]) {
        byVehicle[row.vehicleId] = [];
        order.push(row.vehicleId);
      }
      byVehicle[row.vehicleId].push(row);
    }
    return order.map((vehicleId) => {
      const vehicle = vehicleById[vehicleId];
      if (!vehicle) return null;
      const traj = trajectoryOf(vehicleId);
      const key = `traj:${vehicleId}`;
      const collapsed = collapsedGroups.has(key);
      const mode = trajModes[vehicleId] ?? 'rows';
      const groupRows = [...byVehicle[vehicleId]].sort((a, b) =>
        String(a.filterDate).localeCompare(String(b.filterDate))
      );
      return (
        <Fragment key={key}>
          <TrajectoryGroupHeader
            vehicle={vehicle}
            traj={traj}
            colCount={colCount}
            viewportWidth={tableViewportW}
            collapsed={collapsed}
            onToggleCollapse={() => toggleGroupCollapse(key)}
            mode={mode}
            onModeChange={(m) => setTrajModes((prev) => ({ ...prev, [vehicleId]: m }))}
            detailsOpen={trajDetails.has(vehicleId)}
            onToggleDetails={() =>
              setTrajDetails((prev) => {
                const next = new Set(prev);
                if (next.has(vehicleId)) next.delete(vehicleId);
                else next.add(vehicleId);
                return next;
              })
            }
            playing={replayVehicleId === vehicleId}
            onTogglePlay={() => toggleTrajPlay(vehicleId)}
            saved={savedTrajRoutes.has(vehicleId)}
            onSaveRoute={() => saveTrajRoute(vehicleId)}
            color={trajColorOf(vehicleId)}
            shownOnMap={!hiddenTrajVehicles.has(vehicleId)}
            onToggleShown={() => toggleVehicleShown(vehicleId)}
          />
          {!collapsed && traj && trajDetails.has(vehicleId) && (
            <TrajectoryDetailsRow vehicle={vehicle} traj={traj} colCount={colCount} viewportWidth={tableViewportW} />
          )}
          {!collapsed &&
            (mode === 'graph' && traj ? (
              <TrajectoryGraphRow
                vehicle={vehicle}
                traj={traj}
                colCount={colCount}
                viewportWidth={tableViewportW}
                activeT={selectedSampleT}
                onPick={(sample) => handleTrajSamplePick(vehicleId, sample)}
              />
            ) : (
              groupRows.map((row) => renderDataRow(row))
            ))}
        </Fragment>
      );
    });
  };

  const renderDataRow = (row: SuivieRow) => {
    const isGenerale = activeAction === 'suivie_generale';
    const isTraj =
      activeAction === 'trajectoire' || activeAction === 'stop_circulation' || activeAction === 'alertes';
    const commonClasses = `transition-colors border-b border-slate-100 ${
      isTraj
        ? selectedTrajRowId === row.id
          ? 'bg-[#EAF1FF] shadow-[inset_3px_0_0_#2F6BFF] cursor-pointer'
          : 'bg-white hover:bg-slate-50 cursor-pointer'
        : selectedVehicleId === row.vehicleId
          ? 'bg-blue-50'
          : 'bg-white hover:bg-slate-50'
    }${isGenerale ? ' cursor-pointer' : ''}`;

    const dashOn =
      activeAction === 'trajectoire'
        ? getTrajectoryDashIndicators(row.id, String(row['StopRun']) === 'Circulation')
        : null;
    const dashExpanded = expandedDashRows.has(row.id);
    const litShown = dashOn ? shownDash.filter((d) => dashOn.has(d.id)) : [];

    return (
      <Fragment key={row.id}>
      <tr
        data-vehicle-row=""
        className={commonClasses}
        onClick={() => {
          if (activeAction === 'stop_circulation') {
            if (soloVehicleId !== row.vehicleId) setSoloVehicleId(row.vehicleId);
            handleTrajRowClick(row);
          } else if (activeAction === 'trajectoire') handleTrajRowClick(row);
          else if (activeAction === 'alertes') handleAlertRowClick(row);
          else selectRowVehicle(row);
        }}
      >
        {tableColumns.map((col) => {
          const raw = row[col.id];
          const value =
            raw === undefined || raw === null ? '—' : String(raw);
          if (col.id === 'DashboardIcons') {
            return (
              <td key={col.id} className="px-2 py-1.5 whitespace-nowrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDashRow(row.id);
                  }}
                  aria-expanded={dashExpanded}
                  title={dashExpanded ? 'Masquer le tableau de bord' : 'Afficher tout le tableau de bord'}
                  className={`flex items-center gap-1 h-7 pl-1 pr-1.5 rounded-lg border transition-colors ${
                    dashExpanded ? 'border-[#BFD3FF] bg-[#EAF1FF]' : 'border-transparent hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  {litShown.length === 0 ? (
                    <span className="text-[11px] text-slate-400 px-1">Aucun</span>
                  ) : (
                    litShown.slice(0, 5).map((d) => <DashIcon key={d.id} indicator={d} active size={18} />)
                  )}
                  {litShown.length > 5 && (
                    <span className="text-[10.5px] font-bold text-slate-500">+{litShown.length - 5}</span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform ${dashExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              </td>
            );
          }
          return (
            <td key={col.id} className={cellClassFor(col.id, value)}>
              {renderCellContent(col.id, value, row, handleZoomRow)}
            </td>
          );
        })}
        {isGenerale && (
          <td className="px-3 py-2">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                openActionMenuAt(e, row.id, row.vehicleId);
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Actions véhicule"
            >
              <MoreVertical className="w-4 h-4 text-slate-600" />
            </button>
          </td>
        )}
      </tr>
      {dashOn && dashExpanded && (
        <tr className="bg-[#FAFBFE] border-b border-slate-100">
          <td colSpan={colCount} className="px-3 py-2.5">
            {shownDash.length === 0 ? (
              <p className="text-[11.5px] text-slate-400">
                Tous les indicateurs sont masqués (fiche véhicule → ⚙ Personnaliser).
              </p>
            ) : (
              <div className="flex flex-wrap gap-x-1.5 gap-y-1" aria-label="Tableau de bord">
                {shownDash.map((d) => {
                  const on = dashOn.has(d.id);
                  return (
                    <span
                      key={d.id}
                      title={`${d.label} — ${on ? 'Actif' : 'Inactif'}`}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white"
                    >
                      <DashIcon indicator={d} active={on} size={22} />
                    </span>
                  );
                })}
              </div>
            )}
          </td>
        </tr>
      )}
      </Fragment>
    );
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: isCollapsed ? '0px' : isDesktop ? `${width}px` : '100%',
      }}
      className="h-full flex flex-col bg-white/95 backdrop-blur-md border-r border-slate-200/50 flex-shrink-0 relative transition-all duration-300 shadow-2xl min-w-0 w-full max-w-full"
    >
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          data-tour="panel-toggle"
          aria-label={isCollapsed ? 'Afficher le tableau' : 'Masquer le tableau'}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 w-6 h-12 bg-white/95 backdrop-blur-sm hover:bg-white border border-slate-200 rounded-r-lg flex items-center justify-center transition-colors shadow-lg"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          )}
        </button>
      )}

      {!isCollapsed && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={groupByCollisionDetection}
            onDragEnd={handleDragEnd}
          >
            <div className="fiq-font shrink-0 border-b border-[#E3E9F4] bg-white overflow-visible relative z-20">
              {/* Navigation entre les vues — onglets pleine largeur, soulignés */}
              <nav aria-label="Vues du suivi" data-tour="tabs" className="fiq-font flex border-b border-[#E3E9F4] px-1">
                {TAB_ACTIONS.map((tab) => {
                  const active = activeAction === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => selectAction(tab.id)}
                      data-tour={`tab-${tab.id}`}
                      aria-current={active ? 'page' : undefined}
                      aria-label={tab.label}
                      title={compactTabs ? tab.label : undefined}
                      className={`relative flex-1 min-w-0 h-11 inline-flex items-center justify-center gap-2 px-2 text-[13px] whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2F6BFF] ${
                        active ? 'text-[#0F1B3D] font-extrabold' : 'text-[#5B6B8C] font-semibold hover:text-[#0F1B3D] hover:bg-[#F7F9FF]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#2F6BFF]' : ''}`} />
                      {!compactTabs && <span className="truncate">{tab.label}</span>}
                      <span
                        aria-hidden
                        className={`absolute left-3 right-3 -bottom-px h-[3px] rounded-t-full transition-colors ${active ? 'bg-[#2F6BFF]' : 'bg-transparent'}`}
                      />
                    </button>
                  );
                })}
                {activeAction === 'commandes' && (
                  <span className="relative flex-1 min-w-0 h-11 inline-flex items-center justify-center gap-2 px-2 text-[13px] font-extrabold text-[#0F1B3D] whitespace-nowrap">
                    <Send className="w-4 h-4 text-[#2F6BFF] shrink-0" />
                    {!compactTabs && <span className="truncate">Commandes</span>}
                    <button
                      type="button"
                      onClick={() => selectAction('suivie_generale')}
                      aria-label="Fermer les commandes"
                      title="Fermer les commandes"
                      className="w-6 h-6 rounded-md text-[#5B6B8C] hover:bg-[#F0F3F9] hover:text-[#0F1B3D] inline-flex items-center justify-center shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span aria-hidden className="absolute left-3 right-3 -bottom-px h-[3px] rounded-t-full bg-[#2F6BFF]" />
                  </span>
                )}
              </nav>
              <div className="px-3 py-2 flex flex-col gap-1.5 overflow-visible">
                {/* Une seule ligne — filtres, recherche, regroupement, exports */}
                <div className="w-full flex flex-wrap items-center gap-1.5">
                  <div
                    data-tour="filter-vehicles"
                    className="order-2 relative flex-[1_1_170px] min-w-[140px] max-w-[260px]"
                    ref={vehicleDropdownRef}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setIsVehicleDropdownOpen(!isVehicleDropdownOpen)
                      }
                      title="Filtrer les véhicules"
                      aria-label="Filtrer les véhicules"
                      className={`w-full h-9 flex items-center justify-between gap-2 rounded-xl px-3 text-[13px] transition-colors border ${
                        isVehicleDropdownOpen
                          ? 'border-[#2F6BFF] bg-white ring-4 ring-[#2F6BFF]/10'
                          : 'border-[#DCE3EF] bg-white hover:border-[#BFD3FF] hover:bg-[#F7F9FF]'
                      }`}
                    >
                      <Car className="w-4 h-4 text-[#2F6BFF] shrink-0" />
                      <span
                        className={`truncate flex-1 text-left ${
                          draftVehicles.size > 0
                            ? 'text-[#0F1B3D] font-semibold'
                            : 'text-[#8A94A6]'
                        }`}
                      >
                        {getVehicleButtonText()}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                          isVehicleDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isVehicleDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[400px] w-full min-w-[240px] max-w-[min(360px,calc(100vw-2rem))]"
                        >
                          <div className="p-2 border-b border-slate-100">
                            <DropdownSearch
                              value={vehicleSearch}
                              onChange={setVehicleSearch}
                              placeholder="Matricule, IMEI, nom…"
                            />
                            {draftAction === 'trajectoire' && (
                              <p className="mt-1.5 px-1 text-[11px] font-semibold text-[#2F6BFF]">
                                Trajectoire : choisissez un seul véhicule
                              </p>
                            )}
                            <p className="mt-1 px-1 text-[10px] text-slate-500">
                              {draftVehicles.size} sélectionné
                              {draftVehicles.size === 1 ? '' : 's'}
                              {vehicleSearch.trim()
                                ? ` · ${filteredVehiclesList.length} résultat${filteredVehiclesList.length === 1 ? '' : 's'}`
                                : ''}
                            </p>
                          </div>
                          <div className="overflow-y-auto flex-1 p-1">
                            {draftAction !== 'trajectoire' && !vehicleSearch.trim() && vehicles.length > 0 && (
                              <label className="flex items-center gap-2 px-2 py-1.5 mb-0.5 border-b border-[#EEF1F7] hover:bg-slate-50 rounded-lg cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={draftVehicles.size === vehicles.length}
                                  onChange={() =>
                                    setDraftVehicles(
                                      draftVehicles.size === vehicles.length
                                        ? new Set()
                                        : new Set(vehicles.map((v) => v.id))
                                    )
                                  }
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span className="text-xs font-semibold text-[#0F1B3D]">
                                  Tous les véhicules ({vehicles.length})
                                </span>
                              </label>
                            )}
                            {filteredVehiclesList.length === 0 ? (
                              <p className="px-3 py-6 text-center text-xs text-slate-500">
                                Aucun véhicule trouvé
                              </p>
                            ) : (
                              filteredVehiclesList.map((vehicle) => (
                                <label
                                  key={vehicle.id}
                                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                                >
                                  <div
                                    className={`w-3.5 h-3.5 ${draftAction === 'trajectoire' ? 'rounded-full' : 'rounded'} border flex items-center justify-center transition-colors shrink-0 ${
                                      draftVehicles.has(vehicle.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-slate-300 bg-white group-hover:border-blue-400'
                                    }`}
                                  >
                                    {draftVehicles.has(vehicle.id) &&
                                      (draftAction === 'trajectoire' ? (
                                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                      ) : (
                                        <Check className="w-2.5 h-2.5 text-white" />
                                      ))}
                                  </div>
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={draftVehicles.has(vehicle.id)}
                                    onChange={() => toggleVehicle(vehicle.id)}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-semibold text-slate-800 truncate">
                                      {vehicle.matricule || vehicle.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate font-mono">
                                      IMEI {vehicle.imei || '—'}
                                    </div>
                                    {vehicle.matricule && (
                                      <div className="text-[10px] text-slate-400 truncate">
                                        {vehicle.name}
                                      </div>
                                    )}
                                  </div>
                                </label>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {draftAction !== 'suivie_generale' && (
                    <div data-tour="filter-period" className="order-5 shrink-0 flex">
                    <DateTimeRangePicker
                      iconOnly
                      className="shrink-0"
                      start={draftStartDate}
                      end={draftEndDate}
                      onChange={(s, e) => {
                        setDraftStartDate(s);
                        setDraftEndDate(e);
                      }}
                      placeholder="Période"
                    />
                    </div>
                  )}

                  {draftAction === 'alertes' && (
                    <div
                      data-tour="filter-alert-types"
                      className="order-4 relative shrink-0"
                      ref={alertDropdownRef}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setIsAlertDropdownOpen(!isAlertDropdownOpen)
                        }
                        title="Types d'alerte"
                        aria-label="Types d'alerte"
                        className="h-9 flex items-center gap-2 bg-white border border-[#DCE3EF] hover:border-[#BFD3FF] hover:bg-[#F7F9FF] rounded-xl px-3 text-[13px] transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-slate-700 font-medium whitespace-nowrap">Types</span>
                        {draftAlertTypes.size > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#2F6BFF] text-white text-[10.5px] font-bold inline-flex items-center justify-center">
                            {draftAlertTypes.has(ALL_ALERTS) ? 'Tous' : draftAlertTypes.size}
                          </span>
                        )}
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                            isAlertDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isAlertDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="fiq-font absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-[#E3E9F4] z-50 overflow-hidden w-[260px] max-h-[340px] flex flex-col"
                          >
                            <div className="p-2 border-b border-[#EEF1F7] flex flex-col gap-1.5">
                              <DropdownSearch
                                value={alertTypeSearch}
                                onChange={setAlertTypeSearch}
                                placeholder="Rechercher un type d'alerte…"
                              />
                            </div>
                            <div className="overflow-y-auto p-1">
                              {!alertTypeSearch.trim() && (
                                <label className="flex items-center gap-1.5 px-1.5 py-1.5 mb-0.5 border-b border-[#EEF1F7] hover:bg-slate-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={draftAlertTypes.has(ALL_ALERTS)}
                                    onChange={() => toggleAlertType(ALL_ALERTS)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                                  />
                                  <span className="text-[11px] font-semibold text-[#0F1B3D]">{ALL_ALERTS}</span>
                                </label>
                              )}
                              {ALERT_TYPES.slice(1).filter((t) => matchesQuery(t, alertTypeSearch)).length === 0 && (
                                <p className="px-2 py-4 text-center text-[12px] text-[#8A94A6]">Aucun type trouvé</p>
                              )}
                              {ALERT_TYPES.slice(1).filter((t) => matchesQuery(t, alertTypeSearch)).map((type) => (
                                <label
                                  key={type}
                                  className="flex items-center gap-1.5 px-1.5 py-1 hover:bg-slate-50 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={draftAlertTypes.has(type)}
                                    onChange={() => toggleAlertType(type)}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                                  />
                                  <span className="text-[11px] text-slate-700">
                                    {type}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div data-tour="filter-search" className="order-3 relative flex-[1_1_140px] min-w-[100px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A94A6] pointer-events-none" />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder="Rechercher dans le tableau…"
                      className="w-full h-9 pl-9 pr-3 text-[13px] text-[#0F1B3D] bg-[#F7F9FF] border border-[#E3E9F4] rounded-xl placeholder:text-[#8A94A6] focus:outline-none focus:bg-white focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10 transition-colors"
                    />
                  </div>

                  <GroupByDropZone
                    groupByColumnId={groupByColumnId}
                    groupByLabel={groupByLabel}
                    groupBySortDir={groupBySortDir}
                    onToggleSortDir={toggleGroupBySortDir}
                    onClear={clearGroupBy}
                  />

                  <div data-tour="filter-columns" className="order-6 flex items-center gap-1.5 shrink-0">
                    <div className="relative shrink-0" ref={columnSettingsRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setIsColumnSettingsOpen(!isColumnSettingsOpen)
                        }
                        title="Colonnes affichées"
                        aria-label="Colonnes affichées"
                        className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-colors ${
                          isColumnSettingsOpen
                            ? 'border-[#2F6BFF] bg-[#EAF1FF] text-[#2F6BFF]'
                            : 'border-[#DCE3EF] bg-white text-[#2F6BFF] hover:border-[#BFD3FF] hover:bg-[#F7F9FF]'
                        }`}
                      >
                        <Columns3 className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {isColumnSettingsOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="fiq-font absolute top-full mt-2 right-0 w-72 max-h-[380px] bg-white rounded-xl shadow-xl border border-[#E3E9F4] z-[100] flex flex-col overflow-hidden"
                          >
                            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-800">
                                Colonnes affichées
                              </span>
                              <button
                                type="button"
                                onClick={resetToDefault}
                                className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-medium"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Réinitialiser
                              </button>
                            </div>
                            <div className="px-2 pt-2 pb-1.5 border-b border-[#EEF1F7]">
                              <DropdownSearch
                                value={columnSearch}
                                onChange={setColumnSearch}
                                placeholder="Rechercher une colonne…"
                              />
                            </div>
                            <div className="overflow-y-auto p-1.5 flex-1">
                              {allColumns.filter((c) => matchesQuery(c.label, columnSearch)).length === 0 && (
                                <p className="px-2 py-4 text-center text-[12px] text-[#8A94A6]">Aucune colonne trouvée</p>
                              )}
                              {allColumns.filter((c) => matchesQuery(c.label, columnSearch)).map((col) => {
                                const checked = !!prefs.visible[col.id];
                                const visibleCount = Object.values(
                                  prefs.visible
                                ).filter(Boolean).length;
                                const disableOff = checked && visibleCount <= 1;
                                return (
                                  <label
                                    key={col.id}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 ${
                                      disableOff ? 'opacity-60' : ''
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      disabled={disableOff}
                                      onChange={() => toggleVisible(col.id)}
                                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                    />
                                    <span className="text-xs text-slate-700">
                                      {col.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div
              ref={tableScrollRef}
              data-tour="table"
              className="flex-1 overflow-x-auto overflow-y-auto bg-white min-w-0"
              onScroll={() => {
                if (openMenu) setOpenMenu(null);
              }}
            >

                <table className="w-full text-left border-collapse">
                  <thead className="bg-blue-600 sticky top-0 z-10">
                    <tr>
                      <SortableContext
                        items={tableColumns.map((c) => c.id)}
                        strategy={horizontalListSortingStrategy}
                      >
                        {tableColumns.map((col) => (
                          <SortableHeader
                            key={col.id}
                            id={col.id}
                            label={col.label}
                            sortDir={
                              sort?.columnId === col.id ? sort.dir : null
                            }
                            onSortClick={toggleSort}
                          />
                        ))}
                      </SortableContext>
                      {activeAction === 'suivie_generale' && (
                        <th className="px-3 py-2.5 text-xs font-bold text-white uppercase tracking-wider border-b border-blue-700 whitespace-nowrap">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayTableRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={Math.max(colCount, 1)}
                          className="px-4 py-12 text-center text-sm text-slate-500"
                        >
                          {activeAction === 'stop_circulation' &&
                          applied &&
                          applied.vehicleIds.size === 0 &&
                          applied.departments.size === 0
                            ? 'Sélectionnez un ou plusieurs véhicules pour afficher leurs arrêts et circulations.'
                            : tableSearch.trim()
                            ? 'Aucun résultat pour cette recherche dans le tableau.'
                            : 'Aucun résultat pour ces filtres.'}
                        </td>
                      </tr>
                    ) : activeAction === 'trajectoire' && !groupByColumnId ? (
                      renderTrajectoryGroups(pageRows)
                    ) : activeAction === 'stop_circulation' && !groupByColumnId ? (
                      renderStopRunGroups(pageRows)
                    ) : groupByColumnId && displayRowsByGroup ? (
                      Object.entries(displayRowsByGroup).map(
                        ([groupKey, rows]) => {
                          const isCollapsed = collapsedGroups.has(groupKey);
                          return (
                            <Fragment key={groupKey}>
                              <tr className="bg-blue-100">
                                <td
                                  colSpan={colCount}
                                  className="px-3 py-2"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleGroupCollapse(groupKey)
                                    }
                                    className="w-full flex items-center justify-between hover:bg-blue-150 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {isCollapsed ? (
                                        <ChevronRight className="w-4 h-4 text-blue-700 shrink-0" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-blue-700 shrink-0" />
                                      )}
                                      <span className="text-sm font-semibold text-blue-700 truncate">
                                        {groupByLabel}: {groupKey} (
                                        {rows.length})
                                      </span>
                                    </div>
                                  </button>
                                </td>
                              </tr>
                              {!isCollapsed &&
                                rows.map((row) => renderDataRow(row))}
                            </Fragment>
                          );
                        }
                      )
                    ) : (
                      pageRows.map((row) => renderDataRow(row))
                    )}
                  </tbody>
                  {stopCirculationDistanceTotalKm != null && (
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-200">
                        <td
                          colSpan={colCount}
                          className="px-3 py-2 text-xs font-semibold text-slate-700"
                        >
                          Total distances :{' '}
                          {stopCirculationDistanceTotalKm.toFixed(1)} km
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <TableFooter
                page={currentPage}
                pageSize={pageSize}
                total={displayTableRows.length}
                paginated={paginated}
                onPage={(p) => {
                  setPage(Math.max(1, Math.min(pageCount, p)));
                  const el = document.querySelector('[data-left-panel] .overflow-y-auto');
                  if (el) el.scrollTop = 0;
                }}
                onPageSize={setPageSize}
              />
            </DndContext>
            {trajToast && (
              <div
                role="status"
                className="fiq-font absolute left-1/2 -translate-x-1/2 bottom-4 z-20 px-3.5 py-2 rounded-xl bg-[#0F1B3D] text-white text-[12.5px] font-semibold shadow-lg"
              >
                {trajToast}
              </div>
            )}

          {typeof document !== 'undefined' &&
            createPortal(
              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    key={openMenu.rowId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    role="menu"
                    aria-label="Actions du véhicule"
                    className="action-menu fiq-font fixed w-72 bg-white rounded-2xl shadow-[0_18px_40px_rgba(15,27,61,0.18)] border border-[#E3E9F4] p-1.5 z-[9999] overflow-hidden"
                    style={{ left: openMenu.x, top: openMenu.y }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(openMenu
                      ? getVehicleRowActions(
                          vehicleById[openMenu.vehicleId] ?? {
                            id: openMenu.vehicleId,
                            name: '',
                            status: 'offline',
                            speed: 0,
                            location: '',
                            coordinates: [0, 0],
                            lastUpdate: '',
                            driver: '',
                            batteryLevel: 0,
                          },
                          isAdmin
                        )
                      : []
                    ).map((item) => {
                      const Icon = item.icon;
                      const disabled = Boolean(item.unavailableReason);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="menuitem"
                          disabled={disabled}
                          title={item.unavailableReason ?? undefined}
                          onClick={() =>
                            handleMenuAction(item.id, openMenu!.vehicleId)
                          }
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left group ${
                            disabled ? 'cursor-not-allowed' : 'hover:bg-[#F0F5FF]'
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              disabled
                                ? 'bg-[#F0F3F9] text-[#B8C3DA]'
                                : 'bg-[#F0F3F9] text-[#0F1B3D] group-hover:bg-[#2F6BFF] group-hover:text-white'
                            }`}
                          >
                            <Icon className="w-[18px] h-[18px]" />
                          </span>
                          <span className="flex flex-col min-w-0">
                            <span
                              className={`text-[13.5px] font-semibold ${
                                disabled ? 'text-[#8A94A6]' : 'text-[#0F1B3D]'
                              }`}
                            >
                              {item.label}
                            </span>
                            {disabled && (
                              <span className="text-[11.5px] text-[#8A94A6]">
                                {item.unavailableReason}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}

          <div
            onMouseDown={() => setIsResizing(true)}
            className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors group"
          >
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-12 bg-slate-300 group-hover:bg-blue-500 transition-colors rounded-l" />
          </div>
        </>
      )}

      <Dialog open={!!routeDraft} onOpenChange={(open) => !open && setRouteDraft(null)}>
        <DialogContent className="fiq-font max-w-[460px] rounded-[24px] border border-[#E3E9F4] shadow-[0_24px_60px_rgba(15,27,61,0.22)] [&>button:last-child]:text-[#5B6B8C] [&>button:last-child]:top-5 [&>button:last-child]:right-5 [&>button:last-child]:hover:bg-[#F0F3F9]">
          {(() => {
            const t = routeDraft ? trajectoryOf(routeDraft.vehicleId) : null;
            const v = routeDraft ? vehicleById[routeDraft.vehicleId] : null;
            const name = routeDraft?.name ?? '';
            const empty = !name.trim();
            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  confirmSaveRoute();
                }}
              >
                {/* Header */}
                <DialogHeader className="bg-white text-[#0F1B3D] px-6 pt-6 pb-0 pr-14 flex-row items-start gap-3.5 space-y-0 text-left">
                  <span className="w-11 h-11 rounded-[14px] bg-[#EAF1FF] text-[#2F6BFF] flex items-center justify-center shrink-0">
                    <BookmarkPlus className="w-5 h-5" />
                  </span>
                  <span className="flex flex-col gap-1 min-w-0">
                    <DialogTitle className="text-[18px] font-extrabold leading-tight text-[#0F1B3D]">
                      Enregistrer comme route
                    </DialogTitle>
                    <DialogDescription className="text-[13px] leading-snug text-[#5B6B8C]">
                      Le trajet parcouru sera ajouté à vos routes et assigné à ce véhicule.
                    </DialogDescription>
                  </span>
                </DialogHeader>

                <div className="px-6 pt-5 pb-6 flex flex-col gap-4">
                  {/* Trip summary */}
                  {t && v && (
                    <div className="rounded-2xl bg-[#F7F9FF] border border-[#E3E9F4] px-4 py-3">
                      <p className="flex items-center gap-2 text-[13.5px] font-bold text-[#0F1B3D]">
                        <RouteIcon className="w-4 h-4 text-[#2F6BFF] shrink-0" />
                        <span className="truncate">
                          {t.from} → {t.to}
                        </span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-[#5B6B8C]">
                        <span className="inline-flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5" />
                          <b className="font-bold text-[#0F1B3D]">{v.matricule || v.name}</b>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5" />
                          <b className="font-bold text-[#0F1B3D]">{t.summary.distanceKm.toFixed(1).replace('.', ',')} km</b>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <b className="font-bold text-[#0F1B3D]">{Math.round(t.summary.runMin)} min</b> de conduite
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Title field */}
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] font-bold text-[#0F1B3D]">Titre de la route</span>
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setRouteDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                      onFocus={(e) => {
                        const el = e.currentTarget;
                        const end = el.value.length;
                        el.setSelectionRange(end, end);
                      }}
                      maxLength={80}
                      placeholder="Ex. Tournée Bizerte du matin"
                      aria-invalid={empty}
                      className={`h-11 px-3.5 rounded-xl bg-white border text-[14px] font-semibold text-[#0F1B3D] placeholder:text-[#B8C3DA] placeholder:font-medium outline-none transition-shadow selection:bg-[#DCE8FF] ${
                        empty
                          ? 'border-[#F0A9AC] focus:ring-4 focus:ring-[#E5484D]/10'
                          : 'border-[#DCE3EF] focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10'
                      }`}
                    />
                    <span className="flex justify-between text-[11.5px]">
                      <span className={empty ? 'text-[#E5484D] font-semibold' : 'text-[#8A94A6]'}>
                        {empty ? 'Le titre est obligatoire.' : 'Visible dans Géo › Routes et sur la carte.'}
                      </span>
                      <span className="text-[#8A94A6] tabular-nums">{name.length}/80</span>
                    </span>
                  </label>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-6 py-4 bg-[#F7F9FF] border-t border-[#E3E9F4]">
                  <button
                    type="button"
                    onClick={() => setRouteDraft(null)}
                    className="h-10 px-4 rounded-xl text-[13.5px] font-bold text-[#5B6B8C] hover:bg-white hover:text-[#0F1B3D] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={empty}
                    className="h-10 px-4 rounded-xl bg-[#2F6BFF] text-white text-[13.5px] font-bold inline-flex items-center gap-2 shadow-[0_6px_14px_rgba(47,107,255,0.28)] hover:bg-[#2459E0] disabled:opacity-40 disabled:shadow-none transition-colors"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    Enregistrer
                  </button>
                </div>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={noEquipmentOpen} onOpenChange={setNoEquipmentOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Équipement manquant</DialogTitle>
            <DialogDescription>
              Aucun équipement n&apos;est assigné à ce véhicule.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-slate-600">
              Impossible de centrer la carte sans boîtier GPS assigné.
            </p>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => setNoEquipmentOpen(false)}
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={commandSentOpen != null}
        onOpenChange={(open) => {
          if (!open) setCommandSentOpen(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Commande</DialogTitle>
            <DialogDescription>
              {commandSentOpen ?? 'Commande envoyée'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={() => setCommandSentOpen(null)}
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RemoteStopDialog
        open={aadVehicle != null}
        vehicle={aadVehicle}
        onOpenChange={(open) => {
          if (!open) setAadVehicle(null);
        }}
        onConfirm={handleAadConfirm}
      />
    </div>
  );
}
