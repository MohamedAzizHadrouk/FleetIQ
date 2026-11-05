import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Pause, Play, RotateCcw, Route as RouteIcon, X } from 'lucide-react';
import type { Vehicle } from '@/types';
import { FIQ, fleetiqMarkerHtml, FLEETIQ_MARKER_BOX, toFleetiqType } from '@/features/fleetiq/vehicle-sprite';
import { buildReplayTimeline, replayAt } from '@/features/fleetiq/trip-replay';
import { cardCoveredWidth } from '@/features/fleetiq/map-dock';

export interface TripReplayRequest {
  /** Changes on every "Rejouer" click so the replay restarts */
  key: number;
  vehicle: Vehicle;
  from: string;
  to: string;
  /** "HH:MM" departure time */
  start: string;
  day?: string;
  durationMin: number;
  path: [number, number][];
}

/** Playback: the whole trip lasts this many seconds at ×1. */
const BASE_SECONDS = 30;
const SPEEDS = [1, 2, 5, 10];

function clock(start: string, minutes: number) {
  const [h, m] = start.split(':').map(Number);
  const total = Math.round((h || 0) * 60 + (m || 0) + minutes);
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * Animated replay of a trip on the map: the vehicle drives along the real road,
 * the travelled part is drawn as it goes, with play / pause, scrubbing, speed
 * and follow-camera controls.
 */
export function TripReplayLayer({ replay, onClose }: { replay: TripReplayRequest; onClose: () => void }) {
  const map = useMap();
  const timeline = useMemo(() => buildReplayTimeline(replay.path, replay.durationMin), [replay.path, replay.durationMin]);
  const [minutes, setMinutes] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [follow, setFollow] = useState(true);
  const minutesRef = useRef(0);
  const layers = useRef<{ marker: L.Marker; travelled: L.Polyline; casing: L.Polyline } | null>(null);

  // Static layers: full route, start / end pins, travelled line, vehicle marker.
  useEffect(() => {
    const path = timeline.path;
    const route = L.polyline(path, { color: FIQ.blue, weight: 5, opacity: 0.4, dashArray: '6 9', lineCap: 'round', interactive: false }).addTo(map);
    const casing = L.polyline([path[0]], { color: '#ffffff', weight: 9, opacity: 0.95, interactive: false }).addTo(map);
    const travelled = L.polyline([path[0]], { color: FIQ.blue, weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round', interactive: false }).addTo(map);
    const pin = (label: string, color: string) =>
      L.divIcon({
        className: 'trip-replay-pin',
        html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(15,27,61,.35);color:#fff;font:800 11px/20px 'Plus Jakarta Sans',system-ui;text-align:center">${label}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
    const start = L.marker(path[0], { icon: pin('A', FIQ.moving), interactive: false, zIndexOffset: 900 }).addTo(map);
    const end = L.marker(path[path.length - 1], { icon: pin('B', FIQ.navy), interactive: false, zIndexOffset: 900 }).addTo(map);
    const box = FLEETIQ_MARKER_BOX;
    const marker = L.marker(path[0], {
      icon: L.divIcon({
        className: 'custom-marker trip-replay-vehicle',
        html: fleetiqMarkerHtml({ type: toFleetiqType(replay.vehicle.iconType), status: 'moving', heading: 0, selected: true }),
        iconSize: [box, box],
        iconAnchor: [box / 2, box / 2],
      }),
      interactive: false,
      zIndexOffset: 2000,
    }).addTo(map);
    layers.current = { marker, travelled, casing };

    const inset = cardCoveredWidth(map);
    map.fitBounds(L.latLngBounds(path), {
      paddingTopLeft: [inset + 48, 64],
      paddingBottomRight: [64, 210],
      animate: true,
      duration: 0.8,
    });

    minutesRef.current = 0;
    setMinutes(0);
    setPlaying(true);
    return () => {
      [route, casing, travelled, start, end, marker].forEach((l) => map.removeLayer(l));
      layers.current = null;
    };
  }, [map, timeline, replay.key, replay.vehicle.iconType]);

  // Panning by hand takes over the camera: stop following (the ⊕ button resumes it).
  // The simulation itself keeps running.
  useEffect(() => {
    const stopFollow = () => setFollow(false);
    map.on('dragstart', stopFollow);
    return () => {
      map.off('dragstart', stopFollow);
    };
  }, [map]);

  // Draw the current state.
  const state = replayAt(timeline, minutes);
  useEffect(() => {
    const l = layers.current;
    if (!l) return;
    l.marker.setLatLng(state.point);
    const rot = l.marker.getElement()?.querySelector<HTMLElement>('.fiq-marker > div:nth-child(2)');
    if (rot) rot.style.transform = `rotate(${state.heading}deg)`;
    const pts = [...timeline.path.slice(0, state.segment + 1), state.point];
    l.travelled.setLatLngs(pts);
    l.casing.setLatLngs(pts);
    if (follow && playing) {
      // Visible area = right of the docked card, above the replay panel
      const size = map.getSize();
      const inset = cardCoveredWidth(map);
      const box = { left: inset + 48, right: size.x - 64, top: 64, bottom: size.y - 200 };
      const p = map.latLngToContainerPoint(state.point);
      if (box.right > box.left && box.bottom > box.top &&
          (p.x < box.left || p.x > box.right || p.y < box.top || p.y > box.bottom)) {
        const cx = (box.left + box.right) / 2;
        const cy = (box.top + box.bottom) / 2;
        map.panBy([p.x - cx, p.y - cy], { animate: true, duration: 0.6 });
      }
    }
  }, [state.point, state.heading, state.segment, timeline, follow, playing, map]);

  // Animation loop.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const perSecond = (timeline.totalMin / BASE_SECONDS) * speed;
    const tick = (now: number) => {
      // Real elapsed time (capped so a long background pause does not jump to the end)
      const dt = Math.min(0.5, (now - last) / 1000);
      last = now;
      const next = Math.min(timeline.totalMin, minutesRef.current + dt * perSecond);
      minutesRef.current = next;
      setMinutes(next);
      if (next >= timeline.totalMin) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, timeline]);

  const finished = minutes >= timeline.totalMin;
  const togglePlay = () => {
    if (finished) {
      minutesRef.current = 0;
      setMinutes(0);
    }
    setPlaying((p) => !p || finished);
  };
  const restart = () => {
    minutesRef.current = 0;
    setMinutes(0);
    setPlaying(true);
  };
  const scrub = (v: number) => {
    const m = (v / 1000) * timeline.totalMin;
    minutesRef.current = m;
    setMinutes(m);
  };

  const container = map.getContainer().getBoundingClientRect();
  // Centred at the bottom of the screen
  const width = Math.min(620, window.innerWidth - 32);
  const remaining = Math.max(0, Math.round(timeline.totalMin - minutes));
  const realtimeFactor = Math.round(((timeline.totalMin * 60) / BASE_SECONDS) * speed);

  return createPortal(
    <section
      aria-label="Replay du trajet"
      className="trip-replay-panel fiq-font fixed z-[1090] rounded-[20px] bg-white text-[#0F1B3D] border border-[#E3E9F4] shadow-[0_24px_48px_rgba(15,27,61,0.22)] px-4 pt-3 pb-3.5"
      style={{ left: '50%', transform: 'translateX(-50%)', bottom: window.innerHeight - container.bottom + 16, width }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-[10px] bg-[#EAF1FF] text-[#2F6BFF] flex items-center justify-center shrink-0">
          <RouteIcon className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold truncate">
            {replay.from} → {replay.to}
          </p>
          <p className="text-xs text-[#5B6B8C] truncate">
            {replay.vehicle.matricule || replay.vehicle.name} · {replay.day ? `${replay.day} · ` : ''}départ {replay.start}
          </p>
        </div>
        <button
          type="button"
          aria-label="Fermer le replay"
          onClick={onClose}
          className="w-8 h-8 rounded-[10px] bg-[#F0F3F9] flex items-center justify-center hover:bg-[#E3E9F4]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-3">
        {[
          { label: 'Heure', value: clock(replay.start, minutes) },
          { label: 'Vitesse', value: `${finished ? 0 : Math.min(130, state.speedKmh)} km/h` },
          { label: 'Distance', value: `${state.km.toFixed(1).replace('.', ',')} / ${timeline.totalKm.toFixed(1).replace('.', ',')} km` },
          { label: 'Restant', value: finished ? 'Arrivé' : `${remaining} min` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-[#F7F9FF] border border-[#E3E9F4] px-2.5 py-1.5 min-w-0">
            <p className="text-[11px] text-[#5B6B8C] font-semibold">{s.label}</p>
            <p className="text-[13.5px] font-extrabold tabular-nums truncate">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2.5 mt-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : finished ? 'Rejouer' : 'Lecture'}
          className="w-10 h-10 rounded-full bg-[#2F6BFF] text-white flex items-center justify-center shrink-0 hover:bg-[#2459E0] shadow-[0_6px_14px_rgba(47,107,255,0.35)]"
        >
          {playing ? <Pause className="w-[18px] h-[18px]" /> : finished ? <RotateCcw className="w-[18px] h-[18px]" /> : <Play className="w-[18px] h-[18px] ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={restart}
          aria-label="Recommencer"
          title="Recommencer"
          className="w-8 h-8 rounded-[10px] border border-[#DCE3EF] text-[#0F1B3D] flex items-center justify-center shrink-0 hover:bg-[#F7F9FF]"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round((minutes / timeline.totalMin) * 1000)}
          onChange={(e) => scrub(Number(e.target.value))}
          aria-label="Position dans le trajet"
          className="flex-1 min-w-0 accent-[#2F6BFF] h-1.5 cursor-pointer"
        />
        <div className="flex gap-0.5 p-0.5 rounded-[10px] bg-[#F0F3F9] shrink-0" role="group" aria-label="Vitesse de lecture">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={speed === s}
              onClick={() => setSpeed(s)}
              className={`h-7 px-2 rounded-lg text-xs tabular-nums ${speed === s ? 'bg-white shadow-sm font-extrabold text-[#0F1B3D]' : 'font-semibold text-[#5B6B8C]'}`}
            >
              ×{s}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={follow}
          onClick={() => setFollow((f) => !f)}
          title="Suivre le véhicule"
          aria-label="Suivre le véhicule"
          className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 border ${
            follow ? 'bg-[#EAF1FF] border-[#BFD3FF] text-[#2F6BFF]' : 'border-[#DCE3EF] text-[#5B6B8C]'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-[#8A94A6]">
        Simulation sur la route réelle · ≈ ×{realtimeFactor} temps réel
      </p>
    </section>,
    document.body
  );
}
