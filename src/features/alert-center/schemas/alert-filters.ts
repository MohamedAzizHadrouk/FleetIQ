import { z } from 'zod';

export const alertFiltersSchema = z.object({
  vehicleIds: z.array(z.string()),
  categories: z.array(z.string()),
  severities: z.array(z.string()),
  vehicleStates: z.array(z.string()),
  dashboardIndicatorIds: z.array(z.string()),
  departmentIds: z.array(z.string()),
  gpsStatuses: z.array(z.enum(['online', 'offline'])),
  movementStates: z.array(z.enum(['moving', 'stopped'])),
  datePreset: z.enum(['today', '24h', '7d']).optional(),
  selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const createAlertRuleSchema = z.object({
  name: z.string().min(3, 'Nom requis (min. 3 caractères)'),
  description: z.string().optional(),
  active: z.boolean(),
  vehicleScope: z.enum(['all', 'group', 'vehicle']),
  vehicleGroupId: z.string().optional(),
  vehicleId: z.string().optional(),
  category: z.string().min(1, 'Catégorie requise'),
  alertType: z.string().min(1, 'Type requis'),
  severity: z.enum(['critical', 'warning', 'info']),
  conditionValue: z.coerce.number().optional(),
  conditionThreshold: z.coerce.number().optional(),
  conditionDuration: z.coerce.number().optional(),
  activationType: z.enum(['permanent', 'temporary']),
  activationStart: z.string().optional(),
  activationEnd: z.string().optional(),
  notifyRoles: z.array(z.string()),
  notifyChannels: z.array(z.string()),
});

export type CreateAlertRuleForm = z.infer<typeof createAlertRuleSchema>;
