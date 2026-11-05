import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Bot,
  Car,
  Fuel,
  MapPin,
  ShieldAlert,
  X,
  MessageSquare,
  Send,
  User,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type AIFleetDashboardProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ChatMsg = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

function glassClass(extra?: string) {
  return ['liquid-glass rounded-3xl', extra ?? ''].filter(Boolean).join(' ');
}

function vehicleLabel(count: number): string {
  return count <= 1 ? 'vehicle' : 'vehicles';
}

function generateReply(text: string): string {
  const input = text.toLowerCase();
  if (input.includes('véhicule') || input.includes('vehicle') || input.includes('fleet')) {
    return 'Je peux vous aider à localiser vos véhicules, consulter leur statut, ou générer des rapports. Que souhaitez-vous savoir ?';
  }
  if (input.includes('alerte') || input.includes('alert')) {
    return 'Vous avez actuellement 3 alertes non lues. Voulez-vous que je vous montre les détails ?';
  }
  if (input.includes('rapport') || input.includes('report')) {
    return 'Je peux générer différents types de rapports : détaillé, statistique, trajets, vitesse et carburant. Quel type de rapport vous intéresse ?';
  }
  if (input.includes('carburant') || input.includes('fuel')) {
    return 'La consommation moyenne de la flotte est stable aujourd’hui. Je peux vous afficher le détail par véhicule si vous voulez.';
  }
  if (input.includes('position') || input.includes('localisation') || input.includes('map')) {
    return 'Je peux vous montrer la position en temps réel de vos véhicules sur la carte. Dites-moi quel véhicule vous intéresse.';
  }
  return 'Je suis là pour vous aider avec la gestion de votre flotte. Posez-moi des questions sur les alertes, la carte, le carburant ou les rapports.';
}

