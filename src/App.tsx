import React, { useCallback, useEffect, useMemo, useState, createElement } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { MapControls } from './components/MapControls';
import { GeofenceCreateModal } from './components/GeofenceCreateModal';
import { MapOverlayManagePanel } from './components/MapOverlayManagerDialog';
import { LocationCreateModal } from './components/LocationCreateModal';
import { OverlayAssignModal } from './components/OverlayAssignModal';
import { RouteCreatePanel } from './components/RouteCreatePanel';
import { DataTable } from './components/DataTable';
import { ReportsContent } from './components/ReportsContent';
import { Dashboard } from './components/Dashboard';
import { ParcContent } from './components/ParcContent';
import { Vehicle, VehicleStatus } from './types';
import { VehicleListPanel } from './components/VehicleListPanel';
import { AlertsContent } from './components/AlertsContent';
import { AIFleetDashboard } from './components/AIFleetDashboard';
import { MessageSquare } from 'lucide-react';
import { DashboardAlertsContent } from './components/DashboardAlertsContent';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { AccountsManagement } from './components/AccountsManagement';
import { DepartmentsManagement } from './components/DepartmentsManagement';
import { AlertHistoryPage } from './pages/AlertHistoryPage';
import { AlertConfigurationPage } from './pages/AlertConfigurationPage';
import { GeneralReportDetailsPage } from './pages/GeneralReportDetailsPage';
import { GestionSinistres } from './components/GestionSinistres';
import type { LatLng, ManageOverlayKind } from './types/map-overlays';
import { AlertMailSmsContent } from './components/AlertMailSmsContent';
import { NotFoundPage } from './pages/NotFoundPage';
import { useMapOverlays } from './hooks/useMapOverlays';
import { WelcomeScreen } from './components/onboarding/WelcomeScreen';
import { ModuleSelection } from './components/onboarding/ModuleSelection';
import type { OnboardingModuleId } from './components/onboarding/module-registry';

import { SUIVIE_DEPARTMENTS } from './features/suivie/column-defs';

type AppPhase = 'welcome' | 'module-selection' | 'login' | 'signup' | 'app';

