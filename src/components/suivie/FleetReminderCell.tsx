import { useState } from 'react';
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
  EMPTY_FLEET_REMINDERS,
  FLEET_REMINDER_CONFIGS,
  type FleetReminderFlags,
  type FleetReminderKind,
} from '@/features/suivie/fleet-reminders';
import type { SuivieRow } from '@/features/suivie/mock-data';

function getFleetReminders(row: SuivieRow): FleetReminderFlags {
  const flags = row.fleetReminders;
  if (flags && typeof flags === 'object' && !Array.isArray(flags)) {
    return flags as FleetReminderFlags;
  }
  return EMPTY_FLEET_REMINDERS;
}

export function FleetReminderCell({ row }: { row: SuivieRow }) {
  const flags = getFleetReminders(row);
  const vehicleName = row.vehicleName || String(row.name ?? row.Vehicle ?? 'Véhicule');
  const [openKind, setOpenKind] = useState<FleetReminderKind | null>(null);

  const openConfig =
    openKind != null
      ? FLEET_REMINDER_CONFIGS.find((c) => c.id === openKind) ?? null
      : null;

  return (
    <>
      <div
        className="flex items-center gap-1 whitespace-nowrap"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
      >
        {FLEET_REMINDER_CONFIGS.map((cfg) => {
          const active = flags[cfg.id];
          const Icon = cfg.icon;
          return (
            <button
              key={cfg.id}
              type="button"
              title={cfg.label}
              aria-label={cfg.label}
              disabled={!active}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (active) setOpenKind(cfg.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`inline-flex items-center justify-center rounded p-0.5 transition-colors ${
                active
                  ? `${cfg.activeClassName} cursor-pointer`
                  : 'text-slate-300 cursor-default'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
            </button>
          );
        })}
      </div>

      <Dialog
        open={openKind != null}
        onOpenChange={(open) => {
          if (!open) setOpenKind(null);
        }}
      >
        <DialogContent className="max-w-md">
          {openConfig && (
            <>
              <DialogHeader>
                <DialogTitle>{openConfig.dialogTitle}</DialogTitle>
                <DialogDescription>{vehicleName}</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <ul className="space-y-2 text-sm text-slate-700">
                  {openConfig.mockLines(vehicleName).map((line) => (
                    <li
                      key={line}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </DialogBody>
              <DialogFooter className="gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpenKind(null)}
                >
                  Fermer
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={() => setOpenKind(null)}
                >
                  {openConfig.dialogAction}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