export function AIFleetDashboard({ isOpen, onClose }: AIFleetDashboardProps) {
  const [trafficEnabled, setTrafficEnabled] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConversationVisible, setIsConversationVisible] = useState(true);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatWidth, setChatWidth] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mapCardRef = useRef<HTMLDivElement>(null);
  const chatDockRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Keep the expanded chat dock aligned with the Live Fleet Map card width.
  useEffect(() => {
    if (!isOpen) return;
    const el = mapCardRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      setChatWidth(w > 0 ? w : null);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  // Click outside of the dock -> collapse chat back to compact mode.
  useEffect(() => {
    if (!isChatExpanded) return;

    const onPointerDown = (e: MouseEvent) => {
      const dock = chatDockRef.current;
      if (!dock) return;
      if (!dock.contains(e.target as Node)) {
        setIsChatExpanded(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [isChatExpanded]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const expandChat = () => {
    setIsChatExpanded(true);
    setIsConversationVisible(true);
  };

  const collapseChat = () => {
    setIsChatExpanded(false);
  };

  const showConversation =
    isChatExpanded && isConversationVisible && (messages.length > 0 || isTyping);

  const sendMessage = (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    expandChat();

    const userMessage: ChatMsg = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: clean,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    typingTimeoutRef.current = window.setTimeout(() => {
      const aiMessage: ChatMsg = {
        id: `${Date.now()}-ai`,
        role: 'ai',
        content: generateReply(clean),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      typingTimeoutRef.current = null;
    }, 1200);
  };

  const clearConversation = () => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setMessages([]);
    setIsTyping(false);
    setInputValue('');
    setIsConversationVisible(true);
    setIsChatExpanded(false);
    inputRef.current?.focus();
  };

  const toggleConversationVisibility = () => {
    setIsConversationVisible((prev) => !prev);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const headerStats = useMemo(
    () => ({
      activeVehicles: 1248,
      activeVehiclesTrend: 6.6,
      criticalAlerts: 12,
      criticalAlertsTrend: 32,
      avgFuel: 24.7,
      avgFuelTrend: -6.3,
      riskScore: { value: 72, max: 100, trend: 14 },
    }),
    []
  );

  const donutData = useMemo(
    () => [
      { name: 'On Route', value: 45, color: '#10b981' },
      { name: 'Idle', value: 29, color: '#0ea5e9' },
      { name: 'In Yard', value: 15, color: '#f59e0b' },
      { name: 'Maintenance', value: 10, color: '#6366f1' },
    ],
    []
  );

  const fuelTrend = useMemo(
    () => [
      { day: 'Mon', value: 26.3 },
      { day: 'Tue', value: 25.8 },
      { day: 'Wed', value: 25.4 },
      { day: 'Thu', value: 25.1 },
      { day: 'Fri', value: 24.6 },
      { day: 'Sat', value: 24.9 },
      { day: 'Sun', value: 24.7 },
    ],
    []
  );

  const markers = useMemo(
    () => [
      { id: 'vhc-704', x: 38, y: 38, color: 'bg-emerald-400', label: 'VHC-704' },
      { id: 'vhc-851', x: 58, y: 56, color: 'bg-blue-400', label: 'VHC-871' },
      { id: 'vhc-326', x: 64, y: 40, color: 'bg-rose-400', label: 'VHC-326' },
      { id: 'vhc-112', x: 44, y: 62, color: 'bg-amber-400', label: 'VHC-112' },
      { id: 'vhc-219', x: 30, y: 52, color: 'bg-blue-400', label: 'VHC-219' },
      { id: 'vhc-433', x: 72, y: 58, color: 'bg-indigo-400', label: 'VHC-433' },
    ],
    []
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60] bg-slate-900/18 backdrop-blur-lg backdrop-saturate-140"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ y: 14, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
          className="absolute inset-4 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/74 via-white/62 to-slate-100/74" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,hsla(217,91%,60%,0.10),transparent_52%),radial-gradient(circle_at_82%_82%,hsla(217,91%,60%,0.08),transparent_56%)]" />

          <div
            className={`relative h-full w-full p-4 sm:p-6 flex flex-col ${
              isChatExpanded ? 'pb-28 sm:pb-32' : 'pb-20 sm:pb-24'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl liquid-glass-soft flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-slate-900" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <img
                      src="/unnamed__8_-removebg-preview.png"
                      alt="Assistant TUNAVI"
                      className="w-10 h-10 object-contain drop-shadow"
                    />
                    <h2 className="text-slate-900 text-lg sm:text-xl font-bold truncate">
                      Assistant TUNAVI
                    </h2>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-600">En ligne</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-2xl liquid-glass-soft flex items-center justify-center hover:bg-white/70 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
              <div className={glassClass()} style={{ padding: '14px 16px' }}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl liquid-glass-soft flex items-center justify-center">
                      <Car className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">
                        Active Vehicles
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {headerStats.activeVehicles.toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  {headerStats.activeVehiclesTrend >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {Math.abs(headerStats.activeVehiclesTrend).toFixed(1)}% vs yesterday
                </div>
              </div>

              <div className={glassClass()} style={{ padding: '14px 16px' }}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl liquid-glass-soft flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">
                        Critical Alerts
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {headerStats.criticalAlerts}
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  +{headerStats.criticalAlertsTrend}% vs yesterday
                </div>
              </div>

              <div className={glassClass()} style={{ padding: '14px 16px' }}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl liquid-glass-soft flex items-center justify-center">
                      <Fuel className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">
                        Avg Fuel
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {headerStats.avgFuel.toFixed(1)}
                        <span className="text-sm font-semibold text-slate-600 ml-1">
                          L/100km
                        </span>
                      </div>
                    </div>
                  </div>
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {headerStats.avgFuelTrend}% vs yesterday
                </div>
              </div>

              <div className={glassClass()} style={{ padding: '14px 16px' }}>
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl liquid-glass-soft flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 uppercase tracking-wide">
                        Risk Score
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {headerStats.riskScore.value}
                        <span className="text-sm font-semibold text-slate-600 ml-1">
                          /{headerStats.riskScore.max}
                        </span>
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  +{headerStats.riskScore.trend}% vs yesterday
                </div>
              </div>
            </div>

            {/* Main grid */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left */}
              <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
                <div className={glassClass('p-4')}>
                  <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-slate-900">Fleet Overview</div>
                      <div className="text-xs text-slate-500">Real-time</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32 shrink-0">
                      <PieChart width={128} height={128}>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={44}
                          outerRadius={62}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={3}
                          cornerRadius={5}
                          stroke="none"
                        >
                          {donutData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          position={{ x: 18, y: -36 }}
                          wrapperStyle={{ zIndex: 30, pointerEvents: 'none' }}
                          contentStyle={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 12,
                            color: '#0f172a',
                            fontSize: 12,
                          }}
                          formatter={(value: number, name: string) => [`${value}%`, name]}
                        />
                      </PieChart>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-2xl font-bold text-slate-900 leading-none">78%</div>
                        <div className="text-[11px] text-slate-500 mt-1">Available</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2.5">
                        <LegendLabel color="bg-emerald-500" label="On Route" value="45%" />
                        <LegendLabel color="bg-blue-500" label="Idle" value="29%" />
                        <LegendLabel color="bg-amber-500" label="In Yard" value="15%" />
                        <LegendLabel
                          color="bg-indigo-500"
                          label="Maintenance"
                          value="10%"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">
                      {headerStats.activeVehicles.toLocaleString('fr-FR')} {vehicleLabel(headerStats.activeVehicles)}
                    </span>
                    <span>• Live</span>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      className="w-full rounded-2xl liquid-glass-soft text-slate-700 py-2 text-sm hover:bg-white/70 transition-colors"
                    >
                      View full report
                    </button>
                  </div>
                </div>

                <div className={glassClass('p-4 flex-1 min-h-0')}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Fuel Efficiency</div>
                      <div className="text-xs text-slate-500">Real-time trends</div>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      {headerStats.avgFuelTrend < 0 ? (
                        <TrendingDown className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>{headerStats.avgFuelTrend}%</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <div className="text-3xl font-bold text-slate-900">{headerStats.avgFuel.toFixed(1)}</div>
                    <div className="text-sm text-slate-600">L/100km</div>
                  </div>

                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={fuelTrend}>
                        <defs>
                          <linearGradient id="fuelFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(15,23,42,0.08)" strokeDasharray="3 3" />
                        <Tooltip
                          contentStyle={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            color: '#0f172a',
                          }}
                          labelStyle={{ color: '#0f172a' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#2563eb"
                          strokeWidth={2}
                          fill="url(#fuelFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Center */}
              <div className="lg:col-span-6 flex flex-col gap-4 min-h-0">
                <div ref={mapCardRef} className={glassClass('p-4 flex-1 min-h-0')}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Live Fleet Map</div>
                      <div className="text-xs text-slate-500">Real-time vehicle locations and status</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTrafficEnabled((v) => !v)}
                      className="h-9 px-3 rounded-full liquid-glass-soft text-slate-700 text-xs transition-colors flex items-center gap-2 hover:bg-white/70"
                      aria-label="Toggle Traffic"
                      aria-pressed={trafficEnabled}
                    >
                      <span className="font-medium">Traffic</span>
                      <span
                        className={`relative h-5 w-10 rounded-full border transition-all ${
                          trafficEnabled
                            ? 'bg-blue-500/25 border-blue-300/70'
                            : 'bg-slate-300/45 border-slate-300/70'
                        }`}
                      >
                        <span
                          className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full shadow-sm transition-all ${
                            trafficEnabled ? 'left-[22px] bg-blue-600' : 'left-[2px] bg-slate-500'
                          }`}
                        />
                      </span>
                    </button>
                  </div>

                  <div className="relative h-[420px] sm:h-[460px] md:h-[520px] rounded-2xl overflow-hidden border border-white/60 bg-gradient-to-br from-white/25 to-blue-100/20">
                    {/* Grid/terrain */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-70" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.22),transparent_58%),radial-gradient(circle_at_80%_50%,rgba(37,99,235,0.16),transparent_56%)]" />

                    {/* Decorative routes */}
                    <div className="absolute left-10 top-10 w-40 h-40 rounded-full bg-blue-400/10 blur-2xl" />
                    <div className="absolute right-10 bottom-10 w-44 h-44 rounded-full bg-blue-500/10 blur-2xl" />

                    {/* Markers */}
                    {markers.map((m) => (
                      <div
                        key={m.id}
                        className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 ${m.color} w-3 h-3 rounded-full shadow-[0_0_0_6px_rgba(15,23,42,0.08)]`}
                        style={{ left: `${m.x}%`, top: `${m.y}%` }}
                        title={m.label}
                      />
                    ))}

                    {/* Vehicle popup (static) */}
                    <div className={glassClass('absolute left-6 top-6 p-3 w-[220px]')}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-slate-900">VHC-704</div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <InfoCell label="Speed" value="0 km/h" />
                        <InfoCell label="Fuel" value="84%" />
                        <InfoCell label="Driver" value="Youssef Ali" />
                        <InfoCell label="Status" value="Idle" />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                        <span>South Service Area</span>
                        <MapPin className="w-4 h-4 text-slate-700" />
                      </div>
                    </div>

                    {/* Faux "map" caption */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-white/70" />
                      <span>{trafficEnabled ? 'Traffic enabled' : 'Traffic hidden'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
                <div className={glassClass('p-4')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-slate-900">Vehicle Status</div>
                    <div className="text-xs text-slate-600">Live</div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 mb-2">VHC-704</div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <Row label="State" value="Idle" />
                    <Row label="Location" value="South Service Area" />
                    <Row label="Speed" value="0 km/h" />
                    <Row label="Fuel Level" value="84%" />
                    <Row label="Odometer" value="126,540 km" />
                    <Row label="Last Update" value="1 min ago" />
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="w-full rounded-2xl liquid-glass-soft text-slate-800 py-2 text-sm hover:bg-white/70 transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>

                <div className={glassClass('p-4')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-slate-900">Driver Activity</div>
                    <button
                      type="button"
                      className="text-xs text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      View all drivers
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 mb-3">
                    Risk and safety ranking
                  </div>

                  <div className="space-y-3">
                    <DriverRow
                      name="Youssef Ali"
                      vehicle="VHC-704"
                      subtitle="idle stable"
                      score={94}
                      variant="good"
                    />
                    <DriverRow
                      name="Michael Brown"
                      vehicle="VHC-871"
                      subtitle="engine fault alert"
                      score={58}
                      variant="warn"
                    />
                    <DriverRow
                      name="Karim Mansour"
                      vehicle="VHC-326"
                      subtitle="high risk driving"
                      score={72}
                      variant="danger"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom AI chat dock */}
            <div
              ref={chatDockRef}
              className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 ${
                chatWidth
                  ? 'max-w-[92vw]'
                  : isChatExpanded
                    ? 'w-[min(860px,92vw)]'
                    : 'w-[min(640px,88vw)]'
              }`}
              style={chatWidth ? { width: chatWidth } : undefined}
            >
              {!isChatExpanded ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={expandChat}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') expandChat();
                  }}
                  className="flex items-center gap-3 rounded-full bg-white/85 backdrop-blur-xl border border-white/70 shadow-elevated px-3 py-2"
                >
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    T
                  </span>
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={expandChat}
                    onKeyDown={handleInputKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Posez une question sur votre flotte..."
                    className="flex-1 bg-transparent text-slate-800 text-sm outline-none placeholder:text-slate-400 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (inputValue.trim()) {
                        sendMessage(inputValue);
                      } else {
                        expandChat();
                      }
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      inputValue.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'liquid-glass-soft text-slate-600'
                    }`}
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {showConversation && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className={glassClass('p-3 sm:p-4 mb-3 max-h-[42vh] overflow-y-auto scrollbar-hide')}
                      >
                        <div className="space-y-3">
                          {messages.map((message) => {
                            const isUser = message.role === 'user';
                            return (
                              <div
                                key={message.id}
                                className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                              >
                                {!isUser && (
                                  <span className="w-7 h-7 rounded-full bg-white/80 border border-slate-200/70 flex items-center justify-center text-slate-700 shrink-0">
                                    <Bot className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                <div
                                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                                    isUser
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-white/90 text-slate-800 border border-slate-200/70'
                                  }`}
                                >
                                  {message.content}
                                </div>
                                {isUser && (
                                  <span className="w-7 h-7 rounded-full bg-blue-600/90 border border-blue-400/60 flex items-center justify-center text-white shrink-0">
                                    <User className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {isTyping && (
                            <div className="flex items-end gap-2 justify-start">
                              <span className="w-7 h-7 rounded-full bg-white/80 border border-slate-200/70 flex items-center justify-center text-slate-700 shrink-0">
                                <Bot className="w-3.5 h-3.5" />
                              </span>
                              <div className="rounded-2xl px-3 py-2 bg-white/90 border border-slate-200/70">
                                <div className="flex gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                                  <span
                                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                                    style={{ animationDelay: '0.1s' }}
                                  />
                                  <span
                                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                                    style={{ animationDelay: '0.2s' }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-elevated p-3 sm:p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      {(messages.length > 0 || isTyping) && (
                        <button
                          type="button"
                          onClick={toggleConversationVisibility}
                          aria-expanded={isConversationVisible}
                          className="text-xs px-3 py-1.5 rounded-2xl bg-slate-100/90 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors inline-flex items-center gap-1.5"
                        >
                          {isConversationVisible ? (
                            <>
                              Masquer
                              <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              Afficher la conversation
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span className="ml-0.5 inline-flex items-center gap-1 rounded-full bg-blue-600/15 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 tabular-nums">
                                {messages.length}
                                {isTyping && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                )}
                              </span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={collapseChat}
                        className="ml-auto text-xs px-3 py-1.5 rounded-2xl bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 transition-colors inline-flex items-center gap-1.5"
                      >
                        Reduire
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleInputKeyDown}
                          placeholder="Posez une question sur votre flotte..."
                          className="w-full bg-white border border-slate-200/80 text-slate-800 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Chip label="Alertes critiques" onClick={sendMessage} expanded />
                          <Chip label="Tendances carburant" onClick={sendMessage} expanded />
                          <Chip label="Conducteurs a risque" onClick={sendMessage} expanded />
                          {messages.length > 0 && (
                            <button
                              type="button"
                              onClick={clearConversation}
                              className="text-xs px-3 py-1.5 rounded-2xl bg-slate-100/90 text-slate-700 hover:bg-slate-200/90 transition-colors"
                            >
                              Effacer
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => sendMessage(inputValue)}
                        disabled={!inputValue.trim()}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${
                          inputValue.trim()
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-100/90 text-slate-500'
                        }`}
                        aria-label="Send"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LegendLabel({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-slate-700">
        <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span>{label}</span>
      </div>
      <span className="text-slate-900 font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-slate-500 text-xs uppercase tracking-wide">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-800 font-medium text-right">{value}</span>
    </div>
  );
}

function DriverRow({
  name,
  vehicle,
  subtitle,
  score,
  variant,
}: {
  name: string;
  vehicle: string;
  subtitle: string;
  score: number;
  variant: 'good' | 'warn' | 'danger';
}) {
  const barClass =
    variant === 'good'
      ? 'bg-emerald-400'
      : variant === 'warn'
        ? 'bg-amber-400'
        : 'bg-rose-400';
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          <div className="text-xs text-slate-600">
            {vehicle} • {subtitle}
          </div>
        </div>
        <div className="text-sm font-bold text-slate-900">{score}</div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-200/70 border border-slate-200/70 overflow-hidden">
        <div className={`h-full ${barClass}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function Chip({
  label,
  onClick,
  expanded,
}: {
  label: string;
  onClick?: (text: string) => void;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(label)}
      className={
        expanded
          ? 'text-xs px-3 py-1.5 rounded-2xl bg-slate-100/90 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
          : 'text-xs px-3 py-1.5 rounded-2xl liquid-glass-soft text-slate-700 hover:bg-white/70 transition-colors'
      }
    >
      {label}
    </button>
  );
}