/** Deterministic PRNG for stable demo fleets */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickSeeded<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// Generate mock vehicles around Tunisia (map center = Tunis)
const generateMockVehicles = (): Vehicle[] => {
  const statuses: VehicleStatus[] = ['active', 'idle', 'offline'];
  const drivers = [
    'Mohamed Ben Ali',
    'Fatma Trabelsi',
    'Karim Gharbi',
    'Sonia Mejri',
    'Youssef Hammami',
    'Amira Bouazizi',
    'Hichem Jebali',
    'Nour Chérif',
    'Sami Khelifi',
    'Inès Mansouri',
    'Anis Belhadj',
    'Rania Sassi',
    'Walid Messaoudi',
    'Leila Ben Amor',
    'Tarek Dridi',
    'Salma Ayari',
    'Driver0002 Tunisia0002',
  ];

  const locations: { address: string; coords: [number, number] }[] = [
    { address: 'Avenue Habib Bourguiba, Tunis', coords: [36.7992, 10.1805] },
    { address: 'La Marsa', coords: [36.8781, 10.3247] },
    { address: 'Lac 1, Tunis', coords: [36.835, 10.238] },
    { address: 'Ariana Centre', coords: [36.8601, 10.1934] },
    { address: 'Ben Arous', coords: [36.7531, 10.2189] },
    { address: 'Bizerte Port', coords: [37.2744, 9.8739] },
    { address: 'Sousse Médina', coords: [35.8256, 10.6411] },
    { address: 'Sfax Centre', coords: [34.7406, 10.7603] },
    { address: 'Nabeul', coords: [36.4561, 10.7376] },
    { address: 'Hammamet', coords: [36.4, 10.6167] },
    { address: 'Monastir', coords: [35.777, 10.826] },
    { address: 'Kairouan', coords: [35.6711, 10.1008] },
    { address: 'Ras Jebel', coords: [37.2145, 10.1238] },
    { address: 'BEN HAMED DECO Ras Jebel', coords: [37.2145, 10.1238] },
    { address: 'Aéroport Tunis-Carthage', coords: [36.851, 10.227] },
    { address: 'La Goulette', coords: [36.818, 10.305] },
    { address: 'Le Kram', coords: [36.84, 10.315] },
    { address: 'Carthage', coords: [36.852, 10.323] },
    { address: 'Route GP1, Sousse', coords: [35.84, 10.59] },
    { address: 'Zone industrielle Charguia', coords: [36.84, 10.2] },
  ];

  const iconTypes = [
    'voiture',
    'moto',
    'fourgon',
    'pickup',
    'camion',
    'bus',
    'taxi',
    'tracteur',
    'ambulance',
    'police',
    'camion_pompier',
    'livraison',
  ] as const;

  const RAS_JEBEL: [number, number] = [37.2145, 10.1238];

  const makeImei = (n: number) =>
    `35693803${String(Math.abs(n)).padStart(7, '0').slice(-7)}`;

  const makeMatricule = (rand: () => number, n: number) => {
    const serial = String(1000 + ((n * 17) % 9000)).padStart(4, '0');
    const series = String(100 + Math.floor(rand() * 90)).padStart(3, '0');
    return `${serial} TU ${series}`;
  };

  const statusMetrics = (
    status: VehicleStatus,
    rand: () => number
  ): Pick<Vehicle, 'speed' | 'batteryLevel' | 'lastUpdate'> => {
    if (status === 'active') {
      return {
        speed: 20 + Math.floor(rand() * 90),
        batteryLevel: 35 + Math.floor(rand() * 65),
        lastUpdate:
          rand() > 0.35
            ? "À l'instant"
            : `Il y a ${1 + Math.floor(rand() * 4)} min`,
      };
    }
    if (status === 'idle') {
      return {
        speed: 0,
        batteryLevel: 20 + Math.floor(rand() * 80),
        lastUpdate: `Il y a ${5 + Math.floor(rand() * 45)} min`,
      };
    }
    return {
      speed: 0,
      batteryLevel: 0,
      lastUpdate: `Il y a ${2 + Math.floor(rand() * 10)}h`,
    };
  };

  const showcase: Vehicle[] = [
    {
      id: 'v-1000',
      name: 'Fleet-SEED-1000',
      status: 'active',
      speed: 62,
      batteryLevel: 88,
      lastUpdate: "À l'instant",
      location: 'Avenue Habib Bourguiba, Tunis',
      coordinates: [36.7992, 10.1805],
      driver: 'Driver0002 Tunisia0002',
      departmentId: 'TUNAV',
      matricule: '1000 TU 100',
      imei: makeImei(1000),
      iconType: 'camion',
      heading: 45,
    },
    {
      id: 'v-1001',
      name: 'Fleet-8125',
      status: 'idle',
      speed: 0,
      batteryLevel: 64,
      lastUpdate: 'Il y a 12 min',
      location: 'BEN HAMED DECO Ras Jebel',
      coordinates: [37.2145, 10.1238],
      driver: 'Mohamed Ben Ali',
      departmentId: 'LATRACE',
      matricule: '8125 TU 226',
      imei: makeImei(1001),
      iconType: 'voiture',
      heading: 315,
    },
    {
      id: 'v-1002',
      name: 'Fleet-2148',
      status: 'active',
      speed: 48,
      batteryLevel: 72,
      lastUpdate: "À l'instant",
      location: 'La Marsa',
      coordinates: [36.8781, 10.3247],
      driver: 'Fatma Trabelsi',
      departmentId: 'DEmo2025',
      matricule: '2148 TU 157',
      imei: makeImei(1002),
      iconType: 'fourgon',
      heading: 90,
    },
    {
      id: 'v-1003',
      name: 'Fleet-3091',
      status: 'offline',
      speed: 0,
      batteryLevel: 0,
      lastUpdate: 'Il y a 3h',
      location: 'Sousse Médina',
      coordinates: [35.8256, 10.6411],
      driver: 'Sonia Mejri',
      departmentId: 'test',
      matricule: '3091 TU 042',
      imei: makeImei(1003),
      iconType: 'bus',
      heading: 180,
    },
    {
      id: 'v-1004',
      name: 'Fleet-AMB-01',
      status: 'active',
      speed: 75,
      batteryLevel: 91,
      lastUpdate: "À l'instant",
      location: 'Aéroport Tunis-Carthage',
      coordinates: [36.851, 10.227],
      driver: 'Youssef Hammami',
      departmentId: 'TUNAV',
      matricule: '3341 TU 118',
      imei: makeImei(1004),
      iconType: 'ambulance',
      heading: 120,
    },
    {
      id: 'v-1005',
      name: 'Fleet-TAXI-07',
      status: 'idle',
      speed: 0,
      batteryLevel: 55,
      lastUpdate: 'Il y a 5 min',
      location: 'Lac 1, Tunis',
      coordinates: [36.835, 10.238],
      driver: 'Amira Bouazizi',
      departmentId: 'LATRACE',
      matricule: '5560 TU 204',
      imei: makeImei(1005),
      iconType: 'taxi',
      heading: 270,
    },
    {
      id: 'v-1006',
      name: 'Fleet-POL-02',
      status: 'active',
      speed: 55,
      batteryLevel: 80,
      lastUpdate: "À l'instant",
      location: 'Bizerte Port',
      coordinates: [37.2744, 9.8739],
      driver: 'Hichem Jebali',
      departmentId: 'TUNAV',
      matricule: '2210 TU 155',
      imei: makeImei(1006),
      iconType: 'police',
      heading: 30,
    },
    {
      id: 'v-1007',
      name: 'Fleet-FIRE-01',
      status: 'active',
      speed: 40,
      batteryLevel: 70,
      lastUpdate: "À l'instant",
      location: 'Sfax Centre',
      coordinates: [34.7406, 10.7603],
      driver: 'Nour Chérif',
      departmentId: 'DEmo2025',
      matricule: '9901 TU 088',
      imei: makeImei(1007),
      iconType: 'camion_pompier',
      heading: 200,
    },
    {
      id: 'v-rj-01',
      name: 'Fleet-RJ-01',
      status: 'active',
      speed: 38,
      batteryLevel: 77,
      lastUpdate: "À l'instant",
      location: 'Ras Jebel',
      coordinates: [RAS_JEBEL[0] + 0.0012, RAS_JEBEL[1] - 0.0015],
      driver: 'Sami Khelifi',
      departmentId: 'LATRACE',
      matricule: '4102 TU 301',
      imei: makeImei(2001),
      iconType: 'voiture',
      heading: 300,
    },
    {
      id: 'v-rj-02',
      name: 'Fleet-RJ-02',
      status: 'active',
      speed: 52,
      batteryLevel: 85,
      lastUpdate: "À l'instant",
      location: 'Ras Jebel',
      coordinates: [RAS_JEBEL[0] - 0.0008, RAS_JEBEL[1] + 0.0018],
      driver: 'Inès Mansouri',
      departmentId: 'TUNAV',
      matricule: '4103 TU 302',
      imei: makeImei(2002),
      iconType: 'pickup',
      heading: 45,
    },
    {
      id: 'v-rj-03',
      name: 'Fleet-RJ-03',
      status: 'active',
      speed: 28,
      batteryLevel: 69,
      lastUpdate: "À l'instant",
      location: 'Ras Jebel Centre',
      coordinates: [RAS_JEBEL[0] + 0.002, RAS_JEBEL[1] + 0.0006],
      driver: 'Anis Belhadj',
      departmentId: 'DEmo2025',
      matricule: '4104 TU 303',
      imei: makeImei(2003),
      iconType: 'fourgon',
      heading: 160,
    },
    {
      id: 'v-rj-04',
      name: 'Fleet-RJ-04',
      status: 'idle',
      speed: 0,
      batteryLevel: 42,
      lastUpdate: 'Il y a 8 min',
      location: 'Ras Jebel Port',
      coordinates: [RAS_JEBEL[0] - 0.0015, RAS_JEBEL[1] - 0.0009],
      driver: 'Rania Sassi',
      departmentId: 'LATRACE',
      matricule: '4105 TU 304',
      imei: makeImei(2004),
      iconType: 'taxi',
      heading: 220,
    },
    {
      id: 'v-rj-05',
      name: 'Fleet-RJ-05',
      status: 'active',
      speed: 61,
      batteryLevel: 93,
      lastUpdate: "À l'instant",
      location: 'Route Ras Jebel',
      coordinates: [RAS_JEBEL[0] + 0.0004, RAS_JEBEL[1] + 0.0024],
      driver: 'Walid Messaoudi',
      departmentId: 'TUNAV',
      matricule: '4106 TU 305',
      imei: makeImei(2005),
      iconType: 'moto',
      heading: 10,
    },
  ];

  const vehicles: Vehicle[] = [...showcase];
  for (let i = showcase.length + 1; i <= 55; i++) {
    const rand = seededRandom(`fleetiq-vehicle-${i}`);
    const status = pickSeeded(rand, statuses);
    const metrics = statusMetrics(status, rand);
    const place = pickSeeded(rand, locations);
    const jitterLat = (rand() - 0.5) * 0.04;
    const jitterLng = (rand() - 0.5) * 0.04;
    vehicles.push({
      id: `${i}`,
      name: `Fleet-${String(i).padStart(3, '0')}`,
      status,
      ...metrics,
      location: place.address,
      coordinates: [place.coords[0] + jitterLat, place.coords[1] + jitterLng],
      driver: pickSeeded(rand, drivers),
      departmentId: SUIVIE_DEPARTMENTS[(i - 1) % SUIVIE_DEPARTMENTS.length],
      matricule: makeMatricule(rand, i),
      imei: makeImei(3000 + i),
      iconType: iconTypes[(i - 1) % iconTypes.length],
      heading: Math.floor(rand() * 360),
    });
  }
  return vehicles.map((v) => {
    const rand = seededRandom(`caps-${v.id}`);
    const keepImei = Boolean(v.imei) && rand() >= 0.08;
    const imei = keepImei ? v.imei : undefined;
    return {
      ...v,
      imei,
      supportsCurrentPosition: Boolean(imei) && rand() < 0.7,
      supportsAad: Boolean(imei) && rand() < 0.45,
      supportsAadForced: Boolean(imei) && rand() < 0.28,
    };
  });
};

