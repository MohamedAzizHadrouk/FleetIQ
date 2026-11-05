export function formatDT(n: number): string {
  return `${Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g, ' ')} DT`;
}

export function formatPct(n: number, digits = 0): string {
  return `${n.toFixed(digits).replace('.', ',')} %`;
}

export function formatDelta(pct: number): { text: string; up: boolean } {
  const up = pct > 0;
  return {
    up,
    text: `${up ? '▲' : '▼'} ${Math.abs(pct).toFixed(1).replace('.', ',')} %`,
  };
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('fr-FR').replace(/\u202f/g, ' ');
}

export function formatL100(v: number): string {
  return v.toFixed(1).replace('.', ',');
}

export function formatPerKm(v: number): string {
  return `${v.toFixed(2).replace('.', ',')} DT/km`;
}

export function formatUnit(v: number, mode: 'km' | 'h'): string {
  return `${v.toLocaleString('fr-FR').replace(/\u202f/g, ' ')}${mode === 'h' ? ' h' : ' km'}`;
}

export function matrixKey(sub: string, entity: string): string {
  return `${sub}|${entity}`;
}
