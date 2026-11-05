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
  Settings,
  Download,
  ChevronDown,
  Clock,
  Car,
  Layers,
  AlertTriangle,
  Check,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
} from 'lucide-react';
import { Vehicle, type VehicleStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DateTimePicker } from './DateTimePicker';
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
  getVisibleVehicleRowActions,
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
  ACTIONS,
  type SuivieAction,
} from '@/features/suivie/column-defs';
import {
  ALERT_TYPES,
  applySuivieFilters,
  buildRowsForAction,
  getFilteredVehicleIds,
  type AppliedSuivieFilters,
  type SuivieRow,
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
      className={`h-8 min-w-[140px] flex-1 max-w-[280px] flex items-center gap-1.5 rounded-lg border border-dashed px-2 transition-colors ${
        isOver
          ? 'border-blue-500 bg-blue-50'
          : groupByColumnId
            ? 'border-blue-300 bg-blue-50/70'
            : 'border-slate-200 bg-slate-50'
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
        <p className="text-[11px] text-slate-400 truncate w-full text-center">
          Glisser une colonne ici
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

function FilterBulkActions({
  onSelectAll,
  onClear,
}: {
  onSelectAll: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onSelectAll}
        className="px-2 py-1 rounded-md text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors"
      >
        Tout sélectionner
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 hover:border-slate-400 transition-colors"
      >
        Tout désélectionner
      </button>
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
  menuWidth = 256,
  menuHeight = 320
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
  const [draftVehicles, setDraftVehicles] = useState<Set<string>>(new Set());
  const [draftAlertTypes, setDraftAlertTypes] = useState<Set<string>>(
    new Set()
  );

  // Applied filter state
  const [applied, setApplied] = useState<AppliedSuivieFilters | null>(null);

  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
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
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(e.target as Node)
      ) {
        setIsActionDropdownOpen(false);
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
    const all = buildRowsForAction(applied.action, vehicles);
    return applySuivieFilters(all, applied);
  }, [applied, vehicles]);

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
    setDraftVehicles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAlertType = (type: string) => {
    setDraftAlertTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const getVehicleButtonText = () => {
    const vCount = draftVehicles.size;
    if (vCount === 0) return 'Sélectionner des véhicules';
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
          focusSuivieAction('commandes', vehicleId);
          setCommandSentOpen('Demande de position actuelle envoyée');
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

  const renderDataRow = (row: SuivieRow) => {
    const isGenerale = activeAction === 'suivie_generale';
    const commonClasses = `transition-colors border-b border-slate-100 ${
      selectedVehicleId === row.vehicleId
        ? 'bg-blue-50'
        : 'bg-white hover:bg-slate-50'
    }${isGenerale ? ' cursor-pointer' : ''}`;

    return (
      <tr
        key={row.id}
        data-vehicle-row=""
        className={commonClasses}
        onClick={() => {
          selectRowVehicle(row);
        }}
      >
        {tableColumns.map((col) => {
          const raw = row[col.id];
          const value =
            raw === undefined || raw === null ? '—' : String(raw);
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
            <div className="shrink-0 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50 overflow-visible relative z-20">
              <div className="px-3 py-2 flex flex-col gap-1.5 overflow-visible">
                {/* Ligne 1 — filtres */}
                <div className="w-full flex flex-wrap items-center gap-1.5">
                  <div
                    className="relative flex-1 min-w-[120px]"
                    ref={vehicleDropdownRef}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setIsVehicleDropdownOpen(!isVehicleDropdownOpen)
                      }
                      title="Filtrer les véhicules"
                      aria-label="Filtrer les véhicules"
                      className="w-full h-8 flex items-center justify-between gap-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg px-2.5 text-xs transition-all shadow-sm"
                    >
                      <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span
                        className={`truncate flex-1 text-left ${
                          draftVehicles.size > 0
                            ? 'text-slate-900 font-medium'
                            : 'text-slate-500'
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
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Matricule, IMEI, nom…"
                                value={vehicleSearch}
                                onChange={(e) =>
                                  setVehicleSearch(e.target.value)
                                }
                                className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1.5 px-1">
                              <FilterBulkActions
                                onSelectAll={() =>
                                  setDraftVehicles(
                                    new Set(
                                      filteredVehiclesList.map((v) => v.id)
                                    )
                                  )
                                }
                                onClear={() => setDraftVehicles(new Set())}
                              />
                            </div>
                            <p className="mt-1 px-1 text-[10px] text-slate-500">
                              {draftVehicles.size} sélectionné
                              {draftVehicles.size === 1 ? '' : 's'}
                              {vehicleSearch.trim()
                                ? ` · ${filteredVehiclesList.length} résultat${filteredVehiclesList.length === 1 ? '' : 's'}`
                                : ''}
                            </p>
                          </div>
                          <div className="overflow-y-auto flex-1 p-1">
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
                                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                      draftVehicles.has(vehicle.id)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-slate-300 bg-white group-hover:border-blue-400'
                                    }`}
                                  >
                                    {draftVehicles.has(vehicle.id) && (
                                      <Check className="w-2.5 h-2.5 text-white" />
                                    )}
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
                    <>
                      <div
                        className="w-[130px] min-w-[110px] shrink-0"
                        title="Date début"
                      >
                        <DateTimePicker
                          value={draftStartDate}
                          onChange={setDraftStartDate}
                          placeholder="Début"
                        />
                      </div>
                      <div
                        className="w-[130px] min-w-[110px] shrink-0"
                        title="Date fin"
                      >
                        <DateTimePicker
                          value={draftEndDate}
                          onChange={setDraftEndDate}
                          placeholder="Fin"
                        />
                      </div>
                    </>
                  )}

                  <div
                    className="relative w-[150px] min-w-[120px] shrink-0"
                    ref={actionDropdownRef}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setIsActionDropdownOpen(!isActionDropdownOpen)
                      }
                      title="Action Suivi"
                      aria-label="Action Suivi"
                      className="w-full h-8 flex items-center justify-between gap-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg px-2.5 text-xs transition-all shadow-sm"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-slate-900 font-medium truncate flex-1 text-left">
                        {ACTIONS.find((a) => a.id === draftAction)?.label}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                          isActionDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isActionDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden min-w-[180px]"
                        >
                          <div className="p-1">
                            {ACTIONS.map((action) => (
                              <button
                                key={action.id}
                                type="button"
                                onClick={() => {
                                  setDraftAction(action.id);
                                  setApplied((prev) =>
                                    prev
                                      ? { ...prev, action: action.id }
                                      : {
                                          action: action.id,
                                          vehicleIds: new Set(draftVehicles),
                                          departments: new Set(),
                                          startDate: draftStartDate,
                                          endDate: draftEndDate,
                                          alertTypes: new Set(draftAlertTypes),
                                        }
                                  );
                                  setIsActionDropdownOpen(false);
                                  setIsColumnSettingsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                  draftAction === action.id
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {draftAction === 'alertes' && (
                    <div
                      className="relative w-[150px] min-w-[120px] shrink-0"
                      ref={alertDropdownRef}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setIsAlertDropdownOpen(!isAlertDropdownOpen)
                        }
                        title="Types d'alerte"
                        aria-label="Types d'alerte"
                        className="w-full h-8 flex items-center justify-between gap-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg px-2.5 text-xs transition-all shadow-sm"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate text-slate-700 font-medium flex-1 text-left">
                          {draftAlertTypes.size === 0
                            ? 'Tous les types'
                            : `${draftAlertTypes.size} type(s)`}
                        </span>
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
                            className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden w-full min-w-[220px] max-h-[280px] flex flex-col"
                          >
                            <div className="p-1.5 border-b border-slate-100 flex justify-between gap-1.5">
                              <FilterBulkActions
                                onSelectAll={() =>
                                  setDraftAlertTypes(new Set([...ALERT_TYPES]))
                                }
                                onClear={() => setDraftAlertTypes(new Set())}
                              />
                            </div>
                            <div className="overflow-y-auto p-1">
                              {ALERT_TYPES.map((type) => (
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
                </div>

                {/* Ligne 2 — recherche, regroupement, exports */}
                <div className="w-full flex flex-wrap items-center gap-1.5">
                  <div className="relative flex-1 min-w-[140px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder="Rechercher dans le tableau…"
                      className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <GroupByDropZone
                    groupByColumnId={groupByColumnId}
                    groupByLabel={groupByLabel}
                    groupBySortDir={groupBySortDir}
                    onToggleSortDir={toggleGroupBySortDir}
                    onClear={clearGroupBy}
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="relative shrink-0" ref={columnSettingsRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setIsColumnSettingsOpen(!isColumnSettingsOpen)
                        }
                        title="Paramétrer les colonnes"
                        className="flex items-center justify-center w-8 h-8 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all shadow-sm"
                      >
                        <Settings className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {isColumnSettingsOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="absolute top-full mt-2 right-0 w-72 max-h-80 bg-white rounded-xl shadow-xl border border-slate-200 z-[100] flex flex-col overflow-hidden"
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
                            <div className="overflow-y-auto p-1.5 flex-1">
                              {allColumns.map((col) => {
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

                    <button
                      type="button"
                      className="h-8 flex items-center justify-center gap-1.5 px-2.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                    <button
                      type="button"
                      className="h-8 flex items-center justify-center gap-1.5 px-2.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
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
                          {tableSearch.trim()
                            ? 'Aucun résultat pour cette recherche dans le tableau.'
                            : 'Aucun résultat pour ces filtres.'}
                        </td>
                      </tr>
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
                      displayTableRows.map((row) => renderDataRow(row))
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
            </DndContext>

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
                    className="action-menu fixed w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-[9999] overflow-hidden"
                    style={{ left: openMenu.x, top: openMenu.y }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(openMenu
                      ? getVisibleVehicleRowActions(
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
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handleMenuAction(item.id, openMenu!.vehicleId)
                          }
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group"
                        >
                          <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">
                            {item.label}
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