const MOCK_VEHICLES = generateMockVehicles();
// Mock alerts data (same as in Dashboard)
const recentAlerts = [
{
  id: 1,
  vehicle: 'Fleet-001',
  type: 'Excès de vitesse',
  message: '142 km/h détecté sur A1',
  time: 'Il y a 5 min',
  severity: 'critical',
  isRead: false
},
{
  id: 2,
  vehicle: 'Fleet-003',
  type: 'Niveau carburant bas',
  message: 'Carburant à 12%',
  time: 'Il y a 15 min',
  severity: 'warning',
  isRead: false
},
{
  id: 3,
  vehicle: 'Fleet-007',
  type: 'Maintenance requise',
  message: 'Révision dans 200 km',
  time: 'Il y a 1h',
  severity: 'info',
  isRead: true
},
{
  id: 4,
  vehicle: 'Fleet-002',
  type: 'Sortie de zone',
  message: 'Véhicule hors géofence',
  time: 'Il y a 2h',
  severity: 'warning',
  isRead: false
},
{
  id: 5,
  vehicle: 'Fleet-012',
  type: 'Arrêt prolongé',
  message: 'Arrêt depuis 3h',
  time: 'Il y a 3h',
  severity: 'info',
  isRead: true
}];

// Calculate unread alerts count (fallback for non-alert sections)
const defaultUnreadAlertsCount = recentAlerts.filter((a) => !a.isRead).length;

export function App() {
  return <AppShell />;
}

