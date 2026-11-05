import type { AlertField } from './types';

interface AlertSectionProps {
  title: string;
  fields: AlertField[];
  values: Record<string, boolean | number>;
  saving?: boolean;
  onChange: (values: Record<string, boolean | number>) => void;
  onSave: () => void;
  onResetDefaults: () => void;
}

export function AlertSectionCard({
  title,
  fields,
  values,
  saving,
  onChange,
  onSave,
  onResetDefaults,
}: AlertSectionProps) {
  const setValue = (key: string, value: boolean | number) => {
    onChange({ ...values, [key]: value });
  };

  const isVisible = (field: AlertField) =>
    !field.showWhen || Boolean(values[field.showWhen]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          {title}
        </h3>
      </div>

      <div className="space-y-3 p-4">
        {fields.filter(isVisible).map((field) => (
          <div
            key={field.key}
            className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
          >
            {field.type === 'toggle' ? (
              <label className="flex flex-1 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.key])}
                  onChange={(e) => setValue(field.key, e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">{field.label}</span>
              </label>
            ) : null}

            {field.type === 'number' ? (
              <>
                <label className="flex-1 text-sm text-slate-700">{field.label}</label>
                <div className="ml-4 flex items-center gap-2">
                  <input
                    type="number"
                    value={Number(values[field.key] ?? 0)}
                    min={field.min ?? 0}
                    max={field.max}
                    step={field.step ?? 1}
                    onChange={(e) => setValue(field.key, Number(e.target.value))}
                    className="w-24 rounded border border-slate-300 px-3 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {field.suffix ? (
                    <span className="text-sm text-slate-500">{field.suffix}</span>
                  ) : null}
                </div>
              </>
            ) : null}

            {field.type === 'select' ? (
              <>
                <label className="flex-1 text-sm text-slate-700">{field.label}</label>
                <select
                  value={String(values[field.key] ?? '')}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setValue(field.key, Number.isNaN(num) ? (e.target.value as unknown as number) : num);
                  }}
                  className="ml-4 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(field.options ?? []).map((opt) => (
                    <option key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3">
        <button
          type="button"
          onClick={onResetDefaults}
          className="text-sm font-medium text-rose-600 hover:text-rose-700"
        >
          Paramètres par défaut
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
        >
          {saving ? 'Enregistrement...' : 'Envoyer les paramètres'}
        </button>
      </div>
    </div>
  );
}
