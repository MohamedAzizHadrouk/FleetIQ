import type { AlertHistoryRow } from '../api/alert-api';

const CSV_HEADERS = ['Date / Heure', 'Véhicule', 'Chauffeur', 'Lieu ou zone', "Type d'alerte"];

function escapeCsv(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatExportDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR');
  } catch {
    return iso;
  }
}

function rowsToCsv(rows: AlertHistoryRow[]): string {
  const lines = [
    CSV_HEADERS.join(','),
    ...rows.map((row) =>
      [
        escapeCsv(formatExportDate(row.createdAt)),
        escapeCsv(row.vehicleName),
        escapeCsv(row.driverName),
        escapeCsv(row.locationOrZone),
        escapeCsv(row.alertTypeLabel),
      ].join(',')
    ),
  ];
  return `\uFEFF${lines.join('\n')}`;
}

export function exportAlertHistoryCsv(rows: AlertHistoryRow[]): void {
  if (!rows.length) return;
  const blob = new Blob([rowsToCsv(rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historique-alertes-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAlertHistoryPdf(
  rows: AlertHistoryRow[],
  title = "Historique d'alerte"
): void {
  if (!rows.length) return;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const css = [
    'body { font-family: Arial, sans-serif; color: #333; padding: 24px; }',
    'h1 { font-size: 20px; margin-bottom: 8px; }',
    'p.meta { font-size: 12px; color: #666; margin-bottom: 20px; }',
    'table { width: 100%; border-collapse: collapse; font-size: 12px; }',
    'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }',
    'th { background: #f5f5f5; font-weight: 600; }',
    'tr:nth-child(even) { background: #fafafa; }',
    '@media print { body { padding: 0; } }',
  ].join('\n');

  const tableRows = rows
    .map(
      (row) =>
        `<tr>
          <td>${escapeHtml(formatExportDate(row.createdAt))}</td>
          <td>${escapeHtml(row.vehicleName)}</td>
          <td>${escapeHtml(row.driverName)}</td>
          <td>${escapeHtml(row.locationOrZone)}</td>
          <td>${escapeHtml(row.alertTypeLabel)}</td>
        </tr>`
    )
    .join('');

  printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${escapeHtml(title)}</title><style>${css}</style></head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">${rows.length} alerte(s) — exporté le ${new Date().toLocaleString('fr-FR')}</p>
  <table>
    <thead><tr>
      ${CSV_HEADERS.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <script>window.onload = function() { window.print(); };</script>
</body></html>`);
  printWindow.document.close();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