function AppShell() {
  const [phase, setPhase] = useState<AppPhase>('welcome');
  // Auth States (set on login; reserved for future gated features)
  const [, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('suivie');
  const [alertUnreadCount, setAlertUnreadCount] = useState(defaultUnreadAlertsCount);
  const [historyVehicleIds, setHistoryVehicleIds] = useState<string[]>([]);
  const [reportVehicleId, setReportVehicleId] = useState<string | null>(null);
  const [alertConfigVehicleId, setAlertConfigVehicleId] = useState<
    string | null
  >(null);
  const [mapCenterZoom, setMapCenterZoom] = useState<number | null>(16);
  const [trackingPath, setTrackingPath] = useState<LatLng[] | null>(null);
  const [activeTab, setActiveTab] = useState('suivie');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isVehicleListCollapsed, setIsVehicleListCollapsed] = useState(false);
  const [suivieFilteredVehicleIds, setSuivieFilteredVehicleIds] = useState<
    string[] | null
  >(null);
  const [statusFilter, setStatusFilter] = useState<Set<VehicleStatus>>(
    () => new Set()
  );
  const statusCounts = useMemo(() => {
    const counts: Record<VehicleStatus, number> = {
      active: 0,
      idle: 0,
      offline: 0,
    };
    for (const v of MOCK_VEHICLES) {
      counts[v.status] += 1;
    }
    return counts;
  }, []);
  const toggleStatusFilter = useCallback((status: VehicleStatus) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);
  const mapVehicles = useMemo(() => {
    let list = MOCK_VEHICLES;
    if (suivieFilteredVehicleIds) {
      const idSet = new Set(suivieFilteredVehicleIds);
      list = list.filter((v) => idSet.has(v.id));
    }
    if (statusFilter.size > 0) {
      list = list.filter((v) => statusFilter.has(v.status));
    }
    return list;
  }, [suivieFilteredVehicleIds, statusFilter]);
  const [isMonitoringCollapsed, setIsMonitoringCollapsed] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [hideBadges, setHideBadges] = useState(false);
  const mapOverlays = useMapOverlays();

  const handleModuleSelect = useCallback((_moduleId: OnboardingModuleId) => {
    setPhase('app');
    setActiveSection('suivie');
    setIsVehicleListCollapsed(true);
    setIsMonitoringCollapsed(true);
  }, []);

  const hasOverlayPanel =
    mapOverlays.overlayForm &&
    (mapOverlays.overlayFormKind === 'polygon' ||
      mapOverlays.overlayFormKind === 'route' ||
      mapOverlays.editTarget?.kind === 'defaultZone');

  /** Place-only draw: map free, no vehicle list until creation form opens */
  const placingGeoOnly =
    (mapOverlays.drawMode === 'geofence' ||
      mapOverlays.drawMode === 'location' ||
      mapOverlays.drawMode === 'polygon') &&
    !mapOverlays.geofenceModalOpen &&
    !mapOverlays.locationFormOpen &&
    !hasOverlayPanel;

  const leftPanelOpen =
    mapOverlays.geofenceModalOpen ||
    mapOverlays.locationFormOpen ||
    !!hasOverlayPanel ||
    mapOverlays.routeCreateOpen ||
    !!mapOverlays.manageDialog ||
    (!isVehicleListCollapsed && !placingGeoOnly);

  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();
    if (mq.matches) {
      setIsMonitoringCollapsed(true);
    }
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const handleCloseLeftPanel = useCallback(() => {
    if (mapOverlays.geofenceModalOpen) {
      mapOverlays.closeEditForms();
      mapOverlays.cancelDrawing();
      return;
    }
    if (mapOverlays.locationFormOpen) {
      mapOverlays.closeEditForms();
      return;
    }
    if (hasOverlayPanel) {
      mapOverlays.closeEditForms();
      return;
    }
    if (mapOverlays.routeCreateOpen) {
      mapOverlays.closeRouteCreate();
      return;
    }
    if (mapOverlays.manageDialog) {
      mapOverlays.setManageDialog(null);
      mapOverlays.setHighlightedZoneId(null);
      return;
    }
    setIsVehicleListCollapsed(true);
  }, [hasOverlayPanel, mapOverlays]);

  const openGeoManage = useCallback(
    (kind: ManageOverlayKind) => {
      mapOverlays.closeRouteCreate();
      mapOverlays.closeEditForms();
      mapOverlays.cancelDrawing();
      mapOverlays.setManageDialog(kind);
    },
    [mapOverlays]
  );

  // Inject Leaflet CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
  }, []);

  const handleFocusVehicleOnMap = useCallback(
    (vehicle: Vehicle, zoom = 16) => {
      setActiveSection('suivie');
      setSelectedVehicleId(vehicle.id);
      setMapCenterZoom(zoom);
      setMapCenter(vehicle.coordinates);
    },
    []
  );

  const handleShowTrajectoryTrack = useCallback((path: [number, number][]) => {
    setTrackingPath(path);
    if (path.length >= 2) {
      setMapCenterZoom(14);
      setMapCenter(path[Math.floor(path.length / 2)]);
    }
  }, []);

  const handleClearTrajectoryTrack = useCallback(() => {
    setTrackingPath(null);
  }, []);

  const handleOpenDetailedReport = useCallback((vehicleId: string) => {
    setReportVehicleId(vehicleId);
    setActiveSection('rapport_detail');
  }, []);

  const handleOpenAlertConfiguration = useCallback((vehicleId: string) => {
    setAlertConfigVehicleId(vehicleId);
    setActiveSection('alert_configuration');
  }, []);

  if (phase === 'welcome') {
    return (
      <WelcomeScreen
        onExplore={() => setPhase('app')}
        onStartTutorial={() => setPhase('module-selection')}
        onLogin={() => setPhase('login')}
      />
    );
  }

  if (phase === 'module-selection') {
    return (
      <ModuleSelection
        onBack={() => setPhase('welcome')}
        onSelectModule={handleModuleSelect}
      />
    );
  }

  if (phase === 'login') {
    return (
      <LoginPage
        onLogin={() => {
          setIsAuthenticated(true);
          setPhase('welcome');
        }}
        onNavigateToSignUp={() => setPhase('signup')}
      />
    );
  }

  if (phase === 'signup') {
    return (
      <SignUpPage
        onSignUp={() => {
          setIsAuthenticated(true);
          setPhase('welcome');
        }}
        onNavigateToLogin={() => setPhase('login')}
      />
    );
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (section === 'alert_history') {
      setHistoryVehicleIds([]);
    }
    if (section !== 'alert_configuration') {
      setAlertConfigVehicleId(null);
    }
    // Reset activeTab when switching to rapports section
    if (section === 'rapports') {
      setActiveTab('rapports');
    }
  };
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const handleToggleVehicleList = () => {
    setIsVehicleListCollapsed(!isVehicleListCollapsed);
  };
  const handleToggleMonitoring = () => {
    setIsMonitoringCollapsed(!isMonitoringCollapsed);
  };
  // Handler for navigating from Dashboard to vehicle on map
  const handleNavigateToVehicle = (
  vehicleId: string,
  coordinates: [number, number]) =>
  {
    // Switch to suivie section
    setActiveSection('suivie');
    setActiveTab('suivie');
    // Select the vehicle
    setSelectedVehicleId(vehicleId);
    // Center map on vehicle coordinates
    setMapCenter(coordinates);
  };
  // Determine sidebar mode based on active section
  const sidebarMode = activeSection === 'rapports' ? 'rapports' : 'monitoring';

  // 404 Page - rendered without any navbar or sidebar
  if (activeSection === '404') {
    return (
      <NotFoundPage
        onNavigateToDashboard={() => setActiveSection('dashboard')}
        onNavigateToLogin={() => setIsAuthenticated(false)} />);


  }
  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Top Navigation */}
      <TopBar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        unreadAlertsCount={activeSection === 'alertes' ? alertUnreadCount : defaultUnreadAlertsCount}
        hideBadges={hideBadges}
        onToggleHideBadges={() => setHideBadges(!hideBadges)} />
      

      <div className="flex-1 relative overflow-hidden">
        {activeSection === 'dashboard' ?
        // Dashboard View
        <Dashboard
          vehicles={MOCK_VEHICLES}
          onNavigateToVehicle={handleNavigateToVehicle} /> :

        activeSection === 'parc' ?
        // Parc View
        <ParcContent /> :
        activeSection === 'gestion_sinistres' ?
        // Gestion Sinistres View
        <GestionSinistres vehicles={MOCK_VEHICLES} /> :
        activeSection === 'alertes' ?
        // Alertes View
        <AlertsContent
          vehicles={MOCK_VEHICLES}
          onNavigateToVehicle={handleNavigateToVehicle}
          hideBadges={hideBadges}
          onOpenHistory={(vehicleIds) => {
            setHistoryVehicleIds(vehicleIds ?? []);
            setActiveSection('alert_history');
          }}
          onUnreadCountChange={setAlertUnreadCount} /> :

        activeSection === 'administration' ?
        // Administration View
        <AccountsManagement /> :
        activeSection === 'departments' ?
        // Departments Management View
        <DepartmentsManagement /> :
        activeSection === 'alert_history' ?
        <AlertHistoryPage
          vehicles={MOCK_VEHICLES}
          initialVehicleIds={historyVehicleIds}
          onBack={() => setActiveSection('alertes')}
          onNavigateToVehicle={handleNavigateToVehicle} /> :
        activeSection === 'alert_configuration' ?
        <AlertConfigurationPage
          vehicles={MOCK_VEHICLES}
          initialVehicleId={alertConfigVehicleId}
          onBack={() => setActiveSection('suivie')} /> :
        activeSection === 'rapport_detail' ?
        <GeneralReportDetailsPage
          vehicle={
            MOCK_VEHICLES.find((v) => v.id === reportVehicleId) ?? null
          }
          onBack={() => setActiveSection('suivie')} /> :
        activeSection === 'notifications' ?
        // Alert Mail/SMS Notifications View
        <AlertMailSmsContent /> :
        activeSection === '404' ?
        // 404 Not Found Page Preview
        <NotFoundPage
          onNavigateToDashboard={() => setActiveSection('dashboard')}
          onNavigateToLogin={() => setIsAuthenticated(false)} /> :

        activeSection === 'rapports' ?
        // Reports View - Original Layout
        <div className="flex h-full">
            <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mode={sidebarMode} />
          
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              <ReportsContent activeTab={activeTab} />
            </div>
          </div> :

        // Suivie View - Original Layout WITHOUT Filter Bar at top
        <>
            {/* Full Screen Map Background */}
            <div className="absolute inset-0 z-0">
              <MapView
              vehicles={mapVehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={handleVehicleSelect}
              onDeselectVehicle={() => setSelectedVehicleId(null)}
              mapCenter={mapCenter}
              mapCenterZoom={mapCenterZoom}
              trackingPath={trackingPath}
              onMapCenterChange={() => setMapCenter(null)}
              basemap={mapOverlays.basemap}
              drawMode={mapOverlays.drawMode}
              onMapClick={mapOverlays.handleMapClick}
              mapClickEnabled={
                mapOverlays.locationFormOpen ||
                !!mapOverlays.geometryEditKind ||
                (mapOverlays.routeCreateOpen &&
                  mapOverlays.routeCreateMode === 'locations')
              }
              activeGeometryMode={mapOverlays.activeGeometryMode}
              editingOverlayId={mapOverlays.editingOverlayId}
              draftLocationPosition={mapOverlays.locationForm?.position ?? null}
              geofences={mapOverlays.geofences}
              locations={mapOverlays.locations}
              routes={mapOverlays.routes}
              polygons={mapOverlays.polygons}
              defaultZones={mapOverlays.defaultZones}
              highlightedZoneId={mapOverlays.highlightedZoneId}
              geofenceDraft={mapOverlays.geofenceDraft}
              onGeofenceRadiusChange={(km) => {
                mapOverlays.setGeofenceDraft((prev) =>
                  prev ? { ...prev, radiusKm: km } : prev
                );
              }}
              onGeofenceCenterChange={(center) => {
                mapOverlays.setGeofenceDraft((prev) =>
                  prev ? { ...prev, center } : prev
                );
              }}
              onGeofencePlaceStart={(center, radiusKm) => {
                mapOverlays.recordGeofenceGeometryHistory();
                mapOverlays.beginGeofenceAt(center, radiusKm);
              }}
              onGeofencePlaceProgress={mapOverlays.beginGeofenceAt}
              onGeofencePlaceEnd={mapOverlays.finishGeofencePlace}
              onGeofenceGeometryInteractionStart={
                mapOverlays.recordGeofenceGeometryHistory
              }
              pendingPoints={mapOverlays.pendingPoints}
              onPendingPointsChange={mapOverlays.setPendingPoints}
              onFinishPolygon={() => {
                void mapOverlays.finishMultiPointDraw();
              }}
              routePreview={mapOverlays.routePreview}
              overlayFormDraft={
                mapOverlays.overlayForm &&
                !mapOverlays.drawMode &&
                !mapOverlays.geometryEditKind &&
                (mapOverlays.overlayFormKind === 'polygon' ||
                  mapOverlays.overlayFormKind === 'route')
                  ? {
                      kind: mapOverlays.overlayFormKind,
                      points: mapOverlays.overlayForm.points,
                    }
                  : null
              }
              clusterVehicles={mapOverlays.clusterVehicles}
              clusterLocations={mapOverlays.clusterLocations}
              flyToTarget={mapOverlays.flyToTarget}
              flyToZoom={mapOverlays.flyToZoom}
              onFlyToDone={() => mapOverlays.setFlyToTarget(null)}
              fitBoundsPoints={mapOverlays.fitBoundsPoints}
              onFitBoundsDone={() => mapOverlays.setFitBoundsPoints(null)}
              onOverlaySelect={mapOverlays.openOverlayView}
              selectedOverlayId={mapOverlays.editTarget?.id ?? null}
              geofenceDraftInteractive={
                mapOverlays.overlayPanelMode === 'edit' ||
                mapOverlays.editTarget?.kind !== 'geofence'
              }
              legendHidden={isMobileViewport && leftPanelOpen}
            />
            
            </div>

            <MapControls
              basemap={mapOverlays.basemap}
              onBasemapChange={mapOverlays.setBasemap}
              clusterVehicles={mapOverlays.clusterVehicles}
              onClusterVehiclesChange={mapOverlays.setClusterVehicles}
              clusterLocations={mapOverlays.clusterLocations}
              onClusterLocationsChange={mapOverlays.setClusterLocations}
              drawMode={mapOverlays.drawMode}
              geometryEditKind={mapOverlays.geometryEditKind}
              onOpenManage={openGeoManage}
              overlays={mapOverlays.allOverlays}
              onSetOverlayVisible={mapOverlays.setOverlayVisible}
              pendingPointsCount={mapOverlays.pendingPoints.length}
              onFinishDraw={mapOverlays.finishMultiPointDraw}
              onCancelDraw={mapOverlays.cancelMapDrawing}
              onUndoPoint={mapOverlays.undoMapEdit}
              onRedoPoint={mapOverlays.redoMapEdit}
              routeCreateOpen={mapOverlays.routeCreateOpen}
              routeCreateMode={mapOverlays.routeCreateMode}
              geofenceModalOpen={mapOverlays.geofenceModalOpen}
              geofenceGeometryActive={mapOverlays.geofenceGeometryActive}
              canUndoMapEdit={mapOverlays.canUndoMapEdit}
              canRedoMapEdit={mapOverlays.canRedoMapEdit}
              hasOverlayDraft={
                !!mapOverlays.overlayForm &&
                !mapOverlays.editTarget &&
                (mapOverlays.overlayFormKind === 'polygon' ||
                  mapOverlays.overlayFormKind === 'route')
              }
              polygonDrawError={mapOverlays.polygonDrawError}
            />

            {leftPanelOpen && (
              <button
                type="button"
                aria-label="Fermer le panneau"
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                onClick={handleCloseLeftPanel}
              />
            )}

            {/* Left: Forms | Route via | Gestion | Vehicle List */}
            <div className="fixed inset-y-0 left-0 z-40 w-full lg:absolute lg:z-30 lg:w-auto">
              {mapOverlays.routeCreateOpen ? (
                <RouteCreatePanel
                  open={mapOverlays.routeCreateOpen}
                  mode={mapOverlays.routeCreateMode}
                  locations={mapOverlays.locations}
                  pendingPoints={mapOverlays.pendingPoints}
                  onModeChange={mapOverlays.setRouteCreateMode}
                  onClose={() => {
                    mapOverlays.closeRouteCreate();
                  }}
                  onFinishMapRoute={mapOverlays.finishMultiPointDraw}
                  onUndoPoint={mapOverlays.undoPendingPoint}
                  onPreviewChange={(geometry, metrics, waypoints) => {
                    const stops = waypoints ?? [];
                    mapOverlays.setRoutePreview(
                      geometry.length > 0 || stops.length > 0
                        ? {
                            geometry,
                            waypoints: stops,
                            distanceMeters: metrics?.distanceMeters,
                            durationSeconds: metrics?.durationSeconds,
                          }
                        : null
                    );
                  }}
                  onRequestAddLocation={() => {
                    mapOverlays.closeRouteCreate();
                    mapOverlays.startDraw('location');
                  }}
                  mapPointToAdd={mapOverlays.routeViaMapPoint}
                  onMapPointConsumed={mapOverlays.consumeRouteViaMapPoint}
                  onSave={(draft) => {
                    mapOverlays.addRouteFromDraft(draft);
                    mapOverlays.setManageDialog('route');
                  }}
                />
              ) : mapOverlays.geofenceModalOpen ? (
                <GeofenceCreateModal
                  open={mapOverlays.geofenceModalOpen}
                  draft={mapOverlays.geofenceDraft}
                  readOnly={mapOverlays.overlayPanelMode === 'view'}
                  onStartEdit={mapOverlays.startOverlayEdit}
                  title={
                    mapOverlays.editTarget?.kind === 'geofence'
                      ? 'Modifier le géopérage'
                      : 'Ajouter un géopérage'
                  }
                  onDraftChange={mapOverlays.setGeofenceDraft}
                  onBeforeGeometryChange={
                    mapOverlays.recordGeofenceGeometryHistory
                  }
                  onSave={() => {
                    if (!mapOverlays.geofenceDraft) return;
                    const isEdit =
                      mapOverlays.editTarget?.kind === 'geofence';
                    if (isEdit && mapOverlays.editTarget) {
                      mapOverlays.updateGeofence(
                        mapOverlays.editTarget.id,
                        mapOverlays.geofenceDraft
                      );
                    } else {
                      mapOverlays.addGeofence(mapOverlays.geofenceDraft);
                    }
                  }}
                  onCancel={() => {
                    mapOverlays.closeEditForms();
                    mapOverlays.cancelDrawing();
                  }}
                  onFlyTo={(center, zoom) =>
                    mapOverlays.setFlyToTarget(center, zoom ?? 9)
                  }
                />
              ) : mapOverlays.locationFormOpen ? (
                <LocationCreateModal
                  open={mapOverlays.locationFormOpen}
                  initial={mapOverlays.locationForm}
                  title={
                    mapOverlays.editTarget?.kind === 'location'
                      ? "Modifier l'emplacement"
                      : 'Ajouter un emplacement'
                  }
                  onChange={(next) => mapOverlays.setLocationForm(next)}
                  onSave={() => {
                    if (!mapOverlays.locationForm) return;
                    if (mapOverlays.editTarget?.kind === 'location') {
                      mapOverlays.updateLocation(
                        mapOverlays.editTarget.id,
                        mapOverlays.locationForm
                      );
                    } else {
                      mapOverlays.addLocation(mapOverlays.locationForm);
                    }
                  }}
                  onCancel={() => {
                    mapOverlays.closeEditForms();
                  }}
                />
              ) : mapOverlays.overlayForm &&
                (mapOverlays.overlayFormKind === 'polygon' ||
                  mapOverlays.overlayFormKind === 'route' ||
                  mapOverlays.editTarget?.kind === 'defaultZone') ? (
                <OverlayAssignModal
                  open
                  readOnly={mapOverlays.overlayPanelMode === 'view'}
                  onStartEdit={mapOverlays.startOverlayEdit}
                  kind={
                    mapOverlays.editTarget?.kind === 'defaultZone'
                      ? 'defaultZone'
                      : mapOverlays.overlayFormKind
                  }
                  title={
                    mapOverlays.editTarget?.kind === 'defaultZone'
                      ? 'Modifier la zone province'
                      : mapOverlays.editTarget?.kind === 'polygon'
                        ? 'Modifier le polygone'
                        : mapOverlays.editTarget?.kind === 'route'
                          ? 'Modifier la route'
                          : mapOverlays.overlayFormKind === 'polygon'
                            ? 'Enregistrer le polygone'
                            : 'Enregistrer la route'
                  }
                  draft={mapOverlays.overlayForm}
                  nameEditable={mapOverlays.editTarget?.kind !== 'defaultZone'}
                  geometryEditable={
                    mapOverlays.geometryEditKind === 'polygon' ||
                    mapOverlays.geometryEditKind === 'route'
                  }
                  onChange={(next) => mapOverlays.setOverlayForm(next)}
                  onSave={() => {
                    void (async () => {
                      const draft = mapOverlays.overlayForm;
                      if (!draft) return;

                      if (mapOverlays.editTarget?.kind === 'defaultZone') {
                        mapOverlays.updateDefaultZone(
                          mapOverlays.editTarget.id,
                          {
                            assignment: draft.assignment,
                            alertType: draft.alertType,
                          }
                        );
                        return;
                      }

                      if (
                        mapOverlays.geometryEditKind &&
                        (mapOverlays.editTarget?.kind === 'polygon' ||
                          mapOverlays.editTarget?.kind === 'route')
                      ) {
                        await mapOverlays.saveGeometryEdit();
                        return;
                      }

                      if (mapOverlays.editTarget?.kind === 'polygon') {
                        mapOverlays.updatePolygon(
                          mapOverlays.editTarget.id,
                          draft
                        );
                        return;
                      }
                      if (mapOverlays.editTarget?.kind === 'route') {
                        mapOverlays.updateRoute(
                          mapOverlays.editTarget.id,
                          draft
                        );
                        return;
                      }
                      if (mapOverlays.overlayFormKind === 'polygon') {
                        mapOverlays.addPolygonFromDraft(draft);
                      } else if (mapOverlays.overlayFormKind === 'route') {
                        mapOverlays.addRouteFromDraft(draft);
                      }
                    })();
                  }}
                  onCancel={() => {
                    mapOverlays.closeEditForms();
                  }}
                />
              ) : mapOverlays.manageDialog ? (
                <MapOverlayManagePanel
                  kind={mapOverlays.manageDialog}
                  locations={mapOverlays.locations}
                  routes={mapOverlays.routes}
                  polygons={mapOverlays.polygons}
                  geofences={mapOverlays.geofences}
                  defaultZones={mapOverlays.defaultZones}
                  countryLabel="Tunisie"
                  onBack={() => {
                    mapOverlays.setManageDialog(null);
                    mapOverlays.setHighlightedZoneId(null);
                    mapOverlays.closeRouteCreate();
                  }}
                  onDelete={(id) => mapOverlays.removeOverlays([id])}
                  onFlyTo={(center) => {
                    const zoom =
                      mapOverlays.manageDialog === 'defaultZone' ? 9 : 15;
                    mapOverlays.setFlyToTarget(center, zoom);
                  }}
                  onToggleVisible={mapOverlays.setOverlayVisible}
                  onHighlightZone={mapOverlays.setHighlightedZoneId}
                  onCreate={() => {
                    const kind = mapOverlays.manageDialog;
                    if (kind === 'geofence') {
                      mapOverlays.startDraw('geofence');
                    } else if (kind === 'location') {
                      mapOverlays.startDraw('location');
                    } else if (kind === 'polygon') {
                      mapOverlays.startDraw('polygon');
                    } else if (kind === 'route') {
                      mapOverlays.openRouteCreate();
                    }
                  }}
                  onCreateRoute={() => {
                    mapOverlays.openRouteCreate();
                  }}
                  onEdit={(kind, id) => {
                    if (
                      kind === 'geofence' ||
                      kind === 'location' ||
                      kind === 'route' ||
                      kind === 'polygon' ||
                      kind === 'defaultZone'
                    ) {
                      mapOverlays.openEdit({ kind, id });
                    }
                  }}
                />
              ) : placingGeoOnly ? null : (
                <VehicleListPanel
                  vehicles={MOCK_VEHICLES}
                  selectedVehicleId={selectedVehicleId}
                  onSelectVehicle={handleVehicleSelect}
                  isCollapsed={isVehicleListCollapsed}
                  onToggleCollapse={handleToggleVehicleList}
                  onFilteredVehicleIdsChange={setSuivieFilteredVehicleIds}
                  statusFilter={statusFilter}
                  isAdmin
                  onFocusVehicleOnMap={handleFocusVehicleOnMap}
                  onShowTrajectoryTrack={handleShowTrajectoryTrack}
                  onClearTrajectoryTrack={handleClearTrajectoryTrack}
                  onOpenDetailedReport={handleOpenDetailedReport}
                  onOpenAlertConfiguration={handleOpenAlertConfiguration}
                />
              )}
            </div>

            {/* Right: Monitoring Center Card (Floating Overlay) */}
            <div className="absolute right-2 bottom-2 lg:right-4 lg:bottom-4 z-50">
              <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              mode={sidebarMode}
              isCollapsed={isMonitoringCollapsed}
              onToggleCollapse={handleToggleMonitoring}
              position="floating-right"
              statusFilter={statusFilter}
              statusCounts={statusCounts}
              onToggleStatusFilter={toggleStatusFilter} />
            
            </div>

            {/* AI Chat Button - Positioned above Monitoring Center */}
            {!isAIChatOpen &&
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="absolute right-2 bottom-16 lg:right-4 lg:bottom-[100px] group z-30">
            
                <div className="relative">
                  {/* Main button - no background */}
                  <div className="relative w-14 h-14 lg:w-20 lg:h-20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <img
                  src="/unnamed__8_-removebg-preview.png"
                  alt="Assistant TUNAVI"
                  className="w-full h-full object-contain drop-shadow-lg" />
                
                  </div>

                  {/* Badge indicator */}
                  <div className="absolute top-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                    Assistant TUNAVI
                    <div className="absolute top-full right-4 -mt-1">
                      <div className="border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                </div>
              </button>
          }

            {/* AI Chat Panel */}
            <AIFleetDashboard
              isOpen={isAIChatOpen}
              onClose={() => setIsAIChatOpen(false)}
            />
          
          </>
        }
      </div>
    </div>);
}