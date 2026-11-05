import {
  ACTORS,
  BASE_AMOUNTS,
  DEP_CARS,
  DEP_VEH_FIXED,
  FUEL_EST,
  FUEL_PRICES,
  GROUP_META,
  MAINT_EVERY,
  MAINT_EVERY_H,
  MAINT_H_SHARE,
  MAINT_TYPES,
  MONTHS,
  SPE_UNPL,
  SPE_WARR,
  SUB_TYPES,
  SUPPLIERS,
  UNPL_EXTRA,
  VEH_SUBS,
  VEHICLE_META,
} from '../constants';
import { matrixKey } from '../lib/format';
import type {
  ActorType,
  DepSplit,
  DepVehicle,
  FuelDetail,
  MaintDoneItem,
  MaintPlanItem,
  OperationRow,
  SpeStat,
  SubRubriqueKey,
} from '../types';

export function rng(seed: string): () => number {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function fuelDetail(actorType: ActorType, entity: string): FuelDetail {
  if (actorType !== 'dep' && actorType !== 'spe') {
    return {
      rows: [],
      km: 0,
      prev: 0,
      reel: 0,
      trop: 0,
      dt: 0,
      cost: 0,
      est: 0,
      real: 0,
      pct: 1,
    };
  }
  const group = GROUP_META[actorType];
  const r = rng(`fu${entity}`);
  const veh = depVehicles(actorType, entity);
  const w = veh.map(() => 0.4 + r());
  const sw = w.reduce((a, b) => a + b, 0);
  const rows = veh
    .map((v, i) => {
      const km = Math.round((group.km[entity] * w[i]) / sw);
      const est = Math.round(((FUEL_EST[v.icon] || 8) + (r() - 0.5) * 2) * 10) / 10;
      const fuel: 'Diesel' | 'Essence' =
        v.icon === 'Moto' || (v.icon === 'Voiture' && r() < 0.5) ? 'Essence' : 'Diesel';
      const price = FUEL_PRICES[fuel];
      const ratio =
        r() < 0.35 ? -0.05 + r() * 0.07 : group.over[entity] * (0.4 + r() * 1.4);
      const real = Math.round(est * (1 + ratio) * 10) / 10;
      const gap = Math.max(0, Math.round((real - est) * 10) / 10);
      const prev = (km * est) / 100;
      const reel = (km * real) / 100;
      const trop = Math.round((gap * km) / 100);
      return {
        matricule: v.matricule,
        icon: v.icon,
        specialty: v.specialty,
        department: v.department,
        km,
        est,
        real,
        gap,
        fuel,
        price,
        prev,
        reel,
        trop,
        dt: Math.round(trop * price),
      };
    })
    .sort((a, b) => b.dt - a.dt || b.gap - a.gap);

  const sum = (k: keyof (typeof rows)[0]) =>
    rows.reduce((a, x) => a + (typeof x[k] === 'number' ? (x[k] as number) : 0), 0);
  const km = sum('km') || 1;
  return {
    rows,
    km,
    prev: sum('prev'),
    reel: sum('reel'),
    trop: sum('trop'),
    dt: sum('dt'),
    cost: rows.reduce((a, x) => a + x.reel * x.price, 0),
    est: (sum('prev') / km) * 100,
    real: (sum('reel') / km) * 100,
    pct: sum('reel') / (sum('prev') || 1),
  };
}

export function val(actorType: ActorType, sub: SubRubriqueKey, ent: string): number {
  if ((actorType === 'spe' || actorType === 'dep') && sub === 'fuel') {
    return Math.round(fuelDetail(actorType, ent).cost);
  }
  const r = rng(actorType + sub + ent);
  const empty = r() < 0.12;
  if (empty && sub !== 'fuel') return 0;
  const lvl = ACTORS[actorType].subs[sub];
  return Math.round(BASE_AMOUNTS[sub] * (0.35 + r() * 1.3) * (lvl === 'i' ? 0.8 : 1));
}

export function monthly(
  actorType: ActorType,
  sub: SubRubriqueKey,
  ent: string,
  total: number
): number[] {
  const r = rng(`m${actorType}${sub}${ent}`);
  const w = MONTHS.map(() => 0.4 + r());
  const s = w.reduce((a, b) => a + b, 0);
  return w.map((x) => Math.round((total * x) / s));
}

export function splitTypes(
  sub: SubRubriqueKey,
  total: number,
  key: string
): { n: string; v: number }[] {
  const T = SUB_TYPES[sub];
  if (!T) return [];
  const r = rng(`ty${sub}${key}`);
  const w = T.w.map((x) => x * (0.6 + r() * 0.8));
  const s = w.reduce((a, b) => a + b, 0);
  const parts = w.map((x) => Math.round((total * x) / s));
  parts[0] += total - parts.reduce((a, b) => a + b, 0);
  return T.list
    .map((n, i) => ({ n, v: parts[i] }))
    .sort((a, b) => b.v - a.v);
}

export function depVehicles(
  actorType: ActorType,
  d: string
): { matricule: string; icon: string; specialty: string; department: string }[] {
  if (actorType !== 'dep' && actorType !== 'spe') return [];
  const G = GROUP_META[actorType];
  const isSpe = actorType === 'spe';
  const depOf: Record<string, string> = {};
  Object.entries(DEP_VEH_FIXED).forEach(([dd, ms]) =>
    ms.forEach((m) => {
      depOf[m] = dd;
    })
  );
  const r = rng((isSpe ? 'dvs' : 'dv') + d);
  const list = (G.fixed[d] || []).map((m) => ({
    matricule: m,
    icon: VEHICLE_META[m]?.icon ?? 'Voiture',
    specialty: VEHICLE_META[m]?.specialty ?? 'Livraison',
    department: depOf[m] ?? 'Transport',
  }));
  const ics = ['Voiture', 'Fourgon', 'Pick-up', 'Voiture', 'Fourgon', 'Moto'];
  const sps = ['Livraison', 'Transport', 'Frigo', 'Benne'];
  const deps = Object.keys(DEP_CARS);
  const ICS_BY: Record<string, string[]> = {
    Livraison: ['Voiture', 'Fourgon', 'Moto', 'Voiture'],
    Transport: ['Fourgon', 'Pick-up', 'Voiture', 'Fourgon'],
    Frigo: ['Fourgon', 'Fourgon', 'Pick-up', 'Fourgon'],
    Benne: ['Pick-up', 'Fourgon', 'Pick-up', 'Pick-up'],
  };
  while (list.length < (G.cars[d] || 0)) {
    const m = `${1000 + Math.floor(r() * 8999)} TU ${150 + Math.floor(r() * 80)}`;
    const pick = r();
    const ic = isSpe
      ? ICS_BY[d][Math.floor(pick * 4)]
      : ics[Math.floor(pick * ics.length)];
    const x = Math.floor(r() * 4);
    list.push(
      isSpe
        ? { matricule: m, icon: ic, specialty: d, department: deps[x] }
        : { matricule: m, icon: ic, specialty: sps[x], department: d }
    );
  }
  return list;
}

export function depSplit(
  actorType: ActorType,
  d: string,
  selectedSubs: SubRubriqueKey[]
): DepSplit {
  const actor = ACTORS[actorType];
  const subs = selectedSubs.filter((k) => actor.subs[k]);
  const veh: DepVehicle[] = depVehicles(actorType, d).map((v) => ({
    ...v,
    subs: {},
    tot: 0,
  }));
  const other: Partial<Record<SubRubriqueKey, number>> = {};

  subs.forEach((s) => {
    const v = val(actorType, s, d);
    if (!VEH_SUBS.includes(s)) {
      if (v) other[s] = v;
      return;
    }
    if (s === 'fuel' && (actorType === 'dep' || actorType === 'spe')) {
      const byM = Object.fromEntries(
        fuelDetail(actorType, d).rows.map((x) => [x.matricule, Math.round(x.reel * x.price)])
      );
      let rest = v;
      veh.forEach((x, i) => {
        const a = i === veh.length - 1 ? rest : byM[x.matricule] || 0;
        rest -= a;
        if (a > 0) {
          x.subs.fuel = a;
          x.tot += a;
        }
      });
      return;
    }
    const r = rng(`sp${s}${d}`);
    const w = veh.map(() => 0.2 + r() * r() * 3);
    const sw = w.reduce((a, b) => a + b, 0);
    let rest = v;
    veh.forEach((x, i) => {
      const a = i === veh.length - 1 ? rest : Math.round((v * w[i]) / sw);
      rest -= a;
      if (a > 0) {
        x.subs[s] = a;
        x.tot += a;
      }
    });
  });

  veh.sort((a, b) => b.tot - a.tot);
  return {
    veh,
    other,
    vehTot: veh.reduce((a, x) => a + x.tot, 0),
    otherTot: Object.values(other).reduce((a, b) => a + (b || 0), 0),
  };
}

export function speStats(
  actorType: ActorType,
  ents: string[],
  matrix: Record<string, number>,
  byEnt: Record<string, number>
): SpeStat[] {
  if (actorType !== 'dep' && actorType !== 'spe') return [];
  const group = GROUP_META[actorType];
  return ents.map((e) => {
    const g = (s: SubRubriqueKey) => matrix[matrixKey(s, e)] || 0;
    const tot = byEnt[e] || 0;
    const fixed = g('docs') + g('rent');
    const maint = g('maint');
    const unpl = Math.round(maint * (SPE_UNPL[e] || 0.3));
    const warr = Math.round(g('tire') * (SPE_WARR[e] || 0.1));
    const overPct = group.over[e] || 0.1;
    const over = Math.round((g('fuel') * overPct) / (1 + overPct));
    const extra = Math.round(unpl * UNPL_EXTRA);
    return {
      entity: e,
      total: tot,
      fixed,
      variable: tot - fixed,
      km: group.km[e] || 0,
      fuel: g('fuel'),
      perKm: group.km[e] ? g('fuel') / group.km[e] : 0,
      maint,
      unpl,
      warr,
      over,
      overPct,
      extra,
      rec: warr + over + extra,
    };
  });
}

export function buildOperations(
  actorType: ActorType,
  subs: SubRubriqueKey[],
  ents: string[]
): OperationRow[] {
  const rows: OperationRow[] = [];
  subs.forEach((s) =>
    ents.forEach((e) => {
      let v = val(actorType, s, e);
      const r = rng(`op${s}${e}`);
      let n = 1 + Math.floor(r() * 4);
      while (v > 0 && n > 0) {
        const a = n === 1 ? v : Math.round(v * (0.2 + r() * 0.5));
        v -= a;
        n -= 1;
        rows.push({
          date: `${String(1 + Math.floor(r() * 27)).padStart(2, '0')}/${String(1 + Math.floor(r() * 8)).padStart(2, '0')}/2026`,
          sub: s,
          entity: e,
          amount: a,
          supplier: SUPPLIERS[s][Math.floor(r() * SUPPLIERS[s].length)],
          ref: `REF-${Math.floor(1000 + r() * 8999)}`,
        });
      }
    })
  );
  return rows.sort((a, b) => b.amount - a.amount);
}

export function maintPlan(
  entity: string,
  actorType: ActorType = 'spe'
): MaintPlanItem[] {
  if (actorType !== 'dep' && actorType !== 'spe') return [];
  const r = rng(`mp${actorType}${entity}`);
  const out: MaintPlanItem[] = [];
  const vehicles = depVehicles(actorType, entity);
  if (!vehicles.length) return [];

  vehicles.forEach((v) => {
    const n = 1 + Math.floor(r() * 2);
    const curKm = 20000 + Math.floor(r() * 130000);
    const curH = 800 + Math.floor(r() * 5200);
    for (let i = 0; i < n; i++) {
      const t = MAINT_TYPES[Math.floor(r() * MAINT_TYPES.length)];
      const mode: 'km' | 'h' = r() < (MAINT_H_SHARE[entity] || 0.2) ? 'h' : 'km';
      const cur = mode === 'h' ? curH : curKm;
      const every = mode === 'h' ? MAINT_EVERY_H[t] : MAINT_EVERY[t];
      const next = Math.ceil((cur + 1) / every) * every;
      const warn =
        mode === 'h'
          ? [10, 25, 50][Math.floor(r() * 3)]
          : [200, 500, 1000][Math.floor(r() * 3)];
      out.push({
        matricule: v.matricule,
        icon: v.icon,
        type: t,
        mode,
        cur,
        every,
        next,
        left: next - cur,
        warn,
        soon: next - cur <= warn,
      });
    }
  });
  return out.sort((a, b) => a.left / a.every - b.left / b.every);
}

export function maintDone(
  entity: string,
  total: number,
  actorType: ActorType = 'spe'
): MaintDoneItem[] {
  if (actorType !== 'dep' && actorType !== 'spe') return [];
  const r = rng(`md${actorType}${entity}`);
  const veh = depVehicles(actorType, entity);
  if (!veh.length || total <= 0) return [];

  const rows: MaintDoneItem[] = [];
  let rest = total;
  let n = Math.max(1, Math.min(8, Math.round(total / 400)));
  while (rest > 0 && n > 0) {
    const a = n === 1 ? rest : Math.round((total / (n + 1)) * (0.6 + r() * 0.8));
    rest -= a;
    n -= 1;
    const v = veh[Math.floor(r() * veh.length)];
    if (!v) continue;
    rows.push({
      date: `${String(1 + Math.floor(r() * 27)).padStart(2, '0')}/${String(1 + Math.floor(r() * 8)).padStart(2, '0')}/2026`,
      matricule: v.matricule,
      icon: v.icon,
      type: MAINT_TYPES[Math.floor(r() * MAINT_TYPES.length)],
      mode: r() < (MAINT_H_SHARE[entity] || 0.2) ? 'h' : 'km',
      amount: a,
      ref: `REF-${Math.floor(1000 + r() * 8999)}`,
    });
  }
  return rows.sort((a, b) => b.amount - a.amount);
}
